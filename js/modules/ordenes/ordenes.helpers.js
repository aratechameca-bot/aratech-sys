// ============================================================
// ORDENES HELPERS
// ============================================================
async function generarGarantiasOrden(ord) {
  const cat = DB.get("cat");

  const serviciosConGarantia = (ord.servicios || []).filter((l) => {
    const s = cat.find((x) => x.nombre === l.svc);
    return s && s.garantia > 0;
  });

  const gs = DB.get("garantias");

  for (const svc of serviciosConGarantia) {
    const existe = gs.some(
      (g) =>
        g.folio_ord === ord.folio &&
        String(g.servicio).trim().toLowerCase() ===
          String(svc.svc).trim().toLowerCase(),
    );

    if (existe) continue;

    const catSvc = cat.find((x) => x.nombre === svc.svc);

    const diasGar = parseInt(catSvc?.garantia) || 0;

    const fechaGar = new Date(
      new Date().setDate(new Date().getDate() + diasGar),
    )
      .toISOString()
      .split("T")[0];

    const garFolio = await API.getFolio("ARGAR-AROS");

    const eqMant = [
      "Laptop",
      "PC escritorio",
      "Mac",
      "iMac",
      "Todo en uno",
      "Impresora",
    ];

    const aplicaMantenimiento = eqMant.some((t) =>
      String(ord.tipo_equipo).includes(t),
    );

    const garRec = {
      id: garFolio,
      folio: garFolio,

      folio_ord: ord.folio,

      cliente_id: ord.cliente_id,
      cliente_nombre: ord.cliente_nombre,

      tipo_equipo: ord.tipo_equipo,
      modelo: ord.modelo,
      serie: ord.serie,

      tel: ord.tel,

      servicio: svc.svc,

      tecnico: ord.tecnico || "",
      recepcionista: currentUser?.nombre || "",

      garantia_dias: diasGar,

      fecha: hoy(),
      fecha_gar: fechaGar,

      estado: "Activa",

      aplica_mantenimiento: aplicaMantenimiento,
    };

    gs.push(garRec);

    DB.set("garantias", gs);

    await DATA.save("garantias", garRec.id, garRec);
  }
}

