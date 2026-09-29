function puedeAbrirPanel(panel) {
  const rol = window.currentUser?.rol;

  if (!rol) return false;

  if (rol === "admin") return true;

  if (rol === "recepcionista") {
    return !["config", "historial"].includes(panel);
  }

  if (rol === "tecnico") {
    return ![
      "ventas",
      "clientes",
      "inventario",
      "gastos",
      "compras",
      "garantias",
      "config",
      "historial",
    ].includes(panel);
  }

  return false;
}

// ============================================================
// ACTIVAR PANEL
// ============================================================

function activarPanel(panel, validarPermisos = true) {
  if (validarPermisos && !puedeAbrirPanel(panel)) {
    notify("No tienes permisos para acceder a este módulo");

    return false;
  }

  document
    .querySelectorAll(".sb-item")
    .forEach((x) => x.classList.remove("active"));

  document
    .querySelectorAll(".panel")
    .forEach((x) => x.classList.remove("active"));

  const item = document.querySelector(`.sb-item[data-panel="${panel}"]`);

  const panelEl = document.getElementById("panel-" + panel);

  if (!item || !panelEl) return false;

  item.classList.add("active");

  panelEl.classList.add("active");

  try {
    localStorage.setItem("aratech-last-panel", panel);
  } catch (e) {}

  const titulo = document.getElementById("ttitle");

  if (titulo) {
    titulo.textContent = item.textContent.trim().replace(/\d+/g, "").trim();
  }

  ({
    dashboard: dash,
    ordenes: filtOrd,
    ventas: rndVta,
    clientes: rndCli,
    finanzas: () => {},
    inventario: rndInv,
    garantias: rndGar,
    postventa: rndCRM,
    config: rndCfg,
    formatos: rndFmt,
    calculadora: cotInit,
    gastos: rndGastos,
    historial: rndHistorial,
    tickets: rndTickets,
    compras: () => {
      rndOC();
      rndProv();
      fillProvSelect();
      cmpTab("ord");
    },
  })[panel]?.();

  return true;
}

// ============================================================
// NAV
// ============================================================

document.querySelectorAll(".sb-item").forEach((el) => {
  el.addEventListener("click", () => {
    activarPanel(el.dataset.panel);

    if (window.innerWidth <= 1024) {
      closeSidebar();
    }
  });
});

// MODALES
async function openM(id) {
  document.getElementById(id).classList.add("open");

  switch (id) {
    case "m-orden": {
      fillClis(["ord-cli"]);
      initLS();

      const tecSel = document.getElementById("ord-tec");

      if (tecSel) {
        tecSel.innerHTML = '<option value="">-- Sin asignar --</option>';

        try {
          const usuarios = await DATA.getAll("usuarios");

          usuarios
            .filter((u) => u.activo !== false && u.rol === "tecnico")
            .forEach((u) => {
              const opt = document.createElement("option");

              opt.value = u.nombre;

              opt.textContent = u.nombre;

              tecSel.appendChild(opt);
            });
        } catch (err) {
          console.error("Error cargando técnicos:", err);
        }

        if (currentUser?.rol === "tecnico") {
          tecSel.value = currentUser.nombre;
        }
      }

      break;
    }

    case "m-ticket":
      fillClis(["tk-cli"]);
      break;

    case "m-venta":
      fillClis(["vta-cli"]);
      fillOrds();
      document.getElementById("vta-fch").value = hoy();
      initLV();
      break;

    // ======================================================
    // MOTOR DE COBROS
    // ======================================================
    case "modalPago":
      break;
  }
}
/*
          if (id === 'm-cli') {
            document.getElementById('cli-eid').value = '';
            document.getElementById('cli-tit').textContent = '👤 Nuevo cliente';
            cliTab('gen');
            setFiscalCli({});
          }   */

function closeM(id) {
  document.getElementById(id).classList.remove("open");

  // Limpiar contexto únicamente al cerrar Nueva Orden
  if (id === "m-orden") {
    resetOrdenContext();

    limpOrd();
  }
}

document.querySelectorAll(".mb").forEach((m) =>
  m.addEventListener("click", (e) => {
    if (e.target === m) m.classList.remove("open");
  }),
);

// ============================================================
// ARA SEARCH
// ============================================================

