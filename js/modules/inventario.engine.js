/* ==========================================================
   ARATECH-SYS
   INVENTARIO ENGINE
   v1.0.0
========================================================== */

const INVENTARIO_ENGINE = (() => {
  const TIPOS = Object.freeze({
    INVENTARIO_INICIAL: "INVENTARIO_INICIAL",

    ENTRADA: "ENTRADA",

    SALIDA: "SALIDA",

    COMPRA: "COMPRA",

    VENTA: "VENTA",

    AJUSTE: "AJUSTE",

    DEVOLUCION: "DEVOLUCION",

    GARANTIA: "GARANTIA",

    CANCELACION: "CANCELACION",

    TRANSFERENCIA: "TRANSFERENCIA",
  });

  function obtenerProducto(id) {
    const inventario = DB.get("inventario") || [];

    return inventario.find((p) => p.id === id || p.sku === id);
  }

  // ============================================================
  // [FASE 4] MOVIMIENTO ATÓMICO
  // ============================================================
  // Antes: el stock se calculaba con la copia local del navegador y se
  // escribía el número final. Si dos equipos vendían el mismo producto a la
  // vez, una salida se perdía. Además el movimiento se guardaba en la
  // colección "movimientos_inventario", que no existe en las reglas de
  // Firestore: el guardado era rechazado y el sistema reportaba error aunque
  // el stock ya se había modificado.
  //
  // Ahora: una transacción de Firestore lee el stock REAL del servidor,
  // valida, actualiza el producto y registra el movimiento en
  // "inventario_movimientos" en una sola operación (todo o nada).

  // Colección de movimientos (la que definen las reglas de Firestore)
  const COLECCION_MOVIMIENTOS = "inventario_movimientos";

  function calcularCamposDerivados(producto) {
    const stock = Number(producto.stock || 0);
    const costo = Number(producto.costo || 0);
    const precio = Number(producto.precio || 0);

    return {
      estado_inventario:
        stock <= 0
          ? "AGOTADO"
          : stock <= Number(producto.min || 0)
            ? "STOCK_BAJO"
            : "DISPONIBLE",

      valor_inventario: stock * costo,

      valor_venta: stock * precio,

      utilidad_potencial: (precio - costo) * stock,

      margen_porcentaje:
        costo > 0 ? Number((((precio - costo) / costo) * 100).toFixed(2)) : 0,
    };
  }

  function construirRegistro(id, producto, movimiento, stockAnterior) {
    const cantidad = Number(movimiento.cantidad);
    const costo = Number(producto.costo || 0);
    const precio = Number(producto.precio || 0);
    const cantidadAbs = Math.abs(cantidad);

    return {
      id,

      producto_id: producto.id,

      sku: producto.sku || "",

      nombre: producto.nombre || "",

      tipo: movimiento.tipo,

      origen: movimiento.origen,

      modulo: movimiento.modulo || "INVENTARIO",

      documento: movimiento.documento || null,

      referencia: movimiento.referencia || null,

      cantidad,

      stock_anterior: Number(stockAnterior),

      stock_nuevo: Number(producto.stock),

      costo,

      precio,

      valor_costo: costo * cantidadAbs,

      valor_venta: precio * cantidadAbs,

      utilidad: (precio - costo) * cantidadAbs,

      usuario: movimiento.usuario,

      observaciones: movimiento.observaciones || "",

      fecha: hoy(),

      hora: new Date().toLocaleTimeString("es-MX"),
    };
  }

  async function movimiento(data) {
    try {
      if (!data) {
        throw new Error("No se recibieron datos del movimiento.");
      }

      const {
        productoId,

        tipo,

        cantidad,

        documento = null,

        usuario = window.currentUser?.nombre || "Sistema",

        observaciones = "",

        costo = null,

        proveedor = null,
      } = data;

      if (!productoId) {
        throw new Error("Producto no especificado.");
      }

      if (!tipo) {
        throw new Error("Tipo de movimiento no especificado.");
      }

      if (!Object.values(TIPOS).includes(tipo)) {
        throw new Error(`Tipo de movimiento no válido: ${tipo}`);
      }

      switch (tipo) {
        case TIPOS.COMPRA:

        case TIPOS.VENTA:

        case TIPOS.GARANTIA:

        case TIPOS.DEVOLUCION:

        case TIPOS.CANCELACION:
          if (!documento) {
            throw new Error(
              "El documento origen es obligatorio para este tipo de movimiento.",
            );
          }

          break;
      }

      // El ID del documento se toma de la copia local; el STOCK se lee del
      // servidor dentro de la transacción.
      const productoLocal = obtenerProducto(productoId);

      if (!productoLocal || !productoLocal.id) {
        throw new Error("Producto no encontrado.");
      }

      const movimientoInfo = {
        tipo,

        origen: data.origen || data.modulo || "INVENTARIO",

        cantidad: Number(cantidad),

        documento,

        modulo: data.modulo || "INVENTARIO",

        referencia: data.referencia || null,

        usuario,

        observaciones,

        costo,

        proveedor,
      };

      // Validación previa (sin stock) para no gastar un folio en vano
      validarCantidad(movimientoInfo);

      const movId = await API.getFolio("MOV");

      const refProducto = FB.db.collection("inventario").doc(productoLocal.id);

      const refMovimiento = FB.db.collection(COLECCION_MOVIMIENTOS).doc(movId);

      const resultado = await FB.db.runTransaction(async (tx) => {
        const snap = await tx.get(refProducto);

        if (!snap.exists) {
          throw new Error("Producto no encontrado en el servidor.");
        }

        // [FASE 4] Nunca sobrescribir un movimiento existente
        const snapMov = await tx.get(refMovimiento);

        if (snapMov.exists) {
          throw new Error(
            `El folio ${movId} ya está registrado. Intenta de nuevo.`,
          );
        }

        const producto = { id: snap.id, ...snap.data() };

        const stockAnterior = Number(producto.stock || 0);

        validarMovimiento(producto, movimientoInfo);

        aplicarMovimiento(producto, movimientoInfo);

        const cambios = {
          stock: producto.stock,

          ...calcularCamposDerivados(producto),

          fecha_actualizacion: hoy(),

          hora_actualizacion: new Date().toLocaleTimeString("es-MX"),

          usuario_actualizacion: usuario,
        };

        Object.assign(producto, cambios);

        const registro = construirRegistro(
          movId,
          producto,
          movimientoInfo,
          stockAnterior,
        );

        // Solo se escriben los campos que cambian (no el documento completo)
        tx.update(refProducto, cambios);

        tx.set(refMovimiento, registro);

        return { producto, registro };
      });

      // Actualizar la copia local con el valor real del servidor
      const inventario = DB.get("inventario") || [];

      const index = inventario.findIndex((p) => p.id === resultado.producto.id);

      if (index >= 0) {
        inventario[index] = { ...inventario[index], ...resultado.producto };
      } else {
        inventario.push(resultado.producto);
      }

      DB.set("inventario", inventario);

      const movimientos = DB.get(COLECCION_MOVIMIENTOS) || [];

      movimientos.push(resultado.registro);

      DB.set(COLECCION_MOVIMIENTOS, movimientos);

      return {
        ok: true,

        producto: resultado.producto,

        movimiento: resultado.registro,
      };
    } catch (error) {
      console.error(
        "INVENTARIO_ENGINE:",

        error,
      );

      return {
        ok: false,

        error: error.message,
      };
    }
  }

  function validarCantidad(movimiento) {
    const cantidad = Number(movimiento.cantidad);

    if (!Number.isFinite(cantidad)) {
      throw new Error("Cantidad inválida.");
    }

    // [FASE 4] AJUSTE acepta positivo (sumar) o negativo (restar)
    if (movimiento.tipo === TIPOS.AJUSTE) {
      if (cantidad === 0) {
        throw new Error("La cantidad del ajuste no puede ser cero.");
      }

      return true;
    }

    if (cantidad <= 0) {
      throw new Error("La cantidad debe ser mayor a cero.");
    }

    return true;
  }

  function validarMovimiento(producto, movimiento) {
    if (!producto) {
      throw new Error("Producto no encontrado.");
    }

    if (!movimiento) {
      throw new Error("Movimiento inválido.");
    }

    validarCantidad(movimiento);

    const cantidad = Number(movimiento.cantidad);

    // [FASE 4] CANCELACION regresa stock, así que ya no se valida aquí
    // (antes cancelar la venta de la última pieza fallaba con "Stock insuficiente").
    switch (movimiento.tipo) {
      case TIPOS.SALIDA:

      case TIPOS.VENTA:

      case TIPOS.GARANTIA:
        if (Number(producto.stock || 0) < cantidad) {
          throw new Error(`Stock insuficiente. Disponible: ${producto.stock}`);
        }

        break;

      case TIPOS.AJUSTE:
        if (Number(producto.stock || 0) + cantidad < 0) {
          throw new Error(`Stock insuficiente. Disponible: ${producto.stock}`);
        }

        break;
    }

    return true;
  }

  function aplicarMovimiento(producto, movimiento) {
    const stockActual = Number(producto.stock || 0);

    let nuevoStock = stockActual;

    switch (movimiento.tipo) {
      case TIPOS.INVENTARIO_INICIAL:

      case TIPOS.ENTRADA:

      case TIPOS.COMPRA:

      case TIPOS.DEVOLUCION:
        nuevoStock += movimiento.cantidad;

        break;

      case TIPOS.SALIDA:

      case TIPOS.VENTA:

      case TIPOS.GARANTIA:
        nuevoStock -= movimiento.cantidad;

        break;

      case TIPOS.CANCELACION:
        nuevoStock += movimiento.cantidad;

        break;

      // [FASE 4] Ajuste manual: cantidad con signo
      case TIPOS.AJUSTE:
        nuevoStock += movimiento.cantidad;

        break;

      default:
        throw new Error("Tipo de movimiento no soportado.");
    }

    if (nuevoStock < 0) {
      throw new Error("Stock insuficiente.");
    }

    producto.stock = nuevoStock;

    return producto;
  }

  // [FASE 4] Verifica contra el SERVIDOR que haya stock para un conjunto de
  // líneas { productoId, cantidad } (suma cantidades del mismo producto).
  // Devuelve { ok: true } o { ok: false, producto, disponible, requerido }.
  async function verificarStock(lineas) {
    const requeridos = {};

    for (const l of lineas || []) {
      const local = obtenerProducto(l.productoId);

      if (!local || !local.id) {
        return {
          ok: false,
          producto: l.productoId,
          disponible: 0,
          requerido: Number(l.cantidad || 0),
        };
      }

      requeridos[local.id] = requeridos[local.id] || {
        nombre: local.nombre || local.sku,
        cantidad: 0,
      };

      requeridos[local.id].cantidad += Number(l.cantidad || 0);
    }

    for (const [id, req] of Object.entries(requeridos)) {
      const snap = await FB.db.collection("inventario").doc(id).get();

      const disponible = snap.exists ? Number(snap.data().stock || 0) : 0;

      if (disponible < req.cantidad) {
        return {
          ok: false,
          producto: req.nombre,
          disponible,
          requerido: req.cantidad,
        };
      }
    }

    return { ok: true };
  }

  // Se conserva por compatibilidad (ya no se usa dentro del motor: el
  // registro se guarda dentro de la transacción de movimiento()).
  async function registrarMovimiento(producto, movimiento, stockAnterior) {
    const registro = construirRegistro(
      await API.getFolio("MOV"),
      producto,
      movimiento,
      stockAnterior,
    );

    await DATA.save(COLECCION_MOVIMIENTOS, registro.id, registro);

    return registro;
  }

  async function entrada(data) {
    return movimiento({
      ...data,

      tipo: TIPOS.ENTRADA,
    });
  }

  async function salida(data) {
    return movimiento({
      ...data,

      tipo: TIPOS.SALIDA,
    });
  }

  async function compra(data) {
    return movimiento({
      ...data,

      tipo: TIPOS.COMPRA,
    });
  }

  async function venta(data) {
    return movimiento({
      ...data,

      tipo: TIPOS.VENTA,
    });
  }

  async function ajuste(data) {
    return movimiento({
      ...data,

      tipo: TIPOS.AJUSTE,
    });
  }

  async function devolucion(data) {
    return movimiento({
      ...data,

      tipo: TIPOS.DEVOLUCION,
    });
  }

  async function garantia(data) {
    return movimiento({
      ...data,

      tipo: TIPOS.GARANTIA,
    });
  }

  async function cancelacion(data) {
    return movimiento({
      ...data,

      tipo: TIPOS.CANCELACION,
    });
  }

  async function transferencia(data) {
    return movimiento({
      ...data,

      tipo: TIPOS.TRANSFERENCIA,
    });
  }

  return {
    TIPOS,

    obtenerProducto,

    movimiento,

    aplicarMovimiento,

    validarMovimiento,

    registrarMovimiento,

    verificarStock,

    entrada,

    salida,

    compra,

    venta,

    ajuste,

    devolucion,

    garantia,

    cancelacion,

    transferencia,
  };
})();

window.INVENTARIO_ENGINE = INVENTARIO_ENGINE;