async function saveOrd() {
  let cid = document.getElementById("ord-cliente-id").value,
    cnm = "";
  if (!cid) {
    ARABOT.alert({
      title: "Cliente requerido",

      message: "Selecciona o crea un cliente.",

      details:
        "Debes seleccionar un cliente antes de crear la Orden de Servicio.",
    });

    return;
  }
  const c = DB.get("clientes").find((x) => x.id === cid);
  cnm = c ? c.nombre : "";
  const tel = document.getElementById("ord-tel").value;
  const ser = document.getElementById("ord-ser").value.trim();
  if (!ser) {
    ARABOT.alert({
      title: "Número de serie requerido",

      message: "El número de serie es obligatorio.",

      details: "Captura el número de serie antes de continuar.",
    });

    document.getElementById("ord-ser").focus();

    return;
  }
  const svcs = LS.filter((l) => l.svc);
  if (!svcs.length) {
    ARABOT.alert({
      title: "Sin servicios",

      message: "Agrega al menos un servicio.",

      details: "La Orden de Servicio debe contener al menos un concepto.",
    });

    return;
  }

  ARABOT.loading({
    title: "Creando Orden de Servicio",

    details: "Estamos registrando la orden, garantías y seguimientos.",
  });

  const sub = LS.reduce((a, l) => a + (l.precio || 0), 0);
  const tot = sub;
  const teq = document.getElementById("ord-teq").value;
  const teqFin =
    teq === "Otro"
      ? document.getElementById("ord-teq-otro").value || "Otro"
      : teq;
  const fol = await API.getFolio("AROS");
  const cat = DB.get("cat");
  let maxG = 0;
  svcs.forEach((l) => {
    const s = cat.find((x) => x.nombre === l.svc);
    if (s && s.garantia > maxG) maxG = s.garantia;
  });
  const fgar =
    maxG > 0
      ? new Date(new Date().setDate(new Date().getDate() + maxG))
          .toISOString()
          .split("T")[0]
      : "";
  const serviciosConGarantia = svcs.filter((l) => {
    const s = cat.find((x) => x.nombre === l.svc);
    return s && s.garantia > 0;
  });
  const ord = {
    id: fol,
    folio: fol,
    cliente_id: cid,
    cliente_nombre: cnm,
    tel,
    tipo_equipo: teqFin,
    modelo: document.getElementById("ord-mod").value,
    serie: ser,
    pin: document.getElementById("ord-pin").value.trim(),
    servicios: LS.map((l) => ({ ...l })),
    subtotal: sub,
    total: tot,
    // ==========================
    // CONTRATO FINANCIERO
    // ==========================
    pago_total: tot,
    pago_pagado: 0,
    pago_descuento: 0,
    pago_devoluciones: 0,
    pago_saldo: tot,
    pago_estado: "PENDIENTE",
    tecnico: document.getElementById("ord-tec")?.value || "",
    problema: document.getElementById("ord-prob").value,
    accesorios: document.getElementById("ord-acc").value,
    estado_eq: document.getElementById("ord-estf").value,
    fecha_prom: document.getElementById("ord-fprom").value,
    obs: document.getElementById("ord-obs").value,
    estado: "Recibido",
    fecha: hoy(),
    fecha_gar: fgar,
    tipo_ingreso: "NORMAL",
    garantia_id: "",
    orden_origen: "",
    vtas_rel: [],
    historial: [{ estado: "Recibido", fecha: hoy(), nota: "Orden creada" }],
  };

  // ======================================
  // ORDEN CREADA DESDE GARANTÍA
  // ======================================

  if (
    window.ordenContext &&
    window.ordenContext.tipo === "GARANTIA" &&
    window.ordenContext.garantia
  ) {
    const gar = window.ordenContext.garantia;

    ord.tipo_ingreso = "GARANTIA";

    ord.garantia_id = gar.id;

    ord.orden_origen = gar.folio_ord || "";
  }

  await DATA.save("ordenes", ord.id, ord);
  {
    const clis = DB.get("clientes");
    const ci = clis.findIndex((x) => x.id === cid);
    if (ci >= 0) {
      clis[ci].visitas = (clis[ci].visitas || 0) + 1;
      clis[ci].ultima_visita = hoy();
      DB.set("clientes", clis);
      await DATA.update("clientes", cid, {
        visitas: clis[ci].visitas,
        ultima_visita: clis[ci].ultima_visita,
      });
    }
  }

  if (ord.tipo_ingreso !== "GARANTIA") {
    await generarGarantiasOrden(ord);
  }

  // ======================================
  // ACTUALIZAR HISTORIAL DE REINGRESOS
  // ======================================

  if (ord.tipo_ingreso === "GARANTIA" && ord.garantia_id) {
    const gar = DB.get("garantias").find((g) => g.id === ord.garantia_id);

    if (gar) {
      if (!Array.isArray(gar.historial_reingresos)) {
        gar.historial_reingresos = [];
      }

      gar.historial_reingresos.push({
        fecha: hoy(),

        orden: ord.folio,

        usuario: currentUser?.nombre || "Sistema",

        estado: "Recibido",
      });

      await DATA.update("garantias", gar.id, {
        historial_reingresos: gar.historial_reingresos,
      });
    }
  }

  const cf = DB.obj("config");
  const eqMant = [
    "Laptop",
    "PC escritorio",
    "Mac",
    "iMac",
    "Todo en uno",
    "Impresora",
  ];
  if (eqMant.some((t) => teqFin.includes(t)) && fgar) {
    const da = parseInt(cf.cfg_ma || 3);
    const dm = new Date(fgar);
    dm.setDate(dm.getDate() - da);
    const ss = DB.get("segs");
    ss.push({
      id: "S" + Date.now(),
      cliente_id: cid,
      cliente_nombre: cnm,
      folio: fol,
      fdisp: fol,
      tipo: "Llamada",
      fecha: dm.toISOString().split("T")[0],
      notas:
        "🎁 Garantía vence en " +
        da +
        " días. Ofrecer mantenimiento preventivo gratuito.",
      hecho: false,
      es_mant: true,
      tel,
    });
    DB.set("segs", ss);
  }
  const dp = parseInt(cf.cfg_pv || 30);
  const fp = new Date();
  fp.setDate(fp.getDate() + dp);
  const ss = DB.get("segs");
  const newSeg = {
    id: "S" + (Date.now() + 1),
    cliente_id: cid,
    cliente_nombre: cnm,
    folio: fol,
    fdisp: fol,
    tipo: "Llamada",
    fecha: fp.toISOString().split("T")[0],
    notas: "Verificar servicio: " + svcs.map((l) => l.svc).join(", "),
    hecho: false,
    tel,
  };
  ss.push(newSeg);

  DB.set("segs", ss);

  await DATA.save("segs", newSeg.id, newSeg);

  // Registrar en bitácora antes de cerrar
  bitacora(fol, "Orden creada", "Por " + (currentUser?.nombre || "Sistema"));

  // Subir evidencias ANTES de limpiar el formulario
  await subirFotosOrden(fol);

  // Ahora sí actualizar la interfaz
  closeM("m-orden");

  limpOrd();

  rndOrd();

  updBadges();

  // Correo de confirmación de recepción al cliente
  const _cliRec = DB.get("clientes").find((c) => c.id === cid);
  if (_cliRec?.email) {
    const _svcsDesc = svcs
      .map((s) => s.svcOtro || s.svc || "Servicio")
      .join(", ");
    await FB.callFunction("notificarRecepcionOrden", {
      correo: _cliRec.email,
      nombre: _cliRec.nombre,
      folio: fol,
      equipo: teqFin,
      modelo: document.getElementById("ord-mod").value || "",
      servicios: _svcsDesc,
      fechaProm: document.getElementById("ord-fprom").value || "",
    });
  }

  if (window.ticketOrigenId) {
    const ticketId = window.ticketOrigenId;

    await DATA.update("tickets", ticketId, {
      orden_id: fol,
      orden_folio: fol,
    });

    await DATA.update("ordenes", fol, {
      ticket_id: ticketId,
    });

    const comentario = {
      id: "TC-" + Date.now(),

      ticket_id: ticketId,

      fecha: hoy(),

      fecha_hora: new Date().toISOString(),

      autor: "ARABOT",

      comentario: "🔗 Orden creada y vinculada: " + fol,

      visible_cliente: false,

      notificar_cliente: false,
    };

    await DATA.save("ticketcomentarios", comentario.id, comentario);

    window.ticketOrigenId = null;

    openTicket(ticketId);
  }

  resetOrdenContext();

  ARABOT.success({
    title: "Orden creada",

    message: "La Orden " + fol + " fue creada correctamente.",

    details: "La información fue registrada y sincronizada correctamente.",

    onClose() {
      if (typeof prtEtiqueta === "function") {
        prtEtiqueta(fol);
      }
    },
  });
}

