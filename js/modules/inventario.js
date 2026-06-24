// INVENTARIO
function autoGarProd() {
  const c = document.getElementById("pr-cond").value;
  const cf = DB.obj("config");
  document.getElementById("pr-gd").value =
    c === "Nuevo" ? cf.cfg_gn || 365 : cf.cfg_gu || 90;
}
function calcPU() {
  const c = parseFloat(document.getElementById("pr-co").value) || 0;
  const p = parseFloat(document.getElementById("pr-pr").value) || 0;
  if (c && p) {
    const u = p - c;
    const pct = p > 0 ? ((u / p) * 100).toFixed(1) : 0;
    document.getElementById("pr-ut").value = mxn(u) + " (" + pct + "% margen)";
  }
}
function saveProd() {
  const nm = document.getElementById("pr-nm").value.trim();
  if (!nm) {
    alert("Ingresa la descripción");
    return;
  }
  const prods = DB.get("inventario");
  const sku = "SKU-" + String(prods.length + 1).padStart(4, "0");
  const co = parseFloat(document.getElementById("pr-co").value) || 0;
  const pr = parseFloat(document.getElementById("pr-pr").value) || 0;
  const cond = document.getElementById("pr-cond").value;
  const newProd = {
    id: sku,
    sku,
    nombre: nm,
    marca: document.getElementById("pr-mk").value,
    cat: document.getElementById("pr-cat").value,
    cond,
    stock: parseInt(document.getElementById("pr-stk").value) || 0,
    min: parseInt(document.getElementById("pr-min").value) || 3,
    unidad: document.getElementById("pr-uni").value,
    costo: co,
    precio: pr,
    garantia_dias: parseInt(document.getElementById("pr-gd").value) || 0,
    proveedor: document.getElementById("pr-pv").value,
    notas: document.getElementById("pr-nt").value,
    fecha: hoy(),
  };
  prods.push(newProd);
  DB.set("inventario", prods);
  API.save("inventario", newProd);
  closeM("m-prod");
  ["pr-nm", "pr-mk", "pr-pv", "pr-nt"].forEach(
    (f) => (document.getElementById(f).value = ""),
  );
  document.getElementById("pr-co").value = "";
  document.getElementById("pr-pr").value = "";
  document.getElementById("pr-ut").value = "";
  rndInv();
  notify("Producto agregado ✅");
}
function rndInv(lista) {
  const todos = DB.get("inventario");
  const data = lista || todos;
  const tb = document.getElementById("tb-inv");
  if (!data.length) {
    tb.innerHTML = '<tr><td colspan="12" class="nd">Sin productos</td></tr>';
  } else
    tb.innerHTML = data
      .map((p) => {
        const u = p.precio - p.costo;
        const pct = p.precio > 0 ? ((u / p.precio) * 100).toFixed(0) : 0;
        const bajo = p.stock <= p.min;
        const sin = p.stock === 0;
        const sc = sin ? "sr" : bajo ? "so" : "sg";
        const tc = sin ? "tr" : bajo ? "to" : "tg";
        const tt = sin ? "Sin stock" : bajo ? "Stock bajo" : "OK";
        const cc = p.cond === "Nuevo" ? "tg" : p.cond === "Usado" ? "to" : "tb";
        return `<tr><td style="font-size:10px;color:var(--text3)">${p.sku}</td><td><b>${p.nombre}</b></td><td style="font-size:11px;color:var(--text2)">${p.marca || "—"}</td><td><span class="tag tgr" style="font-size:10px">${p.cat}</span></td><td><span class="tag ${cc}" style="font-size:10px">${p.cond || "—"}</span></td><td style="${bajo ? "color:var(--orange)" : ""}">${p.stock} ${p.unidad}</td><td style="color:var(--text3)">${p.min}</td><td>${mxn(p.costo)}</td><td style="color:var(--green)">${mxn(p.precio)}</td><td style="color:${pct >= 25 ? "var(--green)" : "var(--red)"}">${pct}%</td><td><span class="sm ${sc}"></span><span class="tag ${tc}" style="font-size:10px">${tt}</span></td><td class="bg-btn"><button class="btn bg bsm" onclick="editProd('${p.sku}')">✏️</button><button class="btn bd bsm" onclick="delProd('${p.sku}')">✕</button></td></tr>`;
      })
      .join("");
  document.getElementById("inv-tot").textContent = todos.length;
  document.getElementById("inv-baj").textContent = todos.filter(
    (p) => p.stock <= p.min,
  ).length;
  document.getElementById("inv-val").textContent = mxn(
    todos.reduce((a, p) => a + p.stock * p.costo, 0),
  );
  const bn = todos.filter((p) => p.stock <= p.min).length;
  const bi = document.getElementById("badge-inv");
  bi.style.display = bn ? "" : "none";
  if (bn) bi.textContent = bn;
}
function filtInv() {
  const q = document.getElementById("sch-inv").value.toLowerCase();
  const cat = document.getElementById("flt-cat").value;
  const cond = document.getElementById("flt-cond").value;
  rndInv(
    DB.get("inventario").filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) &&
        (!cat || p.cat === cat) &&
        (!cond || p.cond === cond),
    ),
  );
}
function adjStk(sku) {
  const d = prompt("Cantidad a agregar (+) o retirar (-):");
  if (!d) return;
  const n = parseInt(d);
  if (isNaN(n)) return;
  const inv = DB.get("inventario");
  const i = inv.findIndex((p) => p.sku === sku);
  if (i < 0) return;
  inv[i].stock = Math.max(0, inv[i].stock + n);
  DB.set("inventario", inv);
  rndInv();
}
function editProd(sku) {
  const inv = DB.get("inventario");
  const p = inv.find((x) => x.sku === sku);
  if (!p) return;
  document.getElementById("pr-nm").value = p.nombre || "";
  document.getElementById("pr-mk").value = p.marca || "";
  document.getElementById("pr-cat").value = p.cat || "";
  document.getElementById("pr-cond").value = p.cond || "Nuevo";
  document.getElementById("pr-stk").value = p.stock || 0;
  document.getElementById("pr-min").value = p.min || 3;
  document.getElementById("pr-uni").value = p.unidad || "pza";
  document.getElementById("pr-co").value = p.costo || 0;
  document.getElementById("pr-pr").value = p.precio || 0;
  document.getElementById("pr-gd").value = p.garantia_dias || 0;
  document.getElementById("pr-pv").value = p.proveedor || "";
  document.getElementById("pr-nt").value = p.notas || "";
  const btn = document.querySelector('#m-prod button[onclick="saveProd()"]');
  if (btn) {
    btn.setAttribute("onclick", `updateProd('${sku}')`);
  }
  openM("m-prod");
}
async function updateProd(sku) {
  const nm = document.getElementById("pr-nm").value.trim();
  if (!nm) {
    alert("Ingresa la descripción");
    return;
  }
  const inv = DB.get("inventario");
  const i = inv.findIndex((p) => p.sku === sku);
  if (i < 0) return;
  const co = parseFloat(document.getElementById("pr-co").value) || 0;
  const pr = parseFloat(document.getElementById("pr-pr").value) || 0;
  inv[i].nombre = nm;
  inv[i].marca = document.getElementById("pr-mk").value;
  inv[i].cat = document.getElementById("pr-cat").value;
  inv[i].cond = document.getElementById("pr-cond").value;
  inv[i].stock = parseInt(document.getElementById("pr-stk").value) || 0;
  inv[i].min = parseInt(document.getElementById("pr-min").value) || 3;
  inv[i].unidad = document.getElementById("pr-uni").value;
  inv[i].costo = co;
  inv[i].precio = pr;
  inv[i].garantia_dias = parseInt(document.getElementById("pr-gd").value) || 0;
  inv[i].proveedor = document.getElementById("pr-pv").value;
  inv[i].notas = document.getElementById("pr-nt").value;
  DB.set("inventario", inv);
  const r = await API.update("inventario", sku, inv[i]);
  const btn = document.querySelector('#m-prod button[onclick^="updateProd"]');
  if (btn) btn.setAttribute("onclick", "saveProd()");
  closeM("m-prod");
  rndInv();
  notify("Producto actualizado ✅");
}
async function delProd(sku) {
  if (!confirm("¿Eliminar este producto?")) return;

  const inv = DB.get("inventario");

  const prod = inv.find((p) => p.sku === sku);

  if (!prod) {
    alert("Producto no encontrado");
    return;
  }

  // eliminar local
  DB.set(
    "inventario",
    inv.filter((p) => p.sku !== sku),
  );

  // eliminar en Sheets
  await API.delete("inventario", prod.id);

  rndInv();

  notify("Producto eliminado ✅");
}

window.autoGarProd = autoGarProd;
window.calcPU = calcPU;

window.saveProd = saveProd;
window.rndInv = rndInv;
window.filtInv = filtInv;
window.adjStk = adjStk;

window.editProd = editProd;
window.updateProd = updateProd;
window.delProd = delProd;
