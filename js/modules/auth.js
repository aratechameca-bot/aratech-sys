// ============================================================
// FASE 3 — AUTENTICACIÓN CON GOOGLE
// ============================================================

// Google OAuth Client ID — usar el de Google Sign-In genérico
// Para producción real se necesita un Client ID propio en Google Cloud Console
// Por ahorita usamos el flujo de token para verificar el correo

// ============================================================
// DETECTAR DISPOSITIVO
// ============================================================

function detectarDispositivo() {
  const ua = navigator.userAgent;

  if (ua.includes("Windows")) return "Windows • Chrome";

  if (ua.includes("Android")) return "Android • Chrome";

  if (ua.includes("iPhone")) return "iPhone • Safari";

  if (ua.includes("Mac")) return "MacOS • Chrome";

  return ua;
}

// ============================================================
// PROCESAR USUARIO FIREBASE
// ============================================================

async function procesarUsuarioFirebase(result) {
  const firebaseUser = result.user;

  if (!firebaseUser) {
    return;
  }

  const usuarioDoc = await FB.db
    .collection("usuarios")
    .doc(firebaseUser.email.toLowerCase())
    .get();

  if (!usuarioDoc.exists) {
    mostrarErrorLogin("Usuario no autorizado.");
    await FB.auth.signOut();
    return;
  }

  const datos = usuarioDoc.data();
  if (datos.activo === false) {
    mostrarErrorLogin(
      "Tu cuenta ha sido desactivada. Contacta al administrador del sistema.",
    );

    await FB.auth.signOut();

    return;
  }

  const ahora = new Date().toISOString();

  await FB.update("usuarios", firebaseUser.email.toLowerCase(), {
    foto: firebaseUser.photoURL || datos.foto || "",

    ultimoAcceso: ahora,

    ultimoLogin: ahora,

    actualizado: ahora,

    actualizadoPor: datos.nombre || firebaseUser.displayName || "Sistema",
  });

  Object.assign(datos, {
    foto: firebaseUser.photoURL || datos.foto || "",

    ultimoAcceso: ahora,

    ultimoLogin: ahora,

    actualizado: ahora,

    actualizadoPor: datos.nombre || firebaseUser.displayName || "Sistema",
  });

  autenticar({
    uid: firebaseUser.uid,

    firebaseUid: firebaseUser.uid,

    email: firebaseUser.email,

    nombre: datos.nombre,

    avatar: firebaseUser.photoURL,

    rol: datos.rol,

    activo: datos.activo,
  });

  // Cargar datos únicamente después de autenticar
  await API.loadAll();
}

// ============================================================
// INICIALIZAR GOOGLE SIGN-IN (Firebase Compat)
// ============================================================

async function initGoogleAuth() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();

    // [FASE 1] Solo abre el popup. El procesamiento del usuario lo hace
    // FB.auth.onAuthStateChanged (en init) para evitar procesarlo dos veces.
    await FB.auth.signInWithPopup(provider);
  } catch (e) {
    console.error("FIREBASE ERROR:", e);
    console.error("CODE:", e.code);
    console.error("MESSAGE:", e.message);
    console.error("FULL:", e);

    mostrarErrorLogin(e.code || e.message || "Error de autenticación.");
  }
}

// ============================================================
// AUTENTICAR USUARIO
// ============================================================

