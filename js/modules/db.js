const DB = {
  // Leer del caché (síncrono, instantáneo)
  get(k) {
    if (_cache[k] !== undefined) return JSON.parse(JSON.stringify(_cache[k]));
    try {
      return JSON.parse(localStorage.getItem("ara_" + k)) || [];
    } catch {
      return [];
    }
  },
  // Guardar en caché + localStorage + firestore
  set(k, v) {
    _cache[k] = v;

    try {
      localStorage.setItem("ara_" + k, JSON.stringify(v));
    } catch {}
    // No sincronizar colecciones masivas aquí — se hace operación por operación
  },
  // Objeto (para config, folios)
  obj(k, d = {}) {
    if (_cache[k] !== undefined) return JSON.parse(JSON.stringify(_cache[k]));

    try {
      const raw = localStorage.getItem("ara_" + k);

      if (!raw || raw === "undefined") return d;

      return JSON.parse(raw);
    } catch (e) {
      return d;
    }
  },
  sobj(k, v) {
    _cache[k] = v;
    try {
      localStorage.setItem("ara_" + k, JSON.stringify(v));
    } catch {}
  },
};

window.DB = DB;
