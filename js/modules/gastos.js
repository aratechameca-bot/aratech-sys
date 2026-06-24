// ============================================================
// GASTOS — Variables y funciones
// ============================================================

const GAS_SUBCATS = {
  Servicios: ["Luz", "Agua", "Internet", "Teléfono", "Gas", "Otro"],
  "Suscripciones digitales": [
    "ChatGPT / OpenAI",
    "Claude / Anthropic",
    "Canva",
    "Adobe",
    "Google Workspace",
    "Microsoft 365",
    "Netlify",
    "Otro",
  ],
  "Gastos varios": ["Otro"],
};

function rndGastos() {
  // Llenar filtro de meses
  const gastos = DB.get("gastos");
  const meses = [
    ...new Set(
      gastos
        .map((g) => (g.fecha ? g.fecha.substring(0, 7) : ""))
        .filter(Boolean),
    ),
  ]
    .sort()
    .reverse();
  const mesSel = document.getElementById("flt-mes-gasto");
  if (mesSel) {
    const cur = mesSel.value;
    mesSel.innerHTML = '<option value="">— Todos los meses —</option>';
    meses.forEach((m) => {
      const [y, mo] = m.split("-");
      const label = new Date(y, mo - 1).toLocaleDateString("es-MX", {
        month: "long",
        year: "numeric",
      });
      mesSel.innerHTML += `<option value="${m}" ${cur === m ? "selected" : ""}>${label}</option>`;
    });
  }
  filtGastos();
  gasResumen();
}

function gasResumen() {
  const gastos = DB.get("gastos");
  const mesActual = new Date().toISOString().substring(0, 7);
  const delMes = gastos.filter((g) => g.fecha && g.fecha.startsWith(mesActual));
  const totalMes = delMes.reduce((a, g) => a + (parseFloat(g.monto) || 0), 0);

  // Por categoría este mes
  const pCat = {};
  delMes.forEach((g) => {
    pCat[g.categoria] = (pCat[g.categoria] || 0) + (parseFloat(g.monto) || 0);
  });
  const topCat = Object.entries(pCat)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const el = document.getElementById("gastos-resumen");
  if (!el) return;
  el.innerHTML = `
    <div class="card card-sm">
      <div class="kl">Gastos del mes</div>
      <div style="font-size:22px;font-weight:800;color:var(--red);font-family:var(--fh)">${mxn(totalMes)}</div>
      <div style="font-size:10px;color:var(--text3);margin-top:2px">${delMes.length} registros</div>
    </div>
    ${topCat
      .map(
        ([cat, tot]) => `
    <div class="card card-sm">
      <div class="kl">${cat}</div>
      <div style="font-size:16px;font-weight:700;color:var(--orange);font-family:var(--fh)">${mxn(tot)}</div>
      <div style="font-size:10px;color:var(--text3);margin-top:2px">${Math.round((tot / totalMes) * 100) || 0}% del total</div>
    </div>`,
      )
      .join("")}`;
}

function filtGastos() {
  const q = (document.getElementById("sch-gasto")?.value || "").toLowerCase();
  const cat = document.getElementById("flt-cat-gasto")?.value || "";
  const mes = document.getElementById("flt-mes-gasto")?.value || "";
  const data = DB.get("gastos").filter(
    (g) =>
      (!q ||
        (g.descripcion || "").toLowerCase().includes(q) ||
        (g.categoria || "").toLowerCase().includes(q)) &&
      (!cat || g.categoria === cat) &&
      (!mes || (g.fecha || "").startsWith(mes)),
  );
  rndGastosTabla(data);
}

