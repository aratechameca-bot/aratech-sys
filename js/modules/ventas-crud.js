// VENTAS
async function saveVta() {
  if (!LV.length) {
    ARABOT.alert({
      title: "Venta vacía",

      message: "Agrega al menos un producto o servicio.",

      details:
        "Debes agregar al menos un concepto antes de registrar la venta.",
    });

    return;
  }
  const inv = DB.get("inventario");
  for (const l of LV.filter((x) => x.tipo === "producto")) {
    const p = inv.find((x) => x.sku === l.sku);
    if (!p || p.stock < (l.qty || 1)) {
      ARABOT.alert({
        title: "Stock insuficiente",

        message: l.desc,

        details: "Disponible: " + (p ? p.stock : 0),
      });

      return;
    }
  }

  // [FASE 4] Verificar el stock REAL en el servidor antes de registrar nada
  // (la copia local puede estar desactualizada si otro equipo vendió).
  const verificacion = await INVENTARIO_ENGINE.verificarStock(
    LV.filter((x) => x.tipo === "producto").map((l) => ({
      productoId: l.sku,
      cantidad: Number(l.qty || 1),
    })),
  );

  if (!verificacion.ok) {
    ARABOT.alert({
      title: "Stock insuficiente",

      message: String(verificacion.producto || ""),

      details:
        "Disponible: " +
        verificacion.disponible +
        ". Requerido: " +
        verificacion.requerido +
        ". Es posible que otro equipo haya vendido este producto.",
    });

    return;
  }

  ARABOT.loading({
    title: "Registrando venta",

    details:
      "Estamos procesando la venta, actualizando inventario y generando garantías.",
  });
  const { sub, iva, tot } = recalcVta();
  const cid = document.getElementById("vta-cliente-id").value;
  const cnm = cid
    ? DB.get("clientes").find((c) => c.id === cid)?.nombre || ""
    : "Público en general";
  const ord_rel = document.getElementById("vta-ord").value;
  const fol = await API.getFolio("ARVTA");
  const vta = {
    id: fol,
    folio: fol,
    ticket_id: window.ticketVentaOrigenId || "",
    ticket_folio: window.ticketVentaOrigenFolio || "",
    cliente_id: cid,
    cliente_nombre: cnm,
    fecha: document.getElementById("vta-fch").value,
    lineas: LV.map((l) => ({ ...l })),
    subtotal: sub,
    iva_pct: iva,
    iva_monto: (sub * iva) / 100,
    total: tot,
    pago_total: tot,

    pago_pagado: 0,

    pago_saldo: tot,

    pago_estado: "PENDIENTE",
    orden_rel: ord_rel,
    es_directa: !ord_rel,
  };
  await DATA.save("ventas", vta.id, vta);

  // descontar inventario mediante el motor
  for (const l of LV.filter((x) => x.tipo === "producto")) {
    const resultado = await INVENTARIO_ENGINE.venta({
      productoId: l.sku,

      cantidad: Number(l.qty || 1),

      documento: fol,

      modulo: "VENTAS",

      origen: "VENTAS",

      referencia: cnm,

      observaciones: `Venta ${fol}`,
    });

    if (!resultado.ok) {
      ARABOT.closeLoading();

      ARABOT.alert({
        title: "Error de inventario",

        message: resultado.error,

        // [FASE 4] La venta ya quedó guardada en este punto; el mensaje
        // anterior decía "La venta fue cancelada", lo cual no era cierto.
        details: `La venta ${fol} se registró, pero no fue posible descontar ${l.desc} del inventario. Revisa el inventario de ese producto.`,
      });

      return;
    }

    if (resultado.producto.stock <= (resultado.producto.min || 3)) {
      await FB.callFunction("alertaInventarioBajo", {
        producto: resultado.producto.nombre,
        stock: resultado.producto.stock,
        minimo: resultado.producto.min || 3,
      });
    }
  } // ← Cerrar aquí el for de INVENTARIO_ENGINE.venta()

  // asociar venta a la orden
  if (ord_rel) {
    const ords = DB.get("ordenes");

    const oi = ords.findIndex((o) => o.id === ord_rel);

    if (oi >= 0) {
      ords[oi].vtas_rel = ords[oi].vtas_rel || [];
      ords[oi].vtas_rel.push(fol);

      await DATA.update("ordenes", ord_rel, {
        vtas_rel: ords[oi].vtas_rel,
      });
    }
  }
  // Generar garantías para productos vendidos que tengan garantía (días > 0)
  for (const l of LV.filter((x) => x.tipo === "producto")) {
    const prod = inv.find((p) => p.sku === l.sku);

    const gd = prod ? parseInt(prod.garantia_dias) || 0 : 0;

    if (gd > 0) {
      const qty = parseInt(l.qty) || 1;

      for (let pieza = 1; pieza <= qty; pieza++) {
        const fgarV = new Date(new Date().setDate(new Date().getDate() + gd))
          .toISOString()
          .split("T")[0];

        const garFolioV = await API.getFolio("ARGAR");

        const garRecV = {
          id: garFolioV,
          folio: garFolioV,

          folio_ord: ord_rel || "",
          folio_vta: fol,

          cliente_id: cid,
          cliente_nombre: cnm,

          tipo_equipo: "Producto",

          modelo: (prod.marca || "") + " " + (prod.nombre || l.desc),

          serie: prod.sku || "",

          pieza: pieza,
          total_piezas: qty,

          tel: "",

          servicio: l.desc,

          tecnico: vta.tecnico || "",
          recepcionista: currentUser?.nombre || "",

          garantia_dias: gd,

          fecha: vta.fecha || hoy(),
          fecha_gar: fgarV,

          estado: "Activa",

          tipo_gar: prod.cond ? prod.cond.toLowerCase() : "nuevo",

          aplica_mantenimiento: true,
        };

        const gsV = DB.get("garantias");

        gsV.push(garRecV);

        DB.set("garantias", gsV);

        await DATA.save("garantias", garRecV.id, garRecV);
      }
    }
  }

  console.log("ANTES DE CERRAR");
  closeM("m-venta");
  console.log("DESPUÉS DE CERRAR");
  LV = [];

  rndVta();

  dash();

  if (window.ticketVentaOrigenId) {
    const ticketId = window.ticketVentaOrigenId;

    await DATA.update("tickets", ticketId, {
      venta_id: fol,
      venta_folio: fol,
      venta_generada: true,
    });

    window.ticketVentaOrigenId = null;

    openTicket(ticketId);
  }

  // ==========================================
  // Si la venta proviene de una cotización
  // actualizar la cotización relacionada
  // ==========================================

  if (window.ventaCotizacionOrigen) {
    const cots = DB.get("cotizaciones");

    const i = cots.findIndex((c) => c.id === window.ventaCotizacionOrigen.id);

    if (i >= 0) {
      cots[i].estado = "Vendida";

      cots[i].venta_generada = true;

      cots[i].venta_id = vta.id;

      cots[i].venta_folio = vta.folio;

      DB.set("cotizaciones", cots);

      await DATA.update("cotizaciones", cots[i].id, cots[i]);

      cotRender(cots);
    }

    window.ventaCotizacionOrigen = null;
  }

  try {
    await FINANZAS.registrarMovimiento({
      tipo: "INGRESO",

      modulo: "VENTAS",

      origen: vta.id,

      monto: Number(vta.total || 0),

      metodo: "",

      categoria: "Venta",

      descripcion: `Venta ${vta.folio}`,

      referencia: vta.folio,

      usuario: currentUser?.nombre,

      fecha: vta.fecha,
    });
  } catch (error) {
    console.error("Error al registrar movimiento financiero:", error);

    notify(
      "⚠️ La venta fue registrada correctamente, pero no pudo registrarse el movimiento financiero.",
    );
  }

  ARABOT.success({
    title: "Venta registrada",

    message: "La venta " + fol + " fue registrada correctamente.",

    details: "La información fue almacenada y sincronizada correctamente.",
  });
}

