import { Header, mountHeader } from "../components/Header.js";
import { Button } from "../components/Button.js";
import { Modal } from "../components/AdminModal.js";
import { Input } from "../components/Input.js";
import { showToast } from "../components/Toast.js";
import { userProfileService } from "../services/userProfileService.js";
import { skillService } from "../services/skillsService.js";
import { projectService } from "../services/projectService.js";
import { navigate } from "../router/router.js";

const AVAILABILITY_CONFIG = {
  available: {
    label: "Disponible para oportunidades",
    dot: "bg-[#00f5a0]", // Verde neón
    text: "text-[#00f5a0]",
    bg: "bg-[#00f5a0]/5",
    border: "border-[#00f5a0]/20",
  },
  in_conversation: {
    label: "En conversaciones",
    dot: "bg-state-warning",
    text: "text-state-warning",
    bg: "bg-state-warning/10",
    border: "border-state-warning/20",
  },
  unavailable: {
    label: "No disponible",
    dot: "bg-text-tertiary",
    text: "text-text-tertiary",
    bg: "bg-text-tertiary/10",
    border: "border-text-tertiary/20",
  },
};

let profile = null;
let projects = [];
let skills = [];

function renderAvailabilityBanner(status) {
  const cfg = AVAILABILITY_CONFIG[status] || AVAILABILITY_CONFIG.unavailable;
  return `
    <div class="group relative flex items-center justify-between rounded-xl border ${cfg.border} ${cfg.bg} px-5 py-3.5 mb-10 overflow-hidden">
      <div class="flex items-center gap-4 relative z-10">
        <span class="relative flex h-2.5 w-2.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${cfg.dot} opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 ${cfg.dot}"></span>
        </span>
        <div class="flex flex-col">
          <span class="font-heading text-sm font-bold tracking-tight ${cfg.text}">${cfg.label}</span>
          <p class="text-[10px] text-text-tertiary opacity-70">Estado verificado · Solo Admin o TL pueden modificarlo</p>
        </div>
      </div>
      <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#00f5a0]/30 bg-[#00f5a0]/5">
         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00f5a0" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
         <span class="text-[10px] font-bold text-[#00f5a0] uppercase tracking-wider">Verificado</span>
      </div>
    </div>
  `;
}

function renderTopCards() {
  return `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
      <!-- Card 1: CV e Identidad -->
      <div class="group relative rounded-2xl border border-white/5 bg-[#121b21] p-6 shadow-2xl hover:border-cyan-500/30 transition-all overflow-hidden">
        <div class="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-cyan-500/5 blur-2xl group-hover:bg-cyan-500/10 transition-all"></div>
        
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-600/20 mb-6 border border-cyan-600/30 text-cyan-400 group-hover:scale-110 transition-transform duration-500">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg>
        </div>
        
        <div class="flex flex-col gap-1">
          <h3 class="font-heading text-xl font-bold text-text-primary tracking-tight">CV e Identidad</h3>
          <p class="font-body text-xs text-text-tertiary tracking-wide leading-relaxed mb-6 opacity-80">Tu perfil público verificado y disponible para descarga en PDF.</p>
        </div>

        <div class="flex items-center gap-3">
          <a href="/profile/${profile.id}" data-nav class="flex-[3] py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] font-black text-cyan-300 text-center uppercase tracking-[0.15em] hover:bg-cyan-500 hover:text-bg-secondary hover:border-transparent transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
            Ver mi Perfil Público
          </a>
          
          <!-- Botón de descarga deshabilitado con tooltip visual -->
          <div class="relative group/tooltip flex-1">
            <button disabled class="w-full flex items-center justify-center py-3 rounded-xl bg-white/5 border border-white/10 text-text-tertiary cursor-not-allowed opacity-40 transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            </button>
            
            <!-- Tooltip "Pronto" -->
            <span class="absolute -top-10 left-1/2 -translate-x-1/2 scale-0 group-hover/tooltip:scale-100 transition-all duration-200 bg-bg-secondary border border-white/10 text-[9px] font-black text-cyan-400 uppercase tracking-widest px-3 py-1.5 rounded-lg whitespace-nowrap shadow-2xl pointer-events-none">
              Disponible pronto
            </span>
          </div>
        </div>
      </div>

      <!-- Card 2: Red y Sinergia -->
      <div class="relative group rounded-2xl border border-white/5 bg-[#121417]/40 p-6 shadow-2xl opacity-60 border-dashed transition-all overflow-hidden">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 mb-6 border border-white/5 text-text-tertiary/50">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        
        <h3 class="font-heading text-xl font-bold text-text-primary/50 tracking-tight italic">Red y Sinergia</h3>
        <p class="font-body text-xs text-text-tertiary mt-1 mb-6 opacity-60 italic">Networking estratégico para potenciar tu carrera profesional.</p>
        
        <div class="w-full py-3.5 rounded-xl border border-white/5 bg-transparent text-[10px] font-bold text-text-tertiary uppercase text-center tracking-[0.25em] cursor-help hover:text-white transition-colors duration-500">
           Próximamente
        </div>
      </div>
    </div>
  `;
}

