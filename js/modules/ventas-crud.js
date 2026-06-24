// VENTAS
async function saveVta() {
  if (!LV.length) {
    alert("Agrega al menos un producto o servicio");
    return;
  }
  const inv = DB.get("inventario");
  for (const l of LV.filter((x) => x.tipo === "producto")) {
    const p = inv.find((x) => x.sku === l.sku);
    if (!p || p.stock < (l.qty || 1)) {
      alert(
        "Stock insuficiente: " + l.desc + "\nDisponible: " + (p ? p.stock : 0),
      );
      return;
    }
  }
  const { sub, iva, desc, tot } = recalcVta();
  const cid = document.getElementById("vta-cli").value;
  const cnm = cid
    ? DB.get("clientes").find((c) => c.id === cid)?.nombre || ""
    : "Público en general";
  const ord_rel = document.getElementById("vta-ord").value;
  const fol = await API.getFolio("ARVTA");
  const vta = {
    id: fol,
    folio: fol,
    cliente_id: cid,
    cliente_nombre: cnm,
    fecha: document.getElementById("vta-fch").value,
    lineas: LV.map((l) => ({ ...l })),
    subtotal: sub,
    iva_pct: iva,
    iva_monto: (sub * iva) / 100,
    descuento: desc,
    total: tot,
    pago: document.getElementById("vta-pago").value,
    orden_rel: ord_rel,
    es_directa: !ord_rel,
  };
  API.save("ventas", vta);
  // descontar inventario
  LV.filter((l) => l.tipo === "producto").forEach((l) => {
    const inv2 = DB.get("inventario");
    const pi = inv2.findIndex((p) => p.sku === l.sku);
    if (pi >= 0) {
      inv2[pi].stock = Math.max(0, inv2[pi].stock - (l.qty || 1));
      DB.set("inventario", inv2);
      API.update("inventario", inv2[pi].id, { stock: inv2[pi].stock });
      // Alerta si baja del mínimo
      if (inv2[pi].stock <= (inv2[pi].min || 3)) {
        API.call("alertaInventario", null, {
          producto: inv2[pi].nombre,
          stock: inv2[pi].stock,
          minimo: inv2[pi].min || 3,
        });
      }
    }
  });
  // asociar a orden y sumar total
  if (ord_rel) {
    const ords = DB.get("ordenes");
    const oi = ords.findIndex((o) => o.id === ord_rel);
    if (oi >= 0) {
      ords[oi].vtas_rel = ords[oi].vtas_rel || [];
      ords[oi].vtas_rel.push(fol);
      DB.set("ordenes", ords);
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

          folio_ord: ord_rel || fol,
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

          garantia_dias: gd,

          fecha: vta.fecha || hoy(),
          fecha_gar: fgarV,

          estado: "Activa",

          tipo_gar: prod.cond ? prod.cond.toLowerCase() : "nuevo",
        };

        const gsV = DB.get("garantias");

        gsV.push(garRecV);

        DB.set("garantias", gsV);

        await API.save("garantias", garRecV);
      }
    }
  }

  closeM("m-venta");

  LV = [];

  rndVta();

  dash();

  if (window.ticketVentaOrigenId) {
    const ticketId = window.ticketVentaOrigenId;

    await API.update("tickets", ticketId, {
      venta_id: fol,
      venta_folio: fol,
      venta_generada: true,
    });

    window.ticketVentaOrigenId = null;

    openTicket(ticketId);
  }

  notify("Venta " + fol + " registrada ✅");
}

