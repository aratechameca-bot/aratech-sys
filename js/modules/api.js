// ============================================================
// API — Comunicación con Apps Script
// ============================================================
const API = {
  async call(action, collection, payload, id) {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === "TU_URL_AQUI") return null;

    try {
      const accionesGet = ["getAll", "getConfig", "obtenerFotos", "getFolio"];

      if (accionesGet.includes(action)) {
        const params = new URLSearchParams({
          action,

          collection: collection || "",

          id: id || "",

          payload: payload ? JSON.stringify(payload) : "",
        });

        const res = await fetch(
          APPS_SCRIPT_URL + "?" + params.toString(),

          {
            method: "GET",
            redirect: "follow",
          },
        );

        return await res.json();
      }

      const res = await fetch(
        APPS_SCRIPT_URL,

        {
          method: "POST",

          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },

          body: JSON.stringify({
            action,

            collection,

            payload,

            id,
          }),

          redirect: "follow",
        },
      );

      return await res.json();
    } catch (e) {
      console.warn("Sheets offline:", e.message);

      return null;
    }
  },
  // Cargar TODOS los datos al iniciar
  async loadAll() {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === "TU_URL_AQUI") {
      showSyncStatus("local");
      return;
    }
    showSyncStatus("loading");
    try {
      const collections = [
        "ordenes",
        "clientes",
        "ventas",
        "inventario",
        "garantias",
        "segs",
        "cat",
        "proveedores",
        "ordenes_compra",
        "gastos",
        "tickets",
        "ticketcomentarios",
        "ticketarchivos",
        "ticketconceptos",
      ];
      const results = await Promise.all(
        collections.map((col) => this.call("getAll", col)),
      );
      const FECHA_FIELDS = {
        ordenes: ["fecha", "fecha_prom", "fecha_entrega", "fecha_gar"],
        clientes: ["fecha", "ultima_visita"],
        ventas: ["fecha"],
        inventario: ["fecha"],
        garantias: ["fecha", "fecha_gar"],
        segs: ["fecha", "fdisp"],
        cotizaciones: ["fecha"],
        gastos: ["fecha"],
        ordenes_compra: ["fecha"],
        accesos: ["fecha"],
        tickets: ["fecha", "fecha_ultima_actualizacion", "fecha_cierre"],
        ticketcomentarios: ["fecha"],
        ticketarchivos: ["fecha"],
      };
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
          const fields = FECHA_FIELDS[col] || [];
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
      // Cargar config
      const cfg = await this.call("getConfig");
      if (cfg && !cfg.error) DB.sobj("config", cfg);

      _syncEnabled = true;
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
      notify("✅ Datos sincronizados con Google Sheets");
    } catch (e) {
      showSyncStatus("error");
      console.error("Error cargando Sheets:", e);
    }
  },

  // Guardar un registro nuevo
  async save(collection, record) {
    DB.set(collection, [
      ...DB.get(collection).filter((r) => r.id !== record.id),
      record,
    ]);
    if (_syncEnabled) {
      const res = await this.call("save", collection, record);
      if (res && res.error) console.warn("Error sync save:", res.error);
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
    if (_syncEnabled) {
      const res = await this.call("update", collection, payload, id);
      if (res && res.error) console.warn("Error sync update:", res.error);
    }
  },

  // Eliminar registro
  async delete(collection, id) {
    DB.set(
      collection,
      DB.get(collection).filter((r) => r.id !== id),
    );
    if (_syncEnabled) {
      const res = await this.call("delete", collection, null, id);
      if (res && res.error) console.warn("Error sync delete:", res.error);
    }
  },

  // Obtener folio desde Sheets (para asegurar unicidad entre usuarios)
  async getFolio(prefix) {
    if (!_syncEnabled) return folioLocal(prefix);
    let folio = null;
    try {
      const res = await this.call("getFolio", null, { prefix });
      if (res && res.folio) folio = res.folio;
    } catch (e) {
      /* cae al respaldo local */
    }
    // Verificar que el folio del backend no exista ya localmente.
    // Si falta o está duplicado (p. ej. backend devolviendo siempre -0001),
    // generamos uno único basado en el consecutivo real.
    if (!folio || folioExiste(folio, prefix)) {
      return folioLocal(prefix);
    }
    // Sincronizar el contador local con el folio del backend
    const m = String(folio).match(new RegExp("^" + prefix + "-(\\d+)$", "i"));
    if (m) {
      const c = DB.obj("folios");
      const n = parseInt(m[1], 10);
      if (n > (c[prefix] || 0)) {
        c[prefix] = n;
        DB.sobj("folios", c);
      }
    }
    return folio;
  },

  // Importar respaldo JSON a Sheets
  async importBackup(backup) {
    showSyncStatus("loading");
    const res = await this.call("importAll", null, backup);
    if (res && res.ok) {
      showSyncStatus("online");
      notify("✅ Datos importados a Google Sheets correctamente");
      await this.loadAll();
    } else {
      showSyncStatus("error");
      notify("❌ Error al importar: " + (res?.error || "desconocido"));
    }
  },
};

window.API = API;
