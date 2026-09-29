window.FINANZAS_UI = {
  async buscar() {
    const clientes = await FINANZAS.buscarClientes("");

    const body = document.getElementById("finanzas-body");

    body.innerHTML = `

            <div class="card">

                <table>

                    <thead>

                        <tr>

                            <th>Cliente</th>

                            <th>Teléfono</th>

                            <th></th>

                        </tr>

                    </thead>

                    <tbody>

                        ${clientes
                          .map(
                            (c) => `

                            <tr>

                                <td>

                                    <strong>${c.nombre}</strong><br>

                                    <small>${c.id}</small>

                                </td>

                                <td>${c.telefono || "-"}</td>

                                <td>

                                    <button
                                        class="btn bp bsm"
                                        onclick="FINANZAS_UI.abrirCliente('${c.id}')"
                                    >

                                        Abrir

                                    </button>

                                </td>

                            </tr>

                        `,
                          )
                          .join("")}

                    </tbody>

                </table>

            </div>

        `;
  },

  async abrirCliente(clienteId) {
    const d = await FINANZAS.getDashboardCliente(clienteId);

    const body = document.getElementById("finanzas-body");

    body.innerHTML = `

        <div class="g4">

            <div class="card card-sm">
                <div class="kl">Total</div>
                <div class="kv">${mxn(d.total)}</div>
            </div>

            <div class="card card-sm">
                <div class="kl">Pagado</div>
                <div class="kv">${mxn(d.pagado)}</div>
            </div>

            <div class="card card-sm">
                <div class="kl">Saldo</div>
                <div class="kv">${mxn(d.saldo)}</div>
            </div>

            <div class="card card-sm">
                <div class="kl">Documentos</div>
                <div class="kv">${d.documentos}</div>
            </div>

        </div>

        <div class="card" style="margin-top:16px;">

    <table>

        <thead>

            <tr>

                <th>Tipo</th>
                <th>Folio</th>
                <th>Total</th>
                <th>Pagado</th>
                <th>Saldo</th>
                <th>Estado</th>

            </tr>

        </thead>

        <tbody>

            ${d.lista
              .map(
                (doc) => `

                <tr>

                    <td>${doc.tipo}</td>

                    <td>${doc.folio}</td>

                    <td>${mxn(doc.total)}</td>

                    <td>${mxn(doc.pagado)}</td>

                    <td>${mxn(doc.saldo)}</td>

                    <td>

                        <span class="tag ${doc.estado === "LIQUIDADO" ? "tg" : "ty"}">

                            ${doc.estado}

                        </span>

                    </td>

                </tr>

            `,
              )
              .join("")}

        </tbody>

    </table>

</div>

    `;
  },
};
