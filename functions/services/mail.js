const nodemailer = require("nodemailer");

const { defineSecret } = require("firebase-functions/params");

const ZOHO_SMTP_PASSWORD = defineSecret("ZOHO_SMTP_PASSWORD");

const SMTP_USER = "soporte@aratech.com.mx";

const TEL_ARATECH = "375 690 5296";

const CORREO_ARATECH = "soporte@aratech.com.mx";

const DIR_ARATECH = "Allende 246, Col. Obrera, Ameca, Jalisco";

// ============================================================
// ENVIAR CORREO
// ============================================================

async function enviarCorreo({
  para,

  asunto,

  html,
}) {
  if (!para) {
    return {
      ok: false,

      razon: "SIN_DESTINATARIO",
    };
  }

  const password = ZOHO_SMTP_PASSWORD.value();

  // LOG PARA DIAGNÓSTICO
  console.log("Intentando enviar correo a:", para);
  console.log(
    "Password cargado (longitud):",
    password ? password.length : "NULO",
  );

  const transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",

    port: 465,

    secure: true,

    auth: {
      user: SMTP_USER,

      pass: password,
    },
  });

  await transporter.sendMail({
    from: `"ARATECH Soporte" <${SMTP_USER}>`,

    to: para,

    replyTo: SMTP_USER,

    subject: asunto,

    html,
  });

  return {
    ok: true,
  };
}

// ============================================================
// PLANTILLA BASE CORREO ARATECH
// ============================================================

function plantillaCorreo(titulo, cuerpo) {
  return `<!DOCTYPE html>
<html lang="es">

<head>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta name="color-scheme" content="light dark">

<style>

body{
  margin:0;
  padding:0;
  background-color:#e8edf2;
  font-family:Arial,Helvetica,sans-serif;
}

@media(prefers-color-scheme:dark){

  body{
    background-color:#0b1e2d!important;
  }

  .card{
    background-color:#102a43!important;
  }

  .body-cell{
    background-color:#102a43!important;
  }

  .body-text{
    color:#e0e8f0!important;
  }

  .caja{
    background-color:#0d2235!important;
  }

  .caja-text{
    color:#a0c4d8!important;
  }

  .caja-bold{
    color:#75d0fa!important;
  }

}

</style>

</head>

<body>

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  style="
    background-color:#e8edf2;
    padding:30px 0;
  ">

<tr>
<td align="center">

<table
  width="560"
  class="card"
  cellpadding="0"
  cellspacing="0"
  style="
    background-color:#ffffff;
    border-radius:16px;
    overflow:hidden;
    max-width:560px;
  ">

  <!-- HEADER -->

  <tr>

    <td
      style="
        background:linear-gradient(
          135deg,
          #0b1e2d,
          #102a43,
          #1a3a5c
        );
        padding:32px;
        text-align:center;
      ">

      <img
        src="https://i.ibb.co/Z63WYgDQ/LOGOS-ARATECH-NOTIFICACION.png"
        alt="ARATECH"
        style="
          display:block;
          margin:0 auto;
          max-width:320px;
          width:100%;
          height:auto;
          border:0;
        ">

    </td>

  </tr>

  <!-- CUERPO -->

  <tr>

    <td
      class="body-cell"
      style="
        padding:36px 32px;
        background-color:#ffffff;
      ">

      <div
        class="body-text"
        style="
          font-size:14px;
          line-height:1.9;
          color:#1a1a2e;
        ">

        ${cuerpo}

      </div>

      <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        style="margin:24px 0">

        <tr>

          <td
            style="
              height:2px;
              background:linear-gradient(
                90deg,
                #102a43,
                #75d0fa,
                #102a43
              );
            ">

            &nbsp;

          </td>

        </tr>

      </table>

      <!-- CONTACTO -->

      <table
        width="100%"
        class="caja"
        cellpadding="0"
        cellspacing="0"
        style="
          background-color:#f0f4f8;
          border-radius:10px;
          border-left:3px solid #75d0fa;
        ">

        <tr>

          <td style="padding:18px 22px">

            <p
              class="caja-text"
              style="
                font-size:13px;
                color:#444;
                margin:0 0 8px;
              ">

                Llámanos al

              <a
                href="tel:+523756905296"
                style="
                  color:#102a43;
                    font-weight:bold;
                  text-decoration:none;
                ">

                ${TEL_ARATECH}

              </a>

            </p>

            <p
              class="caja-text"
              style="
                font-size:13px;
                color:#444;
                margin:0 0 8px;
              ">

                WhatsApp

              <a
                href="https://wa.me/523756905296"
                style="
                  color:#102a43;
                    font-weight:bold;
                  text-decoration:none;
                ">

                ${TEL_ARATECH}

              </a>

            </p>

            <p
              class="caja-text"
              style="
                font-size:13px;
                color:#444;
                margin:0 0 8px;
              ">

                Correo

              <a
                href="mailto:${CORREO_ARATECH}"
                style="
                  color:#102a43;
                  font-weight:bold;
                  text-decoration:none;
                ">

                ${CORREO_ARATECH}

              </a>

            </p>

            <p
              class="caja-text"
              style="
                font-size:13px;
                color:#444;
                margin:0;
              ">

                Instagram

              <a
                href="https://www.instagram.com/aratechameca/"
                style="
                  color:#102a43;
                  font-weight:bold;
                  text-decoration:none;
                ">

                @aratechameca

              </a>

            </p>

          </td>

        </tr>

      </table>

    </td>

  </tr>

  <!-- FOOTER -->

  <tr>

    <td
      style="
        background-color:#0b1e2d;
        padding:20px 32px;
        text-align:center;
      ">

      <p
        style="
          font-size:10px;
          color:rgba(245, 242, 242, 0.85);
          margin:0;
          letter-spacing:0.5px;
          line-height:1.8;
        ">

        ${DIR_ARATECH}
        &nbsp;&nbsp;•&nbsp;&nbsp;
        ${CORREO_ARATECH}

      </p>

    </td>

  </tr>

</table>

</td>
</tr>

</table>

</body>
</html>`;
}

module.exports = {
  enviarCorreo,
  plantillaCorreo,
  ZOHO_SMTP_PASSWORD,
  CORREO_ARATECH,
  DIR_ARATECH,
};
