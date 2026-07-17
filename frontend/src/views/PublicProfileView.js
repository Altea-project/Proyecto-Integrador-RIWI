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

    container.innerHTML = `
  <!-- Profile Header Card -->
  <section class="relative overflow-hidden rounded-3xl border border-border-default bg-bg-secondary p-8 shadow-sm transition-all duration-500 hover:shadow-md hover:border-border-primary/50">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="space-y-2">
        <div class="inline-flex items-center gap-3">
          <h1 class="font-heading text-3xl font-bold tracking-tight text-text-primary">${profile.name}</h1>
          <span class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider shadow-sm ${cfg.bg} ${cfg.text} border border-current/10">
            <span class="h-1.5 w-1.5 rounded-full ${cfg.dot} animate-pulse"></span>
            ${cfg.label}
          </span>
        </div>
        <p class="font-body text-base text-text-secondary leading-relaxed capitalize">
          ${profile.roleName}
        </p>
        ${
          profile.tlName
            ? `<div class="flex items-center gap-2 mt-4 pt-4 border-t border-border-default/50">
                 <span class="text-[10px] uppercase tracking-widest text-text-tertiary font-bold">Verificado por</span>
                 <span class="text-xs px-2 py-0.5 rounded bg-brand-primary/5 text-brand-primary font-bold tracking-tight border border-brand-primary/10">${profile.tlName}</span>
               </div>`
            : ""
        }
      </div>
    </div>
  </section>

  <!-- Projects Section -->
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <h2 class="font-heading text-xl font-bold text-text-primary tracking-tight">Proyectos Destacados</h2>
      <div class="h-px flex-1 bg-gradient-to-r from-border-default to-transparent"></div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      ${
        projects.length === 0
          ? `<div class="col-span-full py-20 text-center rounded-3xl border border-dashed border-border-default">
               <p class="font-body text-sm text-text-tertiary">El talento aún no ha publicado proyectos.</p>
             </div>`
          : projects
              .map(
                (p) => `
            <div class="group relative flex flex-col justify-between rounded-2xl border border-border-default bg-bg-secondary p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div>
                <div class="flex justify-between items-start mb-3">
                  <div class="p-2 rounded-lg bg-bg-primary border border-border-default group-hover:border-brand-primary/20 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="text-text-tertiary group-hover:text-brand-primary transition-colors" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                </div>
                <h3 class="font-heading text-lg font-bold text-text-primary group-hover:text-brand-primary transition-colors">${p.title}</h3>
                <p class="font-body text-sm text-text-secondary mt-2 line-clamp-3 leading-relaxed">${p.description}</p>
              </div>
              
              <div class="mt-6 pt-4 border-t border-border-default/50">
                <a href="${p.repo_url}" target="_blank" rel="noopener" 
                   class="inline-flex items-center gap-2 text-xs font-bold text-brand-primary transition-all hover:gap-3">
                  Explorar Repositorio
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </a>
              </div>
            </div>
          `,
              )
              .join("")
      }
    </div>
  </div>
`;
  } catch (error) {
    container.innerHTML = `<p class="font-body text-sm text-state-error">No pudimos cargar este perfil.</p>`;
  }
}
