const VARIANT_STYLES = {
  success: "bg-state-success/10 border-state-success/30 text-state-success",
  error: "bg-state-error/10 border-state-error/30 text-state-error",
  warning: "bg-state-warning/10 border-state-warning/30 text-state-warning",
  info: "bg-state-info/10 border-state-info/30 text-state-info",
};

export function showToast(message, variant = "info", duration = 4000) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `flex items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl font-body text-sm max-w-sm opacity-0 translate-y-2 transition-all duration-200 ${VARIANT_STYLES[variant] || VARIANT_STYLES.info}`;
  toast.textContent = message;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove("opacity-0", "translate-y-2");
  });

  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toast.remove(), 200);
  }, duration);
}