function renderTlCard() {
  return `
    <div class="rounded-2xl border border-border-default bg-bg-secondary p-5">
      <h3 class="font-heading text-xs font-bold text-text-tertiary uppercase tracking-wide mb-3">Mi Team Leader</h3>
      ${
        profile.tlName
          ? `<p class="font-body text-sm font-semibold text-text-primary">${profile.tlName}</p>`
          : `<p class="font-body text-sm text-text-tertiary">Sin asignar todavía</p>`
      }
    </div>
  `;
}

function renderProjectRow(p) {
  // Logica de colores basada en si esta calificado o no
  const scoreBadge = p.graded
    ? `<div class="inline-flex items-center gap-2 rounded-lg bg-[#00f5a0]/5 border border-[#00f5a0]/20 px-3 py-1.5 group-hover:scale-105 transition-all">
         <span class="h-1.5 w-1.5 rounded-full bg-[#00f5a0] animate-pulse"></span>
         <span class="text-[11px] font-black text-[#00f5a0]">Calificado <span class="ml-2 bg-[#00f5a0]/10 px-2 py-0.5 rounded text-white italic font-medium tracking-normal border border-[#00f5a0]/10">${p.score}</span></span>
       </div>`
    : `<span class="text-[10px] font-bold text-text-tertiary uppercase tracking-widest px-3 py-1.5 border border-border-default rounded-lg">Sin calificar</span>`;

  return `
    <tr class="group border-b border-white/[0.03] hover:bg-white/[0.03] transition-all cursor-pointer h-[70px]" data-project-row="${p.id}">
      <td class="py-4 px-6">
        <div class="flex items-center gap-4">
           <!-- Icono basado en azar o extension del repo -->
           <div class="p-2.5 rounded-lg bg-[#161221] border border-white/5 text-purple-400">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
           </div>
           <div class="flex flex-col">
             <div class="flex items-center gap-2">
                <span class="font-heading text-[13px] font-bold text-text-primary tracking-wide transition-colors group-hover:text-purple-400 group-hover:translate-x-1 duration-300 transition-transform flex items-center gap-2">
                   ${p.title} 
                   ${p.starred ? '<span class="text-amber-400 text-xs">★</span>' : ""}
                </span>
             </div>
             <span class="text-[10px] text-text-tertiary tracking-wide font-medium mt-0.5 capitalize opacity-60">${new Date().toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}</span>
           </div>
        </div>
      </td>
      <td class="py-4 px-4">
         <div class="flex gap-1.5 max-w-[200px] flex-wrap">
            ${(p.skills || [])
              .slice(0, 2)
              .map(
                (s) =>
                  `<span class="px-2 py-0.5 rounded bg-brand-primary/5 border border-brand-primary/10 text-[9px] font-bold text-brand-primary uppercase">${s.name}</span>`,
              )
              .join("")}
            ${p.skills?.length > 2 ? `<span class="text-[9px] font-bold text-text-tertiary ml-1">+${p.skills.length - 2}</span>` : ""}
         </div>
      </td>
      <td class="py-4 px-4">${scoreBadge}</td>
      <td class="py-4 px-6 text-right">
        <span class="inline-block py-1 px-3 rounded-md bg-[#00f5a0]/5 text-[#00f5a0] text-[9px] font-bold uppercase tracking-wider italic border border-[#00f5a0]/20 group-hover:bg-[#00f5a0] group-hover:text-bg-secondary transition-colors transition-all duration-300">Publicado</span>
      </td>
    </tr>
  `;
}

