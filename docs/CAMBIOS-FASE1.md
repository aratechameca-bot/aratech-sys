# Fase 1 — Auth y operación (Etapa 8.6)

Fecha: 29 de septiembre de 2026

- **Base:** proyecto ARASYS tal como estaba al cerrar la fase 0.
- **No se modifica:** `functions/` (incluido `functions/index.js`), ni el portal de clientes.
- **SDK:** se mantiene Firebase Compat.

Cada línea cambiada en el código lleva el comentario `[FASE 1]`. Para encontrarlas en VS Code, pulsa `Ctrl + Shift + F` y busca `[FASE 1]`.

## Archivos modificados (11)

| Archivo | Cambio |
|---|---|
| `firestore.rules` | 1 |
| `js/modules/config.js` | 2 |
| `js/modules/utilidades.js` | 2 |
| `js/modules/auth.js` | 2 y 7 |
| `js/modules/api.js` | 3 |
| `js/modules/utils.js` | 4 |
| `js/modules/evidenciasdrive.js` | 4 |
| `js/modules/tickets/tickets.files.js` | 4 |
| `js/modules/gastos.js` | 4 |
| `index.html` | 5 |
| `firebase.json` | 6 |

Archivos nuevos: `docs/ROADMAP.md` y `docs/CAMBIOS-FASE1.md`. No se publican en el hosting.

---

## Cambio 1 — Reglas de Firestore (`firestore.rules`)

**Problema:** un recepcionista o técnico no podía leer su propio documento en `usuarios`, así que no podía iniciar sesión. Tampoco podía leer `config` ni escribir en `folios`. Esto provocaba que se generaran folios locales duplicados, y como guardar usa `set()`, un folio duplicado sobrescribe el registro existente.

**Cambios:**

- `currentUser()` busca el documento con el correo en minúsculas (`.lower()`), igual que el ID que usa la app.
- Nueva función `isSelf(userId)`.
- `usuarios`: `get` si es el propio usuario o un usuario activo; `list` para usuarios activos (ver cambio 1.1). `update` si es admin, o si es el propio usuario y **solo** cambia `foto`, `ultimoAcceso`, `ultimoLogin`, `actualizado` o `actualizadoPor`. `list`, `create` y `delete` siguen siendo solo para admin.
- `config`: lectura para usuarios activos; escritura solo admin.
- `folios`: `create` y `update` para usuarios activos; `delete` solo admin.

**Riesgo:** mínimo. Solo se amplían permisos a usuarios registrados y activos. Un usuario no puede cambiarse el rol ni activarse a sí mismo.

### Cambio 1.1 — Directorio del personal (ajuste posterior a las primeras pruebas)

**Detectado** al entrar como técnico: `Error cargando técnicos: Missing or insufficient permissions` (en `ordenes.helpers.js` y `ui.js`).

**Problema:** los usuarios no-admin no podían listar `usuarios`. Además de que la lista de técnicos salía vacía, esto provocaba **pérdida de datos**. Al editar una orden, el selector de técnico quedaba vacío y al guardar se borraba el técnico asignado (`expediente.js`: `o.tecnico = ... || ""`). Lo mismo pasaba con el responsable al guardar un ticket (`tickets.js`).

**Cambio:** en `usuarios`, `get` se permite al propio usuario o a cualquier usuario activo, y `list` a usuarios activos. `create` y `delete` siguen siendo solo admin, y `update` no cambia.

**Consideración:** el personal activo puede ver los datos básicos de sus compañeros (nombre, correo, rol, foto y último acceso). Si en el futuro se quiere ocultar el correo o el último acceso, la alternativa es una colección de directorio separada (fase 4 o Etapa 9).

**Publicación:** solo reglas, `firebase deploy --only firestore:rules`. No requiere volver a publicar el hosting.

## Cambio 2 — Autenticación (`config.js`, `utilidades.js`, `auth.js`)

**Problema:** `DEV_MODE = true` autenticaba un admin ficticio sin Firebase Auth. Además, no existía `onAuthStateChanged`, así que la sesión no se restauraba al recargar.

**Cambios:**

- `config.js`: `window.DEV_MODE = false`. `loginLocal()` se conserva para pruebas locales.
- `utilidades.js` (`init`): se reemplaza `getRedirectResult()` por `FB.auth.onAuthStateChanged(...)`. Procesa una sola vez gracias a `window._procesandoLogin`. Si falla, muestra el error en la pantalla de login y cierra la sesión de Firebase.
- `auth.js` (`initGoogleAuth`): el botón solo abre el popup. El procesamiento lo hace el listener, para evitar que se ejecute dos veces.

