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

/* ==========================================================
   LIMPIAR FORMULARIO
========================================================== */

function resetProdForm() {
  document.getElementById("pr-nm").value = "";
  document.getElementById("pr-mk").value = "";
  document.getElementById("pr-cat").selectedIndex = 0;

  document.getElementById("pr-cond").value = "Nuevo";
  document.getElementById("pr-ubi").value = "Taller";

  document.getElementById("pr-stk").value = 0;
  document.getElementById("pr-min").value = 3;

  document.getElementById("pr-uni").value = "pza";

  document.getElementById("pr-co").value = "";
  document.getElementById("pr-pr").value = "";
  document.getElementById("pr-ut").value = "";

  autoGarProd();

  document.getElementById("pr-pv").value = "";
  document.getElementById("pr-nt").value = "";

  const btn = document.querySelector(
    '#m-prod button[onclick^="updateProd"], #m-prod button[onclick="saveProd()"]',
  );

  if (btn) {
    btn.setAttribute("onclick", "saveProd()");
  }
}

function normalizarTexto(texto) {
  return String(texto || "")
    .trim()
    .replace(/\s+/g, " ");
}

async function saveProd() {
  const nm = normalizarTexto(document.getElementById("pr-nm").value);

  if (!nm) {
    ARABOT.alert({
      title: "Descripción requerida",

      message: "Ingresa la descripción del producto.",

      details: "Este campo es obligatorio para registrar un producto.",
    });

    return;
  }

  if (nm.length > 150) {
    ARABOT.alert({
      title: "Descripción demasiado larga",

      message: "La descripción no puede exceder 150 caracteres.",

      details: "Reduce el texto antes de guardar.",
    });

    return;
  }

  ARABOT.loading({
    title: "Registrando producto",

    details: "Estamos guardando el producto en el inventario.",
  });

  const prods = DB.get("inventario");

  const existe = prods.find(
    (p) => String(p.nombre).trim().toLowerCase() === nm.toLowerCase(),
  );

  if (existe) {
    ARABOT.alert({
      title: "Producto duplicado",

      message: "Ya existe un producto con esa descripción.",

      details:
        "Si se trata del mismo artículo, edítalo en lugar de crear uno nuevo.",
    });

    return;
  }

  const sku = await API.getFolio("SKU");

  const co = parseFloat(document.getElementById("pr-co").value) || 0;

  const pr = parseFloat(document.getElementById("pr-pr").value) || 0;

  const cond = document.getElementById("pr-cond").value;

  if (co < 0 || pr < 0) {
    ARABOT.alert({
      title: "Valores inválidos",

      message: "Costo y precio no pueden ser negativos.",

      details: "Verifica los importes capturados.",
    });

    return;
  }

  const stock = parseInt(document.getElementById("pr-stk").value) || 0;

  const minimo = parseInt(document.getElementById("pr-min").value) || 3;

  const garantia = parseInt(document.getElementById("pr-gd").value) || 0;

  if (minimo > stock) {
    const ok = await ARABOT.confirm({
      title: "Stock mínimo mayor al actual",

      message: "El stock mínimo es mayor que el stock disponible.",

      details:
        "Esto provocará que el producto aparezca inmediatamente como stock bajo. ¿Deseas continuar?",
    });

    if (!ok) return;
  }

  if (stock < 0 || minimo < 0 || garantia < 0) {
    ARABOT.alert({
      title: "Valores inválidos",

      message: "Stock, mínimo y garantía no pueden ser negativos.",

      details: "Corrige los valores antes de guardar.",
    });

    return;
  }

  if (pr < co) {
    const ok = await ARABOT.confirm({
      title: "Precio menor al costo",

      message: "El producto se venderá con pérdida.",

      details:
        "El precio de venta es menor al costo y generará una pérdida. ¿Deseas guardar el producto de todas formas?",
    });

    if (!ok) return;
  }

  /*  if (co !== Number(inv[i].costo || 0)) {
    const ok = await ARABOT.confirm({
      title: "Cambio de costo",

      message: "El costo del producto fue modificado.",

      details:
        "Este cambio puede afectar reportes financieros, utilidades y futuras compras. ¿Deseas continuar?",
    });

    if (!ok) return;
  }

  if (pr !== Number(inv[i].precio || 0)) {
    const ok = await ARABOT.confirm({
      title: "Cambio de precio",

      message: "El precio de venta fue modificado.",

      details:
        "Este cambio afectará las próximas ventas, cotizaciones y reportes de utilidad. ¿Deseas continuar?",
    });

    if (!ok) return;
  }  */

  const marca = normalizarTexto(document.getElementById("pr-mk").value);

  const proveedor = normalizarTexto(document.getElementById("pr-pv").value);

  const notas = normalizarTexto(document.getElementById("pr-nt").value);

  if (marca.length > 80 || proveedor.length > 120 || notas.length > 500) {
    ARABOT.alert({
      title: "Texto demasiado largo",

      message: "Uno o más campos exceden la longitud permitida.",

      details: "Marca: 80 caracteres. Proveedor: 120. Notas: 500.",
    });

    return;
  }

  const newProd = {
    id: sku,

    sku,

    nombre: nm,

    marca: marca,

    cat: document.getElementById("pr-cat").value,

    cond,

    ubicacion: document.getElementById("pr-ubi").value,

    stock: stock,

    min: minimo,

    unidad: document.getElementById("pr-uni").value,

    costo: co,

    precio: pr,

    valor_inventario: stock * co,

    valor_venta: stock * pr,

    utilidad_potencial: (pr - co) * stock,

    margen_porcentaje: co > 0 ? Number((((pr - co) / co) * 100).toFixed(2)) : 0,

    estado_inventario:
      stock <= 0 ? "AGOTADO" : stock <= minimo ? "STOCK_BAJO" : "DISPONIBLE",

    garantia_dias: garantia,

    proveedor: proveedor,

    notas: notas,

    fecha: hoy(),

    hora: new Date().toLocaleTimeString("es-MX"),

    fecha_actualizacion: hoy(),

    hora_actualizacion: new Date().toLocaleTimeString("es-MX"),

    usuario_creacion: currentUser?.nombre || "Sistema",

    usuario_actualizacion: currentUser?.nombre || "Sistema",
  };

  prods.push(newProd);

  DB.set("inventario", prods);

  await DATA.save("inventario", sku, newProd);

  resetProdForm();

  rndInv();

  // ==========================================
  // Si el modal fue abierto desde Cotizaciones
  // ==========================================

  if (window.cotEsperandoProducto) {
    window.cotEsperandoProducto = false;

    cotSeleccionarProducto(newProd.sku);
  }

  closeM("m-prod");

  ARABOT.success({
    title: "Producto registrado",

    message: "El producto fue agregado correctamente.",

    details: "El inventario fue actualizado y sincronizado correctamente.",
  });
}
function rndInv(lista) {
  const todos = DB.get("inventario");
  const data = lista || todos;

  const esAdmin = window.currentUser?.rol === "admin";

  const tb = document.getElementById("tb-inv");

  if (!tb) return;

  if (!data.length) {
    tb.innerHTML = '<tr><td colspan="13" class="nd">Sin productos</td></tr>';
  } else {
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

        return `
          <tr>

            <td style="font-size:10px;color:var(--text3)">
              ${p.sku}
            </td>

            <td>
              <b>${p.nombre}</b>
            </td>

            <td style="font-size:11px;color:var(--text2)">
              ${p.marca || "—"}
            </td>

            <td>
              <span class="tag tgr" style="font-size:10px">
                ${p.cat}
              </span>
            </td>

            <td>
              <span class="tag ${
                p.ubicacion === "Taller" ? "tb" : "tg"
              }" style="font-size:10px">
                ${p.ubicacion || "Bodega"}
              </span>
            </td>

            <td>
              <span class="tag ${cc}" style="font-size:10px">
                ${p.cond || "—"}
              </span>
            </td>

            <td style="${bajo ? "color:var(--orange)" : ""}">
              ${p.stock} ${p.unidad}
            </td>

            <td style="color:var(--text3)">
              ${p.min}
            </td>

            <td>
              ${mxn(p.costo)}
            </td>

            <td style="color:var(--green)">
              ${mxn(p.precio)}
            </td>

            <td style="color:${pct >= 25 ? "var(--green)" : "var(--red)"}">
              ${pct}%
            </td>

            <td>
              <span class="sm ${sc}"></span>
              <span class="tag ${tc}" style="font-size:10px">
                ${tt}
              </span>
            </td>

           <td class="bg-btn">

    <div class="bg-btn-wrap">

        <button
            class="btn bg bsm btn-acciones"
            data-id="${p.sku}"
            onclick="toggleAcciones(this)"
            title="Acciones">
            <i class="ar-icon menu"></i>
        </button>

    </div>

    <div class="acciones-card">

        <button
            class="btn bg bsm"
            onclick="editProd('${p.sku}')"
            title="Editar producto">
            <i class="ar-icon edit"></i> Editar producto
        </button>

    </div>

</td>

          </tr>
        `;
      })
      .join("");
    window.refreshIcons(tb);
  }

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
  const q = document.getElementById("sch-inv").value.trim().toLowerCase();

  const cat = document.getElementById("flt-cat").value;

  const cond = document.getElementById("flt-cond").value;

  const ubi = document.getElementById("flt-ubi").value;

  rndInv(
    DB.get("inventario").filter((p) => {
      const texto = [
        p.sku,
        p.nombre,
        p.marca,
        p.cat,
        p.cond,
        p.ubicacion || "Bodega",
        p.proveedor,
        p.notas,
        p.unidad,
        p.stock,
        p.min,
        p.costo,
        p.precio,
      ]
        .join(" ")
        .toLowerCase();

      return (
        texto.includes(q) &&
        (!cat || p.cat === cat) &&
        (!cond || p.cond === cond) &&
        (!ubi || (p.ubicacion || "Bodega") === ubi)
      );
    }),
  );
}
async function adjStk(sku) {
  // [FASE 4] Inventario de solo consulta para el técnico
  if (window.currentUser?.rol === "tecnico") {
    notify("El inventario es solo de consulta para tu rol");
    return;
  }

  const d = prompt("Cantidad a agregar (+) o retirar (-):");
  if (!d) return;
  const n = parseInt(d);
  if (isNaN(n)) return;
  if (n === 0) return;

  // [FASE 4] Ajuste mediante el motor: usa el stock real del servidor y deja
  // registro del movimiento. Antes se escribía el número calculado localmente.
  const resultado = await INVENTARIO_ENGINE.ajuste({
    productoId: sku,
    cantidad: n,
    modulo: "INVENTARIO",
    origen: "AJUSTE_MANUAL",
    observaciones: "Ajuste manual de stock",
  });

  if (!resultado.ok) {
    ARABOT.alert({
      title: "No se pudo ajustar el stock",

      message: resultado.error,

      details: "El inventario no se modificó.",
    });

    return;
  }

  rndInv();
}

