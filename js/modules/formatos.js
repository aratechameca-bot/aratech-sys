// FORMATOS
function rndFmt() {
  const ords = DB.get("ordenes");
  const vtas = DB.get("ventas");
  const gs = DB.get("garantias");
  document.getElementById("sel-op").innerHTML =
    '<option value="">Seleccionar orden…</option>' +
    ords
      .map(
        (o) =>
          `<option value="${o.id}">${o.folio} — ${o.cliente_nombre}</option>`,
      )
      .join("");
  document.getElementById("sel-vp").innerHTML =
    '<option value="">Seleccionar venta…</option>' +
    vtas
      .map(
        (v) =>
          `<option value="${v.id}">${v.folio} — ${v.cliente_nombre || "General"}</option>`,
      )
      .join("");
  document.getElementById("sel-gp").innerHTML =
    '<option value="">Seleccionar garantía…</option>' +
    gs
      .map(
        (g) =>
          `<option value="${g.folio}">${g.folio} — ${g.cliente_nombre}</option>`,
      )
      .join("");
}
function araFonts() {
  return `<link href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@400;600;700;800;900&family=Montserrat:wght@300;400;500;600&display=swap" rel="stylesheet">`;
}
function araHeaderHTML(
  c,
  docTitulo,
  meta1L,
  meta1V,
  meta2L,
  meta2V,
  meta3L,
  meta3V,
) {
  return `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=League+Spartan:wght@400;600;700;800;900&family=Montserrat:wght@300;400;500;600&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Montserrat',sans-serif;background:#fff;color:#1a1a2e;font-size:11px}
    .ara-header-band{
    background:#102a43;
}
    .ara-header-top{display:flex;align-items:center;justify-content:space-between;padding:16px 28px 14px}
    .ara-logo-block{display:flex;align-items:center;gap:12px}
    .ara-logo{
    width:60px;
    height:60px;
    object-fit:contain;
    flex-shrink:0;
}
    .ara-logo-name{font-family:'League Spartan',sans-serif;font-size:22px;font-weight:800;letter-spacing:3px;color:#000;line-height:1}
    .ara-logo-slogan{font-family:'Montserrat',sans-serif;font-size:7.5px;font-weight:800;letter-spacing:2px;color:#000;text-transform:uppercase;margin-top:2px}
    .ara-header-info{text-align:right;display:flex;flex-direction:column;gap:3px}
    .ara-header-info span{font-size:9px;font-weight:500;color:#000;background:rgba(255,255,255,0.9);padding:2px 7px;border-radius:3px;display:flex;align-items:center;gap:4px}
    .ara-header-info span strong{color:#000;font-weight:700;display:flex;align-items:center}
    .ara-header-info{background:rgba(255,255,255,0.95);padding:8px 14px;border-radius:6px;gap:4px}
    .ara-accent-bar{height:3px;background:linear-gradient(90deg,#1e90ff 0%,#75d0fa 100%)}
    .ara-doc-band{background:#1e90ff;padding:8px 28px;display:flex;align-items:center;justify-content:space-between}
    .ara-doc-title{font-family:'League Spartan',sans-serif;font-size:13px;font-weight:700;letter-spacing:3px;color:#fff;text-transform:uppercase}
    .ara-doc-meta{
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:18px;
          width:420px;
      }

      .ara-meta-item{
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:flex-start;
          text-align:center;
          gap:3px;
      }
    .ara-meta-label{font-size:7px;font-weight:600;letter-spacing:1.5px;color:#444;text-transform:uppercase}
    .ara-meta-value{
      font-family:'League Spartan',sans-serif;
      font-size:12px;
      font-weight:700;
      color:#fff;
      letter-spacing:1px;
      line-height:1.35;
    }
    .ara-body{padding:18px 28px;display:flex;flex-direction:column;gap:14px}
    .ara-row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .ara-row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
    .ara-row4{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px}
    .ara-sec{display:flex;flex-direction:column}
    .ara-sec-hd{background:#0a1a2e;padding:4px 10px;border-radius:3px 3px 0 0}
    .ara-sec-hd-blue{background:#1a5fa8;padding:4px 10px;border-radius:3px 3px 0 0}
    .ara-sec-title{font-family:'League Spartan',sans-serif;font-size:8px;font-weight:700;letter-spacing:2px;color:#fff;text-transform:uppercase}
    .ara-sec-body{border:1px solid #e2e8ed;border-top:none;border-radius:0 0 3px 3px;padding:8px 10px}
    .ara-field{display:flex;flex-direction:column;gap:2px;margin-bottom:6px}
    .ara-field:last-child{margin-bottom:0}
    .ara-field-label{font-size:7px;font-weight:600;letter-spacing:1px;color:#444;text-transform:uppercase}
    .ara-field-value{font-size:10px;font-weight:400;color:#000;border-bottom:1px solid #e2e8ed;padding-bottom:2px;min-height:16px}
    .ara-field-value.tall{min-height:42px;border:1px solid #e2e8ed;border-radius:2px;padding:4px 5px}
    .ara-table{width:100%;border-collapse:collapse;font-size:9.5px}
    .ara-table thead tr{background:#102a43}
    .ara-table thead th{font-family:'League Spartan',sans-serif;font-size:7.5px;font-weight:700;letter-spacing:1.5px;color:#fff;text-transform:uppercase;padding:6px 8px;text-align:left}
    .ara-table thead th:last-child,.ara-table thead th.r{text-align:right}
    .ara-table tbody tr{border-bottom:1px solid #e2e8ed}
    .ara-table tbody tr:nth-child(even){background:#f4f6f8}
    .ara-table tbody td{padding:6px 8px;font-size:9.5px;color:#000}
    .ara-table tbody td.r{text-align:right}
    .ara-totals{display:flex;flex-direction:column;align-items:flex-end;gap:3px;padding:8px 8px 5px;border-top:2px solid #102a43}
    .ara-total-row{display:flex;gap:36px;align-items:center}
    .ara-total-label{font-size:8px;font-weight:600;letter-spacing:1px;color:#444;text-transform:uppercase;min-width:70px;text-align:right}
    .ara-total-value{font-size:10px;font-weight:500;color:#000;min-width:70px;text-align:right;border-bottom:1px solid #e2e8ed;padding-bottom:1px}
    .ara-total-row.grand .ara-total-label{font-family:'League Spartan',sans-serif;font-size:10px;font-weight:800;color:#102a43;letter-spacing:1.5px}
    .ara-total-row.grand .ara-total-value{font-family:'League Spartan',sans-serif;font-size:15px;font-weight:900;color:#1e90ff;border-bottom:2px solid #1e90ff}
    .ara-liq-badge{background:#e8f5e9;border:2px solid #2e7d32;border-radius:4px;text-align:center;font-family:'League Spartan',sans-serif;font-weight:800;font-size:13px;padding:6px;color:#1a7a1a;margin:4px 0}
    .ara-gar-box{background:rgba(16,42,67,0.05);border-left:3px solid #1e90ff;border-radius:0 3px 3px 0;padding:6px 10px;font-size:8.5px;color:#444;line-height:1.6}
    .ara-firmas{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-top:4px}
    .ara-firma{display:flex;flex-direction:column;align-items:center;gap:3px}
    .ara-firma-line{width:100%;border-bottom:1.5px solid #102a43;min-height:30px;margin-bottom:3px}
    .ara-firma-label{font-size:7px;font-weight:700;letter-spacing:1px;color:#102a43;text-transform:uppercase;text-align:center}
    .ara-firma-sub{font-size:7px;color:#444;text-align:center}
    .ara-accent-bar-footer{height:2px;background:linear-gradient(90deg,#1e90ff 0%,#75d0fa 50%,transparent 100%)}
    .ara-footer{background:#102a43;padding:10px 28px 14px;display:flex;flex-direction:column;align-items:center;gap:8px}
    .ara-footer-pol{display:flex;flex-direction:column;gap:2px;width:100%;text-align:center}
    .ara-footer-pol p{font-size:7px;color:#444;line-height:1.6}
    .ara-footer-pol p strong{color:#111;font-weight:700}
    .ara-footer-onara{display:flex;justify-content:center;align-items:center;margin-top:4px}
    .ara-footer-onara-by{display:none}
    .ara-footer-onara-name{display:none}
    .ara-footer-onara img{height:28px;width:auto}
    @media print{@page{margin:8mm}body{background:#fff}}
 </style>
</head>
<body>

<div class="ara-header-band">
  <div class="ara-header-top">

    <div class="ara-logo-block">

      <img
        src="${ASSETS.LOGO_ARATECH}"
        alt="ARATECH"
        class="ara-logo"
      >

      <div>
        <div class="ara-logo-name">
          ${c.nombre || "ARATECH"}
        </div>

        <div class="ara-logo-slogan">
          Tecnología a tu Servicio
        </div>
      </div>

    </div>

    <div class="ara-header-info">

      <span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        ${c.dir || "Allende 246, Ameca, Jalisco"}
      </span>

      <span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.22l3-.01a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.08 6.08l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 16.5z"/>
        </svg>
        ${c.tel || "375 690 5296"}
      </span>

      <span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
        </svg>
        ${c.ig || "@aratechameca"}
      </span>

      <span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        Diagnóstico sin costo
      </span>

    </div>
    </div>
    <div class="ara-accent-bar"></div>
    <div class="ara-doc-band">
      <div class="ara-doc-title">${docTitulo}</div>
      <div class="ara-doc-meta">
        <div class="ara-meta-item"><span class="ara-meta-label">${meta1L}</span><span class="ara-meta-value">${meta1V}</span></div>
        <div class="ara-meta-item"><span class="ara-meta-label">${meta2L}</span><span class="ara-meta-value">${meta2V}</span></div>
        <div class="ara-meta-item"><span class="ara-meta-label">${meta3L}</span><span class="ara-meta-value">${meta3V}</span></div>
      </div>
    </div>
  </div>`;
}
function araFooterHTML(c) {
  return `
  <div class="ara-accent-bar-footer"></div>
  <div class="ara-footer">
    <div class="ara-footer-pol">
      <p><strong>Diagnóstico sin costo.</strong> El cliente autoriza la revisión del equipo al firmar esta orden. ARATECH no se responsabiliza por pérdida de datos.</p>
      <p>Equipos no reclamados en <strong>30 días</strong> tras notificación causarán cargo de almacenaje. Pasados <strong>60 días</strong> el equipo podrá disponerse.</p>
      <p>Forma de pago: <strong>efectivo · transferencia · tarjeta de débito · tarjeta de crédito</strong>. ${c.ig || "@aratechameca"} | Tel: ${c.telefono || "375 690 5296"}</p>
   </div>

<div class="ara-footer-onara">

  <img
    src="${ASSETS.ONARA_COLOR}"
    alt="Onara Studio"
    class="onara-color"
  >

</div>

</div>`;
}

function araFooterestadoHTML(c) {
  return `
  <div class="ara-accent-bar-footer"></div>
  <div class="ara-footer">
    <div class="ara-footer-pol">
      <p><strong>Estado de cuenta oficial.</strong> <p>
   
      Documento generado automáticamente por el Sistema Financiero de ARATECH.
      </p>

      <p>
      Los movimientos aquí reflejados corresponden al historial de pagos registrado hasta la fecha de emisión.
      </p>

      <p>
      Para cualquier aclaración, conserve este documento junto con sus comprobantes de pago (ARPAG).
      </p> 
      
      <p>Forma de pago: <strong>efectivo · transferencia · tarjeta de débito · tarjeta de crédito</strong>. ${c.ig || "@aratechameca"} | Tel: ${c.telefono || "375 690 5296"}</p>


        </div>

<div class="ara-footer-onara">

  <img
    src="${ASSETS.ONARA_COLOR}"
    alt="Onara Studio"
    class="onara-color"
  >

</div>

</div>`;
}

function araFooterOCHTML(c) {
  return `
  <div class="ara-accent-bar-footer"></div>

  <div class="ara-footer">

    <div class="ara-footer-pol">

      <p>
        <strong>Orden de Compra oficial.</strong>
      </p>

      <p>
        Este documento representa una solicitud formal de adquisición de bienes e insumos para ARATECH y forma parte del proceso interno de abastecimiento.
      </p>

      <p>
        La emisión de esta Orden de Compra no constituye un comprobante de pago ni implica la aceptación automática por parte del proveedor. Las cantidades, precios y condiciones comerciales deberán ser confirmadas entre ambas partes.
      </p>

      <p>
        Cualquier modificación, cancelación o actualización deberá registrarse dentro de ARATECH-SYS para mantener la trazabilidad y el control administrativo de la compra.
      </p>

      <p>
        Documento generado automáticamente por <strong>ARATECH-SYS</strong> · Tecnología a tu servicio.
        ${c.ig || "@aratechameca"} | Tel: ${c.telefono || "375 690 5296"}
      </p>

    </div>

    <div class="ara-footer-onara">

      <img
        src="${ASSETS.ONARA_COLOR}"
        alt="Onara Studio"
        class="onara-color"
      >

    </div>

  </div>`;
}

