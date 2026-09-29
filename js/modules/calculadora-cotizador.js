// ============================================================
// CALCULADORA DE FACTURA
// ============================================================
// ============================================================
// COTIZADOR FORMAL — Variables y funciones
// ===========================================================

function cotInit() {
  // Actualizar preview de folio
  const folios = DB.obj("folios");
  const next = (folios["ARCOT"] || 0) + 1;
  const el = document.getElementById("cot-folio-preview");
  if (el) el.textContent = "ARCOT-" + String(next).padStart(4, "0");

  // Llenar selects rápidos
  const cat = DB.get("cat");
  const inv = DB.get("inventario");
  const catSel = document.getElementById("cot-cat-sel");
  const invSel = document.getElementById("cot-inv-sel");
  if (catSel) {
    catSel.innerHTML = '<option value="">+ Del catálogo de servicios</option>';
    cat.forEach((s) => {
      const o = document.createElement("option");
      o.value = JSON.stringify({
        desc: s.nombre,
        precio: s.precio || 0,
        tipo: "Servicio",
      });
      o.textContent = s.nombre + (s.precio ? " — " + mxn(s.precio) : "");
      catSel.appendChild(o);
    });
  }
  if (invSel) {
    invSel.innerHTML = '<option value="">+ Del inventario</option>';
    inv
      .filter((i) => i.stock > 0)
      .forEach((i) => {
        const o = document.createElement("option");
        o.value = JSON.stringify({
          desc: i.nombre,
          precio: i.precio_venta || 0,
          tipo: "Producto",
        });
        o.textContent =
          i.nombre + (i.precio_venta ? " — " + mxn(i.precio_venta) : "");
        invSel.appendChild(o);
      });
  }

  // Verificar vencimiento de cotizaciones existentes
  cotVerificarVencidas();
  cotRender(DB.get("cotizaciones"));
}

function cotVerificarVencidas() {
  const cots = DB.get("cotizaciones");
  let changed = false;
  cots.forEach((c) => {
    if (c.estado === "Pendiente") {
      const emision = new Date(c.fecha);
      const ahora = new Date();
      const diffHrs = (ahora - emision) / (1000 * 60 * 60);
      if (diffHrs >= 72) {
        c.estado = "Vencida";
        changed = true;
      }
    }
  });
  if (changed) {
    DB.set("cotizaciones", cots);
  }
}

function cotDesdecat(sel) {
  if (!sel.value) return;
  try {
    const d = JSON.parse(sel.value);
    document.getElementById("cot-desc").value = d.desc;
    document.getElementById("cot-precio").value = d.precio;
    document.getElementById("cot-tipo").value = d.tipo;
    document.getElementById("cot-cant").value = 1;
  } catch {}
  sel.value = "";
}

function cotDesdeInv(sel) {
  if (!sel.value) return;
  try {
    const d = JSON.parse(sel.value);
    document.getElementById("cot-desc").value = d.desc;
    document.getElementById("cot-precio").value = d.precio;
    document.getElementById("cot-tipo").value = "Producto";
    document.getElementById("cot-cant").value = 1;
  } catch {}
  sel.value = "";
}

function cotAgregar() {
  const desc = document.getElementById("cot-desc").value.trim();
  const tipo = document.getElementById("cot-tipo").value.trim();
  const cant = parseInt(document.getElementById("cot-cant").value) || 1;
  const precioUnit =
    parseFloat(document.getElementById("cot-precio").value) || 0;
  if (!desc) {
    notify("❌ Ingresa la descripción del concepto");
    return;
  }

  if (!tipo) {
    notify("❌ Selecciona o captura el tipo del concepto");

    return;
  }

  if (!precioUnit) {
    notify("❌ Ingresa el precio unitario");
    return;
  }

  // ==========================================
  // El precio capturado SIEMPRE es SIN IVA
  // ==========================================

  const aplicaIVA = document.getElementById("cot-aplica-iva")?.checked ?? true;

  const base = precioUnit * cant;

  const iva = aplicaIVA ? base * 0.16 : 0;

  const totalConIva = base + iva;

  _cotConceptos.push({
    desc,

    tipo,

    cant,

    precioUnit,

    aplicaIVA,

    totalConIva,

    base,

    iva,

    // =====================================
    // Referencias reales del origen
    // =====================================

    sku: window.cotSkuSeleccionado || "",

    itemId: window.cotItemSeleccionado || "",

    origen: window.cotOrigenSeleccionado || "",
  });

  // =====================================
  // Limpiar selección temporal
  // =====================================

  window.cotSkuSeleccionado = "";
  window.cotItemSeleccionado = "";
  window.cotOrigenSeleccionado = "MANUAL";
  document.getElementById("cot-desc").value = "";
  document.getElementById("cot-precio").value = "";
  document.getElementById("cot-cant").value = 1;
  document.getElementById("cot-precio").readOnly = false;

  cotRenderTablaForm();
}

function cotEliminarConcepto(i) {
  _cotConceptos.splice(i, 1);
  cotRenderTablaForm();
}