function renderProjectsTable() {
  if (projects.length === 0) {
    return `
      <div class="rounded-2xl border border-dashed border-border-default p-10 text-center">
        <p class="font-body text-sm text-text-tertiary">Todavía no subiste ningún proyecto.</p>
      </div>
    `;
  }

  return `
    <table class="w-full text-left">
      <thead>
        <tr class="border-b border-border-default text-[10px] font-bold text-text-tertiary uppercase tracking-wide">
          <th class="py-3 px-4">Proyecto</th>
          <th class="py-3 px-4">Tipo</th>
          <th class="py-3 px-4">Calificación</th>
        </tr>
      </thead>
      <tbody>
        ${projects.map((p) => renderProjectRow(p)).join("")}
      </tbody>
    </table>
  `;
}

function renderUploadProjectModal() {
  return Modal({
    id: "modal-upload-project",
    title: "Project Forge",
    size: "md",
    content: `
      <form id="upload-project-form" class="space-y-6 antialiased" novalidate>
        <!-- Header del Form -->
        <div class="mb-2">
          <p class="text-[11px] font-black uppercase tracking-[0.2em] text-purple-400 opacity-80">Configuración Técnica</p>
          <p class="text-xs text-text-tertiary mt-1">Define los parámetros de tu nueva obra maestra.</p>
        </div>

        <!-- Sección: Información Principal -->
        <div class="grid grid-cols-1 gap-5 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <div class="space-y-1.5">
            ${Input({ id: "project-title", label: "Nombre del Proyecto", placeholder: "Ej. Obsidian Backend Core" })}
            <p id="project-title-error" class="text-error-400 text-[10px] font-bold mt-1 hidden" role="alert"></p>
          </div>

          <div class="flex flex-col gap-2">
            <label for="project-description" class="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">
              Descripción Ejecutiva
            </label>
            <textarea id="project-description" rows="3" 
              placeholder="Explica el desafío técnico y tu solución..."
              class="w-full bg-[#0f1114] border border-white/10 rounded-xl px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-tertiary/50 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300 resize-none leading-relaxed"
            ></textarea>
            <p id="project-description-error" class="text-error-400 text-[10px] font-bold mt-1 hidden" role="alert"></p>
          </div>
        </div>

        <!-- Sección: Media e Identidad -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-4">
             <div class="space-y-1.5">
               ${Input({ id: "project-image-url", label: "Imagen Cover (URL)", placeholder: "Unsplash / Cloudinary..." })}
             </div>
             <!-- Preview de Imagen Minimalista -->
             <div id="project-image-preview" class="group relative hidden rounded-xl overflow-hidden border border-white/10 aspect-video bg-[#0f1114]">
               <img id="project-image-preview-img" src="" alt="Vista previa" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
               <div class="absolute inset-0 bg-gradient-to-t from-[#0f1114] to-transparent opacity-60"></div>
             </div>
          </div>

          <div class="space-y-4">
             ${Input({ id: "project-repo-url", label: "Repositorio GitHub", placeholder: "github.com/..." })}
             <p id="project-repo-url-error" class="text-error-400 text-[10px] font-bold mt-1 hidden" role="alert"></p>
             ${Input({ id: "project-demo-url", label: "Deployment / Demo", placeholder: "Vercel / Netlify / AWS..." })}
          </div>
        </div>

        <!-- Sección: Clasificación y Habilidades -->
        <div class="pt-4 border-t border-white/5 space-y-6">
          <div class="flex flex-col sm:flex-row gap-6 sm:items-center justify-between bg-purple-500/[0.03] p-4 rounded-xl border border-purple-500/10">
            <div class="space-y-0.5">
               <span class="text-xs font-bold text-text-primary">¿Es un proyecto externo?</span>
               <p class="text-[10px] text-text-tertiary">Iniciativa propia fuera del bootcamp.</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input id="project-is-external" type="checkbox" class="sr-only peer">
              <div class="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div class="space-y-3">
            <span class="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1 block">Stack Tecnológico</span>
            <div id="project-skills-list" class="flex flex-wrap gap-2.5 max-h-[120px] overflow-y-auto scrollbar-hide">
              <div class="flex items-center gap-2 py-4 italic text-xs text-text-tertiary animate-pulse">
                <div class="h-2 w-2 rounded-full bg-purple-600"></div> Sincronizando tecnologías...
              </div>
            </div>
          </div>
        </div>

        <p id="upload-project-form-error" class="bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold p-3 rounded-lg text-center hidden" role="alert"></p>
      </form>
    `,
    footer: `
      <div class="flex items-center justify-end gap-4 w-full pt-2">
        <button type="button" data-modal-close="modal-upload-project" class="text-xs font-bold text-text-tertiary hover:text-white uppercase tracking-widest transition-colors duration-200">
          Descartar
        </button>
        <button type="button" id="upload-project-submit-btn" class="relative group px-8 py-3.5 rounded-xl bg-purple-600 text-white text-[11px] font-black uppercase tracking-[0.1em] overflow-hidden transition-all hover:bg-purple-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] active:scale-95 duration-200">
          <span class="relative z-10 italic">Lanzar Proyecto</span>
          <div class="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>
      </div>
    `,
  });
}

