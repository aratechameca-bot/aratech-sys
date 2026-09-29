# Fase 2 — Functions + Storage (Etapa 8.6)

Fecha: 29 de septiembre de 2026

- **Base:** ARASYS al cerrar la fase 1.2.
- **Decisiones tomadas:** fotos y archivos **privados**; recordatorio de equipos sin recoger **diario desde el día 7** (sin cambios).
- **No se modifica:** las reglas de Firestore y Storage, ni las funciones del portal (salvo `activarPortalCliente`, que usa ARASYS).

Cada cambio en el código lleva el comentario `[FASE 2]`.

## Archivos

**Backend (`functions/`)**

| Archivo | Cambio |
|---|---|
| `lib/html.js` (**nuevo**) | `esc()`, `escMultilinea()` y `emailValido()` para los correos |
| `lib/auth.js` | Nueva `requireStaff()`: sesión + usuario registrado, activo y con rol permitido |
| `services/notificaciones.js` | Las 7 funciones de correo exigen personal activo, validan el correo y escapan el HTML |
| `services/storage.js` | Personal activo en todas; archivos privados; IDs validados; corrección del error `functions` no definido |
| `services/storageSigned.js` | `obtenerUrlArchivo` reactivada con seguridad |
| `services/tickets.js` | Solo `crearComentarioTicket`: exige personal activo |
| `services/portal.js` | Solo `activarPortalCliente`: exige admin o recepción |
| `services/scheduler.js` | Fechas en hora de México, errores aislados y HTML escapado |
| `index.js` | Se reactiva `obtenerUrlArchivo`; las 13 funciones de la fase 0 siguen comentadas |

**Frontend**

| Archivo | Cambio |
|---|---|
| `js/modules/utils.js` | `escAttr()`, `rutaStorageDesdeUrl()` y `abrirArchivoPrivado()` |
| `js/modules/tickets/tickets.files.js` | Abre archivos con enlace temporal; ya no crea un registro duplicado al subir |
| `js/modules/gastos.js` | Guarda la ruta interna del comprobante y lo abre con enlace temporal |

---

## Detalle

### 1. Funciones de correo protegidas

**Funciones:** `notificarCambioEstadoOrden`, `notificarRecepcionOrden`, `notificarComentarioTicket`, `notificarEstadoTicket`, `notificarCreacionTicket`, `notificarEvidencia` y `alertaInventarioBajo`.

- **Antes:** cualquiera en internet podía enviar correos con cualquier contenido desde `soporte@aratech.com.mx`.
- **Ahora:** exigen sesión de Firebase **y** que el correo esté en `usuarios` con `activo: true`.
- Validan que `correo` sea **un solo** correo válido. Sin correo responde `SIN_CORREO` y con uno inválido `CORREO_INVALIDO`; en ninguno de los dos casos lanza un error.
- Todos los datos insertados en el HTML (nombre, equipo, folio, comentario, etc.) se escapan. Los saltos de línea de los comentarios se conservan.
- Para ARASYS no cambia nada: el frontend ya envía la sesión.

### 2. `requireStaff()` (`lib/auth.js`)

Con el login de Google, cualquier cuenta de Gmail puede obtener una sesión de Firebase. `requireStaff` busca `usuarios/{correo en minúsculas}`, igual que las reglas de Firestore, y exige `activo === true` y un rol permitido.

| Función | Roles |
|---|---|
| Correos, fotos de órdenes, archivos de tickets, `crearComentarioTicket`, `obtenerUrlArchivo` | admin, recepcionista, técnico |
| `subirGastoFile` y comprobantes de gastos en `obtenerUrlArchivo` | admin, recepcionista (igual que las reglas de `gastos`) |
| `activarPortalCliente` | admin, recepcionista (igual que las reglas de `clientes_portal`) |

### 3. Archivos privados