function editProd(sku) {
  // [FASE 4] Inventario de solo consulta para el técnico
  if (window.currentUser?.rol === "tecnico") {
    notify("El inventario es solo de consulta para tu rol");
    return;
  }

  const inv = DB.get("inventario");
  const p = inv.find((x) => x.sku === sku);
  if (!p) return;
  document.getElementById("pr-nm").value = p.nombre || "";
  document.getElementById("pr-mk").value = p.marca || "";
  document.getElementById("pr-cat").value = p.cat || "";
  document.getElementById("pr-cond").value = p.cond || "Nuevo";
  document.getElementById("pr-ubi").value = p.ubicacion || "Taller";
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

  calcPU();

  openM("m-prod");
}

async function updateProd(sku) {
  const nm = normalizarTexto(document.getElementById("pr-nm").value);

  if (!nm) {
    ARABOT.alert({
      title: "Descripción requerida",

      message: "Ingresa la descripción del producto.",

      details: "Este campo es obligatorio para actualizar el producto.",
    });

    return;
  }

  const inv = DB.get("inventario");

  const i = inv.findIndex((p) => p.sku === sku);

  if (i < 0) return;

  const duplicado = inv.find(
    (p) =>
      p.sku !== sku &&
      String(p.nombre).trim().toLowerCase() === nm.toLowerCase(),
  );

  if (duplicado) {
    ARABOT.alert({
      title: "Producto duplicado",

      message: "Ya existe otro producto con esa descripción.",

      details: "No pueden existir dos productos con el mismo nombre.",
    });

    return;
  }

  const co = parseFloat(document.getElementById("pr-co").value) || 0;

  const pr = parseFloat(document.getElementById("pr-pr").value) || 0;

  const stock = parseInt(document.getElementById("pr-stk").value) || 0;

  const minimo = parseInt(document.getElementById("pr-min").value) || 3;

  const garantia = parseInt(document.getElementById("pr-gd").value) || 0;

  if (co < 0 || pr < 0) {
    ARABOT.alert({
      title: "Valores inválidos",

      message: "Costo y precio no pueden ser negativos.",

      details: "Verifica los importes capturados.",
    });

    return;
  }

  if (stock < 0 || minimo < 0 || garantia < 0) {
    ARABOT.alert({
      title: "Valores inválidos",

      message: "Stock, mínimo y garantía no pueden ser negativos.",

      details: "Corrige los valores antes de guardar.",
    });

    return;
  }

  if (pr < co) {
    const ok = await ARABOT.confirm({
      title: "Precio menor al costo",

      message: "El producto se venderá con pérdida.",

      details:
        "El precio de venta es menor al costo y generará una pérdida. ¿Deseas guardar el producto de todas formas?",
    });

    if (!ok) return;
  }

  if (minimo > stock) {
    const ok = await ARABOT.confirm({
      title: "Stock mínimo mayor al actual",

      message: "El stock mínimo es mayor que el stock disponible.",

      details:
        "El producto aparecerá en alerta de stock bajo. ¿Deseas continuar?",
    });

    if (!ok) return;
  }

  const marca = normalizarTexto(document.getElementById("pr-mk").value);

  const proveedor = normalizarTexto(document.getElementById("pr-pv").value);

  const notas = normalizarTexto(document.getElementById("pr-nt").value);

  if (marca.length > 80 || proveedor.length > 120 || notas.length > 500) {
    ARABOT.alert({
      title: "Texto demasiado largo",

      message: "Uno o más campos exceden la longitud permitida.",

      details: "Marca: 80 caracteres. Proveedor: 120. Notas: 500.",
    });

    return;
  }

  // [FASE 4] El stock ya no se sobrescribe directamente: si cambió, se aplica
  // la diferencia con el motor de inventario (stock real del servidor).
  const stockOriginal = Number(inv[i].stock || 0);

  inv[i].nombre = nm;

  inv[i].marca = marca;

  inv[i].cat = document.getElementById("pr-cat").value;

  inv[i].cond = document.getElementById("pr-cond").value;

  inv[i].ubicacion = document.getElementById("pr-ubi").value;

  inv[i].min = minimo;

  inv[i].unidad = document.getElementById("pr-uni").value;

  if (co !== Number(inv[i].costo || 0)) {
    inv[i].costo_anterior = Number(inv[i].costo || 0);
  }

  inv[i].costo = co;

  if (pr !== Number(inv[i].precio || 0)) {
    inv[i].precio_anterior = Number(inv[i].precio || 0);
  }

  inv[i].precio = pr;

  inv[i].valor_inventario = stockOriginal * co;

  inv[i].valor_venta = stockOriginal * pr;

  inv[i].utilidad_potencial = (pr - co) * stockOriginal;

  inv[i].margen_porcentaje =
    co > 0 ? Number((((pr - co) / co) * 100).toFixed(2)) : 0;

  inv[i].estado_inventario =
    stockOriginal <= 0
      ? "AGOTADO"
      : stockOriginal <= minimo
        ? "STOCK_BAJO"
        : "DISPONIBLE";

  inv[i].garantia_dias = garantia;

  inv[i].proveedor = proveedor;

  inv[i].notas = notas;

  inv[i].fecha_actualizacion = hoy();

  inv[i].hora_actualizacion = new Date().toLocaleTimeString("es-MX");

  inv[i].usuario_actualizacion = currentUser?.nombre || "Sistema";

  DB.set("inventario", inv);

  // [FASE 4] Se guardan los datos del producto SIN el campo stock
  const { stock: _stockLocal, ...datosSinStock } = inv[i];

  await DATA.update("inventario", inv[i].id, datosSinStock);

  if (stock !== stockOriginal) {
    const resultado = await INVENTARIO_ENGINE.ajuste({
      productoId: inv[i].id,
      cantidad: stock - stockOriginal,
      modulo: "INVENTARIO",
      origen: "EDICION_PRODUCTO",
      observaciones: `Ajuste desde edición de producto (${stockOriginal} → ${stock})`,
    });

    if (!resultado.ok) {
      ARABOT.alert({
        title: "Producto guardado, stock sin cambios",

        message: resultado.error,

        details:
          "Los datos del producto se guardaron, pero no fue posible ajustar el stock.",
      });
    }
  }

  resetProdForm();

  closeM("m-prod");

  rndInv();

  notify("Producto actualizado ✅");
}

async function delProd(sku) {
  if (window.currentUser?.rol !== "admin") {
    notify("Permisos insuficientes");

    return;
  }

  const ok = await ARABOT.confirm({
    title: "Eliminar producto",

    message: "¿Deseas eliminar este producto?",

    details: "Esta acción no podrá deshacerse.",
  });

  if (!ok) return;

  const inv = DB.get("inventario");

  const prod = inv.find((p) => p.sku === sku);

  if (!prod) {
    ARABOT.alert({
      title: "Producto no encontrado",

      message: "No fue posible localizar el producto.",

      details: "Es posible que ya haya sido eliminado o no exista.",
    });

    return;
  }

  // eliminar local
  DB.set(
    "inventario",

    inv.filter((p) => p.sku !== sku),
  );

  // eliminar en firestore
  await DATA.delete("inventario", prod.id);

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

window.resetProdForm = resetProdForm;
