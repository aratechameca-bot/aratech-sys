// ============================================================
// FASE 3 — AUTENTICACIÓN CON GOOGLE
// ============================================================

// Google OAuth Client ID — usar el de Google Sign-In genérico
// Para producción real se necesita un Client ID propio en Google Cloud Console
// Por ahorita usamos el flujo de token para verificar el correo
const GOOGLE_CLIENT_ID = ""; // Se configura abajo

// Usuarios autorizados

// Usuario actual en sesión
window.currentUser = null;

// ============================================================
// INICIALIZAR GOOGLE SIGN-IN
// ============================================================
function initGoogleAuth() {
  // Intentar restaurar sesión guardada
  const saved = localStorage.getItem("ara_session");
  if (saved) {
    try {
      const session = JSON.parse(saved);
      if (session.email && session.exp > Date.now()) {
        autenticar(session);
        return;
      }
    } catch (e) {}
  }

  // Mostrar pantalla de login
  google.accounts.id.initialize({
    client_id:
      "566652821786-51hu5t3lngt8mdds5jfbric2l6pp8718.apps.googleusercontent.com",
    callback: onGoogleLogin,
    auto_select: false,
    cancel_on_tap_outside: false,
  });

  google.accounts.id.renderButton(
    document.getElementById("google-btn-container"),
    {
      theme: "filled_blue",
      size: "large",
      shape: "pill",
      text: "signin_with",
      locale: "es",
      width: 260,
    },
  );

  google.accounts.id.prompt();
}

// ============================================================
// CALLBACK — cuando el usuario inicia sesión con Google
// ============================================================
async function onGoogleLogin(response) {
  try {
    const payload = JSON.parse(atob(response.credential.split(".")[1]));

    const email = payload.email;
    const nombre = payload.name;
    const avatar = payload.picture;

    // Validar contra Apps Script / Hoja Usuarios
    const resp = await API.call("validarUsuario", null, { email });

    console.log("EMAIL:", email);
    console.log("RESPUESTA LOGIN:", resp);

    if (!resp || !resp.success) {
      mostrarErrorLogin(
        `⛔ Acceso denegado. El correo ${email} no está autorizado.\nContacta al administrador del sistema.`,
      );

      return;
    }

    const userInfo = resp.usuario;

    const session = {
      email,
      nombre: userInfo.nombre || nombre,
      avatar,
      rol: userInfo.rol,
      exp: Date.now() + 8 * 60 * 60 * 1000,
    };

    localStorage.setItem("ara_session", JSON.stringify(session));

    autenticar(session);
  } catch (e) {
    console.error(e);

    mostrarErrorLogin("Error al validar el acceso.");
  }
}

// ============================================================
// AUTENTICAR — mostrar el sistema
// ============================================================
function autenticar(session) {
  window.currentUser = session;
  document.body.classList.add("autenticado");
  resetInactivityTimer();
  // Registrar acceso
  setTimeout(() => registrarAcceso("Inicio de sesión"), 500);

  // Agregar chip de usuario en topbar
  const topbar = document.querySelector(".topbar");
  if (topbar && !document.getElementById("user-chip")) {
    const chip = document.createElement("div");
    chip.id = "user-chip";
    chip.className = "user-chip";
    chip.title = "Cerrar sesión";
    chip.onclick = cerrarSesion;
    chip.innerHTML = `
      <img class="user-avatar" src="${session.avatar || ""}" 
           onerror="this.style.display='none'"
           alt="${session.nombre}">
      <div style="display:flex;flex-direction:column;gap:0px">
        <span class="user-name">${session.nombre}</span>
        <span class="user-rol">${session.rol === "admin" ? "⚡ Admin" : session.rol === "recepcionista" ? "📋 Recepcionista" : "🔧 Técnico"}</span>
      </div>
    `;
    topbar.appendChild(chip);
  }

  // Si es admin, mostrar panel de usuarios en configuración
  if (session.rol === "admin") {
    const adminPanel = document.getElementById("admin-usuarios-panel");
    if (adminPanel) adminPanel.style.display = "block";
  }
}

// ============================================================
// CERRAR SESIÓN
// ============================================================
function cerrarSesion() {
  if (!confirm("¿Cerrar sesión?")) return;

  registrarAcceso("Cierre de sesión");

  localStorage.removeItem("ara_session");

  window.currentUser = null;

  document.body.classList.remove("autenticado");

  google.accounts.id.disableAutoSelect();

  location.reload();
}

// ============================================================
// ERROR EN LOGIN
// ============================================================
function mostrarErrorLogin(msg) {
  const el = document.getElementById("login-error");
  if (el) {
    el.textContent = msg;
    el.style.display = "block";
  }
}

window.initGoogleAuth = initGoogleAuth;
window.onGoogleLogin = onGoogleLogin;
window.autenticar = autenticar;
window.cerrarSesion = cerrarSesion;
window.mostrarErrorLogin = mostrarErrorLogin;
