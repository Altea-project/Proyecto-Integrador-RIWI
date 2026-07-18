export function Select({
  id,
  label = "",
  options = [],
  value = "",
  placeholder = "Seleccionar",
  extraClasses = "mb-4",
}) {
  const optionsHtml = options
    .map(
      (opt) =>
        `<option value="${opt.value}" ${opt.value === value ? "selected" : ""}>${opt.label}</option>`,
    )
    .join("");

  return `
    <div class="${extraClasses}">
      ${
        label
          ? `<label for="${id}" class="font-body font-semibold text-xs text-text-primary uppercase tracking-wide mb-1.5 block">${label}</label>`
          : ""
      }
      <select
        id="${id}"
        class="w-full bg-[#1a1f2e] border border-border-default rounded-xl px-4 py-3 font-body text-base text-text-primary focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-200 appearance-none"
      >
        <option value="" ${value === "" ? "selected" : ""} disabled>${placeholder}</option>
        ${optionsHtml}
      </select>
    </div>
  `;
}
