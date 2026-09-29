// EXPORT
function exp(tipo) {
  const d = DB.get(tipo);
  if (!d.length) {
    ARABOT.alert({
      title: "Sin datos",

      message: "No existen registros para exportar.",

      details: "Agrega información antes de generar el archivo CSV.",
    });

    return;
  }
  const h = Object.keys(d[0]);
  const csv = [
    h.join(","),
    ...d.map((r) => h.map((k) => JSON.stringify(r[k] ?? "")).join(",")),
  ].join("\n");
  const a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  a.download = "ARATECH_" + tipo + "_" + hoy() + ".csv";
  a.click();
}
// ============================================================
// EXPORTAR RESPALDO COMPLETO
// ============================================================

async function expBak() {
  const backup = {
    fecha: new Date().toISOString(),

    version: window.ARATECH?.VERSION || "desconocida",

    sistema: window.ARATECH?.NAME || "ARATECH-SYS",

    colecciones: {},
  };

  for (const nombre of Object.values(window.COLLECTIONS)) {
    try {
      if (nombre === "config" || nombre === "folios") {
        backup.colecciones[nombre] = await DATA.getDoc(nombre, nombre);
      } else {
        backup.colecciones[nombre] = await DATA.getAll(nombre);
      }
    } catch (err) {
      console.warn("No fue posible exportar:", nombre, err);

      backup.colecciones[nombre] = null;
    }
  }

  const a = document.createElement("a");

  a.href =
    "data:application/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(backup, null, 2));

  a.download =
    "ARATECH_BACKUP_" + new Date().toISOString().substring(0, 10) + ".json";

  a.click();

  notify("✅ Respaldo completo generado.");
}

// TODO ETAPA FIREBASE:
// importar directamente mediante DATA.importBackup()

async function impBak(e) {
  const f = e.target.files[0];
  if (!f) return;

  const r = new FileReader();

  r.onload = async (ev) => {
    try {
      const backup = JSON.parse(ev.target.result);

      // ==========================================================
      // VALIDAR RESPALDO
      // ==========================================================

      if (
        !backup ||
        !backup.colecciones ||
        typeof backup.colecciones !== "object"
      ) {
        ARABOT.error({
          title: "Respaldo inválido",
          message: "El archivo seleccionado no pertenece a ARATECH-SYS.",
          details: "El formato del respaldo no es compatible con esta versión.",
        });
        return;
      }

      const ok = await ARABOT.confirm({
        title: "Restaurar respaldo",
        message: "¿Deseas restaurar este respaldo completo?",
        details:
          "Toda la información actual será reemplazada por la contenida en el archivo.",
      });

      if (!ok) return;

      ARABOT.loading({
        title: "Restaurando respaldo",
        message: "Procesando colecciones...",
      });

      const colecciones = Object.entries(backup.colecciones);

      let totalDocs = 0;

      // ==========================================================
      // RESTAURAR COLECCIONES
      // ==========================================================

      for (const [coleccion, datos] of colecciones) {
        if (datos == null) continue;

        // Documentos únicos
        if (coleccion === "config" || coleccion === "folios") {
          await DATA.saveDoc(coleccion, coleccion, datos);
          continue;
        }

        if (!Array.isArray(datos)) continue;

        // Limpiar colección antes de restaurar
        await DATA.clearCollection(coleccion);

        // Restaurar documentos
        for (const registro of datos) {
          const id = registro.id || registro.email || registro.folio;

          if (!id) continue;

          await DATA.saveDoc(coleccion, id, registro);

          totalDocs++;
        }
      }

      ARABOT.close();

      // ==========================================================
      // RECARGAR SISTEMA
      // ==========================================================

      try {
        if (typeof rndOrd === "function") rndOrd();
        if (typeof rndCli === "function") rndCli();
        if (typeof rndVta === "function") rndVta();
        if (typeof rndInv === "function") rndInv();
        if (typeof rndGar === "function") rndGar();
        if (typeof rndCot === "function") rndCot();
        if (typeof rndTickets === "function") rndTickets();
        if (typeof dash === "function") dash();
        if (typeof updBadges === "function") updBadges();
      } catch (err) {
        console.warn("Error actualizando interfaz:", err);
      }

      notify(`✅ Respaldo restaurado correctamente (${totalDocs} registros)`);
    } catch (err) {
      console.error(err);

      ARABOT.error({
        title: "Importación fallida",
        message: "No fue posible restaurar el respaldo.",
        details: err.message,
      });
    }
  };

  r.readAsText(f);
}
// NOTIFY
// NOTIFY
function notify(msg) {
  ARABOT.success({
    title: "ARATECH-SYS",

    message: msg,

    details: "Presiona ENTER o toca cualquier parte para continuar.",
  });
}

