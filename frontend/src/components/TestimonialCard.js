import iconStar from "../../assets/icon/iconStar.svg";

export function TestimonialCard({
  quote,
  initials,
  name,
  role,
  userType,
  rating = 5,
}) {
  // Genera estrellas rellenas o vacías según la puntuación
  const stars = Array.from({ length: 5 })
    .map(
      (_, i) =>
        `<img src="${iconStar}" alt="" class="h-4 w-4 ${i < rating ? "opacity-100" : "opacity-25"}" />`,
    )
    .join("");

  // El reclutador se muestra con color informativo; el resto con el color de marca
  const badgeStyles =
    userType === "RECLUTADOR"
      ? "bg-state-info/15 text-state-info"
      : "bg-brand-primary/15 text-brand-primary-light";

  return `
    <div class="flex h-full flex-col rounded-2xl border border-border-default bg-bg-secondary p-6">
      <div class="mb-4 flex items-center gap-1 text-sm" role="img" aria-label="${rating} de 5 estrellas">
        ${stars}
      </div>

      <p class="mb-6 flex-1 text-sm leading-relaxed text-text-secondary font-body">“${quote}”</p>

      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary/20 text-sm font-heading font-semibold text-brand-primary-light">
          ${initials}
        </div>
        <div class="flex-1">
          <p class="font-heading text-sm font-semibold text-text-primary">${name}</p>
          <p class="text-xs text-text-secondary font-body">${role}</p>
        </div>
        <span class="rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide font-body ${badgeStyles}">
          ${userType}
        </span>
      </div>
    </div>
  `;
}