function autenticar(session) {
  window.currentUser = session;

  aplicarPermisosUI(session);

  document.body.classList.add("autenticado");

  // Registrar acceso
  setTimeout(() => registrarAcceso("Inicio de sesión"), 500);

  // ==========================================================
  // CHIP DE USUARIO EN SIDEBAR
  // ==========================================================

  if (!document.getElementById("user-chip")) {
    const chip = document.createElement("div");

    chip.id = "user-chip";

    chip.className = "user-chip";

    chip.title = "";

    chip.onclick = cerrarSesion;

    chip.innerHTML = `

    <div class="user-avatar-wrap">

        ${
          session.avatar
            ? `
        <img
            class="user-avatar"
            src="${session.avatar}"
            alt="${session.nombre}">
    `
            : `
        <div class="user-avatar-placeholder">

            ${(session.nombre || "?").charAt(0).toUpperCase()}

        </div>
    `
        }

        <span class="user-online"></span>

    </div>

    <div class="user-info">

        <span class="user-name">

            ${session.nombre}

        </span>

        <span class="user-rol">

            ${String(session.rol || "").toUpperCase()}

        </span>

    </div>

`;

    const logo = document.querySelector(".sb-logo");

    if (logo) {
      logo.insertAdjacentElement("afterend", chip);
    }
  }

  // ==========================================================
  // PANEL ADMINISTRADOR
  // ==========================================================

  if (session.rol === "admin") {
    const adminPanel = document.getElementById("admin-usuarios-panel");

    if (adminPanel) {
      adminPanel.style.display = "block";
    }
  }

  // ==========================================================
  // RESTAURAR ÚLTIMO PANEL
  // ==========================================================

  setTimeout(() => {
    const last = localStorage.getItem("aratech-last-panel") || "dashboard";

    activarPanel(last, false);
  }, 50);
}

async function loginLocal() {
  autenticar({
    email: "aratech@gmail.com",

    nombre: "Administrador",

    rol: "admin",

    activo: true,

    avatar: "",
  });

  await API.loadAll();
}

function aplicarPermisosUI(usuario) {
  const ocultar = [];

  if (usuario.rol === "recepcionista") {
    ocultar.push("config", "historial");
  } else if (usuario.rol === "tecnico") {
    ocultar.push(
      "ventas",
      "clientes",
      "inventario",
      "gastos",
      "compras",
      "config",
      "historial",
    );
  }

  document.querySelectorAll(".sb-item[data-panel]").forEach((item) => {
    const panel = item.dataset.panel;

    if (ocultar.includes(panel)) {
      item.style.display = "none";
    }
  });
}

// ============================================================
// CERRAR SESIÓN
// ============================================================
async function cerrarSesion() {
  const ok = await ARABOT.confirm({
    title: "Cerrar sesión",

    message: "¿Deseas cerrar la sesión actual?",

    details: "Se finalizará tu sesión y regresarás a la pantalla de inicio.",
  });

  if (!ok) return;

  registrarAcceso("Cierre de sesión");

  localStorage.removeItem("ara_session");

  // [FASE 1] Limpiar del navegador los datos de ARASYS (caché "ara_*").
  // Se conservan preferencias como el tema y el último panel visitado.
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("ara_"))
      .forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.warn("No se pudo limpiar el caché local:", e);
  }

  window.currentUser = null;

  document.body.classList.remove("autenticado");

  FB.auth.signOut();

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

// ============================================================
// USUARIOS
// ============================================================

async function agregarUsuario() {
  if (window.currentUser?.rol !== "admin") {
    notify("Permisos insuficientes");

    return;
  }

  const nombre = document.getElementById("nu-nombre").value.trim();

  const email = document.getElementById("nu-email").value.trim().toLowerCase();

  const rol = document.getElementById("nu-rol").value;

  if (!nombre || !email) {
    notify("Completa nombre y correo");

    return;
  }

  const ahora = new Date().toISOString();

  const nuevo = {
    id: email,

    email,

    nombre,

    rol,

    activo: true,

    foto: "",

    proveedor: "google",

    creado: ahora,

    creadoPor: window.currentUser?.nombre || "Sistema",

    actualizado: ahora,

    actualizadoPor: window.currentUser?.nombre || "Sistema",

    ultimoAcceso: "",

    ultimoLogin: "",

    version: 1,
  };

  await DATA.save("usuarios", email, nuevo);

  await rndUsuarios();

  document.getElementById("nu-nombre").value = "";

  document.getElementById("nu-email").value = "";

  document.getElementById("nu-rol").selectedIndex = 0;

  notify("✅ Usuario agregado");
}
// ============================================================
// RENDER USUARIOS
// ============================================================