function prtOrd(id, fm = "carta") {
  if (!id) {
    alert("Selecciona una orden");
    return;
  }
  const o = DB.get("ordenes").find((x) => x.id === id);
  if (!o) return;
  const c = cfg();
  const vtasExtra = (o.vtas_rel || []).reduce((a, vid) => {
    const v = DB.get("ventas").find((x) => x.id === vid);
    return a + (v ? v.total : 0);
  }, 0);
  const vtasLineas = (o.vtas_rel || []).flatMap((vid) => {
    const v = DB.get("ventas").find((x) => x.id === vid);
    return v ? v.lineas || [] : [];
  });
  const totalIntegral = o.total + vtasExtra;
  const saldo = totalIntegral - (o.anticipo || 0);
  const liq = saldo <= 0;
  const es = fm !== "carta";

  // INICIA FORMATO PREMIUM 58MM
  if (fm === "58mm") {
    const html = `
            <!DOCTYPE html>
            <html>
            <head>
            <meta charset="UTF-8">

            <style>

            @page{
              margin:3mm;
            }

            *{
              box-sizing:border-box;
            }

            body{
              font-family:Arial,Helvetica,sans-serif;
              max-width:54mm;
              margin:0 auto;
              color:#000;
              background:#fff;
              font-size:10px;
            }

            .hd{
              text-align:center;
              border-bottom:2px solid #000;
              padding-bottom:8px;
            }

            .logo{
              display:block;
              margin:0 auto 4px;
              max-width:220px;
            }

            .sub{
              font-size:9px;
              line-height:1.4;
            }

            .ttl{
              text-align:center;
              font-size:16px;
              font-weight:bold;
              border-top:2px solid #000;
              border-bottom:2px solid #000;
              padding:6px;
              margin:10px 0;
            }

            .qr-poligar{
                  display:block;
                  margin:10px auto;
                  width:100px;
                  height:auto;
                }

            .onara{
              display:block;
              margin:8px auto 4px;
              max-width:${fm === "80mm" ? "95px" : "130px"};

            </style>

            </head>

            <body>

            <div class="hd">

             <img src="${ASSETS.ARATECH_TERMICO}" class="logo">

              <div class="sub">
                DESDE 2023
              </div>

              <div class="sub">
                Allende 246 · Col. Obrera · Ameca, Jalisco · C.P. 46620
              </div>

               <div class="sub">
                Envíanos un WhatsApp o llámanos:
              </div>

              <div class="sub">
                Taller: 375 690 5296
              </div>

              <div class="sub">
                Soporte: 375 119 9699
              </div>

              <div class="sub">
                Instagram/facebook: @aratechameca
              </div>

            </div>

            <div style="margin-top:10px">

            <div style="
              display:flex;
              justify-content:space-between;
              font-weight:bold;
              border-bottom:1px solid #000;
              padding-bottom:5px;
            ">
              <span>ORDEN DE SERVICIO</span>
              <span>${o.folio}</span>
            </div>

          </div>

          <div style="margin-top:12px">

            <div>
              <strong>INGRESO</strong>
              <span style="float:right">${fmt(o.fecha)}</span>
            </div>

            <div style="margin-top:4px">
              <strong>EST. ENTREGA</strong>
              <span style="float:right">${fmt(o.fecha_prom) || "—"}</span>
            </div>

            <div style="margin-top:4px">
              <strong>TÉCNICO</strong>
              <span style="float:right">${o.tecnico || "—"}</span>
            </div>

          </div>

          <hr style="margin:12px 0;border:none;border-top:1px dashed #999">

          <div>

            <div style="
              font-weight:bold;
              border-bottom:1px solid #000;
              padding-bottom:3px;
              margin-bottom:6px;
            ">
              CLIENTE
            </div>

            <div>
              <strong>NOMBRE</strong>
              <span style="float:right">${o.cliente_nombre}</span>
            </div>

            <div style="margin-top:4px">
              <strong>TEL</strong>
              <span style="float:right">${o.tel || "—"}</span>
            </div>

          </div>

          <hr style="margin:12px 0;border:none;border-top:1px dashed #999">

          <div>

            <div style="
              font-weight:bold;
              border-bottom:1px solid #000;
              padding-bottom:3px;
              margin-bottom:6px;
            ">
              EQUIPO
            </div>

            <div>
              <strong>TIPO</strong>
              <span style="float:right">${o.tipo_equipo || "—"}</span>
            </div>

            <div style="margin-top:4px">
              <strong>MARCA/MODELO</strong>
              <span style="float:right">${o.modelo || "—"}</span>
            </div>

            <div style="margin-top:4px">
              <strong>SERIE</strong>
              <span style="float:right">${o.serie || "—"}</span>
            </div>

          </div>

          <hr style="margin:12px 0;border:none;border-top:1px dashed #999">

            <div>

              <div style="
                font-weight:bold;
                border-bottom:1px solid #000;
                padding-bottom:3px;
                margin-bottom:6px;
              ">
                SERVICIOS
              </div>

              <table style="
                width:100%;
                border-collapse:collapse;
                font-size:9px;
              ">

                <thead>

                  <tr>

                    <th style="
                      text-align:left;
                      border-bottom:1px solid #000;
                      padding-bottom:4px;
                    ">
                      CONCEPTO
                    </th>

                    <th style="
                      text-align:right;
                      border-bottom:1px solid #000;
                      padding-bottom:4px;
                    ">
                      TOTAL
                    </th>

                  </tr>

                </thead>

                <tbody>

                  ${(o.servicios || [])
                    .map(
                      (s) => `
                    <tr>

                      <td style="
                        padding:5px 0;
                        border-bottom:1px dashed #ccc;
                      ">
                        ${s.svc || s.servicio}
                      </td>

                      <td style="
                        text-align:right;
                        font-weight:bold;
                        border-bottom:1px dashed #ccc;
                        white-space:nowrap;
                      ">
                        ${mxn(s.precio)}
                      </td>

                    </tr>
                  `,
                    )
                    .join("")}

                  ${vtasLineas
                    .map(
                      (l) => `
                    <tr>

                      <td style="
                        padding:5px 0;
                        border-bottom:1px dashed #ccc;
                      ">
                        📦 ${l.desc}
                      </td>

                      <td style="
                        text-align:right;
                        font-weight:bold;
                        border-bottom:1px dashed #ccc;
                        white-space:nowrap;
                      ">
                        ${mxn((l.qty || 1) * l.precio)}
                      </td>

                    </tr>
                  `,
                    )
                    .join("")}


                </tbody>

              </table>

            </div>

            <hr style="margin:12px 0;border:none;border-top:2px solid #000">

            <div>

              <div style="
                display:flex;
                justify-content:space-between;
                margin-bottom:4px;
                font-weight:bold;
              ">
                <span>TOTAL</span>
                <span>${mxn(totalIntegral)}</span>
              </div>

              <div style="
                margin-top:10px;
                border-top:2px solid #000;
                padding-top:8px;
                text-align:right;
              ">

                <div style="
                  font-size:12px;
                  font-weight:bold;
                  letter-spacing:1px;
                ">
                  ${liq ? "LIQUIDADO" : "SALDO"}
                </div>

                <div style="
                  font-size:14px;
                  font-weight:900;
                  line-height:1;
                ">
                  ${liq ? "$0.00" : mxn(saldo)}
                </div>

              </div>

            </div>

            <hr style="margin:14px 0;border:none;border-top:1px solid #000">

            <div style="
              text-align:center;
              line-height:1.6;
              font-size:9px;
            ">

              <strong>GARANTÍA</strong>

              <br>

              Según el tipo de servicio realizado.

              <br>

              Conserve esta orden para cualquier aclaración.

            </div>

            <hr style="margin:14px 0;border:none;border-top:1px solid #000">

              <div style="
                text-align:center;
                font-size:9px;
              ">

                Escanea el código QR para consultar
                políticas, garantías y condiciones
                del servicio.

              </div>

              <img src="${ASSETS.QR_POLYGAR}" class="qr-poligar">

              <div style="
                margin-top:80px;
                text-align:center;
              ">

                <div style="
                  border-top:1px solid #000;
                  width:80%;
                  margin:0 auto;
                  padding-top:6px;
                ">

                  <div style="
                    font-weight:bold;
                    font-size:11px;
                  ">
                    FIRMA DE CONFORMIDAD
                  </div>

                  <div style="
                    margin-top:2px;
                    font-size:9px;
                  ">
                    ${o.cliente_nombre}
                  </div>

                </div>

              </div>

            <<div class="footer">

                <div style="
                  font-size:11px;
                  font-weight:bold;
                  text-align:center;
                  margin-top:14px;
                  margin-bottom:14px;
                ">
                  ¡GRACIAS POR CONFIAR EN ARATECH!
                </div>

                <img src="${ASSETS.ONARA_TERMICO}" class="onara">

              </div>


            <script>
            window.onload=()=>{
              window.print();
              setTimeout(
                ()=>window.close(),
                500
              );
            }
            <\/script>

            </body>
            </html>
            `;

    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();

    return;
  }

  // INICIA FORMATO PREMIUM 80MM
  if (fm === "80mm") {
    const html = `
            <!DOCTYPE html>
            <html>
            <head>
            <meta charset="UTF-8">

            <style>

            @page{
              margin:3mm;
            }

            *{
              box-sizing:border-box;
            }

            body{
              font-family:Arial,Helvetica,sans-serif;
              max-width:76mm;
              margin:0 auto;
              color:#000;
              background:#fff;
              font-size:10px;
            }

            .hd{
              text-align:center;
              border-bottom:2px solid #000;
              padding-bottom:8px;
            }

            .logo{
              display:block;
              margin:0 auto 4px;
              max-width:220px;
            }

            .sub{
              font-size:9px;
              line-height:1.4;
            }

            .ttl{
              text-align:center;
              font-size:16px;
              font-weight:bold;
              border-top:2px solid #000;
              border-bottom:2px solid #000;
              padding:6px;
              margin:10px 0;
            }

            .qr-poligar{
                  display:block;
                  margin:10px auto;
                  width:100px;
                  height:auto;
                }

            .onara{
              display:block;
              margin:8px auto 4px;
              max-width:${fm === "80mm" ? "95px" : "130px"};

            </style>

            </head>

            <body>

            <div class="hd">

             <img src="${ASSETS.ARATECH_TERMICO}" class="logo">

              <div class="sub">
                DESDE 2023
              </div>

              <div class="sub">
                Allende 246 · Col. Obrera · Ameca, Jalisco · C.P. 46620
              </div>

              <div class="sub">
                Envíanos un WhatsApp o llámanos:
              </div>

              <div class="sub">
                Taller: 375 690 5296
              </div>

              <div class="sub">
                Soporte: 375 119 9699
              </div>

              <div class="sub">
                Instagram/facebook: @aratechameca
              </div>

            </div>

            <div style="margin-top:10px">

            <div style="
              display:flex;
              justify-content:space-between;
              font-weight:bold;
              border-bottom:1px solid #000;
              padding-bottom:5px;
            ">
              <span>ORDEN DE SERVICIO</span>
              <span>${o.folio}</span>
            </div>

          </div>

          <div style="margin-top:12px">

            <div>
              <strong>INGRESO</strong>
              <span style="float:right">${fmt(o.fecha)}</span>
            </div>

            <div style="margin-top:4px">
              <strong>EST. ENTREGA</strong>
              <span style="float:right">${fmt(o.fecha_prom) || "—"}</span>
            </div>

            <div style="margin-top:4px">
              <strong>TÉCNICO</strong>
              <span style="float:right">${o.tecnico || "—"}</span>
            </div>

          </div>

          <hr style="margin:12px 0;border:none;border-top:1px dashed #999">

          <div>

            <div style="
              font-weight:bold;
              border-bottom:1px solid #000;
              padding-bottom:3px;
              margin-bottom:6px;
            ">
              CLIENTE
            </div>

            <div>
              <strong>NOMBRE</strong>
              <span style="float:right">${o.cliente_nombre}</span>
            </div>

            <div style="margin-top:4px">
              <strong>TEL</strong>
              <span style="float:right">${o.tel || "—"}</span>
            </div>

          </div>

          <hr style="margin:12px 0;border:none;border-top:1px dashed #999">

          <div>

            <div style="
              font-weight:bold;
              border-bottom:1px solid #000;
              padding-bottom:3px;
              margin-bottom:6px;
            ">
              EQUIPO
            </div>

            <div>
              <strong>TIPO</strong>
              <span style="float:right">${o.tipo_equipo || "—"}</span>
            </div>

            <div style="margin-top:4px">
              <strong>MARCA/MODELO</strong>
              <span style="float:right">${o.modelo || "—"}</span>
            </div>

            <div style="margin-top:4px">
              <strong>SERIE</strong>
              <span style="float:right">${o.serie || "—"}</span>
            </div>

          </div>

          <hr style="margin:12px 0;border:none;border-top:1px dashed #999">

            <div>

              <div style="
                font-weight:bold;
                border-bottom:1px solid #000;
                padding-bottom:3px;
                margin-bottom:6px;
              ">
                SERVICIOS
              </div>

              <table style="
                width:100%;
                border-collapse:collapse;
                font-size:9px;
              ">

                <thead>

                  <tr>

                    <th style="
                      text-align:left;
                      border-bottom:1px solid #000;
                      padding-bottom:4px;
                    ">
                      CONCEPTO
                    </th>

                    <th style="
                      text-align:right;
                      border-bottom:1px solid #000;
                      padding-bottom:4px;
                    ">
                      TOTAL
                    </th>

                  </tr>

                </thead>

                <tbody>

                  ${(o.servicios || [])
                    .map(
                      (s) => `
                    <tr>

                      <td style="
                        padding:5px 0;
                        border-bottom:1px dashed #ccc;
                      ">
                        ${s.svc || s.servicio}
                      </td>

                      <td style="
                        text-align:right;
                        font-weight:bold;
                        border-bottom:1px dashed #ccc;
                        white-space:nowrap;
                      ">
                        ${mxn(s.precio)}
                      </td>

                    </tr>
                  `,
                    )
                    .join("")}

                  ${vtasLineas
                    .map(
                      (l) => `
                    <tr>

                      <td style="
                        padding:5px 0;
                        border-bottom:1px dashed #ccc;
                      ">
                        📦 ${l.desc}
                      </td>

                      <td style="
                        text-align:right;
                        font-weight:bold;
                        border-bottom:1px dashed #ccc;
                        white-space:nowrap;
                      ">
                        ${mxn((l.qty || 1) * l.precio)}
                      </td>

                    </tr>
                  `,
                    )
                    .join("")}

                </tbody>

              </table>

            </div>

            <hr style="margin:12px 0;border:none;border-top:2px solid #000">

            <div>

              <div style="
                display:flex;
                justify-content:space-between;
                margin-bottom:4px;
                font-weight:bold;
              ">
                <span>TOTAL</span>
                <span>${mxn(totalIntegral)}</span>
              </div>

              <div style="
                margin-top:10px;
                border-top:2px solid #000;
                padding-top:8px;
                text-align:right;
              ">

                <div style="
                  font-size:12px;
                  font-weight:bold;
                  letter-spacing:1px;
                ">
                  ${liq ? "LIQUIDADO" : "SALDO"}
                </div>

                <div style="
                  font-size:14px;
                  font-weight:900;
                  line-height:1;
                ">
                  ${liq ? "$0.00" : mxn(saldo)}
                </div>

              </div>

            </div>

            <hr style="margin:14px 0;border:none;border-top:1px solid #000">

            <div style="
              text-align:center;
              line-height:1.6;
              font-size:9px;
            ">

              <strong>GARANTÍA</strong>

              <br>

              Según el tipo de servicio realizado.

              <br>

              Conserve esta orden para cualquier aclaración.

            </div>

            <hr style="margin:14px 0;border:none;border-top:1px solid #000">

              <div style="
                text-align:center;
                font-size:9px;
              ">

                Escanea el código QR para consultar
                políticas, garantías y condiciones
                del servicio.

              </div>

              <img src="${ASSETS.QR_POLYGAR}" class="qr-poligar">

              <div style="
                margin-top:80px;
                text-align:center;
              ">

                <div style="
                  border-top:1px solid #000;
                  width:80%;
                  margin:0 auto;
                  padding-top:6px;
                ">

                  <div style="
                    font-weight:bold;
                    font-size:11px;
                  ">
                    FIRMA DE CONFORMIDAD
                  </div>

                  <div style="
                    margin-top:2px;
                    font-size:9px;
                  ">
                    ${o.cliente_nombre}
                  </div>

                </div>

              </div>

            <div class="footer">

              <div style="
                font-size:11px;
                font-weight:bold;
                text-align:center;
                margin-top:14px;
                margin-bottom:14px;
              ">
                ¡GRACIAS POR CONFIAR EN ARATECH!
              </div>

              <img src="${ASSETS.ONARA_TERMICO}" class="onara">

            </div>


            <script>
            window.onload=()=>{
              window.print();
              setTimeout(
                ()=>window.close(),
                500
              );
            }
            <\/script>

            </body>
            </html>
            `;

    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();

    return;
  }

  // ORDEN DE SERVICIO EN CARTA
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
  ${araHeaderHTML(c, "Orden de Servicio", "Número de Orden", o.folio, "Fecha de Ingreso", fmt(o.fecha), "Entrega Estimada", fmt(o.fecha_prom) || "—")}
  <div class="ara-body">
    <div class="ara-row2">
      <div class="ara-sec">
        <div class="ara-sec-hd"><span class="ara-sec-title">Datos del Cliente</span></div>
        <div class="ara-sec-body">
          <div class="ara-field"><span class="ara-field-label">Nombre completo</span><span class="ara-field-value">${o.cliente_nombre}</span></div>
          <div class="ara-row2">
            <div class="ara-field"><span class="ara-field-label">Teléfono</span><span class="ara-field-value">${o.tel || "—"}</span></div>
            <div class="ara-field"><span class="ara-field-label">WhatsApp</span><span class="ara-field-value">${o.tel || "—"}</span></div>
          </div>
        </div>
      </div>
      <div class="ara-sec">
        <div class="ara-sec-hd"><span class="ara-sec-title">Datos del Técnico</span></div>
        <div class="ara-sec-body">
          <div class="ara-field"><span class="ara-field-label">Técnico asignado</span><span class="ara-field-value">${o.tecnico || "—"}</span></div>
          <div class="ara-row2">
            <div class="ara-field">
              <span class="ara-field-label">Estado</span>
              <span class="ara-field-value">${o.estado || "—"}</span>
            </div>  
            </div>
          </div>
      </div>
    </div>
    <div class="ara-sec">
      <div class="ara-sec-hd-blue"><span class="ara-sec-title">Descripción del Equipo</span></div>
      <div class="ara-sec-body">
        <div class="ara-row4">
          <div class="ara-field"><span class="ara-field-label">Tipo</span><span class="ara-field-value">${o.tipo_equipo || "—"}</span></div>
          <div class="ara-field"><span class="ara-field-label">Marca / Modelo</span><span class="ara-field-value">${o.modelo || "—"}</span></div>
          <div class="ara-field"><span class="ara-field-label">Número de Serie</span><span class="ara-field-value">${o.serie || "—"}</span></div>
          <div class="ara-field"><span class="ara-field-label">Estado físico</span><span class="ara-field-value">${o.estado_eq || "—"}</span></div>
        </div>
        <div class="ara-row2">
          <div class="ara-field"><span class="ara-field-label">Accesorios incluidos</span><span class="ara-field-value">${o.accesorios || "Ninguno"}</span></div>
          <div class="ara-field"><span class="ara-field-label">Contraseña / PIN</span><span class="ara-field-value">${o.password || "—"}</span></div>
        </div>
      </div>
    </div>
    <div class="ara-row2">
      <div class="ara-sec">
        <div class="ara-sec-hd-blue"><span class="ara-sec-title">Problema Reportado por el Cliente</span></div>
        <div class="ara-sec-body"><div class="ara-field"><span class="ara-field-value tall">${o.problema || ""}</span></div></div>
      </div>
      ${
        (o.estado === "Listo para entrega" || o.estado === "Entregado") &&
        o.diagnostico
          ? `
      <div class="ara-sec">
        <div class="ara-sec-hd-blue"><span class="ara-sec-title">Informe</span></div>
        <div class="ara-sec-body"><div class="ara-field"><span class="ara-field-value tall">${o.diagnostico}</span></div></div>
      </div>`
          : ""
      }
    </div>
    <div class="ara-sec">
      <div class="ara-sec-hd-blue"><span class="ara-sec-title">Servicios y Cargos</span></div>
      <div class="ara-sec-body" style="padding:0">
        <table class="ara-table">
          <thead><tr><th style="width:50%">Concepto / Descripción</th><th style="width:20%">Tipo</th><th class="r" style="width:15%">P. Unitario</th><th class="r" style="width:15%">Total</th></tr></thead>
          <tbody>
            ${(o.servicios || []).map((s) => `<tr><td>${s.svc || s.servicio}</td><td>Servicio</td><td class="r">${mxn(s.precio)}</td><td class="r">${mxn(s.precio)}</td></tr>`).join("")}
            ${vtasLineas.map((l) => `<tr><td>📦 ${l.desc}</td><td>Producto</td><td class="r">${mxn(l.precio)}</td><td class="r">${mxn((l.qty || 1) * l.precio)}</td></tr>`).join("")}
          </tbody>
        </table>
        <div class="ara-totals">

          <div class="ara-total-row">
              <span class="ara-total-label">Total</span>

              <span class="ara-total-value">
                  ${mxn(totalIntegral)}
              </span>
          </div>

          <div class="ara-total-row grand">

              <span class="ara-total-label">
                  ${liq ? "✅ Liquidado" : "Saldo"}
              </span>

              <span class="ara-total-value">
                  ${liq ? "$0.00" : mxn(saldo)}
              </span>

          </div>

        </div>
    </div>
    ${(() => {
      const cat = DB.get("cat");
      const svcConGar = (o.servicios || []).filter((s) => {
        const c = cat.find((x) => x.nombre === (s.svc || s.servicio));
        return c && c.garantia > 0;
      });
      return svcConGar.length > 0 && o.fecha_gar
        ? `<div class="ara-gar-box"><strong>🛡️ Garantía:</strong> ${svcConGar.map((s) => s.svc || s.servicio).join(", ")} — Válida hasta: <strong>${fmt(o.fecha_gar)}</strong></div>`
        : "";
    })()}
    <div class="ara-firmas">
      <div class="ara-firma"><div class="ara-firma-line"></div><div class="ara-firma-label">Firma del Cliente</div><div class="ara-firma-sub">${o.cliente_nombre}</div></div>
      <div class="ara-firma"><div class="ara-firma-line"></div><div class="ara-firma-label">Firma del Técnico</div><div class="ara-firma-sub">Responsable del servicio</div></div>
      <div class="ara-firma"><div class="ara-firma-line"></div><div class="ara-firma-label">Firma de Entrega</div><div class="ara-firma-sub">Confirma recepción conforme</div></div>
    </div>
  </div>
  ${araFooterHTML(c)}
  <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),500)}<\/script>
  </body></html>`;
  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
}

function prtEtiqueta(id) {
  if (!id) {
    alert("No se recibió la orden.");
    return;
  }

  const o = DB.get("ordenes").find((x) => x.id === id);

  if (!o) {
    alert("Orden no encontrada.");
    return;
  }

  const w = window.open("", "_blank", "width=800,height=600");

  w.document.write(`