let araSearchIndex = -1;

// ============================================================
// ARA SEARCH HISTORY
// ============================================================

const ARA_SEARCH_HISTORY_KEY = "ara-search-history";

let araSearchHistory = JSON.parse(
  localStorage.getItem(ARA_SEARCH_HISTORY_KEY) || "[]",
);

// ============================================================
// ARA SEARCH ACTIONS
// ============================================================

const araSearchActions = [
  {
    id: "new-order",
    title: "Nueva Orden",
    keywords: ["orden", "nueva orden", "servicio", "reparacion"],
    icon: "herramientas",
    run: () => openM("m-orden"),
  },

  {
    id: "new-client",
    title: "Nuevo Cliente",
    keywords: ["cliente", "nuevo cliente", "registrar cliente"],
    icon: "usuario",
    run: () => newCli(),
  },

  {
    id: "new-sale",
    title: "Nueva Venta",
    keywords: ["venta", "nueva venta"],
    icon: "dinero",
    run: () => openM("m-venta"),
  },

  {
    id: "new-product",
    title: "Nuevo Producto",
    keywords: ["producto", "nuevo producto", "inventario"],
    icon: "inventario",
    run: () => openM("m-prod"),
  },

  {
    id: "new-purchase",
    title: "Nueva Compra",
    keywords: ["compra", "nueva compra", "orden compra"],
    icon: "compras",
    run: () => openNuevaOC(),
  },

  {
    id: "new-expense",
    title: "Nuevo Gasto",
    keywords: ["gasto", "nuevo gasto"],
    icon: "gastos",
    run: () => openM("m-gasto"),
  },

  {
    id: "new-ticket",
    title: "Nuevo Ticket",
    keywords: ["ticket", "nuevo ticket", "soporte"],
    icon: "tickets",
    run: () => openM("m-ticket"),
  },

  {
    id: "new-provider",
    title: "Nuevo Proveedor",
    keywords: ["proveedor", "nuevo proveedor"],
    icon: "proveedor",
    run: () => openNuevoProv(),
  },
];

// ============================================================
// ARA SEARCH MATCH
// ============================================================

function araSearchMatch(q, ...fields) {
  q = String(q || "")
    .trim()
    .toLowerCase();

  if (!q) return false;

  const texto = fields
    .filter((v) => v !== undefined && v !== null)
    .map((v) => String(v).toLowerCase())
    .join(" ");

  const palabras = q.split(/\s+/);

  return palabras.every((p) => texto.includes(p));
}

// ============================================================
// SEARCH ACTIONS
// ============================================================

function searchAraActions(q) {
  q = q.toLowerCase().trim();

  if (q.length < 2) return [];

  return araSearchActions.filter((action) => {
    if (action.title.toLowerCase().includes(q)) return true;

    return action.keywords.some((keyword) => keyword.toLowerCase().includes(q));
  });
}

// ============================================================
// SEARCH ORDERS
// ============================================================

function searchAraOrders(q) {
  return DB.get("ordenes")
    .filter((o) => {
      return araSearchMatch(
        q,

        o.id,
        o.folio,

        o.cliente_nombre,
        o.tel,

        o.tipo_equipo,
        o.marca,
        o.modelo,
        o.serie,
        o.imei,

        o.falla,
        o.diagnostico,
        o.observaciones,
        o.accesorios,

        o.servicio,

        o.estado,

        o.tecnico,
        o.recepcionista,
      );
    })
    .slice(0, 5);
}

// ============================================================
// SEARCH CLIENTS
// ============================================================

function searchAraClients(q) {
  return DB.get("clientes")
    .filter((c) => {
      return araSearchMatch(
        q,

        c.id,
        c.nombre,
        c.tel,
        c.email,
        c.rfc,
        c.dir,
        c.observaciones,
      );
    })
    .slice(0, 5);
}

// ============================================================
// SEARCH SALES
// ============================================================

function searchAraSales(q) {
  return DB.get("ventas")
    .filter((v) => {
      return araSearchMatch(
        q,

        v.id,
        v.folio,

        v.cliente_nombre,

        v.orden_rel,

        v.ticket_folio,

        v.pago_estado,

        v.notas,

        ...(v.lineas || []).flatMap((l) => [l.desc, l.sku]),
      );
    })
    .slice(0, 5);
}