export function CoderDashboard() {
  return `
    ${Header({})}
    <main class="mx-auto max-w-6xl px-6 py-8" data-coder-container>
      <div id="dashboard-content">
        <p class="font-body text-sm text-text-tertiary">Cargando...</p>
      </div>
    </main>
    ${renderUploadProjectModal()}
  `;
}

function renderFullDashboard() {
  const container = document.getElementById("dashboard-content");
  if (!container) return;

  const dateStr = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  container.innerHTML = `
    <!-- Disponibilidad -->
    ${renderAvailabilityBanner(profile.availabilityStatus)}
    
    <div class="mb-10 px-1">
      <p class="text-[10px] text-purple-400/80 font-black uppercase tracking-[0.3em] mb-3">${dateStr}</p>
      <h1 class="font-heading text-4xl font-black text-text-primary tracking-tight">Bienvenido de vuelta, ${profile.name.split(" ")[0]} 👋</h1>
    </div>

    <!-- Cards Superiores -->
    ${renderTopCards()}

    <!-- Área Principal de Proyectos -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- Tabla (Columna Izquierda) -->
      <div class="lg:col-span-8">
        <div class="rounded-2xl border border-white/5 bg-[#0f1114] shadow-2xl overflow-hidden backdrop-blur-xl">
          <div class="flex flex-col sm:flex-row items-center justify-between px-6 py-6 border-b border-white/[0.03] gap-4">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-purple-600/10 border border-purple-500/20">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              </div>
              <h2 class="font-heading text-[12px] font-black text-text-primary uppercase tracking-[0.2em]">Matriz de Proyectos <span class="ml-2 text-purple-400 opacity-60">${projects.length}</span></h2>
            </div>
            
            <button type="button" data-action="open-upload-project-modal" class="group relative px-6 py-3 rounded-xl bg-purple-600 text-white text-[11px] font-black uppercase tracking-wider transition-all hover:bg-purple-500 hover:scale-105 active:scale-95 duration-200">
               + Nuevo Proyecto
            </button>
          </div>
          
          <div class="overflow-x-auto min-h-[400px]" id="projects-table-wrapper">
             ${renderProjectsTable()}
          </div>
        </div>
      </div>

      <!-- Sidebar (Columna Derecha) -->
      <aside class="lg:col-span-4 flex flex-col gap-6">
         <!-- Card de Team Leader -->
         <div class="p-8 rounded-3xl border border-white/5 bg-[#121417] shadow-xl overflow-hidden group relative">
            <div class="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-purple-600/5 blur-2xl"></div>
            <h4 class="text-[10px] font-bold uppercase tracking-[0.2em] text-text-tertiary mb-8 opacity-40">Responsable de Revisión</h4>
            <div class="flex items-center gap-5">
               <div class="h-16 w-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 p-[1.5px] shadow-2xl">
                 <div class="w-full h-full rounded-2xl bg-[#0f1114] flex items-center justify-center font-heading text-xl font-black text-white">
                    ${profile.tlName ? profile.tlName.substring(0, 2).toUpperCase() : "NA"}
                 </div>
               </div>
               <div class="flex flex-col">
                 <p class="font-heading text-lg font-bold text-text-primary italic">${profile.tlName || "Mateo Herrera"}</p>
                 <span class="text-[10px] text-purple-400 tracking-[0.1em] uppercase font-bold mt-0.5">Senior Team Lead</span>
               </div>
            </div>
            <div class="flex items-center gap-2.5 mt-8 py-2.5 px-4 rounded-xl bg-[#00f5a0]/5 border border-[#00f5a0]/10">
               <span class="relative flex h-2 w-2">
                 <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f5a0] opacity-75"></span>
                 <span class="relative inline-flex rounded-full h-2 w-2 bg-[#00f5a0]"></span>
               </span>
               <span class="text-[9px] font-bold text-[#00f5a0] uppercase tracking-widest">Activo hace un momento</span>
            </div>
            <button class="w-full mt-6 py-4 rounded-xl border border-white/5 bg-white/5 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] hover:bg-white/[0.08] hover:text-white transition-all active:scale-95">Solicitar Revisión</button>
         </div>
      </aside>
    </div>
  `;

  // === SOLUCIÓN: RE-VINCULACIÓN DE EVENTOS ===

  // 1. Click en las filas (Navigation)
  container.querySelectorAll("[data-project-row]").forEach((row) => {
    row.addEventListener("click", () => {
      const projectId = row.dataset.projectRow;
      navigate(`/project/${projectId}`);
    });
  });

  // 2. Links con data-nav
  container.querySelectorAll("[data-nav]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navigate(link.getAttribute("href"));
    });
  });

  // 3. Botón de Modal (vuelve a activar el botón después de renderizar)
  bindOpenUploadProjectModal();
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove("opacity-0", "invisible");
  document.body.style.overflow = "hidden";
  bindModalCloseEvents();
}

function hideModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add("opacity-0", "invisible");
  document.body.style.overflow = "";
}

function bindModalCloseEvents() {
  document.querySelectorAll("[data-modal-close]").forEach((el) => {
    el.addEventListener("click", () => hideModal(el.dataset.modalClose));
  });
}

async function loadDashboardData() {
  try {
    const [profileData, projectsData] = await Promise.all([
      userProfileService.getMyProfile(),
      projectService.getMyProjects(),
    ]);
    profile = profileData;
    projects = projectsData;
    renderFullDashboard();
  } catch (error) {
    showToast("No pudimos cargar tu dashboard", "error");
  }
}

function bindOpenUploadProjectModal() {
  document
    .querySelector('[data-action="open-upload-project-modal"]')
    ?.addEventListener("click", () => {
      resetUploadProjectForm();
      openModal("modal-upload-project");
      loadSkillsIntoModal();
    });
}

async function loadSkillsIntoModal() {
  const container = document.getElementById("project-skills-list");
  if (!container) return;
  try {
    skills = await skillService.getSkills();
  } catch {
    container.innerHTML = `<p class="font-body text-xs text-error-400">Error al cargar stack.</p>`;
    return;
  }

  // Plantilla para chips interactivos
  container.innerHTML = skills
    .map(
      (s) => `
    <label class="group relative flex items-center cursor-pointer">
      <input type="checkbox" value="${s.id}" data-skill-checkbox class="peer hidden" />
      <div class="flex items-center px-4 py-2 rounded-xl bg-[#0f1114] border border-white/5 text-[11px] font-bold text-text-tertiary transition-all duration-300 group-hover:border-purple-500/30 peer-checked:bg-purple-600 peer-checked:text-white peer-checked:border-transparent peer-checked:shadow-[0_0_15px_rgba(168,85,247,0.25)] select-none">
        <span class="mr-2 h-1.5 w-1.5 rounded-full bg-purple-600 group-hover:scale-125 transition-transform peer-checked:bg-white/80"></span>
        ${s.name}
      </div>
    </label>
  `,
    )
    .join("");
}

