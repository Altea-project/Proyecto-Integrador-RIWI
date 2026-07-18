/**
 * Avatar.js - Componente de Identidad Visual Altea
 * Estilo: Gem Glassmorphism con degradados de marca.
 */
export function Avatar({ name = "U", size = "md" } = {}) {
  const sizes = {
    sm: "w-9 h-9 text-[10px] border-2",
    md: "w-11 h-11 text-xs border-2",
    lg: "w-16 h-16 text-sm border-[3px]",
  };

  const initials = name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return `
    <div
      class="${sizes[size]} rounded-full bg-gradient-to-br from-[#8044F0] via-[#9A6AF5] to-[#4F46E5] 
             text-white font-black flex items-center justify-center select-none 
             border-white/10 shadow-[0_4px_12px_rgba(128,68,240,0.3)] relative group overflow-hidden"
      aria-hidden="true"
    >
      <!-- Brillo de cristal interno -->
      <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <span class="relative z-10 tracking-tighter drop-shadow-sm">
        ${initials}
      </span>
    </div>
  `;
}
