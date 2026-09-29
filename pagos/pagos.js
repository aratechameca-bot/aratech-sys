// ============================================================
// ARATECH-SYS
// MÓDULO: PAGOS
// Motor de Cobros
// ============================================================

window.PAGOS = {
  async cargar(tipo, id) {
    this.tipo = tipo;
    this.id = id;

    const doc = await FINANZAS.getDocumento(tipo, id);

    if (!doc) {
      notify("Documento no encontrado");
      return false;
    }

    this.doc = doc;

    // Obtener pagos desde la capa de datos (Firestore)
    const pagos = await DATA.getAll("pagos");

    this.historial = pagos.filter((p) => {
      return (
        p.origen_id === doc.id && p.origen?.toUpperCase() === tipo.toUpperCase()
      );
    });

    // ==========================
    // CONTRATO FINANCIERO
    // ==========================

    this.total = Number(
      doc.pago_total ??
        doc.total ??
        doc.total_final ??
        doc.total_general ??
        doc.subtotal ??
        0,
    );

    this.pagado = Number(doc.pago_pagado ?? 0);

    this.descuento = Number(doc.pago_descuento ?? 0);

    this.devoluciones = Number(doc.pago_devoluciones ?? 0);

    this.saldo = Number(doc.pago_saldo ?? 0);

    return true;
  },

  async open(tipo, id) {
    const ok = await this.cargar(tipo, id);

    if (!ok) {
      return;
    }

    // Abrir modal únicamente cuando se use el Motor de Cobros
    this.render();
  },

  render() {
    openM("modalPago");

    // ==========================
    // RESUMEN
    // ==========================

    document.getElementById("pag-cliente").textContent =
      this.doc.cliente_nombre || "-";

    document.getElementById("pag-documento").textContent =
      this.doc.folio || this.doc.id;

    document.getElementById("pag-estado").textContent = this.doc.estado || "-";

    document.getElementById("pag-total").textContent = PAGOS_HELPERS.money(
      this.total,
    );

    document.getElementById("pag-pagado").textContent = PAGOS_HELPERS.money(
      this.pagado,
    );

    document.getElementById("pag-saldo").textContent = PAGOS_HELPERS.money(
      this.saldo,
    );

    const inpDesc = document.getElementById("pagDescuento");

    const selMotivo = document.getElementById("pagMotivoDescuento");

    inpDesc.value = this.doc?.pago_descuento || "";

    selMotivo.value = this.doc?.pago_motivo_descuento || "";

    const descuentoAplicado = Number(this.doc?.pago_descuento || 0) > 0;

    inpDesc.disabled = descuentoAplicado;
    selMotivo.disabled = descuentoAplicado;

    inpDesc.oninput = () => {
      const descuento = Number(inpDesc.value || 0);

      selMotivo.required = descuento > 0;

      if (descuento <= 0) {
        selMotivo.value = "";
      }

      const saldoVista = Math.max(0, this.saldo - descuento);

      document.getElementById("pag-saldo").textContent =
        PAGOS_HELPERS.money(saldoVista);
    };

    // ==========================
    // COLOR DEL SALDO
    // ==========================

    const saldoBox = document.getElementById("pag-saldo");

    saldoBox.classList.remove("ok", "warning", "danger");

    if (this.saldo <= 0) {
      saldoBox.classList.add("ok");
    } else {
      saldoBox.classList.add("danger");
    }

    // ==========================
    // HISTORIAL DE MOVIMIENTOS
    // ==========================
    const historial = [...this.historial].sort(
      (a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0),
    );

    if (!historial.length) {
      document.getElementById("pagHistorial").innerHTML = `
                <div class="empty">
                    Aún no existen pagos registrados.
                </div>
            `;
    } else {
      document.getElementById("pagHistorial").innerHTML = historial
        .map((p) => {
          const esDevolucion = p.tipo_movimiento === "DEVOLUCION";

          return `

            <div class="pag-history-item">

                <div>

                    <strong>

                         ${
                           esDevolucion
                             ? '<i class="ar-icon devolucion"></i> DEVOLUCIÓN DE PAGO'
                             : p.forma_pago || "-"
                         }

                    </strong><br>

                    <small>${fmt(p.fecha)}</small>

                    ${
                      esDevolucion && p.motivo_devolucion
                        ? `<br><small style="color:#ff8a65">${p.motivo_devolucion}</small>`
                        : ""
                    }

                    ${
                      Number(p.descuento || 0) > 0
                        ? `<br><small style="color:#ffc107"><i class="ar-icon descuento"></i> Descuento: ${PAGOS_HELPERS.money(p.descuento)}</small>`
                        : ""
                    }

                </div>

                <div style="text-align:right">

                    <strong style="color:${esDevolucion ? "#ff5252" : "#4caf50"}">

                        ${PAGOS_HELPERS.money(Number(p.total_pagado || 0))}

                    </strong>

                    <div style="margin-top:6px;display:flex;gap:4px;justify-content:flex-end">

                        <button
                            class="btn bg bsm"
                            onclick="PAGOS.imprimir('58','${p.id}')"
                            title="Reimprimir ticket 58 mm">
                            58
                        </button>

                        <button
                            class="btn bg bsm"
                            onclick="PAGOS.imprimir('80','${p.id}')"
                            title="Reimprimir ticket 80 mm">
                            80
                        </button>

                        <button
                            class="btn bg bsm"
                            onclick="PAGOS.imprimir('carta','${p.id}')"
                            title="Estado de Cuenta">

                            <i class="ar-icon estado_cuenta"></i>

                        </button>

                    </div>

                </div>

            </div>

        `;
        })
        .join("");
      window.refreshIcons(document.getElementById("pagHistorial"));
    }

    document.getElementById("btnSaldoCompleto").onclick = () => {
      if (this.saldo <= 0) {
        notify("✅ El documento ya se encuentra liquidado.");

        return;
      }

      document.getElementById("pagImporte").value = Number(this.saldo).toFixed(
        2,
      );
    };
    if (!this.metodo) {
      this.metodo = "EFECTIVO";
    }

    this.renderMetodo();

    document.querySelectorAll(".pag-btn").forEach((btn) => {
      btn.onclick = () => {
        document
          .querySelectorAll(".pag-btn")
          .forEach((b) => b.classList.remove("active"));

        btn.classList.add("active");

        this.metodo = btn.dataset.metodo;

        this.renderMetodo();
      };
    });

    // ==========================
    // BOTÓN GUARDAR PAGO
    // ==========================

    document.getElementById("btnGuardarPago").onclick = () => {
      this.cobrar();
    };

    // ==========================
    // BOTÓN REGISTRAR DEVOLUCIÓN
    // ==========================

    const btnDevolver = document.getElementById("btnDevolver");

    btnDevolver.style.display = this.pagado > 0 ? "" : "none";

    btnDevolver.onclick = () => {
      this.devolver();
    };

    // ==========================
    // BOTÓN GUARDAR E IMPRIMIR
    // ==========================

    document.getElementById("btnGuardarImprimir").onclick = () => {
      this.cobrar(true);
    };

    // ==========================
    // LIMPIAR IMPORTE Y ENFOCAR
    // ==========================

    const inputImporte = document.getElementById("pagImporte");

    inputImporte.value = "";

    inputImporte.focus();

    inputImporte.select();
  },

  renderMetodo() {
    const panel = document.getElementById("pag-panel");

    panel.innerHTML = "";

    switch (this.metodo) {
      case "EFECTIVO":
        panel.innerHTML = `

                    <div class="pag-efectivo">

                        <label>Recibe</label>

                        <input
                            id="pagRecibe"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                        >

                        <div class="pag-cambio">

                            <span>Cambio</span>

                            <strong id="pagCambio">

                                ${PAGOS_HELPERS.money(0)}

                            </strong>

                        </div>

                    </div>

                `;

        const recibe = document.getElementById("pagRecibe");

        recibe.value = "";
        recibe.placeholder = "0.00";

        document.getElementById("pagImporte").focus();
        document.getElementById("pagImporte").select();

        recibe.oninput = () => {
          const importe = Number(
            document.getElementById("pagImporte").value || 0,
          );

          const recibido = Number(recibe.value || 0);

          const cambio = Math.max(0, recibido - importe);

          document.getElementById("pagCambio").textContent =
            PAGOS_HELPERS.money(cambio);
        };

        const importe = document.getElementById("pagImporte");

        importe.oninput = () => {
          recibe.oninput();
        };

        break;

      case "TARJETA":
        panel.innerHTML = `

                            <div class="pag-tarjeta">

                                <div class="pag-info-card">

                                    <h4>💳 Pago con Tarjeta</h4>

                                    <p>
                                        Confirme que la terminal autorizó correctamente el pago.
                                    </p>

                                </div>

                                <label>

                                    <input
                                        id="pagTarjetaOk"
                                        type="checkbox"
                                    >

                                    Pago autorizado por la terminal bancaria.

                                </label>

                                <label>

                                    Referencia / Autorización

                                </label>

                                <input
                                    id="pagReferenciaTarjeta"
                                    type="text"
                                    maxlength="60"
                                    placeholder="No. autorización, referencia..."
                                >

                            </div>
                        `;

        break;

      case "TRANSFERENCIA":
        panel.innerHTML = `

                            <div class="pag-transfer">

                                <div class="pag-info-card">

                                    <h4>🏦 Transferencia</h4>

                                    <p>

                                        Antes de guardar el pago confirme que el SPEI ya aparece
                                        en la banca electrónica.

                                    </p>

                                </div>

                                <label>

                                    <input
                                        id="pagSpeiOk"
                                        type="checkbox"
                                    >

                                    Confirmo que el SPEI fue recibido.

                                </label>

                                <label>

                                    Folio SPEI / Referencia

                                </label>

                                <input
                                    id="pagReferenciaSpei"
                                    type="text"
                                    maxlength="60"
                                    placeholder="Folio SPEI..."
                                >

                            </div>

                        `;

        break;

      case "MIXTO":
        panel.innerHTML = `



                            <div class="pag-mixto">

                                <label>Efectivo</label>

                                <input
                                    id="mixEfectivo"
                                    type="number"
                                    value="0"
                                >

                                <label>Tarjeta</label>

                                <input
                                    id="mixTarjeta"
                                    type="number"
                                    value="0"
                                >

                                <label>Transferencia</label>

                                <input
                                    id="mixTransfer"
                                    type="number"
                                    value="0"
                                >

                                <div id="mixValidaciones"></div>

                                <div id="mixReferencias"></div>
                            

                                <hr>

                                <div class="pag-cambio">

                                    <span>Total capturado</span>

                                    <strong id="mixTotal">

                                        ${PAGOS_HELPERS.money(0)}

                                    </strong>

                                </div>

                                <div class="pag-cambio">

                                    <span>Restante</span>

                                    <strong id="mixRestante">

                                        ${PAGOS_HELPERS.money(this.saldo)}

                                    </strong>

                                </div>

                            </div>

                        `;

        const efectivo = document.getElementById("mixEfectivo");
        const tarjeta = document.getElementById("mixTarjeta");
        const transferencia = document.getElementById("mixTransfer");

        const actualizar = () => {
          const e = Number(efectivo.value || 0);
          const t = Number(tarjeta.value || 0);
          const tr = Number(transferencia.value || 0);

          const total = e + t + tr;

          const restante = Math.max(0, this.saldo - total);

          document.getElementById("mixTotal").textContent =
            PAGOS_HELPERS.money(total);

          document.getElementById("mixRestante").textContent =
            PAGOS_HELPERS.money(restante);

          // ==============================
          // VALIDACIONES DINÁMICAS
          // ==============================

          const validaciones = document.getElementById("mixValidaciones");
          const referencias = document.getElementById("mixReferencias");

          let htmlRefs = "";

          let html = "";

          if (t > 0) {
            html += `
              <label>
                <input
                  id="mixTarjetaOk"
                  type="checkbox"
                >
                Confirmo que la terminal autorizó el pago.
              </label>
            `;
          }

          if (t > 0) {
            htmlRefs += `
        <label>

            Referencia Tarjeta

        </label>

        <input
            id="mixReferenciaTarjeta"
            type="text"
            maxlength="60"
            placeholder="Autorización..."
        >
    `;
          }

          if (tr > 0) {
            html += `
              <label>
                <input
                  id="mixSpeiOk"
                  type="checkbox"
                >
                Confirmo que el SPEI fue recibido.
              </label>
            `;
          }

          if (tr > 0) {
            htmlRefs += `
        <label>

            Referencia SPEI

        </label>

        <input
            id="mixReferenciaSpei"
            type="text"
            maxlength="60"
            placeholder="Folio SPEI..."
        >
    `;
          }

          validaciones.innerHTML = html;
          referencias.innerHTML = htmlRefs;
        };

        efectivo.oninput = actualizar;
        tarjeta.oninput = actualizar;
        transferencia.oninput = actualizar;

        document.getElementById("pagImporte").oninput = actualizar;

        actualizar();

        break;
    }
  },

  async cobrar(imprimir = false) {
    const importe = Number(document.getElementById("pagImporte").value || 0);

    if (importe > this.saldo) {
      notify("El importe no puede ser mayor al saldo.");
      return;
    }

    if (importe <= 0) {
      notify("Ingrese un importe válido.");
      return;
    }

    // Leer una sola vez el efectivo recibido
    const recibido = Number(
      document.getElementById("pagRecibe")?.value || importe,
    );

    // Validar únicamente cuando el método sea efectivo
    if (this.metodo === "EFECTIVO" && recibido < importe) {
      notify("El efectivo recibido es insuficiente.");
      return;
    }

    // ============================
    // VALIDAR TARJETA
    // ============================

    if (this.metodo === "TARJETA") {
      const tarjetaOk = document.getElementById("pagTarjetaOk")?.checked;

      if (!tarjetaOk) {
        notify("Debe confirmar que la terminal autorizó el pago.");
        return;
      }

      const referenciaTarjeta =
        document.getElementById("pagReferenciaTarjeta")?.value.trim() || "";

      if (!referenciaTarjeta) {
        notify("Capture la referencia de autorización.");

        return;
      }
    }
    // ============================
    // VALIDAR TRANSFERENCIA
    // ============================

    if (this.metodo === "TRANSFERENCIA") {
      const speiOk = document.getElementById("pagSpeiOk")?.checked;

      if (!speiOk) {
        notify("Debe confirmar que el SPEI fue recibido.");
        return;
      }

      const referenciaSpei =
        document.getElementById("pagReferenciaSpei")?.value.trim() || "";

      if (!referenciaSpei) {
        notify("Capture el folio SPEI.");

        return;
      }
    }

    // ============================
    // VALIDAR PAGO MIXTO
    // ============================

    if (this.metodo === "MIXTO") {
      const efectivo = Number(
        document.getElementById("mixEfectivo")?.value || 0,
      );

      const tarjeta = Number(document.getElementById("mixTarjeta")?.value || 0);

      const transferencia = Number(
        document.getElementById("mixTransfer")?.value || 0,
      );

      const totalCapturado = efectivo + tarjeta + transferencia;

      if (Math.abs(totalCapturado - importe) > 0.009) {
        notify("El total capturado debe coincidir con el importe a cobrar.");

        return;
      }

      // ============================
      // VALIDAR TARJETA EN MIXTO
      // ============================

      if (tarjeta > 0) {
        const tarjetaOk = document.getElementById("mixTarjetaOk")?.checked;

        if (!tarjetaOk) {
          notify("Debe confirmar que la terminal autorizó el pago.");

          return;
        }
      }

      // ============================
      // VALIDAR SPEI EN MIXTO
      // ============================

      if (transferencia > 0) {
        const speiOk = document.getElementById("mixSpeiOk")?.checked;

        if (!speiOk) {
          notify("Debe confirmar que el SPEI fue recibido.");

          return;
        }
      }

      if (tarjeta > 0) {
        const refTarjeta =
          document.getElementById("mixReferenciaTarjeta")?.value.trim() || "";

        if (!refTarjeta) {
          notify("Capture la referencia de la tarjeta.");

          return;
        }
      }

      if (transferencia > 0) {
        const refSpei =
          document.getElementById("mixReferenciaSpei")?.value.trim() || "";

        if (!refSpei) {
          notify("Capture el folio SPEI.");

          return;
        }
      }
    }

    const descuento = Number(
      document.getElementById("pagDescuento")?.value || 0,
    );

    const motivoDescuento =
      document.getElementById("pagMotivoDescuento")?.value || "";

    const yaTieneDescuento = Number(this.doc?.pago_descuento || 0) > 0;

    if (descuento > 0 && !motivoDescuento) {
      notify("Seleccione el motivo del descuento.");

      return;
    }

    const folio = await API.getFolio("ARPAG");

    const cambio =
      this.metodo === "EFECTIVO" ? Math.max(0, recibido - importe) : 0;

    let efectivo = 0;
    let tarjeta = 0;
    let transferencia = 0;
    let referencia = "";

    if (this.metodo === "EFECTIVO") {
      efectivo = importe;
    }

    if (this.metodo === "TARJETA") {
      tarjeta = importe;

      referencia =
        document.getElementById("pagReferenciaTarjeta")?.value.trim() || "";
    }

    if (this.metodo === "TRANSFERENCIA") {
      transferencia = importe;

      referencia =
        document.getElementById("pagReferenciaSpei")?.value.trim() || "";
    }

    if (this.metodo === "MIXTO") {
      efectivo = Number(document.getElementById("mixEfectivo")?.value || 0);

      tarjeta = Number(document.getElementById("mixTarjeta")?.value || 0);

      transferencia = Number(
        document.getElementById("mixTransfer")?.value || 0,
      );

      const refTarjeta =
        document.getElementById("mixReferenciaTarjeta")?.value.trim() || "";

      const refSpei =
        document.getElementById("mixReferenciaSpei")?.value.trim() || "";

      const refs = [];

      if (refTarjeta) {
        refs.push(`TARJETA: ${refTarjeta}`);
      }

      if (refSpei) {
        refs.push(`SPEI: ${refSpei}`);
      }

      referencia = refs.join(" | ");
    }

    const pago = {
      id: folio,

      folio: folio,

      fecha: hoy(),

      hora: new Date().toLocaleTimeString(),

      cliente_id: this.doc.cliente_id,

      cliente_nombre: this.doc.cliente_nombre,

      origen: this.tipo.toUpperCase(),

      origen_id: this.doc.id,

      origen_folio: this.doc.folio,

      total_documento: this.total,

      total_pagado: importe,

      descuento: yaTieneDescuento ? 0 : descuento,

      motivo_descuento: yaTieneDescuento ? "" : motivoDescuento,

      descuento_info: yaTieneDescuento
        ? null
        : {
            usuario: currentUser?.nombre || "",
            fecha: hoy(),
            hora: new Date().toLocaleTimeString("es-MX"),
            motivo: motivoDescuento,
            importe: descuento,
          },

      total_documento: this.total,

      total_cobrado: importe + descuento,

      saldo_anterior: this.saldo,

      saldo_nuevo: this.saldo - importe - (descuento || 0),

      forma_pago: this.metodo,

      efectivo: efectivo,

      tarjeta: tarjeta,

      transferencia: transferencia,

      cambio: cambio,

      referencia: referencia,

      usuario: currentUser?.nombre || "",

      observaciones:
        document.getElementById("pag-observaciones")?.value.trim() || "",

      estado: "APLICADO",

      estado: "APLICADO",

      createdAt: Date.now(),

      updatedAt: Date.now(),
    };

    await DATA.save("pagos", pago.id, pago);

    // Recalcular usando el Libro Mayor
    const pagos = await DATA.getAll("pagos");

    const historial = pagos.filter(
      (p) =>
        p.origen === this.tipo.toUpperCase() && p.origen_id === this.doc.id,
    );

    const nuevoPagado = historial.reduce(
      (s, p) => s + Number(p.total_pagado || 0),
      0,
    );

    const descuentoAplicado = historial.reduce(
      (s, p) => s + Number(p.descuento || 0),
      0,
    );

    const totalFinanciero = Math.max(0, this.total - descuentoAplicado);

    const saldoNuevo = Math.max(0, totalFinanciero - nuevoPagado);
    // ==========================
    // ACTUALIZAR DOCUMENTO ORIGEN
    // ==========================

    const coleccion =
      this.tipo.toUpperCase() === "VENTA" ? "ventas" : "ordenes";

    await DATA.update(coleccion, this.doc.id, {
      pago_pagado: nuevoPagado,
      pago_saldo: saldoNuevo,
      pago_estado: saldoNuevo <= 0 ? "LIQUIDADO" : "PENDIENTE",
      pago_descuento: descuento,
      pago_motivo_descuento: motivoDescuento,
    });

    this.doc.pago_pagado = nuevoPagado;
    this.doc.pago_saldo = saldoNuevo;
    this.doc.pago_estado = saldoNuevo <= 0 ? "LIQUIDADO" : "PENDIENTE";

    notify("✅ Pago registrado correctamente.");

    // ==========================
    // IMPRIMIR SI FUE SOLICITADO
    // ==========================

    if (imprimir) {
      const formato = document.getElementById("pagFormato")?.value || "carta";

      await this.imprimir(formato, pago.id);
    }

    this.pagado = nuevoPagado;
    this.saldo = saldoNuevo;

    rndOrd();

    dash();

    this.cancelar();
  },

  async devolver() {
    if (this.pagado <= 0) {
      notify("No existen pagos para devolver.");

      return;
    }

    document.getElementById("devImporte").value = this.pagado.toFixed(2);

    document.getElementById("devMotivo").value = "";

    document.getElementById("devObservaciones").value = "";

    openM("modalDevolucion");

    document.getElementById("btnConfirmarDevolucion").onclick = () => {
      this.confirmarDevolucion();
    };
  },

  async registrarMovimientoDevolucion({
    documento,

    tipo,

    importe,

    motivo,

    observaciones,

    usuario,

    total,

    saldo,
  }) {
    const folio = await API.getFolio("ARPAG");

    const devolucion = {
      id: folio,

      folio,

      tipo_movimiento: "DEVOLUCION",

      fecha: hoy(),

      hora: new Date().toLocaleTimeString(),

      cliente_id: documento.cliente_id,

      cliente_nombre: documento.cliente_nombre,

      origen: tipo.toUpperCase(),

      origen_id: documento.id,

      origen_folio: documento.folio,

      total_documento: total,

      total_pagado: -importe,

      descuento: 0,

      total_cobrado: -importe,

      saldo_anterior: saldo,

      saldo_nuevo: saldo + importe,

      forma_pago: "DEVOLUCION",

      efectivo: 0,

      tarjeta: 0,

      transferencia: 0,

      cambio: 0,

      referencia: "",

      usuario,

      observaciones,

      motivo_devolucion: motivo,

      estado: "APLICADO",

      createdAt: Date.now(),

      updatedAt: Date.now(),
    };

    await DATA.save("pagos", devolucion.id, devolucion);

    // ==========================================
    // RECALCULAR LIBRO MAYOR
    // ==========================================

    const pagos = await DATA.getAll("pagos");

    const historial = pagos.filter(
      (p) => p.origen === tipo.toUpperCase() && p.origen_id === documento.id,
    );

    const nuevoPagado = historial.reduce(
      (suma, mov) => suma + Number(mov.total_pagado || 0),
      0,
    );

    const nuevoSaldo = Math.max(0, total - nuevoPagado);

    const coleccion = tipo.toUpperCase() === "VENTA" ? "ventas" : "ordenes";

    const totalDevoluciones = historial.reduce(
      (suma, mov) =>
        suma +
        (mov.tipo_movimiento === "DEVOLUCION"
          ? Math.abs(Number(mov.total_pagado || 0))
          : 0),
      0,
    );

    await DATA.update(coleccion, documento.id, {
      pago_pagado: Math.max(0, nuevoPagado),

      pago_devoluciones: totalDevoluciones,

      pago_saldo: nuevoSaldo,

      pago_estado: nuevoSaldo <= 0 ? "LIQUIDADO" : "PENDIENTE",
    });

    Object.assign(documento, {
      pago_pagado: Math.max(0, nuevoPagado),

      pago_devoluciones: totalDevoluciones,

      pago_saldo: nuevoSaldo,

      pago_estado: nuevoSaldo <= 0 ? "LIQUIDADO" : "PENDIENTE",
    });

    return {
      movimiento: devolucion,

      documento,

      historial,

      pagado: Math.max(0, nuevoPagado),

      saldo: nuevoSaldo,

      devoluciones: totalDevoluciones,
    };
  },

  async confirmarDevolucion() {
    const importe = Number(document.getElementById("devImporte").value || 0);

    const motivo = document.getElementById("devMotivo").value.trim();

    const observaciones = document
      .getElementById("devObservaciones")
      .value.trim();

    if (importe <= 0) {
      notify("Capture un importe válido.");

      return;
    }

    if (importe > this.pagado) {
      notify("El importe excede el total pagado.");

      return;
    }

    if (!motivo) {
      notify("Seleccione un motivo.");

      return;
    }

    const ok = await ARABOT.confirm({
      title: "Registrar devolución",

      message: "¿Deseas registrar esta devolución?",

      details:
        "Se generará un movimiento financiero por $" +
        importe.toFixed(2) +
        " y el saldo del documento será actualizado.",
    });

    if (!ok) {
      return;
    }

    await this.registrarMovimientoDevolucion({
      documento: this.doc,

      tipo: this.tipo,

      importe,

      motivo,

      observaciones,

      usuario: currentUser?.nombre || "",

      total: this.total,

      saldo: this.saldo,
    });

    notify("Devolución registrada correctamente.");

    closeM("modalDevolucion");

    closeM("modalPago");

    await dash();

    rndOrd?.();

    rndVta?.();
  },

  calcularCambio() {
    if (this.metodo !== "EFECTIVO") return;

    const importe = Number(document.getElementById("pagImporte")?.value || 0);

    const recibido = Number(document.getElementById("pagRecibe")?.value || 0);

    const cambio = Math.max(0, recibido - importe);

    const lbl = document.getElementById("pagCambio");

    if (lbl) {
      lbl.textContent = mxn(cambio);
    }
  },

  cancelar() {
    closeM("modalPago");

    this.doc = null;

    this.historial = [];

    this.pagado = 0;

    this.saldo = 0;
  },

  calcularMixto() {},

  async imprimir(formato = "80", movimientoId = null) {
    const data = await FINANZAS.getResumen(this.doc, this.tipo);

    if (movimientoId) {
      data.movimientoActual =
        data.historial.find((p) => p.id === movimientoId) || null;
    } else {
      data.movimientoActual = data.ultimoPago;
    }

    switch (formato) {
      case "58":
        return window.printARPAG58(data);

      case "80":
        return window.printARPAG80(data);

      case "carta":
        return window.printEstadoCuenta(data);

      default:
        throw new Error("Formato de impresión no soportado.");
    }
  },
};
