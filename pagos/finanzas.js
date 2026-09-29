// ============================================================
// ARATECH-SYS
// FINANZAS CORE
// ============================================================

window.FINANZAS = {
  async getSaldo(doc, tipo) {
    tipo = (tipo || "").toUpperCase();

    //====================================================
    // COMPRAS → LIBRO MAYOR (finanzas_movimientos)
    //====================================================

    if (tipo === "COMPRA") {
      const movimientos = await DATA.getAll("finanzas_movimientos");

      const historial = movimientos
        .filter(
          (m) =>
            m.origen_id === doc.id ||
            m.origen === doc.id ||
            m.documento === doc.id,
        )
        .sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0));

      const total = Number(
        doc.pago_total ??
          doc.total ??
          doc.total_final ??
          doc.total_general ??
          doc.subtotal ??
          0,
      );

      const descuento = Number(doc.pago_descuento || 0);

      const devoluciones = Number(doc.pago_devoluciones || 0);

      const totalFinanciero = Math.max(0, total - descuento);

      //=========================================
      // ESTADO FINANCIERO SEGÚN LA OC
      //=========================================

      const recibida =
        doc.estado === "Recibida completa" || doc.estado === "Recibida parcial";

      const pagado = recibida ? totalFinanciero : 0;

      const saldo = recibida ? 0 : totalFinanciero;

      return {
        documento: doc,

        tipo,

        total,

        descuento,

        devoluciones,

        totalFinanciero,

        pagado,

        saldo,

        liquidado: recibida,

        movimientos: historial.length,

        historial,

        primerPago: historial[0] || null,

        ultimoPago: historial.length ? historial[historial.length - 1] : null,
      };
    }

    //====================================================
    // VENTAS / ÓRDENES (Motor de Cobros)
    //====================================================

    const pagos = await DATA.getAll("pagos");

    const historial = pagos
      .filter((p) => p.origen === tipo && p.origen_id === doc.id)
      .sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0));

    const totalPagado = historial.reduce(
      (suma, pago) => suma + Number(pago.total_pagado || 0),
      0,
    );

    const total = Number(
      doc.total ?? doc.total_final ?? doc.total_general ?? doc.subtotal ?? 0,
    );

    const descuento = Number(doc.pago_descuento || 0);

    const devoluciones = Number(doc.pago_devoluciones || 0);

    const totalFinanciero = Math.max(0, total - descuento);

    const saldo = Math.max(0, totalFinanciero - totalPagado);

    return {
      documento: doc,

      tipo,

      total,

      descuento,

      devoluciones,

      totalFinanciero,

      pagado: totalPagado,

      saldo,

      liquidado: saldo <= 0,

      movimientos: historial.length,

      historial,

      primerPago: historial[0] || null,

      ultimoPago: historial.length ? historial[historial.length - 1] : null,
    };
  },

  async getResumen(doc, tipo) {
    return await this.getSaldo(doc, tipo);
  },

  async getDocumento(tipo, id) {
    switch (tipo.toUpperCase()) {
      case "ORDEN":
        return DB.get("ordenes").find((x) => x.id === id);

      case "VENTA":
        return DB.get("ventas").find((x) => x.id === id);

      case "COMPRA":
        return DB.get("ordenes_compra").find((x) => x.id === id);

      case "APARTADO":
        return DB.get("apartados")?.find((x) => x.id === id);

      case "CREDITO":
        return DB.get("creditos")?.find((x) => x.id === id);

      default:
        return null;
    }
  },

  async getResumenCliente(clienteId) {
    const ordenes = DB.get("ordenes").filter((o) => o.cliente_id === clienteId);

    const ventas = DB.get("ventas").filter((v) => v.cliente_id === clienteId);

    const documentos = [
      ...ordenes.map((o) => ({
        tipo: "ORDEN",
        documento: o,
      })),

      ...ventas.map((v) => ({
        tipo: "VENTA",
        documento: v,
      })),
    ];

    const resumenes = [];

    for (const item of documentos) {
      resumenes.push(await this.getResumen(item.documento, item.tipo));
    }

    return {
      cliente_id: clienteId,

      ordenes,

      ventas,

      documentos,

      resumenes,
    };
  },

  async getSaldoCliente(clienteId) {
    const data = await this.getResumenCliente(clienteId);

    const total = data.resumenes.reduce((s, r) => s + Number(r.total || 0), 0);

    const pagado = data.resumenes.reduce(
      (s, r) => s + Number(r.pagado || 0),
      0,
    );

    const saldo = data.resumenes.reduce((s, r) => s + Number(r.saldo || 0), 0);

    return {
      cliente_id: clienteId,

      total,

      pagado,

      saldo,

      documentos: data.resumenes.length,

      pendientes: data.resumenes.filter((r) => r.saldo > 0).length,

      liquidados: data.resumenes.filter((r) => r.saldo <= 0).length,

      resumenes: data.resumenes,
    };
  },

  async getDashboardCliente(clienteId) {
    const saldo = await this.getSaldoCliente(clienteId);

    return {
      cliente: saldo.cliente_id,

      total: saldo.total,

      pagado: saldo.pagado,

      saldo: saldo.saldo,

      documentos: saldo.documentos,

      pendientes: saldo.pendientes,

      liquidados: saldo.liquidados,

      lista: saldo.resumenes

        .map((r) => {
          return {
            tipo: r.tipo,

            id: r.documento.id,

            folio: r.documento.folio,

            fecha: r.documento.fecha,

            cliente: r.documento.cliente_nombre,

            total: r.total,

            pagado: r.pagado,

            saldo: r.saldo,

            estado: r.liquidado ? "LIQUIDADO" : "PENDIENTE",

            documento: r.documento,
          };
        })

        .sort((a, b) => {
          const fa = Number(a.documento.createdAt || 0);

          const fb = Number(b.documento.createdAt || 0);

          return fb - fa;
        }),
    };
  },

  async test(clienteId) {
    const saldo = await this.getSaldoCliente(clienteId);

    return saldo;
  },

  async buscarClientes(texto = "") {
    const filtro = texto.trim().toLowerCase();

    return DB.get("clientes")

      .filter((c) => {
        if (!c.nombre) return false;

        if (!filtro) return true;

        return (
          String(c.nombre || "")
            .toLowerCase()
            .includes(filtro) ||
          String(c.tel || "")
            .toLowerCase()
            .includes(filtro) ||
          String(c.id || "")
            .toLowerCase()
            .includes(filtro)
        );
      })

      .map((c) => ({
        id: c.id,

        nombre: c.nombre,

        telefono: c.tel,

        empresa: c.empresa || "",

        correo: c.correo || "",
      }))

      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  },

  async registrarMovimiento(data) {
    const id = await API.getFolio(FOLIOS.MOVIMIENTO_FINANCIERO);

    const ahora = new Date();

    const movimiento = {
      id,

      tipo: data.tipo || "EGRESO",

      modulo: data.modulo || "GENERAL",

      // ============================
      // CONTRATO FINANCIERO
      // ============================

      origen: data.origen || "",

      origen_id: data.origen_id || data.origen || "",

      documento: data.documento || data.origen || "",

      // ============================

      monto: Number(data.monto || 0),

      metodo: data.metodo || "",

      categoria: data.categoria || "",

      descripcion: data.descripcion || "",

      referencia: data.referencia || "",

      usuario: data.usuario || currentUser?.nombre || "Sistema",

      observaciones: data.observaciones || "",

      estado: data.estado || "ACTIVO",

      fecha: data.fecha || hoy(),

      hora: ahora.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      }),

      createdAt: Date.now(),
    };

    const lista = DB.get("finanzas_movimientos");

    lista.push(movimiento);

    DB.set("finanzas_movimientos", lista);

    await DATA.save("finanzas_movimientos", movimiento.id, movimiento);

    return movimiento;
  },

  async getMovimientos() {
    return DB.get("finanzas_movimientos")

      .slice()

      .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
  },

  async getResumenFinanciero() {
    const movimientos = await this.getMovimientos();

    const ingresos = movimientos
      .filter((m) => m.tipo === "INGRESO")
      .reduce((t, m) => t + Number(m.monto || 0), 0);

    const egresos = movimientos
      .filter((m) => m.tipo === "EGRESO")
      .reduce((t, m) => t + Math.abs(Number(m.monto || 0)), 0);

    return {
      ingresos,

      egresos,

      flujoNeto: ingresos - egresos,

      movimientos: movimientos.length,

      lista: movimientos,
    };
  },
};
