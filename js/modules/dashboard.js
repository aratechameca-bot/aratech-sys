// DASHBOARD
function calcIngresosMes() {
  const mes = new Date().toISOString().slice(0, 7);
  const vtas = DB.get("ventas");
  const ords = DB.get("ordenes");
  // Ventas directas (sin orden) cuentan siempre
  const vtasDirectas = vtas
    .filter((v) => v.fecha && v.fecha.startsWith(mes) && !v.orden_rel)
    .reduce((a, v) => a + v.total, 0);
  // Ventas asociadas a orden + servicio de orden, solo cuando orden está Entregada
  const ordsEntregadas = ords.filter(
    (o) =>
      o.fecha_entrega &&
      o.fecha_entrega.startsWith(mes) &&
      ["Entregado", "Entregado (garantía)"].includes(o.estado),
  );
  const ingOrdenes = ordsEntregadas.reduce((a, o) => {
    const vtasOrd = (o.vtas_rel || []).reduce((s, vid) => {
      const v = vtas.find((x) => x.id === vid);
      return s + (v ? v.total : 0);
    }, 0);
    return a + o.total + vtasOrd;
  }, 0);
  return vtasDirectas + ingOrdenes;
}

function dash() {
  const mes = new Date().toISOString().slice(0, 7);
  const vtas = DB.get("ventas");
  const ords = DB.get("ordenes");
  const clis = DB.get("clientes");
  const ing = calcIngresosMes();
  const act = ords.filter(
    (o) =>
      ![
        "Entregado",
        "Entregado (garantía)",
        "Cancelado",
        "No reparado",
      ].includes(o.estado),
  ).length;
  const clm = clis.filter((c) => c.fecha && c.fecha.startsWith(mes)).length;
  document.getElementById("ki").textContent = mxn(ing);
  document.getElementById("koa").textContent = act;
  document.getElementById("kcm").textContent = clm;
  document.getElementById("ku").textContent = mxn(ing * 0.35);
  // Gastos del mes
  const gastos = DB.get("gastos");
  const gastosMes = gastos.filter((g) => g.fecha && g.fecha.startsWith(mes));
  const totGastos = gastosMes.reduce(
    (a, g) => a + (parseFloat(g.monto) || 0),
    0,
  );
  const kGastos = document.getElementById("k-gastos");
  const kGastosKs = document.getElementById("k-gastos-ks");
  if (kGastos) kGastos.textContent = mxn(totGastos);
  if (kGastosKs) kGastosKs.textContent = gastosMes.length + " registros";
  const rec = ords.slice(-5).reverse();
  const ec = {
    "Listo para entrega": "tg",
    Entregado: "tgr",
    "En proceso": "to",
    Recibido: "tb",
    "Esperando refacción": "ty",
  };
  document.getElementById("dash-ord").innerHTML = rec.length
    ? rec
        .map(
          (o) =>
            `<div style="display:flex;gap:8px;align-items:center;padding:7px 0;border-bottom:1px solid var(--border)"><span style="font-family:var(--fh);font-size:11px;color:var(--accent)">${o.folio}</span><span style="flex:1;font-size:12px">${o.cliente_nombre}</span><span class="tag ${ec[o.estado] || "tgr"}" style="font-size:10px">${o.estado}</span></div>`,
        )
        .join("")
    : '<div class="nd">Sin órdenes aún</div>';
  const alr = [];
  DB.get("inventario")
    .filter((p) => p.stock <= p.min)
    .forEach((p) =>
      alr.push({
        t: "o",
        m: "Stock bajo: " + p.nombre + " (" + p.stock + " " + p.unidad + ")",
      }),
    );
  const cf = DB.obj("config");
  const ad = parseInt(cf.cfg_ga || 7);
  DB.get("garantias")
    .filter((g) => g.fecha_gar)
    .forEach((g) => {
      const d = diasE(hoy(), g.fecha_gar);
      if (d >= 0 && d <= ad)
        alr.push({
          t: "o",
          m:
            "Garantía por vencer: " +
            g.folio +
            " — " +
            g.cliente_nombre +
            " (" +
            d +
            " días)",
        });
      if (d < 0)
        alr.push({
          t: "r",
          m: "Garantía vencida: " + g.folio + " — " + g.cliente_nombre,
        });
    });
  DB.get("segs")
    .filter((s) => !s.hecho && s.fecha && s.fecha <= hoy())
    .forEach((s) =>
      alr.push({
        t: "o",
        m: "Seguimiento: " + s.cliente_nombre + " — " + s.tipo,
      }),
    );
  document.getElementById("dash-alr").innerHTML = alr.length
    ? alr
        .slice(0, 5)
        .map(
          (a) =>
            `<div class="al al-${a.t === "r" ? "r" : "o"}">${a.t === "r" ? "🔴" : "🟡"} ${a.m}</div>`,
        )
        .join("")
    : '<div class="al al-g">✅ Sin alertas activas</div>';
  const alertBar = document.getElementById("alert-bar");

  if (alertBar) {
    alertBar.style.display = alr.length ? "" : "none";
  }
  // chart
  const hD = new Date();
  const ms = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hD.getFullYear(), hD.getMonth() - i, 1);
    const k = d.toISOString().slice(0, 7);
    const lb = d.toLocaleDateString("es-MX", { month: "short" });
    const vd = DB.get("ventas")
      .filter((v) => v.fecha && v.fecha.startsWith(k) && !v.orden_rel)
      .reduce((a, v) => a + v.total, 0);
    const od = DB.get("ordenes")
      .filter(
        (o) =>
          o.fecha_entrega &&
          o.fecha_entrega.startsWith(k) &&
          ["Entregado", "Entregado (garantía)"].includes(o.estado),
      )
      .reduce((a, o) => {
        const ve = (o.vtas_rel || []).reduce((s, vid) => {
          const v = DB.get("ventas").find((x) => x.id === vid);
          return s + (v ? v.total : 0);
        }, 0);
        return a + o.total + ve;
      }, 0);
    ms.push({ lb, t: vd + od });
  }
  const mx = Math.max(...ms.map((m) => m.t), 1);
  document.getElementById("chart-ing").innerHTML = ms
    .map((m) => {
      const h = Math.max(3, Math.round((m.t / mx) * 100));
      return `<div class="bcol"><div style="font-size:9px;color:var(--green)">${m.t > 0 ? "$" + Math.round(m.t / 1000) + "k" : ""}</div><div class="brect" style="height:${h}px"></div><div class="blbl">${m.lb}</div></div>`;
    })
    .join("");
  // seguimientos hoy
  const sh = DB.get("segs").filter(
    (s) => !s.hecho && s.fecha && s.fecha <= hoy(),
  );
  document.getElementById("dash-seg").innerHTML = sh.length
    ? sh
        .slice(0, 4)
        .map(
          (s) =>
            `<div style="padding:7px 0;border-bottom:1px solid var(--border);font-size:12px"><b>${s.cliente_nombre}</b>${s.fdisp ? ' — <span style="color:var(--accent)">' + s.fdisp + "</span>" : ""} <span style="color:var(--text2)">${s.tipo}</span>${s.es_mant ? '<span class="tag tg" style="font-size:10px;margin-left:4px">🎁</span>' : ""}<div style="font-size:11px;color:var(--text3)">${s.notas || ""}</div></div>`,
        )
        .join("")
    : '<div class="nd">Sin pendientes hoy</div>';

  // ======================================================
  // KPIs del Motor de Inventario
  // ======================================================

  const inventario = DB.get("inventario");

  const valorInventario = inventario.reduce(
    (a, p) => a + Number(p.valor_inventario || 0),
    0,
  );

  const valorVenta = inventario.reduce(
    (a, p) => a + Number(p.valor_venta || 0),
    0,
  );

  const utilidadPotencial = inventario.reduce(
    (a, p) => a + Number(p.utilidad_potencial || 0),
    0,
  );

  const productosCriticos = inventario.filter((p) =>
    ["STOCK_BAJO", "AGOTADO"].includes(p.estado_inventario),
  ).length;

  const elInvValor = document.getElementById("dash-inv-valor");

  if (elInvValor) {
    elInvValor.textContent = mxn(valorInventario);
  }

  const elInvVenta = document.getElementById("dash-inv-venta");

  if (elInvVenta) {
    elInvVenta.textContent = mxn(valorVenta);
  }

  const elInvUtilidad = document.getElementById("dash-inv-utilidad");

  if (elInvUtilidad) {
    elInvUtilidad.textContent = mxn(utilidadPotencial);
  }

  const elInvCriticos = document.getElementById("dash-inv-criticos");

  if (elInvCriticos) {
    elInvCriticos.textContent = productosCriticos;
  }

  // ==========================================
  // KPI - Ticket promedio
  // ==========================================

  const ventas = DB.get("ventas") || [];

  const ventasValidas = ventas.filter((v) => v.estado !== "CANCELADA");

  const ticketPromedio = ventasValidas.length
    ? ventasValidas.reduce((a, v) => a + Number(v.total || 0), 0) /
      ventasValidas.length
    : 0;

  document.getElementById("dash-ticket-promedio").textContent =
    mxn(ticketPromedio);

  // ==========================================
  // KPI - Productos vendidos
  // ==========================================

  const productosVendidos = ventasValidas.reduce((total, venta) => {
    return (
      total +
      (venta.lineas || []).reduce((suma, linea) => {
        if (linea.tipo !== "producto") return suma;

        return suma + Number(linea.qty || 0);
      }, 0)
    );
  }, 0);

  document.getElementById("dash-productos-vendidos").textContent =
    productosVendidos;

  // ==========================================
  // KPI - Compras realizadas (Mes)
  // ==========================================

  const hoyFecha = new Date();

  const comprasMes = (DB.get("ordenes_compra") || [])
    .filter((oc) => {
      if (
        oc.estado !== "Recibida completa" &&
        oc.estado !== "Recibida parcial"
      ) {
        return false;
      }

      if (!oc.fecha) return false;

      const f = new Date(oc.fecha);

      return (
        f.getMonth() === hoyFecha.getMonth() &&
        f.getFullYear() === hoyFecha.getFullYear()
      );
    })
    .reduce((t, oc) => t + Number(oc.total || 0), 0);

  document.getElementById("dash-compras-mes").textContent = mxn(comprasMes);

  // ==========================================
  // KPI - Margen promedio
  // ==========================================

  const invMargen = DB.get("inventario") || [];

  let ventaTotalMargen = 0;

  let utilidadTotalMargen = 0;

  ventasValidas.forEach((venta) => {
    (venta.lineas || []).forEach((linea) => {
      if (linea.tipo !== "producto") return;

      const prod = invMargen.find((p) => p.sku === linea.sku);

      if (!prod) return;

      const precioVenta = Number(linea.precio || 0);

      const costo = Number(prod.costo || 0);

      const cantidad = Number(linea.qty || 0);

      ventaTotalMargen += precioVenta * cantidad;

      utilidadTotalMargen += (precioVenta - costo) * cantidad;
    });
  });

  const margenPromedio =
    ventaTotalMargen > 0 ? (utilidadTotalMargen / ventaTotalMargen) * 100 : 0;

  document.getElementById("dash-margen-promedio").textContent =
    margenPromedio.toFixed(1) + "%";

  // ── Nuevas métricas del dashboard ──
  dashServicios(ords);

  dashEstados(ords);

  dashExtra(ords, clis);

  dashStockCritico();

  dashTopInventario();

  dashMovimientosInventario();

  actualizarBadgeOrdenes();

  actualizarBadgeInventario();

  actualizarBadgeTickets();
}

