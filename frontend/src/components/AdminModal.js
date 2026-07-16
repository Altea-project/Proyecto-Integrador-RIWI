export function Modal({ id, title, content, footer, size = "md" }) {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
  };

  return `
    <div
      id="${id}"
      data-modal
      class="fixed inset-0 z-50 flex items-center justify-center px-4 opacity-0 invisible transition-opacity duration-150 bg-black/60 backdrop-blur-sm"
    >
      <div class="w-full ${sizeClasses[size] || sizeClasses.md} bg-bg-secondary border border-border-default rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div class="flex items-center justify-between px-6 py-4 border-b border-border-default">
          <h2 class="font-heading text-lg font-semibold text-text-primary">${title}</h2>
          <button
            type="button"
            data-modal-close="${id}"
            aria-label="Cerrar"
            class="text-text-tertiary hover:text-text-primary transition-colors duration-150"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <div class="overflow-y-auto px-6 py-5">
          ${content}
        </div>

        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-default">
          ${footer}
        </div>
      </div>
    </div>
  `;
}
