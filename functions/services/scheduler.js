const logger = require("../lib/logger");
const { db } = require("../lib/firestore");
const { enviarCorreo, plantillaCorreo, DIR_ARATECH } = require("./mail");
// [FASE 2] Escapar datos insertados en el HTML de los correos
const { esc } = require("../lib/html");

// ============================================================
// [FASE 2] Fechas en hora de México
// ============================================================
// Antes: new Date("2026-10-06") se interpreta como medianoche UTC
// (= 18:00 del día anterior en México). A las 9:00 esto hacía que el aviso
// de "vence en 7 días" saliera con 8 días, y que la garantía se marcara
// como Vencida un día antes. Ahora se cuentan días de calendario en México.

const ZONA_MX = "America/Mexico_City";

function fechaMX(d = new Date()) {
  // Formato YYYY-MM-DD en hora de México
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_MX,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

// Días de calendario desde hoy (México) hasta la fecha indicada.
// 0 = hoy, 7 = dentro de 7 días, negativo = ya pasó. NaN si es inválida.
function diasHasta(fecha) {
  const texto = String(fecha || "").trim();

  let ymd;

  if (/^\d{4}-\d{2}-\d{2}/.test(texto)) {
    ymd = texto.slice(0, 10);
  } else {
    const d = new Date(texto);

    if (isNaN(d)) return NaN;

    ymd = fechaMX(d);
  }

  const [y, m, dd] = ymd.split("-").map(Number);
  const [hy, hm, hd] = fechaMX().split("-").map(Number);

  return Math.round(
    (Date.UTC(y, m - 1, dd) - Date.UTC(hy, hm - 1, hd)) / 86400000,
  );
}

/**
 * Motor principal de automatizaciones.
 * Esta función será ejecutada por Cloud Scheduler.
 */
async function ejecutarAutomatizaciones() {
  logger.info("========================================");
  logger.info("INICIANDO AUTOMATIZACIONES ARATECH");
  logger.info("========================================");

  // [FASE 2] Cada revisión se ejecuta aunque otra falle
  const revisiones = [
    ["Equipos sin recoger", revisarEquiposSinRecoger],
    ["Garantías", revisarGarantias],
    ["Órdenes sin movimiento", revisarOrdenesSinMovimiento],
    ["Cotizaciones vencidas", revisarCotizacionesVencidas],
  ];

  const fallidas = [];

  for (const [nombre, revisar] of revisiones) {
    try {
      await revisar();
    } catch (error) {
      fallidas.push(nombre);

      logger.error(`Error en revisión "${nombre}":`, {
        error: error.message,
      });
    }
  }

  if (fallidas.length) {
    throw new Error("Revisiones con error: " + fallidas.join(", "));
  }

  logger.info("Automatizaciones completadas correctamente.");
}

/**
 * Equipos listos sin recoger.
 */
async function revisarEquiposSinRecoger() {
  logger.info("Revisando equipos listos sin recoger...");

  const hoy = new Date();

  const snapshot = await db
    .collection("ordenes")
    .where("estado", "in", ["Listo", "Listo para entrega"])
    .get();

  logger.info(`Órdenes encontradas: ${snapshot.size}`);

  for (const doc of snapshot.docs) {
    const orden = doc.data();

    // [FASE 2] Un error con una orden no detiene las demás
    try {
    logger.info(`--------------------------------`);
    logger.info(`Procesando: ${orden.folio}`);

    if (!orden.fecha_prom) {
      logger.warn(`${orden.folio}: fecha_prom vacía`);
      continue;
    }

    const fechaEntrega = new Date(`${orden.fecha_prom}T12:00:00`);

    if (isNaN(fechaEntrega)) {
      logger.warn(
        `${orden.folio}: fecha_entrega inválida (${orden.fecha_entrega})`,
      );
      continue;
    }

    const dias = Math.floor((hoy - fechaEntrega) / 86400000);

    logger.info(`${orden.folio}: ${dias} días desde entrega`);

    if (dias < 7) {
      logger.info(`${orden.folio}: aún no cumple 7 días`);
      continue;
    }

    logger.info(`${orden.folio}: buscando cliente ${orden.cliente_id}`);

    const clienteSnap = await db
      .collection("clientes")
      .doc(orden.cliente_id)
      .get();

    if (!clienteSnap.exists) {
      logger.warn(`${orden.folio}: cliente no encontrado`);
      continue;
    }

    const cliente = clienteSnap.data();

    logger.info(`${orden.folio}: cliente localizado`);

    if (!cliente.email) {
      logger.warn(`${orden.folio}: cliente sin correo`);
      continue;
    }

    logger.info(`${orden.folio}: correo ${cliente.email}`);

    const asunto = "Tu equipo te está esperando — ARATECH";

    const cuerpo = `
      <p>Hola <b>${esc(orden.cliente_nombre)}</b>,</p>

      <p>
        Tu <b>${esc(orden.tipo_equipo)} ${esc(orden.modelo)}</b>
        lleva <b>${esc(dias)} días</b> listo para entrega.
      </p>

      <p>
        Te esperamos en <b>ARATECH</b>.
      </p>

      <p>
        ${esc(DIR_ARATECH)}
      </p>
    `;

    logger.info(`${orden.folio}: enviando correo...`);

    await enviarCorreo({
      para: cliente.email,
      asunto,
      html: plantillaCorreo(asunto, cuerpo),
    });

    logger.info(`${orden.folio}: correo enviado correctamente`);
    } catch (error) {
      logger.error(`${orden.folio}: error en recordatorio`, {
        error: error.message,
      });
    }
  }
}

async function revisarGarantias() {
  logger.info("Revisando garantías...");

  const hoy = new Date();

  const snapshot = await db
    .collection("garantias")
    .where("estado", "==", "Activa")
    .get();

  logger.info(`Garantías activas encontradas: ${snapshot.size}`);

  for (const doc of snapshot.docs) {
    const garantia = doc.data();

    // [FASE 2] Un error con una garantía no detiene las demás
    try {

    logger.info("--------------------------------");
    logger.info(`Procesando garantía: ${garantia.folio}`);

    if (!garantia.fecha_gar) {
      logger.warn(`${garantia.folio}: fecha_gar vacía`);
      continue;
    }

    const fechaGarantia = new Date(garantia.fecha_gar);

    // [FASE 2] Días de calendario en hora de México
    const diasRestantes = diasHasta(garantia.fecha_gar);

    if (isNaN(fechaGarantia) || isNaN(diasRestantes)) {
      logger.warn(`${garantia.folio}: fecha_gar inválida`);
      continue;
    }

    logger.info(`${garantia.folio}: ${diasRestantes} días restantes`);

    // ============================================================
    // GARANTÍA PRÓXIMA A VENCER (7 DÍAS)
    // ============================================================

    if (diasRestantes === 7) {
      logger.info(`${garantia.folio}: garantía próxima a vencer`);

      const clienteSnap = await db
        .collection("clientes")
        .doc(garantia.cliente_id)
        .get();

      if (!clienteSnap.exists) {
        logger.warn(`${garantia.folio}: cliente no encontrado`);
        continue;
      }

      const cliente = clienteSnap.data();

      if (!cliente.email) {
        logger.warn(`${garantia.folio}: cliente sin correo`);
        continue;
      }

      const fechaStr = fechaGarantia.toLocaleDateString("es-MX", {
        timeZone: "UTC", // [FASE 2] la fecha guardada es de calendario (sin hora)
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      // Correo interno

      await enviarCorreo({
        para: "soporte@aratech.com.mx",
        asunto: "⚠️ ARATECH — Garantía próxima a vencer",
        html: plantillaCorreo(
          "Garantía próxima a vencer",
          `
          <p>
            La garantía de
            <b>${esc(garantia.cliente_nombre)}</b>
            vence el
            <b>${esc(fechaStr)}</b>.
          </p>

          <p>
            Equipo:
            <b>${esc(garantia.tipo_equipo)}</b>
          </p>

          <p>
            Servicio:
            <b>${esc(garantia.servicio)}</b>
          </p>
        `,
        ),
      });

      logger.info(`${garantia.folio}: correo interno enviado`);

      // Correo cliente

      await enviarCorreo({
        para: cliente.email,
        asunto: "Tu garantía ARATECH está por vencer",
        html: plantillaCorreo(
          "Tu garantía está por vencer",
          `
          <p>
            Hola <b>${esc(garantia.cliente_nombre)}</b>.
          </p>

          <p>
            Te recordamos que la garantía de tu
            <b>${esc(garantia.tipo_equipo)}</b>
            vencerá el
            <b>${esc(fechaStr)}</b>.
          </p>

          <p>
            Si presentas algún inconveniente antes
            de esa fecha, comunícate con nosotros.
          </p>
        `,
        ),
      });

      logger.info(`${garantia.folio}: correo cliente enviado`);
    }

    // ============================================================
    // GARANTÍA VENCIDA (HOY)
    // ============================================================

    if (diasRestantes === 0) {
      logger.info(`${garantia.folio}: garantía vencida`);

      // Si no hay cliente (Público en general), solo vencemos la garantía.
      if (!garantia.cliente_id) {
        logger.warn(
          `${garantia.folio}: Público en general. Se omiten correos.`,
        );

        await db.collection("garantias").doc(doc.id).update({
          estado: "Vencida",
        });

        logger.info(`${garantia.folio}: estado actualizado a Vencida`);

        continue;
      }

      const clienteSnap = await db
        .collection("clientes")
        .doc(garantia.cliente_id)
        .get();

      if (!clienteSnap.exists) {
        logger.warn(`${garantia.folio}: cliente no encontrado`);

        await db.collection("garantias").doc(doc.id).update({
          estado: "Vencida",
        });

        logger.info(`${garantia.folio}: estado actualizado a Vencida`);

        continue;
      }

      const cliente = clienteSnap.data();

      if (!cliente.email) {
        logger.warn(`${garantia.folio}: cliente sin correo`);

        await db.collection("garantias").doc(doc.id).update({
          estado: "Vencida",
        });

        logger.info(`${garantia.folio}: estado actualizado a Vencida`);

        continue;
      }
      await enviarCorreo({
        para: cliente.email,
        asunto: "Tu garantía ARATECH ha concluido",
        html: plantillaCorreo(
          "Garantía concluida",
          `
          <p>
            Hola <b>${esc(garantia.cliente_nombre)}</b>.
          </p>

          <p>
            La garantía correspondiente a tu
            <b>${esc(garantia.tipo_equipo)}</b>
            ha concluido el día de hoy.
          </p>

          <p>
            Gracias por confiar en ARATECH.
          </p>
        `,
        ),
      });

      logger.info(`${garantia.folio}: correo de vencimiento enviado`);

      if (garantia.aplica_mantenimiento) {
        await enviarCorreo({
          para: cliente.email,
          asunto: "🎁 Tu mantenimiento preventivo gratuito está disponible",
          html: plantillaCorreo(
            "Mantenimiento gratuito",
            `
            <p>
              Hola <b>${esc(garantia.cliente_nombre)}</b>.
            </p>

            <p>
              Como parte de nuestro compromiso,
              ya puedes solicitar tu primer
              mantenimiento preventivo gratuito.
            </p>

            <p>
              Agenda tu visita cuando gustes.
            </p>
          `,
          ),
        });

        logger.info(`${garantia.folio}: correo de mantenimiento enviado`);
      }

      await db.collection("garantias").doc(doc.id).update({
        estado: "Vencida",
      });

      logger.info(`${garantia.folio}: estado actualizado a Vencida`);
    }
    } catch (error) {
      logger.error(`${garantia.folio}: error procesando garantía`, {
        error: error.message,
      });
    }
  }
}
/**
 * Órdenes sin movimiento.
 */
async function revisarOrdenesSinMovimiento() {
  logger.info("Revisando órdenes sin movimiento...");

  const hoy = new Date();

  const estadosExcluir = [
    "Listo para entrega",
    "Entregado",
    "Liquidado",
    "Cancelado",
  ];

  const snapshot = await db.collection("ordenes").get();

  logger.info(`Órdenes encontradas: ${snapshot.size}`);

  const usuariosSnap = await db
    .collection("usuarios")
    .where("activo", "==", true)
    .get();

  const usuarios = usuariosSnap.docs.map((d) => d.data());

  for (const doc of snapshot.docs) {
    const orden = doc.data();

    if (estadosExcluir.includes(orden.estado)) {
      continue;
    }

    logger.info("--------------------------------");
    logger.info(`Procesando orden: ${orden.folio}`);

    if (!Array.isArray(orden.historial) || !orden.historial.length) {
      logger.warn(`${orden.folio}: historial vacío`);
      continue;
    }

    const ultimoMovimiento = orden.historial[orden.historial.length - 1];

    if (!ultimoMovimiento.fecha) {
      logger.warn(`${orden.folio}: último movimiento sin fecha`);
      continue;
    }

    const fechaMovimiento = new Date(`${ultimoMovimiento.fecha}T12:00:00`);

    if (isNaN(fechaMovimiento)) {
      logger.warn(`${orden.folio}: fecha inválida`);
      continue;
    }

    const dias = Math.floor((hoy - fechaMovimiento) / 86400000);

    logger.info(`${orden.folio}: ${dias} días sin movimiento`);

    if (dias < 3) {
      continue;
    }

    const correos = [];

    // ==========================
    // Administradores
    // ==========================

    usuarios
      .filter((u) => u.rol === "admin" && u.email)
      .forEach((u) => correos.push(u.email));

    // ==========================
    // Técnico asignado
    // ==========================

    const tecnico = usuarios.find(
      (u) =>
        u.nombre && orden.tecnico && u.nombre.trim() === orden.tecnico.trim(),
    );

    if (tecnico?.email) {
      correos.push(tecnico.email);
    }

    const destinatarios = [...new Set(correos)];

    if (!destinatarios.length) {
      logger.warn(`${orden.folio}: sin destinatarios`);
      continue;
    }

    const asunto = `⚠️ Orden sin movimiento | ${orden.folio}`;

    const cuerpo = `
      <p>
        La siguiente Orden de Servicio requiere atención.
      </p>

      <table
        style="
          width:100%;
          border-collapse:collapse;
          margin:16px 0;
          font-size:13px;
        ">

        <tr style="background:#102A43;">
          <td style="padding:8px 12px;color:#75D0FA;">
            Folio
          </td>
          <td style="padding:8px 12px;color:#FFFFFF;">
            <b>${esc(orden.folio)}</b>
          </td>
        </tr>

        <tr>
          <td style="padding:8px 12px;">
            Cliente
          </td>
          <td style="padding:8px 12px;">
            ${esc(orden.cliente_nombre)}
          </td>
        </tr>

        <tr>
          <td style="padding:8px 12px;">
            Estado
          </td>
          <td style="padding:8px 12px;">
            <b>${esc(orden.estado)}</b>
          </td>
        </tr>

        <tr>
          <td style="padding:8px 12px;">
            Técnico
          </td>
          <td style="padding:8px 12px;">
            ${esc(orden.tecnico || "Sin asignar")}
          </td>
        </tr>

        <tr>
          <td style="padding:8px 12px;">
            Días sin movimiento
          </td>
          <td style="padding:8px 12px;">
            <b>${esc(dias)}</b>
          </td>
        </tr>

      </table>

      <p>
        Se recomienda revisar y actualizar el avance de esta orden lo antes posible.
      </p>
    `;

    try {
      await enviarCorreo({
        para: destinatarios.join(","),
        asunto,
        html: plantillaCorreo(asunto, cuerpo),
      });

      logger.info(
        `${orden.folio}: alerta enviada a ${destinatarios.join(", ")}`,
      );
    } catch (error) {
      logger.error(`${orden.folio}: error enviando alerta`, {
        error: error.message,
      });
    }
  }
}

/**
 * Cotizaciones vencidas.
 */
async function revisarCotizacionesVencidas() {
  logger.info("Revisando cotizaciones vencidas...");

  const ahora = new Date();

  const snapshot = await db
    .collection("cotizaciones")
    .where("estado", "==", "Pendiente")
    .get();

  logger.info(`Cotizaciones pendientes encontradas: ${snapshot.size}`);

  const usuariosSnap = await db
    .collection("usuarios")
    .where("activo", "==", true)
    .get();

  const admins = usuariosSnap.docs
    .map((d) => d.data())
    .filter((u) => u.rol === "admin" && u.email)
    .map((u) => u.email);

  for (const doc of snapshot.docs) {
    const cot = doc.data();

    logger.info("--------------------------------");
    logger.info(`Procesando cotización: ${cot.folio}`);

    if (!cot.fecha) {
      logger.warn(`${cot.folio}: fecha vacía`);
      continue;
    }

    const fechaEmision = new Date(cot.fecha);

    if (isNaN(fechaEmision)) {
      logger.warn(`${cot.folio}: fecha inválida`);
      continue;
    }

    const horas = (ahora - fechaEmision) / 3600000;

    logger.info(`${cot.folio}: ${horas.toFixed(1)} horas`);

    if (horas < 72) {
      continue;
    }

    // ======================================
    // Cambiar estado
    // ======================================

    await db.collection("cotizaciones").doc(doc.id).update({
      estado: "Vencida",
    });

    logger.info(`${cot.folio}: estado actualizado a Vencida`);

    // ======================================
    // Buscar correo del cliente
    // ======================================

    let correoCliente = "";

    if (cot.cliente_id) {
      const clienteSnap = await db
        .collection("clientes")
        .doc(cot.cliente_id)
        .get();

      if (clienteSnap.exists) {
        correoCliente = clienteSnap.data().email || "";
      }
    }

    const destinatarios = [...new Set([...admins])];

    if (correoCliente) {
      destinatarios.push(correoCliente);
    }

    if (!destinatarios.length) {
      logger.warn(`${cot.folio}: sin destinatarios`);
      continue;
    }

    const asunto = `Cotización vencida | ${cot.folio}`;

    const cuerpo = `
      <p>
        La cotización
        <b>${esc(cot.folio)}</b>
        ha vencido automáticamente después de
        <b>72 horas</b>.
      </p>

      <table style="width:100%;border-collapse:collapse;margin:16px 0;">

        <tr>
          <td><b>Cliente</b></td>
          <td>${esc(cot.cliente_nombre)}</td>
        </tr>

        <tr>
          <td><b>Total</b></td>
          <td>$${esc(Number(cot.total || 0).toFixed(2))}</td>
        </tr>

        <tr>
          <td><b>Estado</b></td>
          <td>Vencida</td>
        </tr>

      </table>

      <p>
        Si deseas continuar con la compra, será necesario generar una nueva cotización.
      </p>
    `;

    try {
      await enviarCorreo({
        para: [...new Set(destinatarios)].join(","),
        asunto,
        html: plantillaCorreo(asunto, cuerpo),
      });

      logger.info(`${cot.folio}: correo enviado`);
    } catch (error) {
      logger.error(`${cot.folio}: error enviando correo`, {
        error: error.message,
      });
    }
  }
}

module.exports = {
  ejecutarAutomatizaciones,
};
