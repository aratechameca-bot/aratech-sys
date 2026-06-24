// ============================================================
// FOTOS DE EVIDENCIA — Google Drive
// ============================================================

const MAX_FOTOS = 10;
const MAX_SIZE_MB = 5;
let _fotasPendientes = [];

function actualizarContador() {
  const el = document.getElementById("fotos-contador");
  if (!el) return;
  const n = _fotasPendientes.length;
  el.textContent = n + " / 10 fotos";
  el.style.color = n >= 10 ? "#ff1744" : n >= 7 ? "#ffd600" : "var(--text3)";
}

function previewFotos(input) {
  const files = Array.from(input.files);
  const container = document.getElementById("fotos-preview");
  for (const file of files) {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      notify("❌ " + file.name + " supera los " + MAX_SIZE_MB + "MB");
      continue;
    }
    if (_fotasPendientes.length >= MAX_FOTOS) {
      notify("❌ Máximo " + MAX_FOTOS + " fotos por orden");
      break;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const id = "fp-" + Date.now() + Math.random().toString(36).slice(2);
      _fotasPendientes.push({
        id,
        file,
        dataUrl: e.target.result,
        name: file.name,
      });
      const div = document.createElement("div");
      div.id = id;
      div.style.cssText = "position:relative;width:80px";
      div.innerHTML = `<img src="${e.target.result}" style="width:80px;height:80px;object-fit:cover;border-radius:6px;border:1px solid var(--border)">
        <button onclick="quitarFotaPendiente('${id}')" style="position:absolute;top:-6px;right:-6px;background:#ff1744;border:none;color:#fff;border-radius:50%;width:18px;height:18px;font-size:11px;cursor:pointer;padding:0">✕</button>
        <div style="font-size:8px;color:var(--text3);text-align:center;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:80px">${file.name.slice(0, 12)}</div>`;
      container.appendChild(div);
      actualizarContador();
    };
    reader.readAsDataURL(file);
  }
  input.value = "";
}

function quitarFotaPendiente(id) {
  _fotasPendientes = _fotasPendientes.filter((f) => f.id !== id);
  document.getElementById(id)?.remove();
  actualizarContador();
}

function comprimirImagen(dataUrl, calidad) {
  calidad = calidad || 0.75;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxW = 1920;
      const ratio = Math.min(1, maxW / img.width);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", calidad));
    };
    img.src = dataUrl;
  });
}

async function subirFotasOrden(ordenId) {
  if (!_fotasPendientes.length || !_syncEnabled) return;
  notify("📷 Subiendo " + _fotasPendientes.length + " foto(s) a Drive...");
  let subidas = 0;
  for (const fota of _fotasPendientes) {
    try {
      const compressed = await comprimirImagen(fota.dataUrl, 0.75);
      const base64 = compressed.split(",")[1];
      // Usar POST para fotos (base64 es demasiado largo para URL)
      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "subirFoto",
          collection: ordenId,
          payload: {
            nombre: fota.name,
            base64,
            mimeType: fota.file.type || "image/jpeg",
          },
        }),
        redirect: "follow",
      });
      const text = await res.text();
      const data = JSON.parse(text);
      if (data.ok) subidas++;
    } catch (e) {
      console.warn("Error subiendo foto:", e);
    }
  }
  _fotasPendientes = [];
  document.getElementById("fotos-preview").innerHTML = "";
  actualizarContador();
  notify("✅ " + subidas + " foto(s) guardadas en Drive");
}

async function cargarFotasExpediente(ordenId) {
  const container = document.getElementById("exp-fotos");
  if (!container) return;
  if (!_syncEnabled) {
    container.innerHTML =
      '<div style="color:var(--text3);font-size:11px">Sin conexión a Drive</div>';
    return;
  }
  container.innerHTML =
    '<div style="color:var(--text3);font-size:11px">Cargando fotos...</div>';
  try {
    const params = new URLSearchParams({
      action: "obtenerFotos",
      collection: ordenId,
    });
    const res = await fetch(APPS_SCRIPT_URL + "?" + params.toString(), {
      method: "GET",
      redirect: "follow",
    });
    const data = await res.json();
    if (data.fotos && data.fotos.length > 0) {
      container.innerHTML = data.fotos
        .map(
          (f) =>
            `<div style="position:relative;width:80px">
          <a href="${f.url}" target="_blank"><img src="${f.thumbnail}" style="width:80px;height:80px;object-fit:cover;border-radius:6px;border:1px solid var(--border);cursor:pointer" title="${f.nombre}"></a>
          <button onclick="eliminarFota('${ordenId}','${f.id}','${f.nombre}')" style="position:absolute;top:-6px;right:-6px;background:#ff1744;border:none;color:#fff;border-radius:50%;width:18px;height:18px;font-size:11px;cursor:pointer;padding:0">✕</button>
          <a href="${f.url}" target="_blank" style="display:block;text-align:center;font-size:8px;color:var(--accent2);margin-top:2px;text-decoration:none">⬇ Ver</a>
        </div>`,
        )
        .join("");
    } else {
      container.innerHTML =
        '<div style="color:var(--text3);font-size:11px;padding:8px 0">Sin fotos aún</div>';
    }
  } catch (e) {
    container.innerHTML =
      '<div style="color:var(--text3);font-size:11px">Error al cargar fotos</div>';
  }
}

