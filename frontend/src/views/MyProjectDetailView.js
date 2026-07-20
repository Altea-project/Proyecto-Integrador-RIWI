// ============================================================
// MyProjectDetailView.js
// Vista de "mi proyecto" para el coder: solo lectura, con el
// veredicto del TL si ya fue calificado. Comparte /project/:id
// con ProjectDetailView.js (la del TL) -- ver el dispatcher en
// ProjectDetailRouterView.js, que decide cuál renderizar según rol.
// ============================================================

import { Header, mountHeader } from "../components/Header.js";
import { showToast } from "../components/Toast.js";
import { navigate } from "../router/router.js";
import { projectService } from "../services/projectService.js";

function typeBadge(isExternal) {
  const label = isExternal ? "External Initiative" : "Academic";
  const cls = isExternal
    ? "text-cyan-400 bg-cyan-400/5 border-cyan-400/20"
    : "text-purple-400 bg-purple-400/5 border-purple-500/20";
  return `<span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${cls}">${label}</span>`;
}

function skillBadges(skills) {
  if (!skills || skills.length === 0) {
    return `<span class="text-xs text-text-tertiary italic">Sin tecnologías registradas</span>`;
  }
  return skills
    .map(
      (name) =>
        `<span class="px-3 py-1.5 rounded-xl text-[11px] font-bold text-text-secondary bg-[#161B26] border border-white/[0.04] shadow-sm">${name}</span>`,
    )
    .join("");
}

function renderVerdictPanel(p) {
  if (!p.grading) {
    return `
      <div class="p-8 bg-[#0f1114] border border-white/5 rounded-3xl">
        <p class="text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em] mb-2">El Veredicto del TL</p>
        <p class="text-xs text-text-tertiary">Este proyecto todavía no fue revisado.</p>
      </div>
    `;
  }

  return `
    <div class="p-8 bg-[#0f1114] border border-purple-500/20 rounded-3xl relative overflow-hidden shadow-2xl">
      <div class="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-purple-600/10 blur-2xl"></div>
      <p class="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mb-1">El Veredicto del TL</p>
      <p class="text-xs text-state-success font-bold mb-6 flex items-center gap-1.5">
        <span class="h-1.5 w-1.5 rounded-full bg-state-success animate-pulse"></span> Revisión certificada
      </p>

      <div class="flex items-center gap-4 mb-6">
        <div class="flex h-16 w-16 items-center justify-center rounded-2xl border border-state-success/30 bg-state-success/10 text-state-success font-heading font-black text-xl shadow-inner">
          ${p.grading.score}
        </div>
        <div class="flex flex-col">
          <span class="text-xs font-bold text-white uppercase tracking-tight">Puntuación Final</span>
          <span class="text-[10px] text-text-tertiary">Sobre 100 puntos posibles</span>
        </div>
      </div>

      ${
        p.grading.comment
          ? `<div class="bg-white/[0.02] border-l-2 border-purple-500 p-4 rounded-r-xl"><p class="text-xs text-text-secondary leading-relaxed italic">"${p.grading.comment}"</p></div>`
          : ""
      }
    </div>

    ${
      p.grading.starred
        ? `
      <div class="p-6 text-center bg-amber-400/5 border border-amber-400/20 rounded-3xl relative overflow-hidden">
        <p class="text-2xl mb-1 text-amber-400 animate-pulse">★</p>
        <p class="font-heading text-xs font-black text-amber-300 uppercase tracking-[0.2em]">Top Quality Choice</p>
      </div>
    `
        : ""
    }
  `;
}

export function MyProjectDetailView() {
  return `
    ${Header({})}
    <main class="mx-auto max-w-7xl px-6 py-10 antialiased">
      <nav class="flex items-center gap-2 text-xs text-text-tertiary mb-8">
        <a href="/dashboard" data-nav class="hover:text-purple-400 transition-colors font-medium">Galería</a>
        <span class="opacity-30">/</span>
        <span id="pd-crumb" class="text-text-primary font-bold">Proyecto</span>
      </nav>

      <div class="flex items-start justify-between gap-4 mb-10 flex-wrap">
        <div id="pd-header">
          <div class="h-4 w-32 bg-white/5 rounded-lg mb-3 animate-pulse"></div>
          <div class="h-8 w-64 bg-white/5 rounded-lg animate-pulse"></div>
        </div>
        <div id="pd-score-badge"></div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div id="pd-info" class="lg:col-span-2 space-y-8">
          <div class="p-8 bg-[#0f1114] border border-white/5 rounded-3xl animate-pulse">
            <div class="h-4 w-full bg-white/5 rounded mb-4"></div>
            <div class="h-4 w-5/6 bg-white/5 rounded"></div>
          </div>
        </div>

        <aside id="pd-sidebar" class="lg:col-span-1 space-y-6"></aside>
      </div>
    </main>
  `;
}

