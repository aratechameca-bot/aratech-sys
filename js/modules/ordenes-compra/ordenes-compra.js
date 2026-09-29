// ============================================================
// ORDENES-COMPRA
// ============================================================

// --- Sub-pestañas del panel Compras ---
function cmpTab(t) {
  document.getElementById("cmp-panel-ord").style.display =
    t === "ord" ? "" : "none";
  document.getElementById("cmp-panel-prov").style.display =
    t === "prov" ? "" : "none";
  document.getElementById("cmp-tab-ord").style.background =
    t === "ord" ? "var(--accent)" : "var(--card)";
  document.getElementById("cmp-tab-ord").style.color =
    t === "ord" ? "#fff" : "var(--text2)";
  document.getElementById("cmp-tab-prov").style.background =
    t === "prov" ? "var(--accent)" : "var(--card)";
  document.getElementById("cmp-tab-prov").style.color =
    t === "prov" ? "#fff" : "var(--text2)";
}

// ============================================================
// ÓRDENES DE COMPRA
// ============================================================

let OC_LINEAS = [];
let PROV_OC_CALLBACK = false;
let OC_PROVEEDOR_ACTUAL = "";

// --- ÓRDENES DE COMPRA ---

function openNuevaOC() {
  document.getElementById("oc-tit").innerHTML =
    '<i class="ar-icon compras"></i> Nueva orden de compra';
  initIcons();
  document.getElementById("oc-eid").value = "";
  document.getElementById("oc-fecha").value = hoy();
  document.getElementById("oc-notas").value = "";
  document.getElementById("oc-estado").value = "Pendiente";
  fillProvSelect();
  document.getElementById("oc-prov").value = "";
  document.getElementById("oc-prov").selectedIndex = 0;
  OC_LINEAS = [];
  OC_PROVEEDOR_ACTUAL = "";
  addLineaOC();
  openM("m-oc");
}

