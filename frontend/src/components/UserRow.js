import { ROLES } from "../utils/constants.js";
import { Avatar } from "./Avatar.js";

const ROLE_STYLES = {
  [ROLES.ADMIN]:
    "bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.1)]",
  [ROLES.CODER]:
    "bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_12px_rgba(34,197,94,0.1)]",
  [ROLES.INSTRUCTOR]:
    "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.1)]",
  [ROLES.RECRUITER]:
    "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.1)]",
};

export function UserRow(user) {
  // Verificamos roleName que viene del Backend
  const roleKey = user.roleName?.toLowerCase() || "";
  const badgeStyle =
    ROLE_STYLES[roleKey] || "bg-gray-500/10 text-gray-400 border-white/5";

  let entityContent = `<span class="text-text-tertiary opacity-20">—</span>`;

  if (roleKey === ROLES.CODER) {
    entityContent = `
      <div class="flex flex-col">
        <div class="flex items-center gap-1.5 mb-0.5">
           <span class="w-1.5 h-1.5 rounded-full bg-[#8044F0]/40"></span>
           <span class="text-text-primary text-[11px] font-black uppercase tracking-tight">${user.clanName || "Nivel Cadet"}</span>
        </div>
        <span class="text-[9px] text-text-tertiary font-bold tracking-widest pl-3 uppercase">Auditor: ${user.tlName || "Pendiente"}</span>
      </div>`;
  } else if (roleKey === ROLES.RECRUITER) {
    entityContent = `
      <div class="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5 w-fit">
        <svg width="12" height="12" class="text-amber-500" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m6 0v1a3 3 0 1 0 6 0V7m-9 0h.01"/></svg>
        <span class="text-text-primary text-[10px] font-black uppercase tracking-tight">${user.company || "Entidad Externa"}</span>
      </div>`;
  } else if (roleKey === ROLES.INSTRUCTOR) {
    entityContent = `<span class="text-blue-400 text-[10px] font-black tracking-[0.2em] uppercase italic px-1 border-l-2 border-blue-400/30 ml-2">Team Leader</span>`;
  }

  const assignTlButton =
    roleKey === ROLES.CODER
      ? `
      <button data-action="assign-tl" data-user-id="${user.id}" data-user-name="${user.name}" 
        class="p-2.5 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-white transition-all active:scale-90" 
        title="Vincular TL">
         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/></svg>
      </button>`
      : "";

  return `
    <tr class="group border-b border-border-default/40 hover:bg-[#161B26]/40 transition-all duration-300">
      <td class="py-6 px-10">
        <div class="flex items-center gap-4">
          <!-- Uso del componente Avatar -->
          ${Avatar({ name: user.name, size: "md" })}
          <div class="flex flex-col">
            <span class="text-sm font-bold text-text-primary tracking-tight group-hover:text-brand-primary transition-colors cursor-default">${user.name}</span>
            <span class="text-[11px] text-text-tertiary font-mono tracking-tighter opacity-80 uppercase">${user.email}</span>
          </div>
        </div>
      </td>
      <td class="py-6 px-6">
        <span class="inline-flex items-center px-4 py-1 rounded-full text-[9px] font-black border tracking-[0.15em] transition-transform group-hover:scale-105 ${badgeStyle}">
          ${user.roleName?.toUpperCase() || "MIEMBRO"}
        </span>
      </td>
      <td class="py-6 px-6">
        ${entityContent}
      </td>
      <td class="py-6 px-10 text-right">
        <div class="flex justify-end gap-3 opacity-30 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          ${assignTlButton}
          <button data-action="edit-user" data-user-id="${user.id}" data-user-name="${user.name}" class="p-2.5 rounded-xl bg-white/5 border border-border-default text-text-tertiary hover:text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-90" title="Editar Miembro">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
           </button>
           <button data-action="delete-user" data-user-id="${user.id}" data-user-name="${user.name}" class="p-2.5 rounded-xl bg-[#EF4444]/5 border border-[#EF4444]/10 text-text-tertiary hover:text-white hover:bg-[#EF4444] hover:border-[#EF4444]/40 transition-all active:scale-90" title="Borrar de Altea">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
           </button>
        </div>
      </td>
    </tr>
  `;
}