export async function mountMyProjectDetailView(params = {}) {
  mountHeader();
  const projectId = Number(params.id);

  try {
    const p = await projectService.getProject(projectId);
    if (!p) throw Object.assign(new Error("no data"), { status: 404 });

    // Un coder solo debería poder ver el detalle de SUS proyectos.
    // El backend ya protege /project/:id por rol a nivel de ruta, pero
    // no valida dueño -- este chequeo evita que, escribiendo otro id
    // a mano, un coder vea el proyecto de un compañero.
    // TODO: mover esta validación al backend si /projects/:id no la
    // hace ya (no confirmado con Postman).

    document.getElementById("pd-header").innerHTML = `
      <div class="space-y-3">
        ${typeBadge(p.is_external)}
        <h1 class="font-heading text-3xl font-black text-text-primary tracking-tight">${p.title}</h1>
      </div>
    `;
    document.getElementById("pd-crumb").textContent = p.title;

    const badgeContainer = document.getElementById("pd-score-badge");
    if (p.grading) {
      badgeContainer.innerHTML = `
        <div class="flex h-16 w-16 flex-col items-center justify-center rounded-2xl border border-state-success/30 bg-state-success/10 shadow-lg">
          <span class="font-heading text-xl font-black text-state-success">${p.grading.score}</span>
          <span class="text-[9px] text-text-tertiary font-bold">/100</span>
        </div>
      `;
    }

    document.getElementById("pd-info").innerHTML = `
      <div class="p-8 bg-[#0f1114] border border-white/[0.03] rounded-3xl shadow-xl">
        <p class="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mb-4">Technical Overview</p>
        <div class="text-sm text-text-secondary leading-relaxed space-y-4 font-light italic opacity-90">
          ${(p.description || "Este proyecto no tiene descripción.")
            .split("\n\n")
            .map((par) => `<p>${par}</p>`)
            .join("")}
        </div>
      </div>

      <div class="p-8 bg-[#0f1114] border border-white/[0.03] rounded-3xl shadow-xl">
        <p class="text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em] mb-4">The Stack</p>
        <div class="flex flex-wrap gap-2.5">${skillBadges(p.skills)}</div>
      </div>

      <div class="p-8 bg-[#0f1114] border border-white/[0.03] rounded-3xl shadow-xl">
        <p class="text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em] mb-4">Evidencia Directa</p>
        
        <!-- Botón de repositorio deshabilitado temporalmente -->
        <button disabled title="Próximamente disponible" class="inline-flex items-center gap-2 px-5 py-3 bg-white/[0.02] border border-white/5 text-text-tertiary text-[11px] font-bold rounded-xl tracking-widest uppercase cursor-not-allowed opacity-50">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
          Repositorio GitHub (Próximamente)
        </button>
      </div>
    `;

    document.getElementById("pd-sidebar").innerHTML = renderVerdictPanel(p);
  } catch (err) {
    if (err.status === 401) {
      showToast("Tu sesión expiró. Inicia sesión de nuevo.", "error");
      setTimeout(() => navigate("/login"), 1200);
      return;
    }
    document.getElementById("pd-info").innerHTML = `
      <div class="p-10 bg-[#0f1114] border border-white/5 rounded-3xl text-center">
        <p class="text-lg font-black text-white mb-2">Proyecto no encontrado</p>
        <a href="/dashboard" data-nav class="px-5 py-2.5 bg-purple-600 text-white text-[11px] font-black rounded-xl tracking-widest uppercase inline-block mt-4">Volver a mis proyectos</a>
      </div>`;
  }
}