function rndVta(lista) {
  const todos = lista || DB.get("ventas");
  const tb = document.getElementById("tb-vta");
  if (!todos.length) {
    tb.innerHTML = '<tr><td colspan="8" class="nd">Sin ventas</td></tr>';
  } else
    tb.innerHTML = todos
      .slice()
      .reverse()
      .map((v) => {
        const tieneMovimientos =
          (v.pago_pagado || 0) > 0 ||
          (v.pago_descuento || 0) > 0 ||
          (v.pago_devoluciones || 0) > 0;

        return `<tr>
    <td
        style="
            font-family:var(--fh);
            color:var(--accent);
            font-size:11px;
            cursor:pointer;
            text-decoration:underline;
            font-weight:600;
        "
        onclick="openVenta('${v.id}')"
        title="Visualizar venta">

        ${v.folio}

    </td>
    <td style="font-size:10px">${fmt(v.fecha)}</td>

    <td
      style="
        color:var(--accent);
        cursor:pointer;
        text-decoration:underline;
        font-weight:600;
      "
      onclick="${v.cliente_id ? `viewCli('${v.cliente_id}')` : ""}"
      title="Ver cliente"
    >
      ${v.cliente_nombre || "—"}
    </td>

    <td style="font-size:10px">${
      (v.lineas || [])
        .map((l) => l.desc)
        .join(", ")
        .substring(0, 35) || "—"
    }</td>
          <td style="color:var(--green);font-weight:600;font-family:var(--fh)">
        ${mxn(v.total)}
      </td>

     <td style="color:${(v.pago_saldo ?? v.total) > 0 ? "var(--orange)" : "var(--green)"};font-weight:600">
        ${mxn(v.pago_saldo ?? v.total)}
      </td>

      <td>

        ${
          v.pago_estado === "CANCELADO"
            ? '<span class="tag tr">🔴 Cancelado</span>'
            : v.pago_estado === "LIQUIDADO"
              ? '<span class="tag tg">🟢 Liquidado</span>'
              : '<span class="tag ty">🟠 Pendiente</span>'
        }

      </td>

     <td
        style="
          font-size:10px;
          color:${v.orden_rel ? "var(--accent)" : "var(--text2)"};
          cursor:${v.orden_rel ? "pointer" : "default"};
          text-decoration:${v.orden_rel ? "underline" : "none"};
          font-weight:${v.orden_rel ? "600" : "normal"};
        "
        onclick="${v.orden_rel ? `openExp('${v.orden_rel}')` : ""}"
        title="${v.orden_rel ? "Abrir expediente de la orden" : ""}"
      >
        ${v.orden_rel || "—"}
      </td>

   <td
      style="
        font-size:10px;
        color:${v.ticket_id ? "var(--accent)" : "var(--text2)"};
        cursor:${v.ticket_id ? "pointer" : "default"};
        text-decoration:${v.ticket_id ? "underline" : "none"};
        font-weight:${v.ticket_id ? "600" : "normal"};
      "
      onclick="${v.ticket_id ? `openTicket('${v.ticket_id}')` : ""}"
      title="${v.ticket_id ? "Abrir expediente del ticket" : ""}"
    >
      ${v.ticket_folio || "—"}
    </td>
    
    <td class="bg-btn">

    <div class="bg-btn-wrap">

        <button
            class="btn bg bsm btn-acciones"
            data-id="${v.id}"
            onclick="toggleAcciones(this)"
            title="Acciones">
            <i class="ar-icon menu"></i>
        </button>

    </div>

    <div class="acciones-card">

        <button
            class="btn bg bsm"
            onclick="prtVta('${v.id}','carta')"
            title="Ver venta">
            <i class="ar-icon archivo"></i> Ver venta
        </button>

        <button
            class="btn bg bsm"
            onclick="prtVta('${v.id}','58mm')"
            title="Ticket 58 mm">
            58 Ticket 58 mm
        </button>

        <button
            class="btn bg bsm"
            onclick="prtVta('${v.id}','80mm')"
            title="Ticket 80 mm">
            80 Ticket 80 mm
        </button>

        ${
          v.pago_estado === "PENDIENTE"
            ? `
        <button
            class="btn bg bsm"
            onclick="PAGOS.open('venta','${v.id}')"
            title="Registrar pago">
            <i class="ar-icon tarjeta"></i> Registrar pago
        </button>
        `
            : v.pago_estado === "LIQUIDADO"
              ? `
        <button
            class="btn tg bsm"
            disabled
            title="Venta liquidada">
            <i class="ar-icon success"></i> Venta liquidada
        </button>
        `
              : ""
        }

        ${
          v.pago_estado !== "CANCELADO"
            ? `
        <button
            class="btn bg bsm"
            onclick="ESTADO.open('venta','${v.id}')"
            title="Estado de Cuenta">
            <i class="ar-icon estado_cuenta"></i> Estado de cuenta
        </button>
        `
            : ""
        }

        ${
          false
            ? `
        <button
            class="btn bg bsm"
            onclick="openEditVta('${v.id}')"
            title="Editar">
            <i class="ar-icon edit"></i> Editar
        </button>
        `
            : ""
        }

        <button
            class="btn bg bsm"
            onclick="GESTION.open('venta','${v.id}')"
            title="Gestión Financiera">
            <i class="ar-icon configuracion"></i> Gestión financiera
        </button>

    </div>

</td>
    </td>
    </tr>`;
      })
      .join("");
  const mes = new Date().toISOString().slice(0, 7);
  const dm = todos.filter((v) => v.fecha && v.fecha.startsWith(mes));
  const tt = dm.reduce((a, v) => a + v.total, 0);
  document.getElementById("kvm").textContent = mxn(tt);
  document.getElementById("ktm").textContent = dm.length;
  document.getElementById("ktp").textContent = dm.length
    ? mxn(tt / dm.length)
    : "$0";

  window.initIcons();
}

