// Tarjeta que describe un paso con ícono, título, descripción y lista de verificación
export function StepCard({ number, icon, title, description, checklist }) {
  // Convierte cada elemento de la lista en un <li> con palomita de verificación
  const checklistItems = checklist
    .map(
      (item) => `
        <li class="flex items-center gap-2 text-sm text-text-secondary font-body">
          <span class="text-state-success" aria-hidden="true">✓</span>
          <span>${item}</span>
        </li>
      `,
    )
    .join("");

  return `
    <div class="rounded-2xl border border-border-default bg-bg-secondary p-8">
      <div class="mb-6 flex items-center gap-4">
        <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary/15 text-brand-primary-light">
          <span aria-hidden="true">${icon}</span>
        </div>
        <span class="font-heading text-3xl font-bold text-border-default">${number}</span>
      </div>

      <h3 class="mb-3 font-heading text-xl font-semibold text-text-primary">${title}</h3>
      <p class="mb-6 max-w-2xl text-sm leading-relaxed text-text-secondary font-body">${description}</p>

      <ul class="space-y-2">
        ${checklistItems}
      </ul>
    </div>
  `;
}