function dashMovimientosInventario() {
  const el = document.getElementById("dash-movimientos");

  if (!el) return;

  const movs = (DB.get("inventario_movimientos") || [])

    .slice()

    .reverse()

    .slice(0, 10);

  if (!movs.length) {
    el.innerHTML = '<div class="nd">Sin movimientos registrados</div>';

    return;
  }

  el.innerHTML = movs
    .map(
      (m) => `

<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">

<div>

<div style="font-weight:600">

${m.nombre}

</div>

<div style="font-size:11px;color:var(--text3)">

${m.tipo} · ${m.documento || "—"}

</div>

</div>

<div style="text-align:right">

<div style="font-family:var(--fh)">

${m.cantidad}

</div>

<div style="font-size:11px;color:var(--text3)">

${m.fecha}

</div>

</div>

</div>

`,
    )
    .join("");
}

function dashServicios(ords) {
  const el = document.getElementById("dash-servicios");
  if (!el) return;
  // Contar servicios de todas las órdenes
  const conteo = {};
  ords.forEach((o) => {
    (o.servicios || []).forEach((s) => {
      const nombre = s.svcOtro || s.svc || "";
      if (!nombre || nombre === "__otro") return;
      conteo[nombre] = (conteo[nombre] || 0) + 1;
    });
  });
  const sorted = Object.entries(conteo)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);
  if (!sorted.length) {
    el.innerHTML = '<div class="nd">Sin datos aún</div>';
    return;
  }
  const max = sorted[0][1];
  el.innerHTML = sorted
    .map(([nom, cnt]) => {
      const pct = Math.round((cnt / max) * 100);
      return `<div>
      <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px">
        <span style="color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:70%">${nom}</span>
        <span style="color:var(--accent2);font-weight:600">${cnt}</span>
      </div>
      <div style="background:var(--bg3);border-radius:4px;height:6px;overflow:hidden">
        <div style="background:linear-gradient(90deg,var(--accent),var(--accent2));height:100%;width:${pct}%;border-radius:4px;transition:width .5s"></div>
      </div>
    </div>`;
    })
    .join("");
}

