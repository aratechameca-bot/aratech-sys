// ============================================================
// API — Utilidades del Frontend
// ============================================================
const API = {
  async loadAll() {
    showSyncStatus("loading");
    try {
      const collections = [
        "ordenes",
        "clientes",
        "clientes_portal",
        "usuarios",
        "ventas",
        "inventario",
        "garantias",
        "pagos",
        "segs",
        "cat",
        "proveedores",
        "ordenes_compra",
        "gastos",
        "cotizaciones",
        "tickets",
        "ticketcomentarios",
        "ticketarchivos",
        "ticketconceptos",
        "cliente_avisos",
        "finanzas_movimientos",
        // [FASE 4] Movimientos de inventario (el dashboard muestra los últimos 10)
        "inventario_movimientos",
      ];
      // [FASE 1] allSettled: si una colección no está permitida para el rol
      // del usuario, las demás se cargan igual (antes fallaba toda la carga).
      const results = await Promise.allSettled(
        collections.map((col) => DATA.getAll(col)),
      );

      function normFecha(v) {
        if (!v && v !== 0) return v;
        if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v))
          return v.slice(0, 10);
        if (v instanceof Date || typeof v === "object")
          return new Date(v).toISOString().slice(0, 10);
        if (typeof v === "string") {
          const d = new Date(v);
          return isNaN(d) ? v : d.toISOString().slice(0, 10);
        }
        return v;
      }
      collections.forEach((col, i) => {
        const res = results[i];

        if (res.status === "rejected") {
          console.warn(
            `Sin acceso a ${col}:`,
            res.reason?.code || res.reason?.message || res.reason,
          );
          return;
        }

        if (res.value && Array.isArray(res.value)) {
          const fields = window.FECHA_FIELDS[col] || [];
          const normed = res.value.map((r) => {
            if (!fields.length) return r;
            const n = { ...r };
            fields.forEach((f) => {
              if (n[f] !== undefined) n[f] = normFecha(n[f]);
            });
            return n;
          });
          DB.set(col, normed);
        }
      });

      // [FASE 1] Si no se pudo cargar ninguna colección, sí es un error real
      // (sin conexión o sin sesión): se reporta como antes.
      if (results.every((r) => r.status === "rejected")) {
        throw results[0].reason;
      }
      // ============================================================
      // Cargar configuración desde Firestore
      // ============================================================

      // [FASE 1] La configuración se carga aparte para que un error aquí
      // no marque todo el sistema como "Sin conexión".
      try {
        const cfg = await DATA.getDoc("config", "config");

        if (cfg) {
          DB.sobj("config", cfg);
        }
      } catch (e) {
        console.warn("Sin acceso a config:", e?.code || e?.message || e);
      }

      showSyncStatus("online");

      // Re-renderizar todo con datos frescos
      dash();
      rndOrd();
      rndVta();
      rndCli();
      rndInv();
      rndGar();
      rndOC();
      rndProv();
      updBadges();

      notifyMini("Conectado");
    } catch (e) {
      showSyncStatus("error");

      console.error("Error cargando datos:", e);
    }
  },

  // Actualizar registro existente
  async update(collection, id, payload) {
    const list = DB.get(collection);
    const i = list.findIndex((r) => r.id === id);
    if (i >= 0) {
      list[i] = { ...list[i], ...payload };
      DB.set(collection, list);
    }

    if (collection === "ordenes") {
      rndOrd();
    }

    if (collection === "ventas") {
      rndVta();
    }
  },

  // Obtener folio desde Firestore
  // [FASE 4] Antes de entregar un folio se verifica en el servidor que no
  // exista ya un registro con ese ID. Como guardar un registro usa set(), un
  // folio repetido REEMPLAZABA el registro anterior. Si el contador quedó
  // atrasado, se adelanta automáticamente al número más alto conocido.
  async getFolio(prefix) {
    const colecciones = window.FOLIO_COLS[prefix] || [];

    let minimo = 0;

    for (let intento = 0; intento < 10; intento++) {
      let folio;

      try {
        folio = await DATA.nextFolio(prefix, minimo);
      } catch (e) {
        console.warn("Folio Firestore:", e);

        // Respaldo local en caso de que Firestore no esté disponible
        return folioLocal(prefix);
      }

      if (!colecciones.length) return folio;

      const ocupado = await folioOcupadoEnServidor(folio, colecciones);

      if (!ocupado) return folio;

      console.warn(`Folio ${folio} ya existe; se genera el siguiente.`);

      // Adelantar el contador al número más alto que conozca este equipo
      const numero = parseInt(String(folio).split("-").pop(), 10) || 0;

      minimo = Math.max(minimo, numero, maxFolioConocido(prefix));
    }

    throw new Error(`No se pudo generar un folio libre para ${prefix}.`);
  },
};

// [FASE 4] ¿Existe ya un documento con ese folio como ID?
// Si no se puede consultar (p. ej. el rol no tiene permiso de lectura), se
// considera libre para no bloquear la operación.
async function folioOcupadoEnServidor(folio, colecciones) {
  for (const col of colecciones) {
    try {
      const doc = await FB.db.collection(col).doc(String(folio)).get();

      if (doc.exists) return true;
    } catch (e) {
      console.warn(`No se pudo verificar el folio ${folio} en ${col}:`, e?.code || e);
    }
  }

  return false;
}

// Número de folio más alto registrado en la copia local para un prefijo
function maxFolioConocido(prefix) {
  const re = new RegExp("^" + prefix + "-(\\d+)$", "i");

  let max = 0;

  (window.FOLIO_COLS[prefix] || []).forEach((col) => {
    (DB.get(col) || []).forEach((r) => {
      const m = String(r?.folio || r?.id || "").match(re);

      if (m) max = Math.max(max, parseInt(m[1], 10));
    });
  });

  return max;
}

window.API = API;
