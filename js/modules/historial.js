// ---- HISTORIAL DE ACCESOS ----
function registrarAcceso(tipo) {
  if (!currentUser) return;

  const now = new Date();

  const registro = {
    nombre: currentUser.nombre,

    email: currentUser.email,

    evento: tipo,

    fecha: now.toLocaleDateString("es-MX"),

    hora: now.toLocaleTimeString("es-MX", {
      hour: "2-digit",

      minute: "2-digit",
    }),
  };

  const acceso = {
    id: "ACC-" + Date.now(),

    fecha: registro.fecha,

    hora: registro.hora,

    usuario: registro.nombre,

    email: registro.email,

    accion: tipo,
  };

  DATA.save("accesos", acceso.id, acceso).catch(console.error);
}

async function rndHistorial(lista = null) {
  const tb = document.getElementById("tb-historial");

  if (!tb) return;

  let logs = lista;

  if (!logs) {
    try {
      logs = await DATA.getAll("accesos");
    } catch (err) {
      console.error(err);

      logs = [];
    }
  }

  logs = (logs || []).sort((a, b) => {
    const fa = new Date(`${a.fecha} ${a.hora}`);

    const fb = new Date(`${b.fecha} ${b.hora}`);

    return fb - fa;
  });

  const uSel = document.getElementById("hist-usuario");

  if (uSel) {
    uSel.innerHTML = '<option value="">— Todos los usuarios —</option>';

    [...new Set(logs.map((l) => l.email))].sort().forEach((email) => {
      const log = logs.find((x) => x.email === email);

      const opt = document.createElement("option");

      opt.value = email;

      opt.textContent = log?.usuario || email;

      uSel.appendChild(opt);
    });
  }

  if (!logs.length) {
    tb.innerHTML = '<tr><td colspan="5" class="nd">Sin registros aún</td></tr>';

    return;
  }

  tb.innerHTML = logs
    .map(
      (l) => `

    <tr>

      <td><b>${l.usuario || ""}</b></td>

      <td style="font-size:11px;color:var(--text3)">

        ${l.email || ""}

      </td>

      <td>

        <span class="tag ${(l.accion || "").includes("Inicio") ? "tg" : "tr"}">

          ${l.accion || ""}

        </span>

      </td>

      <td>${l.fecha || ""}</td>

      <td>${l.hora || ""}</td>

    </tr>

  `,
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

async function limpiarHistorial() {
  const ok = await ARABOT.confirm({
    title: "Limpiar historial",

    message: "¿Deseas eliminar todo el historial de accesos?",

    details:
      "Se eliminarán todos los registros almacenados localmente. Esta acción no podrá deshacerse.",
  });

  if (!ok) return;
  localStorage.removeItem("ara_historial");
  rndHistorial();
  notify("Historial limpiado ✅");
}

window.registrarAcceso = registrarAcceso;

window.rndHistorial = rndHistorial;
window.filtHistorial = filtHistorial;
window.limpiarHistorial = limpiarHistorial;
