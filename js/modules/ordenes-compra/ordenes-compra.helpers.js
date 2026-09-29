// ============================================================
// ORDENES DE COMPRA HELPERS
// ============================================================
function addLineaOC(linea) {
  const idx = OC_LINEAS.length;
  OC_LINEAS.push(
    linea || {
      desc: "",
      sku: "",
      qty: 1,
      precio: 0,
      iva: "16",
      cond: "Nuevo",
      cat: "Refacción",
      unidad: "pza",
      min: 1,
    },
  );
  renderLineasOC();
}

function renderLineasOC() {
  const cont = document.getElementById("oc-lineas");
  cont.innerHTML = OC_LINEAS.map(
    (l, i) => `
    <div style="background:var(--bg3);border-radius:8px;padding:16px;padding-top:22px;margin-bottom:12px;position:relative">
      <button
onclick="delLineaOC(${i})"
style="
position:absolute;
top:14px;
right:14px;
width:20px;
height:20px;
display:flex;
align-items:center;
justify-content:center;
background:var(--red);
color:#fff;
border:none;
border-radius:6px;
cursor:pointer;
font-size:13px;
font-weight:700;
padding:0;
line-height:1;
transition:.2s;
">
✕
</button>
      <div class="fr c2" style="margin-bottom:8px">
        <div class="fi">

        <label class="fl" style="font-size:10px">

            Descripción *

        </label>

        <div style="position:relative;">

            <input

                id="oc-desc-${i}"

                type="text"

                value="${l.desc}"

                placeholder="Buscar producto del proveedor..."

                autocomplete="off"

                oninput="
                    updLineaOC(${i},'desc',this.value);
                    ocBuscarProducto(${i},this.value);
                "

                onfocus="
                    ocBuscarProducto(${i},this.value);
                "

            >

            <div

                id="oc-desc-resultados-${i}"

                style="
                    display:none;
                    position:absolute;
                    top:100%;
                    left:0;
                    right:0;
                    margin-top:3px;
                    background:#10213A;
                    border:1px solid rgba(14,165,233,.25);
                    border-radius:8px;
                    max-height:220px;
                    overflow-y:auto;
                    z-index:1000;
                    box-shadow:0 10px 25px rgba(0,0,0,.35);
                ">

            </div>

        </div>

    </div>
        <div class="fi"><label class="fl" style="font-size:10px">Marca</label><input type="text" value="${l.marca || ""}" onchange="updLineaOC(${i},'marca',this.value)" placeholder="Ej: Apple, Samsung"></div>
      </div>
      <div class="fr c2" style="margin-bottom:8px">
        <div class="fi"><label class="fl" style="font-size:10px">SKU (opcional)</label><input type="text" value="${l.sku || ""}" onchange="updLineaOC(${i},'sku',this.value)" placeholder="Opcional"></div>
        <div class="fi"><label class="fl" style="font-size:10px">Notas</label><input type="text" value="${l.notas || ""}" onchange="updLineaOC(${i},'notas',this.value)" placeholder="Observaciones del producto"></div>
      </div>
      <div style="display:grid;grid-template-columns:80px 120px 90px 130px 120px 90px minmax(80px,1fr) minmax(100px,1fr);gap:10px;align-items:end">
        <div class="fi"><label class="fl" style="font-size:10px">Cant.</label><input type="number" min="1" value="${l.qty}" onchange="updLineaOC(${i},'qty',this.value);calcTotOC()" style="text-align:right"></div>
        <div class="fi"><label class="fl" style="font-size:10px">Precio unit.</label><input type="number" min="0" step="0.01" value="${l.precio}" onchange="updLineaOC(${i},'precio',this.value);calcTotOC()" style="text-align:right"></div>
        <div class="fi"><label class="fl" style="font-size:10px">IVA</label>
          <select onchange="updLineaOC(${i},'iva',this.value);calcTotOC()">
            <option value="16" ${l.iva === "16" ? "selected" : ""}>16%</option>
            <option value="8" ${l.iva === "8" ? "selected" : ""}>8%</option>
            <option value="0" ${l.iva === "0" ? "selected" : ""}>0%</option>
            <option value="exento" ${l.iva === "exento" ? "selected" : ""}>Exento</option>
          </select>
        </div>
        <div class="fi"><label class="fl" style="font-size:10px">Condición</label>
          <select onchange="updLineaOC(${i},'cond',this.value)">
            <option ${l.cond === "Nuevo" ? "selected" : ""}>Nuevo</option>
            <option ${l.cond === "Usado" ? "selected" : ""}>Usado</option>
            <option ${l.cond === "Reacondicionado" ? "selected" : ""}>Reacondicionado</option>
          </select>
        </div>
        <div class="fi"><label class="fl" style="font-size:10px">Categoría</label>
          <select onchange="updLineaOC(${i},'cat',this.value)">
            <option ${l.cat === "Refacción" ? "selected" : ""}>Refacción</option>
            <option ${l.cat === "Accesorio" ? "selected" : ""}>Accesorio</option>
            <option ${l.cat === "Software" ? "selected" : ""}>Software</option>
            <option ${l.cat === "Herramienta" ? "selected" : ""}>Herramienta</option>
            <option ${l.cat === "Consumible" ? "selected" : ""}>Consumible</option>
            <option ${l.cat === "Laptop" ? "selected" : ""}>Laptop</option>
            <option ${l.cat === "PC" ? "selected" : ""}>PC</option>
            <option ${l.cat === "Impresora" ? "selected" : ""}>Impresora</option>
          </select>
        </div>
        <div class="fi"><label class="fl" style="font-size:10px">Unidad</label>
          <select onchange="updLineaOC(${i},'unidad',this.value)">
            <option ${l.unidad === "pza" ? "selected" : ""}>pza</option>
            <option ${l.unidad === "par" ? "selected" : ""}>par</option>
            <option ${l.unidad === "kit" ? "selected" : ""}>kit</option>
            <option ${l.unidad === "litro" ? "selected" : ""}>litro</option>
            <option ${l.unidad === "gramos" ? "selected" : ""}>gramos</option>
          </select>
        </div>
        <div class="fi"><label class="fl" style="font-size:10px">Stock mín.</label><input type="number" min="0" value="${l.min || 1}" onchange="updLineaOC(${i},'min',this.value)" style="text-align:right"></div>
        <div class="fi"><label class="fl" style="font-size:10px">Garantía (días)</label><input type="number" min="0" value="${l.garantia_dias || 0}" onchange="updLineaOC(${i},'garantia_dias',this.value)" style="text-align:right"></div>
      </div>
    </div>`,
  ).join("");
  calcTotOC();
}

