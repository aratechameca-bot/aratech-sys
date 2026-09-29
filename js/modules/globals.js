// ============================================================
// ARATECH GLOBAL STATE
// ============================================================

"use strict";

// Estado global compartido
window.STATE = {};

// Usuario autenticado
window.currentUser = null;

// Catálogos globales
// (El listado de usuarios ya no se mantiene globalmente.
// Se consulta bajo demanda desde Firestore.)

// Variables temporales de módulos
window.LV = [];
window.OC_LINEAS = [];
window._cotConceptos = [];

// Contextos entre módulos
window.ticketVentaOrigenId = null;

// Temporizadores globales
window._inactivityTimer = null;

// Garantias
window.garFiltro = "todas";
