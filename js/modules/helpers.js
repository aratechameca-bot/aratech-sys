// HELPERS
function fillClis(ids) {
  const clis = DB.get("clientes");
  const opts =
    '<option value="">-- Sin cliente --</option>' +
    clis
      .map(
        (c) =>
          `<option value="${c.id}">${c.nombre}${c.tel ? " — " + c.tel : ""}</option>`,
      )
      .join("");
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = opts;
  });
  const crm = document.getElementById("crm-cli");
  if (crm)
    crm.innerHTML =
      '<option value="">-- Seleccionar --</option>' +
      clis.map((c) => `<option value="${c.id}">${c.nombre}</option>`).join("");
}
function fillOrds() {
  const ords = DB.get("ordenes").filter(
    (o) =>
      ![
        "Entregado",
        "Entregado (garantía)",
        "Cancelado",
        "No reparado",
      ].includes(o.estado),
  );
  document.getElementById("vta-ord").innerHTML =
    '<option value="">-- Ninguna (venta directa) --</option>' +
    ords
      .map(
        (o) =>
          `<option value="${o.id}">${o.folio} — ${o.cliente_nombre}</option>`,
      )
      .join("");
}
function autoTel() {
  const id = document.getElementById("ord-cli").value;
  if (!id) return;
  const c = DB.get("clientes").find((x) => x.id === id);
  if (c) document.getElementById("ord-tel").value = c.tel || "";
}
function togOtroEq() {
  document.getElementById("row-otro-eq").style.display =
    document.getElementById("ord-teq").value === "Otro" ? "" : "none";
}

// NUEVO CLIENTE DESDE ORDEN
function abrirNuevoCliDesdeOrden() {
  document.getElementById("cli-eid").value = "";
  document.getElementById("cli-desde-orden").value = "1";
  document.getElementById("cli-tit").textContent = "👤 Nuevo cliente";
  ["cli-nm", "cli-tel", "cli-em", "cli-dir", "cli-not"].forEach(
    (f) => (document.getElementById(f).value = ""),
  );
  openM("m-cli");
}

