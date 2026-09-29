function formatMXN(monto) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(monto);
}

function procesarSistema() {
  console.log("CALCULADORA.JS");
  const costo = parseFloat(document.getElementById("costo").value) || 0;

  const tarjetaMsi = document.getElementById("tarjeta-msi");
  const tituloMsi = document.getElementById("titulo-msi");
  const contenedorMensualidad = document.getElementById(
    "contenedor-mensualidad",
  );
  const avisoMsi = document.getElementById("aviso-restriccion-msi");
  const utilidadMsiWrapper = document.getElementById("utilidad-msi-wrapper");

  const margenPct =
    Math.min(
      Math.max(parseFloat(document.getElementById("margen").value) || 30, 1),
      99,
    ) / 100;
  const precioEfectivo = costo / (1 - margenPct);
  const utilidadEfectivo = precioEfectivo - costo;

  const tasaTarjetaContado = 0.035 * 1.16;
  const precioContado = precioEfectivo / (1 - tasaTarjetaContado);
  const utilidadContado = precioContado * (1 - tasaTarjetaContado) - costo;

  const tasaMsi = 0.0469 * 1.16;
  const tasaRetencionTotal = tasaTarjetaContado + tasaMsi;
  const precioMsi = precioEfectivo / (1 - tasaRetencionTotal);
  const mensualidad = precioMsi / 3;
  const utilidadMsi = precioMsi * (1 - tasaRetencionTotal) - costo;

  document.getElementById("precio-efectivo").innerText =
    formatMXN(precioEfectivo);
  document.getElementById("utilidad-efectivo").innerText =
    `+${formatMXN(utilidadEfectivo)}`;
  document.getElementById("label-margen-efectivo").innerText =
    `Utilidad del ${Math.round(margenPct * 100)}%`;

  document.getElementById("precio-contado").innerText =
    formatMXN(precioContado);
  document.getElementById("utilidad-contado").innerText =
    `+${formatMXN(utilidadContado)}`;

  // =====================================================
  // PRECIOS CON IVA (solo visuales)
  // =====================================================

  const precioEfectivoIVA = precioEfectivo * 1.16;
  const precioContadoIVA = precioContado * 1.16;
  const precioMsiIVA = precioMsi * 1.16;

  document.getElementById("precio-efectivo-iva").innerText =
    formatMXN(precioEfectivoIVA);

  document.getElementById("precio-contado-iva").innerText =
    formatMXN(precioContadoIVA);

  document.getElementById("precio-msi-iva").innerText = formatMXN(precioMsiIVA);

  if (costo === 0 || precioMsi <= 4000) {
    tarjetaMsi.classList.add("bloqueada");
    tituloMsi.style.color = "var(--alert-red)";
    contenedorMensualidad.style.display = "none";
    utilidadMsiWrapper.style.display = "none";
    avisoMsi.style.display = "block";

    document.getElementById("precio-msi").innerText = formatMXN(precioMsi);
  } else {
    tarjetaMsi.classList.remove("bloqueada");
    tituloMsi.style.color = "#c084fc";
    contenedorMensualidad.style.display = "block";
    utilidadMsiWrapper.style.display = "block";
    avisoMsi.style.display = "none";

    document.getElementById("precio-msi").innerText = formatMXN(precioMsi);
    document.getElementById("mensualidad-msi").innerText =
      `3 mensualidades de: ${formatMXN(mensualidad)}`;
    document.getElementById("utilidad-msi").innerText =
      `+${formatMXN(utilidadMsi)}`;
  }
}

procesarSistema();
