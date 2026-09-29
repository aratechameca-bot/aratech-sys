// GARANTIAS
function rndGar() {
  const todas = DB.get("garantias");

  let gs = [...todas];

  const cfg = DB.obj("config");

  const aviso = parseInt(cfg.cfg_ga || 7);

  switch (garFiltro) {
    case "activas":
      gs = gs.filter((g) => g.estado === "Activa");

      break;

    case "vencidas":
      gs = gs.filter((g) => diasE(hoy(), g.fecha_gar) < 0);

      break;

    case "canceladas":
      gs = gs.filter((g) => g.estado === "Cancelada");
      break;

    case "vencer":
      gs = gs.filter((g) => {
        const d = diasE(hoy(), g.fecha_gar);

        return d >= 0 && d <= aviso;
      });

      break;

    case "hoy":
      gs = gs.filter((g) => diasE(hoy(), g.fecha_gar) === 0);

      break;

    case "mes":
      gs = gs.filter((g) => {
        const hoyDate = new Date();

        const finMes = new Date(
          hoyDate.getFullYear(),
          hoyDate.getMonth() + 1,
          0,
        );

        const f = new Date(g.fecha_gar);

        return f >= hoyDate && f <= finMes;
      });

      break;
  }

  const q = (document.getElementById("gar-search")?.value || "")
    .toLowerCase()
    .trim();

  if (q) {
    gs = gs.filter((g) => {
      return [
        g.folio,
        g.cliente_nombre,
        g.tel,
        g.tipo_equipo,
        g.modelo,
        g.serie,
        g.servicio,
        g.folio_vta,
        g.folio_ord,
        g.tipo_gar,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }
  const tb = document.getElementById("tb-gar");
  // Resumen de garantías
  const resDiv = document.getElementById("gar-resumen");
  if (resDiv) {
    const activas = todas.filter(
      (g) => g.estado === "Activa" && diasE(hoy(), g.fecha_gar) >= 0,
    ).length;

    const vencidas = todas.filter(
      (g) => g.estado !== "Cancelada" && diasE(hoy(), g.fecha_gar) < 0,
    ).length;

    const proximas = todas.filter((g) => {
      const d = diasE(hoy(), g.fecha_gar);
      return d >= 0 && d <= aviso;
    }).length;

    const canceladas = todas.filter((g) => g.estado === "Cancelada").length;

    resDiv.innerHTML = `


    <div class="gar-kpi ${garFiltro === "todas" ? "active" : ""}"
    onclick="setGarFiltro('todas')">

    <div style="font-size:34px;margin-bottom:6px"><i class="ar-icon garantia"></i></div>

    <div class="gar-kpi-num">

    ${todas.length}

    </div>

    <div class="gar-kpi-title">

    Todas

    </div>

    </div>

    <div class="gar-kpi ${garFiltro === "activas" ? "active" : ""}"
    onclick="setGarFiltro('activas')">

    <div style="font-size:34px;margin-bottom:6px"><i class="ar-icon success"></i></div>

    <div class="gar-kpi-num" style="color:var(--green)">

    ${activas}

    </div>

    <div class="gar-kpi-title">

    Activas

    </div>

    </div>

    <div class="gar-kpi ${garFiltro === "vencer" ? "active" : ""}"
    onclick="setGarFiltro('vencer')">

    <div style="font-size:34px;margin-bottom:6px"><i class="ar-icon warning"></i></div>

    <div class="gar-kpi-num" style="color:var(--orange)">

    ${proximas}

    </div>

    <div class="gar-kpi-title">

    Por vencer

    </div>

    </div>

    <div class="gar-kpi ${garFiltro === "vencidas" ? "active" : ""}"
    onclick="setGarFiltro('vencidas')">

    <div style="font-size:34px;margin-bottom:6px"><i class="ar-icon error"></i></div>

    <div class="gar-kpi-num" style="color:var(--red)">

    ${vencidas}

    </div>

    <div class="gar-kpi-title">

    Vencidas

    </div>

    </div>

    <div
        class="gar-kpi ${garFiltro === "canceladas" ? "active" : ""}"
        onclick="setGarFiltro('canceladas')">

        <div style="font-size:34px;margin-bottom:6px"><i class="ar-icon cancel"></i></div>

        <div class="gar-kpi-num" style="color:var(--red)">
          ${canceladas}
        </div>

        <div class="gar-kpi-title">
          Canceladas
        </div>

      </div>

    `;

    window.refreshIcons(resDiv);
  }
  if (!gs.length) {
    tb.innerHTML = `
    <tr>
        <td colspan="9" class="nd">

            ${q ? "No se encontraron garantías." : "Sin garantías registradas."}

        </td>
    </tr>`;
    return;
  }

  tb.innerHTML = gs
    .map((g) => {
      const d = g.fecha_gar ? diasE(hoy(), g.fecha_gar) : 999;

      let sc, tc, tt;

      if (g.estado === "Cancelada") {
        sc = "sr";
        tc = "tr";
        tt = "Cancelada";
      } else {
        sc = d < 0 ? "sr" : d <= aviso ? "so" : "sg";

        tc = d < 0 ? "tr" : d <= aviso ? "to" : "tg";

        tt = d < 0 ? "Vencida" : d <= aviso ? "Por vencer" : "Vigente";
      }
      return `
              <tr>

                <td style="
                    font-family:var(--fh);
                    font-size:11px">

                    <a
                      href="javascript:void(0)"
                      onclick="verGar('${g.id}')"
                      style="
                        color:var(--accent);
                        font-weight:700;
                        text-decoration:none;
                        cursor:pointer">

                      ${g.folio}

                    </a>

                  </td>

                  <td style="font-size:11px;white-space:nowrap">

                        ${
                          g.folio_vta
                            ? `
                            <a
                                href="javascript:void(0)"
                                onclick="openVenta('${g.folio_vta}')"
                                style="
                                    display:inline-block;
                                    padding:2px 8px;
                                    border-radius:8px;
                                    background:rgba(34,197,94,.12);
                                    color:var(--green);
                                    font-size:10px;
                                    font-weight:700;
                                    text-decoration:none;
                                    letter-spacing:.5px;">

                                VENTA

                            </a>

                            <span style="margin-left:6px;font-weight:600">

                                ${g.folio_vta}

                            </span>
                            `
                            : `
                            <a
                                href="javascript:void(0)"
                                onclick="openExp('${g.folio_ord}')"
                                style="
                                    display:inline-block;
                                    padding:2px 8px;
                                    border-radius:8px;
                                    background:rgba(30,144,255,.12);
                                    color:var(--accent);
                                    font-size:10px;
                                    font-weight:700;
                                    text-decoration:none;
                                    letter-spacing:.5px;">

                                ORDEN

                            </a>

                            <span style="margin-left:6px;font-weight:600">

                                ${g.folio_ord || "—"}

                            </span>
                            `
                        }

                      </td>

                      <td>

                        <a
                            href="javascript:void(0)"
                            onclick="viewCli('${g.cliente_id}')"
                            style="
                                color:var(--accent);
                                font-weight:600;
                                text-decoration:underline;">

                            ${g.cliente_nombre}

                        </a>

                      </td>

                <td style="font-size:11px">
                  ${g.tipo_equipo || ""}
                  ${g.modelo || ""}
                </td>

                <td style="font-size:11px">

                  ${g.servicio}

                  ${
                    g.total_piezas > 1
                      ? `<div style="
                          font-size:10px;
                          color:var(--accent);
                          font-weight:600;
                        ">
                          Pieza ${g.pieza} de ${g.total_piezas}
                        </div>`
                      : ""
                  }

                </td>

                <td style="font-size:10px">
                  ${fmt(g.fecha)}
                </td>

                <td style="font-size:10px">
                  ${fmt(g.fecha_gar)}
                </td>

                <td style="
                  font-family:var(--fh);
                  font-size:15px;
                  color:${
                    d < 0
                      ? "var(--red)"
                      : d <= aviso
                        ? "var(--orange)"
                        : "var(--green)"
                  }">

                  ${d < 0 ? "Venció" : d}

                  ${d >= 0 ? "días" : ""}

                </td>

                <td>
                  <span class="sm ${sc}"></span>
                  <span class="tag ${tc}">
                    ${tt}
                  </span>
                </td>

               <td class="bg-btn">

    <div class="bg-btn-wrap">

        <button
            class="btn bg bsm btn-acciones"
            data-id="${g.folio}"
            onclick="toggleAcciones(this)"
            title="Acciones">
            <i class="ar-icon menu"></i>
        </button>

    </div>

    <div class="acciones-card">

        <button
            class="btn bg bsm"
            onclick="prtGar('${g.folio}','carta')"
            title="Ver garantía">
            <i class="ar-icon archivo"></i> Ver garantía
        </button>

        <button
            class="btn bg bsm"
            onclick="prtGar('${g.folio}','58mm')"
            title="Ticket 58 mm">
            58 Ticket 58 mm
        </button>

        <button
            class="btn bg bsm"
            onclick="prtGar('${g.folio}','80mm')"
            title="Ticket 80 mm">
            80 Ticket 80 mm
        </button>

    </div>

</td>

              </tr>
            `;
    })
    .join("");

  window.refreshIcons(tb);
}

function verGar(id) {
  const g = DB.get("garantias").find((x) => x.id === id);

  if (!g) return;

  const cfg = DB.obj("config");
  const aviso = parseInt(cfg.cfg_ga || 7);

  const dias = g.fecha_gar ? diasE(hoy(), g.fecha_gar) : 999;

  let estado = "Vigente";
  let color = "var(--green)";
  let icon = "shield-check";

  // ======================================
  // VALIDACIÓN DE REINGRESO
  // ======================================

  const permiteReingreso = g.estado === "Activa" && dias >= 0;

  if (g.estado === "Cancelada") {
    estado = "Cancelada";
    color = "var(--red)";
    icon = "shield-x";
  } else if (dias < 0) {
    estado = "Vencida";
    color = "var(--red)";
    icon = "shield-x";
  } else if (dias <= aviso) {
    estado = "Por vencer";
    color = "var(--orange)";
    icon = "shield-alert";
  }

  const origen = g.folio_ord
    ? {
        icon: '<i class="ar-icon herramientas"></i>',
        titulo: "Orden de Servicio",
        folio: g.folio_ord,
      }
    : {
        icon: '<i class="ar-icon formato"></i>',
        titulo: "Venta",
        folio: g.folio_vta,
      };

  document.getElementById("gar-view-body").innerHTML = `

<div class="gar-wrap">

    <div class="gar-header">

        <div>

            <div class="gar-folio">
                ${g.folio}
            </div>

            <div class="gar-sub">
                Garantía registrada
            </div>

        </div>

        <div
            class="gar-status"
            style="color:${color};border-color:${color};">

            ${estado}

        </div>

    </div>


    <div class="gar-grid">

        <div>

            <div class="gar-card">

                <div class="gar-card-title">
                    Origen
                </div>

                <div class="gar-row">
                    <span class="gar-label">Tipo</span>
                    <span class="gar-value">
                        ${origen.icon} ${origen.titulo}
                    </span>
                </div>

                <div class="gar-row">
                    <span class="gar-label">Folio</span>
                    <span class="gar-value">
                        ${origen.folio || "-"}
                    </span>
                </div>

            </div>


            <div class="gar-card" style="margin-top:16px">

                <div class="gar-card-title">
                    Información
                </div>

                <div class="gar-row">
                    <span class="gar-label">Cliente</span>
                    <span class="gar-value">${g.cliente_nombre || "-"}</span>
                </div>

                <div class="gar-row">
                    <span class="gar-label">Teléfono</span>
                    <span class="gar-value">${g.tel || "-"}</span>
                </div>

                <div class="gar-row">
                    <span class="gar-label">Equipo</span>
                    <span class="gar-value">${g.tipo_equipo || "-"}</span>
                </div>

                <div class="gar-row">
                    <span class="gar-label">Modelo</span>
                    <span class="gar-value">${g.modelo || "-"}</span>
                </div>

                <div class="gar-row">
                    <span class="gar-label">Serie / SKU</span>
                    <span class="gar-value">${g.serie || "-"}</span>
                </div>

                <div class="gar-row">
                    <span class="gar-label">Servicio</span>
                    <span class="gar-value">${g.servicio || "-"}</span>
                </div>

                <div class="gar-row">
                    <span class="gar-label">Técnico</span>
                    <span class="gar-value">${g.tecnico || "-"}</span>
                </div>

            </div>

        </div>


        <div>

            <div class="gar-mini">

                <div class="gar-box">

                    <div class="gar-box-title">
                        Fecha
                    </div>

                    <div class="gar-box-value">
                        ${fmt(g.fecha)}
                    </div>

                </div>

                <div class="gar-box">

                    <div class="gar-box-title">
                        Garantía
                    </div>

                    <div class="gar-box-value">
                        ${g.garantia_dias} días
                    </div>

                </div>

                <div class="gar-box">

                    <div class="gar-box-title">
                        Vence
                    </div>

                    <div class="gar-box-value">
                        ${fmt(g.fecha_gar)}
                    </div>

                </div>

                <div class="gar-box">

                    <div class="gar-box-title">
                        Días restantes
                    </div>

                    <div
                        class="gar-box-value"
                        style="color:${color};">

                        ${
                          g.estado === "Cancelada"
                            ? "Cancelada"
                            : dias < 0
                              ? "Vencida"
                              : dias + " días"
                        }

                    </div>

                </div>

            </div>

            <div class="gar-card" style="margin-top:18px">

                <div class="gar-card-title">

                    <i class="ar-icon garantia"></i> Reingresos

                    ${
                      Array.isArray(g.historial_reingresos) &&
                      g.historial_reingresos.length
                        ? ` <span style="
                                    float:right;
                                    font-size:11px;
                                    background:rgba(14,165,233,.15);
                                    color:var(--accent2);
                                    padding:2px 8px;
                                    border-radius:20px;
                                    font-weight:700;">
                                    ${g.historial_reingresos.length}
                                </span>`
                        : ""
                    }

                </div>

              
                ${
                  permiteReingreso
                    ? `

                    <div style="
                        padding:12px;
                        border-radius:10px;
                        background:rgba(34,197,94,.08);
                        border:1px solid rgba(34,197,94,.25);
                        margin-bottom:14px">

                        <div style="
                            color:var(--green);
                            font-weight:700;
                            margin-bottom:6px">

                            <i class="ar-icon success"></i> Garantía vigente

                        </div>

                        <div style="
                            font-size:12px;
                            color:var(--muted);
                            line-height:1.6">

                            Esta garantía puede recibir nuevamente el equipo
                            para una revisión o reparación.

                        </div>

                    </div>

                    <button
                        class="btn bg"
                        style="width:100%"
                        onclick="reingresarGarantia('${g.id}')">

                        <i class="ar-icon herramientas"></i> Reingresar equipo

                    </button>

                    <div style="
                        margin-top:10px;
                        font-size:11px;
                        color:var(--muted);
                        line-height:1.6">

                        Se abrirá una nueva Orden de Servicio
                        vinculada automáticamente con esta garantía.

                    </div>

                    `
                    : `

                    <div style="
                        padding:12px;
                        border-radius:10px;
                        background:rgba(239,68,68,.08);
                        border:1px solid rgba(239,68,68,.20)">

                        <div style="
                            color:var(--red);
                            font-weight:700;
                            margin-bottom:6px">

                            <i class="ar-icon error"></i> Garantía cerrada

                        </div>

                        <div style="
                            font-size:12px;
                            color:var(--muted);
                            line-height:1.6">

                            Esta garantía se conserva únicamente
                            como historial para consultas y aclaraciones.

                            <br><br>

                            Ya no es posible registrar nuevos
                            reingresos.

                        </div>

                    </div>

                    `
                }

                 ${
                   Array.isArray(g.historial_reingresos) &&
                   g.historial_reingresos.length
                     ? `

                        <div style="
                            margin-top:18px;
                            padding-top:14px;
                            border-top:1px solid rgba(255,255,255,.08);">

                            <div style="
                                font-weight:700;
                                margin-bottom:10px;
                                color:var(--accent2);">

                                Historial de reingresos

                            </div>

                            ${g.historial_reingresos
                              .map(
                                (r, i) => `

                                <div style="
                                    padding:10px;
                                    margin-bottom:8px;
                                    border-radius:8px;
                                    background:rgba(255,255,255,.04);
                                    border:1px solid rgba(255,255,255,.06);">

                                    <div style="
                                        font-size:12px;
                                        font-weight:700;
                                        margin-bottom:8px;">

                                        <i class="ar-icon refresh"></i> Reingreso #${i + 1}

                                    </div>

                                    <div style="
                                        font-size:11px;
                                        color:var(--text3);
                                        margin-bottom:4px;">

                                        <i class="ar-icon calendario"></i> ${r.fecha}

                                    </div>

                                    <div
                                        onclick="
                                        closeM('m-garantia');
                                        openExp('${r.orden}');
"
                                        style="
                                            color:var(--accent2);
                                            font-weight:700;
                                            cursor:pointer;
                                            text-decoration:underline;
                                            margin-bottom:4px;">

                                        <i class="ar-icon archivo"></i> ${r.orden}

                                    </div>

                                    <div style="
                                        font-size:11px;
                                        color:var(--text3);
                                        margin-bottom:2px;">

                                        <i class="ar-icon usuario"></i> ${r.usuario || "-"}

                                    </div>

                                    <div style="
                                        font-size:11px;
                                        color:var(--green);">

                                        <i class="ar-icon info"></i> ${r.estado || "-"}

                                    </div>

                                </div>

                            `,
                              )
                              .join("")}

                        </div>

                        `
                     : ""
                 }



            </div>

        </div>

    </div>

</div>

`;
  window.refreshIcons(document.getElementById("gar-view-body"));

  const carta = document.getElementById("gar-print-carta");
  const t80 = document.getElementById("gar-print-80");
  const t58 = document.getElementById("gar-print-58");

  if (carta) carta.onclick = () => prtGar(g.folio, "carta");
  if (t80) t80.onclick = () => prtGar(g.folio, "80mm");
  if (t58) t58.onclick = () => prtGar(g.folio, "58mm");

  openM("m-garantia");
}

// ======================================================
// NUEVA ORDEN DESDE GARANTÍA
// ======================================================

// ======================================================
// NUEVA ORDEN DESDE GARANTÍA
// ======================================================

function nuevaOrdenGarantia() {
  const gar = window.ordenContext?.garantia;

  if (!gar) return;

  // Limpiar formulario
  limpOrd();

  // ==========================
  // MOSTRAR BANNER
  // ==========================

  const banner = document.getElementById("ord-garantia-banner");

  if (banner) {
    banner.style.display = "block";

    banner.innerHTML = `
            <div style="
                font-weight:700;
                color:var(--accent2);
                font-size:14px;
                margin-bottom:6px;">

                🛡 REINGRESO POR GARANTÍA

            </div>

            <div style="
                font-size:12px;
                line-height:1.7">

                <b>Garantía:</b> ${gar.folio}<br>
                <b>Origen:</b> ${gar.folio_ord || gar.folio_vta || "-"}<br>

                Capture nuevamente el problema reportado,
                accesorios y estado físico del equipo.

            </div>
        `;
  }

  // ==========================
  // PRECARGAR CLIENTE
  // ==========================

  if (gar.cliente_id) {
    ordSeleccionarCliente(gar.cliente_id);
  }

  // ==========================
  // PRECARGAR EQUIPO
  // ==========================

  const selEquipo = document.getElementById("ord-teq");

  const opciones = [...selEquipo.options].map((o) => o.value);

  if (opciones.includes(gar.tipo_equipo)) {
    selEquipo.value = gar.tipo_equipo;
  } else {
    selEquipo.value = "Otro";

    document.getElementById("row-otro-eq").style.display = "";

    document.getElementById("ord-teq-otro").value = gar.tipo_equipo || "";
  }

  document.getElementById("ord-mod").value = gar.modelo || "";

  document.getElementById("ord-ser").value = gar.serie || "";

  // Abrir modal

  openM("m-orden");

  // Renderizar la lista de servicios vacía
  renderLS();

  // Enfocar el nuevo problema

  setTimeout(() => {
    document.getElementById("ord-prob")?.focus();
  }, 150);
}

function setGarFiltro(filtro) {
  garFiltro = filtro;

  rndGar();
}

async function eliminarGarantiasVenta(folioVenta) {
  const garantias = DB.get("garantias");

  const eliminar = garantias.filter((g) => g.folio_vta === folioVenta);

  if (!eliminar.length) return;

  // Eliminar de Firebase
  for (const g of eliminar) {
    await DATA.delete("garantias", g.id);
  }

  // Actualizar memoria local
  DB.set(
    "garantias",
    garantias.filter((g) => g.folio_vta !== folioVenta),
  );

  rndGar();
}

async function cancelarGarantiasVenta(folioVenta) {
  const garantias = DB.get("garantias");

  const lista = garantias.filter((g) => g.folio_vta === folioVenta);

  if (!lista.length) return;

  for (const g of lista) {
    g.estado = "Cancelada";
    g.fecha_cancelacion = hoy();
    g.usuario_cancelacion = currentUser?.nombre || "Sistema";

    await DATA.update("garantias", g.id, {
      estado: "Cancelada",

      fecha_cancelacion: g.fecha_cancelacion,

      usuario_cancelacion: g.usuario_cancelacion,
    });
  }

  rndGar();
}

async function cancelarGarantiasOrden(folioOrden) {
  const garantias = DB.get("garantias");

  const lista = garantias.filter((g) => g.folio_ord === folioOrden);

  if (!lista.length) return;

  for (const g of lista) {
    g.estado = "Cancelada";

    g.fecha_cancelacion = hoy();

    g.usuario_cancelacion = currentUser?.nombre || "Sistema";

    await DATA.update("garantias", g.id, {
      estado: g.estado,

      fecha_cancelacion: g.fecha_cancelacion,

      usuario_cancelacion: g.usuario_cancelacion,
    });
  }

  rndGar();
}

async function reingresarGarantia(id) {
  const g = DB.get("garantias").find((x) => x.id === id);

  if (!g) return;

  const dias = diasE(hoy(), g.fecha_gar);

  if (g.estado !== "Activa" || dias < 0) {
    ARABOT.alert({
      title: "Garantía no disponible",

      message: "Esta garantía ya no permite registrar reingresos.",

      details:
        "Las garantías vencidas o canceladas permanecen únicamente para consulta.",
    });

    return;
  }

  window.ordenContext = {
    tipo: "GARANTIA",

    garantia: g,
  };

  console.info(
    "[GARANTÍA] Reingreso iniciado:",
    g.folio,
    "Origen:",
    g.folio_ord || g.folio_vta || "-",
  );

  closeM("m-garantia");

  nuevaOrdenGarantia();
}

window.eliminarGarantiasVenta = eliminarGarantiasVenta;
window.rndGar = rndGar;
window.verGar = verGar;
window.cancelarGarantiasOrden = cancelarGarantiasOrden;
window.reingresarGarantia = reingresarGarantia;
window.nuevaOrdenGarantia = nuevaOrdenGarantia;