// ============================================================
// BUSCAR PRODUCTO PARA ORDEN DE COMPRA
// ============================================================

function ocBuscarProducto(indice, texto = "") {
  const lista = document.getElementById(`oc-desc-resultados-${indice}`);

  if (!lista) return;

  const proveedorId = document.getElementById("oc-prov").value;

  // Si aún no hay proveedor seleccionado, no buscar
  if (!proveedorId) {
    lista.innerHTML = `
        <div style="
            padding:12px;
            color:var(--text2);
            font-size:12px;
            text-align:center;
        ">
            Selecciona primero un proveedor.
        </div>
    `;

    lista.style.display = "block";

    return;
  }

  const q = ARATECH.Validator.normalizeText(texto);

  const productos = DB.get("inventario")

    .filter(
      (p) =>
        (p.proveedorId === proveedorId ||
          p.proveedor ===
            document.getElementById("oc-prov").selectedOptions[0]?.text ||
          p.proveedorNombre ===
            document.getElementById("oc-prov").selectedOptions[0]?.text) &&
        (ARATECH.Validator.normalizeText(p.nombre || "").includes(q) ||
          ARATECH.Validator.normalizeText(p.sku || "").includes(q) ||
          ARATECH.Validator.normalizeText(p.marca || "").includes(q)),
    )

    .slice(0, 10);

  if (!productos.length) {
    lista.innerHTML = "";

    lista.style.display = "none";

    return;
  }

  lista.innerHTML = productos
    .map(
      (p) => `

      <div

    onclick="ocSeleccionarProducto(${indice},'${p.sku}')"

    style="
        padding:10px 12px;
        cursor:pointer;
        border-bottom:1px solid rgba(255,255,255,.05);
    "

        onmouseenter="this.style.background='rgba(14,165,233,.15)'"

        onmouseleave="this.style.background='transparent'"

      >

        <div style="color:#fff;font-weight:600;">

            ${p.nombre}

        </div>

        <div style="color:#7dd3fc;font-size:11px;">

            ${p.sku || "Sin SKU"}

            ${p.marca ? " • " + p.marca : ""}

        </div>

      </div>

  `,
    )
    .join("");

  lista.style.display = "block";
}

