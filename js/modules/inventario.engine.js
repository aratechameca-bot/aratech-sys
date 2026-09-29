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

      const inventario = DB.get("inventario") || [];

      const index = inventario.findIndex(
        (p) => p.id === productoId || p.sku === productoId,
      );

      if (index < 0) {
        throw new Error("Producto no encontrado.");
      }

      const producto = inventario[index];

      const stockAnterior = Number(producto.stock || 0);

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

      validarMovimiento(
        producto,

        movimientoInfo,
      );

      aplicarMovimiento(
        producto,

        movimientoInfo,
      );

      producto.estado_inventario =
        producto.stock <= 0
          ? "AGOTADO"
          : producto.stock <= Number(producto.min || 0)
            ? "STOCK_BAJO"
            : "DISPONIBLE";

      producto.valor_inventario =
        Number(producto.stock || 0) * Number(producto.costo || 0);

      producto.valor_venta =
        Number(producto.stock || 0) * Number(producto.precio || 0);

      producto.utilidad_potencial =
        (Number(producto.precio || 0) - Number(producto.costo || 0)) *
        Number(producto.stock || 0);

      producto.margen_porcentaje =
        Number(producto.costo || 0) > 0
          ? Number(
              (
                ((Number(producto.precio) - Number(producto.costo)) /
                  Number(producto.costo)) *
                100
              ).toFixed(2),
            )
          : 0;

      producto.fecha_actualizacion = hoy();

      producto.hora_actualizacion = new Date().toLocaleTimeString("es-MX");

      producto.usuario_actualizacion = usuario;

      inventario[index] = producto;

      DB.set(
        "inventario",

        inventario,
      );

      await DATA.update(
        "inventario",

        producto.id,

        producto,
      );

      const registro = await registrarMovimiento(
        producto,

        movimientoInfo,

        stockAnterior,
      );

      return {
        ok: true,

        producto,

        movimiento: registro,
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

  function validarMovimiento(producto, movimiento) {
    if (!producto) {
      throw new Error("Producto no encontrado.");
    }

    if (!movimiento) {
      throw new Error("Movimiento inválido.");
    }

    const cantidad = Number(movimiento.cantidad);

    if (!Number.isFinite(cantidad)) {
      throw new Error("Cantidad inválida.");
    }

    if (cantidad <= 0) {
      throw new Error("La cantidad debe ser mayor a cero.");
    }

    switch (movimiento.tipo) {
      case TIPOS.SALIDA:

      case TIPOS.VENTA:

      case TIPOS.GARANTIA:

      case TIPOS.CANCELACION:
        if (Number(producto.stock || 0) < cantidad) {
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

      default:
        throw new Error("Tipo de movimiento no soportado.");
    }

    if (nuevoStock < 0) {
      throw new Error("Stock insuficiente.");
    }

    producto.stock = nuevoStock;

    return producto;
  }

  async function registrarMovimiento(producto, movimiento, stockAnterior) {
    const registro = {
      id: await API.getFolio("MOV"),

      producto_id: producto.id,

      sku: producto.sku,

      nombre: producto.nombre,

      tipo: movimiento.tipo,

      origen: movimiento.origen,

      modulo: movimiento.modulo || "INVENTARIO",

      documento: movimiento.documento || null,

      referencia: movimiento.referencia || null,

      cantidad: Number(movimiento.cantidad),

      stock_anterior: Number(stockAnterior),

      stock_nuevo: Number(producto.stock),

      costo: Number(producto.costo || 0),

      precio: Number(producto.precio || 0),

      valor_costo: Number(producto.costo || 0) * Number(movimiento.cantidad),

      valor_venta: Number(producto.precio || 0) * Number(movimiento.cantidad),

      utilidad:
        (Number(producto.precio || 0) - Number(producto.costo || 0)) *
        Number(movimiento.cantidad),

      usuario: movimiento.usuario,

      observaciones: movimiento.observaciones || "",

      fecha: hoy(),

      hora: new Date().toLocaleTimeString("es-MX"),
    };

    await DATA.save(
      "movimientos_inventario",

      registro.id,

      registro,
    );

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