// ============================================================
// MINI NOTIFICACIÓN
// ============================================================
function notifyMini(msg) {
  const old = document.querySelector(".ara-mini-toast");

  if (old) {
    old.remove();
  }

  const n = document.createElement("div");

  n.className = "ara-mini-toast";

  n.innerHTML = `
    <span>🟢</span>
    <span>${msg}</span>
  `;

  document.body.appendChild(n);

  requestAnimationFrame(() => {
    n.classList.add("show");
  });

  setTimeout(() => {
    n.classList.remove("show");

    setTimeout(() => {
      if (n.parentNode) {
        n.remove();
      }
    }, 250);
  }, 2200);
}
// COTIZADOR (original logic)
function formatMXN(m) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(m);
}
function procesarSistema() {
  const costo = parseFloat(document.getElementById("costo")?.value) || 0;
  const tm = document.getElementById("tarjeta-msi");
  const tiMsi = document.getElementById("titulo-msi");
  const cMen = document.getElementById("contenedor-mensualidad");
  const avMsi = document.getElementById("aviso-restriccion-msi");
  const uMsiW = document.getElementById("utilidad-msi-wrapper");
  if (!tm) return;
  const margenPct =
    Math.min(
      Math.max(parseFloat(document.getElementById("margen")?.value) || 30, 1),
      99,
    ) / 100;
  const pEf = costo / (1 - margenPct);
  const uEf = pEf - costo;
  const tTC = 0.035 * 1.16;
  const pCo = pEf / (1 - tTC);
  const uCo = pCo * (1 - tTC) - costo;
  const tMsi = 0.0469 * 1.16;
  const tRT = tTC + tMsi;
  const pMsi = pEf / (1 - tRT);
  const men = pMsi / 3;
  const uMsi = pMsi * (1 - tRT) - costo;
  document.getElementById("precio-efectivo").innerText = formatMXN(pEf);
  document.getElementById("utilidad-efectivo").innerText = "+" + formatMXN(uEf);
  const lbl = document.getElementById("label-margen-efectivo");
  if (lbl) lbl.innerText = "Utilidad del " + Math.round(margenPct * 100) + "%";
  document.getElementById("precio-contado").innerText = formatMXN(pCo);
  document.getElementById("utilidad-contado").innerText = "+" + formatMXN(uCo);

  // ===========================================
  // PRECIOS CON IVA (VISUAL)
  // ===========================================

  const efIVA = document.getElementById("precio-efectivo-iva");
  const coIVA = document.getElementById("precio-contado-iva");
  const msiIVA = document.getElementById("precio-msi-iva");

  if (efIVA) efIVA.innerText = formatMXN(pEf * 1.16);
  if (coIVA) coIVA.innerText = formatMXN(pCo * 1.16);
  if (msiIVA) msiIVA.innerText = formatMXN(pMsi * 1.16);

  if (costo === 0 || pMsi <= 4000) {
    tm.classList.add("bloqueada");
    tiMsi.style.color = "var(--alert-red)";
    cMen.style.display = "none";
    uMsiW.style.display = "none";
    avMsi.style.display = "block";
    document.getElementById("precio-msi").innerText = formatMXN(pMsi);
  } else {
    tm.classList.remove("bloqueada");
    tiMsi.style.color = "#c084fc";
    cMen.style.display = "block";
    uMsiW.style.display = "block";
    avMsi.style.display = "none";
    document.getElementById("precio-msi").innerText = formatMXN(pMsi);
    document.getElementById("mensualidad-msi").innerText =
      "3 mensualidades de: " + formatMXN(men);
    document.getElementById("utilidad-msi").innerText = "+" + formatMXN(uMsi);
  }
}

// INIT
async function init() {
  initIcons();

  initCat();

  document.getElementById("tdate").textContent = new Date().toLocaleDateString(
    "es-MX",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );

  // Dashboard
  dash();

  updBadges();

  genQR();

  procesarSistema();

  // Poblar campo de URL si existe
  setTimeout(() => {
    if (currentUser?.rol === "admin" && typeof rndUsuarios === "function") {
      rndUsuarios();
    }
  }, 300);

  // ==========================================================
  // AUTENTICACIÓN
  // ==========================================================

  if (window.DEV_MODE) {
    if (!window.currentUser) {
      loginLocal();
    }
    return;
  }

  // [FASE 1] Sesión persistente: Firebase restaura la sesión de Google al
  // recargar y este listener la procesa. También procesa el login del botón.
  FB.auth.onAuthStateChanged(async (user) => {
    if (!user || window.currentUser || window._procesandoLogin) return;

    window._procesandoLogin = true;

    try {
      await procesarUsuarioFirebase({ user });
    } catch (err) {
      console.error("Error procesando sesión:", err);

      mostrarErrorLogin(
        err?.code === "permission-denied"
          ? "No tienes permiso para acceder. Contacta al administrador del sistema."
          : "No se pudo iniciar sesión. Intenta nuevamente.",
      );

      await FB.auth.signOut();
    } finally {
      window._procesandoLogin = false;
    }
  });
}

window.exp = exp;
window.expBak = expBak;
window.impBak = impBak;

window.notify = notify;

window.formatMXN = formatMXN;
window.procesarSistema = procesarSistema;

window.init = init;