function rndVta() {
  const todos = DB.get("ventas");
  const tb = document.getElementById("tb-vta");
  if (!todos.length) {
    tb.innerHTML = '<tr><td colspan="8" class="nd">Sin ventas</td></tr>';
  } else
    tb.innerHTML = todos
      .slice()
      .reverse()
      .map(
        (v) => `<tr>
    <td style="font-family:var(--fh);color:var(--accent);font-size:11px">${v.folio}</td>
    <td style="font-size:10px">${fmt(v.fecha)}</td><td>${v.cliente_nombre || "—"}</td>
    <td style="font-size:10px">${
      (v.lineas || [])
        .map((l) => l.desc)
        .join(", ")
        .substring(0, 35) || "—"
    }</td>
    <td style="color:var(--green);font-weight:600;font-family:var(--fh)">${mxn(v.total)}</td>
    <td><span class="tag tb">${v.pago}</span></td>
    <td style="font-size:10px;color:var(--text2)">${v.orden_rel || "Directa"}</td>
    <td class="bg-btn">
      <button class="btn bg bsm" onclick="prtVta('${v.id}','carta')">📄</button>
      <button class="btn bg bsm" onclick="prtVta('${v.id}','58mm')">58</button>
      <button class="btn bg bsm" onclick="prtVta('${v.id}','80mm')">80</button>
      <button class="btn bg bsm" onclick="openEditVta('${v.id}')">✏️</button>
    </td>
  </tr>`,
      )
      .join("");
  const mes = new Date().toISOString().slice(0, 7);
  const dm = todos.filter((v) => v.fecha && v.fecha.startsWith(mes));
  const tt = dm.reduce((a, v) => a + v.total, 0);
  document.getElementById("kvm").textContent = mxn(tt);
  document.getElementById("ktm").textContent = dm.length;
  document.getElementById("ktp").textContent = dm.length
    ? mxn(tt / dm.length)
    : "$0";
}
function openEditVta(id) {
  const v = DB.get("ventas").find((x) => x.id === id);
  if (!v) return;
  document.getElementById("edit-vta-id").value = id;
  document.getElementById("edit-vta-body").innerHTML = `
    <div class="al al-o" style="margin-bottom:12px">Al guardar cambios se recalculará el total. Si eliminas, el stock de productos regresará al inventario.</div>
    <div class="fr c2"><div class="fi"><label class="fl">Forma de pago</label><select id="ev-pago"><option ${v.pago === "Efectivo" ? "selected" : ""}>Efectivo</option><option ${v.pago === "Transferencia" ? "selected" : ""}>Transferencia</option><option ${v.pago === "Mercado Pago" ? "selected" : ""}>Mercado Pago</option><option ${v.pago === "Tarjeta" ? "selected" : ""}>Tarjeta</option></select></div><div class="fi"><label class="fl">Fecha</label><input type="date" id="ev-fch" value="${v.fecha || ""}"></div></div>
    <div style="font-family:var(--fh);color:var(--accent);margin:10px 0 6px">LÍNEAS DE VENTA</div>
    ${(v.lineas || []).map((l, i) => `<div style="display:grid;grid-template-columns:1fr 70px 90px;gap:7px;margin-bottom:5px;align-items:center"><span style="font-size:12px">${l.tipo === "producto" ? "📦" : "🔧"} ${l.desc}</span><input type="number" value="${l.qty || 1}" id="ev-q-${i}" style="font-size:11px;text-align:center"><input type="number" value="${l.precio}" id="ev-p-${i}" style="font-size:11px;text-align:right"></div>`).join("")}
    <div class="fr c2" style="margin-top:8px"><div class="fi"><label class="fl">IVA %</label><input type="number" id="ev-iva" value="${v.iva_pct || 0}"></div><div class="fi"><label class="fl">Descuento $</label><input type="number" id="ev-desc" value="${v.descuento || 0}"></div></div>
  `;
  openM("m-edit-vta");
}
async function saveEditVta() {
  const id = document.getElementById("edit-vta-id").value;
  const vtas = DB.get("ventas");
  const i = vtas.findIndex((v) => v.id === id);
  if (i < 0) return;
  const v = vtas[i];
  (v.lineas || []).forEach((l, li) => {
    const eq = document.getElementById("ev-q-" + li);
    const ep = document.getElementById("ev-p-" + li);
    if (eq) l.qty = parseInt(eq.value) || 1;
    if (ep) l.precio = parseFloat(ep.value) || 0;
  });
  const iva = parseFloat(document.getElementById("ev-iva").value) || 0;
  const desc = parseFloat(document.getElementById("ev-desc").value) || 0;
  const sub = (v.lineas || []).reduce(
    (a, l) => a + (l.qty || 1) * (l.precio || 0),
    0,
  );
  v.subtotal = sub;
  v.iva_pct = iva;
  v.iva_monto = (sub * iva) / 100;
  v.descuento = desc;
  v.total = Math.max(0, sub * (1 + iva / 100) - desc);
  v.pago = document.getElementById("ev-pago").value;
  v.fecha = document.getElementById("ev-fch").value;
  DB.set("ventas", vtas);
  await API.update("ventas", id, v);
  closeM("m-edit-vta");
  rndVta();
  dash();
  notify("Venta actualizada ✅");
}
function eliminarVtaConfirm() {
  const id = document.getElementById("edit-vta-id").value;
  if (
    !confirm(
      "¿Eliminar esta venta? El stock de productos regresará al inventario.",
    )
  )
    return;
  const vtas = DB.get("ventas");
  const v = vtas.find((x) => x.id === id);
  if (!v) return;
  // regresar stock
  (v.lineas || [])
    .filter((l) => l.tipo === "producto")
    .forEach((l) => {
      const inv = DB.get("inventario");
      const pi = inv.findIndex((p) => p.sku === l.sku);
      if (pi >= 0) {
        inv[pi].stock = (inv[pi].stock || 0) + (l.qty || 1);
        DB.set("inventario", inv);
      }
    });
  // quitar de orden relacionada
  if (v.orden_rel) {
    const ords = DB.get("ordenes");
    const oi = ords.findIndex((o) => o.id === v.orden_rel);
    if (oi >= 0) {
      ords[oi].vtas_rel = (ords[oi].vtas_rel || []).filter((x) => x !== id);
      DB.set("ordenes", ords);
    }
  }
  DB.set(
    "ventas",
    vtas.filter((x) => x.id !== id),
  );
  closeM("m-edit-vta");
  rndVta();
  dash();
  notify("Venta eliminada y stock restaurado ✅");
}

window.saveVta = saveVta;
window.rndVta = rndVta;
window.openEditVta = openEditVta;
window.saveEditVta = saveEditVta;
window.eliminarVtaConfirm = eliminarVtaConfirm;
