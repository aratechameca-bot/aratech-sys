// Folio local de respaldo (cuando no hay Sheets o el backend falla)
        // Mapea cada prefijo a la(s) colección(es) donde se guarda el folio,
        // para calcular el consecutivo real a partir de los registros existentes.
        const FOLIO_COLS = {
          AROS: ['ordenes'],
          ARVTA: ['ventas'],
          ARGAR: ['garantias'],
          AROC: ['ordenes_compra'],
          ARGAS: ['gastos'],
          ARCOT: ['cotizaciones'],
          ARTK: ['tickets']
        };
        function folioLocal(p) {
          // 1) Buscar el número más alto ya usado para este prefijo en los datos reales
          let maxExist = 0;
          const cols = FOLIO_COLS[p] || [];
          const re = new RegExp('^' + p + '-(\\d+)$', 'i');
          cols.forEach(col => {
            DB.get(col).forEach(r => {
              const f = (r && (r.folio || r.id)) ? String(r.folio || r.id) : '';
              const m = f.match(re);
              if (m) { const n = parseInt(m[1], 10); if (n > maxExist) maxExist = n; }
            });
          });
          // 2) Combinar con el contador local persistido (por si la colección no está cargada)
          const counter = DB.obj('folios');
          const next = Math.max(maxExist, counter[p] || 0) + 1;
          counter[p] = next; DB.sobj('folios', counter);
          return p + '-' + String(next).padStart(4, '0');
        }
        // ¿Ya existe este folio exacto en sus colecciones?
        function folioExiste(folio, prefix) {
          const cols = FOLIO_COLS[prefix] || [];
          const f = String(folio);
          return cols.some(col => DB.get(col).some(r => r && (String(r.folio) === f || String(r.id) === f)));
        }

        window.FOLIO_COLS = FOLIO_COLS;
        window.folioLocal = folioLocal;
        window.folioExiste = folioExiste;