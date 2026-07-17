import { Header, mountHeader } from "../components/Header.js";
import { Button } from "../components/Button.js";
import { Modal } from "../components/AdminModal.js";
import { Input } from "../components/Input.js";
import { showToast } from "../components/Toast.js";
import { userProfileService } from "../services/userProfileService.js";
import { skillService } from "../services/skillsService.js";
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

let profile = null;
let skills = [];

function renderAvailabilityBadge(status) {
  const cfg = AVAILABILITY_CONFIG[status] || AVAILABILITY_CONFIG.unavailable;
  return `
    <span class="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold font-body ${cfg.bg} ${cfg.text}">
      <span class="h-2 w-2 rounded-full ${cfg.dot}"></span>
      ${cfg.label}
    </span>
  `;
}

function renderProfileSection() {
  if (!profile)
    return `<div class="h-28 w-full bg-bg-secondary rounded-2xl animate-pulse"></div>`;

  return `
    <header class="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8 rounded-3xl border border-border-default bg-gradient-to-br from-bg-secondary to-bg-secondary/50 shadow-sm overflow-hidden">
      <!-- Glow effect sutil -->
      <div class="absolute -top-24 -left-24 h-48 w-48 bg-brand-primary/10 blur-[100px] pointer-events-none"></div>
      
      <div class="z-10">
        <h1 class="font-heading text-2xl font-bold tracking-tight text-text-primary">Dashboard</h1>
        <p class="font-body text-sm text-text-tertiary mt-1">Administra tus proyectos y presencia técnica</p>
        
        <div class="mt-4 flex flex-wrap items-center gap-4">
           <div class="px-4 py-2 rounded-xl bg-bg-primary/60 border border-border-default/50 flex flex-col">
             <span class="text-[9px] font-bold text-text-tertiary uppercase tracking-widest">Coder</span>
             <span class="text-sm font-bold text-text-primary">${profile.name}</span>
           </div>
           <div class="px-4 py-2 rounded-xl bg-bg-primary/60 border border-border-default/50 flex flex-col">
             <span class="text-[9px] font-bold text-text-tertiary uppercase tracking-widest">Líder asignado</span>
             <span class="text-sm font-bold text-text-primary italic">@${profile.tlName || "Pending"}</span>
           </div>
        </div>
      </div>

      <div class="z-10 flex flex-col items-end gap-2">
        ${renderAvailabilityBadge(profile.availabilityStatus)}
        <span class="text-[10px] font-medium text-text-tertiary">${profile.email.toLowerCase()}</span>
      </div>
    </header>
  `;
}

function renderUploadProjectModal() {
  return Modal({
    id: "modal-upload-project",
    title: "Crear Nuevo Proyecto",
    size: "md",
    content: `
      <form id="upload-project-form" class="space-y-6" novalidate>
        <!-- Grupo de Información Principal -->
        <div class="space-y-4">
          <div class="group">
            ${Input({
              id: "project-title",
              label: "Título del Proyecto",
              placeholder: "Ej: E-commerce Refined UI",
            })}
            <p id="project-title-error" class="text-error-500 text-[11px] font-medium mt-1.5 ml-1 hidden transition-all" role="alert"></p>
          </div>

          <div class="flex flex-col gap-2">
            <label for="project-description" class="font-heading font-bold text-[11px] text-text-tertiary uppercase tracking-widest ml-1">
              Descripción del proyecto
            </label>
            <textarea
              id="project-description"
              rows="4"
              placeholder="¿Qué problema resuelve este proyecto y qué tecnologías usaste?"
              class="w-full bg-bg-primary/50 border border-border-default rounded-xl px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all duration-300 resize-none leading-relaxed"
            ></textarea>
            <p id="project-description-error" class="text-error-500 text-[11px] font-medium mt-1 hidden" role="alert"></p>
          </div>
        </div>

        <!-- Enlaces e Imágenes -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1">
            ${Input({ id: "project-repo-url", label: "Repositorio (GitHub)", placeholder: "https://github.com..." })}
            <p id="project-repo-url-error" class="text-error-500 text-[11px] font-medium mt-1 hidden" role="alert"></p>
          </div>
          <div class="space-y-1">
            ${Input({ id: "project-image-url", label: "Cover (URL)", placeholder: "https://images.unsplash..." })}
          </div>
        </div>

        <!-- Opciones y Habilidades -->
        <div class="pt-4 border-t border-border-default/50 space-y-5">
          <label class="group flex items-center gap-3 cursor-pointer select-none">
            <div class="relative flex items-center justify-center">
              <input id="project-is-external" type="checkbox" class="peer h-5 w-5 appearance-none rounded-md border border-border-default bg-bg-primary checked:bg-brand-primary checked:border-brand-primary transition-all duration-200" />
              <svg class="absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="4"><path d="M5 13l4 4L19 7"></path></svg>
            </div>
            <span class="font-body text-sm text-text-secondary group-hover:text-text-primary transition-colors italic">Iniciativa propia o externa</span>
          </label>

          <div class="space-y-3">
            <span class="font-heading font-bold text-[11px] text-text-tertiary uppercase tracking-widest ml-1 block">
              Stack Tecnológico
            </span>
            <div id="project-skills-list" class="flex flex-wrap gap-2 min-h-[40px]">
              <p class="font-body text-xs text-text-tertiary italic">Cargando catálogo...</p>
            </div>
          </div>
        </div>

        <p id="upload-project-form-error" class="bg-state-error/10 border border-state-error/20 text-state-error text-xs font-bold p-3 rounded-lg text-center hidden" role="alert"></p>
      </form>
    `,
    footer: `
      <div class="flex items-center justify-end gap-3 w-full">
        <button type="button" data-modal-close="modal-upload-project" class="px-5 py-2.5 rounded-xl text-xs font-bold font-heading text-text-tertiary hover:text-text-primary transition-all duration-200">
          Cancelar
        </button>
        <button type="button" id="upload-project-submit-btn" class="px-8 py-2.5 rounded-xl text-xs font-bold font-heading bg-text-primary text-bg-primary hover:bg-brand-primary transition-all duration-300 transform active:scale-95 shadow-lg shadow-brand-primary/10">
          Publicar Proyecto
        </button>
      </div>
    `,
  });
}