<!DOCTYPE html>
<html>
<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width,initial-scale=1">

<meta
    http-equiv="X-UA-Compatible"
    content="IE=edge">

<title>Etiqueta ${o.folio}</title>

<style>

@page {
    size: 58mm 40mm landscape; /* Esto fuerza la orientación horizontal */
    margin: 0;
}

    *{

        box-sizing:border-box;

    }

    html,

    body{

         width:auto;

        height:auto;

        margin:0;

        padding:0;

        overflow:hidden;

        background:#fff;

        color:#000;

        font-family:Arial,Helvetica,sans-serif;

    }

   .etq{

        position:absolute;

        left:0;

        top:0;

        width:58mm;

        height:40mm;

        padding:0;

        margin:0;

        display:flex;

        flex-direction:column;

    }

    /*=========================
      HEADER
    =========================*/

    .etq-header{

        display:flex;

        align-items:center;

        gap:1mm;

        width:100%;

    }

    .etq-logo{

        width:15mm;

        display:flex;

        justify-content:center;

        align-items:center;

        flex-shrink:0;

    }

    .logo{

        width:13mm;

        height:auto;

    }

    .etq-folio{

        flex:1;

        border:2px solid #000;

        border-radius:3px;

        padding:3px 4px;

        text-align:center;

    }

    .folio-label{

        font-size:7px;

        font-weight:700;

        letter-spacing:.5px;

        color:#000;

    }

    .folio{

        font-size:18px;

        font-weight:900;

        line-height:1;

        letter-spacing:1px;

        color:#000;

    }

    .slogan{

        font-size:7px;

        margin-top:1px;

        color:#000;

    }

    /*=========================
      DIVISORES
    =========================*/

    .linea{

        border-top:1px solid #000;

        margin:2mm 0;

    }

    /*=========================
      CUERPO
    =========================*/

    .etq-body{

        display:flex;

        flex-direction:column;

        gap:.8mm;

        width:100%;

    }

    .fila{

        display:grid;

        grid-template-columns:12mm 1fr;

        align-items:center;

        column-gap:2mm;

        width:100%;

        font-size:9px;

        line-height:1.2;

    }

    .et-label{

        font-weight:700;

        color:#000;

        white-space:nowrap;

    }

    .et-value{

        flex:1;

        font-weight:700;

        color:#000;

        word-break:break-word;

    }

    /*=========================
      FOOTER
    =========================*/

    .etq-footer{

        display:grid;

        grid-template-columns:1fr 1fr;

        align-items:center;

        margin-top:auto;

        padding-top:1mm;

        font-size:8px;

        font-weight:700;

        color:#000;

    }

</style>

</head>

<body>

<div class="etq">

    <div class="etq-header">

        <div class="etq-logo">

            <img
                class="logo"
                src="${ASSETS.ARATECH_TERMICO}"
                alt="ARATECH">

        </div>

        <div class="etq-folio">

            <div class="folio-label">
                ORDEN DE SERVICIO
            </div>

            <div class="folio">
                ${o.folio}
            </div>

            <div class="slogan">
                Tecnología a tu servicio
            </div>

        </div>

    </div>

    <div class="linea"></div>

    <div class="etq-body">

        <div class="fila">

            <span class="et-label">Cliente:</span>

            <span class="et-value">
                ${o.cliente_nombre || ""}
            </span>

        </div>

        <div class="fila">

            <span class="et-label">Equipo:</span>

            <span class="et-value">
                ${o.tipo_equipo || ""} · ${o.modelo || ""}
            </span>

        </div>

        <div class="fila">

            <span class="et-label">S/N:</span>

            <span class="et-value">
                ${o.serie || ""}
            </span>

        </div>

    </div>

    <div class="linea"></div>

    <div class="etq-footer">

        <span>
            <strong>Ing:</strong> ${o.fecha || ""}
        </span>

        <span>
            <strong>Ent:</strong> ${o.fecha_prom || "--/--/----"}
        </span>

    </div>

</div>

</body>