function cotRenderTablaForm() {
  const tabla = document.getElementById("cot-tabla");
  const totDiv = document.getElementById("cot-totales");
  if (!tabla) return;

  if (!_cotConceptos.length) {
    tabla.innerHTML =
      '<div style="text-align:center;color:rgba(125,211,252,0.35);font-size:12px;padding:20px">Agrega conceptos para generar la cotización</div>';
    if (totDiv) totDiv.style.display = "none";
    return;
  }

  let totBase = 0,
    totIva = 0,
    totTotal = 0;

  tabla.innerHTML = `
    <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:4px">
      <thead>
        <tr style="border-bottom:1px solid rgba(14,165,233,0.25)">
          <th style="text-align:left;padding:8px 8px;color:#7dd3fc;font-weight:600;font-size:10px;letter-spacing:0.5px">DESCRIPCIÓN</th>
          <th style="text-align:center;padding:8px 8px;color:#7dd3fc;font-weight:600;font-size:10px">TIPO</th>
          <th style="text-align:center;padding:8px 8px;color:#7dd3fc;font-weight:600;font-size:10px">CANT</th>
          <th style="text-align:right;padding:8px 8px;color:#7dd3fc;font-weight:600;font-size:10px">P. UNIT</th>
          <th style="text-align:right;padding:8px 8px;color:#7dd3fc;font-weight:600;font-size:10px">TOTAL</th>
          <th style="width:30px"></th>
        </tr>
      </thead>
      <tbody>
        ${_cotConceptos
          .map((x, i) => {
            totBase += x.base;
            totIva += x.iva;
            totTotal += x.totalConIva;
            return `<tr style="border-bottom:1px solid rgba(255,255,255,0.04)">
            <td style="padding:8px 8px;color:#fff">${x.desc}</td>
            <td style="padding:8px 8px;text-align:center;color:#94a3b8;font-size:11px">${x.tipo}</td>
            <td style="padding:8px 8px;text-align:center;color:#fff">${x.cant}</td>
            <td style="padding:8px 8px;text-align:right;color:#fff">${mxn(x.precioUnit)}</td>
            <td style="padding:8px 8px;text-align:right;color:#0ea5e9;font-weight:600">${mxn(x.base)}</td>
            <td style="padding:8px 4px;text-align:center">
              <button onclick="cotEliminarConcepto(${i})" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:14px;padding:2px 6px" title="Eliminar">🗑️</button>
            </td>
          </tr>`;
          })
          .join("")}
      </tbody>
    </table>`;

  // Actualizar totales (el cálculo se hace en el map anterior)
  // ==========================================
  // Recalcular totales
  // ==========================================

  totBase = 0;
  totIva = 0;
  totTotal = 0;

  const aplicaIVA = document.getElementById("cot-aplica-iva")?.checked ?? true;

  _cotConceptos.forEach((x) => {
    // El subtotal SIEMPRE es el precio base

    totBase += Number(x.base || 0);
  });

  if (totDiv) {
    totDiv.style.display = "block";
    // ==========================================
    // Aplicar descuento
    // ==========================================

    // ==========================================
    // Totales oficiales
    // El precio SIEMPRE es SIN IVA
    // ==========================================

    const descuento =
      parseFloat(document.getElementById("cot-descuento")?.value) || 0;

    // Los conceptos siempre vienen SIN IVA
    const subtotalMostrar = Math.max(0, totBase - descuento);

    // IVA solamente cuando el check está activo
    const ivaMostrar = aplicaIVA ? subtotalMostrar * 0.16 : 0;

    // Total final
    const totalMostrar = subtotalMostrar + ivaMostrar;

    document.getElementById("cot-tot-base").textContent = mxn(subtotalMostrar);

    document.getElementById("cot-tot-iva").textContent = aplicaIVA
      ? mxn(ivaMostrar)
      : "No aplica";

    document.getElementById("cot-tot-total").textContent = mxn(totalMostrar);
  }
}

// ============================================================
// Actualizar cálculo al cambiar IVA
// ============================================================

function cotActualizarIVA() {
  if (!_cotConceptos.length) return;

  cotRenderTablaForm();
}