**Qué notarás:** al abrir el sistema aparece la pantalla de login real. Después de entrar, la sesión se mantiene al recargar; la pantalla de login puede verse un instante mientras Firebase restaura la sesión.

## Cambio 3 — Carga tolerante (`api.js`)

**Problema:** `Promise.all` fallaba completo si una sola colección estaba denegada para el rol, y el sistema quedaba en "Sin conexión".

**Cambios:**

- `Promise.allSettled`: se cargan todas las colecciones permitidas y cada colección denegada se registra en consola como `Sin acceso a <colección>`.
- Si **todas** fallan (sin conexión o sin sesión), se sigue reportando "Sin conexión", como antes.
- `config` se carga en su propio `try/catch`.

## Cambio 4 — Evidencias y archivos

**`utils.js`**

- Se agrega la constante `TIPOS_ARCHIVO_PERMITIDOS` (JPG, PNG, WEBP, PDF), que son los tipos que acepta el servidor.
- Se agrega `nombreArchivoSeguro(nombre, extForzada)`: quita acentos, reemplaza espacios y símbolos por `_` y antepone un timestamp. Por ejemplo, `Foto (1) cámara.JPG` se convierte en `1790000000000_Foto_1_camara.jpg`. Está probada contra la misma validación del servidor.

**`evidenciasdrive.js`**

- `subirFotosOrden`: `API.callFunction` (que no existía) pasa a `FB.callFunction`. **Las fotos al crear una orden ahora sí se suben.**
- Nombres seguros y `mimeType: "image/jpeg"` fijo, porque `comprimirImagen` siempre genera JPEG.
- Mensaje real: "Se guardaron X de Y foto(s)" cuando alguna falla, en lugar de "✅ 0 guardadas correctamente".
- `comprimirImagen`: si el navegador no puede leer la imagen, ahora rechaza con un error en vez de quedarse esperando para siempre.
- `subirFotosExpediente`: valida el formato (JPG, PNG o WEBP) antes de procesar. Los errores se muestran al usuario; antes quedaban ocultos.

**`tickets/tickets.files.js`**

- Valida formato y tamaño (máximo 10 MB) antes de subir, con un mensaje claro.
- Envía el nombre seguro al servidor. En el sistema se sigue mostrando el nombre original.
- Se corrige el comentario automático "📎 Evidencia agregada: undefined", que ahora muestra el nombre del archivo.

**`gastos.js`**

- Valida el formato antes de subir.
- Envía nombre seguro, y las imágenes como `image/jpeg` porque se comprimen a JPEG.
- Avisa si un comprobante no se pudo subir.

**Nota:** en Storage y en el registro que crea el servidor, el archivo queda con el nombre seguro (con timestamp). Es necesario para que no se sobrescriban archivos con el mismo nombre.

## Cambio 5 — Cotizador (`index.html`)

Se elimina `onkeydown="cotClienteManual()"` del campo de cliente del cotizador. La función no existe y lanzaba un error en consola con cada tecla. La búsqueda sigue funcionando con `oninput` y `onfocus`.

## Cambio 6 — Hosting (`firebase.json`)

Se agregan exclusiones a `hosting.ignore` para que no se publiquen:

- `functions/**`: código del backend.
- `*.log`: incluye `firebase-debug.log`.
- `firestore.rules`, `firestore.indexes.json` y `storage.rules`.
- `docs/**`, `**/*.md`, `*.txt` y `downloaded-logs-*`: documentación, listas de funciones y logs descargados.
- `js/firebase/**`, `js/data/**` y `js/calculadora.js`: borradores de Modular y archivos que no se cargan. **No se borran**; son la base de la Etapa 9.

## Cambio 7 — Cierre de sesión (`auth.js`)

`cerrarSesion()` borra del navegador todas las llaves `ara_*` (el caché de datos de ARASYS). Se conservan el tema (`aratech-theme`) y el último panel (`aratech-last-panel`).

---

## Cambio 1.2 — Cierre de sesión real y login sin parpadeo (ajuste posterior)

**Detectado:** al pulsar "Cerrar sesión", aparecía el login y el usuario volvía a entrar automáticamente. Además, al recargar se veía la pantalla de login un instante antes de entrar.

