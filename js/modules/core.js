 function showSyncStatus(status) {
          let el = document.getElementById('sync-status');
          if (!el) {
            el = document.createElement('div');
            el.id = 'sync-status';
            el.style.cssText = 'font-size:11px;padding:3px 10px;border-radius:12px;font-weight:600;letter-spacing:0.5px;transition:all .3s';
            const topbar = document.querySelector('.topbar');
            if (topbar) topbar.insertBefore(el, topbar.querySelector('#alert-bar') || topbar.lastChild);
          }
          const states = {
            loading: { text: '⟳ Sincronizando…', bg: 'rgba(255,214,0,.15)', color: '#ffd600', border: 'rgba(255,214,0,.3)' },
            online: { text: '● Sheets activo', bg: 'rgba(0,230,118,.12)', color: '#00e676', border: 'rgba(0,230,118,.3)' },
            error: { text: '⚠ Sin conexión', bg: 'rgba(255,23,68,.1)', color: '#ff1744', border: 'rgba(255,23,68,.3)' },
            local: { text: '○ Modo local', bg: 'rgba(169,196,217,.1)', color: '#a9c4d9', border: 'rgba(169,196,217,.2)' }
          };
          const s = states[status] || states.local;
          el.textContent = s.text;
          el.style.background = s.bg;
          el.style.color = s.color;
          el.style.border = '1px solid ' + s.border;
        }

        const SVC_DEF = [{ nombre: 'Formato con respaldo', precio: 550, garantia: 0 }, { nombre: 'Formato sin respaldo', precio: 500, garantia: 0 }, { nombre: 'Optimización básica', precio: 350, garantia: 0 }, { nombre: 'Optimización completa', precio: 450, garantia: 0 }, { nombre: 'Limpieza profunda laptop', precio: 300, garantia: 0 }, { nombre: 'Limpieza profunda PC', precio: 350, garantia: 0 }, { nombre: 'Microsoft Office 6 meses', precio: 390, garantia: 180 }, { nombre: 'Clonado HDD a SSD', precio: 150, garantia: 90 }, { nombre: 'Clonado de almacenamiento', precio: 150, garantia: 90 }, { nombre: 'Mantenimiento impresoras', precio: 390, garantia: 0 }, { nombre: 'Reballing', precio: 2000, garantia: 60 }, { nombre: 'Reparación de corto', precio: 1800, garantia: 60 }, { nombre: 'Servicio equipo mojado', precio: 600, garantia: 0 }, { nombre: 'Instalación de software', precio: 200, garantia: 0 }, { nombre: 'Mantenimiento preventivo consolas', precio: 400, garantia: 0 }, { nombre: 'Mantenimiento preventivo PC/Laptop', precio: 250, garantia: 0 }, { nombre: 'Upgrade almacenamiento consolas', precio: 100, garantia: 90 }, { nombre: 'Soporte remoto', precio: 200, garantia: 0 }, { nombre: 'Diagnóstico — Equipo no enciende', precio: 0, garantia: 0 }];
        function initCat() { if (!DB.get('cat').length) DB.set('cat', SVC_DEF); }

        window.showSyncStatus = showSyncStatus;
        window.SVC_DEF = SVC_DEF;
        window.initCat = initCat;