// ============================================================
// SEARCH INVENTARIO
// ============================================================

function searchAraInventory(q) {
  return DB.get("inventario")
    .filter((p) => {
      return araSearchMatch(
        q,

        p.sku,
        p.nombre,
        p.marca,
        p.modelo,
        p.categoria,
        p.descripcion,
        p.proveedor,
        p.codigo_barras,
        p.no_parte,
        p.ubicacion,
        p.observaciones,
      );
    })
    .slice(0, 5);
}

// ============================================================
// SEARCH GARANTIAS
// ============================================================

function searchAraGarantias(q) {
  return DB.get("garantias")
    .filter((g) => {
      return araSearchMatch(
        q,

        g.id,

        g.folio,

        g.cliente_nombre,

        g.modelo,

        g.serie,

        g.servicio,

        g.estado,

        g.tipo_gar,

        g.observaciones,
      );
    })
    .slice(0, 5);
}
// ============================================================
// SEARCH COMPRAS
// ============================================================

function searchAraCompras(q) {
  return DB.get("compras")
    .filter((c) => {
      return araSearchMatch(
        q,

        c.id,

        c.folio,

        c.proveedor,

        c.factura,

        c.observaciones,

        ...(c.productos || []).flatMap((p) => [p.nombre, p.sku]),
      );
    })
    .slice(0, 5);
}

// ============================================================
// SEARCH GASTOS
// ============================================================

function searchAraGastos(q) {
  return DB.get("gastos")
    .filter((g) => {
      return araSearchMatch(
        q,

        g.id,

        g.folio,

        g.concepto,

        g.proveedor,

        g.categoria,

        g.observaciones,
      );
    })
    .slice(0, 5);
}

// ============================================================
// SEARCH PROVEEDORES
// ============================================================

function searchAraProviders(q) {
  return DB.get("proveedores")
    .filter((p) => {
      return araSearchMatch(
        q,

        p.id,

        p.nombre,

        p.contacto,

        p.tel,

        p.email,

        p.rfc,

        p.direccion,

        p.observaciones,
      );
    })
    .slice(0, 5);
}

// ============================================================
// ARA SEARCH PROVIDERS
// ============================================================

const araSearchProviders = {
  actions: searchAraActions,

  orders: searchAraOrders,

  clients: searchAraClients,

  sales: searchAraSales,

  inventory: searchAraInventory,

  warranties: searchAraGarantias,

  purchases: searchAraCompras,

  expenses: searchAraGastos,

  providers: searchAraProviders,
};

// ============================================================
// ARA SEARCH ENGINE
// ============================================================

function searchAraEngine(q) {
  const results = {};

  Object.entries(araSearchProviders).forEach(([key, provider]) => {
    results[key] = provider(q);
  });

  return results;
}

// ============================================================
// RUN ACTION
// ============================================================

function runAraAction(id) {
  const action = araSearchActions.find((a) => a.id === id);

  if (!action) return;

  hideSearchRes();

  araSearchIndex = -1;

  action.run();
}

// ============================================================
// RENDER ACTIONS
// ============================================================

function renderAraActions(actions) {
  if (!actions.length) return "";

  return `

        <div class="ara-search-section">

            ACCIONES RÁPIDAS

        </div>

        ${actions
          .map(
            (action) => `

            <div class="ara-search-item"

                 onclick="runAraAction('${action.id}')">

                <div class="ara-search-info">

                    <div class="ara-search-name">

                        <i class="ar-icon ${action.icon}"></i> ${action.title}

                    </div>

                    <div class="ara-search-desc">

                        Acción rápida

                    </div>

                </div>

            </div>

        `,
          )
          .join("")}

    `;
}

// ============================================================
// RENDER ORDERS
// ============================================================

function renderAraOrders(ords) {
  if (!ords.length) return "";

  return `

        <div class="ara-search-section">

            ÓRDENES

        </div>

        ${ords
          .map(
            (o) => `

            <div class="ara-search-item"

                 onclick="goToOrd('${o.id}')">

                <div class="ara-search-info">

                    <div class="ara-search-name">

                        <i class="ar-icon ordenes"></i> ${o.id || o.folio}

                    </div>

                    <div class="ara-search-desc">

                        ${o.cliente_nombre} · ${o.tipo_equipo} ${o.modelo || ""}

                    </div>

                </div>

                <span class="tag ${
                  o.estado === "Listo" || o.estado === "Listo para entrega"
                    ? "tg"
                    : o.estado === "En proceso"
                      ? "tb"
                      : "tgr"
                }">

                    ${o.estado}

                </span>

            </div>

        `,
          )
          .join("")}

    `;
}