- `subirFoto`, `subirTicketFile` y `subirGastoFile` ya **no** llaman a `makePublic()`. Los registros nuevos guardan `url: ""` y la referencia real en `storage_path`.
- **Fotos del expediente:** `obtenerFotos` ya devolvía enlaces firmados de 15 minutos; ahora exige personal activo.
- **Archivos de tickets y comprobantes de gastos:** al hacer clic, `abrirArchivoPrivado()` pide un enlace de 15 minutos a `obtenerUrlArchivo` y lo abre en una pestaña nueva.
- **Registros antiguos:** los que solo tienen una URL pública se convierten automáticamente a su ruta interna. Los enlaces externos que se registraron a mano en tickets se abren tal cual.
- `obtenerUrlArchivo` solo firma rutas dentro de `ordenes/`, `tickets/` o `gastos/`, y nunca rutas con `..`.

### 4. Otras correcciones en `storage.js`

- Se corrige `functions.https.HttpsError`, que no estaba definido y hacía que la función tronara con un error confuso.
- Los IDs de orden, ticket, gasto y archivo se validan (solo letras, números, `_` y `-`).
- Se quita el log engañoso `>>> obtenerFotos V2 ejecutándose <<<` de `subirTicketFile`.
- `subirTicketFile` marcaba los archivos del personal como `autor_tipo: "CLIENTE"`. Ahora usa `"ARATECH"`.
- Si el frontend no manda el nombre del usuario, se usa el del personal autenticado.

### 5. Sin registros duplicados en archivos de tickets

Antes, `subirTicketFile` creaba un registro en `ticketarchivos` y el frontend creaba otro. Ahora el frontend completa el **mismo** registro, usando el `id` que devuelve el servidor. Los duplicados antiguos se quedan como están.

### 6. Scheduler (`ejecutarAutomatizaciones`)

- **Fechas de garantías:** se cuentan días de calendario en hora de México. **Antes**, el aviso de "vence en 7 días" salía con 8 días de anticipación y la garantía se marcaba como **Vencida un día antes**. Verificado con pruebas: con el código anterior, una garantía que vencía mañana ya daba 0 días.
- Un error con una orden o una garantía ya no detiene las demás. Cada una de las 4 revisiones corre aunque otra falle.
- HTML de los correos escapado.
- **Sin cambios:** el recordatorio de equipos sin recoger sigue siendo diario desde el día 7, y el horario sigue siendo las 9:00, hora de México.
- **Transición:** el día que se publique, una garantía que ayer recibió el aviso "de 7 días" (que en realidad era de 8) puede recibirlo una vez más hoy. Pasa una sola vez.

### Impacto en el portal de clientes (pausado, Etapa 10)

- La subida de archivos desde el portal ya no funcionaba desde la fase 0, y sigue sin funcionar.
- Las imágenes y archivos **nuevos** no se verán en el portal, porque el portal usa la URL pública, que ahora queda vacía.
- Esto se resuelve al adecuar el portal en la Etapa 10.

---

## Publicación, en este orden

El orden importa: primero se habilita la forma nueva de abrir archivos, luego se cambia el frontend y solo después se privatizan los archivos. En cada paso, lo que ya funciona sigue funcionando.

### Paso 0 — Copiar archivos

Copia el contenido de la carpeta `ARASYS` del .zip sobre `C:\PROYECTOS\ARASYS`. En Control de código fuente deben aparecer 11 archivos de código modificados (8 en `functions/` y 3 en `js/`), 2 archivos nuevos (`functions/lib/html.js` y `docs/CAMBIOS-FASE2.md`) y `docs/ROADMAP.md` actualizado.

### Paso 1 — Función para abrir archivos

```
firebase deploy --only functions:obtenerUrlArchivo
```

### Paso 2 — Frontend

```
firebase deploy --only hosting
```

Recarga ARASYS con `Ctrl + Shift + R`.

**Prueba A (importante):**

