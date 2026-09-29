# Fase 4 — Integridad de datos (Etapa 8.6)

Fecha: 29 de septiembre de 2026

- **Alcance:** frontend y una regla de Firestore (lectura de inventario para el técnico).
- **No se modifica:** Cloud Functions.
- Cada cambio en el código lleva el comentario `[FASE 4]`.

## Hallazgo importante

El motor de inventario guardaba cada movimiento en la colección **`movimientos_inventario`**, que **no existe en las reglas de Firestore**; la colección permitida es `inventario_movimientos`. Firestore rechazaba ese guardado. Como el stock ya se había modificado antes, el resultado era este:

- Al vender un producto, el stock sí bajaba, pero el sistema mostraba "Error de inventario… La venta fue cancelada". La venta **sí** quedaba guardada, y los pasos siguientes (otros productos, garantías, relación con la orden) no se ejecutaban.
- Lo mismo pasaba en compras y cancelaciones.
- El dashboard nunca mostraba movimientos de inventario.

Para confirmarlo: en la consola de Firestore, revisa si existe la colección `movimientos_inventario`. Si existe, sus registros antiguos se conservan ahí; no se borran ni se mueven.

## Cambios

### 1. Motor de inventario atómico (`inventario.engine.js`)

- Cada movimiento se hace en una **transacción de Firestore**: lee el stock real del servidor, valida, actualiza el producto y registra el movimiento, todo en una sola operación (se aplica todo o nada).
- El movimiento se guarda en `inventario_movimientos`, la colección correcta.
- Al producto solo se le escriben los campos que cambian (stock y valores calculados), no el documento completo.
- Nunca se sobrescribe un movimiento: si el folio `MOV` ya existe, la operación se cancela.
- **Cancelar la venta de la última pieza** ya no falla. Antes la cancelación validaba "stock insuficiente", aunque en realidad regresa piezas al inventario.
- **AJUSTE** acepta cantidades positivas o negativas, y nunca deja el stock por debajo de cero.
- Nueva función `verificarStock()`: comprueba el stock en el servidor antes de vender.

### 2. Operaciones que antes escribían el stock directamente

- **Venta (`saveVta`):** verifica el stock real antes de guardar nada. El mensaje de error ya no dice "La venta fue cancelada" cuando la venta sí se guardó.
- **Editar venta:** las diferencias de cantidad pasan por el motor (DEVOLUCION o VENTA) y quedan registradas.
- **Ajuste manual (botón ±):** pasa por el motor (AJUSTE). Si se intenta retirar más de lo disponible, muestra un error; antes lo dejaba en 0 sin avisar.
- **Editar producto:** si no cambias el stock, ya no se sobrescribe. Si lo cambias, la diferencia se aplica con AJUSTE sobre el stock real.

### 3. Folios sin sobrescritura (`api.js`, `firebase.js`, `data.js`, `constants.js`)

- Antes de entregar un folio, `API.getFolio` verifica en el servidor que no exista un registro con ese ID. Si ya existe, adelanta el contador al número más alto conocido y genera el siguiente.
- Se agregaron al control los prefijos `CLI` (clientes), `AVI` (avisos) y `MOV` (movimientos).
- Si el rol del usuario no puede leer la colección, el folio se considera libre para no bloquear la operación.

### 4. Protección contra código inyectado (XSS)

- Nueva función `escHTML()` en `utils.js`, que también conserva los saltos de línea.
- Se aplica a los datos que pueden venir **del portal de clientes**: comentarios y autor de tickets, nombre y autor de archivos, cliente y asunto en la lista de tickets, y asunto del ticket relacionado en el expediente.
- También a textos libres del personal: descripción de avisos y de gastos.
- **Pendiente para la fase 5 o la Etapa 9:** una revisión completa de los demás módulos (nombres de clientes, productos, etc., que captura solo el personal).

### 5. Limpieza

- Se eliminó `cancelarGarantiasVenta()` de `ventas-crud.js`. Estaba duplicada, y la versión que se usaba realmente es la de `garantias.js`, así que no hay cambio de comportamiento.
- **Pendiente manual:** borrar `functions/services/mailTemplates.js`. Está vacío y ningún archivo lo usa.

