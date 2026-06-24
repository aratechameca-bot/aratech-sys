// ============================================================
// BITÁCORA
// ============================================================

function bitacora(ordenId, accion, detalle) {
  if (!currentUser) return;

  const ords = DB.get("ordenes");
  const i = ords.findIndex((o) => o.id === ordenId);

  if (i < 0) return;

  ords[i].bitacora = ords[i].bitacora || [];

  const entrada = {
    usuario: currentUser.nombre,
    email: currentUser.email,
    accion,
    detalle,
    fecha: new Date().toLocaleString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  ords[i].bitacora.push(entrada);

  DB.set("ordenes", ords);

  API.update("ordenes", ordenId, {
    bitacora: ords[i].bitacora,
  });
}

// ============================================================
// CIERRE DE SESIÓN AUTOMÁTICO
// ============================================================

const SESSION_TIMEOUT = 60 * 60 * 1000;

let _inactivityTimer = null;

function resetInactivityTimer() {
  clearTimeout(_inactivityTimer);

  _inactivityTimer = setTimeout(() => {
    if (currentUser) {
      localStorage.removeItem("ara_session");

      currentUser = null;

      document.body.classList.remove("autenticado");

      alert(
        "Tu sesión se cerró por inactividad (60 min). Inicia sesión de nuevo.",
      );

      location.reload();
    }
  }, SESSION_TIMEOUT);
}

["click", "keypress", "mousemove", "touchstart", "scroll"].forEach((evt) => {
  document.addEventListener(evt, resetInactivityTimer, {
    passive: true,
  });
});

// ============================================================
// PERMISOS POR ROL
// ============================================================

const PERMISOS = {
  admin: {
    verVentas: true,
    verReporte: true,
    verConfig: true,
    eliminarOrdenes: true,
    eliminarClientes: true,
    eliminarVentas: true,
    editarPrecios: true,
    editarServicios: true,
    verClientesCompleto: true,
    verInventarioEditar: true,
    gestionUsuarios: true,
  },

  recepcionista: {
    verVentas: true,
    verReporte: false,
    verConfig: false,
    eliminarOrdenes: false,
    eliminarClientes: false,
    eliminarVentas: false,
    editarPrecios: true,
    editarServicios: true,
    verClientesCompleto: true,
    verInventarioEditar: false,
    gestionUsuarios: false,
  },

  tecnico: {
    verVentas: false,
    verReporte: false,
    verConfig: false,
    eliminarOrdenes: false,
    eliminarClientes: false,
    eliminarVentas: false,
    editarPrecios: false,
    editarServicios: false,
    verClientesCompleto: false,
    verInventarioEditar: false,
    gestionUsuarios: false,
  },
};

function puedo(permiso) {
  if (!currentUser) return false;

  const rol = currentUser.rol || "tecnico";

  return PERMISOS[rol]?.[permiso] === true;
}

function aplicarPermisos() {
  const navVentas = document.querySelector('[data-panel="ventas"]');

  if (navVentas)
    navVentas.parentElement.style.display = puedo("verVentas") ? "" : "none";

  const navConfig = document.querySelector('[data-panel="config"]');

  if (navConfig)
    navConfig.parentElement.style.display = puedo("verConfig") ? "" : "none";

  const navHist = document.getElementById("nav-historial");

  if (navHist)
    navHist.style.display = currentUser?.rol === "admin" ? "" : "none";

  const btnReporte = document.querySelector('[onclick="genReporteGerencia()"]');

  if (btnReporte) btnReporte.style.display = puedo("verReporte") ? "" : "none";

  if (!puedo("eliminarOrdenes")) {
    document
      .querySelectorAll('[onclick*="delOrd"]')
      .forEach((b) => (b.style.display = "none"));
  }

  if (!puedo("eliminarClientes")) {
    document
      .querySelectorAll('[onclick*="delCli"]')
      .forEach((b) => (b.style.display = "none"));
  }

  if (!puedo("eliminarVentas")) {
    document
      .querySelectorAll('[onclick*="delVta"]')
      .forEach((b) => (b.style.display = "none"));
  }

  if (!puedo("editarPrecios")) {
    ["ord-desc", "ord-ant"].forEach((id) => {
      const el = document.getElementById(id);

      if (el?.closest(".fi")) el.closest(".fi").style.display = "none";
    });
  }

  if (!puedo("verClientesCompleto")) {
    const navCli = document.querySelector('[data-panel="clientes"]');

    if (navCli) navCli.parentElement.style.display = "none";
  }

  const adminPanel = document.getElementById("admin-usuarios-panel");

  if (adminPanel)
    adminPanel.style.display = puedo("gestionUsuarios") ? "block" : "none";

  if (!puedo("verInventarioEditar")) {
    document
      .querySelectorAll('[onclick*="openMProd"], [onclick*="saveProd"]')
      .forEach((b) => (b.style.display = "none"));
  }
}

window.bitacora = bitacora;

window.resetInactivityTimer = resetInactivityTimer;

window.puedo = puedo;
window.aplicarPermisos = aplicarPermisos;

window.PERMISOS = PERMISOS;