// ============================================================
// RENDER CLIENTS
// ============================================================

function renderAraClients(clients) {
  if (!clients.length) return "";

  return `

        <div class="ara-search-section">

            CLIENTES

        </div>

        ${clients
          .map(
            (client) => `

            <div class="ara-search-item"

                 onclick="goToCli('${client.id}')">

                <div class="ara-search-info">

                    <div class="ara-search-name">

                        <i class="ar-icon clientes"></i> ${client.nombre}

                    </div>

                    <div class="ara-search-desc">

                        ${client.tel || ""}

                        ${client.email ? " · " + client.email : ""}

                    </div>

                </div>

            </div>

        `,
          )
          .join("")}

    `;
}

// ============================================================
// RENDER SALES
// ============================================================

function renderAraSales(sales) {
  if (!sales.length) return "";

  return `

        <div class="ara-search-section">

            VENTAS

        </div>

        ${sales
          .map(
            (sale) => `

            <div class="ara-search-item"

                onclick="hideSearchRes();openVenta('${sale.id}')"

                <div class="ara-search-info">

                    <div class="ara-search-name">

                        <i class="ar-icon ventas"></i> ${sale.folio || sale.id}

                    </div>

                    <div class="ara-search-desc">

                        ${sale.cliente_nombre || ""}

                        ${sale.total ? " · $" + mxn(sale.total) : ""}

                    </div>

                </div>

            </div>

        `,
          )
          .join("")}

    `;
}

// ============================================================
// RENDER INVENTARIO
// ============================================================

function renderAraInventory(products) {
  if (!products.length) return "";

  return `

        <div class="ara-search-section">

            INVENTARIO

        </div>

        ${products
          .map(
            (product) => `

            <div class="ara-search-item"

                 onclick="editProd('${product.sku}')">

                <div class="ara-search-info">

                    <div class="ara-search-name">

                        <i class="ar-icon inventario"></i> ${product.nombre}

                    </div>

                    <div class="ara-search-desc">

                        ${product.marca || "Sin marca"}

                        · SKU: ${product.sku}

                        · Stock: ${product.stock ?? 0}

                    </div>

                </div>

            </div>

        `,
          )
          .join("")}

    `;
}

// ============================================================
// RENDER GARANTIAS
// ============================================================

function renderAraGarantias(warranties) {
  if (!warranties.length) return "";

  return `

        <div class="ara-search-section">

            GARANTÍAS

        </div>

        ${warranties
          .map(
            (g) => `

            <div class="ara-search-item"

                 onclick="verGar('${g.id}')">

                <div class="ara-search-info">

                    <div class="ara-search-name">

                        <i class="ar-icon garantia"></i> ${g.folio}

                    </div>

                    <div class="ara-search-desc">

                        ${g.cliente_nombre}

                        · ${g.modelo || ""}

                    </div>

                </div>

                <span class="tag tg">

                    ${g.estado || "Activa"}

                </span>

            </div>

        `,
          )
          .join("")}

    `;
}

// ============================================================
// RENDER COMPRAS
// ============================================================

function renderAraCompras(compras) {
  if (!compras.length) return "";

  return `

        <div class="ara-search-section">

            COMPRAS

        </div>

        ${compras
          .map(
            (c) => `

            <div class="ara-search-item"

                 onclick="openDetalleOC('${c.id}')">

                <div class="ara-search-info">

                    <div class="ara-search-name">

                        <i class="ar-icon compras"></i> ${c.folio}

                    </div>

                    <div class="ara-search-desc">

                        ${c.proveedor || ""}

                        ${c.factura ? " · Factura: " + c.factura : ""}

                    </div>

                </div>

            </div>

        `,
          )
          .join("")}

    `;
}

// ============================================================
// RENDER GASTOS
// ============================================================