function filtVta() {
  const txt = document.getElementById("sch-vta").value.toLowerCase().trim();

  const pago = document.getElementById("flt-pago-vta").value;

  const tipo = document.getElementById("flt-tipo-vta").value;

  const ventas = DB.get("ventas").filter((v) => {
    const concepto = (v.lineas || [])
      .map((l) => `${l.desc} ${l.sku || ""}`)
      .join(" ")
      .toLowerCase();

    const coincideTexto =
      !txt ||
      (v.folio || "").toLowerCase().includes(txt) ||
      (v.cliente_nombre || "").toLowerCase().includes(txt) ||
      (v.orden_rel || "").toLowerCase().includes(txt) ||
      (v.ticket_folio || "").toLowerCase().includes(txt) ||
      (v.pago_estado || "").toLowerCase().includes(txt) ||
      String(v.total || "").includes(txt) ||
      (v.fecha || "").toLowerCase().includes(txt) ||
      concepto.includes(txt);

    const coincidePago = !pago || (v.pago_estado || "PENDIENTE") === pago;

    const coincideTipo =
      !tipo ||
      (tipo === "directa" && v.es_directa) ||
      (tipo === "orden" && !v.es_directa) ||
      (tipo === "ticket" && !!v.ticket_folio);

    return coincideTexto && coincidePago && coincideTipo;
  });

  rndVta(ventas);
}

