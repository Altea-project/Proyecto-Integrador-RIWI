import { Header, mountHeader } from "../components/Header.js";
import { Badge } from "../components/Badge.js";
import { Button } from "../components/Button.js";
import { projectService } from "../services/projectService.js";
import { showToast } from "../components/Toast.js";
import { navigate } from "../router/router.js";

// HU-13 — Detalle de un proyecto. La vista pinta un esqueleto con
// estado de carga; mountProjectDetailView(params) trae los datos
// reales de GET /projects/:id y los inyecta en el DOM. No hay mock:
// si el fetch falla con 404, se reemplaza el esqueleto por un
// mensaje de "no encontrado".
export function ProjectDetailView() {
  return `
    ${Header({})}

    <main class="mx-auto max-w-5xl px-6 py-14" data-project-detail-root>
      <a href="/" class="inline-flex items-center gap-2 text-xs font-semibold text-text-tertiary hover:text-text-primary transition-colors mb-8" data-nav>
        &larr; Volver a la galería
      </a>

      <div data-project-detail-content>
        <!-- Esqueleto de carga -->
        <div class="animate-pulse space-y-6">
          <div class="h-8 w-2/3 rounded bg-bg-secondary"></div>
          <div class="h-64 w-full rounded-[10px] bg-bg-secondary"></div>
          <div class="h-4 w-full rounded bg-bg-secondary"></div>
          <div class="h-4 w-5/6 rounded bg-bg-secondary"></div>
        </div>
      </div>
    </main>
  `;
}

function renderNotFound() {
  return `
    <div class="rounded-[10px] border border-border-default bg-bg-secondary/40 p-12 text-center">
      <h1 class="font-heading text-2xl font-bold text-text-primary">Proyecto no encontrado</h1>
      <p class="mt-2 text-sm text-text-tertiary">
        El proyecto que buscas no existe o fue eliminado.
      </p>
      <div class="mt-6 flex justify-center">
        ${Button({ text: "Volver a la galería", variant: "primary", href: "/" })}
      </div>
    </div>
  `;
}

function renderGradingSection(grading) {
  if (!grading) {
    return `
      <div class="mt-8 rounded-[10px] border border-border-default bg-bg-secondary/40 p-6">
        <h2 class="font-heading text-sm font-bold uppercase tracking-wide text-text-secondary">Calificación</h2>
        <div class="mt-3">
          ${Badge({ text: "Sin calificar", variant: "outline" })}
        </div>
      </div>
    `;
  }

  return `
    <div class="mt-8 rounded-[10px] border border-border-default bg-bg-secondary/40 p-6">
      <h2 class="font-heading text-sm font-bold uppercase tracking-wide text-text-secondary">Calificación</h2>
      <div class="mt-3 flex items-center gap-3">
        <span class="font-heading text-3xl font-black text-brand-primary-light">${grading.score}/100</span>
        ${grading.starred ? Badge({ text: "Destacado", icon: "★" }) : ""}
      </div>
      ${
        grading.comment
          ? `<p class="mt-4 text-sm leading-6 text-text-tertiary">${grading.comment}</p>`
          : ""
      }
    </div>
  `;
}

function renderProject(project) {
  const skillsBadges = project.skills.length
    ? project.skills
        .map((skill) => Badge({ text: skill, variant: "outline" }))
        .join("")
    : `<span class="text-sm text-text-tertiary">Sin tecnologías registradas</span>`;

  return `
    <article>
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="font-heading text-4xl font-black uppercase tracking-tight text-text-primary">
            ${project.title}
          </h1>
          <p class="mt-2 text-sm text-text-tertiary">
            Por <span class="font-semibold text-text-secondary">${project.coderName}</span>
            ${project.isExternal ? `<span class="ml-2">${Badge({ text: "Proyecto externo", variant: "outline" })}</span>` : ""}
          </p>
        </div>
      </div>

      ${
        project.imageUrl
          ? `<img src="${project.imageUrl}" alt="${project.title}" class="mt-6 w-full max-h-[420px] rounded-[10px] border border-border-default object-cover" />`
          : ""
      }

      <p class="mt-6 whitespace-pre-line text-base leading-7 text-text-secondary">
        ${project.description}
      </p>

      <div class="mt-6">
        ${Button({ text: "Ver repositorio", variant: "primary", href: project.repoUrl, extraClasses: "no-underline" })}
      </div>

      <div class="mt-8">
        <h2 class="font-heading text-sm font-bold uppercase tracking-wide text-text-secondary">Tecnologías</h2>
        <div class="mt-3 flex flex-wrap gap-2">${skillsBadges}</div>
      </div>

      ${renderGradingSection(project.grading)}
    </article>
  `;
}

// Trae el proyecto por id y reemplaza el esqueleto con el contenido
// real (o con el mensaje de "no encontrado" si el backend responde
// 404, CA-03).
export async function mountProjectDetailView(params) {
  mountHeader();

  const content = document.querySelector("[data-project-detail-content]");
  const id = params?.id;

  try {
    const project = await projectService.getProjectById(id);
    if (content) content.innerHTML = renderProject(project);
  } catch (error) {
    if (error.status === 404) {
      if (content) content.innerHTML = renderNotFound();
      return;
    }

    if (error.status === 401) {
      navigate("/login");
      return;
    }

    showToast("No se pudo cargar el proyecto", "error");
    if (content) content.innerHTML = renderNotFound();
  }
}