async function subirFotosExpediente(input) {
  const ordenId = document.getElementById("exp-tit")?.dataset?.id;
  const notificarCliente = document.getElementById("exp-notificar")?.checked;
  console.log("NOTIFICAR CLIENTE:", notificarCliente);

  if (!ordenId) return;
  const files = Array.from(input.files);
  for (const file of files) {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      notify("❌ " + file.name + " supera los " + MAX_SIZE_MB + "MB");
      continue;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const compressed = await comprimirImagen(e.target.result, 0.75);
      const base64 = compressed.split(",")[1];
      console.log(
        "VISIBLE FOTO:",
        document.getElementById("exp-foto-visible")?.checked,
      );
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "subirFoto",
          collection: ordenId,
          payload: {
            nombre: file.name,
            base64,
            mimeType: file.type || "image/jpeg",

            usuario: currentUser?.nombre || "",

            email: currentUser?.email || "",
            visible_cliente:
              document.getElementById("exp-foto-visible")?.checked || false,
          },
        }),
        redirect: "follow",
      });
      notify("📷 Foto subida ✅");

      bitacora(ordenId, "Evidencia agregada", file.name);

      console.log("FOTO SUBIDA A:", ordenId);
      const orden = DB.get("ordenes").find((o) => o.id === ordenId);

      console.log("TICKET DE FOTO:", orden?.ticket_id);

      const cliente = DB.get("clientes").find(
        (c) => c.id === orden?.cliente_id,
      );

      if (notificarCliente && cliente?.email) {
        console.log("TICKET:", ticket);
        console.log("CLIENTE:", cliente);
        console.log("EMAIL:", cliente?.email);

        const envio = await API.call("notificarEvidencia", null, {
          correo: cliente.email,
          cliente: cliente.nombre,
          folio: orden.folio,
        });

        console.log("ENVIO EVIDENCIA TICKET:", envio);

        console.log("ENVIO EVIDENCIA:", envio);
      }

      if (orden?.ticket_id) {
        await API.save("ticketcomentarios", {
          id: "TC-" + Date.now(),

          ticket_id: orden.ticket_id,

          fecha: hoy(),

          fecha_hora: new Date().toISOString(),

          autor: "ARABOT",
          autor_tipo: "ARABOT",

          comentario: "📷 Evidencia agregada a la orden " + ordenId,

          visible_cliente: false,

          notificar_cliente: false,
        });
      }

      cargarFotasExpediente(ordenId);
    };
    reader.readAsDataURL(file);
  }
  input.value = "";
}

async function eliminarFota(ordenId, fotoId, fotoNombre) {
  if (!confirm("¿Eliminar esta foto?")) return;

  const resp = await fetch(APPS_SCRIPT_URL, {
    method: "POST",

    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },

    body: JSON.stringify({
      action: "eliminarFotoLogica",

      payload: {
        fotoId: fotoId,

        usuario: currentUser?.nombre || "",
      },
    }),
  });

  const data = await resp.json();

  console.log("ELIMINAR LOGICA:", data);

  notify("Foto eliminada ✅");
  bitacora(ordenId, "Evidencia eliminada", fotoNombre);
  cargarFotasExpediente(ordenId);
}

window.actualizarContador = actualizarContador;

window.previewFotos = previewFotos;
window.quitarFotaPendiente = quitarFotaPendiente;

window.comprimirImagen = comprimirImagen;

window.subirFotasOrden = subirFotasOrden;

window.cargarFotasExpediente = cargarFotasExpediente;

window.subirFotosExpediente = subirFotosExpediente;

window.eliminarFota = eliminarFota;
