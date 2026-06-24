// LINEAS VENTA
let LV = [];
function initLV() {
  LV = [];
  renderLV();
}
function renderLV() {
  const c = document.getElementById("lv-cont");
  if (!LV.length) {
    c.innerHTML =
      '<div style="color:var(--text3);font-size:12px;padding:8px 0">Agrega productos del inventario o servicios del catálogo…</div>';
    recalcVta();
    return;
  }
  c.innerHTML = LV.map(
    (l, i) => `
    <div style="display:grid;grid-template-columns:1fr 70px 90px 80px 34px;gap:7px;align-items:center;padding:8px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--r);margin-bottom:5px">
      <span style="font-size:11px">${l.tipo === "producto" ? "📦" : "🔧"} ${l.desc}${l.sku ? ' <span style="color:var(--text3);font-size:10px">[' + l.sku + "]</span>" : ""}</span>
      <input type="number" value="${l.qty}" min="1" style="font-size:11px;text-align:center" oninput="onLVqty(${i},this)">
      <input type="number" value="${l.precio}" style="font-size:11px;text-align:right" oninput="onLVprice(${i},this)">
      <span style="font-size:11px;color:var(--green);text-align:right">${mxn((l.qty || 1) * (l.precio || 0))}</span>
      <button class="btn bd bsm" onclick="delLV(${i})">✕</button>
    </div>
  `,
  ).join("");
  recalcVta();
}
function onLVqty(i, inp) {
  LV[i].qty = parseInt(inp.value) || 1;
  recalcVta();
}
function onLVprice(i, inp) {
  LV[i].precio = parseFloat(inp.value) || 0;
  recalcVta();
}
function delLV(i) {
  LV.splice(i, 1);
  renderLV();
}
function recalcVta() {
  const sub = LV.reduce((a, l) => a + (l.qty || 1) * (l.precio || 0), 0);
  const iva = parseFloat(document.getElementById("vta-iva")?.value) || 0;
  const desc = parseFloat(document.getElementById("vta-desc")?.value) || 0;
  const tot = Math.max(0, sub * (1 + iva / 100) - desc);
  const el = document.getElementById("vta-tot");
  if (el) el.textContent = mxn(tot);
  return { sub, iva, desc, tot };
}

// BÚSQUEDA DE PRODUCTOS
let searchTimeout = null;
function addLVP() {
  const wrap = document.getElementById("prod-search-wrap");
  wrap.style.display = "block";
  document.getElementById("prod-search-input").value = "";
  document.getElementById("prod-suggestions").style.display = "none";
  document.getElementById("prod-search-input").focus();
}
function buscarProducto(q) {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    const sug = document.getElementById("prod-suggestions");
    if (!q.trim()) {
      sug.style.display = "none";
      return;
    }
    const inv = DB.get("inventario").filter(
      (p) =>
        p.stock > 0 &&
        (p.nombre.toLowerCase().includes(q.toLowerCase()) ||
          (p.marca || "").toLowerCase().includes(q.toLowerCase()) ||
          (p.cat || "").toLowerCase().includes(q.toLowerCase())),
    );
    if (!inv.length) {
      sug.innerHTML =
        '<div class="search-sug-item" style="color:var(--text3)">Sin resultados con stock disponible</div>';
      sug.style.display = "block";
      return;
    }
    sug.innerHTML = inv
      .slice(0, 8)
      .map(
        (p) => `
      <div class="search-sug-item" onclick="selProd('${p.sku}')">
        <span>📦 ${p.nombre}${p.marca ? " (" + p.marca + ")" : ""} <span style="color:var(--text3);font-size:10px">[${p.sku}]</span></span>
        <span style="display:flex;gap:10px;align-items:center">
          <span class="tag ${p.stock <= p.min ? "to" : "tg"}" style="font-size:10px">Stock: ${p.stock}</span>
          <span style="color:var(--green);font-family:var(--fh)">${mxn(p.precio)}</span>
        </span>
      </div>
    `,
      )
      .join("");
    sug.style.display = "block";
  }, 200);
}
function selProd(sku) {
  const p = DB.get("inventario").find((x) => x.sku === sku);
  if (!p) return;
  LV.push({
    tipo: "producto",
    sku: p.sku,
    desc: p.nombre + (p.marca ? " " + p.marca : ""),
    precio: p.precio,
    qty: 1,
  });
  renderLV();
  document.getElementById("prod-search-input").value = "";
  document.getElementById("prod-suggestions").style.display = "none";
  document.getElementById("prod-search-wrap").style.display = "none";
}
document.addEventListener("click", (e) => {
  if (!e.target.closest("#prod-search-wrap"))
    document.getElementById("prod-suggestions").style.display = "none";
});

function addLVS() {
  const cat = DB.get("cat");
  // Build and show service dropdown selector
  const existing = document.getElementById("svc-select-wrap");
  if (existing) {
    existing.remove();
    return;
  }
  const wrap = document.createElement("div");
  wrap.id = "svc-select-wrap";
  wrap.style.cssText =
    "margin-bottom:8px;display:flex;gap:8px;align-items:center";
  const sel = document.createElement("select");
  sel.style.cssText = "flex:1;font-size:12px";
  sel.innerHTML =
    '<option value="">-- Seleccionar servicio --</option>' +
    cat
      .map(
        (s, i) =>
          `<option value="${i}">${s.nombre}${s.precio > 0 ? " — $" + s.precio.toFixed(2) : " — Gratis"}</option>`,
      )
      .join("");
  const btn = document.createElement("button");
  btn.className = "btn bp bsm";
  btn.textContent = "Agregar";
  btn.onclick = () => {
    const idx = parseInt(sel.value);
    if (isNaN(idx) || idx < 0) return;
    const sv = cat[idx];
    LV.push({ tipo: "servicio", desc: sv.nombre, precio: sv.precio, qty: 1 });
    renderLV();
    wrap.remove();
  };
  const btnX = document.createElement("button");
  btnX.className = "btn bg bsm";
  btnX.textContent = "✕";
  btnX.onclick = () => wrap.remove();
  wrap.appendChild(sel);
  wrap.appendChild(btn);
  wrap.appendChild(btnX);
  document.getElementById("lv-cont").before(wrap);
  sel.focus();
}

window.LV = LV;

window.initLV = initLV;
window.renderLV = renderLV;
window.onLVqty = onLVqty;
window.onLVprice = onLVprice;
window.delLV = delLV;
window.recalcVta = recalcVta;

window.addLVP = addLVP;
window.buscarProducto = buscarProducto;
window.selProd = selProd;
window.addLVS = addLVS;
