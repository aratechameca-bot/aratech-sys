# ARATECH-SYS — Roadmap

Última actualización: 29 de septiembre de 2026

## Estado general

| Etapa | Nombre | Estado |
|---|---|---|
| 8 | Migración Google Sheets / Apps Script → Firebase 100% | ✅ Cerrada |
| 8.5 | Design System & UI Standardization | ✅ Terminada |
| **8.6** | **Security Hardening & Zero Trust** | 🟡 **En curso** |
| 9 | Plataforma Inteligente en Tiempo Real — Realtime & Performance Engine | ⏳ Pendiente |
| 10 | Portal de Clientes Avanzado | ⏳ Pendiente |
| 11 | FCM Push Notifications | ⏳ Pendiente |
| 12 | ARABOT AI | ⏳ Pendiente |
| 13 | Aplicación móvil (Flutter) | ⏳ Pendiente |

---

## 🟡 ETAPA 8.6 — Security Hardening & Zero Trust

```
ETAPA 8.6
  ├── F1  Security Audit                   ✅
  ├── F2  Firebase Hardening (Rules)       ✅
  ├── Fase 0  Estabilización de Functions  ✅
  ├── Fase 1  Auth y operación             ✅
  ├── Fase 2  Functions + Storage          🔴 Siguiente
  ├── Fase 3  App Check                    ⏳
  ├── Fase 4  Integridad de datos          ⏳
  ├── Fase 5  Logs y exposición de errores ⏳
  └── Fase 6  Auditoría final Zero Trust   ⏳
            ↓
      ETAPA 8.6 → CERRADA
```

### ✅ Fase 0 — Estabilización de Functions (terminada)

- Las Cloud Functions quedaron alineadas con el código local; el despliegue del 9 de septiembre había quedado a medias (19 actualizadas, 24 no).
- Causa: cuota "Total CPU allocation" de Cloud Run en us-east1 al 92% (18,375 de 20,000 mCPU).
- Se eliminaron 13 funciones sin uso, verificado en el código de ARASYS y del portal, y en 30 días de registros: `helloWorld`, `getFolio`, `getConfig`, `setConfig`, `getAll`, `save`, `update`, `remove`, `validarUsuario`, `actualizarUltimoAcceso`, `eliminarFoto`, `migrarClientesPortal`, `obtenerUrlArchivo`.
- En `functions/index.js` esas 13 líneas quedaron comentadas con `//`; el código de `services/` se conserva. Quedan 30 funciones.
- La cuota de CPU bajó a 60%.
- Pruebas funcionales de ARASYS: 8 de 8 correctas.
- `ejecutarAutomatizaciones` no se tocó. Aparece en rojo en Cloud Run por el intento fallido del 9 de septiembre, pero sigue funcionando con su última revisión buena.

**Regla operativa:** nunca correr `firebase deploy` ni `firebase deploy --only functions` sin nombres. Siempre `--only functions:nombre1,functions:nombre2`.

### ✅ Fase 1 — Auth y operación (terminada)

Publicada en producción (reglas y hosting) y probada con usuarios admin y técnico. Detalle completo en `docs/CAMBIOS-FASE1.md`. Se mantiene Firebase Compat y no toca Cloud Functions.

1. Reglas de Firestore: lectura del propio usuario, directorio del personal (1.1), `config` y folios para usuarios activos.
2. `DEV_MODE = false` y sesión persistente con `onAuthStateChanged`.
3. Carga de datos tolerante con `Promise.allSettled`.
4. Evidencias: `API.callFunction` → `FB.callFunction`, nombres de archivo seguros y validación de formato.
5. Cotizador: se quita `cotClienteManual()`, que no existe.
6. Hosting: se excluyen backend, reglas, logs, docs y borradores de Modular.
7. Limpieza de datos del navegador al cerrar sesión.

### 🔴 Fase 2 — Functions + Storage (siguiente)

- Funciones de correo (las 6 `notificar*` y `alertaInventarioBajo`): exigir sesión y usuario activo, y escapar el HTML de los datos insertados.
- Validar rol con `requireRole` (de `lib/auth.js`) en las funciones de ARASYS.
- `crearComentarioTicket` y `activarPortalCliente`: exigir sesión.
- `storage.js`: corregir `functions.https.HttpsError`, que no está definido, y validar los IDs usados en las rutas.
- Storage privado de verdad: quitar `makePublic()` y usar enlaces firmados.
- Scheduler, revisándolo antes contigo: fechas desfasadas un día por UTC, recordatorio diario sin fin de equipos sin recoger, y que un error no detenga toda la corrida.

### ⏳ Fase 3 — App Check

- Firebase App Check en Firestore, Storage y Functions.
- Límites por usuario en funciones sensibles.
- Sustituye a Cloudflare/WAF y rate limiting. Cloudflare queda opcional, solo para DNS o dominio.

### ⏳ Fase 4 — Integridad de datos

- Inventario atómico (`FieldValue.increment` o transacción).
- Folios sin sobrescritura: crear falla si el ID ya existe. Agregar `CLI`, `AVI` y `MOV` a `FOLIO_COLS`.
- Protección XSS: escapar datos de usuario en `innerHTML`.
- Matriz de permisos por rol, alineando reglas y menús.
- Registro duplicado de archivos de ticket: `subirTicketFile` crea un registro y el frontend crea otro.
- Limpieza: `cancelarGarantiasVenta` duplicada y `mailTemplates.js` vacío.

### ⏳ Fase 5 — Logs y exposición de errores

- Quitar logs de diagnóstico, como la longitud de la contraseña SMTP y los `console.log` de depuración.
- Mensajes de error sin información interna.

### ⏳ Fase 6 — Auditoría final Zero Trust

Revisión completa de reglas, Storage, Functions, App Check y frontend.

---

## ⏳ ETAPA 9 — Realtime & Performance Engine

- Migración Compat → Modular. Base: `js/firebase/` y `js/data/`, que hoy no se cargan; son borradores. Nota: `data-adapter.js` llama a `FirebaseAPI.save` con parámetros distintos a los que espera.
- `FirebaseAPI.get()` y `FirebaseAPI.subscribe()`.
- Motor en tiempo real con `onSnapshot` usando consultas filtradas, no colecciones completas, para controlar el costo de lecturas.
- Sincronización entre usuarios y actualizaciones parciales.
- Manejo centralizado de errores de Firestore.
- `addDoc()` → `setDoc()` con IDs controlados.
- Caché, estado y rendimiento.

## ⏳ ETAPA 10 — Portal de Clientes Avanzado

Clientes, tickets, garantías, ventas, seguimiento, comunicación y experiencia avanzada del cliente.

## ⏳ ETAPA 11 — FCM Push Notifications

Notificaciones push en navegador y móvil: eventos, tickets, órdenes, avisos y estados.

## ⏳ ETAPA 12 — ARABOT AI

Asistencia contextual, interpretación de información, automatización e interacción natural.

## ⏳ ETAPA 13 — Aplicación móvil

App oficial en Dart/Flutter sobre la infraestructura Firebase existente.

---

## Backlog de 8.5 (sin etapa abierta)

- `onclick` inline → listeners.
- Estilos inline → clases.
- Componentización adicional.
- Auditoría CSS continua.
- Mejoras visuales y de responsive.
