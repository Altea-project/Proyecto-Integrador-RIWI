export function Badge({ text, icon = "", variant = "default" }) {
  const base =
    "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide font-body";

  const styles =
    variant === "outline"
      ? "border border-border-default text-text-secondary uppercase"
      : "bg-brand-primary/15 text-brand-primary-light border border-brand-primary/30 uppercase";

  return `
    <span class="${base} ${styles}">
      ${icon ? `<span aria-hidden="true">${icon}</span>` : ""}
      <span>${text}</span>
    </span>
  `;
}
