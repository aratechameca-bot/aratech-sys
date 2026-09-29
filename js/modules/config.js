// ============================================================
// DB — Base de datos con caché local + sync
// ============================================================
const _cache = {};

// ============================================================
// MODO DESARROLLO
// ============================================================

// [FASE 1] Modo desarrollo desactivado: el login usa Firebase Auth real.
// Poner en true SOLO para pruebas locales (autentica un admin ficticio sin Firebase).
window.DEV_MODE = false;
