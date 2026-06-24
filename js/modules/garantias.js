// GARANTIAS
function rndGar() {
  const gs = DB.get("garantias");
  const tb = document.getElementById("tb-gar");
  // Resumen de garantías
  const resDiv = document.getElementById("gar-resumen");
  if (resDiv) {
    const activas = gs.filter((g) => g.estado === "Activa").length;
    const vencidas = gs.filter((g) => g.estado === "Vencida").length;
    const proximas = gs.filter((g) => {
      if (g.estado !== "Activa") return false;
      const d = diasE(hoy(), g.fecha_gar);
      return d >= 0 && d <= 7;
    }).length;
    const mantenimiento = gs.filter((g) => {
      if (g.estado !== "Activa") return false;
      const d = diasE(hoy(), g.fecha_gar);
      return d === 0;
    }).length;
    resDiv.innerHTML = `
      <div class="stat-card"><div class="sv" style="color:var(--green)">${activas}</div><div class="sk">Activas</div></div>
      <div class="stat-card"><div class="sv" style="color:#ffd600">${proximas}</div><div class="sk">Vencen en 7 días</div></div>
      <div class="stat-card"><div class="sv" style="color:#ff6b6b">${vencidas}</div><div class="sk">Vencidas</div></div>
      <div class="stat-card"><div class="sv" style="color:#75d0fa">${gs.length}</div><div class="sk">Total registradas</div></div>`;
  }
  if (!gs.length) {
    tb.innerHTML = '<tr><td colspan="9" class="nd">Sin garantías</td></tr>';
    return;
  }

  const cf = DB.obj("config");
  const ad = parseInt(cf.cfg_ga || 7);

  tb.innerHTML = gs
    .map((g) => {
      const d = g.fecha_gar ? diasE(hoy(), g.fecha_gar) : 999;

      const sc = d < 0 ? "sr" : d <= ad ? "so" : "sg";

      const tc = d < 0 ? "tr" : d <= ad ? "to" : "tg";

      const tt = d < 0 ? "Vencida" : d <= ad ? "Por vencer" : "Vigente";

      return `
              <tr>

                <td style="
                  font-family:var(--fh);
                  color:var(--accent);
                  font-size:11px">
                  ${g.folio}
                </td>

                <td>
                  ${g.cliente_nombre}
                </td>

                <td style="font-size:11px">
                  ${g.tipo_equipo || ""}
                  ${g.modelo || ""}
                </td>

                <td style="font-size:11px">

                  ${g.servicio}

                  ${
                    g.total_piezas > 1
                      ? `<div style="
                          font-size:10px;
                          color:var(--accent);
                          font-weight:600;
                        ">
                          Pieza ${g.pieza} de ${g.total_piezas}
                        </div>`
                      : ""
                  }

                </td>

                <td style="font-size:10px">
                  ${fmt(g.fecha)}
                </td>

                <td style="font-size:10px">
                  ${fmt(g.fecha_gar)}
                </td>

                <td style="
                  font-family:var(--fh);
                  font-size:15px;
                  color:${
                    d < 0
                      ? "var(--red)"
                      : d <= ad
                        ? "var(--orange)"
                        : "var(--green)"
                  }">

                  ${d < 0 ? "Venció" : d}

                  ${d >= 0 ? "días" : ""}

                </td>

                <td>
                  <span class="sm ${sc}"></span>
                  <span class="tag ${tc}">
                    ${tt}
                  </span>
                </td>

                <td class="bg-btn">

                  <button
                    class="btn bg bsm"
                    onclick="prtGar('${g.folio}','carta')">
                    📄
                  </button>

                  <button
                    class="btn bg bsm"
                    onclick="prtGar('${g.folio}','58mm')">
                    58
                  </button>

                  <button
                    class="btn bg bsm"
                    onclick="prtGar('${g.folio}','80mm')">
                    80
                  </button>

                </td>

              </tr>
            `;
    })
    .join("");
}

window.rndGar = rndGar;