function renderAraGastos(gastos) {
  if (!gastos.length) return "";

  return `

        <div class="ara-search-section">

            GASTOS

        </div>

        ${gastos
          .map(
            (g) => `

            <div class="ara-search-item"

                 onclick="editGasto('${g.id}')">

                <div class="ara-search-info">

                    <div class="ara-search-name">

                        <i class="ar-icon gastos"></i> ${g.folio}

                    </div>

                    <div class="ara-search-desc">

                        ${g.concepto || ""}

                        ${g.proveedor ? " · " + g.proveedor : ""}

                    </div>

                </div>

            </div>

        `,
          )
          .join("")}

    `;
}

// ============================================================
// RENDER PROVEEDORES
// ============================================================

function renderAraProviders(providers) {
  if (!providers.length) return "";

  return `

        <div class="ara-search-section">

            PROVEEDORES

        </div>

        ${providers
          .map(
            (p) => `

            <div class="ara-search-item"

                 onclick="editProv('${p.id}')">

                <div class="ara-search-info">

                    <div class="ara-search-name">

                        <i class="ar-icon proveedor"></i> ${p.nombre}

                    </div>

                    <div class="ara-search-desc">

                        ${p.contacto || ""}

                        ${p.tel ? " · " + p.tel : ""}

                    </div>

                </div>

            </div>

        `,
          )
          .join("")}

    `;
}

// ============================================================
// ARA SEARCH RENDERERS
// ============================================================

const araSearchRenderers = {
  actions: renderAraActions,

  orders: renderAraOrders,

  clients: renderAraClients,

  sales: renderAraSales,

  inventory: renderAraInventory,

  warranties: renderAraGarantias,

  purchases: renderAraCompras,

  expenses: renderAraGastos,

  providers: renderAraProviders,
};

// ============================================================
// RENDER SEARCH
// ============================================================

function renderAraSearch(results) {
  let html = "";

  Object.entries(araSearchRenderers).forEach(([key, renderer]) => {
    html += renderer(results[key] || []);
  });

  if (!html) {
    html = `

            <div style="padding:18px;text-align:center;color:var(--text3)">

                Sin resultados

            </div>

        `;
  }

  return `

        <div class="ara-search-header">

            <div>

                <div class="ara-search-title">

                    ARA SEARCH

                </div>

                <div class="ara-search-subtitle">

                    Busca en todo ARATECH-SYS

                </div>

            </div>

        </div>

        ${html}

    `;
}

function saveAraSearch(query) {
  query = query.trim();

  if (query.length < 2) return;

  araSearchHistory = araSearchHistory.filter((x) => x !== query);

  araSearchHistory.unshift(query);

  araSearchHistory = araSearchHistory.slice(0, 10);

  localStorage.setItem(
    ARA_SEARCH_HISTORY_KEY,

    JSON.stringify(araSearchHistory),
  );
}

function showAraSearchHistory() {
  const res = document.getElementById("search-res");

  if (!araSearchHistory.length) {
    res.innerHTML = `

        <div class="ara-search-header">

            <div>

                <div class="ara-search-title">

                    ARA SEARCH

                </div>

                <div class="ara-search-subtitle">

                    Comienza escribiendo para buscar.

                </div>

            </div>

        </div>

        <div style="padding:20px;color:var(--text3);font-size:12px">

            Sin búsquedas recientes.

        </div>

        `;
  } else {
    res.innerHTML = `

        <div class="ara-search-header">

            <div>

                <div class="ara-search-title">

                    ARA SEARCH

                </div>

                <div class="ara-search-subtitle">

                    Búsquedas recientes

                </div>

            </div>

        </div>

        ${araSearchHistory
          .slice(0, 1)
          .map(
            (q) => `

            <div class="ara-search-item"

                onclick="restoreAraSearch('${q}')"

                <div class="ara-search-info">

                    <div class="ara-search-name">

                        ${q}

                    </div>

                </div>

            </div>

        `,
          )
          .join("")}

        `;
  }

  res.classList.add("open");

  document.getElementById("search-overlay").classList.add("open");

  document.body.classList.add("search-open");

  araSearchIndex = 0;

  updateAraSearchSelection();
}

function restoreAraSearch(q) {
  const input = document.getElementById("global-search");

  input.value = q;

  input.focus();

  globalSearch(q);
}