function openEditVta(id) {
  const v = DB.get("ventas").find((x) => x.id === id);
  if (!v) return;
  document.getElementById("edit-vta-id").value = id;
  document.getElementById("edit-vta-body").innerHTML = `
  <div class="al al-o" style="margin-bottom:12px">
      <i class="ar-icon warning"></i>
Los importes, el inventario y las relaciones de la venta se actualizarán automáticamente al guardar los cambios.
  </div>

  <div class="fr c2" style="margin-bottom:14px">

      <div class="fi">
          <label class="fl">Fecha</label>
          <input type="date" id="ev-fch" value="${v.fecha || ""}">
      </div>
      </div>


     <div
        style="
            font-family:var(--fh);
            color:var(--accent);
            margin:16px 0 8px;
        ">
        LÍNEAS DE VENTA
    </div>

    ${(v.lineas || [])
      .map(
        (l, i) => `

  <div class="card" style="margin-bottom:12px;padding:12px">

      <div style="font-size:13px;font-weight:600;margin-bottom:10px">
         ${
           l.tipo === "producto"
             ? '<i class="ar-icon inventario"></i>'
             : '<i class="ar-icon servicio"></i>'
         }
          ${l.desc}
      </div>

      <div class="fr c2">

          <div class="fi">
              <label class="fl">Cantidad</label>
              <input
                  type="number"
                  id="ev-q-${i}"
                  value="${l.qty || 1}"
                  style="text-align:center">
          </div>

          <div class="fi">
              <label class="fl">Precio</label>
              <input
                  type="number"
                  id="ev-p-${i}"
                  value="${l.precio}"
                  style="text-align:right">
          </div>

      </div>

  </div>

  `,
      )
      .join("")}

      <div class="fr c1" style="margin-top:10px">

        <div class="fi">
            <label class="fl">IVA %</label>
            <input
                type="number"
                id="ev-iva"
                value="${v.iva_pct || 0}">
        </div>

    </div>
    `;

  openM("m-edit-vta");

  window.initIcons();
}

