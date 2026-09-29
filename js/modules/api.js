// ============================================================
// API — Utilidades del Frontend
// ============================================================
const API = {
  async loadAll() {
    showSyncStatus("loading");
    try {
      const collections = [
        "ordenes",
        "clientes",
        "clientes_portal",
        "usuarios",
        "ventas",
        "inventario",
        "garantias",
        "pagos",
        "segs",
        "cat",
        "proveedores",
        "ordenes_compra",
        "gastos",
        "cotizaciones",
        "tickets",
        "ticketcomentarios",
        "ticketarchivos",
        "ticketconceptos",
        "cliente_avisos",
        "finanzas_movimientos",
      ];
      const results = await Promise.all(
        collections.map((col) => DATA.getAll(col)),
      );

      function normFecha(v) {
        if (!v && v !== 0) return v;
        if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v))
          return v.slice(0, 10);
        if (v instanceof Date || typeof v === "object")
          return new Date(v).toISOString().slice(0, 10);
        if (typeof v === "string") {
          const d = new Date(v);
          return isNaN(d) ? v : d.toISOString().slice(0, 10);
        }
        return v;
      }
      collections.forEach((col, i) => {
        if (results[i] && Array.isArray(results[i])) {
          const fields = window.FECHA_FIELDS[col] || [];
          const normed = results[i].map((r) => {
            if (!fields.length) return r;
            const n = { ...r };
            fields.forEach((f) => {
              if (n[f] !== undefined) n[f] = normFecha(n[f]);
            });
            return n;
          });
          DB.set(col, normed);
        }
      });
      // ============================================================
      // Cargar configuración desde Firestore
      // ============================================================

      const cfg = await DATA.getDoc("config", "config");

      if (cfg) {
        DB.sobj("config", cfg);
      }

      showSyncStatus("online");

      // Re-renderizar todo con datos frescos
      dash();
      rndOrd();
      rndVta();
      rndCli();
      rndInv();
      rndGar();
      rndOC();
      rndProv();
      updBadges();

      notifyMini("Conectado");
    } catch (e) {
      showSyncStatus("error");

      console.error("Error cargando datos:", e);
    }
  },

  // Actualizar registro existente
  async update(collection, id, payload) {
    const list = DB.get(collection);
    const i = list.findIndex((r) => r.id === id);
    if (i >= 0) {
      list[i] = { ...list[i], ...payload };
      DB.set(collection, list);
    }

    if (collection === "ordenes") {
      rndOrd();
    }

    if (collection === "ventas") {
      rndVta();
    }
  },

  // Obtener folio desde Firestore
  async getFolio(prefix) {
    try {
      return await DATA.nextFolio(prefix);
    } catch (e) {
      console.warn("Folio Firestore:", e);

      // Respaldo local en caso de que Firestore no esté disponible
      return folioLocal(prefix);
    }
  },
};

window.API = API;
