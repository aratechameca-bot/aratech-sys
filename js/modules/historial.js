// ---- HISTORIAL DE ACCESOS ----
function registrarAcceso(tipo) {
  if (!currentUser) return;
  const logs = JSON.parse(localStorage.getItem("ara_historial") || "[]");
  const now = new Date();
  const registro = {
    nombre: currentUser.nombre,
    email: currentUser.email,
    evento: tipo, // 'Inicio de sesión' o 'Cierre de sesión'
    fecha: now.toLocaleDateString("es-MX"),
    hora: now.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
  logs.unshift(registro);
  // Mantener solo los últimos 500 registros
  if (logs.length > 500) logs.splice(500);
  localStorage.setItem("ara_historial", JSON.stringify(logs));
  // #18: Guardar también en Sheets hoja Accesos
  const acceso = {
    id: "ACC-" + Date.now(),
    fecha: registro.fecha,
    hora: registro.hora,
    usuario: registro.nombre,
    email: registro.email,
    accion: tipo,
  };
  API.save("accesos", acceso).catch(() => {});
}

function rndHistorial(lista) {
  const tb = document.getElementById("tb-historial");
  if (!tb) return;
  const logs =
    lista || JSON.parse(localStorage.getItem("ara_historial") || "[]");
  // Poblar filtro de usuarios
  const uSel = document.getElementById("hist-usuario");
  if (uSel && uSel.options.length <= 1) {
    const emails = [
      ...new Set(
        JSON.parse(localStorage.getItem("ara_historial") || "[]").map(
          (l) => l.email,
        ),
      ),
    ];
    emails.forEach((e) => {
      const u = USUARIOS.find((x) => x.email === e);

      const opt = document.createElement("option");

      opt.value = e;

      opt.textContent = u ? u.nombre : e;

      uSel.appendChild(opt);
    });
  }
  if (!logs.length) {
    tb.innerHTML = '<tr><td colspan="5" class="nd">Sin registros aún</td></tr>';
    return;
  }
  tb.innerHTML = logs
    .map(
      (l) => `<tr>
    <td><b>${l.nombre}</b></td>
    <td style="font-size:11px;color:var(--text3)">${l.email}</td>
    <td><span class="tag ${l.evento.includes("Inicio") ? "tg" : "tr"}" style="font-size:10px">${l.evento}</span></td>
    <td style="font-size:11px">${l.fecha}</td>
    <td style="font-size:11px">${l.hora}</td>
  </tr>`,
    )
    .join("");
}

function filtHistorial() {
  const desde = document.getElementById("hist-desde")?.value;
  const hasta = document.getElementById("hist-hasta")?.value;
  const usuario = document.getElementById("hist-usuario")?.value;
  let logs = JSON.parse(localStorage.getItem("ara_historial") || "[]");
  if (usuario) logs = logs.filter((l) => l.email === usuario);
  if (desde)
    logs = logs.filter((l) => {
      const [d, m, a] = l.fecha.split("/");
      const fd = `${a}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      return fd >= desde;
    });
  if (hasta)
    logs = logs.filter((l) => {
      const [d, m, a] = l.fecha.split("/");
      const fd = `${a}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      return fd <= hasta;
    });
  rndHistorial(logs);
}

function limpiarHistorial() {
  if (!confirm("¿Eliminar todo el historial de accesos?")) return;
  localStorage.removeItem("ara_historial");
  rndHistorial();
  notify("Historial limpiado ✅");
}

window.registrarAcceso = registrarAcceso;

window.rndHistorial = rndHistorial;
window.filtHistorial = filtHistorial;
window.limpiarHistorial = limpiarHistorial;
