// ============================================================
// escapeHtml.js — Protección contra XSS en las vistas.
// Todo dato dinámico (nombre de coder, tecnología, etc.) que se
// interpole dentro de innerHTML debe pasar por escapeHtml().
// ============================================================

export function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]),
  );
}
