// ============================================================
// ARATECH-SYS
// MÓDULO: PAGOS
// Helpers
// ============================================================
window.PAGOS_HELPERS = {

    money(valor) {
        return Number(valor || 0).toLocaleString("es-MX", {
            style: "currency",
            currency: "MXN"
        });
    },

    hoy() {
        return hoy();
    },

    ahora() {
        return new Date();
    }

};
