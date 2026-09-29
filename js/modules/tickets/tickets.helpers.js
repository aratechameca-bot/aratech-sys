// Navegación programática entre paneles
function navTo(panel) {
  const el = document.querySelector(`.sb-item[data-panel="${panel}"]`);
  if (el) el.click();
}

function prtDesgloseFactura() {
  // Llamado desde el expediente — usa los servicios de la orden actual
  const id = document.getElementById("exp-id")?.value;
  if (!id) return;
  const ord = DB.get("ordenes").find((o) => o.id === id);
  if (!ord) return;

  const conceptos = [];
  (ord.servicios || []).forEach((s) => {
    if (!s.svc || s.svc === "__otro") return;
    const precio = s.precio || 0;
    conceptos.push({
      desc: s.svcOtro || s.svc,
      totalConIva: precio,
      base: precio / 1.16,
      iva: precio - precio / 1.16,
    });
  });
  (ord.vtas_rel || []).forEach((vid) => {
    const v = DB.get("ventas").find((x) => x.id === vid);
    if (!v) return;
    (v.lineas || []).forEach((l) => {
      const precio = l.precio || 0;
      conceptos.push({
        desc: l.desc,
        totalConIva: precio,
        base: precio / 1.16,
        iva: precio - precio / 1.16,
      });
    });
  });

  if (!conceptos.length) {
    notify("❌ Esta orden no tiene servicios o productos");
    return;
  }
  prtDesglose(conceptos, ord);
}

function prtDesglose(conceptos, ord) {
  const c = cfg();
  let totBase = 0,
    totIva = 0,
    totTotal = 0;
  conceptos.forEach((x) => {
    totBase += x.base;
    totIva += x.iva;
    totTotal += x.totalConIva;
  });

  const fecha = new Date().toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=League+Spartan:wght@700;900&family=Montserrat:wght@400;500;600&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Montserrat',sans-serif;color:#1a1a2e;background:#fff;padding:24px;font-size:11px}
    .header{background:#102a43;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;border-radius:8px 8px 0 0;margin-bottom:0}
    .header-left{display:flex;align-items:center;gap:14px}
    .brand{font-family:'League Spartan',sans-serif;font-weight:900;font-size:22px;color:#fff;letter-spacing:3px}
    .slogan{font-size:8px;color:#75d0fa;letter-spacing:2px;text-transform:uppercase}
    .header-right{text-align:right}
    .doc-title{font-family:'League Spartan',sans-serif;font-weight:700;font-size:14px;color:#fff;letter-spacing:2px}
    .doc-sub{font-size:9px;color:#75d0fa;margin-top:2px}
    .meta{background:#f4f7fb;padding:12px 20px;display:flex;justify-content:space-between;margin-bottom:16px;font-size:10px;color:#444;border-bottom:2px solid #e0e8f0}
    table{width:100%;border-collapse:collapse;margin-bottom:16px}
    thead th{background:#0a1a2e;color:#fff;padding:8px 10px;text-align:left;font-size:9px;letter-spacing:1px;text-transform:uppercase;font-family:'League Spartan',sans-serif}
    thead th:not(:first-child){text-align:right}
    tbody tr:nth-child(even){background:#f8fafc}
    tbody td{padding:8px 10px;border-bottom:1px solid #e8edf2;color:#1a1a2e}
    tbody td:not(:first-child){text-align:right}
    .tot-row{background:#102a43!important}
    .tot-row td{color:#fff;font-weight:600;padding:10px 10px;font-size:11px}
    .iva-cell{color:#ffd600!important;font-weight:700}
    .total-cell{color:#75d0fa!important;font-weight:800;font-size:13px}
    .nota{font-size:9px;color:#888;margin-bottom:16px;padding:10px;background:#f8fafc;border-radius:6px;border-left:3px solid #75d0fa}
    .footer{background:#102a43;padding:12px 20px;border-radius:0 0 8px 8px;display:flex;justify-content:space-between;align-items:center}
    .footer p{font-size:9px;color:rgba(255,255,255,0.45)}
    @media print{body{padding:10px}.no-print{display:none}}
  </style></head><body>
  <div class="header">
    <div class="header-left">
      <div>
        <div class="brand">${c.nombre || "ARATECH"}</div>
        <div class="slogan">Tecnología a tu servicio</div>
      </div>
    </div>
    <div class="header-right">
      <div class="doc-title">DESGLOSE PARA FACTURA</div>
      <div class="doc-sub">${fecha}</div>
      ${ord ? `<div class="doc-sub" style="margin-top:2px">Orden: <b style="color:#75d0fa">${ord.folio}</b> · ${ord.cliente_nombre}</div>` : ""}
    </div>
  </div>
  <div class="meta">
    <span><b>${c.dir || ""}</b></span>
    <span>Tel: <b>${c.tel || "375 690 5296"}</b> · ${c.ig || "@aratechameca"}</span>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:45%">Concepto / Descripción</th>
        <th>Subtotal</th>
        <th>IVA 16%</th>
        <th>Total con IVA</th>
      </tr>
    </thead>
    <tbody>
      ${conceptos
        .map(
          (x) => `
        <tr>
          <td>${x.desc}</td>
          <td>${mxn(x.base)}</td>
          <td class="iva-cell">${mxn(x.iva)}</td>
          <td style="font-weight:700;color:#102a43">${mxn(x.totalConIva)}</td>
        </tr>`,
        )
        .join("")}
      <tr class="tot-row">
        <td><b>TOTAL</b></td>
        <td><b>${mxn(totBase)}</b></td>
        <td class="iva-cell"><b>${mxn(totIva)}</b></td>
        <td class="total-cell">${mxn(totTotal)}</td>
      </tr>
    </tbody>
  </table>

  <div class="nota">
    <b>Nota:</b> Este desglose es para uso contable interno. El IVA de <b>${mxn(totIva)}</b> corresponde al 16% sobre el subtotal de <b>${mxn(totBase)}</b>.
    Los precios son en pesos mexicanos (MXN).
  </div>

  <div class="footer">
    <p>${c.nombre || "ARATECH"} · ${c.slogan || "Tecnología a tu servicio"}</p>
    <p>Documento generado el ${fecha}</p>
  </div>

  <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),500)}<\/script>
  </body></html>`;

  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
}

window.prtDesglose = prtDesglose;
window.prtDesgloseFactura = prtDesgloseFactura;
window.navTo = navTo;
