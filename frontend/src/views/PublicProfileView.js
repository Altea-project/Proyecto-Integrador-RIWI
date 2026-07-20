import { Header, mountHeader } from "../components/Header.js";
import { userProfileService } from "../services/userProfileService.js";
import { projectService } from "../services/projectService.js";

const AVAILABILITY_CONFIG = {
  available: {
    label: "Disponible",
    dot: "bg-state-success",
    text: "text-state-success",
    bg: "bg-state-success/10",
  },
  in_conversation: {
    label: "En conversaciones",
    dot: "bg-state-warning",
    text: "text-state-warning",
    bg: "bg-state-warning/10",
  },
  unavailable: {
    label: "No disponible",
    dot: "bg-text-tertiary",
    text: "text-text-tertiary",
    bg: "bg-text-tertiary/10",
  },
};

export function PublicProfileView() {
  return `
    ${Header({})}
    <main class="mx-auto max-w-4xl px-6 py-12 antialiased">
      <a href="/dashboard" data-nav 
         class="group inline-flex items-center gap-2 text-text-tertiary hover:text-text-primary transition-all duration-300 mb-10 font-body text-sm tracking-tight">
        <svg class="transition-transform duration-300 group-hover:-translate-x-1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Volver al panel
      </a>
      <div id="public-profile-content" class="space-y-12">
        <div class="animate-pulse flex flex-col gap-4">
           <div class="h-32 w-full bg-bg-secondary rounded-3xl"></div>
        </div>
      </div>
    </main>
  `;
}

