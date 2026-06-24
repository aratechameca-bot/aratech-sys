// NAV
document.querySelectorAll(".sb-item").forEach((el) => {
  el.addEventListener("click", () => {
    document
      .querySelectorAll(".sb-item")
      .forEach((x) => x.classList.remove("active"));
    document
      .querySelectorAll(".panel")
      .forEach((x) => x.classList.remove("active"));
    el.classList.add("active");
    const p = el.dataset.panel;
    document.getElementById("panel-" + p).classList.add("active");
    document.getElementById("ttitle").textContent = el.textContent
      .trim()
      .replace(/\d+/g, "")
      .trim();
    ({
      dashboard: dash,
      ordenes: rndOrd,
      ventas: rndVta,
      clientes: rndCli,
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
    })[p]?.();
  });
});

// MODALES
function openM(id) {
  document.getElementById(id).classList.add("open");

  if (id === "m-orden") {
    fillClis(["ord-cli"]);
    initLS();

    // Poblar técnicos
    const tecSel = document.getElementById("ord-tec");
    if (tecSel) {
      tecSel.innerHTML = '<option value="">-- Sin asignar --</option>';

      USUARIOS.forEach((u) => {
        const opt = document.createElement("option");

        opt.value = u.nombre;

        opt.textContent =
          u.nombre +
          (u.rol === "admin"
            ? " (Admin)"
            : u.rol === "tecnico"
              ? " (Técnico)"
              : " (Recepción)");

        tecSel.appendChild(opt);
      });

      if (currentUser?.rol === "tecnico") tecSel.value = currentUser.nombre;
    }
  }

  if (id === "m-ticket") {
    fillClis(["tk-cli"]);
  }

  if (id === "m-venta") {
    fillClis(["vta-cli"]);
    fillOrds();
    document.getElementById("vta-fch").value = hoy();
    initLV();
  }

  /*
          if (id === 'm-cli') {
            document.getElementById('cli-eid').value = '';
            document.getElementById('cli-tit').textContent = '👤 Nuevo cliente';
            cliTab('gen');
            setFiscalCli({});
          }   */
}

function closeM(id) {
  document.getElementById(id).classList.remove("open");
}

document.querySelectorAll(".mb").forEach((m) =>
  m.addEventListener("click", (e) => {
    if (e.target === m) m.classList.remove("open");
  }),
);

// ============================================================
// BÚSQUEDA GLOBAL
// ============================================================
function globalSearch(q) {
  const res = document.getElementById("search-res");
  if (!q || q.length < 2) {
    res.innerHTML = "";
    return;
  }
  q = q.toLowerCase();

  const ords = DB.get("ordenes")
    .filter(
      (o) =>
        (o.folio || "").toLowerCase().includes(q) ||
        (o.cliente_nombre || "").toLowerCase().includes(q) ||
        (o.modelo || "").toLowerCase().includes(q) ||
        (o.serie || "").toLowerCase().includes(q),
    )
    .slice(0, 5);

  const clis = DB.get("clientes")
    .filter(
      (c) =>
        (c.nombre || "").toLowerCase().includes(q) ||
        (c.tel || "").includes(q) ||
        (c.email || "").toLowerCase().includes(q),
    )
    .slice(0, 3);

  let html = "";

  if (ords.length) {
    html +=
      '<div style="padding:6px 12px;font-size:9px;color:var(--text3);letter-spacing:1px;text-transform:uppercase;border-bottom:1px solid var(--border)">Órdenes</div>';
    html += ords
      .map(
        (o) => `
      <div onclick="goToOrd('${o.id}')" style="padding:10px 14px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;transition:background .15s"
           onmouseover="this.style.background='rgba(117,208,250,0.08)'" onmouseout="this.style.background='transparent'">
        <div>
          <div style="font-size:12px;font-weight:600;color:#fff">${o.folio}</div>
          <div style="font-size:10px;color:var(--text2)">${o.cliente_nombre} · ${o.tipo_equipo} ${o.modelo || ""}</div>
        </div>
        <span class="tag ${o.estado === "Listo" || o.estado === "Listo para entrega" ? "tg" : o.estado === "En proceso" ? "tb" : "tgr"}" style="font-size:9px">${o.estado}</span>
      </div>`,
      )
      .join("");
  }

  if (clis.length) {
    html +=
      '<div style="padding:6px 12px;font-size:9px;color:var(--text3);letter-spacing:1px;text-transform:uppercase;border-bottom:1px solid var(--border);border-top:1px solid var(--border)">Clientes</div>';
    html += clis
      .map(
        (c) => `
      <div onclick="goToCli('${c.id}')" style="padding:10px 14px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;transition:background .15s"
           onmouseover="this.style.background='rgba(117,208,250,0.08)'" onmouseout="this.style.background='transparent'">
        <div>
          <div style="font-size:12px;font-weight:600;color:#fff">${c.nombre}</div>
          <div style="font-size:10px;color:var(--text2)">${c.tel || ""} ${c.email ? "· " + c.email : ""}</div>
        </div>
        ${(c.visitas || 0) >= 3 ? '<span style="font-size:9px;color:#ffd600">⭐</span>' : ""}
      </div>`,
      )
      .join("");
  }

  if (!ords.length && !clis.length) {
    html =
      '<div style="padding:16px;text-align:center;color:var(--text3);font-size:12px">Sin resultados para "' +
      q +
      '"</div>';
  }

  res.innerHTML = html;
  res.style.display = "block";
}

function showSearchRes() {
  const res = document.getElementById("search-res");
  if (res.innerHTML) res.style.display = "block";
}
function hideSearchRes() {
  document.getElementById("search-res").style.display = "none";
}

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
  const changeTheme = () => {
    const isLight = document.body.classList.toggle("light-mode");

    try {
      localStorage.setItem("aratech-theme", isLight ? "light" : "dark");
    } catch (e) {}
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
    if (window.innerWidth < 640) closeSidebar();
  });
});

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