function limpOrd() {
  [
    "ord-tel",
    "ord-mod",
    "ord-ser",
    "ord-pin",
    "ord-prob",
    "ord-acc",
    "ord-obs",
  ].forEach((f) => {
    const e = document.getElementById(f);

    if (e) e.value = "";
  });

  const cli = document.getElementById("ord-cliente");
  if (cli) cli.value = "";

  const cliId = document.getElementById("ord-cliente-id");
  if (cliId) cliId.value = "";

  const fecha = document.getElementById("ord-fprom");
  if (fecha) fecha.value = "";

  const estado = document.getElementById("ord-estf");
  if (estado) estado.selectedIndex = 0;

  const tecnico = document.getElementById("ord-tec");
  if (tecnico) tecnico.value = "";

  const equipo = document.getElementById("ord-teq");
  if (equipo) equipo.selectedIndex = 0;

  const otroEquipo = document.getElementById("ord-teq-otro");
  if (otroEquipo) otroEquipo.value = "";

  const rowOtro = document.getElementById("row-otro-eq");
  if (rowOtro) rowOtro.style.display = "none";

  const banner = document.getElementById("ord-garantia-banner");

  if (banner) {
    banner.style.display = "none";
    banner.innerHTML = "";
  }

  LS = [{ svc: "", precio: 0 }];
  renderLS();
}

function toggleAcciones(btn) {
  const popup = document.getElementById("accionesPopup");

  if (
    popup.dataset.owner === btn.dataset.id &&
    popup.classList.contains("show")
  ) {
    popup.classList.remove("show");
    popup.dataset.owner = "";
    return;
  }

  popup.innerHTML = btn
    .closest(".bg-btn")
    .querySelector(".acciones-card").innerHTML;

  popup.querySelectorAll("button").forEach((b) => {
    b.addEventListener("click", () => {
      popup.classList.remove("show");
    });
  });

  const r = btn.getBoundingClientRect();

  const margen = 12;

  let left = r.left + r.width - 75;
  let top = r.bottom + 6;

  popup.style.left = left + "px";
  popup.style.top = top + "px";

  const pw = popup.offsetWidth;
  const ph = popup.offsetHeight;

  if (left + pw > window.innerWidth - margen) {
    left = window.innerWidth - pw - margen;
  }

  if (top + ph > window.innerHeight - margen) {
    top = r.top - ph - 6;
  }

  popup.style.left = left + "px";
  popup.style.top = top + "px";

  popup.dataset.owner = btn.dataset.id;
  popup.classList.add("show");
}

