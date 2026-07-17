import { getUser, clearUser } from "../state/store.js";
import { Avatar } from "./Avatar.js";
import { storage } from "../utils/storage.js";
import { navigate } from "../router/router.js";
import { ROLES } from "../utils/constants.js";
import horizontalLogoNegative from "../../assets/logos/horizontalLogoNegative.svg";

export function Header({ extraClasses = "" } = {}) {
  const user = getUser();

  const getHomePath = () => {
    if (!user) return "/";
    if (user.roleName === ROLES.ADMIN) return "/admin";
    return "/dashboard";
  };

  return `
    <header class="sticky top-0 z-50 w-full border-b border-border-default/50 bg-[#0B0E14]/80 backdrop-blur-xl ${extraClasses}">
      <div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">

        <!-- LADO IZQUIERDO: LOGOTIPO -->
        <div class="flex items-center gap-6">
          <a href="${getHomePath()}" class="flex items-center transition-all hover:opacity-80 active:scale-95" data-nav>
            <img src="${horizontalLogoNegative}" alt="Altea" class="h-10 w-auto" />
            <span class="ml-3 hidden sm:inline-flex items-center rounded-full bg-[#8044F0]/10 px-2 py-0.5 text-[9px] font-black text-[#8044F0] border border-[#8044F0]/20 tracking-widest uppercase">
              V 1.0
            </span>
          </a>
        </div>

        <!-- CENTRO: COMANDO DE BÚSQUEDA (GLASS STYLE) -->
        <div class="hidden md:flex flex-1 max-w-md mx-8">
          <div class="group relative w-full">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <svg class="h-3.5 w-3.5 text-text-tertiary group-focus-within:text-[#8044F0] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Explorar conocimiento..." 
              class="h-9 w-full rounded-xl border border-border-default bg-[#161B26]/30 pl-10 pr-12 text-[11px] text-text-primary outline-none transition-all focus:border-[#8044F0]/50 focus:ring-4 focus:ring-[#8044F0]/5 placeholder:text-text-tertiary placeholder:uppercase placeholder:tracking-tighter"
              disabled
            />
            <div class="absolute inset-y-0 right-2 flex items-center">
              <kbd class="hidden sm:inline-flex h-5 items-center rounded-md border border-border-default px-1.5 font-mono text-[9px] font-black text-text-tertiary bg-[#0B0E14]">
                CMD K
              </kbd>
            </div>
          </div>
        </div>

        <!-- LADO DERECHO: IDENTIDAD -->
        <div class="flex items-center gap-4">
          ${
            user
              ? `
            <div class="flex items-center gap-4">
              <div class="h-4 w-px bg-border-default/60"></div>

              <div class="relative" data-profile-dropdown>
                <button
                  type="button"
                  class="group flex items-center gap-2 p-1 rounded-full transition-all hover:bg-white/5 active:scale-95"
                  data-profile-trigger
                  aria-haspopup="true"
                >
                  ${Avatar({ name: user.name || "U", size: "sm" })}
                  <svg class="w-3.5 h-3.5 text-text-tertiary group-hover:text-text-primary transition-colors" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>

                <!-- DROPDOWN MENU RE-DISEÑADO -->
                <div
                  class="absolute right-0 top-full mt-3 min-w-[260px] origin-top-right scale-95 overflow-hidden rounded-[24px] border border-border-default bg-[#161B26] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.8)] opacity-0 invisible transition-all duration-300 z-50 backdrop-blur-2xl"
                  data-profile-menu
                >
                  <div class="bg-gradient-to-br from-[#1F2430]/50 to-transparent px-6 py-5 border-b border-border-default">
                    <div class="flex flex-col">
                      <p class="text-[9px] font-black text-[#8044F0] uppercase tracking-[0.2em] mb-2">Sessión Iniciada</p>
                      <p class="text-sm font-bold text-text-primary font-heading tracking-tight truncate">${user.name}</p>
                      <p class="text-[11px] text-text-tertiary font-medium truncate mt-0.5 opacity-80">${user.email}</p>
                    </div>
                  </div>
                  
                  <div class="p-2 space-y-1">
                    <a href="/profile/${user.id}" data-nav class="group flex w-full items-center gap-3 px-4 py-3 text-xs font-bold text-text-secondary hover:bg-white/[0.03] hover:text-text-primary rounded-xl transition-all">
                    <div class="p-1.5 rounded-lg bg-[#0B0E14] border border-border-default group-hover:border-[#8044F0]/30">
                      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    Mi Identidad Pública
                  </a>
                    
                    <div class="mx-4 my-2 h-px bg-border-default/40"></div>

                    <button
                      type="button"
                      class="group flex w-full items-center gap-3 px-4 py-3 text-xs font-black text-state-error/80 hover:bg-state-error/5 hover:text-state-error rounded-xl transition-all tracking-widest uppercase"
                      data-logout
                    >
                      <div class="p-1.5 rounded-lg bg-state-error/10 border border-state-error/10 group-hover:border-state-error/30">
                         <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                      </div>
                      Finalizar Acceso
                    </button>
                  </div>
                </div>
              </div>
            </div>
          `
              : `
            <a href="/login" class="px-5 py-2 rounded-xl bg-brand-primary text-white text-xs font-black tracking-widest hover:bg-brand-hover shadow-lg shadow-brand-primary/20 transition-all active:scale-95 uppercase" data-nav>
              Identificarse
            </a>
          `
          }
        </div>
      </div>
    </header>
  `;
}

export function mountHeader() {
  const trigger = document.querySelector("[data-profile-trigger]");
  const menu = document.querySelector("[data-profile-menu]");

  if (trigger && menu) {
    const toggleMenu = (show) => {
      if (show) {
        menu.classList.remove("invisible", "opacity-0", "scale-95");
        menu.classList.add("visible", "opacity-100", "scale-100");
      } else {
        menu.classList.add("invisible", "opacity-0", "scale-95");
        menu.classList.remove("visible", "opacity-100", "scale-100");
      }
      trigger.setAttribute("aria-expanded", show);
    };

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const isVisible = menu.classList.contains("visible");
      toggleMenu(!isVisible);
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest("[data-profile-dropdown]")) {
        toggleMenu(false);
      }
    });
  }

  const logoutBtn = document.querySelector("[data-logout]");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      storage.clearToken();
      clearUser();
      navigate("/login");
    });
  }
}
