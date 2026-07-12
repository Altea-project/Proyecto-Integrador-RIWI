export function Button({
  text,
  variant = "primary",
  icon = "",
  iconPosition = "left",
  href = "#",
  extraClasses = "",
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold font-heading transition-colors duration-150";

  const styles =
    variant === "primary"
      ? "bg-brand-primary text-text-primary hover:bg-brand-primary-light"
      : "border border-border-default text-text-primary hover:border-brand-primary-light bg-transparent";

  const iconEl = icon ? `<span aria-hidden="true">${icon}</span>` : "";

  return `
    <a href="${href}" class="${base} ${styles} ${extraClasses}">
      ${iconPosition === "left" ? iconEl : ""}
      <span>${text}</span>
      ${iconPosition === "right" ? iconEl : ""}
    </a>
  `;
}