function dashEstados(ords) {
  const el = document.getElementById("dash-estados");
  if (!el) return;
  const estados = [
    "Recibido",
    "Diagnóstico",
    "En proceso",
    "Esperando refacción",
    "Listo",
    "Listo para entrega",
    "Entregado",
  ];
  const colores = {
    Recibido: "#75d0fa",
    Diagnóstico: "#a78bfa",
    "En proceso": "#fbbf24",
    "Esperando refacción": "#fb923c",
    Listo: "#34d399",
    "Listo para entrega": "#34d399",
    Entregado: "#6b7280",
  };
  const conteo = {};
  estados.forEach((e) => {
    conteo[e] = ords.filter((o) => o.estado === e).length;
  });
  const total = ords.length || 1;
  const activos = estados.filter((e) => !["Entregado"].includes(e));
  el.innerHTML = activos
    .map((e) => {
      const n = conteo[e] || 0;
      const pct = Math.round((n / total) * 100);
      return `<div>
      <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px">
        <span style="color:var(--text)">${e}</span>
        <span style="color:${colores[e] || "var(--accent)"};font-weight:600">${n}</span>
      </div>
      <div style="background:var(--bg3);border-radius:4px;height:6px;overflow:hidden">
        <div style="background:${colores[e] || "var(--accent)"};height:100%;width:${pct}%;border-radius:4px;transition:width .5s"></div>
      </div>
    </div>`;
    })
    .join("");
}