export function CoderDashboard() {
  return `
    ${Header({})}
    <main class="mx-auto max-w-5xl px-6 py-8" data-coder-container>
      <div id="profile-section" class="mb-8">
        ${renderProfileSection()}
      </div>

          <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 border-b border-border-default/30 pb-6">
        <div>
          <h2 class="font-heading text-2xl font-bold text-text-primary tracking-tight">Mis Proyectos</h2>
          <p class="font-body text-sm text-text-tertiary mt-1 font-medium italic">Gestiona y exhibe tu portafolio técnico</p>
        </div>

        <button 
          data-action="open-upload-project-modal"
          class="group relative inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-text-primary text-bg-primary overflow-hidden transition-all duration-500 hover:bg-brand-primary hover:shadow-[0_8px_25px_-5px_rgba(var(--brand-primary-rgb),0.4)] active:scale-[0.97]"
        >
          <!-- Brillo interno al pasar el mouse -->
          <div class="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <!-- Icono animado -->
          <div class="relative flex items-center justify-center w-5 h-5 bg-bg-primary/10 rounded-md transition-transform duration-500 group-hover:rotate-90">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>

          <span class="relative font-heading text-sm font-bold tracking-tight">Publicar Proyecto</span>
        </button>
      </div>

      <div id="my-projects-list" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <p class="font-body text-sm text-text-tertiary">Cargando proyectos...</p>
      </div>
    </main>

    ${renderUploadProjectModal()}
  `;
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
  document.querySelectorAll("[data-modal]").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) hideModal(modal.id);
    });
  });
}

async function loadProfile() {
  try {
    profile = await userProfileService.getMyProfile();
  } catch {
    showToast("No pudimos cargar tu perfil", "error");
    return;
  }

  const section = document.getElementById("profile-section");
  if (section) section.innerHTML = renderProfileSection();
}