</html>
`);

  w.document.close();

  w.onload = () => {
    w.focus();

    setTimeout(() => {
      w.print();

      // Si quieres que se cierre sola después de imprimir,
      // descomenta la siguiente línea:
      // w.close();
    }, 300);
  };
}

function prtVta(id, fm = "carta") {
  if (!id) {
    alert("Selecciona una venta");
    return;
  }
  const v = DB.get("ventas").find((x) => x.id === id);
  if (!v) return;
  const c = cfg();
  const es = fm !== "carta";
  const aw = fm === "58mm" ? "54mm" : "76mm";

  // INICIA FORMATO PREMIUM 58MM
  if (fm === "58mm") {
    const html = `
            <!DOCTYPE html>
            <html>
            <head>
            <meta charset="UTF-8">

            <style>

            @page{
              margin:3mm;
            }

            *{
              box-sizing:border-box;
            }

            body{
              font-family:Arial,Helvetica,sans-serif;
              max-width:54mm;
              margin:0 auto;
              color:#000;
              background:#fff;
              font-size:10px;
            }

            .hd{
              text-align:center;
              border-bottom:2px solid #000;
              padding-bottom:8px;
            }

            .logo{
              display:block;
              margin:0 auto 4px;
              max-width:220px;
            }

            .sub{
              font-size:9px;
              line-height:1.4;
            }

            .ttl{
              text-align:center;
              font-size:16px;
              font-weight:bold;
              border-top:2px solid #000;
              border-bottom:2px solid #000;
              padding:6px;
              margin:10px 0;
            }

            .qr-poligar{
                  display:block;
                  margin:10px auto;
                  width:100px;
                  height:auto;
                }

            .onara{
              display:block;
              margin:8px auto 4px;
              max-width:${fm === "80mm" ? "95px" : "130px"};

            </style>

            </head>

            <body>

            <div class="hd">

             <img src="${ASSETS.ARATECH_TERMICO}" class="logo">

              <div class="sub">
                DESDE 2023
              </div>

              <div class="sub">
                Allende 246 · Col. Obrera · Ameca, Jalisco · C.P. 46620
              </div>

              <div class="sub">
                Envíanos un WhatsApp o llámanos:
              </div>

              <div class="sub">
                Taller: 375 690 5296
              </div>

              <div class="sub">
                Soporte: 375 119 9699
              </div>

              <div class="sub">
                Instagram/facebook: @aratechameca
              </div>

            </div>

            <div style="margin-top:10px">

            <div style="
              display:flex;
              justify-content:space-between;
              font-weight:bold;
              border-bottom:1px solid #000;
              padding-bottom:5px;
            ">
              <span>TICKET DE VENTA</span>
              <span>${v.folio}</span>
            </div>

          </div>

          <div style="margin-top:12px">

            <div>
              <strong>FECHA</strong>
              <span style="float:right">
                ${fmt(v.fecha)}
              </span>
            </div>

          </div>

          <hr style="margin:12px 0;border:none;border-top:1px dashed #999">

          <div>

            <div style="
              font-weight:bold;
              border-bottom:1px solid #000;
              padding-bottom:3px;
              margin-bottom:6px;
            ">
              CLIENTE
            </div>

            <div>
              ${v.cliente_nombre || "Público en general"}
            </div>

          </div>

          <hr style="margin:12px 0;border:none;border-top:2px solid #000">

          <div>

            <div style="
              font-weight:bold;
              border-bottom:1px solid #000;
              padding-bottom:3px;
              margin-bottom:6px;
            ">
              PRODUCTOS
            </div>

            <table style="
              width:100%;
              border-collapse:collapse;
              font-size:9px;
            ">

              <tbody>

                ${(v.lineas || [])
                  .map(
                    (l) => `
                  <tr>

                    <td style="
                      padding:5px 0;
                      border-bottom:1px dashed #ccc;
                    ">
                      ${l.qty || 1}x ${l.desc}
                    </td>

                    <td style="
                      text-align:right;
                      font-weight:bold;
                      border-bottom:1px dashed #ccc;
                      white-space:nowrap;
                    ">
                      ${mxn((l.qty || 1) * l.precio)}
                    </td>

                  </tr>
                `,
                  )
                  .join("")}

              </tbody>

            </table>

          </div>

          <hr style="margin:12px 0;border:none;border-top:2px solid #000">

          <div>

            ${
              v.iva_pct > 0
                ? `
            <div style="
              display:flex;
              justify-content:space-between;
              margin-bottom:4px;
            ">
              <span>IVA (${v.iva_pct}%)</span>
              <span>${mxn(v.iva_monto)}</span>
            </div>
            `
                : ""
            }

            ${
              v.descuento > 0
                ? `
            <div style="
              display:flex;
              justify-content:space-between;
              margin-bottom:4px;
            ">
              <span>DESCUENTO</span>
              <span>-${mxn(v.descuento)}</span>
            </div>
            `
                : ""
            }

            <div style="
              margin-top:10px;
              border-top:2px solid #000;
              padding-top:8px;
              text-align:right;
            ">

              <div style="
                font-size:12px;
                font-weight:bold;
                letter-spacing:1px;
              ">
                TOTAL A PAGAR
              </div>

              <div style="
                font-size:16px;
                font-weight:900;
                line-height:1;
              ">
                ${mxn(v.total)}
              </div>

            </div>

          </div>

          <hr style="margin:14px 0;border:none;border-top:1px solid #000">

          <div>

            <strong>FORMA DE PAGO</strong>

            <span style="float:right">
              ${v.pago}
            </span>

          </div>

            <hr style="margin:14px 0;border:none;border-top:1px solid #000">

            <div style="
              text-align:center;
              line-height:1.6;
              font-size:9px;
            ">

              <strong>GARANTÍA</strong>

              <br>

              Según el tipo de servicio realizado.

              <br>

              Conserve este ticket para cualquier aclaración.

            </div>

              <hr style="margin:14px 0;border:none;border-top:1px solid #000">

              <div style="
                text-align:center;
                font-size:9px;
              ">

                Escanea el código QR para consultar
                políticas, garantías y condiciones
                del servicio.

              </div>

              <img src="${ASSETS.QR_POLYGAR}" class="qr-poligar">

            <div class="footer">

              <div style="
                font-size:11px;
                font-weight:bold;
                text-align:center;
                margin-top:14px;
                margin-bottom:14px;
              ">
                ¡GRACIAS POR TU COMPRA EN ARATECH!
              </div>

              <img src="${ASSETS.ONARA_TERMICO}" class="onara">

            </div>


            <script>
            window.onload=()=>{
              window.print();
              setTimeout(
                ()=>window.close(),
                500
              );
            }
            <\/script>

            </body>
            </html>
            `;

    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();

    return;
  }
  // INICIA FORMATO PREMIUM 80MM
  if (fm === "80mm") {
    const html = `
            <!DOCTYPE html>
            <html>
            <head>
            <meta charset="UTF-8">

            <style>

            @page{
              margin:3mm;
            }

            *{
              box-sizing:border-box;
            }

            body{
              font-family:Arial,Helvetica,sans-serif;
              max-width:76mm;
              margin:0 auto;
              color:#000;
              background:#fff;
              font-size:10px;
            }

            .hd{
              text-align:center;
              border-bottom:2px solid #000;
              padding-bottom:8px;
            }

            .logo{
              display:block;
              margin:0 auto 4px;
              max-width:220px;
            }

            .sub{
              font-size:9px;
              line-height:1.4;
            }

            .ttl{
              text-align:center;
              font-size:16px;
              font-weight:bold;
              border-top:2px solid #000;
              border-bottom:2px solid #000;
              padding:6px;
              margin:10px 0;
            }

            .qr-poligar{
                  display:block;
                  margin:10px auto;
                  width:100px;
                  height:auto;
                }

            .onara{
              display:block;
              margin:8px auto 4px;
              max-width:${fm === "80mm" ? "95px" : "130px"};

            </style>

            </head>

            <body>

            <div class="hd">

             <img src="${ASSETS.ARATECH_TERMICO}" class="logo">

              <div class="sub">
                DESDE 2023
              </div>

              <div class="sub">
                Allende 246 · Col. Obrera · Ameca, Jalisco · C.P. 46620
              </div>

              <div class="sub">
                Envíanos un WhatsApp o llámanos:
              </div>

              <div class="sub">
                Taller: 375 690 5296
              </div>

              <div class="sub">
                Soporte: 375 119 9699
              </div>

              <div class="sub">
                Instagram/facebook: @aratechameca
              </div>

            </div>

            <div style="margin-top:10px">

            <div style="
              display:flex;
              justify-content:space-between;
              font-weight:bold;
              border-bottom:1px solid #000;
              padding-bottom:5px;
            ">
              <span>TICKET DE VENTA</span>
              <span>${v.folio}</span>
            </div>

          </div>

          <div style="margin-top:12px">

            <div>
              <strong>FECHA</strong>
              <span style="float:right">
                ${fmt(v.fecha)}
              </span>
            </div>

          </div>

          <hr style="margin:12px 0;border:none;border-top:1px dashed #999">

          <div>

            <div style="
              font-weight:bold;
              border-bottom:1px solid #000;
              padding-bottom:3px;
              margin-bottom:6px;
            ">
              CLIENTE
            </div>

            <div>
              ${v.cliente_nombre || "Público en general"}
            </div>

          </div>

          <hr style="margin:12px 0;border:none;border-top:2px solid #000">

          <div>

            <div style="
              font-weight:bold;
              border-bottom:1px solid #000;
              padding-bottom:3px;
              margin-bottom:6px;
            ">
              PRODUCTOS
            </div>

            <table style="
              width:100%;
              border-collapse:collapse;
              font-size:9px;
            ">

              <tbody>

                ${(v.lineas || [])
                  .map(
                    (l) => `
                  <tr>

                    <td style="
                      padding:5px 0;
                      border-bottom:1px dashed #ccc;
                    ">
                      ${l.qty || 1}x ${l.desc}
                    </td>

                    <td style="
                      text-align:right;
                      font-weight:bold;
                      border-bottom:1px dashed #ccc;
                      white-space:nowrap;
                    ">
                      ${mxn((l.qty || 1) * l.precio)}
                    </td>

                  </tr>
                `,
                  )
                  .join("")}

              </tbody>

            </table>

          </div>

          <hr style="margin:12px 0;border:none;border-top:2px solid #000">

          <div>

            ${
              v.iva_pct > 0
                ? `
            <div style="
              display:flex;
              justify-content:space-between;
              margin-bottom:4px;
            ">
              <span>IVA (${v.iva_pct}%)</span>
              <span>${mxn(v.iva_monto)}</span>
            </div>
            `
                : ""
            }

            ${
              v.descuento > 0
                ? `
            <div style="
              display:flex;
              justify-content:space-between;
              margin-bottom:4px;
            ">
              <span>DESCUENTO</span>
              <span>-${mxn(v.descuento)}</span>
            </div>
            `
                : ""
            }

            <div style="
              margin-top:10px;
              border-top:2px solid #000;
              padding-top:8px;
              text-align:right;
            ">

              <div style="
                font-size:12px;
                font-weight:bold;
                letter-spacing:1px;
              ">
                TOTAL A PAGAR
              </div>

              <div style="
                font-size:16px;
                font-weight:900;
                line-height:1;
              ">
                ${mxn(v.total)}
              </div>

            </div>

          </div>

          <hr style="margin:14px 0;border:none;border-top:1px solid #000">

          <div>

            <strong>FORMA DE PAGO</strong>

            <span style="float:right">
              ${v.pago}
            </span>

          </div>

            <hr style="margin:14px 0;border:none;border-top:1px solid #000">

            <div style="
              text-align:center;
              line-height:1.6;
              font-size:9px;
            ">

              <strong>GARANTÍA</strong>

              <br>

              Según el tipo de servicio realizado.

              <br>

              Conserve este ticket para cualquier aclaración.

            </div>

              <hr style="margin:14px 0;border:none;border-top:1px solid #000">

              <div style="
                text-align:center;
                font-size:9px;
              ">

                Escanea el código QR para consultar
                políticas, garantías y condiciones
                del servicio.

              </div>

              <img src="${ASSETS.QR_POLYGAR}" class="qr-poligar">

            <div class="footer">

              <div style="
                font-size:11px;
                font-weight:bold;
                text-align:center;
                margin-top:14px;
                margin-bottom:14px;
              ">
                ¡GRACIAS POR TU COMPRA EN ARATECH!
              </div>

              <img src="${ASSETS.ONARA_TERMICO}" class="onara">

            </div>


            <script>
            window.onload=()=>{
              window.print();
              setTimeout(
                ()=>window.close(),
                500
              );
            }
            <\/script>

            </body>
            </html>
            `;

    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();

    return;
  }

  // TICKET DE VENTA EN CARTA
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
  ${araHeaderHTML(c, "Ticket de Venta", "Folio", v.folio, "Fecha", fmt(v.fecha), "Cliente", v.cliente_nombre || "Público en general")}
  <div class="ara-body">
    <div class="ara-sec">
      <div class="ara-sec-hd-blue"><span class="ara-sec-title">Productos / Servicios</span></div>
      <div class="ara-sec-body" style="padding:0">
        <table class="ara-table">
          <thead><tr><th style="width:50%">Descripción</th><th class="r" style="width:15%">Cant.</th><th class="r" style="width:17%">P. Unitario</th><th class="r" style="width:18%">Total</th></tr></thead>
          <tbody>
            ${(v.lineas || []).map((l) => `<tr><td>${l.desc}</td><td class="r">${l.qty || 1}</td><td class="r">${mxn(l.precio)}</td><td class="r">${mxn((l.qty || 1) * l.precio)}</td></tr>`).join("")}
          </tbody>
        </table>
        <div class="ara-totals">
          ${v.iva_pct > 0 ? `<div class="ara-total-row"><span class="ara-total-label">IVA (${v.iva_pct}%)</span><span class="ara-total-value">${mxn(v.iva_monto)}</span></div>` : ""}
          ${v.descuento > 0 ? `<div class="ara-total-row"><span class="ara-total-label">Descuento</span><span class="ara-total-value">-${mxn(v.descuento)}</span></div>` : ""}
          <div class="ara-total-row"><span class="ara-total-label">Forma de pago</span><span class="ara-total-value">${v.pago}</span></div>
          <div class="ara-total-row grand"><span class="ara-total-label">Total</span><span class="ara-total-value">${mxn(v.total)}</span></div>
        </div>
      </div>
    </div>
    <div class="ara-firmas" style="grid-template-columns:1fr 1fr">
      <div class="ara-firma"><div class="ara-firma-line"></div><div class="ara-firma-label">Firma del Cliente</div><div class="ara-firma-sub">${v.cliente_nombre || "Público en general"}</div></div>
      <div class="ara-firma"><div class="ara-firma-line"></div><div class="ara-firma-label">Sello / Firma ARATECH</div><div class="ara-firma-sub">Comprobante de venta</div></div>
    </div>
  </div>
  ${araFooterHTML(c)}
  <script> window.onload=()=>{ window.print(); setTimeout( ()=>window.close(), 500 ); } <\/script>
  </body></html>`;
  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
}

function prtGar(fol, fm = "carta") {
  if (!fol) {
    alert("Selecciona una garantía");
    return;
  }
  const g = DB.get("garantias").find((x) => x.folio === fol);
  if (!g) return;
  const c = cfg();
  const hoy2 = hoy();
  const dias = g.fecha_gar ? diasE(hoy2, g.fecha_gar) : 999;
  const vigente = dias >= 0;
  const porVencer = dias >= 0 && dias <= 7;
  const tipoGar = g.tipo_gar || "servicio";
  const diasGar =
    g.garantia_dias && g.garantia_dias > 0
      ? String(g.garantia_dias)
      : tipoGar === "nuevo"
        ? "365"
        : tipoGar === "usado"
          ? "90"
          : "—";
  // INICIA FORMATO PREMIUM 58MM
  if (fm === "58mm") {
    const html = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                    <meta charset="UTF-8">

                    <style>

                    @page{
                      margin:3mm;
                    }

                    *{
                      box-sizing:border-box;
                    }

                    body{
                      font-family:Arial,Helvetica,sans-serif;
                      max-width:54mm;
                      margin:0 auto;
                      color:#000;
                      background:#fff;
                      font-size:10px;
                    }

                    .hd{
                      text-align:center;
                      border-bottom:2px solid #000;
                      padding-bottom:8px;
                    }

                    .logo{
                      display:block;
                      margin:0 auto 4px;
                      max-width:220px;
                    }

                    .sub{
                      font-size:9px;
                      line-height:1.4;
                    }

                    .ttl{
                      text-align:center;
                      font-size:16px;
                      font-weight:bold;
                      border-top:2px solid #000;
                      border-bottom:2px solid #000;
                      padding:6px;
                      margin:10px 0;
                    }

                    .qr-poligar{
                          display:block;
                          margin:10px auto;
                          width:100px;
                          height:auto;
                        }

                    .onara{
                        display:block;
                        margin:8px auto 4px;
                        max-width:${fm === "80mm" ? "95px" : "130px"};
                    }

                    </style>

                    </head>

                    <body>

                    <div class="hd">

                      <img src="${ASSETS.ARATECH_TERMICO}" class="logo">

                      <div class="sub">
                        DESDE 2023
                      </div>

                      <div class="sub">
                        Allende 246 · Col. Obrera · Ameca, Jalisco · C.P. 46620
                      </div>

                      <div class="sub">
                        Envíanos un WhatsApp o llámanos:
                      </div>

                      <div class="sub">
                        Taller: 375 690 5296
                      </div>

                      <div class="sub">
                        Soporte: 375 119 9699
                      </div>

                      <div class="sub">
                        Instagram/facebook: @aratechameca
                      </div>

                    </div>

                    <div class="ttl">
                      CONSTANCIA DE GARANTÍA
                    </div>

                    <div style="text-align:center;margin-top:10px">

                      <div style="font-weight:bold;font-size:11px">
                        ORDEN RELACIONADA
                      </div>

                      <div style="margin-top:2px">
                        ${g.folio_ord || g.folio}
                      </div>

                      <div style="margin-top:10px;font-weight:bold;font-size:11px">
                        FECHA DE EMISIÓN
                      </div>

                      <div style="margin-top:2px">
                        ${fmt(g.fecha)}
                      </div>

                      <div style="margin-top:10px;font-weight:bold;font-size:11px">
                        VENCE
                      </div>

                      <div style="margin-top:2px">
                        ${fmt(g.fecha_gar)}
                      </div>

                    </div>

                    <div style="margin-top:14px">

                      <div style="
                        font-weight:bold;
                        border-bottom:1px solid #000;
                        padding-bottom:3px;
                        margin-bottom:6px;
                      ">
                        DATOS DEL CLIENTE
                      </div>

                      <div>
                        <strong>Nombre:</strong>
                        ${g.cliente_nombre}
                      </div>

                      <div style="margin-top:4px">
                        <strong>Teléfono:</strong>
                        ${g.tel || "—"}
                      </div>

                      </div>

                      <div style="margin-top:14px">

                      <div style="
                        font-weight:bold;
                        border-bottom:1px solid #000;
                        padding-bottom:3px;
                        margin-bottom:6px;
                      ">
                        EQUIPO
                      </div>

                      <div>
                        <strong>Tipo / Marca:</strong>
                        ${g.tipo_equipo || "—"}
                      </div>

                      <div style="margin-top:4px">
                        <strong>Modelo:</strong>
                        ${g.modelo || "—"}
                      </div>

                      <div style="margin-top:4px">
                        <strong>No. Serie:</strong>
                        ${g.serie || "—"}
                      </div>

                    </div>

                    <div style="margin-top:14px">

                      <div style="
                        font-weight:bold;
                        border-bottom:1px solid #000;
                        padding-bottom:3px;
                        margin-bottom:6px;
                      ">
                        PRODUCTO / SERVICIO
                      </div>

                      <div>
                        ${g.servicio || "—"}
                      </div>

                      ${
                        g.total_piezas > 1
                          ? `
                            <div style="
                              margin-top:4px;
                              font-size:11px;
                              font-weight:bold;
                            ">
                              Pieza ${g.pieza} de ${g.total_piezas}
                            </div>
                          `
                          : ""
                      }

                      <div style="
                        margin-top:6px;
                        font-weight:bold;
                      ">
                        Garantía: ${diasGar} días
                      </div>

                    <div style="
                      margin-top:14px;
                      border:2px solid #000;
                      padding:10px;
                      text-align:center;
                    ">

                      <div style="
                        margin-top:14px;
                        border:2px solid #000;
                        padding:10px;
                        text-align:center;
                      ">

                        <div style="
                          font-size:15px;
                          font-weight:bold;
                        ">
                          ${
                            vigente
                              ? "🛡️ GARANTÍA VIGENTE"
                              : "❌ GARANTÍA VENCIDA"
                          }
                        </div>

                        <div style="
                          margin-top:6px;
                          font-size:12px;
                          font-weight:bold;
                        ">
                          ${fmt(g.fecha_gar)}
                        </div>

                        <div style="margin-top:6px">
                          ${
                            vigente
                              ? dias + " días restantes"
                              : "Garantía expirada"
                          }
                        </div>

                      </div>

                      <div style="margin-top:14px">

                        <div style="
                          font-weight:bold;
                          border-bottom:1px solid #000;
                          padding-bottom:3px;
                          margin-bottom:8px;
                        ">
                          CONDICIONES DE LA GARANTÍA
                        </div>

                        <div style="line-height:1.7">

                          ✅ Falla cubierta

                          <br>

                          ✅ Presenta tu de orden/ticket en físico

                          <br>

                          ❌ Daño físico o humedad

                          <br>

                          ❌ Manipulación de terceros

                          <br>

                          ❌ Virus / Software malicioso

                          <br>

                          ❌ Pérdida de datos

                          <br><br>

                          ARATECH no se responsabiliza por pérdida de información en ningún caso.

                        </div>

                      </div>

                      <div style="
                        margin-top:100px;
                        text-align:center;
                      ">

                        <div style="
                          border-top:1px solid #000;
                          width:80%;
                          margin:0 auto;
                          padding-top:6px;
                        ">

                          <div style="
                            font-weight:bold;
                            font-size:11px;
                          ">
                            SELLO Y AUTORIZACIÓN
                          </div>

                          <div style="
                            margin-top:3px;
                            font-weight:bold;
                          ">
                            ARATECH
                          </div>

                          <div style="
                            margin-top:2px;
                            font-size:9px;
                          ">
                            Documento Oficial
                          </div>

                        </div>

                      </div>

                      <div class="footer">

                        <div style="
                          font-size:9px;
                          margin-bottom:6px;
                        ">

                         <img src="${ASSETS.QR_POLYGAR}" class="qr-poligar">

                          Consulta nuestras poilíticas de garantía y servicio en nuestra página web.
                        </div>

                       
                        <img src="${ASSETS.ONARA_TERMICO}" class="onara">

                      </div>

                      <script>
                      window.onload=()=>{
                        window.print();
                        setTimeout(
                          ()=>window.close(),
                          500
                        );
                      }
                      <\/script>

                      </body>
                      </html>
                      `;

    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();

    return;
  }

  // INICIA FORMATO PREMIUM 80MM
  if (fm === "80mm") {
    const html = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                    <meta charset="UTF-8">

                    <style>

                    @page{
                      margin:3mm;
                    }

                    *{
                      box-sizing:border-box;
                    }

                    body{
                      font-family:Arial,Helvetica,sans-serif;
                      max-width:76mm;
                      margin:0 auto;
                      color:#000;
                      background:#fff;
                      font-size:10px;
                    }

                    .hd{
                      text-align:center;
                      border-bottom:2px solid #000;
                      padding-bottom:8px;
                    }

                    .logo{
                      display:block;
                      margin:0 auto 4px;
                      max-width:220px;
                    }

                    .sub{
                      font-size:9px;
                      line-height:1.4;
                    }

                    .ttl{
                      text-align:center;
                      font-size:16px;
                      font-weight:bold;
                      border-top:2px solid #000;
                      border-bottom:2px solid #000;
                      padding:6px;
                      margin:10px 0;
                    }

                    .qr-poligar{
                          display:block;
                          margin:10px auto;
                          width:100px;
                          height:auto;
                        }

                    .onara{
                        display:block;
                        margin:8px auto 4px;
                        max-width:${fm === "80mm" ? "95px" : "130px"};
                    }

                    </style>

                    </head>

                    <body>

                    <div class="hd">

                     <img src="${ASSETS.ARATECH_TERMICO}" class="logo">

                      <div class="sub">
                        DESDE 2023
                      </div>

                      <div class="sub">
                        Allende 246 · Col. Obrera · Ameca, Jalisco · C.P. 46620
                      </div>

                      <div class="sub">
                        Envíanos un WhatsApp o llámanos:
                      </div>

                      <div class="sub">
                        Taller: 375 690 5296
                      </div>

                      <div class="sub">
                        Soporte: 375 119 9699
                      </div>

                      <div class="sub">
                        Instagram/facebook: @aratechameca
                      </div>

                    </div>

                    <div class="ttl">
                      CONSTANCIA DE GARANTÍA
                    </div>

                    <div style="text-align:center;margin-top:10px">

                      <div style="font-weight:bold;font-size:11px">
                        ORDEN RELACIONADA
                      </div>

                      <div style="margin-top:2px">
                        ${g.folio_ord || g.folio}
                      </div>

                      <div style="margin-top:10px;font-weight:bold;font-size:11px">
                        FECHA DE EMISIÓN
                      </div>

                      <div style="margin-top:2px">
                        ${fmt(g.fecha)}
                      </div>

                      <div style="margin-top:10px;font-weight:bold;font-size:11px">
                        VENCE
                      </div>

                      <div style="margin-top:2px">
                        ${fmt(g.fecha_gar)}
                      </div>

                    </div>

                    <div style="margin-top:14px">

                      <div style="
                        font-weight:bold;
                        border-bottom:1px solid #000;
                        padding-bottom:3px;
                        margin-bottom:6px;
                      ">
                        DATOS DEL CLIENTE
                      </div>

                      <div>
                        <strong>Nombre:</strong>
                        ${g.cliente_nombre}
                      </div>

                      <div style="margin-top:4px">
                        <strong>Teléfono:</strong>
                        ${g.tel || "—"}
                      </div>

                      </div>

                      <div style="margin-top:14px">

                      <div style="
                        font-weight:bold;
                        border-bottom:1px solid #000;
                        padding-bottom:3px;
                        margin-bottom:6px;
                      ">
                        EQUIPO
                      </div>

                      <div>
                        <strong>Tipo / Marca:</strong>
                        ${g.tipo_equipo || "—"}
                      </div>

                      <div style="margin-top:4px">
                        <strong>Modelo:</strong>
                        ${g.modelo || "—"}
                      </div>

                      <div style="margin-top:4px">
                        <strong>No. Serie:</strong>
                        ${g.serie || "—"}
                      </div>

                    </div>

                    <div style="margin-top:14px">

                      <div style="
                        font-weight:bold;
                        border-bottom:1px solid #000;
                        padding-bottom:3px;
                        margin-bottom:6px;
                      ">
                        PRODUCTO / SERVICIO
                      </div>

                      <div>
                        ${g.servicio || "—"}
                      </div>

                      ${
                        g.total_piezas > 1
                          ? `
                            <div style="
                              margin-top:4px;
                              font-size:11px;
                              font-weight:bold;
                            ">
                              Pieza ${g.pieza} de ${g.total_piezas}
                            </div>
                          `
                          : ""
                      }

                      <div style="
                        margin-top:6px;
                        font-weight:bold;
                      ">
                        Garantía: ${diasGar} días
                      </div>

                    <div style="
                      margin-top:14px;
                      border:2px solid #000;
                      padding:10px;
                      text-align:center;
                    ">

                      <div style="
                        margin-top:14px;
                        border:2px solid #000;
                        padding:10px;
                        text-align:center;
                      ">

                        <div style="
                          font-size:15px;
                          font-weight:bold;
                        ">
                          ${
                            vigente
                              ? "🛡️ GARANTÍA VIGENTE"
                              : "❌ GARANTÍA VENCIDA"
                          }
                        </div>

                        <div style="
                          margin-top:6px;
                          font-size:12px;
                          font-weight:bold;
                        ">
                          ${fmt(g.fecha_gar)}
                        </div>

                        <div style="margin-top:6px">
                          ${
                            vigente
                              ? dias + " días restantes"
                              : "Garantía expirada"
                          }
                        </div>

                      </div>

                      <div style="margin-top:14px">

                        <div style="
                          font-weight:bold;
                          border-bottom:1px solid #000;
                          padding-bottom:3px;
                          margin-bottom:8px;
                        ">
                          CONDICIONES DE LA GARANTÍA
                        </div>

                        <div style="line-height:1.7">

                          ✅ Falla cubierta

                          <br>

                          ✅ Presenta tu de orden/ticket en físico

                          <br>

                          ❌ Daño físico o humedad

                          <br>

                          ❌ Manipulación de terceros

                          <br>

                          ❌ Virus / Software malicioso

                          <br>

                          ❌ Pérdida de datos

                          <br><br>

                          ARATECH no se responsabiliza por pérdida de información en ningún caso.

                        </div>

                      </div>

                      <div style="
                        margin-top:100px;
                        text-align:center;
                      ">

                        <div style="
                          border-top:1px solid #000;
                          width:80%;
                          margin:0 auto;
                          padding-top:6px;
                        ">

                          <div style="
                            font-weight:bold;
                            font-size:11px;
                          ">
                            SELLO Y AUTORIZACIÓN
                          </div>

                          <div style="
                            margin-top:3px;
                            font-weight:bold;
                          ">
                            ARATECH
                          </div>

                          <div style="
                            margin-top:2px;
                            font-size:9px;
                          ">
                            Documento Oficial
                          </div>

                        </div>

                      </div>

                      <div class="footer">

                        <div style="
                          font-size:9px;
                          margin-bottom:6px;
                        ">

                         <img src="${ASSETS.QR_POLYGAR}" class="qr-poligar">

                          Consulta nuestras poilíticas de garantía y servicio en nuestra página web.
                        </div>

                       
                        <img src="${ASSETS.ONARA_TERMICO}" class="onara">

                      </div>

                      <script>
                      window.onload=()=>{
                        window.print();
                        setTimeout(
                          ()=>window.close(),
                          500
                        );
                      }
                      <\/script>

                      </body>
                      </html>
                      `;

    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();

    return;
  }

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
              ${araHeaderHTML(c, "Constancia de Garantía", "Orden Relacionada", g.folio_ord || g.folio, "Fecha de Emisión", fmt(g.fecha), "Vence", fmt(g.fecha_gar))}
              <div class="ara-body">
                <div class="ara-row2">
                  <div class="ara-sec">
                    <div class="ara-sec-hd"><span class="ara-sec-title">Datos del Cliente</span></div>
                    <div class="ara-sec-body">
                      <div class="ara-field"><span class="ara-field-label">Nombre completo</span><span class="ara-field-value">${g.cliente_nombre}</span></div>
                      <div class="ara-field"><span class="ara-field-label">Teléfono</span><span class="ara-field-value">${g.tel || "—"}</span></div>
                    </div>
                  </div>
                  <div class="ara-sec">
                    <div class="ara-sec-hd"><span class="ara-sec-title">Equipo Amparado</span></div>
                    <div class="ara-sec-body">
                      <div class="ara-row2">
                        <div class="ara-field"><span class="ara-field-label">Tipo / Marca</span><span class="ara-field-value">${g.tipo_equipo || "—"}</span></div>
                        <div class="ara-field"><span class="ara-field-label">Modelo</span><span class="ara-field-value">${g.modelo || "—"}</span></div>
                      </div>
                      <div class="ara-field"><span class="ara-field-label">No. de Serie</span><span class="ara-field-value">${g.serie || "—"}</span></div>
                    </div>
                  </div>
                </div>
                <div class="ara-sec">
                  <div class="ara-sec-hd-blue"><span class="ara-sec-title">Servicio / Producto Amparado</span></div>
                  <div class="ara-sec-body">
                    <div class="ara-row2">

                      <div class="ara-field">

                        <span class="ara-field-label">
                          Descripción del servicio
                        </span>

                        <span class="ara-field-value">
                          ${g.servicio}
                        </span>

                        ${
                          g.total_piezas && g.total_piezas > 1
                            ? `
                              <div style="
                                margin-top:6px;
                                color:#0a58ca;
                                font-weight:700;
                                font-size:11px;
                              ">
                                Pieza ${g.pieza} de ${g.total_piezas}
                              </div>
                            `
                            : ""
                        }

                      </div>

                      <div class="ara-field">

                        <span class="ara-field-label">
                          Días de garantía
                        </span>

                        <span class="ara-field-value">
                          ${diasGar} días
                        </span>

                      </div>

                    </div>
                    <div style="margin-top:10px;padding:10px 14px;border-radius:5px;text-align:center;background:${vigente ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)"};border:2px solid ${vigente ? (porVencer ? "#f59e0b" : "#22c55e") : "#ef4444"}">
                      <div style="font-family:'League Spartan',sans-serif;font-size:11px;font-weight:800;color:${vigente ? (porVencer ? "#92400e" : "#166534") : "#991b1b"};letter-spacing:1px;text-transform:uppercase">
                        ${vigente ? (porVencer ? "⚠️ Garantía por vencer" : "🛡️ Garantía Vigente") : "❌ Garantía Vencida"}
                      </div>
                      <div style="font-family:'League Spartan',sans-serif;font-size:18px;font-weight:900;color:${vigente ? (porVencer ? "#d97706" : "#15803d") : "#dc2626"};margin-top:3px">
                        ${
                          vigente
                            ? "Vence: " +
                              fmt(g.fecha_gar) +
                              " (" +
                              dias +
                              " días restantes)"
                            : "Venció el " + fmt(g.fecha_gar)
                        }
                      </div>
                    </div>
                  </div>
                </div>
                <div class="ara-sec">
                  <div class="ara-sec-hd"><span class="ara-sec-title">Condiciones de la Garantía</span></div>
                  <div class="ara-sec-body">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                      <div style="display:flex;gap:7px;align-items:flex-start;padding:6px 8px;border-radius:3px;background:rgba(34,197,94,0.06);border-left:2px solid #22c55e">
                        <span style="font-size:10px;flex-shrink:0;margin-top:1px">✅</span>
                        <div style="font-size:8px;color:#444;line-height:1.5"><strong style="display:block;font-size:8.5px;color:#1a1a2e;margin-bottom:1px">Falla cubierta</strong>Recurrencia de la misma falla reparada dentro del período de garantía.</div>
                      </div>
                      <div style="display:flex;gap:7px;align-items:flex-start;padding:6px 8px;border-radius:3px;background:rgba(34,197,94,0.06);border-left:2px solid #22c55e">
                        <span style="font-size:10px;flex-shrink:0;margin-top:1px">✅</span>
                        <div style="font-size:8px;color:#444;line-height:1.5"><strong style="display:block;font-size:8.5px;color:#1a1a2e;margin-bottom:1px">Presentación de orden</strong>Se requiere presentar esta constancia y la orden de servicio original.</div>
                      </div>
                      <div style="display:flex;gap:7px;align-items:flex-start;padding:6px 8px;border-radius:3px;background:rgba(239,68,68,0.05);border-left:2px solid #ef4444">
                        <span style="font-size:10px;flex-shrink:0;margin-top:1px">❌</span>
                        <div style="font-size:8px;color:#444;line-height:1.5"><strong style="display:block;font-size:8.5px;color:#1a1a2e;margin-bottom:1px">Daño físico o humedad</strong>Golpes, caídas, líquidos o daño por negligencia anulan la garantía.</div>
                      </div>
                      <div style="display:flex;gap:7px;align-items:flex-start;padding:6px 8px;border-radius:3px;background:rgba(239,68,68,0.05);border-left:2px solid #ef4444">
                        <span style="font-size:10px;flex-shrink:0;margin-top:1px">❌</span>
                        <div style="font-size:8px;color:#444;line-height:1.5"><strong style="display:block;font-size:8.5px;color:#1a1a2e;margin-bottom:1px">Manipulación de terceros</strong>Intervención por técnicos ajenos a ARATECH durante el período de garantía.</div>
                      </div>
                      <div style="display:flex;gap:7px;align-items:flex-start;padding:6px 8px;border-radius:3px;background:rgba(239,68,68,0.05);border-left:2px solid #ef4444">
                        <span style="font-size:10px;flex-shrink:0;margin-top:1px">❌</span>
                        <div style="font-size:8px;color:#444;line-height:1.5"><strong style="display:block;font-size:8.5px;color:#1a1a2e;margin-bottom:1px">Virus / Software</strong>Daños causados por virus, malware o instalación incorrecta de software.</div>
                      </div>
                      <div style="display:flex;gap:7px;align-items:flex-start;padding:6px 8px;border-radius:3px;background:rgba(239,68,68,0.05);border-left:2px solid #ef4444">
                        <span style="font-size:10px;flex-shrink:0;margin-top:1px">❌</span>
                        <div style="font-size:8px;color:#444;line-height:1.5"><strong style="display:block;font-size:8.5px;color:#1a1a2e;margin-bottom:1px">Pérdida de datos</strong>ARATECH no se responsabiliza por pérdida de información en ningún caso.</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="ara-firmas">
                  <div class="ara-firma"><div class="ara-firma-line"></div><div class="ara-firma-label">Firma del Cliente</div><div class="ara-firma-sub">${g.cliente_nombre}</div></div>
                  <div class="ara-firma"><div class="ara-firma-line"></div><div class="ara-firma-label">Firma del Técnico</div><div class="ara-firma-sub">Responsable del servicio</div></div>
                  <div class="ara-firma"><div class="ara-firma-line"></div><div class="ara-firma-label">Sello ARATECH</div><div class="ara-firma-sub">Documento oficial</div></div>
                </div>
              </div>
              ${araFooterHTML(c)}
              <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),500)}<\/script>
              </body></html>`;
  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();

  return;
}

// TALÓN DE RECEPCIÓN
function prtTalon() {
  const c = cfg();
  const nombre = c.nombre || "ARATECH";
  const dir = c.dir || "Allende 246, Col. Obrera, Ameca, Jalisco";
  const tel = c.tel || "Taller 375 690 5296 -  Soporte 375 119 9699";
  const ig = c.ig || "@aratechameca";
  const bloque = (tipo) => `
    <div class="talon">

  <div class="th">

    <div class="thead-brand">

      <img src="${ASSETS.LOGO_ARATECH}" class="tlogo">

      <div>

        <div class="tnm">
          ${nombre}
        </div>

        <div class="tslogan">
          Tecnología a tu servicio
        </div>

        <div class="tsub">
          📍 ${dir}
        </div>

        <div class="tsub">
          📞 ${tel}
        </div>

        <div class="tsub">
          📷 ${ig}
        </div>

      </div>

    </div>

    <div class="thead-right">

    <div class="ttipo">
      ${tipo}
    </div>

    <img src="${ASSETS.QR_POLYGAR}" class="tqr-mini">

    <div class="tqr-mini-txt">
      Políticas y Garantía
    </div>

  </div>

    </div>

  <div class="tbody">

    <div class="trow3">

      <div class="tfield">
        <span class="tlbl">Fecha:</span>
        <div class="tline"></div>
      </div>

      <div class="tfield">
        <span class="tlbl">Técnico:</span>
        <div class="tline"></div>
      </div>

      <div class="tfield">
        <span class="tlbl">Folio provisional:</span>
        <div class="tline"></div>
      </div>

    </div>

    <div class="trow2">

      <div class="tfield">
        <span class="tlbl">Nombre del cliente:</span>
        <div class="tline"></div>
      </div>

      <div class="tfield">
        <span class="tlbl">Teléfono:</span>
        <div class="tline"></div>
      </div>

    </div>


    <div class="trow3">

      <div class="tfield">
        <span class="tlbl">Tipo de equipo:</span>
        <div class="tline"></div>
      </div>

      <div class="tfield">
        <span class="tlbl">Marca / Modelo:</span>
        <div class="tline"></div>
      </div>

      <div class="tfield">
        <span class="tlbl">Número de serie:</span>
        <div class="tline"></div>
      </div>

    </div>

    <div class="tacc">

      <div class="tlbl">
        Accesorios entregados
      </div>

      ☐ Monitor
      &nbsp;&nbsp;

      ☐ Teclado
      &nbsp;&nbsp;

      ☐ Mouse
      &nbsp;&nbsp;

      ☐ Bocinas / audífonos
      &nbsp;&nbsp;
      
      ☐ WebCam
      &nbsp;&nbsp;

      ☐ Cargador / Adaptador de corriente
      &nbsp;&nbsp;

       ☐ Cable HDMI / VGA / DP
      &nbsp;&nbsp;

       ☐ Cable de corriente
      &nbsp;&nbsp;

       ☐ Cable USB
      &nbsp;&nbsp;

       ☐ SSD/HDD EXTERNO
      &nbsp;&nbsp;

       ☐ Tarjeta SD / Micro SD
      &nbsp;&nbsp;

       ☐ Funda / Maletín / Mochila
      &nbsp;&nbsp;

      ☐ Otro:
      ___________________________

    </div>

    <div class="tfield-full">

      <span class="tlbl">
        Condición física observada:
      </span>

      <div class="tline"></div>

    </div>

    <div class="tfield-full">

      <span class="tlbl">
        Problema reportado:
      </span>

      <div class="tline"></div>

      <div
        class="tline"
        style="margin-top:5px">
      </div>

    </div>

    <div class="trow3">

      <div class="tfield">
        <span class="tlbl">Anticipo:</span>
        <div class="tline"></div>
      </div>

      <div class="tfield">
        <span class="tlbl">Forma de pago:</span>
        <div class="tline"></div>
      </div>

      <div class="tfield">
        <span class="tlbl">Requiere Factura SI / NO:</span>
        <div class="tline"></div>
      </div>

    </div>

    <div class="tfirma">

      <div style="flex:1;text-align:center">

        <div class="tline"></div>

        <div
          class="tlbl"
          style="margin-top:4px">

          Firma de conformidad del cliente

        </div>

      </div>

    </div>

    <div class="tfoot-note">

      Este documento sirve como
      comprobante de recepción.

      Conserve su copia para
      seguimiento y reclamación.

    </div>

  </div>