function globalSearch(q) {
  const res = document.getElementById("search-res");
  araSearchIndex = -1;

  document.body.classList.add("search-open");
  document.getElementById("search-overlay").classList.add("open");

  if (!q || q.length < 2) {
    res.innerHTML = "";

    res.classList.remove("open");

    return;
  }

  q = q.toLowerCase();

  saveAraSearch(q);

  const results = searchAraEngine(q);

  res.innerHTML = renderAraSearch(results);

  window.refreshIcons(res);

  res.classList.add("open");

  document.getElementById("search-overlay").classList.add("open");

  document.body.classList.add("search-open");

  updateAraSearchSelection();
}

function showSearchRes() {
  const input = document.getElementById("global-search");

  if (input.value.trim() === "") {
    showAraSearchHistory();

    return;
  }

  const res = document.getElementById("search-res");

  const overlay = document.getElementById("search-overlay");

  if (res.innerHTML.trim() !== "") {
    res.classList.add("open");

    overlay.classList.add("open");

    document.body.classList.add("search-open");
  }
}

function hideSearchRes() {
  document.getElementById("search-res").classList.remove("open");

  document.getElementById("search-overlay").classList.remove("open");

  document.body.classList.remove("search-open");

  const input = document.getElementById("global-search");

  input.value = "";

  input.blur();
}

function updateAraSearchSelection() {
  const items = document.querySelectorAll(".ara-search-item");

  items.forEach((item) => item.classList.remove("selected"));

  if (!items.length) return;

  if (araSearchIndex < 0) araSearchIndex = 0;

  if (araSearchIndex >= items.length) {
    araSearchIndex = items.length - 1;
  }

  items[araSearchIndex].classList.add("selected");

  items[araSearchIndex].scrollIntoView({
    block: "nearest",
  });
}

document.addEventListener("keydown", function (e) {
  const res = document.getElementById("search-res");

  if (e.key === "Escape") {
    hideSearchRes();

    araSearchIndex = -1;

    return;
  }

  if (!res.classList.contains("open")) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();

    araSearchIndex++;

    updateAraSearchSelection();
  }

  if (e.key === "ArrowUp") {
    e.preventDefault();

    araSearchIndex--;

    updateAraSearchSelection();
  }

  if (e.key === "Enter") {
    const items = document.querySelectorAll(".ara-search-item");

    if (items.length && araSearchIndex >= 0) {
      e.preventDefault();

      items[araSearchIndex].click();
    }
  }
});

function goToOrd(id) {
  document.querySelector('[data-panel="ordenes"]')?.click();
  hideSearchRes();
  document.getElementById("global-search").value = "";
  setTimeout(() => openExp(id), 300);
}

function goToCli(id) {
  document.querySelector('[data-panel="clientes"]')?.click();
  hideSearchRes();
  document.getElementById("global-search").value = "";
}

function supportsViewTransition() {
  return !!document.startViewTransition;
}

function toggleTheme() {
  const toggle = document.getElementById("theme-toggle");

  toggle.classList.add("switching");

  document.body.classList.add("theme-transition");

  setTimeout(() => {
    toggle.classList.remove("switching");
  }, 800);

  setTimeout(() => {
    document.body.classList.remove("theme-transition");
  }, 900);

  const changeTheme = () => {
    const isLight = document.body.classList.toggle("light-mode");

    const logo = document.getElementById("onara-logo");

    const aratechLogo = document.getElementById("aratech-logo");

    if (aratechLogo) {
      aratechLogo.src = isLight
        ? "assets/isotipo aratech sidebar dark.png"
        : "assets/isotipo aratech sidebar.png";
    }

    if (logo) {
      logo.src = isLight
        ? "assets/onara sidebar negro.png"
        : "assets/onara sidebar blanco.png";
    }

    localStorage.setItem("aratech-theme", isLight ? "light" : "dark");
  };

  if (!supportsViewTransition()) {
    changeTheme();

    return;
  }

  document.startViewTransition(changeTheme);
}