// ORDENES
async function saveOrd() {
  let cid = document.getElementById("ord-cli").value,
    cnm = "";
  if (!cid) {
    alert("Selecciona o crea un cliente primero");
    return;
  }
  const c = DB.get("clientes").find((x) => x.id === cid);
  cnm = c ? c.nombre : "";
  const tel = document.getElementById("ord-tel").value;
  const ser = document.getElementById("ord-ser").value.trim();
  if (!ser) {
    alert("El número de serie es obligatorio");
    document.getElementById("ord-ser").focus();
    return;
  }
  const svcs = LS.filter((l) => l.svc);
  if (!svcs.length) {
    alert("Agrega al menos un servicio");
    return;
  }
  const desc = parseFloat(document.getElementById("ord-desc").value) || 0;
  const sub = LS.reduce((a, l) => a + (l.precio || 0), 0);
  const tot = Math.max(0, sub - desc);
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
    servicios: LS.map((l) => ({ ...l })),
    subtotal: sub,
    descuento: desc,
    total: tot,
    anticipo: parseFloat(document.getElementById("ord-ant").value) || 0,
    pago_anticipo: document.getElementById("ord-pago-ant")?.value || "Efectivo",
    tecnico: document.getElementById("ord-tec")?.value || "",
    problema: document.getElementById("ord-prob").value,
    accesorios: document.getElementById("ord-acc").value,
    estado_eq: document.getElementById("ord-estf").value,
    fecha_prom: document.getElementById("ord-fprom").value,
    obs: document.getElementById("ord-obs").value,
    estado: "Recibido",
    fecha: hoy(),
    fecha_gar: fgar,
    vtas_rel: [],
    historial: [{ estado: "Recibido", fecha: hoy(), nota: "Orden creada" }],
  };
  await API.save("ordenes", ord);
  {
    const clis = DB.get("clientes");
    const ci = clis.findIndex((x) => x.id === cid);
    if (ci >= 0) {
      clis[ci].visitas = (clis[ci].visitas || 0) + 1;
      clis[ci].ultima_visita = hoy();
      DB.set("clientes", clis);
      API.update("clientes", cid, {
        visitas: clis[ci].visitas,
        ultima_visita: clis[ci].ultima_visita,
      });
    }
  }
  for (const svc of serviciosConGarantia) {
    const catSvc = cat.find((x) => x.nombre === svc.svc);

    const diasGar = parseInt(catSvc?.garantia) || 0;

    const fechaGar = new Date(
      new Date().setDate(new Date().getDate() + diasGar),
    )
      .toISOString()
      .split("T")[0];

    const garFolio = await API.getFolio("ARGAR");

    const garRec = {
      id: garFolio,
      folio: garFolio,

      folio_ord: fol,

      cliente_id: cid,
      cliente_nombre: cnm,

      tipo_equipo: teqFin,
      modelo: ord.modelo,
      serie: ser,

      tel,

      servicio: svc.svc,

      garantia_dias: diasGar,

      fecha: hoy(),
      fecha_gar: fechaGar,

      estado: "Activa",
    };

    const gs = DB.get("garantias");

    gs.push(garRec);

    DB.set("garantias", gs);

    await API.save("garantias", garRec);
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
  API.save("segs", newSeg);
  closeM("m-orden");
  limpOrd();
  rndOrd();
  updBadges();
  bitacora(fol, "Orden creada", "Por " + (currentUser?.nombre || "Sistema"));

  // Subir fotos pendientes a Drive
  subirFotasOrden(fol);

  // Correo de confirmación de recepción al cliente
  const _cliRec = DB.get("clientes").find((c) => c.id === cid);
  if (_cliRec?.email) {
    const _svcsDesc = svcs
      .map((s) => s.svcOtro || s.svc || "Servicio")
      .join(", ");
    API.call("notificarRecepcion", null, {
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

    await API.update("tickets", ticketId, {
      orden_id: fol,
      orden_folio: fol,
    });

    await API.update("ordenes", fol, {
      ticket_id: ticketId,
    });

    await API.save("ticketcomentarios", {
      id: "TC-" + Date.now(),

      ticket_id: ticketId,

      fecha: hoy(),

      fecha_hora: new Date().toISOString(),

      autor: "ARABOT",

      comentario: "🔗 Orden creada y vinculada: " + fol,

      visible_cliente: false,

      notificar_cliente: false,
    });

    window.ticketOrigenId = null;

    openTicket(ticketId);
  }

  notify("Orden " + fol + " creada ✅");
}
function limpOrd() {
  ["ord-tel", "ord-mod", "ord-ser", "ord-prob", "ord-acc", "ord-obs"].forEach(
    (f) => {
      const e = document.getElementById(f);
      if (e) e.value = "";
    },
  );
  document.getElementById("ord-ant").value = "0";
  document.getElementById("ord-desc").value = "0";
  document.getElementById("ord-cli").value = "";
  LS = [{ svc: "", precio: 0 }];
}
function rndOrd(lista) {
  const data = lista || DB.get("ordenes");
  const tb = document.getElementById("tb-ord");
  if (!data.length) {
    tb.innerHTML = '<tr><td colspan="10" class="nd">Sin órdenes</td></tr>';
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
      const saldo = totalIntegral - (o.anticipo || 0);
      return `<tr>
              
              <td style="font-family:var(--fh);color:var(--accent);font-size:11px">
                ${o.folio}
                ${
                  o.ticket_id
                    ? `<br><span style="font-size:10px;color:var(--accent2)">🎫 ${o.ticket_id}</span>`
                    : ""
                }
              </td>
              <td style="font-size:10px;color:var(--text2)">${fmt(o.fecha)}</td><td><b>${o.cliente_nombre}</b><br><span style="font-size:10px;color:var(--text3)">${o.tel || ""}</span></td><td style="font-size:11px">${o.tipo_equipo}<br><span style="font-size:10px;color:var(--text2)">${o.modelo || ""}</span></td><td style="font-size:10px">${
                (o.servicios || [])
                  .map((s) => s.svc || s.servicio)
                  .filter(Boolean)
                  .join(", ")
                  .substring(0, 35) || "—"
              }</td><td style="color:var(--green);font-family:var(--fh)">${mxn(totalIntegral)}</td><td style="font-size:11px">${mxn(o.anticipo || 0)}</td><td style="color:${saldo > 0 ? "var(--orange)" : "var(--green)"};font-weight:600">${mxn(saldo)}</td><td><span class="tag ${ec[o.estado] || "tgr"}" style="font-size:10px;white-space:nowrap">${o.estado}</span>${o.recordatorio?.pendiente ? '<span style="background:rgba(14,165,233,.15);color:#75d0fa;border:1px solid rgba(14,165,233,.3);border-radius:10px;font-size:9px;padding:1px 6px;margin-left:4px">📞</span>' : ""}</td>
              <td style="font-size:11px;color:var(--text2);text-align:center">
                ${o.tecnico || "—"}
              </td>
                    <td class="bg-btn"><button class="btn bp bsm" onclick="openExp('${o.id}')">📋</button><button class="btn bg bsm" onclick="openEditOrd('${o.id}')">✏️</button>${puedo("eliminarOrdenes") ? `<button class=\"btn bd bsm\" onclick=\"delOrd('${o.id}')\" title=\"Eliminar orden\">🗑️</button>` : ""}</td></tr>`;
    })
    .join("");
}
function filtOrd() {
  const q = document.getElementById("sch-ord").value.toLowerCase();
  const st = document.getElementById("flt-est-ord").value;
  const tec = document.getElementById("flt-tec-ord")?.value || "";
  rndOrd(
    DB.get("ordenes").filter(
      (o) =>
        (o.folio.toLowerCase().includes(q) ||
          o.cliente_nombre.toLowerCase().includes(q) ||
          (o.modelo || "").toLowerCase().includes(q)) &&
        (!st || o.estado === st) &&
        (!tec || o.tecnico === tec),
    ),
  );
  // Refresh tecnico filter options
  const tecSel = document.getElementById("flt-tec-ord");
  if (tecSel && tecSel.options.length <= 1) {
    USUARIOS.forEach((u) => {
      const o = document.createElement("option");
      o.value = u.nombre;
      o.textContent = u.nombre;
      tecSel.appendChild(o);
    });
  }
}

window.fillClis = fillClis;
window.fillOrds = fillOrds;
window.autoTel = autoTel;
window.togOtroEq = togOtroEq;
window.abrirNuevoCliDesdeOrden = abrirNuevoCliDesdeOrden;