// ======================================================
// VISUALIZAR VENTA
// ======================================================

function openVenta(id) {
  const venta = DB.get("ventas").find((v) => v.id === id);

  if (!venta) return;

  const body = document.getElementById("vta-view-body");

  body.innerHTML = `

        <div class="fr c2">

            <div class="fi">
                <label class="fl">Folio</label>

              <div
                  style="
                      font-family:var(--fh);
                      color:var(--accent);
                      font-size:20px;
                      font-weight:700;
                      display:flex;
                      align-items:center;
                      gap:8px;
                  ">

                  <i class="ar-icon ventas"></i> ${venta.folio}
              </div>
            </div>

            <div class="fi">
                <label class="fl">Fecha</label>
                <div class="iv">${fmt(venta.fecha)}</div>
            </div>

        </div>

        <div class="fr c2" style="margin-top:12px">

            <div class="fi">
               <div

                  style="
                      color:${venta.cliente_id ? "var(--accent)" : "inherit"};
                      cursor:${venta.cliente_id ? "pointer" : "default"};
                      text-decoration:${venta.cliente_id ? "underline" : "none"};
                      font-weight:600;
                  "

                  ${
                    venta.cliente_id
                      ? `onclick="closeM('m-vta-view');viewCli('${venta.cliente_id}')"`
                      : ""
                  }

              >

                  ${venta.cliente_nombre || "Público en general"}

              </div>
            </div>

            <div class="fi">
                <label class="fl">Estado financiero</label>
                <div>

                ${
                  venta.pago_estado === "LIQUIDADO"
                    ? '<span class="tag tg">🟢 Liquidado</span>'
                    : venta.pago_estado === "CANCELADO"
                      ? '<span class="tag tr">🔴 Cancelado</span>'
                      : '<span class="tag ty">🟠 Pendiente</span>'
                }

                </div>
                            </div>

        </div>

        <div class="fr c2" style="margin-top:12px">

            <div class="fi">
                <label class="fl">Orden relacionada</label>
                <div

                  style="
                      color:${venta.orden_rel ? "var(--accent)" : "inherit"};
                      cursor:${venta.orden_rel ? "pointer" : "default"};
                      text-decoration:${venta.orden_rel ? "underline" : "none"};
                      font-weight:600;
                  "

                  ${
                    venta.orden_rel
                      ? `onclick="closeM('m-vta-view');openExp('${venta.orden_rel}')"`
                      : ""
                  }

              >

                  ${venta.orden_rel || "—"}

              </div>
            </div>

            <div class="fi">
                <label class="fl">Ticket relacionado</label>
                <div

                    style="
                        color:${venta.ticket_id ? "var(--accent)" : "inherit"};
                        cursor:${venta.ticket_id ? "pointer" : "default"};
                        text-decoration:${venta.ticket_id ? "underline" : "none"};
                        font-weight:600;
                    "

                   ${
                     venta.ticket_id
                       ? `onclick="closeM('m-vta-view');openTicket('${venta.ticket_id}')"`
                       : ""
                   }

                >

                    ${venta.ticket_folio || "—"}

                </div>
            </div>

        </div>

        <div
              style="
                  margin-top:18px;
                  font-family:var(--fh);
                  color:var(--accent);
                  font-size:15px;
              ">

              <i class="ar-icon clipboard"></i>

              Conceptos

          </div>

        ${(venta.lineas || [])
          .map(
            (l) => `

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    padding:10px;
                    margin-top:8px;
                    background:var(--bg3);
                    border:1px solid var(--border);
                    border-radius:var(--r);
                ">

                <div>

                    <div style="font-weight:600">

                        ${
                          l.tipo === "producto"
                            ? '<i class="ar-icon inventario"></i>'
                            : '<i class="ar-icon servicio"></i>'
                        }

                        ${l.desc}

                    </div>

                    <div
                        style="
                            font-size:11px;
                            color:var(--text2);
                        ">

                        <div
                            style="
                                font-size:11px;
                                color:var(--text2);
                            ">

                            Cantidad: ${l.qty}

                        </div>

                        <div
                            style="
                                font-size:11px;
                                color:var(--text2);
                            ">

                            Precio unitario:
                            ${mxn(l.precio || 0)}

                        </div>

                    </div>

                </div>

                <div
                    style="
                        text-align:right;
                        font-family:var(--fh);
                    ">

                    ${mxn((l.qty || 1) * (l.precio || 0))}

                </div>

            </div>

        `,
          )
          .join("")}

        <div
            style="
                margin-top:18px;
                padding-top:12px;
                border-top:1px solid var(--border);
            ">

            <div style="display:flex;justify-content:space-between">

                <span>Subtotal</span>

                <strong>${mxn(venta.subtotal || 0)}</strong>

            </div>

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    margin-top:6px;
                ">

                <span>IVA (${venta.iva_pct || 0}%)</span>

                <strong>${mxn(venta.iva_monto || 0)}</strong>

            </div>

            <div
                  style="
                      display:flex;
                      justify-content:space-between;
                      align-items:center;
                      margin-top:12px;
                      padding-top:10px;
                      border-top:1px dashed var(--border);
                  ">

                  <span
                      style="
                          font-size:15px;
                          font-weight:700;
                      ">

                      TOTAL

                  </span>

                  <span
                      style="
                          font-family:var(--fh);
                          font-size:22px;
                          color:var(--green);
                          font-weight:700;
                      ">

                      ${mxn(venta.total || 0)}

                  </span>

              </div>

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    margin-top:6px;
                ">

                <span>Saldo</span>

                <strong>

                    ${mxn(venta.pago_saldo ?? venta.total)}

                </strong>

            </div>

        </div>

    `;

  document.getElementById("vta-print-carta").onclick = () =>
    prtVta(id, "carta");

  document.getElementById("vta-print-80").onclick = () => prtVta(id, "80mm");

  document.getElementById("vta-print-58").onclick = () => prtVta(id, "58mm");

  window.initIcons();

  openM("m-vta-view");
}

