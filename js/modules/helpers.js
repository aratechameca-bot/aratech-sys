function fillOrds() {
  const ords = DB.get("ordenes").filter(
    (o) =>
      ![
        "Entregado",
        "Entregado (garantía)",
        "Cancelado",
        "No reparado",
      ].includes(o.estado),
  );
  document.getElementById("vta-ord").innerHTML =
    '<option value="">-- Selecciona una orden --</option>' +
    ords
      .map(
        (o) =>
          `<option value="${o.id}">${o.folio} — ${o.cliente_nombre}</option>`,
      )
      .join("");
}

function togOtroEq() {
  document.getElementById("row-otro-eq").style.display =
    document.getElementById("ord-teq").value === "Otro" ? "" : "none";
}

window.fillOrds = fillOrds;
window.togOtroEq = togOtroEq;