function showFieldError(id, message) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = message;
    el.classList.remove("hidden");
  }
}

function clearUploadFormErrors() {
  [
    "project-title-error",
    "project-description-error",
    "project-repo-url-error",
    "upload-project-form-error",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = "";
      el.classList.add("hidden");
    }
  });
}

function resetUploadProjectForm() {
  [
    "project-title",
    "project-repo-url",
    "project-image-url",
    "project-demo-url",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  const description = document.getElementById("project-description");
  if (description) description.value = "";
  document.getElementById("project-is-external").checked = false;
  document
    .querySelectorAll("[data-skill-checkbox]")
    .forEach((cb) => (cb.checked = false));
  document.getElementById("project-image-preview")?.classList.add("hidden");
  clearUploadFormErrors();
}

function bindImagePreview() {
  const input = document.getElementById("project-image-url");
  const preview = document.getElementById("project-image-preview");
  const previewImg = document.getElementById("project-image-preview-img");
  input?.addEventListener("input", () => {
    const url = input.value.trim();
    if (url) {
      previewImg.src = url;
      preview.classList.remove("hidden");
    } else {
      preview.classList.add("hidden");
    }
  });
}

async function handleUploadProject() {
  clearUploadFormErrors();

  const title = document.getElementById("project-title")?.value?.trim();
  const description = document
    .getElementById("project-description")
    ?.value?.trim();
  const repoUrl = document.getElementById("project-repo-url")?.value?.trim();
  const imageUrl =
    document.getElementById("project-image-url")?.value?.trim() || undefined;
  const isExternal =
    document.getElementById("project-is-external")?.checked || false;
  const skillIds = Array.from(
    document.querySelectorAll("[data-skill-checkbox]:checked"),
  ).map((cb) => Number(cb.value));

  let valid = true;
  if (!title) {
    showFieldError("project-title-error", "El título es obligatorio");
    valid = false;
  }
  if (!description) {
    showFieldError(
      "project-description-error",
      "La descripción es obligatoria",
    );
    valid = false;
  }
  if (!repoUrl) {
    showFieldError("project-repo-url-error", "El repositorio es obligatorio");
    valid = false;
  }
  if (!valid) return;

  const submitBtn = document.getElementById("upload-project-submit-btn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Lanzando...";

  try {
    await projectService.createProject({
      title,
      description,
      repoUrl,
      imageUrl,
      isExternal,
      skillIds: skillIds.length > 0 ? skillIds : undefined,
    });
    hideModal("modal-upload-project");
    resetUploadProjectForm();
    showToast("Proyecto lanzado correctamente", "success");
    await loadDashboardData();
  } catch (error) {
    const message =
      (error.body && error.body.error) || "No pudimos subir el proyecto.";
    showFieldError("upload-project-form-error", message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Lanzar Proyecto";
  }
}

export async function mountCoderDashboard() {
  mountHeader();
  profile = null;
  projects = [];
  skills = [];

  document
    .querySelector("[data-coder-container]")
    ?.addEventListener("click", (e) => {
      if (e.target.closest('[data-action="open-upload-project-modal"]')) {
        resetUploadProjectForm();
        openModal("modal-upload-project");
        loadSkillsIntoModal();
      }
    });

  bindModalCloseEvents();
  bindImagePreview();
  document
    .getElementById("upload-project-submit-btn")
    ?.addEventListener("click", handleUploadProject);

  await loadDashboardData();
}
