// ============================================================
// ATAJOS DE TECLADO
// ============================================================
document.addEventListener("keydown", (e) => {
  if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;
  if (!currentUser) return;

  if (e.ctrlKey || e.metaKey) {
    switch (e.key.toLowerCase()) {
      case "n":
        e.preventDefault();
        document.querySelector('[data-panel="ordenes"]')?.click();
        setTimeout(() => openM("m-orden"), 100);
        break;

      case "b":
      case "k":
        e.preventDefault();
        document.getElementById("global-search")?.focus();
        break;
    }
  }

  if (e.key === "Escape") {
    const openModal = document.querySelector(".mb.open");
    if (openModal) openModal.classList.remove("open");
  }
});

// ============================================================
// ARRANQUE DEL SISTEMA
// ============================================================
document.addEventListener("DOMContentLoaded", init);
