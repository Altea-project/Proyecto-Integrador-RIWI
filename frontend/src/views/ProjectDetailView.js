// ============================================================
// ProjectDetailView.js — "Evaluación Técnica de Proyecto"
// (Evaluar Proyecto — HU-06, acceso del TL).
// Conectado a:
//   - GET  /projects/:id  -> detalle del proyecto
//   - POST /gradings      -> publicar/actualizar la calificación
// El projectId sale del parámetro de la ruta /project/:id.
// ============================================================

import { Header, mountHeader } from "../components/Header.js";
import { showToast } from "../components/Toast.js";
import { navigate } from "../router/router.js";
import { apiClient } from "../services/apiClient.js";

function typeBadge(isExternal) {
  const ext = !!isExternal;
  const label = ext ? "Externo" : "Formación";
  return `<span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${ext ? "text-cyan-300 border-cyan-400/30 bg-cyan-400/10" : "text-[#8044F0] border-[#8044F0]/30 bg-[#8044F0]/10"}">${label}</span>`;
}

function tiempoRelativo(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const min = Math.floor((Date.now() - d.getTime()) / 60000);
  if (min < 1) return "hace un momento";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const dias = Math.floor(h / 24);
  if (dias === 1) return "hace 1 día";
  if (dias < 30) return `hace ${dias} días`;
  return d.toLocaleDateString("es");
}

// Render de la columna izquierda a partir del proyecto real
function renderInfo(p) {
  const stack = (p.skills || []).length
    ? p.skills.map((t) => `<span class="px-3 py-1.5 rounded-lg text-[11px] font-bold text-text-secondary bg-white/[0.03] border border-border-default">${t}</span>`).join("")
    : `<span class="text-xs text-text-tertiary italic">Sin tecnologías registradas</span>`;

  const desc = (p.description || "Este proyecto no tiene descripción.")
    .split("\n\n").map((par) => `<p>${par}</p>`).join("");

  const repoBtn = p.repoUrl
    ? `<a href="${p.repoUrl}" target="_blank" rel="noopener" class="px-5 py-2.5 bg-[#161B26] border border-border-default hover:border-[#8044F0]/40 text-text-primary text-[11px] font-black rounded-lg tracking-widest uppercase transition-all">Abrir Repositorio</a>`
    : "";

  return `
    <div class="p-6 bg-bg-secondary/30 border border-border-default rounded-[10px]">
      <div class="flex items-center gap-3 mb-4 flex-wrap">
        <h2 class="text-xl font-black text-white">${p.title}</h2>
        ${typeBadge(p.isExternal)}
      </div>
      <p class="text-sm text-text-secondary mb-5">${p.coderName || "—"} · Entregado ${tiempoRelativo(p.createdAt)}</p>
      <div class="flex flex-wrap gap-3">${repoBtn}</div>
    </div>

    <div class="p-6 bg-bg-secondary/30 border border-border-default rounded-[10px]">
      <p class="text-[10px] font-black text-[#8044F0] uppercase tracking-[0.2em] mb-4">Descripción del Proyecto</p>
      <div class="text-sm text-text-secondary leading-relaxed space-y-3">${desc}</div>
    </div>

    <div class="p-6 bg-bg-secondary/30 border border-border-default rounded-[10px]">
      <p class="text-[10px] font-black text-[#8044F0] uppercase tracking-[0.2em] mb-4">Stack Tecnológico</p>
      <div class="flex flex-wrap gap-2">${stack}</div>
    </div>`;
}