</div>`;
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>
          .thead-brand{
        display:flex;
        align-items:center;
        gap:10px;
        flex:1;
      }

      .thead-right{
        display:flex;
        flex-direction:column;
        align-items:center;
        gap:4px;
      }

      .tqr-mini{
        width:60px;
        height:60px;
        object-fit:contain;
      }

      .tqr-mini-txt{
        font-size:7px;
        font-weight:700;
        text-align:center;
        line-height:1.2;
        color:#444;
      }

      .tlogo{
        width:85px;
        height:auto;
        flex-shrink:0;
      }

      .tslogan{
        font-size:8px;
        color:#555;
        letter-spacing:1px;
        text-transform:uppercase;
        font-weight:600;
        margin-top:1px;
      }

      .tacc{
        border:1px solid #bbb;
        border-radius:4px;
        padding:8px;
        margin-top:2px;
        line-height:1.8;
        background:#fafafa;
      }

      .trow3{
        display:grid;
        grid-template-columns:1fr 1fr 1fr;
        gap:10px;
      }

      .tqrbox{
        display:flex;
        align-items:center;
        gap:12px;
        margin-top:10px;
        padding-top:8px;
        border-top:1px dashed #999;
      }

      .tqr{
        width:65px;
        height:65px;
        object-fit:contain;
        flex-shrink:0;
      }

      .tqrtext{
        flex:1;
        font-size:8px;
        line-height:1.4;
        color:#333;
      }

      .tfoot-note{
        margin-top:8px;
        text-align:center;
        font-size:7.5px;
        color:#444;
        border-top:1px solid #ddd;
        padding-top:6px;
        line-height:1.4;
      }

      .ttipo{
        font-size:9px;
        font-weight:800;
        letter-spacing:1px;
        border:1.5px solid #000;
        background:#f3f3f3;
        color:#000;
        padding:2px 6px;
        border-radius:3px;
        white-space:nowrap;
        align-self:flex-start;
      }

      .tnm{
        font-size:18px;
        font-weight:900;
        letter-spacing:2px;
        color:#000;
        text-transform:uppercase;
      }

      .th{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        border-bottom:2px solid #000;
        padding-bottom:8px;
        margin-bottom:10px;
        gap:10px;
      }

      .tsub{
        font-size:8px;
        color:#222;
        margin-top:2px;
        font-weight:600;
      }

      .tlbl{
        font-size:8px;
        font-weight:800;
        color:#000;
        text-transform:uppercase;
        letter-spacing:.5px;
      }

      .tline{
        border-bottom:1.5px solid #000;
        min-height:14px;
        width:100%;
      }

      .tfirma{
        display:flex;
        margin-top:12px;
        padding-top:8px;
      }

      .talon{
        border:2px solid #000;
        border-radius:8px;
        padding:10px;
        background:#fff;
        height: 125mm;
      }

      .corte{
        text-align:center;
        font-size:9px;
        font-weight:900;
        color:#555;
        margin:8px 0;
        letter-spacing:3px;
        border-top:1px dashed #777;
        border-bottom:1px dashed #777;
        padding:4px 0;
      }
    @page{size:letter portrait;margin:6mm}
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;font-size:10px;color:#000;background:#fff}
    @media print{body{margin:0}}
  </style>
  </head><body>
  ${bloque("ORIGINAL (Taller)")}
  <div class="corte">✂ &nbsp; CORTAR AQUÍ &nbsp; ✂</div>
  ${bloque("COPIA (Cliente)")}
  <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),800)}<\/script>
  </body></html>`;
  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
}

