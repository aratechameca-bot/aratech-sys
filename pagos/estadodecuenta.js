// ============================================================
// ARATECH-SYS
// ESTADO DE CUENTA
// ============================================================

window.ESTADO = {
  async open(tipo, id) {
    const doc = await FINANZAS.getDocumento(tipo, id);

    if (!doc) {
      notify("Documento no encontrado.");

      return;
    }

    const data = await FINANZAS.getSaldo(doc, tipo);

    await window.printEstadoCuenta(data);
  },

  async openCliente(clienteId) {
    const data = await FINANZAS.getDashboardCliente(clienteId);

    let html = `

        <div class="pf-dashboard">

            <h2>Portal Financiero</h2>

            <div class="pf-cards">

                <div class="pf-card">
                    <span>Total</span>
                    <strong>${mxn(data.total)}</strong>
                </div>

                <div class="pf-card">
                    <span>Pagado</span>
                    <strong>${mxn(data.pagado)}</strong>
                </div>

                <div class="pf-card">
                    <span>Saldo</span>
                    <strong>${mxn(data.saldo)}</strong>
                </div>

                <div class="pf-card">
                    <span>Pendientes</span>
                    <strong>${data.pendientes}</strong>
                </div>

            </div>

        </div>

    `;
  },
};