// --- VISTA (cascarón; el detalle se carga en el mount) ---
export function ProjectDetailView(params = {}) {
  return `
    ${Header({})}
    <main class="mx-auto max-w-7xl px-6 py-10">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-xs text-text-tertiary mb-6">
        <a href="/tl" data-nav class="hover:text-[#8044F0] transition-colors">← Volver al Dashboard</a>
        <span>/</span><span>Evaluación</span>
        <span>/</span><span id="pd-crumb" class="text-text-primary font-bold">Proyecto</span>
      </nav>

      <div class="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 class="text-3xl font-black text-white tracking-tighter font-heading">Evaluación Técnica de Proyecto</h1>
          <p class="text-text-secondary text-sm mt-1">HU-06 · Entorno de evaluación — acceso del Líder de Equipo</p>
        </div>
        <span id="pd-grade-badge" class="px-4 py-2 rounded-full text-[11px] font-black text-amber-300 border border-amber-400/30 bg-amber-400/10 uppercase tracking-widest">Sin Calificar</span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- IZQUIERDA: info del proyecto (se llena en el mount) -->
        <div id="pd-info" class="lg:col-span-2 space-y-6">
          <div class="p-6 bg-bg-secondary/30 border border-border-default rounded-[10px] animate-pulse">
            <div class="h-5 w-1/2 bg-white/5 rounded mb-4"></div>
            <div class="h-3 w-1/3 bg-white/5 rounded"></div>
          </div>
          <div class="p-6 bg-bg-secondary/30 border border-border-default rounded-[10px] animate-pulse">
            <div class="h-3 w-full bg-white/5 rounded mb-3"></div>
            <div class="h-3 w-5/6 bg-white/5 rounded"></div>
          </div>
        </div>

        <!-- DERECHA: formulario de calificación (HU-06) -->
        <aside class="lg:col-span-1">
          <div class="sticky top-20 p-6 bg-bg-secondary/40 border border-[#8044F0]/20 rounded-[10px]">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-amber-300">★</span>
              <h3 class="text-sm font-black text-white uppercase tracking-widest">Calificación del Proyecto</h3>
            </div>
            <p class="text-[10px] text-text-tertiary mb-6">HU-06 · Solo el Líder de Equipo asignado</p>

            <form id="grading-form" class="space-y-6" novalidate>
              <!-- SCORE -->
              <div>
                <label class="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Puntaje (0–100)</label>
                <input id="grading-score" type="number" min="0" max="100" value="70"
                  class="w-full mt-2 bg-[#0B0E14] border border-border-default rounded-xl px-4 py-3 text-2xl font-black text-white focus:border-[#8044F0]/50 outline-none" />
                <div class="mt-2 h-2 rounded-full bg-[#0B0E14] overflow-hidden">
                  <div id="grading-score-bar" class="h-full bg-gradient-to-r from-[#8044F0] to-amber-400 transition-all" style="width:70%"></div>
                </div>
                <p id="grading-score-label" class="text-[10px] font-black text-emerald-300 uppercase tracking-widest mt-1">Aprobado</p>
              </div>

              <!-- COMENTARIO -->
              <div>
                <div class="flex items-center justify-between">
                  <label class="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Evaluación detallada</label>
                  <span id="grading-comment-count" class="text-[10px] text-text-tertiary">0/500</span>
                </div>
                <textarea id="grading-comment" maxlength="500" rows="5" placeholder="Escribe una evaluación técnica detallada: fortalezas, áreas de mejora y recomendaciones concretas."
                  class="w-full mt-2 bg-[#0B0E14] border border-border-default rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-[#8044F0]/50 outline-none resize-none"></textarea>
              </div>

              <!-- ESTRELLA -->
              <label class="flex items-center justify-between gap-3 p-4 rounded-xl bg-amber-400/5 border border-amber-400/20 cursor-pointer">
                <span class="text-sm font-bold text-amber-200">Marcar como Proyecto Estrella ★<br><span class="text-[10px] text-text-tertiary font-normal">Desempata en las búsquedas de reclutadores</span></span>
                <input id="grading-starred" type="checkbox" class="w-5 h-5 accent-[#8044F0]" />
              </label>

              <button type="submit" id="grading-submit-btn"
                class="w-full py-4 bg-[#8044F0] hover:bg-[#9A6AF5] text-white text-[11px] font-black rounded-xl tracking-widest uppercase transition-all active:scale-95 shadow-lg shadow-[#8044F0]/20">
                Publicar Calificación
              </button>
              <button type="button" id="grading-cancel-btn" class="w-full text-[11px] font-black text-text-tertiary hover:text-text-primary tracking-widest uppercase transition-all">Cerrar sin guardar</button>
            </form>
          </div>
        </aside>
      </div>
    </main>
  `;
}

