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
  const esAdmin = window.currentUser?.rol === "admin";
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
            ? `<a href="${g.comprobante_url}" target="_blank" style="color:var(--accent);text-decoration:none"><i class="ar-icon clip"></i> Ver</a>`
            : g.referencia
              ? `<span style="color:var(--text3)">${g.referencia}</span>`
              : "—"
        }
      </td>
      <td class="bg-btn">

    <div class="bg-btn-wrap">

        <button
            class="btn bg bsm btn-acciones"
            data-id="${g.id}"
            onclick="toggleAcciones(this)"
            title="Acciones">
            <i class="ar-icon menu"></i>
        </button>

    </div>

    <div class="acciones-card">

        <button
            class="btn bg bsm"
            onclick="editGasto('${g.id}')"
            title="Editar gasto">
            <i class="ar-icon edit"></i> Editar gasto
        </button>

    </div>

</td>
    </tr>`,
    )
    .join("");
  window.refreshIcons(tb);
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
  const files = Array.from(input.files);

  const nombre = document.getElementById("gasto-foto-nombre");

  const preview = document.getElementById("gasto-foto-preview");

  const lista = document.getElementById("gasto-foto-lista");

  if (!files.length) {
    nombre.textContent = "Sin archivos";

    preview.style.display = "none";

    lista.innerHTML = "";

    return;
  }

  if (files.length > 5) {
    notify("❌ Máximo 5 archivos por gasto");

    input.value = "";

    return;
  }

  nombre.textContent = files.length + " archivo(s) seleccionado(s)";

  lista.innerHTML = "";

  preview.style.display = "";

  files.forEach((file) => {
    const item = document.createElement("div");

    item.style.cssText = `
      width:100px;
      font-size:10px;
      color:var(--text3);
      text-align:center;
    `;

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();

      reader.onload = (e) => {
        item.innerHTML = `

          <img
            src="${e.target.result}"
            style="
              width:80px;
              height:80px;
              object-fit:cover;
              border-radius:6px;
              border:1px solid var(--border);
            "
          >

          <div>
            ${file.name.substring(0, 15)}
          </div>

        `;
      };

      reader.readAsDataURL(file);
    } else {
      item.innerHTML = `

        <div style="
          font-size:30px;
        ">
          <i class="ar-icon archivo"></i>
        </div>

        <div>
          ${file.name.substring(0, 15)}
        </div>

      `;

      window.refreshIcons(item);
    }

    lista.appendChild(item);
  });
}

async function subirComprobantesGasto(gastoId) {
  const input = document.getElementById("gasto-foto-input");

  if (!input.files.length) return [];

  const files = Array.from(input.files);

  if (files.length > 5) {
    notify("❌ Máximo 5 archivos por gasto");

    return [];
  }

  const archivos = [];

  for (const file of files) {
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

      const data = await FB.callFunction("subirGastoFile", {
        gasto_id: gastoId,

        nombre: file.name,

        base64,

        mimeType: file.type || "application/octet-stream",

        usuario: currentUser?.nombre || "",
      });

      if (data?.ok) {
        archivos.push(data.url);
      }
    } catch (e) {
      console.error("Error subiendo comprobante:", e);
    }
  }

  return archivos;
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

  // Subir evidencias si hay archivos
  let comprobante_url = "";

  const fotoInput = document.getElementById("gasto-foto-input");

  if (fotoInput.files.length) {
    const evidencias = await subirComprobantesGasto(id);

    if (evidencias.length) {
      comprobante_url = evidencias[0];
    }
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
      await DATA.update("gastos", eid, gasto);
    }
  } else {
    gastos.push(gasto);

    DB.set("gastos", gastos);

    await DATA.save("gastos", gasto.id, gasto);

    try {
      await FINANZAS.registrarMovimiento({
        tipo: "EGRESO",

        modulo: "GASTOS",

        origen: gasto.id,

        monto: -Math.abs(gasto.monto),

        metodo: gasto.metodo,

        categoria: gasto.categoria,

        descripcion: gasto.descripcion,

        referencia: gasto.referencia,

        usuario: gasto.registrado_por,

        fecha: gasto.fecha,
      });
    } catch (error) {
      console.error("Error al registrar movimiento financiero:", error);

      notify(
        "⚠️ El gasto fue guardado correctamente, pero no pudo registrarse el movimiento financiero.",
      );
    }
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

async function delGasto(id) {
  if (window.currentUser?.rol !== "admin") {
    notify("Permisos insuficientes");

    return;
  }

  const ok = await ARABOT.confirm({
    title: "Eliminar gasto",

    message: "¿Deseas eliminar este gasto?",

    details:
      "El gasto será eliminado permanentemente y esta acción no podrá deshacerse.",
  });

  if (!ok) return;

  await DATA.delete("gastos", id);

  const gastos = DB.get("gastos").filter((g) => g.id !== id);

  DB.set("gastos", gastos);

  notify("✅ Gasto eliminado");

  rndGastos();
}

function abrirNuevoGasto() {
  document.getElementById("gasto-tit").innerHTML =
    '<i class="ar-icon dinero"></i> Nuevo gasto';

  window.refreshIcons(document.getElementById("gasto-tit"));
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
window.subirComprobantesGasto = subirComprobantesGasto;

window.saveGasto = saveGasto;
window.editGasto = editGasto;
window.delGasto = delGasto;

window.abrirNuevoGasto = abrirNuevoGasto;