1. Abre un **archivo antiguo** de un ticket y el **comprobante** de un gasto antiguo. Deben abrir en una pestaña nueva, y la dirección debe contener `X-Goog-Signature`.
2. Si en lugar de abrir aparece **"❌ No se pudo abrir el archivo"**, falta un permiso en Google Cloud. Detente y aplica la **Solución de permisos** (al final de este documento) antes de continuar.

### Paso 3 — Funciones de archivos (2 grupos)

```
firebase deploy --only functions:subirFoto,functions:obtenerFotos,functions:subirTicketFile
```

```
firebase deploy --only functions:eliminarFotoLogica,functions:eliminarTicketFile,functions:subirGastoFile
```

**Prueba B:**

1. Sube una foto desde el expediente de una orden; se ve en la galería.
2. Sube un PDF a un ticket; aparece **una sola vez** en la lista y se abre al hacer clic.
3. Sube un comprobante a un gasto y ábrelo con "Ver".
4. Elimina la foto y el archivo del ticket.

### Paso 4 — Funciones de correo (3 grupos)

```
firebase deploy --only functions:notificarCambioEstadoOrden,functions:notificarRecepcionOrden,functions:notificarComentarioTicket
```

```
firebase deploy --only functions:notificarEstadoTicket,functions:notificarCreacionTicket,functions:notificarEvidencia
```

```
firebase deploy --only functions:alertaInventarioBajo,functions:crearComentarioTicket,functions:activarPortalCliente
```

**Prueba C:**

1. Crea una orden para un cliente de prueba con tu correo; llega el correo de recepción.
2. Cambia el estado de esa orden; llega el correo de actualización.
3. Agrega un comentario interno a un ticket.

### Paso 5 — Scheduler

```
firebase deploy --only functions:ejecutarAutomatizaciones
```

El ícono rojo de `ejecutarautomatizaciones` en Cloud Run debe cambiar a verde. **No uses "Forzar ejecución"** en Cloud Scheduler, porque enviaría correos reales a clientes. Al día siguiente, después de las 9:00, revisa los registros de la función.

### Paso 6 — Privatizar los archivos antiguos

Solo si las pruebas A, B y C salieron bien.

1. Abre **Cloud Shell**: el ícono `>_` en la barra superior de la consola de Google Cloud.
2. Ejecuta:
   ```
   gsutil -m acl ch -r -d AllUsers gs://aratech-ecosystem.firebasestorage.app
   ```
3. Repite la **Prueba A**: los archivos antiguos siguen abriendo desde ARASYS, porque ahora usan enlaces temporales.
4. Copia en el navegador una URL pública antigua (`https://storage.googleapis.com/...`). Debe dar **Access denied**.

Si hiciera falta volver a hacerlos públicos (no debería):

```
gsutil -m acl ch -r -u AllUsers:R gs://aratech-ecosystem.firebasestorage.app
```

### Paso 7 — Commit

Mensaje: `Fase 2: funciones protegidas, archivos privados y scheduler`. Confirmar, sin Push.

---

## Solución de permisos (solo si la Prueba A falla)

Para firmar enlaces temporales, la cuenta con la que corren las funciones necesita el rol **Creador de tokens de cuenta de servicio**. En Cloud Shell:

```
gcloud iam service-accounts add-iam-policy-binding 767396683539-compute@developer.gserviceaccount.com --member="serviceAccount:767396683539-compute@developer.gserviceaccount.com" --role="roles/iam.serviceAccountTokenCreator" --project=aratech-ecosystem
```

Espera 2 o 3 minutos y repite la Prueba A. Si sigue fallando, revisa en los registros de `obtenerurlarchivo` el mensaje `no se pudo firmar la URL` y envíalo.

## Cómo revertir

- **Una función:** en Cloud Run, abre el servicio, ve a Revisiones → Administrar el tráfico → 100% a la revisión anterior.
- **Frontend:** en la consola de Firebase, Hosting → historial → Revertir.
- **Archivos privados:** usa el comando `gsutil ... -u AllUsers:R` del paso 6.