// --- MOUNT ---
export async function mountProjectDetailView(params = {}) {
  mountHeader();
  const projectId = Number(params.id);

  const scoreInput = document.getElementById("grading-score");
  const bar = document.getElementById("grading-score-bar");
  const label = document.getElementById("grading-score-label");
  const comment = document.getElementById("grading-comment");
  const count = document.getElementById("grading-comment-count");

  const pintarBarra = () => {
    let v = Number(scoreInput.value);
    if (isNaN(v)) v = 0;
    v = Math.max(0, Math.min(100, v));
    if (bar) bar.style.width = v + "%";
    if (label) {
      label.textContent = v >= 60 ? "Aprobado" : "Reprobado";
      label.className = `text-[10px] font-black uppercase tracking-widest mt-1 ${v >= 60 ? "text-emerald-300" : "text-state-error"}`;
    }
  };

  scoreInput?.addEventListener("input", pintarBarra);
  comment?.addEventListener("input", () => { if (count) count.textContent = `${comment.value.length}/500`; });
  document.getElementById("grading-cancel-btn")?.addEventListener("click", () => navigate("/tl"));

  // --- cargar el detalle del proyecto ---
  try {
    const resp = await apiClient.get(`/projects/${projectId}`);
    const p = resp?.data?.project;
    if (!p) throw Object.assign(new Error("no data"), { status: 404 });

    document.getElementById("pd-info").innerHTML = renderInfo(p);
    const crumb = document.getElementById("pd-crumb");
    if (crumb) crumb.textContent = p.title;

    // Si ya tiene calificación: badge con el puntaje + precargar el formulario
    const badge = document.getElementById("pd-grade-badge");
    if (p.grading) {
      if (badge) {
        badge.textContent = `Calificado · ${p.grading.score}/100`;
        badge.className = "px-4 py-2 rounded-full text-[11px] font-black text-emerald-300 border border-emerald-400/30 bg-emerald-400/10 uppercase tracking-widest";
      }
      if (scoreInput) scoreInput.value = p.grading.score;
      if (comment) { comment.value = p.grading.comment || ""; if (count) count.textContent = `${comment.value.length}/500`; }
      const star = document.getElementById("grading-starred");
      if (star) star.checked = !!p.grading.starred;
      const btn = document.getElementById("grading-submit-btn");
      if (btn) btn.textContent = "Actualizar Calificación";
      pintarBarra();
    }
  } catch (err) {
    if (err.status === 401) {
      showToast("Tu sesión expiró. Inicia sesión de nuevo.", "error");
      setTimeout(() => navigate("/login"), 1200);
      return;
    }
    document.getElementById("pd-info").innerHTML = `
      <div class="p-10 bg-bg-secondary/30 border border-border-default rounded-[10px] text-center">
        <p class="text-lg font-black text-white mb-2">Proyecto no encontrado</p>
        <p class="text-sm text-text-tertiary mb-6">No existe un proyecto con ese identificador.</p>
        <a href="/tl" data-nav class="px-5 py-2.5 bg-[#8044F0] text-white text-[11px] font-black rounded-lg tracking-widest uppercase">Volver al Dashboard</a>
      </div>`;
    const form = document.getElementById("grading-form");
    if (form) form.style.display = "none";
    return;
  }

  // --- enviar calificación -> POST /gradings (HU-06) ---
  document.getElementById("grading-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const score = Number(scoreInput?.value);
    if (!Number.isInteger(score) || score < 0 || score > 100) {
      showToast("El puntaje debe ser un entero entre 0 y 100.", "error");
      return;
    }
    const btn = document.getElementById("grading-submit-btn");
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = "PUBLICANDO…";
    try {
      await apiClient.post("/gradings", {
        projectId,
        score,
        comment: comment?.value.trim() || undefined,
        starred: document.getElementById("grading-starred")?.checked || false,
      });
      showToast("Calificación publicada con éxito.", "success");
      setTimeout(() => navigate("/tl"), 800);
    } catch (err) {
      showToast(err.body?.error || "No se pudo publicar la calificación.", "error");
      btn.disabled = false;
      btn.textContent = original;
    }
  });
}