function rndGastosTabla(lista) {
  const tb = document.getElementById("tb-gastos");
  if (!tb) return;
  const data = lista || DB.get("gastos");
  if (!data.length) {
    tb.innerHTML =
      '<tr><td colspan="8" class="nd">Sin gastos registrados</td></tr>';
    return;
  }
  const metColor = {
    Efectivo: "var(--green)",
    Transferencia: "var(--accent)",
    Tarjeta: "var(--purple)",
  };
  tb.innerHTML = data
    .slice()
    .reverse()
    .map(
      (g) => `
    <tr>
      <td style="font-size:11px;color:var(--text2)">${fmt(g.fecha)}</td>
      <td><span class="tag tb" style="font-size:10px">${g.categoria}</span>${g.subcategoria ? `<br><span style="font-size:10px;color:var(--text3)">${g.subcategoria}</span>` : ""}</td>
      <td style="font-size:12px">${g.descripcion || "—"}</td>
      <td style="color:var(--red);font-weight:700;font-family:var(--fh)">${mxn(g.monto)}</td>
      <td><span style="font-size:11px;color:${metColor[g.metodo] || "var(--text2)"}">${g.metodo || "—"}</span></td>
      <td style="font-size:11px;color:var(--text3)">${g.registrado_por || "—"}</td>
      <td style="font-size:11px">
        ${
          g.comprobante_url
            ? `<a href="${g.comprobante_url}" target="_blank" style="color:var(--accent);text-decoration:none">📎 Ver</a>`
            : g.referencia
              ? `<span style="color:var(--text3)">${g.referencia}</span>`
              : "—"
        }
      </td>
      <td>
        <button onclick="editGasto('${g.id}')" style="background:none;border:none;color:var(--accent);cursor:pointer;font-size:13px" title="Editar">✏️</button>
        <button onclick="delGasto('${g.id}')" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:13px" title="Eliminar">🗑️</button>
      </td>
    </tr>`,
    )
    .join("");
}

function gasCatChange() {
  const cat = document.getElementById("gasto-cat").value;
  const wrap = document.getElementById("gasto-subcat-wrap");
  const subSel = document.getElementById("gasto-subcat");
  const label = document.getElementById("gasto-subcat-label");
  const otroWrap = document.getElementById("gasto-otro-wrap");

  if (GAS_SUBCATS[cat]) {
    wrap.style.display = "";
    label.textContent =
      cat === "Servicios" ? "Tipo de servicio" : "Subcategoría";
    subSel.innerHTML = GAS_SUBCATS[cat]
      .map((s) => `<option value="${s}">${s}</option>`)
      .join("");
    gasSubcatChange();
  } else {
    wrap.style.display = "none";
    otroWrap.style.display = "none";
  }
}

function gasSubcatChange() {
  const sub = document.getElementById("gasto-subcat").value;
  const otroWrap = document.getElementById("gasto-otro-wrap");
  otroWrap.style.display = sub === "Otro" ? "" : "none";
}

function gasPreviewFoto(input) {
  const file = input.files[0];
  if (!file) return;
  document.getElementById("gasto-foto-nombre").textContent = file.name;
  if (file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById("gasto-foto-img").src = e.target.result;
      document.getElementById("gasto-foto-preview").style.display = "";
    };
    reader.readAsDataURL(file);
  } else {
    document.getElementById("gasto-foto-preview").style.display = "none";
    document.getElementById("gasto-foto-nombre").textContent =
      "📄 " + file.name;
  }
}

async function subirComprobanteGasto(gastoId) {
  const input = document.getElementById("gasto-foto-input");
  if (!input.files.length) return null;
  const file = input.files[0];
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === "TU_URL_AQUI") return null;
  try {
    let base64;
    if (file.type.startsWith("image/")) {
      const dataUrl = await new Promise((res) => {
        const r = new FileReader();
        r.onload = (e) => res(e.target.result);
        r.readAsDataURL(file);
      });
      const compressed = await comprimirImagen(dataUrl, 0.75);
      base64 = compressed.split(",")[1];
    } else {
      base64 = await new Promise((res) => {
        const r = new FileReader();
        r.onload = (e) => res(e.target.result.split(",")[1]);
        r.readAsDataURL(file);
      });
    }
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "subirFoto",
        collection: "GASTO_" + gastoId,
        payload: {
          nombre: file.name,
          base64,
          mimeType: file.type || "image/jpeg",
        },
      }),
      redirect: "follow",
    });
    const data = await res.json();
    return data.url || null;
  } catch (e) {
    return null;
  }
}

