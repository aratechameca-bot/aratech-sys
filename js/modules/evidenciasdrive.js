// ============================================================
// FOTOS DE EVIDENCIA — Firebase Storage
// ============================================================

const MAX_FOTOS = 10;
const MAX_SIZE_MB = 5;
const MIME_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];

let _fotosPendientes = [];

// Evita múltiples aperturas de cámara/galería
let _capturaAbierta = false;

function actualizarContador() {
  const el = document.getElementById("fotos-contador");
  if (!el) return;
  const n = _fotosPendientes.length;
  el.textContent = n + " / 10 fotos";
  el.style.color = n >= 10 ? "#ff1744" : n >= 7 ? "#ffd600" : "var(--text3)";
}

function previewFotos(input) {
  const files = Array.from(input.files);
  const fotosAgregadas = files.length;
  const container = document.getElementById("fotos-preview");

  for (const file of files) {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      notify("❌ " + file.name + " supera los " + MAX_SIZE_MB + "MB");
      continue;
    }

    if (!MIME_PERMITIDOS.includes(file.type)) {
      notify("❌ " + file.name + " no es un formato de imagen permitido");
      continue;
    }

    if (_fotosPendientes.length >= MAX_FOTOS) {
      notify("❌ Máximo " + MAX_FOTOS + " fotos por orden");
      break;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const id = "fp-" + Date.now() + Math.random().toString(36).slice(2);

      _fotosPendientes.push({
        id,
        file,
        dataUrl: e.target.result,
        name: file.name,
      });

      const div = document.createElement("div");

      div.id = id;

      div.style.cssText = "position:relative;width:80px";

      div.innerHTML = `
        <img
          src="${e.target.result}"
          style="width:80px;height:80px;object-fit:cover;border-radius:6px;border:1px solid var(--border)">

        <button
          onclick="quitarFotoPendiente('${id}')"
          style="position:absolute;top:-6px;right:-6px;background:#ff1744;border:none;color:#fff;border-radius:50%;width:18px;height:18px;font-size:11px;cursor:pointer;padding:0">
          ✕
        </button>

        <div
          style="font-size:8px;color:var(--text3);text-align:center;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:80px">
          ${file.name.slice(0, 12)}
        </div>
      `;

      container.appendChild(div);

      actualizarContador();

      mostrarFotoAgregada(
        fotosAgregadas === 1
          ? "📸 Se agregó 1 fotografía"
          : `📸 Se agregaron ${fotosAgregadas} fotografías`,
      );
    };

    reader.readAsDataURL(file);
  }

  // Permitir volver a seleccionar la misma foto
  // o abrir nuevamente la cámara
  setTimeout(() => {
    input.value = "";
  }, 100);
}