### 6. Dashboard

- `inventario_movimientos` se carga al iniciar sesión, así que el dashboard ya muestra los últimos 10 movimientos. Los técnicos no tienen permiso para leer esta colección; verán un aviso en consola y es normal.

### 7. Matriz de roles (decisiones del 29 de septiembre de 2026)

| Rol | Ve | Puede modificar | Puede eliminar |
|---|---|---|---|
| Admin | Todo | Todo | Sí |
| Recepcionista | Todo excepto Configuración e Historial | Lo que permiten las reglas | **No** (sin cambio) |
| Técnico | **Solo** Dashboard, Órdenes, Tickets, **Inventario (solo consulta)** y Políticas | Órdenes y tickets | No |

- **`firestore.rules`:** el técnico puede leer `inventario` (`get`, `list`). Crear y editar productos sigue siendo solo para admin y recepción.
- **`ui.js` (ajuste 4.1):** `PANELES_POR_ROL` es la **única** matriz de acceso. Antes había dos listas que no coincidían: el menú (`auth.js`) mostraba Inventario y Garantías al técnico, pero `puedeAbrirPanel` (`ui.js`) le negaba la entrada con "No tienes permisos para acceder a este módulo". Para el técnico es una lista cerrada de paneles permitidos, de modo que un módulo nuevo queda oculto hasta que se agregue.
- **`auth.js`:** el menú se construye con esa misma matriz. Si el último panel visitado no está permitido, entra al Dashboard.
- **`auth.js` + `css/responsive.css`:** `<body>` recibe la clase `rol-<rol>`. Para el técnico, en Inventario se ocultan "Agregar producto" y el menú de acciones de cada producto.
- **`inventario.js`:** `editProd` y `adjStk` rechazan al técnico con un aviso (respaldo, además de las reglas).
- **Técnico:** Garantías ya estaba bloqueada al abrirla; ahora tampoco aparece en el menú. Postventa y Formatos se ocultan conforme a la decisión de "solo órdenes y tickets". Políticas queda visible por ser informativa. Cualquier ajuste se hace en `PANELES_POR_ROL`, en `ui.js`.

## Consideraciones

- Las operaciones de inventario necesitan conexión: las transacciones no funcionan sin internet.
- Si una operación falla, el folio `MOV` que se había reservado queda sin usar. Pueden quedar huecos en la numeración, lo cual es normal.

## Publicar

```
firebase deploy --only firestore:rules
```

```
firebase deploy --only hosting
```

Recarga con `Ctrl + Shift + R`.

## Pruebas (con la consola abierta, F12)

1. **Venta con un producto:** se registra sin error, el stock baja y en Firestore aparece un documento nuevo en `inventario_movimientos`.
2. **Cancelar esa venta:** el stock regresa. Si puedes, prueba con un producto que haya quedado en 0.
3. **Ajuste manual:** +2 y luego −1. Después, un retiro mayor al stock, que debe mostrar error.
4. **Editar producto sin tocar el stock:** el stock no cambia. **Editarlo cambiando el stock:** aparece un movimiento AJUSTE.
5. **Editar una venta** cambiando la cantidad: el stock se ajusta.
6. **Recibir una orden de compra:** el stock sube.
7. **Dashboard:** se ven los movimientos recientes.
8. **Comentario en un ticket** con el texto `<b>prueba</b>`: debe verse literal, sin negritas.
9. **Crear un cliente, una orden y un ticket:** los folios salen consecutivos.
10. **Como técnico:** ve Inventario sin el botón "Agregar producto" ni el menú de acciones; no ve Ventas, Clientes, Cotizaciones, Gastos, Compras ni Finanzas.
11. **Opcional (dos equipos):** con un producto con stock 1, vender al mismo tiempo desde dos navegadores. Uno debe recibir "Stock insuficiente".

## Revertir

En la consola de Firebase, Hosting → historial → **Revertir**.