async function saveOC() {
  if (!document.getElementById("oc-prov").value) {
    ARABOT.alert({
      title: "Proveedor requerido",

      message: "Selecciona un proveedor.",

      details:
        "Debes seleccionar un proveedor antes de guardar la Orden de Compra.",
    });

    return;
  }
  if (!OC_LINEAS.length || !OC_LINEAS[0].desc.trim()) {
    ARABOT.alert({
      title: "Sin productos",

      message: "Agrega al menos un producto.",

      details: "La Orden de Compra debe contener al menos un producto.",
    });

    return;
  }

  ARABOT.loading({
    title: "Procesando Orden de Compra",

    details: "Estamos registrando la orden y actualizando el inventario.",
  });
  const eid = document.getElementById("oc-eid").value;
  const ocs = DB.get("ordenes_compra");
  const provId = document.getElementById("oc-prov").value;
  const prov = DB.get("proveedores").find((p) => p.id === provId);
  let sub = 0,
    ivaT = 0;
  for (const l of OC_LINEAS) {
    const s = (parseFloat(l.qty) || 0) * (parseFloat(l.precio) || 0);
    sub += s;
    if (l.iva !== "exento") ivaT += (s * (parseFloat(l.iva) || 0)) / 100;
  }
  const estadoNuevo = document.getElementById("oc-estado").value || "Pendiente";
  const datos = {
    proveedorId: provId,
    proveedorNombre: prov ? prov.nombre : "",
    fecha: document.getElementById("oc-fecha").value,
    notas: document.getElementById("oc-notas").value,
    lineas: OC_LINEAS.map((l) => ({ ...l })),
    subtotal: sub,
    ivaTotal: ivaT,
    total: sub + ivaT,
    estado: estadoNuevo,
  };
  // Detectar si está marcando como recibida por primera vez
  let eraRecibida = false;
  let ocId = eid;
  if (eid) {
    const ocPrev = ocs.find((o) => o.id === eid);
    eraRecibida =
      ocPrev &&
      (ocPrev.estado === "Recibida completa" ||
        ocPrev.estado === "Recibida parcial");
    const i = ocs.findIndex((o) => o.id === eid);
    if (i >= 0) {
      ocs[i] = { ...ocs[i], ...datos };
      DB.set("ordenes_compra", ocs);
      await DATA.update("ordenes_compra", eid, datos);
    }
  } else {
    const id = await API.getFolio("AROC");
    ocId = id;
    const no = {
      id,

      ...datos,

      pago_total: datos.total,

      pago_pagado: 0,

      pago_saldo: datos.total,

      pago_estado: "PENDIENTE",

      pago_descuento: 0,

      pago_devoluciones: 0,

      historial: [
        {
          estado: "Pendiente",
          fecha: hoy(),
        },
      ],
    };
    ocs.push(no);
    DB.set("ordenes_compra", ocs);
    await DATA.save("ordenes_compra", no.id, no);
  }
  /* // #17: Si acaba de marcarse como Recibida, actualizar stock
  if (
    (estadoNuevo === "Recibida completa" ||
      estadoNuevo === "Recibida parcial") &&
    !eraRecibida
  ) {
    const inv = DB.get("inventario");

    for (const l of OC_LINEAS) {
      if (!l.desc || !l.desc.trim()) return;
      const qty = parseInt(l.qty) || 1;
      const costo = parseFloat(l.precio) || 0;

      console.log("================================");
      console.log("LÍNEA OC:", l);
      console.log("SKU:", l.sku);
      console.log("DESC:", l.desc);
      console.log("MARCA:", l.marca);

      // Buscar por SKU o nombre+marca
      let idx = l.sku ? inv.findIndex((p) => p.sku === l.sku) : -1;
      console.log("IDX POR SKU:", idx);
      if (idx < 0) {
        const nombre = normalizarTexto(l.desc);

        const marca = normalizarTexto(l.marca || "");

        idx = inv.findIndex((p) => {
          return (
            normalizarTexto(p.nombre) === nombre &&
            normalizarTexto(p.marca || "") === marca
          );
        });
      }

      console.log("IDX FINAL:", idx);

      if (idx >= 0) {
        console.log("PRODUCTO ENCONTRADO:", inv[idx]);
      } else {
        console.log("NO SE ENCONTRÓ PRODUCTO");
      }

      if (idx >= 0) {
        console.log("LLAMANDO INVENTARIO_ENGINE.compra()");
        // Producto existe → sumar stock y actualizar costo
        const resultado = await INVENTARIO_ENGINE.compra({
          productoId: inv[idx].sku,

          cantidad: qty,

          documento: ocId,

          modulo: "COMPRAS",

          origen: "ORDEN_COMPRA",

          referencia: prov ? prov.nombre : "",

          observaciones: `Recepción de Orden de Compra ${ocId}`,
        });

        console.log("RESULTADO DEL MOTOR:", resultado);

        if (!resultado.ok) {
          ARABOT.closeLoading();

          ARABOT.alert({
            title: "Error de inventario",

            message: resultado.error,

            details: "No fue posible ingresar el producto al inventario.",
          });

          return;
        }

        if (costo > 0) {
          resultado.producto.costo = costo;
        }

        if (l.garantia_dias) {
          resultado.producto.garantia_dias = parseInt(l.garantia_dias) || 0;
        }

        if (l.notas) {
          resultado.producto.notas = l.notas;
        }

        await DATA.update(
          "inventario",

          resultado.producto.id,

          resultado.producto,
        );
      } else {
        // Producto nuevo → crear en inventario
        const nuevoSku =
          l.sku || "SKU-" + String(inv.length + 1).padStart(4, "0");
        const prod = {
          id: nuevoSku,
          sku: nuevoSku,
          nombre: l.desc,
          marca: l.marca || "",
          cat: l.cat || "Refacción",
          cond: l.cond || "Nuevo",
          stock: qty,
          min: parseInt(l.min) || 1,
          unidad: l.unidad || "pza",
          costo,
          precio: costo,
          garantia_dias: parseInt(l.garantia_dias) || 0,
          proveedor: prov ? prov.nombre : "",
          notas: l.notas || "",
          fecha: hoy(),
        };
        inv.push(prod);
        await DATA.save("inventario", prod.id, prod);
      }
    }
    DB.set("inventario", inv);

    ARABOT.success({
      title: "Orden recibida",

      message: "El inventario fue actualizado correctamente.",

      details: "La Orden de Compra fue procesada y el stock quedó actualizado.",
    });
  } */
  closeM("m-oc");
  rndOC();

  if (
    !(
      (estadoNuevo === "Recibida completa" ||
        estadoNuevo === "Recibida parcial") &&
      !eraRecibida
    )
  ) {
    ARABOT.success({
      title: "Orden de Compra registrada",

      message: "La Orden de Compra fue guardada correctamente.",

      details: "La información fue almacenada y sincronizada correctamente.",
    });
  }
}

