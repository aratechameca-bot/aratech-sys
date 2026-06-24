// folio() ahora es async — usar API.getFolio(prefix) directamente en saveOrd/saveVta
        function hoy() { return new Date().toISOString().split('T')[0] }
        function fmt(s) { if (!s || s === '—') return '—'; const clean = typeof s === 'string' ? s.slice(0, 10) : new Date(s).toISOString().slice(0, 10); const d = new Date(clean + 'T12:00:00'); return isNaN(d) ? '—' : d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) }
        function diasE(a, b) { if (!a || !b) return 0; const ca = typeof a === 'string' ? a.slice(0, 10) : new Date(a).toISOString().slice(0, 10); const cb = typeof b === 'string' ? b.slice(0, 10) : new Date(b).toISOString().slice(0, 10); return Math.round((new Date(cb + 'T12:00') - new Date(ca + 'T12:00')) / 86400000) }
        function mxn(n) { return '$' + (n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
        function cfg() { return DB.obj('config', { nombre: 'ARATECH', slogan: 'Tecnología a tu servicio', dir: 'Allende 246, Col. Obrera, Ameca, Jalisco 46620', ig: '@aratechameca', tel: '375 690 5296', em: 'aratechameca@gmail.com' }) }

        window.hoy = hoy;
        window.fmt = fmt;
        window.diasE = diasE;
        window.mxn = mxn;
        window.cfg = cfg;