async function saveGasto() {
  const cat = document.getElementById("gasto-cat")?.value || "";
  const monto = parseFloat(document.getElementById("gasto-monto").value) || 0;
  if (!cat) {
    notify("❌ Selecciona una categoría");
    return;
  }
  if (!monto) {
    notify("❌ Ingresa el monto");
    return;
  }

  const subcat = document.getElementById("gasto-subcat")?.value || "";
  const otro = document.getElementById("gasto-otro")?.value?.trim() || "";
  const subcatFinal = subcat === "Otro" ? otro || "Otro" : subcat;

  const eid = document.getElementById("gasto-eid").value;
  const id = eid || (await API.getFolio("ARGAS"));
  const fecha = document.getElementById("gasto-fecha").value || hoy();

  notify("💾 Guardando gasto…");

  // Subir comprobante si hay archivo
  let comprobante_url = null;
  const fotoInput = document.getElementById("gasto-foto-input");
  if (fotoInput.files.length) {
    comprobante_url = await subirComprobanteGasto(id);
  }

  const gasto = {
    id,
    fecha,
    categoria: cat,
    subcategoria: subcatFinal,
    descripcion: document.getElementById("gasto-desc").value.trim(),
    monto,
    metodo: document.getElementById("gasto-metodo").value,
    referencia: document.getElementById("gasto-ref").value.trim(),
    comprobante_url: comprobante_url || "",
    registrado_por: currentUser?.nombre || "—",
  };

  const gastos = DB.get("gastos");
  if (eid) {
    const idx = gastos.findIndex((g) => g.id === eid);
    if (idx >= 0) {
      gastos[idx] = { ...gastos[idx], ...gasto };
      DB.set("gastos", gastos);
      API.update("gastos", eid, gasto).catch(() => {});
    }
  } else {
    gastos.push(gasto);
    DB.set("gastos", gastos);
    API.call("insert", "gastos", gasto).catch(() => {});
  }

  notify("✅ Gasto guardado");
  closeM("m-gasto");
  rndGastos();
}

function editGasto(id) {
  const g = DB.get("gastos").find((x) => x.id === id);
  if (!g) return;
  document.getElementById("gasto-tit").textContent = "✏️ Editar gasto";
  document.getElementById("gasto-eid").value = id;
  document.getElementById("gasto-fecha").value = g.fecha || hoy();
  document.getElementById("gasto-cat").value = g.categoria || "";
  gasCatChange();
  if (g.subcategoria) {
    const sub = document.getElementById("gasto-subcat");
    if (sub) {
      // Intentar seleccionar la subcategoría
      const opt = Array.from(sub.options).find(
        (o) => o.value === g.subcategoria,
      );
      if (opt) {
        sub.value = g.subcategoria;
      } else {
        sub.value = "Otro";
        document.getElementById("gasto-otro").value = g.subcategoria;
      }
      gasSubcatChange();
    }
  }
  document.getElementById("gasto-desc").value = g.descripcion || "";
  document.getElementById("gasto-monto").value = g.monto || "";
  document.getElementById("gasto-metodo").value = g.metodo || "Efectivo";
  document.getElementById("gasto-ref").value = g.referencia || "";
  document.getElementById("gasto-foto-nombre").textContent = g.comprobante_url
    ? "📎 Comprobante existente"
    : "Sin archivo";
  document.getElementById("gasto-foto-preview").style.display = "none";
  openM("m-gasto");
}

function delGasto(id) {
  if (!confirm("¿Eliminar este gasto?")) return;
  const gastos = DB.get("gastos").filter((g) => g.id !== id);
  DB.set("gastos", gastos);
  API.call("delete", "gastos", null, id).catch(() => {});
  notify("✅ Gasto eliminado");
  rndGastos();
}

function abrirNuevoGasto() {
  document.getElementById("gasto-tit").textContent = "💸 Nuevo gasto";
  document.getElementById("gasto-eid").value = "";
  document.getElementById("gasto-fecha").value = hoy();
  document.getElementById("gasto-cat").value = "";
  document.getElementById("gasto-subcat-wrap").style.display = "none";
  document.getElementById("gasto-otro-wrap").style.display = "none";
  document.getElementById("gasto-desc").value = "";
  document.getElementById("gasto-monto").value = "";
  document.getElementById("gasto-metodo").value = "Efectivo";
  document.getElementById("gasto-ref").value = "";
  document.getElementById("gasto-foto-input").value = "";
  document.getElementById("gasto-foto-nombre").textContent = "Sin archivo";
  document.getElementById("gasto-foto-preview").style.display = "none";
  openM("m-gasto");
}

window.rndGastos = rndGastos;
window.gasResumen = gasResumen;
window.filtGastos = filtGastos;
window.rndGastosTabla = rndGastosTabla;

window.gasCatChange = gasCatChange;
window.gasSubcatChange = gasSubcatChange;

window.gasPreviewFoto = gasPreviewFoto;
window.subirComprobanteGasto = subirComprobanteGasto;

window.saveGasto = saveGasto;
window.editGasto = editGasto;
window.delGasto = delGasto;

window.abrirNuevoGasto = abrirNuevoGasto;