// ============================================================
// SELECCIONAR PRODUCTO PARA ORDEN DE COMPRA
// ============================================================

function ocSeleccionarProducto(indice, sku) {
  const producto = DB.get("inventario").find((p) => p.sku === sku);

  if (!producto) return;

  OC_LINEAS[indice].desc = producto.nombre || "";

  OC_LINEAS[indice].sku = producto.sku || "";

  OC_LINEAS[indice].marca = producto.marca || "";

  OC_LINEAS[indice].cat = producto.cat || "Refacción";

  OC_LINEAS[indice].cond = producto.cond || "Nuevo";

  OC_LINEAS[indice].unidad = producto.unidad || "pza";

  OC_LINEAS[indice].min = producto.min || 1;

  OC_LINEAS[indice].garantia_dias = producto.garantia_dias || 0;

  OC_LINEAS[indice].precio = producto.costo || 0;

  document.getElementById(`oc-desc-${indice}`).value = "";

  const lista = document.getElementById(`oc-desc-resultados-${indice}`);

  if (lista) {
    lista.innerHTML = "";

    lista.style.display = "none";
  }

  renderLineasOC();
}

function updLineaOC(i, campo, val) {
  OC_LINEAS[i][campo] = val;
}
function delLineaOC(i) {
  OC_LINEAS.splice(i, 1);
  renderLineasOC();
}

function calcTotOC() {
  let sub = 0,
    iva = 0;
  OC_LINEAS.forEach((l) => {
    const q = parseFloat(l.qty) || 0;
    const p = parseFloat(l.precio) || 0;
    const s = q * p;
    sub += s;
    if (l.iva !== "exento") iva += (s * (parseFloat(l.iva) || 0)) / 100;
  });
  document.getElementById("oc-subtotal").textContent = mxn(sub);
  document.getElementById("oc-iva-total").textContent = mxn(iva);
  document.getElementById("oc-total").textContent = mxn(sub + iva);
}

async function autoFillOCProv() {
  const proveedorId = document.getElementById("oc-prov").value;

  if (!proveedorId) return;

  if (OC_LINEAS.length && OC_LINEAS.some((l) => l.desc)) {
    const ok = await ARABOT.confirm({
      title: "Cambiar proveedor",

      message: "Ya existen productos capturados.",

      details:
        "Si cambias de proveedor se eliminarán los productos actuales de esta orden.",
    });

    if (!ok) {
      document.getElementById("oc-prov").value = OC_PROVEEDOR_ACTUAL || "";

      return;
    }

    OC_LINEAS = [];

    addLineaOC();
  }

  OC_PROVEEDOR_ACTUAL = proveedorId;
}

// ============================================================
// Cerrar buscadores de Orden de Compra
// ============================================================

document.addEventListener("click", (e) => {
  if (e.target.closest("[id^='oc-desc-']")) return;

  document.querySelectorAll("[id^='oc-desc-resultados-']").forEach((lista) => {
    lista.style.display = "none";
  });
});

window.addLineaOC = addLineaOC;
window.renderLineasOC = renderLineasOC;
window.updLineaOC = updLineaOC;
window.delLineaOC = delLineaOC;
window.calcTotOC = calcTotOC;
window.autoFillOCProv = autoFillOCProv;