function cotLimpiar() {
  _cotConceptos = [];
  [
    "cot-cliente",
    "cot-tel",
    "cot-email",
    "cot-desc",
    "cot-precio",
    "cot-notas",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  const cant = document.getElementById("cot-cant");
  if (cant) cant.value = 1;
  cotRenderTablaForm();
}

async function cotGenerar() {
  const cliente = document.getElementById("cot-cliente").value.trim();
  if (!cliente) {
    notify("❌ Ingresa el nombre del cliente");
    return;
  }
  if (!_cotConceptos.length) {
    notify("❌ Agrega al menos un concepto");
    return;
  }

  // Generar folio y guardar
  const folio = await API.getFolio("ARCOT");
  const ahora = new Date();
  const fechaISO = ahora.toISOString();

  let totBase = 0;

  _cotConceptos.forEach((x) => {
    totBase += Number(x.base || 0);
  });

  const aplicaIVA = document.getElementById("cot-aplica-iva")?.checked ?? true;

  const descuento =
    parseFloat(document.getElementById("cot-descuento")?.value) || 0;

  const subtotal = Math.max(0, totBase - descuento);

  const iva = aplicaIVA ? subtotal * 0.16 : 0;

  const total = subtotal + iva;
  const cotizacion = {
    // Identificación
    id: folio,
    folio,

    // Fechas
    fecha: fechaISO,

    fecha_envio: fechaISO,
    fecha_vencimiento: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    // Cliente
    cliente_id: document.getElementById("cot-cliente-id")?.value || "",

    cliente,

    tel: document.getElementById("cot-tel").value.trim(),

    email: document.getElementById("cot-email").value.trim(),

    // Conceptos
    conceptos: _cotConceptos.map((x) => ({ ...x })),

    notas: document.getElementById("cot-notas").value.trim(),

    // Importes
    subtotal: subtotal,

    descuento: descuento,

    iva: iva,

    total: total,

    aplicaIVA,

    // Estado
    estado: "Enviada",

    venta_generada: false,
  };

  // Guardar en DB local
  const cots = DB.get("cotizaciones");

  cots.push(cotizacion);

  DB.set("cotizaciones", cots);

  // =====================================
  // Sync Firestore
  // =====================================

  await DATA.save("cotizaciones", cotizacion.id, cotizacion);

  // Actualizar historial
  cotRender(DB.get("cotizaciones"));

  // Actualizar preview folio
  const folioEl = document.getElementById("cot-folio-preview");
  if (folioEl) {
    const f2 = DB.obj("folios");
    const next = (f2["ARCOT"] || 0) + 1;
    folioEl.textContent = "ARCOT-" + String(next).padStart(4, "0");
  }

  notify("✅ Cotización " + folio + " guardada");

  // Abrir impresión
  prtCotizacion(cotizacion);
}

async function cotCambiarEstado(id, estado) {
  const cots = DB.get("cotizaciones");

  const idx = cots.findIndex((c) => c.id === id);

  if (idx < 0) return;

  // ==========================================
  // Una cotización vendida ya no puede cambiar
  // ==========================================

  if (cots[idx].venta_generada || cots[idx].estado === "Vendida") {
    notify("Esta cotización ya fue convertida en una venta.");

    cotRender(cots);

    return;
  }

  cots[idx].estado = estado;

  DB.set("cotizaciones", cots);

  await DATA.update("cotizaciones", cots[idx].id, cots[idx]);

  cotRender(cots);

  notify("✅ Estado actualizado: " + estado);
}

function cotReimprimir(id) {
  const cots = DB.get("cotizaciones");
  const c = cots.find((x) => x.id === id);
  if (!c) return;
  prtCotizacion(c);
}

function cotFiltrar() {
  const q = (document.getElementById("cot-search")?.value || "").toLowerCase();
  const est = document.getElementById("cot-flt-est")?.value || "";
  cotVerificarVencidas();
  const data = DB.get("cotizaciones").filter(
    (c) =>
      (!q ||
        c.folio.toLowerCase().includes(q) ||
        c.cliente.toLowerCase().includes(q)) &&
      (!est || c.estado === est),
  );
  cotRender(data);
}

function cotRender(lista) {
  const data = lista || DB.get("cotizaciones");
  const tb = document.getElementById("tb-cot");
  if (!tb) return;
  if (!data.length) {
    tb.innerHTML =
      '<tr><td colspan="6" style="text-align:center;color:rgba(125,211,252,0.35);padding:24px;font-size:12px">Sin cotizaciones generadas</td></tr>';
    return;
  }
  const colorEst = {
    Pendiente: "#f59e0b",

    Enviada: "#3b82f6",

    Aceptada: "#10b981",

    Vendida: "#22c55e",

    Rechazada: "#ef4444",

    Vencida: "#64748b",
  };
  tb.innerHTML = data
    .slice()
    .reverse()
    .map(
      (c) => `
    <tr style="border-bottom:1px solid rgba(255,255,255,0.04)">
      <td style="padding:10px 12px;font-family:var(--fh);color:#0ea5e9;font-size:11px">${c.folio}</td>
      <td style="padding:10px 12px;font-size:11px;color:#94a3b8">${fmt(c.fecha)}</td>
      <td style="padding:10px 12px"><b style="color:#fff">${c.cliente}</b><br><span style="font-size:10px;color:#64748b">${c.tel || ""}</span></td>
      <td style="padding:10px 12px;text-align:right;color:#10b981;font-weight:700;font-family:var(--fh)">${mxn(c.total)}</td>
      <td style="padding:10px 12px;text-align:center">
        <select
          onchange="cotCambiarEstado('${c.id}', this.value)"
          ${c.venta_generada || c.estado === "Vendida" ? "disabled" : ""}

          style="
              background:#0b1528;
              border:1px solid rgba(255,255,255,.15);
              border-radius:5px;
              padding:4px 8px;
              font-size:11px;
              font-weight:600;
              color:${colorEst[c.estado] || "#fff"};
              cursor:${c.venta_generada || c.estado === "Vendida" ? "default" : "pointer"};
              outline:none;
              opacity:1;
          ">


          <option
              value="Enviada"
              ${c.estado === "Enviada" ? "selected" : ""}>
              🟢 Enviada
          </option>

          <option
              value="Vista"
              ${c.estado === "Vista" ? "selected" : ""}>
              🟡 Vista
          </option>

          <option
              value="Aceptada"
              ${c.estado === "Aceptada" ? "selected" : ""}>
              🔵 Aceptada
          </option>

          <option
              value="Rechazada"
              ${c.estado === "Rechazada" ? "selected" : ""}>
              🔴 Rechazada
          </option>

          <option
              value="Vencida"
              ${c.estado === "Vencida" ? "selected" : ""}>
              ⚪ Vencida
          </option>

          <option
              value="Vendida"
              ${c.estado === "Vendida" ? "selected" : ""}>

              🛒 Vendida

          </option>

      </select>
      </td>
      
      <td style="padding:10px 12px;text-align:center">

    <div
        style="
            display:flex;
            justify-content:center;
            align-items:center;
            gap:6px;
            flex-wrap:nowrap;
        ">

        <button
            onclick="cotReimprimir('${c.id}')"

            style="
                width:140px;
                background:rgba(14,165,233,.15);
                border:1px solid rgba(14,165,233,.30);
                border-radius:6px;
                padding:6px 10px;
                color:#0ea5e9;
                cursor:pointer;
                font-size:11px;
            ">

            <i class="ar-icon printer"></i> Reimprimir

        </button>

       ${
         c.venta_generada
           ? `
      <button
          disabled
          style="
              background:rgba(16,185,129,.15);
              border:1px solid rgba(16,185,129,.30);
              border-radius:6px;
              padding:5px 10px;
              color:#10b981;
              font-size:11px;
              cursor:default;
          ">
          <i class="ar-icon success"></i> Venta
      </button>
    `
           : c.estado === "Aceptada"
             ? `
      <button
          onclick="cotConvertirVenta('${c.id}')"
          style="
              background:rgba(16,185,129,.15);
              border:1px solid rgba(16,185,129,.30);
              border-radius:6px;
              padding:5px 10px;
              color:#10b981;
              cursor:pointer;
              font-size:11px;
          ">
          <i class="ar-icon ventas"></i> Venta
      </button>
    `
             : ""
       }

    </div>

</td>
    </tr>`,
    )
    .join("");
  window.initIcons();
}

function prtCotizacion(cot) {
  const c = cfg();
  const fechaEmision = cot.fecha
    ? new Date(cot.fecha + "T12:00").toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
  const fechaVigencia = cot.fecha
    ? (() => {
        const d = new Date(cot.fecha + "T" + (cot.hora || "00:00:00"));
        d.setHours(d.getHours() + 72);
        return (
          d.toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }) +
          " " +
          d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
        );
      })()
    : "72 horas";

  let totBase = 0,
    totIva = 0,
    totTotal = 0;
  (cot.conceptos || []).forEach((x) => {
    totBase += x.base;
    totIva += x.iva;
    totTotal += x.totalConIva;
  });

  const conceptosHTML = (cot.conceptos || [])
    .map(
      (x, i) => `
  
    <tr style="background:${i % 2 === 0 ? "#fff" : "#f8fafc"}">
      <td style="padding:9px 12px;color:#1a1a2e;font-size:11px">${x.desc}</td>
      <td style="padding:9px 12px;text-align:center;color:#64748b;font-size:10px">${x.tipo}</td>
      <td style="padding:9px 12px;text-align:center;color:#1a1a2e;font-size:11px">${x.cant}</td>
      <td style="padding:9px 12px;text-align:right;color:#1a1a2e;font-size:11px">$${x.precioUnit.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      <td style="padding:9px 12px;text-align:right;color:#0a2540;font-weight:700;font-size:11px">$${x.totalConIva.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
    </tr>`,
    )
    .join("");

  const printHTML = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<style>
    @import url('https://fonts.googleapis.com/css2?family=League+Spartan:wght@700;900&family=Montserrat:wght@300;400;500;600;700;800&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Montserrat',sans-serif;color:#1a1a2e;background:#fff;padding:0;font-size:11px}
    .page{max-width:800px;margin:0 auto;padding:28px 32px}
    /* Header */
    .hdr{display:flex; align-items:center;justify-content:space-between;margin-bottom:24px;padding-bottom:18px;border-bottom:2px solid #e2e8f0}
    .hdr-left{

      display:flex;

      align-items:center;

      gap:16px;

      }
    /* ==============================
      LOGOS
    ============================== */

    .logo-header{

        width:72px;

        height:72px;

        object-fit:contain;

        flex-shrink:0;

        display:block;

    }

    .logo-onara{

        width:90px;

        height:auto;

        object-fit:contain;

        display:block;

    }

    .brand-name{font-family:'League Spartan',sans-serif;font-weight:900;font-size:28px;color:#0a2540;letter-spacing:2px}
    .brand-slogan{font-size:9px;color:#64748b;letter-spacing:2px;text-transform:uppercase;margin-top:2px}
    .hdr-right{text-align:right}
    .hdr-right div{font-size:10px;color:#475569;line-height:1.7}
    .hdr-right span{color:#0a2540;font-weight:600}
    /* Título del documento */
    .doc-header{display:flex;align-items:center;justify-content:space-between;background:#0a2540;padding:14px 22px;border-radius:10px;margin-bottom:20px;flex-wrap:nowrap;gap:12px}
    .doc-title{font-family:'League Spartan',sans-serif;font-weight:700;font-size:16px;color:#fff;letter-spacing:4px;white-space:nowrap;flex-shrink:0}
    .doc-meta{display:flex;gap:16px;flex-shrink:0}
    .doc-meta-item{text-align:right;min-width:80px}
    .doc-meta-label{font-size:7px;color:#75d0fa;letter-spacing:1px;text-transform:uppercase;margin-bottom:2px;white-space:nowrap}
    .doc-meta-val{font-size:11px;color:#fff;font-weight:700;font-family:'League Spartan',sans-serif;letter-spacing:0.5px;white-space:nowrap}
    /* Sección cliente */
    .section{margin-bottom:18px}
    .section-label{font-size:9px;color:#0ea5e9;letter-spacing:2px;text-transform:uppercase;font-weight:700;margin-bottom:8px;padding-bottom:5px;border-bottom:1px solid #e2e8f0}
    .client-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden}
    .client-cell{padding:10px 14px;border-right:1px solid #e2e8f0}
    .client-cell:last-child{border-right:none}
    .client-cell-label{font-size:8px;color:#94a3b8;letter-spacing:1px;text-transform:uppercase;margin-bottom:3px}
    .client-cell-val{font-size:12px;color:#0a2540;font-weight:600}
    /* Tabla conceptos */
    table{width:100%;border-collapse:collapse;margin-bottom:16px}
    thead tr{background:#0a2540}
    thead th{padding:9px 12px;color:#fff;text-align:left;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;font-family:'League Spartan',sans-serif;font-weight:700}
    thead th:not(:first-child){text-align:center}
    thead th:last-child{text-align:right}
    thead th:nth-child(4){text-align:right}
    tbody tr{border-bottom:1px solid #f1f5f9}
    /* Totales */
    .totales{display:flex;justify-content:flex-end;margin-bottom:20px}
    .totales-box{border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;min-width:260px}
    .tot-row{display:grid;grid-template-columns:1fr auto;padding:8px 16px;gap:24px}
    .tot-row:not(:last-child){border-bottom:1px solid #f1f5f9}
    .tot-row.final{background:#0a2540;padding:11px 16px}
    .tot-label{font-size:11px;color:#64748b}
    .tot-val{font-size:11px;color:#0a2540;font-weight:600;text-align:right}
    .tot-row.final .tot-label{color:#75d0fa;font-weight:700;font-size:12px}
    .tot-row.final .tot-val{color:#fff;font-weight:800;font-size:14px;font-family:'League Spartan',sans-serif}
    /* Notas */
    .notas-box{background:#f8fafc;border-left:3px solid #0ea5e9;border-radius:0 6px 6px 0;padding:10px 14px;margin-bottom:18px;font-size:10px;color:#475569;line-height:1.6}
    /* Firma */
    .firma-section{margin-bottom:24px}
    .firma-grid{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:50px}
    .firma-box{text-align:center}
    .firma-linea{border-top:1.5px solid #1a1a2e;margin-bottom:8px}
    .firma-label{font-size:9px;color:#64748b;letter-spacing:1px;text-transform:uppercase}
    .firma-name{font-size:10px;color:#1a1a2e;font-weight:600;margin-top:4px}
    /* Leyenda legal */
    .leyenda{background:#f8fafc;border-radius:6px;padding:12px 16px;margin-bottom:20px;font-size:9px;color:#64748b;line-height:1.7;border:1px solid #e2e8f0}
    .leyenda b{color:#0a2540}
    /* Footer onara */
    .footer{border-top:1px solid #e2e8f0;padding-top:14px;display:flex;justify-content:space-between;align-items:center}
    .footer-left{font-size:9px;color:#94a3b8}
    .footer-right{display:flex;flex-direction:column;align-items:center;gap:3px;opacity:0.45}
    @media print{body{padding:0}.no-print{display:none!important}}
  </style></head><body>
  <div class="page">

  <!-- HEADER -->
<div class="hdr">
  <div class="hdr-left">
  <img
    src="${ASSETS.LOGO_ARATECH}"
    alt="ARATECH"
    class="logo-header"
  >

  <div>
    <div class="brand-name">${c.nombre || "ARATECH"}</div>
    <div class="brand-slogan">${c.slogan || "Tecnología a tu servicio"}</div>
  </div>

  </div>

  <div class="hdr-right">
    <div>📍 <span>${c.dir || "Allende 246, Ameca, Jalisco"}</span></div>
    <div>📞 <span>${c.tel || "375 690 5296"}</span></div>
    <div>📷 <span>${c.ig || "@aratechameca"}</span></div>
  </div>
</div>
 
    <!-- TÍTULO + FOLIO + FECHAS -->
    <div class="doc-header">
      <div class="doc-title">C O T I Z A C I Ó N</div>
      <div class="doc-meta">
        <div class="doc-meta-item">
          <div class="doc-meta-label">Número</div>
          <div class="doc-meta-val">${cot.folio}</div>
        </div>
        <div class="doc-meta-item">
          <div class="doc-meta-label">Fecha de emisión</div>
          <div class="doc-meta-val" style="font-size:11px">${fechaEmision}</div>
        </div>
        <div class="doc-meta-item">
          <div class="doc-meta-label">Válida hasta</div>
          <div class="doc-meta-val" style="font-size:11px">${fechaVigencia}</div>
        </div>
      </div>
    </div>

    <!-- DATOS DEL CLIENTE -->
    <div class="section">
      <div class="section-label">Datos del cliente</div>
      <div class="client-grid">
        <div class="client-cell">
          <div class="client-cell-label">Nombre completo</div>
          <div class="client-cell-val">${cot.cliente || "—"}</div>
        </div>
        <div class="client-cell">
          <div class="client-cell-label">Teléfono</div>
          <div class="client-cell-val">${cot.tel || "—"}</div>
        </div>
        <div class="client-cell">
          <div class="client-cell-label">Correo electrónico</div>
          <div class="client-cell-val">${cot.email || "—"}</div>
        </div>
      </div>
    </div>

    <!-- TABLA DE CONCEPTOS -->
    <div class="section">
      <div class="section-label">Conceptos</div>
      <table>
        <thead>
          <tr>
            <th style="width:42%">Concepto / Descripción</th>
            <th style="width:13%">Tipo</th>
            <th style="width:8%">Cant.</th>
            <th style="width:16%">P. Unitario</th>
            <th style="width:16%">Total</th>
          </tr>
        </thead>
        <tbody>${conceptosHTML}</tbody>
      </table>
    </div>
  
    <!-- TOTALES -->
<div class="totales">
  <div class="totales-box">

    <div class="tot-row">
      <span class="tot-label">Subtotal</span>
      <span class="tot-val">
        $${totBase.toLocaleString("es-MX", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
    </div>

    ${
      cot.aplicaIVA
        ? `
    <div class="tot-row">
      <span class="tot-label">IVA (16%)</span>
      <span class="tot-val" style="color:#b45309">
        $${totIva.toLocaleString("es-MX", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
    </div>
    `
        : ""
    }

    <div class="tot-row final">
      <span class="tot-label">TOTAL</span>
      <span class="tot-val">
        $${totTotal.toLocaleString("es-MX", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
    </div>

  </div>
</div>

    ${cot.notas ? `<div class="notas-box"><b>Notas:</b> ${cot.notas}</div>` : ""}

  
    <!-- FIRMA -->
    <div class="firma-section">
      <div class="section-label">Aceptación</div>
      <div class="firma-grid">
        <div class="firma-box">
          <div class="firma-linea"></div>
          <div class="firma-label">Firma de aceptación del cliente</div>
          <div class="firma-name">${cot.cliente || ""}</div>
        </div>
        <div class="firma-box">
          <div class="firma-linea"></div>
          <div class="firma-label">Elaboró · ARATECH</div>
          <div class="firma-name">Representante autorizado</div>
        </div>
      </div>
    </div>

  


    <!-- LEYENDA LEGAL -->
    <div class="leyenda">
      Esta cotización tiene <b>validez de 72 horas</b> a partir de su fecha de emisión. Los precios pueden estar sujetos a cambios sin previo aviso derivados de variaciones en tipo de cambio o actualizaciones del proveedor. La disponibilidad de equipos y refacciones queda condicionada a existencia al momento de formalizar el servicio. Precios en pesos mexicanos (MXN), IVA desglosado en totales.
    </div>

    <!-- FOOTER -->
<div class="footer">
  <div class="footer-left">
    ${c.nombre || "ARATECH"} ·
    ${c.dir || "Allende 246, Ameca, Jalisco"} ·
    ${c.tel || "375 690 5296"} ·
    ${c.ig || "@aratechameca"}
  </div>

  <div class="footer-right">
    <img
      src="${ASSETS.ONARA_COLOR}"
      alt="ONARA"
      class="logo-onara"
    />
  </div>
</div>

<script>
window.onload = () => {
  window.print();
  setTimeout(() => window.close(), 800);
}
<\/script>

</body></html>`;

  const w = window.open("", "_blank");
  w.document.write(printHTML);
  w.document.close();
}

// ======================================================
// BUSCADOR DE CLIENTES PARA COTIZACIONES
// ======================================================

function cotBuscarCliente(texto = "") {
  const lista = document.getElementById("cot-cliente-resultados");

  if (!lista) return;

  const q = ARATECH.Validator.normalizeText(texto);

  const clientes = DB.get("clientes")
    .filter((c) =>
      [c.id, c.nombre, c.tel, c.email, c.rfc, c.razonSocial]
        .map((v) => ARATECH.Validator.normalizeText(v))
        .join(" ")
        .includes(q),
    )
    .slice(0, 10);

  if (!clientes.length) {
    lista.style.display = "none";
    lista.innerHTML = "";
    return;
  }

  lista.innerHTML = clientes
    .map(
      (c) => `

        <div

            onclick="cotSeleccionarCliente('${c.id}')"

            style="
                padding:10px 12px;
                cursor:pointer;
                border-bottom:1px solid rgba(255,255,255,.05);
            "

            onmouseenter="this.style.background='rgba(14,165,233,.15)'"
            onmouseleave="this.style.background='transparent'"

        >

            <div style="font-weight:600;color:#fff">

                ${c.nombre}

            </div>

            <div style="font-size:11px;color:#7dd3fc">

                ${c.tel || "Sin teléfono"}

                ${c.email ? " · " + c.email : ""}

            </div>

        </div>

    `,
    )
    .join("");

  lista.style.display = "block";
}

// ======================================================
// SELECCIONAR CLIENTE
// ======================================================

function cotSeleccionarCliente(id) {
  const cliente = DB.get("clientes").find((c) => c.id === id);

  if (!cliente) return;

  // Guardar ID
  document.getElementById("cot-cliente-id").value = cliente.id;

  // Nombre
  document.getElementById("cot-cliente").value = cliente.nombre || "";

  // Teléfono
  document.getElementById("cot-tel").value = cliente.tel || "";

  // Correo
  document.getElementById("cot-email").value = cliente.email || "";

  // Ocultar resultados
  const lista = document.getElementById("cot-cliente-resultados");

  lista.style.display = "none";
  lista.innerHTML = "";
  document.getElementById("cot-desc").focus();
}

// ======================================================
// NUEVO CLIENTE DESDE COTIZACIÓN
// Reutiliza el modal oficial de Órdenes
// ======================================================

function cotNuevoCliente() {
  window.COTIZACION_ABIERTA = true;

  abrirNuevoCliDesdeOrden();
}

// ======================================================
// CERRAR BUSCADOR DE CLIENTES
// ======================================================

document.addEventListener("click", function (e) {
  const input = document.getElementById("cot-cliente");
  const lista = document.getElementById("cot-cliente-resultados");

  if (!input || !lista) return;

  if (input.contains(e.target) || lista.contains(e.target)) {
    return;
  }

  lista.style.display = "none";
});

// ======================================================
// BUSCAR SERVICIOS
// ======================================================

function cotBuscarServicio(texto = "") {
  const lista = document.getElementById("cot-servicio-resultados");

  if (!lista) return;

  const q = ARATECH.Validator.normalizeText(texto);

  const servicios = DB.get("cat")

    .filter((s) => ARATECH.Validator.normalizeText(s.nombre).includes(q))

    .slice(0, 10);

  if (!servicios.length) {
    lista.innerHTML = "";
    lista.style.display = "none";
    return;
  }

  lista.innerHTML = servicios
    .map(
      (s) => `

        <div

            onclick="cotSeleccionarServicio('${s.id}')"

            style="
                padding:10px 12px;
                cursor:pointer;
                border-bottom:1px solid rgba(255,255,255,.05);
            "

            onmouseenter="this.style.background='rgba(14,165,233,.15)'"

            onmouseleave="this.style.background='transparent'"

        >

            <div
                style="
                    color:#fff;
                    font-weight:600;
                ">

                ${s.nombre}

            </div>

            <div
                style="
                    color:#7dd3fc;
                    font-size:11px;
                ">

                ${mxn(s.precio)}

            </div>

        </div>

    `,
    )
    .join("");

  lista.style.display = "block";
}

// ======================================================
// SELECCIONAR SERVICIO
// ======================================================

function cotSeleccionarServicio(id) {
  const servicio = DB.get("cat").find((s) => s.id === id);

  if (!servicio) return;

  document.getElementById("cot-desc").value = servicio.nombre;

  document.getElementById("cot-precio").value = servicio.precio;

  document.getElementById("cot-tipo").value = "Servicio";

  document.getElementById("cot-precio").readOnly = true;

  window.cotItemSeleccionado = servicio.id;

  window.cotOrigenSeleccionado = "CATALOGO";

  document.getElementById("cot-servicio").value = servicio.nombre;

  const lista = document.getElementById("cot-servicio-resultados");

  lista.style.display = "none";
  lista.innerHTML = "";

  document.getElementById("cot-cant").focus();

  document.getElementById("cot-servicio").value = "";

  document.getElementById("cot-servicio-resultados").innerHTML = "";

  document.getElementById("cot-servicio-resultados").style.display = "none";
}

// ======================================================
// BUSCAR PRODUCTOS
// ======================================================

function cotBuscarProducto(texto = "") {
  const lista = document.getElementById("cot-producto-resultados");

  if (!lista) return;

  const q = ARATECH.Validator.normalizeText(texto);

  const productos = DB.get("inventario")

    .filter((p) =>
      ARATECH.Validator.normalizeText(
        `${p.sku} ${p.nombre} ${p.marca || ""}`,
      ).includes(q),
    )

    .slice(0, 10);

  if (!productos.length) {
    lista.innerHTML = "";
    lista.style.display = "none";
    return;
  }

  lista.innerHTML = productos
    .map(
      (p) => `

        <div

            onclick="cotSeleccionarProducto('${p.sku}')"

            style="
                padding:10px 12px;
                cursor:pointer;
                border-bottom:1px solid rgba(255,255,255,.05);
            "

            onmouseenter="this.style.background='rgba(16,185,129,.15)'"

            onmouseleave="this.style.background='transparent'"

        >

            <div
                style="
                    color:#fff;
                    font-weight:600;
                ">

                ${p.nombre}

            </div>

            <div
                style="
                    color:#7dd3fc;
                    font-size:11px;
                ">

                SKU: ${p.sku}
                &nbsp;&nbsp;•&nbsp;&nbsp;
                ${mxn(p.precio)}
                &nbsp;&nbsp;•&nbsp;&nbsp;
                Stock: ${p.stock}

            </div>

        </div>

    `,
    )
    .join("");

  lista.style.display = "block";
}

// ======================================================
// SELECCIONAR PRODUCTO
// ======================================================

function cotSeleccionarProducto(sku) {
  const producto = DB.get("inventario").find((p) => p.sku === sku);

  if (!producto) return;

  document.getElementById("cot-desc").value = producto.nombre;

  document.getElementById("cot-precio").value = producto.precio;

  document.getElementById("cot-tipo").value = producto.cat || "Producto";

  document.getElementById("cot-precio").readOnly = true;

  window.cotSkuSeleccionado = producto.sku;

  window.cotOrigenSeleccionado = "INVENTARIO";

  document.getElementById("cot-producto").value = "";

  const lista = document.getElementById("cot-producto-resultados");

  lista.innerHTML = "";

  lista.style.display = "none";

  document.getElementById("cot-cant").focus();
}

// ======================================================
// ABRIR NUEVO SERVICIO
// ======================================================

function cotNuevoServicio() {
  ["ns-nm", "ns-pr", "ns-ga", "ns-ds"].forEach((id) => {
    const e = document.getElementById(id);

    if (e) e.value = "";
  });

  window.cotEsperandoServicio = true;

  openM("m-servicio");

  setTimeout(() => {
    document.getElementById("ns-nm")?.focus();
  }, 100);
}

// ======================================================
// ABRIR NUEVO PRODUCTO
// ======================================================

function cotNuevoProducto() {
  window.cotEsperandoProducto = true;

  openM("m-prod");
}

async function cotConvertirVenta(id) {
  const cot = DB.get("cotizaciones").find((c) => c.id === id);

  if (!cot) {
    notify("❌ No se encontró la cotización.");
    return;
  }

  // ============================
  // Reiniciar venta
  // ============================

  LV = [];

  renderLV();

  // ============================
  // Abrir modal
  // ============================

  openM("m-venta");

  // ============================
  // Relación con cotización
  // ============================

  window.cotizacionOrigenId = cot.id;

  window.cotizacionOrigenFolio = cot.folio;

  // ============================
  // Cliente
  // ============================

  const selCli = document.getElementById("vta-cli");

  if (selCli) {
    selCli.value = cot.cliente_id || "";

    selCli.dispatchEvent(new Event("change"));
  }

  // ============================
  // Fecha
  // ============================
  const f = document.getElementById("vta-fch");

  if (f) {
    f.value = hoy();
  }

  window.ventaCotizacionOrigen = {
    id: cot.id,

    folio: cot.folio,
  };

  // ==========================================
  // Conceptos -> Motor de Ventas (LV)
  // ==========================================

  // ==========================================
  // Separar productos y servicios
  // ==========================================

  LV = [];

  const productos = cot.conceptos.filter((c) => c.origen === "INVENTARIO");

  const servicios = cot.conceptos.filter((c) => c.origen === "CATALOGO");

  // ==========================================
  // La cotización solo contiene servicios
  // ==========================================

  if (!productos.length) {
    await ARABOT.alert({
      title: "No hay productos para vender",

      message: "Esta cotización contiene únicamente servicios técnicos.",

      details:
        "Los servicios deben gestionarse mediante una Orden de Servicio para conservar el historial del equipo, el técnico asignado y la garantía.",
    });

    closeM("m-venta");

    return;
  }

  // ==========================================
  // Si existen servicios informar al usuario
  // ==========================================

  if (servicios.length) {
    const continuar = await ARABOT.confirm({
      title: "Servicios técnicos detectados",

      message: "Los servicios técnicos no se convertirán en venta.",

      details:
        "Los servicios deberán gestionarse mediante una Orden de Servicio para conservar el historial del equipo y su garantía.\n\nSolo se agregarán los productos a esta venta.",
    });

    if (!continuar) {
      closeM("m-venta");

      return;
    }
  }

  // ==========================================
  // Agregar únicamente productos
  // ==========================================

  productos.forEach((c) => {
    LV.push({
      tipo: "producto",

      sku: c.sku || "",

      desc: c.desc,

      precio: Number(c.precioUnit || 0),

      qty: Number(c.cant || 1),
    });
  });

  renderLV();

  recalcVta();

  notify("Preparando venta desde " + cot.folio);
}

// ============================================================
// Cerrar buscadores al hacer clic fuera
// ============================================================

document.addEventListener("click", (e) => {
  if (!e.target.closest("#cot-producto-wrap")) {
    document.getElementById("cot-producto-resultados").style.display = "none";
  }

  if (!e.target.closest("#cot-servicio-wrap")) {
    document.getElementById("cot-servicio-resultados").style.display = "none";
  }
});

// ============================================================
// COPIAR PRECIO AL PORTAPAPELES
// ============================================================

async function copiarPrecio(id, btn = null) {
  const elemento = document.getElementById(id);

  if (!elemento) return;

  const texto = elemento.textContent.trim();

  try {
    await navigator.clipboard.writeText(texto);

    // Animación del precio
    elemento.classList.add("precio-copiado");

    setTimeout(() => {
      elemento.classList.remove("precio-copiado");
    }, 700);

    // Animación del botón
    if (btn) {
      btn.classList.add("copiado");

      btn.innerHTML = '<i class="ar-icon success"></i>';
      window.refreshIcons(btn);

      btn.disabled = true;

      setTimeout(() => {
        btn.classList.remove("copiado");

        btn.innerHTML = '<i class="ar-icon clipboard"></i>';
        window.refreshIcons(btn);

        btn.disabled = false;
      }, 900);
    }
  } catch (e) {
    notify("❌ No fue posible copiar el precio.");
  }
}

// ============================================================
// COPIAR INFORMACIÓN COMPLETA
// ============================================================

async function copiarInformacion(tipo, btn = null) {
  const datos = {
    efectivo: {
      titulo: "💵 Efectivo / Transferencia",

      precio: "precio-efectivo",

      iva: "precio-efectivo-iva",
    },

    contado: {
      titulo: "💳 Tarjeta de Contado",

      precio: "precio-contado",

      iva: "precio-contado-iva",
    },

    msi: {
      titulo: "💳 Tarjeta a 3 Meses Sin Intereses",

      precio: "precio-msi",

      iva: "precio-msi-iva",
    },
  };

  const info = datos[tipo];

  if (!info) return;

  const precio = document.getElementById(info.precio)?.textContent.trim() || "";

  const precioIVA = document.getElementById(info.iva)?.textContent.trim() || "";

  const texto = `${info.titulo}

💲 Precio:
${precio}

🧾 Con IVA:
${precioIVA}

ARATECH`;

  try {
    await navigator.clipboard.writeText(texto);

    if (btn) {
      btn.classList.add("copiado");

      btn.innerHTML = '<i class="ar-icon success"></i> Información copiada';
      window.refreshIcons(btn);

      btn.disabled = true;

      setTimeout(() => {
        btn.classList.remove("copiado");

        btn.innerHTML = '<i class="ar-icon archivo"></i> Copiar información';
        window.refreshIcons(btn);

        btn.disabled = false;
      }, 1200);
    }
  } catch (e) {
    notify("❌ No fue posible copiar la información.");
  }
}

window.prtCotizacion = prtCotizacion;

window.cotRender = cotRender;
window.cotFiltrar = cotFiltrar;
window.cotReimprimir = cotReimprimir;
window.cotCambiarEstado = cotCambiarEstado;

window.cotGenerar = cotGenerar;

window.cotLimpiar = cotLimpiar;
window.cotRenderTablaForm = cotRenderTablaForm;

window.cotEliminarConcepto = cotEliminarConcepto;
window.cotAgregar = cotAgregar;

window.cotDesdeInv = cotDesdeInv;
window.cotDesdecat = cotDesdecat;

window.cotVerificarVencidas = cotVerificarVencidas;

window.cotInit = cotInit;

window.cotActualizarIVA = cotActualizarIVA;

window.cotBuscarCliente = cotBuscarCliente;
window.cotSeleccionarCliente = cotSeleccionarCliente;

window.cotNuevoCliente = cotNuevoCliente;

window.cotBuscarServicio = cotBuscarServicio;
window.cotSeleccionarServicio = cotSeleccionarServicio;

window.cotBuscarProducto = cotBuscarProducto;
window.cotSeleccionarProducto = cotSeleccionarProducto;

window.cotNuevoServicio = cotNuevoServicio;
window.cotNuevoProducto = cotNuevoProducto;

window.cotConvertirVenta = cotConvertirVenta;

window.copiarPrecio = copiarPrecio;
window.copiarInformacion = copiarInformacion;