document.addEventListener("click", (e) => {
  const popup = document.getElementById("accionesPopup");

  if (!popup.classList.contains("show")) return;

  if (popup.contains(e.target)) return;

  if (e.target.closest(".btn-acciones")) return;

  popup.classList.remove("show");
});

function rndOrd(lista) {
  const data = lista || DB.get("ordenes");
  const tb = document.getElementById("tb-ord");
  if (!data.length) {
    tb.innerHTML = '<tr><td colspan="9" class="nd">Sin órdenes</td></tr>';
    return;
  }
  const ec = {
    Recibido: "tb",
    Diagnóstico: "to",
    "En proceso": "to",
    "Esperando refacción": "ty",
    "Equipo en taller especializado": "tp",
    "Listo para entrega": "tg",
    Entregado: "tgr",
    "Entregado (garantía)": "tgr",
    Cancelado: "tr",
    "No reparado": "tr",
    "Reingreso por garantía": "tp",
  };
  tb.innerHTML = data
    .slice()
    .reverse()
    .map((o) => {
      const vtasExtra = (o.vtas_rel || []).reduce((a, vid) => {
        const v = DB.get("ventas").find((x) => x.id === vid);
        return a + (v ? v.total : 0);
      }, 0);
      const totalIntegral = o.total + vtasExtra;

      // Temporal durante la transición.
      // El saldo definitivo vendrá del Libro Mayor.
      const saldo = o.pago_saldo ?? totalIntegral;
      const tieneMovimientos = (DB.get("pagos") || []).some(
        (p) => p.origen === "ORDEN" && p.origen_id === o.id,
      );
      return `<tr>
              
              <td style="font-family:var(--fh);color:var(--accent);font-size:11px">
                ${o.folio}
                ${
                  o.ticket_id
                    ? `<br><span style="font-size:10px;color:var(--accent2)"><i class="ar-icon ticket"></i> ${o.ticket_id}</span>`
                    : ""
                }
              </td>
              <td style="font-size:10px;color:var(--text2)">${fmt(o.fecha)}</td>
              <td>

                <b
                  style="cursor:pointer;color:var(--accent);text-decoration:underline"
                  onclick="viewCli('${o.cliente_id}')"
                  title="Ver información del cliente">

                  ${o.cliente_nombre}

                </b>

                <br>

                <span
                  style="font-size:10px;color:var(--text3)">

                  ${o.tel || ""}

                </span>

</td>

<td style="font-size:11px">${o.tipo_equipo}<br><span style="font-size:10px;color:var(--text2)">${o.modelo || ""}</span></td>
              
              <td style="font-size:10px">
                ${
                  (o.servicios || [])
                    .map((s) => s.svc || s.servicio)
                    .filter(Boolean)
                    .join(", ")
                    .substring(0, 35) || "—"
                }
              </td>

              <td style="color:var(--green);font-family:var(--fh)">
                ${mxn(totalIntegral)}
              </td>

             <td style="color:${saldo > 0 ? "var(--orange)" : "var(--green)"};font-weight:600">
                  ${mxn(saldo)}
              </td>

              <td>

                  ${
                    o.pago_estado === "CANCELADO"
                      ? '<span class="tag tr">🔴 Cancelado</span>'
                      : o.pago_estado === "LIQUIDADO"
                        ? '<span class="tag tg">🟢 Liquidado</span>'
                        : '<span class="tag ty">🟠 Pendiente</span>'
                  }

              </td>

              <td>

                  <span
                      class="tag ${ec[o.estado] || "tgr"}"
                      style="font-size:10px;white-space:nowrap">

                      ${o.estado}

                  </span>

                  ${
                    o.recordatorio?.pendiente
                      ? `<span
                            title="Recordatorio de llamada${o.recordatorio?.nota ? "\n\n" + o.recordatorio.nota : ""}"
                            style="
                                background:rgba(14,165,233,.15);
                                color:#75d0fa;
                                border:1px solid rgba(14,165,233,.3);
                                border-radius:10px;
                                font-size:9px;
                                padding:1px 6px;
                                margin-left:4px;
                                cursor:help;
                            ">
                            <i class="ar-icon telefono"></i>
                        </span>`
                      : ""
                  }

              </td>


                            <td style="font-size:11px;color:var(--text2);text-align:center">
                              ${o.tecnico || "—"}
                            </td>
                                  <td class="bg-btn">

          <div class="bg-btn-wrap">

              <button
                  class="btn bg bsm btn-acciones"
                  data-id="${o.id}"
                  onclick="toggleAcciones(this)"
                  title="Acciones">
                  <i class="ar-icon menu"></i>
              </button>

          </div>

          <div class="acciones-card">

          <button
            class="btn bg bsm"
            onclick="openExp('${o.id}')"
            title="Ver expediente"
        >
            <i class="ar-icon expediente"></i> Ver expediente
        </button>

        ${
          o.pago_estado === "PENDIENTE"
            ? `
        <button
            class="btn bg bsm"
            onclick="PAGOS.open('orden','${o.id}')"
            title="Registrar pago">
            <i class="ar-icon tarjeta"></i> Registrar pago
        </button>
        `
            : o.pago_estado === "LIQUIDADO"
              ? `
        <button
            class="btn tg bsm"
            disabled
            title="Documento liquidado">
            <i class="ar-icon success"></i> Liquidado
        </button>
        `
              : ""
        }

        ${
          o.pago_estado !== "CANCELADO"
            ? `
        <button
            class="btn bg bsm"
            onclick="ESTADO.open('orden','${o.id}')"
            title="Estado de Cuenta">
            <i class="ar-icon estado_cuenta"></i> Estado de cuenta
        </button>
        `
            : ""
        }

        ${
          o.pago_estado === "PENDIENTE"
            ? `
          <button
              class="btn bg bsm"
              onclick="openEditOrd('${o.id}')"
              title="Editar">
              <i class="ar-icon edit"></i> Editar
          </button>
          `
            : ""
        }

        <button
            class="btn bg bsm"
            onclick="GESTION.open('orden','${o.id}')"
            title="Gestión Financiera">
            <i class="ar-icon configuracion"></i> Gestión financiera
        </button>

          </div>

</td>

    
</td></tr>`;
    })
    .join("");
  window.initIcons();
}
async function filtOrd() {
  const q = document.getElementById("sch-ord").value.trim().toLowerCase();
  const st = document.getElementById("flt-est-ord").value;
  const tec = document.getElementById("flt-tec-ord")?.value || "";

  rndOrd(
    DB.get("ordenes").filter((o) => {
      const texto = [
        o.folio,
        o.cliente_nombre,
        o.tel,
        o.tipo_equipo,
        o.modelo,
        o.serie,
        o.pin,
        o.estado,
        o.tecnico,
        o.problema,
        o.accesorios,
        o.fecha,
        o.fecha_prom,

        ...(o.servicios || []).map(
          (s) => s.svc || s.servicio || s.nombre || "",
        ),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        texto.includes(q) &&
        (!st || o.estado === st) &&
        (!tec || o.tecnico === tec)
      );
    }),
  );

  // Refresh tecnico filter options
  const tecSel = document.getElementById("flt-tec-ord");

  if (tecSel && tecSel.options.length <= 1) {
    try {
      const usuarios = await DATA.getAll("usuarios");

      usuarios
        .filter((u) => u.activo !== false && u.rol === "tecnico")
        .forEach((u) => {
          const op = document.createElement("option");

          op.value = u.nombre;

          op.textContent = u.nombre;

          tecSel.appendChild(op);
        });
    } catch (err) {
      console.error("Error cargando técnicos:", err);
    }
  }
}

