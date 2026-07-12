// Muestra un valor numérico con su etiqueta descriptiva, usado en métricas
export function StatItem({ value, label }) {
  return `
    <div class="inline-flex items-center gap-2 rounded-full border border-border-default bg-bg-secondary/60 px-4 py-2 text-sm font-body">
      <span class="font-heading font-semibold text-text-primary">${value}</span>
      <span class="text-text-secondary">${label}</span>
    </div>
  `;
}