export async function mountPublicProfileView(params) {
  mountHeader();
  const userId = params.id;
  const container = document.getElementById("public-profile-content");

  try {
    const [profile, projects] = await Promise.all([
      userProfileService.getPublicProfile(userId),
      projectService.getProjectsByUserId(userId),
    ]);

    const cfg =
      AVAILABILITY_CONFIG[profile.availabilityStatus] ||
      AVAILABILITY_CONFIG.unavailable;

    // --- LÓGICA DE AGREGACIÓN ---
    const allSkills = [
      ...new Set(projects.flatMap((p) => p.skills || []).map((s) => s.name)),
    ];
    const initials = profile.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    container.innerHTML = `
      <!-- Perfil de Ingeniería: Cabecera Principal -->
      <section class="relative group rounded-[40px] border border-white/[0.05] bg-[#0A0A0B] p-2 shadow-2xl overflow-hidden mb-16 transition-all duration-700 hover:border-brand-primary/20">
        <!-- Efecto de iluminación ambiental -->
        <div class="absolute -top-24 -left-24 h-64 w-64 bg-brand-primary/10 blur-[100px] pointer-events-none transition-all duration-700 group-hover:bg-brand-primary/20"></div>
        
        <div class="relative bg-bg-secondary rounded-[36px] p-8 md:p-14 border border-white/[0.03]">
          <div class="flex flex-col md:flex-row gap-10 items-start">
            
            <!-- Identificador Visual (Avatar) -->
            <div class="relative flex-shrink-0">
              <div class="h-28 w-28 rounded-[2rem] bg-gradient-to-br from-[#1A1A1B] to-bg-primary border border-white/[0.08] flex items-center justify-center font-heading text-4xl font-black text-brand-primary shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                ${initials}
              </div>
              <div class="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-bg-secondary border border-white/[0.05] flex items-center justify-center">
                 <div class="h-2.5 w-2.5 rounded-full ${cfg.dot} shadow-[0_0_15px_rgba(0,245,160,0.5)] animate-pulse"></div>
              </div>
            </div>

            <div class="flex-1 w-full space-y-8">
              <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div class="space-y-3">
                  <h1 class="font-heading text-5xl font-black tracking-tighter text-text-primary leading-[0.9]">
                    ${profile.name}
                  </h1>
                  <p class="font-body text-xl text-brand-primary font-bold italic tracking-tight opacity-90">
                    ${profile.roleName}
                  </p>
                </div>
                
                <div class="flex flex-wrap gap-3">
                   <span class="inline-flex items-center gap-2.5 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] border border-white/[0.08] bg-white/[0.02] text-text-tertiary">
                    ${profile.name.split(" ")[0]} / ID Público
                   </span>
                </div>
              </div>

              <!-- Bloque de Verificación y Estado -->
              <div class="flex flex-wrap items-center gap-6 pt-4 border-t border-white/[0.03]">
                ${
                  profile.tlName
                    ? `
                  <div class="flex items-center gap-4 group/tl">
                    <span class="text-[10px] font-black uppercase tracking-widest text-text-tertiary opacity-50 text-white italic">Validado por</span>
                    <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-primary/5 border border-brand-primary/10 transition-colors group-hover/tl:bg-brand-primary/10">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="text-brand-primary"><path d="M20 6L9 17l-5-5"/></svg>
                      <span class="text-[11px] font-black text-text-primary uppercase tracking-wider">@${profile.tlName}</span>
                    </div>
                  </div>
                `
                    : ""
                }
                
                <div class="h-4 w-px bg-white/[0.05] hidden md:block"></div>

                      <div class="flex items-center gap-3">
                        <!-- Etiqueta técnica sobre la situación de empleo -->
                        <span class="text-[10px] font-black uppercase tracking-widest text-text-tertiary opacity-50 text-white italic underline underline-offset-8 decoration-brand-primary/30">
                          Disponibilidad Laboral
                        </span>
                        
                        <!-- El estado real (Disponible, En conversaciones, etc.) con un fondo sutil -->
                        <span class="px-3 py-1 rounded-md bg-white/5 border border-white/[0.05] text-[11px] font-bold text-text-primary tracking-tight shadow-sm">
                          ${cfg.label}
                        </span>
                      </div>
              </div>

              <!-- Stack Tecnológico Principal -->
              ${
                allSkills.length > 0
                  ? `
                <div class="space-y-4 pt-4">
                   <div class="flex flex-wrap gap-2.5">
                     ${allSkills
                       .map(
                         (skill) => `
                      <span class="px-3 py-1.5 rounded-lg bg-[#141415] border border-white/[0.05] text-[10px] font-black text-text-secondary uppercase tracking-widest transition-all hover:border-brand-primary/30 hover:text-white cursor-default select-none shadow-sm">
                        ${skill}
                      </span>`,
                       )
                       .join("")}
                   </div>
                </div>
              `
                  : ""
              }
            </div>
          </div>
        </div>
      </section>

      <!-- Galería de Evidencia Técnica -->
      <div class="space-y-10">
        <header class="flex items-end justify-between px-2">
          <div class="space-y-2">
            <h2 class="font-heading text-3xl font-black text-text-primary tracking-tighter uppercase italic leading-none">
              Matriz de Proyectos
            </h2>
            <div class="h-1.5 w-12 bg-brand-primary rounded-full"></div>
          </div>
          <span class="text-[10px] font-black text-text-tertiary tracking-[0.3em] uppercase mb-1">Total / ${projects.length} Publicaciones</span>
        </header>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          ${
            projects.length === 0
              ? `<div class="col-span-full py-24 text-center rounded-[32px] border border-dashed border-white/10 italic text-text-tertiary">El coder aún no ha cargado su galería...</div>`
              : projects
                  .map(
                    (p) => `
                <article class="group relative flex flex-col justify-between rounded-[2rem] border border-white/[0.05] bg-[#121213] p-8 transition-all duration-500 hover:-translate-y-3 hover:border-brand-primary/30 hover:bg-[#161618] hover:shadow-[0_40px_80px_rgba(0,0,0,0.5)] overflow-hidden">
                  <!-- Efecto hover interno -->
                  <div class="absolute -right-10 -top-10 h-32 w-32 bg-brand-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div class="relative z-10 space-y-6">
                    <div class="flex justify-between items-center">
                      <div class="h-12 w-12 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center transition-all group-hover:border-brand-primary/20 group-hover:bg-brand-primary/5">
                        <svg class="text-text-tertiary group-hover:text-brand-primary transition-all duration-500" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                        </svg>
                      </div>
                      <span class="text-[9px] font-black uppercase tracking-[0.2em] text-text-tertiary opacity-30 group-hover:opacity-100 transition-opacity italic underline underline-offset-4">Publicación Verificada</span>
                    </div>
                    
                    <h3 class="font-heading text-2xl font-bold text-text-primary tracking-tighter leading-tight italic group-hover:text-brand-primary transition-colors">
                       ${p.title}
                    </h3>
                    
                    <p class="font-body text-sm text-text-tertiary leading-relaxed opacity-60 group-hover:opacity-100 line-clamp-3">
                      ${p.description}
                    </p>

                    <!-- Tags Tecnológicos del Proyecto -->
                    <div class="flex flex-wrap gap-x-4 gap-y-2 pt-2 italic">
                       ${(p.skills || [])
                         .map(
                           (s) => `
                        <span class="text-[10px] font-bold uppercase tracking-wider text-brand-primary group-hover:translate-x-1 transition-transform cursor-default">
                          #${s.name}
                        </span>`,
                         )
                         .join("")}
                    </div>
                  </div>
                  
                  <div class="relative z-10 mt-10 pt-6 border-t border-white/[0.05]">
                    <a href="${p.repo_url}" target="_blank" rel="noopener" 
                       class="group/btn relative inline-flex items-center justify-center gap-3 w-full py-4 rounded-xl border border-white/[0.08] bg-white/[0.02] text-[11px] font-black uppercase tracking-[0.2em] text-text-primary transition-all duration-500 overflow-hidden hover:bg-brand-primary hover:text-bg-secondary">
                      <span class="relative z-10">Explorar Repositorio <span>→</span></span>
                    </a>
                  </div>
                </article>
              `,
                  )
                  .join("")
          }
        </div>
      </div>
    `;
  } catch (error) {
    container.innerHTML = `
      <div class="py-24 text-center">
         <p class="text-xs font-black uppercase tracking-[0.4em] text-text-tertiary opacity-50 italic animate-pulse">
            Error de carga: el perfil es inaccesible en este momento.
         </p>
      </div>`;
  }
}
