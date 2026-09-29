window.ARABOT = {
  version: "6.1.0",

  config: {
    asset: ASSETS.ARABOT_ALERT,

    closeOnEnter: true,

    closeOnClick: true,

    closeOnEscape: false,

    animation: 250,

    minLoadingTime: 350,

    messages: [
      "🛠 Organizando información...",

      "💾 Guardando cambios...",

      "⚡ Un momento...",

      "📦 Actualizando inventario...",

      "🔄 Sincronizando...",

      "🚀 Preparando todo...",

      "🧠 Procesando información...",

      "✨ Casi terminamos...",
    ],
  },

  state: "hidden",

  mode: null,

  messageIndex: 0,

  messageTimer: null,

  loadingActive: false,

  resolver: null,

  overlay: null,

  dialog: null,

  icon: null,

  title: null,

  message: null,

  details: null,

  progress: null,

  buttons: null,

  init() {
    this.build();

    this.bindEvents();

    // this.test();
  },

  bindEvents() {
    document.addEventListener("keydown", (e) => {
      if (this.state !== "visible") return;

      if (
        e.key === "Enter" &&
        this.config.closeOnEnter &&
        this.mode !== "loading"
      ) {
        e.preventDefault();

        e.stopPropagation();

        this.close();
      }
    });

    this.overlay.addEventListener("click", () => {
      if (this.state !== "visible") return;

      if (!this.config.closeOnClick) return;

      if (this.mode === "loading") return;

      this.close();
    });

    this.dialog.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  },

  build() {
    if (document.getElementById("arabot-overlay")) {
      return;
    }

    document.body.insertAdjacentHTML(
      "beforeend",

      `

    <div id="arabot-overlay" class="arabot-hidden">

        <div id="arabot-dialog">

            <img
                id="arabot-icon"
                alt="ARABOT">

            <h2 id="arabot-title"></h2>

            <div id="arabot-message"></div>

            <div id="arabot-details"></div>

            <div id="arabot-content"></div>

            <div id="arabot-progress"></div>

            <div id="arabot-buttons"></div>

        </div>

    </div>

            `,
    );

    this.overlay = document.getElementById("arabot-overlay");

    this.dialog = document.getElementById("arabot-dialog");

    this.icon = document.getElementById("arabot-icon");

    this.title = document.getElementById("arabot-title");

    this.message = document.getElementById("arabot-message");

    this.details = document.getElementById("arabot-details");

    this.content = document.getElementById("arabot-content");

    this.progress = document.getElementById("arabot-progress");

    this.buttons = document.getElementById("arabot-buttons");
  },

  open() {
    if (!this.overlay) {
      this.build();
    }

    this.state = "visible";

    this.overlay.classList.remove("arabot-hidden");

    this.overlay.classList.add("arabot-visible");
  },

  close() {
    this.loadingActive = false;

    clearInterval(this.messageTimer);

    this.state = "hidden";

    this.messageTimer = null;

    this.overlay.classList.remove("arabot-visible");

    this.overlay.classList.add("arabot-hidden");
  },

  update(options = {}) {
    this.mode = options.mode || this.mode;

    this.dialog.dataset.mode = this.mode;

    /* ===========================================
   DETENER CUALQUIER LOADING ACTIVO
=========================================== */

    if (this.mode !== "loading") {
      this.loadingActive = false;

      clearInterval(this.messageTimer);
    }

    /* ===========================================
   LIMPIAR ESTADO VISUAL ANTERIOR
=========================================== */

    this.icon.removeAttribute("src");

    this.title.textContent = "";

    this.message.innerHTML = "";

    this.details.innerHTML = "";

    this.content.innerHTML = "";

    this.progress.innerHTML = "";

    this.buttons.innerHTML = "";

    this.title.textContent = options.title || "";

    this.message.innerHTML = options.message || "";

    this.details.innerHTML = options.details || "";

    this.content.innerHTML = options.content || "";

    if (options.progress === null) {
      this.progress.innerHTML = `
              <div class="arabot-progress">
                  <div class="arabot-progress-bar"></div>
              </div>
          `;
    } else {
      this.progress.innerHTML = options.progress ?? "";
    }

    this.buttons.innerHTML = options.buttons || "";

    if (options.icon) {
      this.icon.src = options.icon;
    }
  },

  loading(options = {}) {
    this.loadingActive = true;

    /* ===========================================
   SI YA ESTÁ CARGANDO, SOLO ACTUALIZAR
    =========================================== */

    if (this.mode === "loading") {
      this.update({
        mode: "loading",

        icon: options.icon || this.config.asset,

        title: options.title || "ARABOT",

        message: options.message || this.config.messages[0],

        details: options.details || "",

        progress: null,

        buttons: "",
      });

      return;
    }

    this.messageIndex = 0;

    this.update({
      mode: "loading",

      icon: options.icon || this.config.asset,

      title: options.title || "ARABOT",

      message: options.message || this.config.messages[0],

      details: options.details || "",

      progress: null,

      buttons: "",
    });

    if (this.state !== "visible") {
      this.open();
    }

    clearInterval(this.messageTimer);

    this.messageTimer = setInterval(() => {
      if (!this.loadingActive) return;

      this.messageIndex++;

      if (this.messageIndex >= this.config.messages.length) {
        this.messageIndex = 0;
      }

      this.message.innerHTML = this.config.messages[this.messageIndex];
    }, 1800);
  },

  success(options = {}) {
    this.update({
      mode: "success",

      icon: options.icon || this.config.asset,

      title: options.title || "Operación completada",

      message: options.message || "✔ Operación realizada correctamente.",

      details:
        options.details ||
        "Presiona ENTER o toca cualquier parte para continuar.",

      progress: "",

      buttons: `

        <button
            id="arabot-success-ok"
            class="arabot-btn arabot-btn-primary">

            Aceptar

        </button>

    `,
    });

    this.open();
    document.getElementById("arabot-success-ok").onclick = () => {
      this.close();

      if (typeof options.onClose === "function") {
        options.onClose();
      }
    };
  },

  test() {
    // Pruebas temporales del Framework
  },

  alert(options = {}) {
    this.update({
      mode: "alert",

      icon: options.icon || this.config.asset,

      title: options.title || "Información",

      message: options.message || "",

      details:
        options.details ||
        "Presiona Aceptar, ENTER o toca la pantalla para continuar.",

      progress: "",

      buttons: `

                <button
                    id="arabot-alert-ok"
                    class="arabot-btn arabot-btn-primary">

                    Aceptar

                </button>

            `,
    });

    this.open();

    document.getElementById("arabot-alert-ok").onclick = () => {
      this.close();
    };
  },

  warning(options = {}) {
    this.update({
      mode: "warning",

      icon: options.icon || this.config.asset,

      title: options.title || "Advertencia",

      message: options.message || "",

      details: options.details || "Revisa la información antes de continuar.",

      progress: "",

      buttons: `

                <button
                    id="arabot-warning-ok"
                    class="arabot-btn arabot-btn-primary">

                    Aceptar

                </button>

            `,
    });

    this.open();

    document.getElementById("arabot-warning-ok").onclick = () => {
      this.close();
    };
  },

  error(options = {}) {
    this.update({
      mode: "error",

      icon: options.icon || this.config.asset,

      title: options.title || "Error",

      message: options.message || "Ha ocurrido un error.",

      details:
        options.details || "Inténtalo nuevamente o contacta al administrador.",

      progress: "",

      buttons: `

                <button
                    id="arabot-error-ok"
                    class="arabot-btn arabot-btn-primary">

                    Aceptar

                </button>

            `,
    });

    this.open();

    document.getElementById("arabot-error-ok").onclick = () => {
      this.close();
    };
  },

  confirm(options = {}) {
    return new Promise((resolve) => {
      this.resolver = resolve;

      this.update({
        mode: "confirm",

        icon: options.icon || this.config.asset,

        title: options.title || "Confirmación",

        message: options.message || "¿Deseas continuar?",

        details: options.details || "",

        progress: "",

        buttons: `

                <button id="arabot-cancel" class="arabot-btn arabot-btn-secondary">

                    Cancelar

                </button>

                <button id="arabot-ok" class="arabot-btn arabot-btn-primary">

                    Confirmar

                </button>

            `,
      });

      this.open();

      document.getElementById("arabot-cancel").onclick = () => {
        this.close();

        this.resolver(false);

        this.resolver = null;
      };

      document.getElementById("arabot-ok").onclick = () => {
        this.close();

        this.resolver(true);

        this.resolver = null;
      };
    });
  },

  form(options = {}) {
    return new Promise((resolve) => {
      this.resolver = resolve;

      this.update({
        mode: "form",

        icon: options.icon || this.config.asset,

        title: options.title || "Formulario",

        message: options.message || "",

        details: options.details || "",

        content: options.content || "",

        progress: "",

        buttons: `

        <button
            id="arabot-form-cancel"
            class="arabot-btn arabot-btn-secondary">

            Cancelar

        </button>

        <button
            id="arabot-form-ok"
            class="arabot-btn arabot-btn-primary">

            Confirmar

        </button>

      `,
      });

      this.open();

      if (typeof options.onOpen === "function") {
        options.onOpen();
      }

      document.getElementById("arabot-form-cancel").onclick = () => {
        this.close();

        resolve(false);

        this.resolver = null;
      };

      document.getElementById("arabot-form-ok").onclick = () => {
        resolve(true);

        this.close();

        this.resolver = null;
      };
    });
  },

  reason(options = {}) {
    return new Promise(async (resolve) => {
      const razones = options.reasons || [];

      const contenido = `

      <div class="arabot-reason">

        ${razones
          .map(
            (r, i) => `
             <label class="arabot-reason-item">

                <input
                    type="radio"
                    name="arabot-reason"
                    value="${r}"
                    ${i === 0 ? "checked" : ""}
                >

                <div class="arabot-reason-label">

                    ${r}

                </div>

            </label>
            `,
          )
          .join("")}

        <textarea
          id="arabot-reason-detail"
          placeholder="Especifique el motivo..."
          style="
            display:none;
            width:100%;
            margin-top:12px;
            min-height:80px;
            resize:vertical;
          "
        ></textarea>

      </div>

    `;

      const ok = await this.form({
        icon: options.icon,

        title: options.title || "Motivo",

        message: options.message || "",

        details: options.details || "",

        content: contenido,

        onOpen: () => {
          const radios = document.querySelectorAll(
            'input[name="arabot-reason"]',
          );

          const detalle = document.getElementById("arabot-reason-detail");

          const actualizarDetalle = () => {
            const seleccionado = document.querySelector(
              'input[name="arabot-reason"]:checked',
            )?.value;

            const mostrar = seleccionado === "Otro";

            detalle.style.display = mostrar ? "block" : "none";

            if (!mostrar) {
              detalle.value = "";
            }
          };

          radios.forEach((r) => {
            r.onchange = actualizarDetalle;
          });

          actualizarDetalle();
        },
      });

      if (!ok) {
        resolve(null);
        return;
      }

      const seleccionado =
        document.querySelector('input[name="arabot-reason"]:checked')?.value ||
        "";

      const detalleTexto =
        document.getElementById("arabot-reason-detail")?.value.trim() || "";

      if (seleccionado === "Otro" && !detalleTexto) {
        notify("Especifique el motivo de la cancelación.");

        return this.reason(options).then(resolve);
      }

      resolve({
        motivo: seleccionado,
        detalle: detalleTexto,
      });
    });
  },
};

document.addEventListener("DOMContentLoaded", () => {
  ARABOT.init();
});