async function rndUsuarios() {
  // Seguridad: solo administradores
  if (!currentUser || currentUser.rol !== "admin") {
    return;
  }

  const panel = document.getElementById("admin-usuarios-panel");

  if (panel) {
    panel.style.display = "block";
  }

  const tb = document.getElementById("tb-usuarios");

  if (!tb) return;

  let usuarios = [];

  try {
    usuarios = await DATA.getAll("usuarios");
  } catch (err) {
    console.error("Error cargando usuarios:", err);

    tb.innerHTML = `
      <tr>
        <td colspan="4" class="nd">
          Error cargando usuarios
        </td>
      </tr>
    `;

    return;
  }

  if (!usuarios.length) {
    tb.innerHTML = `
      <tr>
        <td colspan="4" class="nd">
          Sin usuarios registrados
        </td>
      </tr>
    `;

    return;
  }

  tb.innerHTML = usuarios
    .filter(Boolean)
    .map(
      (u) => `

      <tr>

       <td>

  <div style="display:flex;align-items:center;gap:10px;">

    <img
      src="${u.foto || "https://www.gstatic.com/images/branding/product/1x/avatar_circle_blue_512dp.png"}"
      style="
        width:34px;
        height:34px;
        border-radius:50%;
        object-fit:cover;
        border:2px solid var(--accent);
      ">

    <div>

      <div style="font-weight:600;">

        ${u.nombre || ""}

      </div>

      <div style="font-size:11px;color:var(--text2);">

        ${u.email || ""}

      </div>

    </div>

  </div>

</td>

<td>

  <span class="tag tg">

    ${u.rol || ""}

  </span>

</td>

<td>

  <span
    class="tag ${u.activo === false ? "tr" : "tg"}"
    style="min-width:82px;text-align:center;">

    ${u.activo === false ? "🔴 Inactivo" : "🟢 Activo"}

</span>

</td>

<td style="font-size:11px;">

  ${u.ultimoAcceso ? new Date(u.ultimoAcceso).toLocaleString("es-MX") : '<span style="color:var(--text3)">Sin registro</span>'}

</td>

<td>

  <button
    class="btn ${u.activo === false ? "bs" : "bd"} bsm"
    onclick="toggleUsuario('${u.email}')">

   ${u.activo === false ? "🟢 Activar" : "🔴 Desactivar"}

  </button>

</td>

      </tr>

    `,
    )
    .join("");
}

// ============================================================
// ACTIVAR / DESACTIVAR USUARIO
// ============================================================

async function toggleUsuario(email) {
  if (window.currentUser?.rol !== "admin") {
    notify("Permisos insuficientes");

    return;
  }

  const usuarios = await DATA.getAll("usuarios");

  const usuario = usuarios.find((u) => u.email === email);

  if (!usuario) {
    notify("Usuario no encontrado");

    return;
  }

  const activar = usuario.activo === false;

  const ok = await ARABOT.confirm({
    title: activar ? "Activar usuario" : "Desactivar usuario",

    message: activar
      ? "¿Deseas activar este usuario?"
      : "¿Deseas desactivar este usuario?",

    details: activar
      ? "El usuario podrá volver a iniciar sesión."
      : "El usuario perderá el acceso al sistema, pero toda su información e historial permanecerán intactos.",
  });

  if (!ok) return;

  usuario.activo = activar;

  await DATA.update("usuarios", email, usuario);

  await rndUsuarios();

  notify(
    activar
      ? "Usuario activado correctamente."
      : "Usuario desactivado correctamente.",
  );
}

window.rndUsuarios = rndUsuarios;
window.agregarUsuario = agregarUsuario;
window.initGoogleAuth = initGoogleAuth;
//window.onGoogleLogin = onGoogleLogin;
window.autenticar = autenticar;
window.cerrarSesion = cerrarSesion;
window.mostrarErrorLogin = mostrarErrorLogin;