async function saveEditVta() {
  const id = document.getElementById("edit-vta-id").value;
  const vtas = DB.get("ventas");
  const i = vtas.findIndex((v) => v.id === id);
  if (i < 0) return;
  const v = vtas[i];
  // Guardar cantidades originales para ajustar inventario
  const cantidadesOriginales = {};

  (v.lineas || []).forEach((l) => {
    if (l.tipo === "producto") {
      cantidadesOriginales[l.sku] = l.qty || 1;
    }
  });
  (v.lineas || []).forEach((l, li) => {
    const eq = document.getElementById("ev-q-" + li);
    const ep = document.getElementById("ev-p-" + li);
    if (eq) l.qty = parseInt(eq.value) || 1;
    if (ep) l.precio = parseFloat(ep.value) || 0;
  });
  // Ajustar inventario según diferencia de cantidades
  // [FASE 4] Mediante el motor (transacción con el stock real del servidor y
  // registro del movimiento). Antes se escribía el número calculado localmente.
  for (const l of (v.lineas || []).filter((x) => x.tipo === "producto")) {
    const anterior = cantidadesOriginales[l.sku] || 0;
    const nueva = l.qty || 0;

    const diferencia = anterior - nueva;

    if (diferencia === 0) continue;

    // diferencia > 0: se vendieron menos piezas → regresan al inventario
    // diferencia < 0: se vendieron más piezas → salen del inventario
    const resultado =
      diferencia > 0
        ? await INVENTARIO_ENGINE.devolucion({
            productoId: l.sku,
            cantidad: diferencia,
            documento: v.folio || id,
            modulo: "VENTAS",
            origen: "EDICION_VENTA",
            observaciones: `Edición de venta ${v.folio || id}`,
          })
        : await INVENTARIO_ENGINE.venta({
            productoId: l.sku,
            cantidad: -diferencia,
            documento: v.folio || id,
            modulo: "VENTAS",
            origen: "EDICION_VENTA",
            observaciones: `Edición de venta ${v.folio || id}`,
          });

    if (!resultado.ok) {
      ARABOT.alert({
        title: "Error de inventario",

        message: resultado.error,

        details: `No se pudo ajustar el inventario de ${l.desc || l.sku}. Los cambios de la venta no se guardaron.`,
      });

      return;
    }
  }
  const iva = parseFloat(document.getElementById("ev-iva").value) || 0;
  const sub = (v.lineas || []).reduce(
    (a, l) => a + (l.qty || 1) * (l.precio || 0),
    0,
  );
  v.subtotal = sub;
  v.iva_pct = iva;
  v.iva_monto = (sub * iva) / 100;
  v.total = sub + v.iva_monto;
  v.fecha = document.getElementById("ev-fch").value;
  await DATA.update("ventas", id, v);
  closeM("m-edit-vta");
  rndVta();
  dash();
  notify("Venta actualizada ✅");
}
async function eliminarVtaConfirm() {
  const id = document.getElementById("edit-vta-id").value;
  const ok = await ARABOT.confirm({
    title: "Eliminar venta",

    message: "¿Deseas eliminar esta venta?",

    details:
      "El stock de los productos será restaurado al inventario y la venta será eliminada permanentemente. Esta acción no podrá deshacerse.",
  });

  if (!ok) return;
  const vtas = DB.get("ventas");
  const v = vtas.find((x) => x.id === id);
  if (!v) return;
  // restaurar inventario mediante el motor

  for (const l of (v.lineas || []).filter((x) => x.tipo === "producto")) {
    const resultado = await INVENTARIO_ENGINE.cancelacion({
      productoId: l.sku,

      cantidad: Number(l.qty || 1),

      documento: v.folio,

      modulo: "VENTAS",

      origen: "CANCELACION_VENTA",

      referencia: v.cliente_nombre || "",

      observaciones: `Cancelación de venta ${v.folio}`,
    });

    if (!resultado.ok) {
      ARABOT.alert({
        title: "Error de inventario",

        message: resultado.error,

        details: "No fue posible restaurar el inventario.",
      });

      return;
    }
  }

  // quitar relación con la orden
  if (v.orden_rel) {
    const ords = DB.get("ordenes");

    const oi = ords.findIndex((o) => o.id === v.orden_rel);

    if (oi >= 0) {
      ords[oi].vtas_rel = (ords[oi].vtas_rel || []).filter((f) => f !== v.id);

      await DATA.update("ordenes", v.orden_rel, {
        vtas_rel: ords[oi].vtas_rel,
      });
    }
  }
  await DATA.delete("ventas", id);

  closeM("m-edit-vta");
  rndVta();
  dash();
  notify("Venta eliminada y stock restaurado ✅");
}