**Causa:** `cerrarSesion()` llamaba a `FB.auth.signOut()` sin esperar y recargaba de inmediato. La recarga ocurría antes de que Firebase borrara la sesión guardada, así que al volver la restauraba y `onAuthStateChanged` volvía a iniciar sesión.

**Cambios:**

- `auth.js` (`cerrarSesion`): `await FB.auth.signOut()` antes de `location.reload()`. También espera a que se guarde el registro "Cierre de sesión".
- `historial.js` (`registrarAcceso`): devuelve la promesa del guardado, para poder esperarla. Los demás usos no cambian.
- `index.html`: `<body class="auth-pending">`.
- `css/responsive.css`: mientras exista `auth-pending`, el contenido del login queda oculto y solo se ve el fondo.
- `utilidades.js` (`init`): se quita `auth-pending` cuando Firebase confirma que no hay sesión, o al terminar de procesarla. Como respaldo, se quita a los 8 segundos pase lo que pase.

**Publicación:** solo hosting, `firebase deploy --only hosting`.

## Publicación (desde la terminal de VS Code, en `C:\PROYECTOS\ARASYS`)

### 1. Copiar los archivos

Descomprime el .zip y copia el **contenido** de la carpeta `ARASYS` sobre `C:\PROYECTOS\ARASYS`, aceptando reemplazar.

En VS Code, en Control de código fuente (`Ctrl + Shift + G`), deben aparecer 11 archivos modificados y 2 nuevos en `docs/`. Si aparece algún otro archivo modificado, detente y avísame.

### 2. Publicar las reglas

```
firebase deploy --only firestore:rules
```

Debe decir que las reglas compilaron (`compiled successfully`) y se publicaron (`released rules`). Si aparece un error de compilación, detente y manda el texto.

Mientras tanto, producción sigue funcionando igual, porque las reglas solo amplían permisos.

### 3. Publicar el frontend en vista previa

```
firebase hosting:channel:deploy fase1 --expires 7d
```

Te dará una URL del tipo `https://aratech-ecosystem--fase1-xxxxxx.web.app`. Producción no cambia.

Si al iniciar sesión en esa URL aparece `auth/unauthorized-domain`, agrega el dominio en la consola de Firebase, en Authentication → Configuración → Dominios autorizados.

### 4. Pruebas en la URL de vista previa (con la consola abierta, F12)

1. Aparece la pantalla de login y entras con tu cuenta de admin.
2. Recargas la página y sigues dentro.
3. Cierras sesión y vuelves al login.
4. Con una **segunda cuenta de Gmail** dada de alta como recepcionista desde el panel de usuarios: entra, ve órdenes y clientes, y el indicador dice "● Conectado". En consola puede haber avisos `Sin acceso a ...`, y es normal.
5. Creas una orden **con una foto adjunta** cuyo nombre tenga espacios o acentos. La foto aparece en el expediente.
6. En el expediente, intentas subir una imagen HEIC o PDF como foto. Debe aparecer un aviso de formato no permitido.
7. Subes un PDF con espacios en el nombre a un ticket. El comentario automático muestra el nombre, no "undefined".
8. Subes un comprobante a un gasto.
9. En Firestore, el documento `folios/AROS` avanzó su número.
10. Escribes en el cliente del cotizador sin que aparezcan errores en consola.
11. Abres `<URL de vista previa>/functions/index.js`. Debe dar 404.

### 5. Publicar a producción (solo si todo pasó)

```
firebase deploy --only hosting
```

### 6. Guardar en Git

Mensaje: `Fase 1: auth, permisos, evidencias y hosting`. **Confirmar**, sin Push.

## Cómo revertir

- **Frontend:** consola de Firebase → Hosting → historial de versiones → **Revertir** en la versión anterior.
- **Reglas:** consola de Firebase → Firestore → Reglas → historial → seleccionar la versión anterior y publicarla.
- **Local:** en VS Code, descartar los cambios de los 11 archivos, o regresar al commit de la fase 0.

## Observaciones anotadas para fases siguientes (no se tocaron)

- Al subir un archivo a un ticket, `subirTicketFile` crea un registro en `ticketarchivos` y el frontend crea otro. Puede verse duplicado. Queda para la fase 4.
- Los archivos siguen siendo públicos por `makePublic()` en las Cloud Functions. Queda para la fase 2.
