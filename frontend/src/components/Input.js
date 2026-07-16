export function Input({
  id,
  label,
  type = "text",
  value = "",
  placeholder = "",
  extraClasses = "mb-4",
}) {
  return `
    <div class="${extraClasses}">
      <label for="${id}" class="font-body font-semibold text-xs text-text-primary uppercase tracking-wide mb-1.5 block">
        ${label}
      </label>
      <input
        id="${id}"
        type="${type}"
        value="${value}"
        placeholder="${placeholder}"
        class="w-full bg-[#1a1f2e] border border-border-default rounded-xl px-4 py-3 font-body text-base text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-200"
      />
    </div>
  `;
}
