// ============================================================
// ARATECH-SYS
// GESTIÓN FINANCIERA
// ============================================================

window.GESTION = {
  async open(tipo, id) {
    this.tipo = tipo;
    this.id = id;

    const documento = await FINANZAS.getDocumento(tipo, id);

    if (!documento) {
      notify("Documento no encontrado.");
      return;
    }

    this.resumen = await FINANZAS.getResumen(documento, tipo);

    this.render();

    openM("modalGestion");
  },

  async recargarDocumento() {
    const documento = await FINANZAS.getDocumento(this.tipo, this.id);

    if (!documento) {
      notify("Documento no encontrado.");

      return false;
    }

    this.resumen = await FINANZAS.getResumen(documento, this.tipo);

    return true;
  },

  render() {
    const soloConsulta =
      this.resumen.documento.estado === "Cancelado" ||
      this.resumen.documento.estado === "CANCELADA";

    const liquidado =
      this.resumen.pago_estado === "LIQUIDADO" ||
      (this.resumen.saldo <= 0 && !soloConsulta);
    const esCompra = this.tipo.toUpperCase() === "COMPRA";

    document.getElementById("gestionContenido").innerHTML = `

    <div class="gestion-wrap">

        <!-- ========================= -->
        <!-- INFORMACIÓN -->
        <!-- ========================= -->

        <div class="gestion-card">

            <h3>Información Financiera</h3>

            <div class="gestion-grid">

               <strong>Documento</strong>
                <span>${this.resumen.documento.folio ?? this.resumen.documento.id}</span>

                <strong>${esCompra ? "Proveedor" : "Cliente"}</strong>

                <span>
                    ${
                      esCompra
                        ? this.resumen.documento.proveedorNombre
                        : this.resumen.documento.cliente_nombre
                    }
                </span>

                <strong>Estado</strong>

                <span>
                    ${
                      soloConsulta
                        ? '<i class="ar-icon error"></i> CANCELADO'
                        : this.resumen.liquidado
                          ? '<i class="ar-icon success"></i> LIQUIDADO'
                          : '<i class="ar-icon warning"></i> PENDIENTE'
                    }
                </span>

                <strong>Total</strong>
                <span>${mxn(this.resumen.total)}</span>

                <strong>Pagado</strong>
                <span>${mxn(this.resumen.pagado)}</span>

                <strong>Descuentos</strong>
                <span>${mxn(this.resumen.descuento)}</span>

                <strong>Devoluciones</strong>
                <span>${mxn(this.resumen.devoluciones)}</span>

                <strong>Saldo</strong>
                <span>${mxn(this.resumen.saldo)}</span>

            </div>

        </div>

        <!-- ========================= -->
        <!-- ACCIONES -->
        <!-- ========================= -->

        <div class="gestion-card">

            <h3>Acciones</h3>

            <div class="gestion-actions">

                ${
                  !soloConsulta && !liquidado
                    ? `
                          <button
                              class="btn bp"
                              onclick="GESTION.abrirMotorCobros()">

                              <i class="ar-icon tarjeta"></i> Motor de Cobros

                          </button>
                        `
                    : ""
                }

               <button
                    class="btn bg"
                    onclick="GESTION.abrirLibroMayor()">

                    <i class="ar-icon libro"></i> Libro Mayor

                </button>

                <button
                    class="btn bg"
                    onclick="GESTION.abrirEstadoCuenta()">

                    <i class="ar-icon estado_cuenta"></i> Estado de Cuenta

                </button>

                ${
                  !soloConsulta
                    ? `
                <button
                    class="btn bg"
                    onclick="GESTION.abrirDevolucion()">

                    <i class="ar-icon devolucion"></i> Registrar devolución

                </button>
                `
                    : ""
                }

                ${
                  !soloConsulta
                    ? `
                  <button
                      class="btn br"
                      onclick="GESTION.cancelarDocumento()">

                      <i class="ar-icon cancel"></i> Cancelar documento

                  </button>
                  `
                    : ""
                }

                <button
                    class="btn bg"
                    onclick="GESTION.reimprimirMovimiento()">

                    🖨 Reimprimir último movimiento

                </button>

            </div>

        </div>

        <!-- ========================= -->
        <!-- OBSERVACIONES -->
        <!-- ========================= -->

        <div class="gestion-card gestion-full">

            <h3>Observaciones financieras</h3>

            <div>

                Sin observaciones.

            </div>

        </div>

    </div>

    `;
    window.refreshIcons(document.getElementById("gestionContenido"));
  },

  abrirMotorCobros() {
    closeM("modalGestion");

    setTimeout(() => {
      PAGOS.open(this.tipo, this.id);
    }, 150);
  },

  async abrirLibroMayor() {
    openM("modalLibroMayor");

    const resumen = await FINANZAS.getResumen(
      this.resumen.documento,
      this.tipo,
    );

    const esCompra = this.tipo.toUpperCase() === "COMPRA";

    document.getElementById("libroMayorContenido").innerHTML = `

<table class="tbl">

    <thead>

        <tr>

            <th>Fecha</th>

            <th>Movimiento</th>

            <th>${esCompra ? "Categoría" : "Método"}</th>

            <th>${esCompra ? "Referencia" : "Descuento"}</th>

            <th>Importe</th>

            <th>Usuario</th>

        </tr>

    </thead>

    <tbody>

        ${
          resumen.historial.length
            ? resumen.historial
                .map(
                  (m) => `

                <tr>

                    <td>

                        ${fmt(m.fecha)}

                        <br>

                        <small>${m.hora || ""}</small>

                    </td>

                    <td>

                        ${
                          esCompra
                            ? m.descripcion || m.tipo || "-"
                            : m.tipo_movimiento === "DEVOLUCION"
                              ? '<i class="ar-icon devolucion"></i> Devolución'
                              : '<i class="ar-icon tarjeta"></i> Pago'
                        }

                    </td>

                    <td>

                        ${esCompra ? m.categoria || "-" : m.forma_pago || "-"}

                    </td>

                    <td>

                        ${
                          esCompra
                            ? m.referencia || "-"
                            : Number(m.descuento || 0) > 0
                              ? mxn(Number(m.descuento))
                              : "—"
                        }

                    </td>

                    <td

                        style="font-weight:700;color:${
                          esCompra
                            ? "#ff9800"
                            : Number(m.total_pagado) < 0
                              ? "#ff6b6b"
                              : "#4caf50"
                        }"

                    >

                        ${
                          esCompra
                            ? mxn(Number(m.monto || 0))
                            : mxn(Number(m.total_pagado || 0))
                        }

                    </td>

                    <td>

                        ${m.usuario || "-"}

                    </td>

                </tr>

            `,
                )
                .join("")
            : `



                <tr>

                    <td colspan="6" style="text-align:center;padding:30px">

                        Sin movimientos financieros.

                    </td>

                </tr>

            `
        }

    </tbody>

</table>

`;

    window.refreshIcons(document.getElementById("libroMayorContenido"));
  },
  abrirEstadoCuenta() {
    closeM("modalGestion");

    setTimeout(() => {
      ESTADO.open(this.tipo, this.id);
    }, 150);
  },

  async abrirDevolucion() {
    closeM("modalGestion");

    await PAGOS.open(this.tipo, this.id);

    PAGOS.devolver();
  },

  async reimprimirMovimiento() {
    const resumen = await FINANZAS.getResumen(
      this.resumen.documento,
      this.tipo,
    );

    if (!resumen.ultimoPago) {
      notify("No existen movimientos para reimprimir.");

      return;
    }

    closeM("modalGestion");

    await PAGOS.cargar(this.tipo, this.id);

    PAGOS.imprimir(
      document.getElementById("pagFormato")?.value || "carta",
      resumen.ultimoPago.id,
    );
  },

  async cancelarDocumento() {
    const resumen = await FINANZAS.getResumen(
      this.resumen.documento,
      this.tipo,
    );

    const actualizado = await this.recargarDocumento();

    if (!actualizado) return;

    const estadoActual = this.resumen.documento.estado;

    if (estadoActual === "Cancelado" || estadoActual === "CANCELADA") {
      notify("El documento ya fue cancelado.");

      closeM("modalGestion");

      return;
    }

    const motivo = await ARABOT.reason({
      title: "Cancelar documento",

      message:
        "Seleccione el motivo de la cancelación del documento " +
        resumen.documento.folio +
        ".",

      details:
        "Esta información quedará registrada en la bitácora del documento.",

      reasons: [
        "Error de captura",
        "Solicitud del cliente",
        "Documento duplicado",
        "Error administrativo",
        "Otro",
      ],
    });

    if (!motivo) {
      return;
    }

    ARABOT.loading({
      title: "Cancelando documento",

      details:
        "Estamos procesando la cancelación, devolviendo movimientos financieros, restaurando inventario y actualizando la información. Por favor espera...",
    });

    if (this.resumen.pagado > 0) {
      return this.cancelarConPagos(this.resumen, motivo);
    }

    return this.cancelarSinPagos(this.resumen, motivo);
  },

  async cancelarSinPagos(resumen, motivo) {
    console.log("Motivo:", motivo);
    await this.marcarDocumentoCancelado(resumen.documento, motivo);

    if (this.tipo.toUpperCase() === "ORDEN") {
      await cancelarGarantiasOrden(resumen.documento.folio);
    }

    if (this.tipo.toUpperCase() === "VENTA") {
      await restaurarInventarioVenta(resumen.documento);

      await cancelarGarantiasVenta(resumen.documento.folio);

      await desvincularOrdenVenta(resumen.documento);

      await desvincularTicketVenta(resumen.documento);
    }

    await this.registrarCancelacion(resumen.documento, motivo);

    this.finalizarCancelacion();
  },
  async cancelarConPagos(resumen, motivo) {
    console.log("Motivo:", motivo);
    try {
      // ==========================================
      // DEVOLUCIÓN FINANCIERA
      // ==========================================

      await this.ejecutarDevolucionAutomatica(resumen);

      // ==========================================
      // SOLO PARA VENTAS
      // ==========================================

      if (this.tipo.toUpperCase() === "VENTA") {
        await restaurarInventarioVenta(resumen.documento);

        await cancelarGarantiasVenta(resumen.documento.folio);

        await desvincularOrdenVenta(resumen.documento);

        await desvincularTicketVenta(resumen.documento);
      }

      if (this.tipo.toUpperCase() === "ORDEN") {
        await cancelarGarantiasOrden(resumen.documento.folio);
      }

      // ==========================================
      // CANCELAR DOCUMENTO
      // ==========================================

      await this.marcarDocumentoCancelado(resumen.documento, motivo);

      await this.registrarCancelacion(resumen.documento, motivo);

      this.finalizarCancelacion();
    } catch (err) {
      console.error(err);

      ARABOT.closeLoading?.();

      notify("No fue posible cancelar el documento.");
    }
  },

  async ejecutarDevolucionAutomatica(resumen) {
    await PAGOS.registrarMovimientoDevolucion({
      documento: resumen.documento,

      tipo: this.tipo,

      importe: resumen.pagado,

      motivo: "Cancelación del documento",

      observaciones: "Devolución automática generada por Gestión Financiera.",

      usuario: currentUser?.nombre || "Sistema",

      total: resumen.total,

      saldo: resumen.saldo,
    });
  },

  async registrarCancelacion(documento, motivo) {
    let descripcion = "Cancelado por " + (currentUser?.nombre || "Sistema");

    if (motivo?.motivo) {
      descripcion += "\n\nMotivo:\n" + motivo.motivo;
    }

    if (motivo?.detalle) {
      descripcion += "\n\nDetalle:\n" + motivo.detalle;
    }

    bitacora(documento.folio, "Documento cancelado", descripcion);
  },

  finalizarCancelacion() {
    ARABOT.closeLoading?.();

    closeM("modalGestion");

    dash?.();

    rndOrd?.();

    rndVta?.();

    rndOC?.();

    rndGar?.();

    notify("Documento cancelado correctamente.");
  },

  async marcarDocumentoCancelado(documento, motivo) {
    const datos = {};

    datos.cancelacion = {
      motivo: motivo?.motivo || "",

      detalle: motivo?.detalle || "",

      usuario: currentUser?.nombre || "",

      fecha: hoy(),

      hora: new Date().toLocaleTimeString("es-MX"),
    };

    if (this.tipo.toUpperCase() === "ORDEN") {
      datos.estado = "Cancelado";

      datos.pago_estado = "CANCELADO";

      await DATA.update("ordenes", documento.id, datos);
    } else if (this.tipo.toUpperCase() === "VENTA") {
      datos.estado = "CANCELADA";

      datos.pago_estado = "CANCELADO";

      await DATA.update("ventas", documento.id, datos);
    } else if (this.tipo.toUpperCase() === "COMPRA") {
      datos.estado = "Cancelada";

      datos.pago_estado = "CANCELADO";

      await DATA.update("ordenes_compra", documento.id, datos);
    }

    Object.assign(documento, datos);
  },
};