function initTheme() {
  let saved = "dark";

  try {
    saved = localStorage.getItem("aratech-theme") || "dark";
  } catch (e) {}

  if (saved === "light") {
    document.body.classList.add("light-mode");
  }
  const logo = document.getElementById("onara-logo");

  if (logo) {
    logo.src = document.body.classList.contains("light-mode")
      ? "assets/onara sidebar negro.png"
      : "assets/onara sidebar blanco.png";
  }

  const aratechLogo = document.getElementById("aratech-logo");

  if (aratechLogo) {
    aratechLogo.src = document.body.classList.contains("light-mode")
      ? "assets/isotipo aratech sidebar dark.png"
      : "assets/isotipo aratech sidebar.png";
  }
}

initTheme();

// ---- SIDEBAR RESPONSIVE ----
function toggleSidebar() {
  const sb = document.getElementById("sidebar");
  const hb = document.getElementById("hamburger");
  const ov = document.getElementById("sb-overlay");
  sb.classList.toggle("open");
  hb.classList.toggle("open");
  ov.classList.toggle("active");
}
function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("hamburger").classList.remove("open");
  document.getElementById("sb-overlay").classList.remove("active");
}

// Close sidebar on nav item click (mobile)
document.querySelectorAll(".sb-item").forEach(function (item) {
  item.addEventListener("click", function () {
    closeSidebar();
  });
});

/* // ============================================================
// PERFIL SUPERIOR
// ============================================================

function actualizarTopUser() {
  if (!window.currentUser) return;

  const avatar = document.getElementById("top-user-avatar");
  const nombre = document.getElementById("top-user-name");
  const rol = document.getElementById("top-user-role");

  if (!avatar || !nombre || !rol) return;

  nombre.textContent = currentUser.nombre || "Usuario";

  rol.textContent = currentUser.rol || "";

  if (currentUser.avatar) {
    avatar.innerHTML = `
            <img
                src="${currentUser.avatar}"
                alt="${currentUser.nombre}">
        `;
  } else {
    avatar.textContent = (currentUser.nombre || "?").charAt(0).toUpperCase();
  }
} */

function updateBadgeLevel(id, value) {
  const badge = document.getElementById(id);

  if (!badge) return;

  badge.classList.remove("low", "medium", "high", "critical");

  const n = Number(value || 0);

  if (n >= 20) {
    badge.classList.add("critical");
  } else if (n >= 10) {
    badge.classList.add("high");
  } else if (n >= 5) {
    badge.classList.add("medium");
  } else {
    badge.classList.add("low");
  }
}

function setSidebarBadge(id, cantidad, texto = "") {
  const badge = document.getElementById(id);

  if (!badge) return;

  const valor = Number(cantidad || 0);

  if (valor <= 0) {
    badge.style.display = "none";

    badge.textContent = "";

    return;
  }

  badge.style.display = "inline-flex";

  badge.textContent = valor > 99 ? "99+" : valor;

  badge.title = texto;

  updateBadgeLevel(id, valor);
}

function actualizarBadgeOrdenes() {
  const ordenes = DB.get("ordenes") || [];

  const pendientes = ordenes.filter(
    (o) => !["Entregado", "Cancelado"].includes(o.estado),
  );

  setSidebarBadge(
    "badge-ord",
    pendientes.length,
    `${pendientes.length} órdenes pendientes`,
  );
}

function actualizarBadgeInventario() {
  const inventario = DB.get("inventario") || [];

  const bajos = inventario.filter(
    (p) => Number(p.stock || 0) <= Number(p.min || 0),
  );

  setSidebarBadge(
    "badge-inv",
    bajos.length,
    `${bajos.length} productos bajo mínimo`,
  );
}

function actualizarBadgeTickets() {
  const tickets = DB.get("tickets") || [];

  const pendientes = tickets.filter(
    (t) =>
      !["Resuelto", "Cerrado", "Cancelado", "Cerrado por error"].includes(
        t.estado,
      ),
  );

  setSidebarBadge(
    "badge-tickets",
    pendientes.length,
    `${pendientes.length} tickets pendientes de atención`,
  );
}

window.openM = openM;
window.closeM = closeM;
window.globalSearch = globalSearch;
window.showSearchRes = showSearchRes;
window.hideSearchRes = hideSearchRes;

window.goToOrd = goToOrd;
window.goToCli = goToCli;

window.supportsViewTransition = supportsViewTransition;

window.toggleTheme = toggleTheme;
window.initTheme = initTheme;

window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
