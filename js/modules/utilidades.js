// EXPORT
function exp(tipo) {
  const d = DB.get(tipo);
  if (!d.length) {
    alert("Sin datos");
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
function expBak() {
  const b = {
    ordenes: DB.get("ordenes"),
    ventas: DB.get("ventas"),
    clientes: DB.get("clientes"),
    inventario: DB.get("inventario"),
    garantias: DB.get("garantias"),
    segs: DB.get("segs"),
    cat: DB.get("cat"),
    config: DB.obj("config"),
    fecha: new Date().toISOString(),
  };
  const a = document.createElement("a");
  a.href =
    "data:application/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(b, null, 2));
  a.download = "ARATECH_backup_" + hoy() + ".json";
  a.click();
  notify("Respaldo exportado ✅");
}
function impBak(e) {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = (ev) => {
    try {
      const b = JSON.parse(ev.target.result);
      if (!confirm("¿Importar? Se reemplazarán los datos actuales.")) return;
      [
        "ordenes",
        "ventas",
        "clientes",
        "inventario",
        "garantias",
        "segs",
        "cat",
      ].forEach((k) => {
        if (b[k]) DB.set(k, b[k]);
      });
      if (b.config) DB.sobj("config", b.config);
      rndOrd();
      rndVta();
      rndCli();
      rndInv();
      rndGar();
      dash();
      updBadges();
      notify("Respaldo importado ✅ — Sincronizando con Sheets…");
      if (_syncEnabled) API.importBackup(b);
    } catch {
      alert("Archivo inválido");
    }
  };
  r.readAsText(f);
}

// NOTIFY
function notify(msg) {
  const n = document.createElement("div");
  n.style.cssText =
    "position:fixed;bottom:22px;right:22px;background:var(--surface2);border:1px solid var(--border);border-left:3px solid var(--green);color:var(--text);padding:11px 18px;border-radius:8px;font-size:13px;z-index:9999;box-shadow:0 4px 18px rgba(0,0,0,.4);transition:opacity .3s";
  n.textContent = msg;
  document.body.appendChild(n);
  setTimeout(() => {
    n.style.opacity = "0";
    setTimeout(() => n.remove(), 300);
  }, 3000);
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

window.USUARIOS = [];

// INIT
function init() {
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

  dash();
  updBadges();
  genQR();
  procesarSistema();

  // Poblar campo de URL si existe
  setTimeout(() => {
    const urlInput = document.getElementById("sheets-url");

    if (urlInput) {
      urlInput.value =
        APPS_SCRIPT_URL !== "TU_URL_AQUI"
          ? APPS_SCRIPT_URL
          : localStorage.getItem("ara_sheets_url") || "";
    }

    if (currentUser?.rol === "admin" && typeof rndUsuarios === "function") {
      rndUsuarios();
    }
  }, 300);

  // Cargar usuarios primero
  API.call("getAll", "usuarios")

    .then((usuarios) => {
      window.USUARIOS = usuarios || [];

      console.log("Usuarios cargados:", window.USUARIOS.length);

      // Después cargar el resto
      API.loadAll();
    })

    .catch((err) => {
      console.error("Error cargando usuarios:", err);

      API.loadAll();
    });
}

// Google GSI se inicializa cuando carga el script
window.onload = () => {
  if (typeof google !== "undefined" && google.accounts) {
    initGoogleAuth();
  } else {
    // Esperar a que cargue el script de Google
    const script = document.querySelector('script[src*="accounts.google.com"]');
    if (script) {
      script.addEventListener("load", initGoogleAuth);
    } else {
      // Fallback: modo local sin login
      autenticar({
        nombre: "Usuario Local",
        email: "",
        rol: "admin",
        avatar: "",
        exp: Date.now() + 86400000,
      });
    }
  }
};

window.exp = exp;
window.expBak = expBak;
window.impBak = impBak;

window.notify = notify;

window.formatMXN = formatMXN;
window.procesarSistema = procesarSistema;

window.init = init;
