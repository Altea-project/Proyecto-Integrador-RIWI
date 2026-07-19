// ============================================================
// GalleryView.js — "Galería de Proyectos" (HU-12)
// Vitrina pública para cualquier usuario autenticado: muestra los
// proyectos ordenados por puntaje (los mejores primero; los sin
// calificar al final, tal como los devuelve el backend).
//
// Conectado a:
//   - GET /projects  -> { success, data: { projects: [...] } }
//   - clic en una card -> navega a /project/:id (SPA, sin recargar)
// ============================================================

import { Header, mountHeader } from "../components/Header.js";
import { navigate } from "../router/router.js";
import { apiClient } from "../services/apiClient.js";
import { escapeHtml } from "../utils/escapeHtml.js";

const initials = (name) =>
  escapeHtml((name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase());

// Imagen del proyecto, o un placeholder con degradado si no tiene.
function projectImage(p) {
  if (p.imageUrl) {
    return `<img src="${escapeHtml(p.imageUrl)}" alt="${escapeHtml(p.title)}" class="w-full h-44 object-cover" loading="lazy"
      onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
      <div class="w-full h-44 items-center justify-center bg-gradient-to-br from-[#8044F0]/20 to-[#161B26]" style="display:none">
        <span class="text-3xl font-black text-[#8044F0]/40">${initials(p.title)}</span>
      </div>`;
  }
  return `<div class="w-full h-44 flex items-center justify-center bg-gradient-to-br from-[#8044F0]/20 to-[#161B26]">
      <span class="text-3xl font-black text-[#8044F0]/40">${initials(p.title)}</span>
    </div>`;
}

// Badge de puntaje (verde) o "Sin calificar" (ámbar).
function scoreBadge(p) {
  if (p.graded) {
    return `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black text-emerald-300 border border-emerald-400/30 bg-emerald-400/10">
        ${p.starred ? "★ " : ""}${p.score}/100
      </span>`;
  }
  return `<span class="px-2.5 py-1 rounded-full text-[10px] font-black text-amber-300 border border-amber-400/30 bg-amber-400/10 uppercase tracking-widest">Sin Calificar</span>`;
}

function externalBadge(isExternal) {
  return isExternal
    ? `<span class="px-2 py-0.5 rounded-full text-[9px] font-black text-cyan-300 border border-cyan-400/30 bg-cyan-400/10 uppercase tracking-widest">Externo</span>`
    : "";
}

function projectCard(p) {
  const gradedBy = p.gradedBy?.abbreviatedName
    ? `<span class="text-[10px] text-text-tertiary">Calificó ${escapeHtml(p.gradedBy.abbreviatedName)}</span>`
    : "";

  return `
    <button data-project="${p.id}" type="button"
      class="text-left bg-bg-secondary/30 border border-border-default rounded-[10px] overflow-hidden hover:border-[#8044F0]/40 hover:-translate-y-1 transition-all group">
      <div class="relative overflow-hidden">
        ${projectImage(p)}
        <div class="absolute top-3 right-3 flex gap-1.5">${externalBadge(p.isExternal)}</div>
      </div>
      <div class="p-5 flex flex-col gap-3">
        <div class="flex items-start justify-between gap-2">
          <h3 class="text-sm font-black text-text-primary group-hover:text-[#8044F0] transition-colors">${escapeHtml(p.title)}</h3>
          ${scoreBadge(p)}
        </div>
        <p class="text-xs text-text-secondary leading-relaxed line-clamp-2">${escapeHtml(p.description || "")}</p>
        <div class="flex items-center justify-between pt-2 border-t border-border-default/40">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-full bg-[#8044F0]/15 border border-[#8044F0]/30 flex items-center justify-center text-[9px] font-black text-[#8044F0]">${initials(p.coderName)}</div>
            <span class="text-[11px] font-bold text-text-secondary">${escapeHtml(p.coderName || "—")}</span>
          </div>
          ${gradedBy}
        </div>
      </div>
    </button>`;
}

// Esqueleto de carga (HU-12 · T4).
function skeletonCard() {
  return `
    <div class="bg-bg-secondary/30 border border-border-default rounded-[10px] overflow-hidden animate-pulse">
      <div class="w-full h-44 bg-white/5"></div>
      <div class="p-5 space-y-3">
        <div class="h-4 w-2/3 bg-white/5 rounded"></div>
        <div class="h-3 w-full bg-white/5 rounded"></div>
        <div class="h-3 w-1/2 bg-white/5 rounded"></div>
      </div>
    </div>`;
}

// --- VISTA (cascarón con esqueleto; datos en el mount) ---
export function GalleryView() {
  return `
    ${Header({})}
    <div class="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none opacity-40">
      <div class="absolute top-[5%] -left-1/4 w-[500px] h-[500px] bg-[#8044F0]/10 rounded-full blur-[140px]"></div>
    </div>

    <main class="mx-auto max-w-7xl px-6 py-12">
      <section class="mb-8">
        <h1 class="text-4xl font-black text-white tracking-tighter font-heading">Galería de Proyectos</h1>
        <p class="text-text-secondary text-sm mt-1">Explora el trabajo de los coders de Altea, ordenado por puntaje verificado.</p>
      </section>

      <section id="gallery-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${Array.from({ length: 6 }).map(skeletonCard).join("")}
      </section>
    </main>
  `;
}

// --- MOUNT ---
export async function mountGalleryView() {
  mountHeader();
  const grid = document.getElementById("gallery-grid");

  try {
    const resp = await apiClient.get("/projects");
    const projects = resp?.data?.projects || [];

    if (projects.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-20 text-center">
          <p class="text-sm text-text-primary font-bold mb-1">Todavía no hay proyectos</p>
          <p class="text-xs text-text-tertiary">Cuando los coders publiquen sus proyectos, aparecerán aquí.</p>
        </div>`;
      return;
    }

    grid.innerHTML = projects.map(projectCard).join("");

    // Clic en una card -> detalle del proyecto (SPA, sin recargar) — CA-03.
    grid.querySelectorAll("[data-project]").forEach((btn) => {
      btn.addEventListener("click", () => navigate(`/project/${btn.dataset.project}`));
    });
  } catch (err) {
    const msg = err.status === 401 ? "Tu sesión expiró. Inicia sesión de nuevo." : "No se pudo cargar la galería.";
    grid.innerHTML = `<div class="col-span-full py-20 text-center text-state-error text-sm">${msg}</div>`;
    if (err.status === 401) setTimeout(() => navigate("/login"), 1200);
  }
}