function dashExtra(ords, clis) {
  // Tiempo promedio de reparación
  const entregadas = ords.filter(
    (o) =>
      ["Entregado", "Entregado (garantía)"].includes(o.estado) &&
      o.fecha &&
      o.fecha_entrega,
  );
  if (entregadas.length) {
    const promDias =
      entregadas.reduce((a, o) => {
        const d1 = new Date(o.fecha + "T12:00");
        const d2 = new Date(o.fecha_entrega + "T12:00");
        return a + Math.max(0, Math.round((d2 - d1) / 86400000));
      }, 0) / entregadas.length;
    const el = document.getElementById("dash-tprom");
    if (el) el.textContent = promDias.toFixed(1) + " días";
  }
  // Llamadas pendientes
  const nRec = ords.filter((o) => o.recordatorio?.pendiente).length;
  const elRec = document.getElementById("dash-rec");
  if (elRec) elRec.textContent = nRec;
  // Garantías activas
  const nGar = DB.get("garantias").filter((g) => g.estado === "Activa").length;
  const elGar = document.getElementById("dash-gar-act");
  if (elGar) elGar.textContent = nGar;
  // Clientes frecuentes
  const nFrec = clis.filter((c) => (c.visitas || 0) >= 3).length;
  const elFrec = document.getElementById("dash-frec");
  if (elFrec) elFrec.textContent = nFrec;
}
function updBadges() {
  const n = DB.get("ordenes").filter(
    (o) =>
      ![
        "Entregado",
        "Entregado (garantía)",
        "Cancelado",
        "No reparado",
      ].includes(o.estado),
  ).length;
  const b = document.getElementById("badge-ord");
  b.textContent = n;
  b.style.display = n ? "" : "none";
  const nRec = DB.get("ordenes").filter(
    (o) => o.recordatorio?.pendiente,
  ).length;
  const bRec = document.getElementById("badge-rec");
  if (bRec) {
    bRec.textContent = nRec;
    bRec.style.display = nRec ? "" : "none";
  }
}
function goAlert() {
  document.querySelector('[data-panel="dashboard"]').click();
}

function dashStockCritico() {
  const el = document.getElementById("dash-stock-critico");

  if (!el) return;

  const lista = DB.get("inventario")
    .filter((p) => ["STOCK_BAJO", "AGOTADO"].includes(p.estado_inventario))
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 8);

  if (!lista.length) {
    el.innerHTML = '<div class="nd">✅ Sin productos críticos</div>';

    return;
  }

  el.innerHTML = lista
    .map(
      (p) => `

<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">

<div>

<div style="font-weight:600">${p.nombre}</div>

<div style="font-size:11px;color:var(--text3)">${p.sku}</div>

</div>

<div>

<span class="tag ${p.stock <= 0 ? "trd" : "to"}">

${p.stock} ${p.unidad}

</span>

</div>

</div>

`,
    )
    .join("");
}

function dashTopInventario() {
  const el = document.getElementById("dash-top-inventario");

  if (!el) return;

  const lista = DB.get("inventario")
    .slice()
    .sort(
      (a, b) =>
        Number(b.valor_inventario || 0) - Number(a.valor_inventario || 0),
    )
    .slice(0, 8);

  if (!lista.length) {
    el.innerHTML = '<div class="nd">Sin datos</div>';

    return;
  }

  el.innerHTML = lista
    .map(
      (p) => `
<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">

    <div>

        <div style="font-weight:600">${p.nombre}</div>

        <div style="font-size:11px;color:var(--text3)">
            ${p.stock} ${p.unidad}
        </div>

    </div>

    <div style="color:var(--green);font-family:var(--fh)">

        ${mxn(Number(p.valor_inventario || 0))}

    </div>

</div>
`,
    )
    .join("");
}

window.calcIngresosMes = calcIngresosMes;
window.dash = dash;
window.dashExtra = dashExtra;
window.updBadges = updBadges;
window.goAlert = goAlert;