// ======================================================
// BUSCADOR DE CLIENTES PARA ÓRDENES
// ======================================================

function ordBuscarCliente(texto = "") {
  const lista = document.getElementById("ord-cliente-resultados");

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

            onclick="ordSeleccionarCliente('${c.id}')"

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

function ordSeleccionarCliente(id) {
  const cliente = DB.get("clientes").find((c) => c.id === id);

  if (!cliente) return;

  document.getElementById("ord-cliente-id").value = cliente.id;

  document.getElementById("ord-cliente").value = cliente.nombre || "";

  document.getElementById("ord-tel").value = cliente.tel || "";

  const lista = document.getElementById("ord-cliente-resultados");

  lista.style.display = "none";

  lista.innerHTML = "";
}

// ======================================================
// NUEVO CLIENTE DESDE ÓRDENES
// ======================================================

function ordNuevoCliente() {
  abrirNuevoCliDesdeOrden();
}

// ======================================================
// CERRAR BUSCADOR
// ======================================================

document.addEventListener("click", function (e) {
  const input = document.getElementById("ord-cliente");

  const lista = document.getElementById("ord-cliente-resultados");

  if (!input || !lista) return;

  if (input.contains(e.target) || lista.contains(e.target)) return;

  lista.style.display = "none";
});

window.saveOrd = saveOrd;
window.limpOrd = limpOrd;
window.rndOrd = rndOrd;
window.filtOrd = filtOrd;