async function delVta(id) {
  const v = DB.get("ventas").find((x) => x.id === id);

  if (!v) {
    notify("Venta no encontrada");
    return;
  }

  const ok = await ARABOT.confirm({
    title: "Eliminar venta",

    message: "¿Deseas eliminar la venta " + v.folio + "?",

    details:
      "Se restaurará el inventario, se eliminarán las garantías relacionadas y la venta será eliminada permanentemente.<br><br>Esta acción no podrá deshacerse.",
  });

  if (!ok) return;

  // ======================================================
  // Restaurar inventario
  // ======================================================

  for (const linea of (v.lineas || []).filter((l) => l.tipo === "producto")) {
    const resultado = await INVENTARIO_ENGINE.cancelacion({
      productoId: linea.sku,

      cantidad: Number(linea.qty || 1),

      documento: v.folio,

      modulo: "VENTAS",

      origen: "CANCELACION_VENTA",

      referencia: v.cliente_nombre || "",

      observaciones: `Cancelación de venta ${v.folio}`,
    });

    if (!resultado.ok) {
      ARABOT.alert({
        title: "Error de inventario",

        message: resultado.error,

        details: "No fue posible restaurar el inventario.",
      });

      return;
    }
  }

  // ======================================================
  // Eliminar garantías
  // ======================================================

  await eliminarGarantiasVenta(v.folio);

  // ======================================================
  // Quitar relación con la orden
  // ======================================================

  if (v.orden_rel) {
    const orden = DB.get("ordenes").find((o) => o.id === v.orden_rel);

    if (orden) {
      orden.vtas_rel = (orden.vtas_rel || []).filter((f) => f !== v.id);

      await DATA.update("ordenes", orden.id, {
        vtas_rel: orden.vtas_rel,
      });
    }
  }

  // ======================================================
  // Quitar relación con el ticket
  // ======================================================

  if (v.ticket_id) {
    await DATA.update("tickets", v.ticket_id, {
      venta_generada: false,
      venta_id: "",
      venta_folio: "",
    });
  }

  // ======================================================
  // Eliminar venta
  // ======================================================

  await DATA.delete("ventas", v.id);

  // ======================================================
  // Refrescar UI
  // ======================================================

  rndInv();
  rndGar();
  rndVta();
  dash();

  notify("✅ Venta eliminada correctamente");
}