function quitarFotoPendiente(id) {
  _fotosPendientes = _fotosPendientes.filter((f) => f.id !== id);
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

function abrirCamaraOrden() {
  if (_capturaAbierta) return;

  if (_fotosPendientes.length >= MAX_FOTOS) {
    notify("❌ Máximo " + MAX_FOTOS + " fotografías por orden.");

    return;
  }

  const cam = document.getElementById("ord-camara");

  if (!cam) return;

  _capturaAbierta = true;

  cam.value = "";

  cam.click();

  setTimeout(() => {
    _capturaAbierta = false;
  }, 800);
}

function abrirGaleriaOrden() {
  if (_fotosPendientes.length >= MAX_FOTOS) {
    notify("❌ Máximo " + MAX_FOTOS + " fotografías por orden.");

    return;
  }

  const galeria = document.getElementById("ord-fotos");

  if (!galeria) return;

  galeria.value = "";

  galeria.click();
}

function mostrarFotoAgregada(texto = "✅ Foto agregada") {
  const msg = document.getElementById("foto-agregada-msg");

  if (!msg) return;

  clearTimeout(msg._timer);

  msg.textContent = texto;

  msg.style.display = "block";

  requestAnimationFrame(() => {
    msg.style.opacity = "1";
  });

  msg._timer = setTimeout(() => {
    msg.style.opacity = "0";

    setTimeout(() => {
      msg.style.display = "none";
    }, 250);
  }, 1200);
}

async function subirFotosOrden(ordenId) {
  if (!_fotosPendientes.length) return;
  notify("📷 Subiendo " + _fotosPendientes.length + " foto(s)...");
  let subidas = 0;
  for (const foto of _fotosPendientes) {
    try {
      const compressed = await comprimirImagen(foto.dataUrl, 0.75);
      const base64 = compressed.split(",")[1];
      const result = await API.callFunction("subirFoto", {
        collection: ordenId,
        payload: {
          nombre: foto.name,
          base64,
          mimeType: foto.file.type || "image/jpeg",
          usuario: currentUser?.nombre || "",
          visible_cliente: false,
        },
      });

      if (result?.ok) subidas++;
    } catch (e) {
      console.warn("Error subiendo foto:", e);
    }
  }
  _fotosPendientes = [];
  document.getElementById("fotos-preview").innerHTML = "";
  actualizarContador();
  notify("✅ " + subidas + " foto(s) guardadas correctamente");
}

async function cargarFotosExpediente(ordenId) {
  const container = document.getElementById("exp-fotos");
  if (!container) return;
  container.innerHTML =
    '<div style="color:var(--text3);font-size:11px">Cargando fotos...</div>';
  try {
    const data = await FB.callFunction("obtenerFotos", {
      collection: ordenId,
    });

    if (data.fotos && data.fotos.length > 0) {
      container.innerHTML = data.fotos
        .map(
          (f) => `
            <div style="position:relative;width:80px">

              <a href="${f.url}" target="_blank">
                <img
                src="${f.url}"
                  style="width:80px;height:80px;object-fit:cover;border-radius:6px;border:1px solid var(--border);cursor:pointer"
                  title="${f.nombre}">
              </a>

              <button
                onclick="eliminarFoto('${ordenId}','${f.id}','${f.nombre}')"
                style="position:absolute;top:-6px;right:-6px;background:#ff1744;border:none;color:#fff;border-radius:50%;width:18px;height:18px;font-size:11px;cursor:pointer;padding:0">
                ✕
              </button>

              <a
                href="${f.url}"
                target="_blank"
                style="display:block;text-align:center;font-size:8px;color:var(--accent2);margin-top:2px;text-decoration:none">
                ⬇ Ver
              </a>

            </div>
          `,
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
      const result = await FB.callFunction("subirFoto", {
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
      });

      if (!result?.ok) {
        throw new Error(result?.error || "Error subiendo foto");
      }
      notify("📷 Foto subida ✅");

      bitacora(ordenId, "Evidencia agregada", file.name);

      console.log("FOTO SUBIDA A:", ordenId);
      const orden = DB.get("ordenes").find((o) => o.id === ordenId);

      console.log("TICKET DE FOTO:", orden?.ticket_id);

      const cliente = DB.get("clientes").find(
        (c) => c.id === orden?.cliente_id,
      );

      if (notificarCliente && cliente?.email) {
        console.log("CLIENTE:", cliente);
        console.log("EMAIL:", cliente?.email);

        const envio = await FB.callFunction("notificarEvidencia", {
          correo: cliente.email,
          cliente: cliente.nombre,
          folio: orden.folio,
        });

        console.log("ENVIO EVIDENCIA:", envio);
      }

      if (orden?.ticket_id) {
        const comentarioArabot = {
          id: "TC-" + Date.now(),

          ticket_id: orden.ticket_id,

          fecha: hoy(),

          fecha_hora: new Date().toISOString(),

          autor: "ARABOT",
          autor_tipo: "ARABOT",

          comentario: "📷 Evidencia agregada a la orden " + ordenId,

          visible_cliente: false,

          notificar_cliente: false,
        };

        await DATA.save(
          "ticketcomentarios",
          comentarioArabot.id,
          comentarioArabot,
        );
      }

      cargarFotosExpediente(ordenId);
    };
    reader.readAsDataURL(file);
  }
  input.value = "";
}

async function eliminarFoto(ordenId, fotoId, fotoNombre) {
  const ok = await ARABOT.confirm({
    title: "Eliminar evidencia",

    message: "¿Deseas eliminar esta fotografía?",

    details:
      "La evidencia dejará de estar disponible y esta acción no podrá deshacerse.",
  });

  if (!ok) return;

  const data = await FB.callFunction("eliminarFotoLogica", {
    foto_id: fotoId,
    usuario: currentUser?.nombre || "",
  });

  console.log("ELIMINAR LOGICA:", data);

  notify("Foto eliminada ✅");
  bitacora(ordenId, "Evidencia eliminada", fotoNombre);
  cargarFotosExpediente(ordenId);
}

window.actualizarContador = actualizarContador;

window.previewFotos = previewFotos;
window.quitarFotoPendiente = quitarFotoPendiente;

window.comprimirImagen = comprimirImagen;

window.subirFotosOrden = subirFotosOrden;

window.cargarFotosExpediente = cargarFotosExpediente;

window.subirFotosExpediente = subirFotosExpediente;

window.eliminarFoto = eliminarFoto;
