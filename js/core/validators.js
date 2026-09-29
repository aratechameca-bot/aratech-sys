/* ============================================================
   ARATECH-SYS
   VALIDATORS ENGINE v1.0
============================================================ */

window.ARATECH = window.ARATECH || {};

ARATECH.Validator = {
  /* ========================================================
       Normaliza texto
    ======================================================== */
  normalizeText(text = "") {
    return String(text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toUpperCase();
  },

  /* ========================================================
       Validador de Email
    ======================================================== */
  email(email = "") {
    email = String(email || "").trim();

    if (!email) {
      return {
        valid: true,

        value: "",

        message: "",

        code: "",
      };
    }

    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    return {
      valid: ok,

      value: email,

      message: ok ? "" : "El correo electrónico no tiene un formato válido.",

      code: ok ? "" : "EMAIL_FORMAT",
    };
  },

  /* ========================================================
       Validador de Teléfono
    ======================================================== */
  telefono(numero = "", codigoPais = "52") {
    numero = String(numero || "").replace(/\D/g, "");

    if (codigoPais === "52" && numero.length !== 10) {
      return {
        valid: false,

        value: numero,

        message: "El teléfono debe contener exactamente 10 dígitos.",

        code: "PHONE_LENGTH",
      };
    }

    return {
      valid: true,

      value: numero,

      message: "",

      code: "",
    };
  },

  /* ========================================================
       Validador RFC SAT
    ======================================================== */
  rfc(rfc = "") {
    rfc = ARATECH.Validator.normalizeText(rfc).replace(/[^A-ZÑ&0-9]/g, "");

    if (!rfc) {
      return {
        valid: true,

        value: "",

        type: null,

        message: "",

        code: "",
      };
    }

    if (rfc.length !== 12 && rfc.length !== 13) {
      return {
        valid: false,

        value: rfc,

        type: null,

        message: "El RFC debe contener 12 o 13 caracteres.",

        code: "RFC_LENGTH",
      };
    }

    const regex =
      /^([A-ZÑ&]{3,4})(\d{2})(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])([A-Z0-9]{3})$/;

    if (!regex.test(rfc)) {
      return {
        valid: false,

        value: rfc,

        type: null,

        message: "La estructura del RFC es inválida.",

        code: "RFC_FORMAT",
      };
    }

    return {
      valid: true,

      value: rfc,

      type: rfc.length === 13 ? "FISICA" : "MORAL",

      message: "",

      code: "",
    };
  },
};

/* ============================================================
   ARATECH-SYS
   FORMS ENGINE v1.0
============================================================ */

ARATECH.Forms = {
  bind(config) {
    const input = document.getElementById(config.id);

    if (!input) return;

    // Evitar registrar eventos dos veces
    if (input.dataset.bound === "1") return;

    input.dataset.bound = "1";

    const validate = () => {
      let result;

      /* ==========================================
        Normalización automática
        ========================================== */

      switch (config.validator) {
        case "telefono":
          input.value = input.value.replace(/\D/g, "");

          break;

        case "email":
          input.value = input.value.toLowerCase().replace(/\s+/g, "");

          break;

        case "rfc":
          input.value = ARATECH.Validator.normalizeText(input.value)
            .replace(/[^A-ZÑ&0-9]/g, "")
            .substring(0, 13);

          break;
      }

      switch (config.validator) {
        case "email":
          result = ARATECH.Validator.email(input.value);
          break;

        case "telefono":
          const country =
            document.getElementById(config.country)?.value || "52";
          result = ARATECH.Validator.telefono(input.value, country);
          break;

        case "rfc":
          result = ARATECH.Validator.rfc(input.value);
          break;

        default:
          return;
      }

      if (result.value !== undefined) {
        input.value = result.value;
      }

      // El Framework solo marca el estado.
      // La apariencia la controla CSS.

      input.classList.toggle("is-valid", result.valid);
      input.classList.toggle("is-invalid", !result.valid);

      input.setAttribute("aria-invalid", result.valid ? "false" : "true");

      input.dataset.valid = result.valid ? "1" : "0";
      input.dataset.code = result.code || "";
      input.dataset.message = result.message || "";

      let msg = input.parentElement.querySelector(".ar-validator");

      if (!msg) {
        msg = document.createElement("small");

        msg.className = "ar-validator";

        input.parentElement.appendChild(msg);
      }

      msg.textContent = result.valid ? "" : result.message;

      msg.style.display = result.valid ? "none" : "block";
    };

    input.addEventListener("input", validate);
    input.addEventListener("blur", validate);

    validate();
  },
};