function openDetalleOC(id) {
  const oc = DB.get("ordenes_compra").find((x) => x.id === id);
  if (!oc) return;
  document.getElementById("oc-det-tit").innerHTML =
    '<i class="ar-icon compras"></i> Orden de compra — ' + oc.id;
  initIcons();
  document.getElementById("oc-det-est").value = oc.estado;
  //=========================================
  // BLOQUEAR CAMBIO DE ESTADO SI YA FUE RECIBIDA
  //=========================================

  const estadoOC = document.getElementById("oc-det-est");

  const bloqueada =
    oc.estado === "Recibida completa" || oc.estado === "Recibida parcial";

  estadoOC.disabled = bloqueada;

  document.getElementById("oc-det-body").innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:12px">
      <div class="card card-sm"><div class="kl">Proveedor</div><b>${oc.proveedorNombre}</b></div>
      <div class="card card-sm"><div class="kl">Fecha</div>${fmt(oc.fecha)}</div>
      <div class="card card-sm"><div class="kl">Estado</div><span class="tag ${oc.estado === "Recibida completa" ? "tgg" : oc.estado === "Cancelada" ? "trd" : "tgr"}">${oc.estado}</span></div>
    </div>
    <div style="overflow-x:auto;margin:16px 0">
      <table class="tbl">
        <thead><tr><th>Descripción</th><th>SKU</th><th>Cant.</th><th>Precio</th><th>IVA</th><th>Condición</th><th>Subtotal</th></tr></thead>
        <tbody>${(oc.lineas || [])
          .map((l) => {
            const s = (parseFloat(l.qty) || 0) * (parseFloat(l.precio) || 0);
            return `<tr>
          <td>${l.desc}</td><td style="font-size:10px;color:var(--text2)">${l.sku || "—"}</td>
          <td style="text-align:right">${l.qty}</td><td style="text-align:right">${mxn(parseFloat(l.precio) || 0)}</td>
          <td>${l.iva === "exento" ? "Exento" : l.iva + "%"}</td><td>${l.cond}</td>
          <td style="text-align:right;color:var(--green)">${mxn(s)}</td>
        </tr>`;
          })
          .join("")}</tbody>
      </table>
            </div>
           <div style="
              margin-top:16px;
              padding:16px;
              background:var(--bg3);
              border:1px solid var(--border);
              border-radius:8px;
              ">

                <div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;margin-bottom:8px">
                  <span style="color:var(--text2)">Subtotal</span>
                  <strong>${mxn(oc.subtotal || 0)}</strong>
                </div>

                <div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;margin-bottom:8px">
                  <span style="color:var(--text2)">IVA</span>
                  <strong>${mxn(oc.ivaTotal || 0)}</strong>
                </div>

                <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                margin-top:10px;
                padding-top:10px;
                border-top:1px solid var(--border);
                font-size:16px;
                font-weight:700;
                ">
                    <span>Total</span>
                    <span style="color:var(--green)">
                        ${mxn(oc.total || 0)}
                    </span>
                </div>

              </div>
    ${oc.notas ? `<div class="card card-sm" style="margin-top:10px"><div class="kl">Notas</div>${oc.notas}</div>` : ""}
    <div style="
margin-top:16px;
padding:16px;
background:var(--bg3);
border:1px solid var(--border);
border-radius:8px;
">

  <div class="kl" style="margin-bottom:10px">
    Historial
  </div>

  ${(oc.historial || [])
    .slice()
    .reverse()
    .map(
      (h) =>
        `<div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          padding:8px 0;
          border-bottom:1px solid var(--border);
        ">
            <span style="color:var(--accent2);font-size:12px">
              ${h.estado}
            </span>

            <span style="color:var(--text2);font-size:11px">
              ${fmt(h.fecha)}
            </span>
        </div>`,
    )
    .join("")}

</div>`;

  document.getElementById("oc-det-body").dataset.id = id;
  openM("m-oc-det");
}

async function saveEstOC() {
  const id = document.getElementById("oc-det-body").dataset.id;

  const est = document.getElementById("oc-det-est").value;

  const ocs = DB.get("ordenes_compra");

  const i = ocs.findIndex((o) => o.id === id);

  if (i < 0) return;

  const oc = ocs[i];

  //=========================================
  // PROTEGER ORDEN YA RECIBIDA
  //=========================================

  if (oc.estado === "Recibida completa" || oc.estado === "Recibida parcial") {
    ARABOT.alert({
      title: "Orden protegida",

      message: "Esta Orden de Compra ya fue recibida.",

      details:
        "No es posible modificar el estado porque ya impactó Inventario y Finanzas.",
    });

    return;
  }

  ARABOT.loading({
    title: "Procesando Orden de Compra",

    details:
      "Actualizando inventario, registrando movimientos financieros y sincronizando información...",
  });

  oc.estado = est;

  oc.historial = oc.historial || [];

  oc.historial.push({
    estado: est,

    fecha: hoy(),
  });

  DB.set("ordenes_compra", ocs);

  await DATA.update("ordenes_compra", id, {
    estado: est,

    historial: oc.historial,
  });

  // Si se recibió completamente, ingresar productos al inventario
  if (est === "Recibida completa") {
    const inv = DB.get("inventario");

    for (const l of oc.lineas || []) {
      const qty = parseInt(l.qty) || 1;

      const costo = parseFloat(l.precio) || 0;

      // Buscar por SKU
      let idx = l.sku ? inv.findIndex((p) => p.sku === l.sku) : -1;

      // Buscar por nombre + marca + proveedor como respaldo
      if (idx < 0) {
        const nombre = normalizarTexto(l.desc);

        const marca = normalizarTexto(l.marca || "");

        const proveedor = normalizarTexto(oc.proveedorNombre || "");

        idx = inv.findIndex(
          (p) =>
            normalizarTexto(p.nombre) === nombre &&
            normalizarTexto(p.marca || "") === marca &&
            normalizarTexto(p.proveedorNombre || p.proveedor || "") ===
              proveedor,
        );
      }

      if (idx >= 0) {
        const resultado = await INVENTARIO_ENGINE.compra({
          productoId: inv[idx].sku,

          cantidad: qty,

          documento: oc.id,

          modulo: "COMPRAS",

          origen: "ORDEN_COMPRA",

          referencia: oc.proveedorNombre,

          observaciones: `Recepción de Orden de Compra ${oc.id}`,
        });

        if (!resultado.ok) {
          ARABOT.close();
          ARABOT.alert({
            title: "Error de inventario",

            message: resultado.error,

            details: "No fue posible ingresar el producto al inventario.",
          });

          return;
        }

        if (costo > 0) {
          resultado.producto.costo = costo;
        }

        resultado.producto.proveedorId = oc.proveedorId;

        resultado.producto.proveedor = oc.proveedorNombre;

        resultado.producto.proveedorNombre = oc.proveedorNombre;

        resultado.producto.garantia_dias =
          parseInt(l.garantia_dias) || resultado.producto.garantia_dias || 0;

        resultado.producto.notas = l.notas || resultado.producto.notas || "";

        await DATA.update(
          "inventario",
          resultado.producto.id,
          resultado.producto,
        );
      } else {
        let ultimoSku = 0;

        inv.forEach((p) => {
          const n = parseInt(String(p.sku || "").replace("SKU-", ""));

          if (!isNaN(n) && n > ultimoSku) {
            ultimoSku = n;
          }
        });

        const nuevoSku =
          l.sku || "SKU-" + String(ultimoSku + 1).padStart(4, "0");

        const prod = {
          id: nuevoSku,

          sku: nuevoSku,

          nombre: l.desc,

          marca: l.marca || "",

          cat: l.cat || "Refacción",

          cond: l.cond || "Nuevo",

          stock: qty,

          min: parseInt(l.min) || 1,

          unidad: l.unidad || "pza",

          costo,

          precio: costo,

          garantia_dias: parseInt(l.garantia_dias) || 0,

          proveedorId: oc.proveedorId,

          proveedor: oc.proveedorNombre,

          proveedorNombre: oc.proveedorNombre,

          notas: l.notas || "",

          fecha: hoy(),
        };

        inv.push(prod);

        await DATA.save("inventario", prod.id, prod);
      }
      /*  const garDias =
        l.cond === "Nuevo"
          ? parseInt(cf.cfg_gn) || 365
          : l.cond === "Reacondicionado"
            ? parseInt(cf.cfg_gr) || 90
            : parseInt(cf.cfg_gu) || 90;

      const sku = "SKU-" + String(prods.length + 1).padStart(4, "0");

      const np = {
        id: sku,
        sku: l.sku || sku,
        nombre: l.desc,
        marca: "",
        cat: l.cat || "Refacción",
        cond: l.cond || "Nuevo",
        stock: parseInt(l.qty) || 1,
        min: parseInt(l.min) || 1,
        unidad: l.unidad || "pza",
        costo: parseFloat(l.precio) || 0,
        precio: 0,
        garantia_dias: garDias,
        proveedor: oc.proveedorNombre,
        notas: "Recibido de OC " + oc.id,
        fecha: hoy(),
      };

      prods.push(np);

      await DATA.save("inventario", np.id, np); */
    }

    DB.set("inventario", inv);

    rndInv();

    /*=========================================
REGISTRAR MOVIMIENTO FINANCIERO
=========================================*/

    try {
      await FINANZAS.registrarMovimiento({
        tipo: "EGRESO",

        modulo: "COMPRAS",

        // ==========================
        // CONTRATO FINANCIERO
        // ==========================

        origen: "COMPRAS",

        origen_id: oc.id,

        documento: oc.id,

        // ==========================

        monto: Number(oc.total || 0),

        metodo: "",

        categoria: "Compra",

        descripcion: `Recepción de Orden de Compra ${oc.id}`,

        referencia: oc.id,

        usuario: currentUser?.nombre,

        fecha: hoy(),
      });
    } catch (error) {
      console.error("Error al registrar movimiento financiero:", error);

      notify(
        "⚠️ La compra fue recibida correctamente, pero no pudo registrarse el movimiento financiero.",
      );
    }

    notify("✅ Productos agregados al inventario");
  }

  closeM("m-oc-det");

  rndOC();

  ARABOT.close();

  notify("Estado actualizado ✅");
}

function editOC(id) {
  const oc = DB.get("ordenes_compra").find((x) => x.id === id);

  if (!oc) return;

  //=========================================
  // PROTEGER ÓRDENES YA RECIBIDAS
  //=========================================

  if (oc.estado === "Recibida completa" || oc.estado === "Recibida parcial") {
    ARABOT.alert({
      title: "Orden protegida",

      message: "Esta Orden de Compra ya fue recibida.",

      details:
        "No es posible editar una Orden de Compra que ya impactó el inventario y el Motor Financiero.",
    });

    return;
  }

  id = "oc-tit";
  document.getElementById("oc-tit").innerHTML =
    '<i class="ar-icon edit"></i> Editar orden ' + oc.id;

  window.refreshIcons(document.getElementById("oc-tit"));

  document.getElementById("oc-eid").value = oc.id;

  document.getElementById("oc-fecha").value = oc.fecha || hoy();

  document.getElementById("oc-estado").value = oc.estado || "Pendiente";

  document.getElementById("oc-notas").value = oc.notas || "";

  fillProvSelect();

  document.getElementById("oc-prov").value = oc.proveedorId || "";

  OC_PROVEEDOR_ACTUAL = oc.proveedorId || "";

  OC_LINEAS = (oc.lineas || []).map((l) => ({ ...l }));

  renderLineasOC();

  openM("m-oc");
}

async function delOC(id) {
  if (window.currentUser?.rol !== "admin") {
    notify("Permisos insuficientes");

    return;
  }

  const ok = await ARABOT.confirm({
    title: "Eliminar Orden de Compra",

    message: "¿Deseas eliminar esta Orden de Compra?",

    details:
      "La Orden de Compra será eliminada permanentemente y esta acción no podrá deshacerse.",
  });

  if (!ok) return;

  await DATA.delete("ordenes_compra", id);

  let ocs = DB.get("ordenes_compra");

  ocs = ocs.filter((o) => o.id !== id);

  DB.set("ordenes_compra", ocs);

  rndOC();

  notify("✅ Orden eliminada");
}

const EST_OC_COLOR = {
  Pendiente: "tgr",
  Enviada: "tgb",
  Cancelada: "trd",
  "Recibida completa": "tgg",
  "Recibida parcial": "tgy",
};

function rndOC(lista) {
  const data = lista || DB.get("ordenes_compra");
  const tb = document.getElementById("tb-oc");
  if (!data.length) {
    tb.innerHTML =
      '<tr><td colspan="7" class="nd">Sin órdenes de compra</td></tr>';
    return;
  }
  const esAdmin = window.currentUser?.rol === "admin";
  tb.innerHTML = data
    .slice()
    .reverse()
    .map(
      (oc) => `<tr>
    <td style="font-family:var(--fh);color:var(--accent);font-size:11px">${oc.id}</td>
    <td style="font-size:11px;color:var(--text2)">${fmt(oc.fecha)}</td>
    <td><b>${oc.proveedorNombre || "—"}</b></td>
    <td style="font-size:11px">${(oc.lineas || []).length} producto(s)</td>
    <td style="color:var(--green);font-family:var(--fh)">${mxn(oc.total || 0)}</td>
    <td><span class="tag ${EST_OC_COLOR[oc.estado] || "tgr"}">${oc.estado}</span></td>
    <td class="bg-btn">

    <div class="bg-btn-wrap">

        <button
            class="btn bg bsm btn-acciones"
            data-id="${oc.id}"
            onclick="toggleAcciones(this)"
            title="Acciones">
            <i class="ar-icon menu"></i>
        </button>

    </div>

    <div class="acciones-card">

        <button
            class="btn bg bsm"
            onclick="openDetalleOC('${oc.id}')"
            title="Ver detalle">
            <i class="ar-icon archivo"></i> Ver detalle
        </button>

        ${
          oc.estado === "Recibida completa" || oc.estado === "Recibida parcial"
            ? `
        <button
            class="btn bg bsm"
            disabled
            title="Esta Orden de Compra ya fue recibida y no puede editarse.">
            <i class="ar-icon lock"></i> Bloqueada
        </button>
        `
            : `
        <button
            class="btn bg bsm"
            onclick="editOC('${oc.id}')"
            title="Editar">
            <i class="ar-icon edit"></i> Editar
        </button>
        `
        }

    </div>

</td>
  </tr>`,
    )
    .join("");
  window.refreshIcons(tb);
}

function filtOC() {
  const q = document.getElementById("sch-oc").value.trim().toLowerCase();

  const est = document.getElementById("fil-oc-est").value;

  rndOC(
    DB.get("ordenes_compra").filter((o) => {
      const coincideBusqueda =
        !q ||
        (o.id || "").toLowerCase().includes(q) ||
        (o.proveedorNombre || "").toLowerCase().includes(q) ||
        (o.estado || "").toLowerCase().includes(q) ||
        (o.fecha || "").toLowerCase().includes(q) ||
        (o.notas || "").toLowerCase().includes(q) ||
        (o.lineas || []).some(
          (l) =>
            (l.desc || "").toLowerCase().includes(q) ||
            (l.sku || "").toLowerCase().includes(q) ||
            (l.marca || "").toLowerCase().includes(q) ||
            (l.cat || "").toLowerCase().includes(q) ||
            (l.cond || "").toLowerCase().includes(q),
        );

      const coincideEstado = !est || o.estado === est;

      return coincideBusqueda && coincideEstado;
    }),
  );
}

// Imprimir OC
function prtOC() {
  const id = document.getElementById("oc-det-body").dataset.id;
  const oc = DB.get("ordenes_compra").find((x) => x.id === id);
  if (!oc) return;
  const c = cfg();
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">

${araHeaderHTML(
  c,

  "Orden de Compra",

  "Número de Orden",

  oc.id,

  "Fecha",

  fmt(oc.fecha),

  "Estado",

  oc.estado,
)}

  <div class="ara-body">

  <div class="ara-row2">

    <div class="ara-sec">

      <div class="ara-sec-hd">

        <span class="ara-sec-title">

          Datos del Proveedor

        </span>

      </div>

      <div class="ara-sec-body">

        <div class="ara-field">

          <span class="ara-field-label">

            Proveedor

          </span>

          <span class="ara-field-value">

            ${oc.proveedorNombre || "—"}

          </span>

        </div>

        <div class="ara-row2">

          <div class="ara-field">

            <span class="ara-field-label">

              RFC

            </span>

            <span class="ara-field-value">

              ${oc.proveedorRFC || "—"}

            </span>

          </div>

          <div class="ara-field">

            <span class="ara-field-label">

              Teléfono

            </span>

            <span class="ara-field-value">

              ${oc.proveedorTel || "—"}

            </span>

          </div>

        </div>

        <div class="ara-field">

          <span class="ara-field-label">

            Email

          </span>

          <span class="ara-field-value">

            ${oc.proveedorEmail || "—"}

          </span>

        </div>

      </div>

    </div>

    <div class="ara-sec">

      <div class="ara-sec-hd-blue">

        <span class="ara-sec-title">

          Datos de la Orden

        </span>

      </div>

      <div class="ara-sec-body">

        <div class="ara-field">

          <span class="ara-field-label">

            Estado

          </span>

          <span class="ara-field-value">

            ${oc.estado}

          </span>

        </div>

        <div class="ara-row2">

          <div class="ara-field">

            <span class="ara-field-label">

              Fecha

            </span>

            <span class="ara-field-value">

              ${fmt(oc.fecha)}

            </span>

          </div>

          <div class="ara-field">

            <span class="ara-field-label">

              Solicitó

            </span>

            <span class="ara-field-value">

              ${oc.usuario_creacion || "—"}

            </span>

          </div>

        </div>

      </div>

    </div>

  </div>


  <div class="ara-sec">

  <div class="ara-sec-hd-blue">

    <span class="ara-sec-title">

      Productos Solicitados

    </span>

  </div>

  <div class="ara-sec-body" style="padding:0">

    <table class="ara-table">

      <thead>

        <tr>

          <th style="width:34%">Descripción</th>

          <th style="width:10%">SKU</th>

          <th style="width:12%">Marca</th>

          <th class="r" style="width:8%">Cant.</th>

          <th style="width:10%">Unidad</th>

          <th class="r" style="width:12%">Costo</th>

          <th class="r" style="width:6%">IVA</th>

          <th class="r" style="width:12%">Total</th>

        </tr>

      </thead>

      <tbody>

        ${(oc.lineas || [])
          .map((l) => {
            const subtotal =
              (parseFloat(l.qty) || 0) * (parseFloat(l.precio) || 0);

            return `

            <tr>

                <td>${l.desc}</td>

                <td>${l.sku || "—"}</td>

                <td>${l.marca || "—"}</td>

                <td class="r">${l.qty}</td>

                <td>${l.unidad || "pza"}</td>

                <td class="r">${mxn(parseFloat(l.precio) || 0)}</td>

                <td class="r">${l.iva === "exento" ? "Exento" : l.iva + "%"}</td>

                <td class="r">${mxn(subtotal)}</td>

            </tr>

            `;
          })
          .join("")}

      </tbody>

    </table>

  </div>

</div>

  <div class="ara-totals">

    <div class="ara-total-row">

        <span class="ara-total-label">

            Subtotal

        </span>

        <span class="ara-total-value">

            ${mxn(oc.subtotal || 0)}

        </span>

    </div>

    <div class="ara-total-row">

        <span class="ara-total-label">

            IVA

        </span>

        <span class="ara-total-value">

            ${mxn(oc.ivaTotal || 0)}

        </span>

    </div>

    <div class="ara-total-row grand">

        <span class="ara-total-label">

            Total

        </span>

        <span class="ara-total-value">

            ${mxn(oc.total || 0)}

        </span>

    </div>

</div>
  <div class="ara-sec">

    <div class="ara-sec-hd-blue">

        <span class="ara-sec-title">

            Notas / Observaciones

        </span>

    </div>

    <div class="ara-sec-body">

        <div class="ara-field">

            <span class="ara-field-value tall">

                ${oc.notas || "Sin observaciones."}

            </span>

        </div>

    </div>

</div>

  <div
    class="ara-firmas"
    style="
        grid-template-columns:1fr 1fr;
        gap:80px;
        margin-top:30px;
    ">

    <div class="ara-firma">

        <div class="ara-firma-line"></div>

        <div class="ara-firma-label">

            Solicitó

        </div>

        <div class="ara-firma-sub">

            ${oc.usuario_creacion || "Usuario del sistema"}

        </div>

    </div>

    <div class="ara-firma">

        <div class="ara-firma-line"></div>

        <div class="ara-firma-label">

            Autorizó

        </div>

        <div class="ara-firma-sub">

            ${oc.usuario_autoriza || "Pendiente de autorización"}

        </div>

    </div>

</div>

</div>

${araFooterOCHTML(c)}


  <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),800)}<\/script>
  </body></html>`;
  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
}

// Inicializar datos compras en DB si no existen
if (!DB.get("proveedores").length && !localStorage.getItem("db_proveedores"))
  DB.set("proveedores", []);
if (
  !DB.get("ordenes_compra").length &&
  !localStorage.getItem("db_ordenes_compra")
)
  DB.set("ordenes_compra", []);

window.cmpTab = cmpTab;

window.openNuevaOC = openNuevaOC;
window.saveOC = saveOC;
window.openDetalleOC = openDetalleOC;
window.saveEstOC = saveEstOC;
window.editOC = editOC;
window.delOC = delOC;
window.rndOC = rndOC;
window.filtOC = filtOC;
window.prtOC = prtOC;