async function restaurarInventarioVenta(venta) {
  for (const linea of (venta.lineas || []).filter(
    (l) => l.tipo === "producto",
  )) {
    const resultado = await INVENTARIO_ENGINE.cancelacion({
      productoId: linea.sku,

      cantidad: Number(linea.qty || 1),

      documento: venta.folio,

      modulo: "VENTAS",

      origen: "CANCELACION_VENTA",

      referencia: venta.cliente_nombre || "",

      observaciones: `Restauración por cancelación de venta ${venta.folio}`,
    });

    if (!resultado.ok) {
      ARABOT.alert({
        title: "Error de inventario",

        message: resultado.error,

        details: "No fue posible restaurar el inventario.",
      });

      return false;
    }
  }

  rndInv();

  return true;
}

// [FASE 4] cancelarGarantiasVenta() se eliminó de aquí: estaba duplicada y la
// versión que realmente se usaba es la de js/modules/garantias.js (se carga después).

async function desvincularOrdenVenta(venta) {
  if (!venta.orden_rel) return;

  const orden = DB.get("ordenes").find((o) => o.id === venta.orden_rel);

  if (orden) {
    orden.vtas_rel = (orden.vtas_rel || []).filter((id) => id !== venta.id);

    await DATA.update("ordenes", orden.id, {
      vtas_rel: orden.vtas_rel,
    });
  }

  // Desvincular también la venta
  venta.orden_rel = "";

  await DATA.update("ventas", venta.id, {
    orden_rel: "",
  });
}

async function desvincularTicketVenta(venta) {
  if (!venta.ticket_id) return;

  await DATA.update("tickets", venta.ticket_id, {
    venta_generada: false,

    venta_id: "",

    venta_folio: "",
  });
}

window.saveVta = saveVta;
window.rndVta = rndVta;
window.openEditVta = openEditVta;
window.openVenta = openVenta;
window.saveEditVta = saveEditVta;
window.eliminarVtaConfirm = eliminarVtaConfirm;
window.delVta = delVta;
window.restaurarInventarioVenta = restaurarInventarioVenta;
window.desvincularOrdenVenta = desvincularOrdenVenta;
window.desvincularTicketVenta = desvincularTicketVenta;