// QR
function genQR() {
  const url = document.getElementById("qr-url").value;
  const b = document.getElementById("qr-box");
  b.innerHTML = "";
  new QRCode(b, {
    text: url,
    width: 160,
    height: 160,
    colorDark: "#000",
    colorLight: "#fff",
    correctLevel: QRCode.CorrectLevel.H,
  });
}
function prtQR() {
  const c = cfg();
  const url = document.getElementById("qr-url").value;
  const cv = document.querySelector("#qr-box canvas");
  const img = cv ? cv.toDataURL() : "";
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;text-align:center;padding:36px}.br{font-size:26px;font-weight:900;letter-spacing:4px}@media print{body{padding:18px}}</style>

</head><body><div class="br">${c.nombre}</div><p>${c.slogan}</p><img src="${img}" width="200" height="200" style="margin:18px auto;display:block;border:2px solid #000;padding:7px"><p><b>Escanea para ver nuestro Aviso de Privacidad</b></p><p style="font-size:11px">${url}</p><p style="font-size:11px">${c.dir}</p><script>window.onload=()=>{window.print();setTimeout(()=>window.close(),500)}<\/script></body></html>`;
  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
}
function printARPAG80(data) {
  const c = cfg();

  const d = data.documento;

  const pago = data.movimientoActual || data.ultimoPago;

  // ==========================
  // DATOS FINANCIEROS DEL DOCUMENTO
  // ==========================

  const descuentoDocumento = Number(d?.pago_descuento ?? pago?.descuento ?? 0);

  const motivoDocumento =
    d?.pago_motivo_descuento ?? pago?.motivo_descuento ?? "-";

  const autorizoDocumento =
    d?.pago_descuento_info?.usuario ??
    pago?.descuento_info?.usuario ??
    pago?.usuario ??
    "-";

  const html = `
              <!DOCTYPE html>
            <html>
            <head>
            <meta charset="UTF-8">

            <style>

            @page{
              margin:3mm;
            }

            *{
              box-sizing:border-box;
            }

            body{
              font-family:Arial,Helvetica,sans-serif;
              max-width:76mm;
              margin:0 auto;
              color:#000;
              background:#fff;
              font-size:10px;
            }

            .hd{
              text-align:center;
              border-bottom:2px solid #000;
              padding-bottom:8px;
            }

            .logo{
              display:block;
              margin:0 auto 4px;
              max-width:220px;
            }

            .sub{
              font-size:9px;
              line-height:1.4;
            }

            .row{
              display:flex;
              justify-content:space-between;
              align-items:flex-start;
              gap:8px;
              margin:3px 0;
              line-height:1.35;
            }

            .row span:first-child{
              flex:1;
            }

            .row span:last-child{
              text-align:right;
              white-space:nowrap;
              font-weight:bold;
            }

            .ttl{
              text-align:center;
              font-size:16px;
              font-weight:bold;
              border-top:2px solid #000;
              border-bottom:2px solid #000;
              padding:6px;
              margin:10px 0;
            }

            .qr-poligar{
                  display:block;
                  margin:10px auto;
                  width:100px;
                  height:auto;
                }

            .onara{
              display:block;
              margin:8px auto 4px;
              width:100px;
              height:auto;

            </style>

            </head>

            <body>

            <div class="hd">

             <img src="${ASSETS.ARATECH_TERMICO}" class="logo">

              <div class="sub">
                DESDE 2023
              </div>

              <div class="sub">
                Allende 246 · Col. Obrera · Ameca, Jalisco · C.P. 46620
              </div>

               <div class="sub">
                Envíanos un WhatsApp o llámanos:
              </div>

              <div class="sub">
                Taller: 375 690 5296
              </div>

              <div class="sub">
                Soporte: 375 119 9699
              </div>

              <div class="sub">
                Instagram/facebook: @aratechameca
              </div>

            </div>

            <div style="margin-top:10px">

            <div style="
                text-align:center;
                font-weight:bold;
                font-size:12px;
                border-bottom:1px solid #000;
                padding-bottom:5px;
              ">

              ${
                pago?.tipo_movimiento === "DEVOLUCION"
                  ? "COMPROBANTE DE DEVOLUCIÓN"
                  : pago?.tipo_movimiento === "AJUSTE"
                    ? "COMPROBANTE DE AJUSTE"
                    : "COMPROBANTE DE PAGO"
              }

              </div>

            </div>

            ${pago?.folio || ""}

            </div>

            <div style="margin-top:10px">


            <div class="row">
                <span><b>Cliente</b></span>
                <span>${d.cliente_nombre || ""}</span>
            </div>

            <div class="row">
                <span><b>Documento</b></span>
                <span>${d.folio || ""}</span>
            </div>

            <div class="row">
                <span><b>Fecha</b></span>
                <span>${pago?.fecha || ""}</span>
            </div>

            <div class="row">
                <span><b>Hora</b></span>
                <span>${pago?.hora || ""}</span>
            </div>

            <div class="row">
               <span><b>Movimiento</b></span>

            <span>

            ${pago?.tipo_movimiento === "DEVOLUCION" ? "DEVOLUCIÓN" : "PAGO"}

            </span>
            </div>

            <hr>

            <div class="row">
                <span><b>TOTAL DEL DOCUMENTO</b></span>
                <span>${mxn(pago?.total_documento || data.total || 0)}</span>
            </div>

            ${
              descuentoDocumento > 0
                ? `
            <div class="row">
                <span>Descuento autorizado</span>
                <span>-${mxn(descuentoDocumento)}</span>
            </div>

            <div class="row">
                <span>Motivo</span>
                <span>${motivoDocumento}</span>
            </div>

            <div class="row">
                <span>Autorizó</span>
                <span>${autorizoDocumento}</span>
            </div>
            `
                : ""
            }

            <div class="row">
                <span>Saldo anterior</span>
                <span>${mxn(pago?.saldo_anterior || 0)}</span>
            </div>

            <div class="row">
                <span>
                    ${
                      pago?.tipo_movimiento === "DEVOLUCION"
                        ? "Importe devuelto"
                        : "Pago de hoy"
                    }
                </span>

                <span>
                    ${mxn(Math.abs(Number(pago?.total_pagado || 0)))}
                </span>
            </div>

            ${
              pago?.tipo_movimiento === "DEVOLUCION"
                ? `
            <div class="row">
                <span>Motivo</span>
                <span>${pago?.motivo_devolucion || "-"}</span>
            </div>

            <div class="row">
                <span>Autorizó</span>
                <span>${pago?.usuario || "-"}</span>
            </div>
            `
                : ""
            }

            <div class="row">
                <span><b>Saldo pendiente</b></span>
                <span><b>${mxn(Math.max(0, Number(pago?.saldo_nuevo || 0)))}</b></span>
            </div>

            <hr style="
                margin:10px 0;
                border:none;
                border-top:1px solid #bdbdbd;
            ">

            <div class="row">
                <span><b>Estado del documento</b></span>
                <span>

                ${
                  Number(data.saldo || 0) <= 0
                    ? "🟢 LIQUIDADO"
                    : d.estado === "Cancelado"
                      ? "🔴 CANCELADO"
                      : "🟠 PENDIENTE"
                }


              <hr style="margin:10px 0;border:none;border-top:1px dashed #000">

                </span>
            </div>

            <hr>

            <div class="row">
                <span>Pago recibido</span>
                <span>${mxn((pago?.total_pagado || 0) + (pago?.cambio || 0))}</span>
            </div>

            <div class="row">
                <span>Cambio</span>
                <span>${mxn(pago?.cambio || 0)}</span>
            </div>

            <hr>

            <div style="
            text-align:center;
            font-size:11px;
            line-height:1.5;
            margin:10px 0;">

            Este comprobante acredita únicamente
            el movimiento financiero registrado.

            No sustituye la Orden de Servicio,
            Venta o Factura.

            <hr style="margin:14px 0;border:none;border-top:1px solid #000">

              <img src="${ASSETS.QR_POLYGAR}" class="qr-poligar">

              <div style="
                margin-top:20px;
                text-align:center;

                
              <div style="
                text-align:center;
                font-size:9px;
              ">

                Escanea el código QR para consultar
                políticas, garantías y condiciones
                del servicio.

              </div>
          

            <hr style="margin:14px 0;border:none;border-top:1px solid #000">

             <div class="footer">

                <div style="
                  font-size:11px;
                  font-weight:bold;
                  text-align:center;
                  margin-top:14px;
                  margin-bottom:14px;
                ">
                  ¡GRACIAS POR CONFIAR EN ARATECH!
                </div>

            <hr style="margin:14px 0;border:none;border-top:1px solid #000">


                <img src="${ASSETS.ONARA_TERMICO}" class="onara">

              </div>

      

            <script>

            window.onload=()=>{

            setTimeout(()=>{

            window.print();

            },300);

            };

            window.onafterprint=()=>{

            window.close();

            };

            <\/script>

            </body>

            </html>
            `;

  const w = window.open("", "_blank");

  w.document.write(html);

  w.document.close();
}

function printARPAG58(data) {
  const c = cfg();

  const d = data.documento;

  const pago = data.movimientoActual || data.ultimoPago;

  // ==========================
  // DATOS FINANCIEROS DEL DOCUMENTO
  // ==========================

  const descuentoDocumento = Number(d?.pago_descuento ?? pago?.descuento ?? 0);

  const motivoDocumento =
    d?.pago_motivo_descuento ?? pago?.motivo_descuento ?? "-";

  const autorizoDocumento =
    d?.pago_descuento_info?.usuario ??
    pago?.descuento_info?.usuario ??
    pago?.usuario ??
    "-";

  const html = `
             <!DOCTYPE html>
            <html>
            <head>
            <meta charset="UTF-8">

            <style>

            @page{
              margin:3mm;
            }

            *{
              box-sizing:border-box;
            }

            body{
              font-family:Arial,Helvetica,sans-serif;
              max-width:54mm;
              margin:0 auto;
              color:#000;
              background:#fff;
              font-size:10px;
            }

            .hd{
              text-align:center;
              border-bottom:2px solid #000;
              padding-bottom:8px;
            }

            .logo{
              display:block;
              margin:0 auto 4px;
              max-width:220px;
            }

            .sub{
              font-size:9px;
              line-height:1.4;
            }

            .row{
              display:flex;
              justify-content:space-between;
              align-items:flex-start;
              gap:8px;
              margin:3px 0;
              line-height:1.35;
            }

            .row span:first-child{
              flex:1;
            }

            .row span:last-child{
              text-align:right;
              white-space:nowrap;
              font-weight:bold;
            }

            .ttl{
              text-align:center;
              font-size:16px;
              font-weight:bold;
              border-top:2px solid #000;
              border-bottom:2px solid #000;
              padding:6px;
              margin:10px 0;
            }

            .qr-poligar{
                  display:block;
                  margin:10px auto;
                  width:100px;
                  height:auto;
                }

            .onara{
              display:block;
              margin:8px auto 4px;
              width:100px;
              height:auto;

            </style>

            </head>

            <body>

            <div class="hd">

             <img src="${ASSETS.ARATECH_TERMICO}" class="logo">

              <div class="sub">
                DESDE 2023
              </div>

              <div class="sub">
                Allende 246 · Col. Obrera · Ameca, Jalisco · C.P. 46620
              </div>

               <div class="sub">
                Envíanos un WhatsApp o llámanos:
              </div>

              <div class="sub">
                Taller: 375 690 5296
              </div>

              <div class="sub">
                Soporte: 375 119 9699
              </div>

              <div class="sub">
                Instagram/facebook: @aratechameca
              </div>

            </div>

            <div style="margin-top:10px">

            <div style="
              text-align:center;
              font-weight:bold;
              font-size:12px;
              border-bottom:1px solid #000;
              padding-bottom:5px;
            ">

            ${
              pago?.tipo_movimiento === "DEVOLUCION"
                ? "COMPROBANTE DE DEVOLUCIÓN"
                : pago?.tipo_movimiento === "AJUSTE"
                  ? "COMPROBANTE DE AJUSTE"
                  : "COMPROBANTE DE PAGO"
            }

            </div>

            ${pago?.folio || ""}

            </div>

            <div style="margin-top:10px">


            <div class="row">
                <span><b>Cliente</b></span>
                <span>${d.cliente_nombre || ""}</span>
            </div>

            <div class="row">
                <span><b>Documento</b></span>
                <span>${d.folio || ""}</span>
            </div>

            <div class="row">
                <span><b>Fecha</b></span>
                <span>${pago?.fecha || ""}</span>
            </div>

            <div class="row">
                <span><b>Hora</b></span>
                <span>${pago?.hora || ""}</span>
            </div>

            <div class="row">
               <span><b>Movimiento</b></span>

            <span>

            ${pago?.tipo_movimiento === "DEVOLUCION" ? "DEVOLUCIÓN" : "PAGO"}

            </span>
            </div>

            <hr>

            <div class="row">
                <span><b>TOTAL DEL DOCUMENTO</b></span>
                <span>${mxn(pago?.total_documento || data.total || 0)}</span>
            </div>

            ${
              descuentoDocumento > 0
                ? `
            <div class="row">
                <span>Descuento autorizado</span>
                <span>-${mxn(descuentoDocumento)}</span>
            </div>

            <div class="row">
                <span>Motivo</span>
                <span>${motivoDocumento}</span>
            </div>

            <div class="row">
                <span>Autorizó</span>
                <span>${autorizoDocumento}</span>
            </div>
            `
                : ""
            }

            <hr style="margin:10px 0;border:none;border-top:1px dashed #000">

            <div class="row">
                <span>Saldo anterior</span>
                <span>${mxn(pago?.saldo_anterior || 0)}</span>
            </div>

            <div class="row">
                <span>
                    ${
                      pago?.tipo_movimiento === "DEVOLUCION"
                        ? "Importe devuelto"
                        : "Pago de hoy"
                    }
                </span>

                <span>
                    ${mxn(Math.abs(Number(pago?.total_pagado || 0)))}
                </span>
            </div>

            ${
              pago?.tipo_movimiento === "DEVOLUCION"
                ? `
            <div class="row">
                <span>Motivo</span>
                <span>${pago?.motivo_devolucion || "-"}</span>
            </div>

            <div class="row">
                <span>Autorizó</span>
                <span>${pago?.usuario || "-"}</span>
            </div>
            `
                : ""
            }

            <hr style="margin:10px 0;border:none;border-top:1px dashed #000">

            <div class="row">
                <span><b>Saldo pendiente</b></span>
                <span><b>${mxn(Math.max(0, Number(pago?.saldo_nuevo || 0)))}</b></span>
            </div>

            <hr style="
                margin:10px 0;
                border:none;
                border-top:1px solid #bdbdbd;
            ">
            
            <div class="row">
                <span><b>Estado del documento</b></span>
                <span>

                ${
                  Number(data.saldo || 0) <= 0
                    ? "🟢 LIQUIDADO"
                    : d.estado === "Cancelado"
                      ? "🔴 CANCELADO"
                      : "🟠 PENDIENTE"
                }

                <hr style="margin:10px 0;border:none;border-top:1px dashed #000">

                </span>
            </div>

            <hr>

            <div class="row">
                <span>Pago recibido</span>
                <span>${mxn((pago?.total_pagado || 0) + (pago?.cambio || 0))}</span>
            </div>

            <div class="row">
                <span>Cambio</span>
                <span>${mxn(pago?.cambio || 0)}</span>
            </div>

            <hr>

            <div style="
            text-align:center;
            font-size:11px;
            line-height:1.5;
            margin:10px 0;">

            Este comprobante acredita únicamente
            el movimiento financiero registrado.

            No sustituye la Orden de Servicio,
            Venta o Factura.

            <hr style="margin:14px 0;border:none;border-top:1px solid #000">

              <img src="${ASSETS.QR_POLYGAR}" class="qr-poligar">

              <div style="
                margin-top:20px;
                text-align:center;

                
              <div style="
                text-align:center;
                font-size:9px;
              ">

                Escanea el código QR para consultar
                políticas, garantías y condiciones
                del servicio.

              </div>
      

            <hr style="margin:14px 0;border:none;border-top:1px solid #000">

             <div class="footer">

                <div style="
                  font-size:11px;
                  font-weight:bold;
                  text-align:center;
                  margin-top:14px;
                  margin-bottom:14px;
                ">
                  ¡GRACIAS POR CONFIAR EN ARATECH!
                </div>

            <hr style="margin:14px 0;border:none;border-top:1px solid #000">


                <img src="${ASSETS.ONARA_TERMICO}" class="onara">

              </div>

      

            <script>

            window.onload=()=>{

            setTimeout(()=>{

            window.print();

            },300);

            };

            window.onafterprint=()=>{

            window.close();

            };

            <\/script>

            </body>

            </html>
            `;

  const w = window.open("", "_blank");

  w.document.write(html);

  w.document.close();
}

function printEstadoCuenta(data) {
  const c = cfg();

  const d = data.documento;

  const pago = data.movimientoActual || data.ultimoPago;

  const historial = data.historial || [];

  const html = `
  <!DOCTYPE html>
  
<html>
<head>
  <meta charset="UTF-8">
  ${araHeaderHTML(
    c,
    "Estado de Cuenta",
    "Documento",
    d.folio,
    "Periodo consultado",
    `${fmt(d.fecha)}<br><span style="font-size:9px;">al</span><br>${fmt(new Date())}`,
    "Emitido",
    `${fmt(new Date())}<br>${new Date().toLocaleTimeString()}`,
  )}

</head>
<body>
  <div class="ara-sec">

    <div class="ara-sec-hd">

        <span class="ara-sec-title">
            Información del Cliente
        </span>

    </div>

    <div class="ara-sec-body">

        <div class="ara-row2">

            <div class="ara-field">
                <span class="ara-field-label">Cliente</span>
                <span class="ara-field-value">${d.cliente_nombre}</span>
            </div>

            <div class="ara-field">
                <span class="ara-field-label">Teléfono</span>
                <span class="ara-field-value">${d.tel || "—"}</span>
            </div>

        </div>

        <div class="ara-row2">

            <div class="ara-field">
                <span class="ara-field-label">Documento</span>
                <span class="ara-field-value">${d.folio}</span>
            </div>

            <div class="ara-field">
                <span class="ara-field-label">Estado</span>
               <span class="ara-field-value">
                  ${d.pago_estado || "PENDIENTE"}
              </span>
            </div>

                        <div class="ara-field">
                <span class="ara-field-label">
                    Movimientos registrados
                </span>

                <span class="ara-field-value">
                    ${historial.length}
                </span>
            </div>



        </div>

    </div>

</div>

<div class="ara-sec">

    <div class="ara-sec-hd-blue">

        <span class="ara-sec-title">
            Resumen Financiero
        </span>

    </div>

    <div class="ara-sec-body" style="padding:0">

        <table class="ara-table">

            <tbody>

                <tr>

                    <td>Total del documento</td>

                    <td class="r">
                        ${mxn(data.total)}
                    </td>

                </tr>

                ${
                  (d.pago_descuento || 0) > 0
                    ? `

                <tr>

                    <td>Descuento aplicado</td>

                    <td class="r">
                        -${mxn(d.pago_descuento)}
                    </td>

                </tr>

                <tr>

                    <td>Motivo</td>

                    <td class="r">
                        ${d.pago_motivo_descuento || "-"}

                    </td>

                </tr>

                `
                    : ""
                }

                <tr>

                    <td>Total abonado</td>

                    <td class="r">
                        ${mxn(data.pagado)}
                    </td>

                </tr>

                <tr>
                    <td>Último abono</td>
                    <td class="r">
                        ${mxn(pago?.total_pagado || 0)}
                    </td>
                </tr>

                <tr>

                    <td><strong>Saldo pendiente</strong></td>

                    <td class="r">
                        <strong>${mxn(data.saldo)}</strong>
                    </td>

                    <tr>
                        <td><strong>Estado financiero</strong></td>

                        <td class="r">

                            <strong>

                            ${
                              d.pago_estado === "LIQUIDADO"
                                ? "🟢 LIQUIDADO"
                                : d.pago_estado === "CANCELADO"
                                  ? "🔴 CANCELADO"
                                  : d.pago_estado === "DEVUELTO"
                                    ? "🟣 DEVUELTO"
                                    : "🟠 PENDIENTE"
                            }

                            </strong>

                        </td>

                    </tr>

                </tr>

            </tbody>

        </table>

    </div>

</div>

<div class="ara-sec">

    <div class="ara-sec-hd-blue">

        <span class="ara-sec-title">
            Historial de Movimientos
        </span>

    </div>

    <div class="ara-sec-body" style="padding:0">

        <table class="ara-table">

            <thead>

            <tr>

            <th>Movimiento</th>

            <th>Fecha</th>

            <th>Hora</th>

            <th>Folio</th>

            <th>Método</th>

            <th>Usuario</th>

            <th class="r">Importe</th>

            <th class="r">Saldo</th>

            </tr>

            </thead>

            <tbody>

           ${
             historial.length
               ? historial
                   .map(
                     (p, i) => `

            <tr>

            <td>

            ${
              p.tipo_movimiento === "DEVOLUCION"
                ? "💸 Devolución de pago"
                : "💵 Pago"
            }

            </td>

            <td>${p.fecha}</td>

            <td>${p.hora}</td>

            <td>${p.folio}</td>

            <td>${p.forma_pago}</td>

            <td>

            ${p.usuario}

            ${
              p.descuento > 0
                ? `
            <br>
            <small style="color:#b45309">

            🏷️ ${mxn(p.descuento)}

            </small>
            `
                : ""
            }

            </td>

            <td
                class="r"
                style="color:${
                  p.tipo_movimiento === "DEVOLUCION" ? "#d32f2f" : "#2e7d32"
                }">

                ${mxn(Math.abs(Number(p.total_pagado || 0)))}

            </td>

            <td class="r">

                ${mxn(Number(p.saldo_nuevo || 0))}

            </td>

            `,
                   )
                   .join("")
               : `

            <tr>

            <td colspan="8" style="text-align:center">

            Sin movimientos registrados.

            </td>

            </tr>

            `
           }

            </tbody>

        </table>

    </div>

</div>

<div class="ara-sec">

    <div class="ara-sec-hd-blue">

        <span class="ara-sec-title">
            Notas del documento
        </span>

    </div>

    <div class="ara-sec-body">

        <div class="ara-field">

            <span class="ara-field-value">

                ${pago?.observaciones || "Sin observaciones."}

            </span>

            ${
              pago?.descuento > 0
                ? `

              <br><br>

              <strong>Descuento aplicado</strong><br>

              Importe:
              ${mxn(pago.descuento)}

              <br>

              Motivo:
              ${pago.motivo_descuento}

              <br>

              Autorizó:
              ${pago.descuento_info?.usuario || "-"}

              <br>

              Fecha:
              ${pago.descuento_info?.fecha || "-"}

              ${pago.descuento_info?.hora ? " " + pago.descuento_info.hora : ""}

              `
                : ""
            }

        </div>

    </div>

</div>

<!-- AQUÍ COMIENZA EL NUEVO BLOQUE -->

<div class="ara-sec">

    <div class="ara-sec-hd-blue">

        <span class="ara-sec-title">

            Resumen del periodo

        </span>

    </div>

    <div class="ara-sec-body">

        <div class="ara-row2">

            <div class="ara-field">

                <span class="ara-field-label">

                    Periodo

                </span>

                <span class="ara-field-value">

                    ${fmt(d.fecha)} — ${fmt(new Date())}

                </span>

            </div>

            <div class="ara-field">

                <span class="ara-field-label">

                    Movimientos

                </span>

                <span class="ara-field-value">

                    ${historial.length}

                </span>

            </div>

        </div>

        <div class="ara-row2">

            <div class="ara-field">

                <span class="ara-field-label">

                    Total abonado

                </span>

                <span class="ara-field-value">

                    ${mxn(data.pagado)}

                </span>

            </div>

            ${
              (data.devoluciones || 0) > 0
                ? `
            <tr>

                <td>Total devuelto</td>

                <td class="r">

                    ${mxn(data.devoluciones)}

                </td>

            </tr>
            `
                : ""
            }

            <div class="ara-field">

                <span class="ara-field-label">

                    Saldo vigente

                </span>

                <span class="ara-field-value">

                    ${mxn(data.saldo)}

                </span>

            </div>

        </div>

    </div>

</div>

<div class="ara-gar-box">

    <strong>IMPORTANTE</strong><br><br>

    Este Estado de Cuenta constituye el registro oficial de los movimientos financieros asociados al presente documento conforme al Libro Mayor de ARATECH.

    Los importes reflejan el saldo vigente al momento de su emisión.

    Este documento tiene fines administrativos y no sustituye un CFDI, Factura o Comprobante Fiscal.

</div>
 ${araFooterestadoHTML(c)}
  <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),500)}<\/script>
</body>
</html>`;

  const w = window.open("", "_blank");

  w.document.write(html);

  w.document.close();
}

window.rndFmt = rndFmt;

window.prtOrd = prtOrd;
window.prtVta = prtVta;
window.prtGar = prtGar;

window.prtTalon = prtTalon;

window.genQR = genQR;
window.prtQR = prtQR;

window.printARPAG80 = printARPAG80;
window.printARPAG58 = printARPAG58;
window.printEstadoCuenta = printEstadoCuenta;