async function loadMyProjects() {
  const container = document.getElementById("my-projects-list");
  if (!container) return;

  try {
    const projects = await projectService.getMyProjects();

    if (projects.length === 0) {
      container.innerHTML = `
        <div class="rounded-2xl border border-dashed border-border-default p-10 text-center col-span-full">
          <p class="font-body text-sm text-text-tertiary">Todavía no subiste ningún proyecto.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = projects.map((p) => renderProjectCard(p)).join("");
  } catch (error) {
    container.innerHTML = `<p class="font-body text-sm text-state-error">No pudimos cargar tus proyectos.</p>`;
  }
}

function renderProjectCard(p) {
  const formattedDate = new Date(p.created_at).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
  });

  const originBadge = p.is_external
    ? `<span class="absolute top-3 left-3 z-10 bg-amber-500/10 backdrop-blur-md text-amber-500 border border-amber-500/20 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider shadow-sm">Iniciativa</span>`
    : `<span class="absolute top-3 left-3 z-10 bg-brand-primary/10 backdrop-blur-md text-brand-primary border border-brand-primary/20 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider shadow-sm">Académico</span>`;

  return `
    <article class="group relative flex flex-col rounded-2xl border border-border-default bg-bg-secondary transition-all duration-300 hover:border-brand-primary/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden">
      <!-- Image Header con altura optimizada -->
      <div class="relative h-32 w-full overflow-hidden border-b border-border-default/50">
        ${originBadge}
        ${
          p.image_url
            ? `<img src="${p.image_url}" alt="${p.title}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />`
            : `<div class="w-full h-full bg-bg-primary flex items-center justify-center">
               <svg class="text-text-tertiary/20" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
             </div>`
        }
        <div class="absolute inset-0 bg-gradient-to-t from-bg-secondary via-transparent to-transparent opacity-60"></div>
      </div>
      
      <!-- Body -->
      <div class="p-5 flex flex-col flex-1">
        <div class="flex justify-between items-start gap-4 mb-2">
          <h3 class="font-heading text-base font-bold text-text-primary tracking-tight group-hover:text-brand-primary transition-colors line-clamp-1 italic">${p.title}</h3>
          <span class="text-[9px] font-bold text-text-tertiary uppercase tracking-tighter mt-1 whitespace-nowrap">${formattedDate}</span>
        </div>
        
        <p class="font-body text-[13px] text-text-secondary leading-relaxed line-clamp-2 mb-6 opacity-80 group-hover:opacity-100 transition-opacity">
          ${p.description}
        </p>

        <!-- GitHub Action Area -->
        <div class="mt-auto pt-4 border-t border-border-default/40 flex items-center justify-between">
          <a href="${p.repo_url}" target="_blank" rel="noopener" 
             class="group/link inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-bg-primary border border-border-default hover:border-brand-primary/30 hover:bg-brand-primary/5 transition-all duration-300">
            <svg class="text-text-primary group-hover/link:text-brand-primary transition-colors" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            <span class="text-xs font-bold text-text-secondary group-hover/link:text-brand-primary tracking-tight transition-colors">Repositorio</span>
          </a>
          
          <div class="h-1.5 w-1.5 rounded-full bg-border-default group-hover:bg-brand-primary transition-colors shadow-sm"></div>
        </div>
      </div>
    </article>
  `;
}

async function loadSkillsIntoModal() {
  const container = document.getElementById("project-skills-list");
  if (!container) return;

  try {
    skills = await skillService.getSkills();
  } catch {
    container.innerHTML = `<p class="font-body text-xs text-state-error">No pudimos cargar las habilidades.</p>`;
    return;
  }

  if (skills.length === 0) {
    container.innerHTML = `<p class="font-body text-xs text-text-tertiary">No hay habilidades registradas todavía.</p>`;
    return;
  }

  container.innerHTML = skills
    .map(
      (skill) => `
      <label class="group relative flex items-center px-3 py-1.5 rounded-lg border border-border-default bg-bg-primary hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-all duration-200 cursor-pointer overflow-hidden">
        <input type="checkbox" value="${skill.id}" data-skill-checkbox class="peer hidden" />
        <span class="font-body text-xs text-text-secondary group-hover:text-brand-primary peer-checked:text-brand-primary z-10 transition-colors font-medium">
          ${skill.name}
        </span>
        <div class="absolute inset-0 bg-brand-primary/10 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
      </label>
    `,
    )
    .join("");
}

function showFieldError(id, message) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.classList.remove("hidden");
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
  ["project-title", "project-repo-url", "project-image-url"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  const description = document.getElementById("project-description");
  if (description) description.value = "";
  const isExternal = document.getElementById("project-is-external");
  if (isExternal) isExternal.checked = false;
  document
    .querySelectorAll("[data-skill-checkbox]")
    .forEach((cb) => (cb.checked = false));
  clearUploadFormErrors();
}

function bindOpenUploadProjectModal() {
  document
    .querySelector('[data-action="open-upload-project-modal"]')
    ?.addEventListener("click", (e) => {
      e.preventDefault();

      resetUploadProjectForm();
      openModal("modal-upload-project");
      loadSkillsIntoModal();
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
    showFieldError(
      "project-repo-url-error",
      "La URL del repositorio es obligatoria",
    );
    valid = false;
  }

  if (!valid) return;

  const submitBtn = document.getElementById("upload-project-submit-btn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Subiendo...";

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
    showToast("Proyecto subido correctamente", "success");
  } catch (error) {
    const message =
      (error.body && error.body.error) ||
      "No pudimos subir el proyecto. Intentá de nuevo.";
    showFieldError("upload-project-form-error", message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Subir proyecto";
  }
}

const ACTION_HANDLERS = {
  "upload-project": handleUploadProject,
};

function setupDelegatedHandler() {
  document
    .querySelector("[data-coder-container]")
    ?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-coder-action]");

      if (!btn) return;

      const handler = ACTION_HANDLERS[btn.dataset.coderAction];

      if (handler) handler();
    });

  document
    .getElementById("upload-project-submit-btn")
    ?.addEventListener("click", () => {
      handleUploadProject();
    });
}

export async function mountCoderDashboard() {
  mountHeader();

  profile = null;
  skills = [];

  bindOpenUploadProjectModal();
  bindModalCloseEvents();
  setupDelegatedHandler();

  await loadProfile();
  await loadMyProjects();
}
