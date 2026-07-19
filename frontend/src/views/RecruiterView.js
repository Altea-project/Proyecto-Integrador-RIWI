// ============================================================
// RecruiterView.js — "Buscador de Talento" (HU-08)
// Búsqueda de coders por tecnologías para el reclutador.
//
// Conectado a:
//   - GET  /skills            -> catálogo de tecnologías (buscador)
//   - GET  /coders/search     -> resultados (array crudo, snake_case)
//   - POST /interests         -> "Mostrar interés" (notifica al TL)
//   - navega a /profile/:id    -> ver el perfil del coder
// ============================================================

import { Header, mountHeader } from "../components/Header.js";
import { showToast } from "../components/Toast.js";
import { navigate } from "../router/router.js";
import { apiClient } from "../services/apiClient.js";
import { skillService } from "../services/skillsService.js";
import { interestService } from "../services/interestService.js";
import { escapeHtml } from "../utils/escapeHtml.js";

// Estado en memoria de la vista.
const state = {
  allSkills: [],
  selected: new Set(), // ids de skills elegidas
};

const initials = (name) =>
  escapeHtml(
    (name || "?")
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase(),
  );

const STATUS_META = {
  available: {
    label: "Disponible de inmediato",
    text: "text-emerald-400",
    chip: "bg-emerald-500/10 border-emerald-500/20",
    dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]",
    bar: "bg-emerald-500",
  },
  in_conversation: {
    label: "En conversaciones activas",
    text: "text-amber-400",
    chip: "bg-amber-500/10 border-amber-500/20",
    dot: "bg-amber-400",
    bar: "bg-amber-500",
  },
};

function statusBadge(status) {
  const m = STATUS_META[status] || STATUS_META.available;
  return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black ${m.text} ${m.chip} border"><span class="w-1.5 h-1.5 rounded-full ${m.dot}"></span>${m.label}</span>`;
}

function coderCard(c) {
  const score = c.avg_score != null ? Math.round(c.avg_score) : null;
  const status = STATUS_META[c.availability_status] || STATUS_META.available;

  const chips = (c.skills || [])
    .slice(0, 5)
    .map(
      (s) => `
      <span class="px-2.5 py-1 rounded-md text-[10px] font-bold text-text-tertiary bg-white/[0.03] border border-white/5 uppercase tracking-tight">
        ${escapeHtml(s)}
      </span>`,
    )
    .join("");

  return `
    <div class="group relative flex flex-col bg-[#0f1114] border border-white/5 rounded-3xl p-6 transition-all duration-500 hover:border-brand-primary/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
      
      <!-- Status Badge -->
      <div class="flex items-center gap-2 mb-6">
        <span class="h-1.5 w-1.5 rounded-full ${status.dot}"></span>
        <span class="text-[10px] font-black uppercase tracking-widest ${status.text}">${status.label}</span>
        ${
          c.has_starred
            ? `
    <div title="Coder con Desempeño Destacado" 
         class="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-500/5 border border-amber-500/10 text-amber-400 transition-all group-hover:bg-amber-500/10">
      
      <!-- Icono de Estrella estilizado (en lugar de '★') -->
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
      
      <!-- Etiqueta Premium -->
      <span class="text-[9px] font-black uppercase tracking-widest italic">
        Top Talent
      </span>
    </div>`
            : ""
        }
      </div>

      <!-- Info Principal -->
  <!-- Info Principal Corregida -->
      <div class="flex items-start justify-between gap-4 mb-6">
        <div class="flex items-center gap-4 flex-1 min-w-0"> <!-- Añadido flex-1 y min-w-0 aquí -->
          <!-- Avatar -->
          <div class="flex-shrink-0 h-14 w-14 rounded-2xl bg-gradient-to-tr from-[#1A1A1B] to-bg-primary border border-white/10 flex items-center justify-center font-heading text-xl font-black text-brand-primary">
            ${initials(c.name)}
          </div>

          <!-- Contenedor de Texto -->
          <div class="flex-1 min-w-0"> <!-- Este es el secreto para que no se corte -->
            <h3 class="text-base font-bold text-text-primary tracking-tight group-hover:text-brand-primary transition-colors italic uppercase leading-tight truncate">
              ${escapeHtml(c.name)}
            </h3>          
            ${
              c.role_name
                ? `
              <p class="text-[11px] text-text-tertiary mt-1 capitalize leading-none truncate opacity-80">
                ${escapeHtml(c.role_name)}
              </p>`
                : ""
            }
          </div>
        </div>

        <!-- El puntaje se mantiene a la derecha sin que el nombre lo empuje -->
        ${
          score !== null
            ? `
        <div class="text-right flex-shrink-0">
           <span class="text-3xl font-black text-white leading-none">${score}</span>
           <p class="text-[10px] text-text-tertiary font-bold uppercase tracking-tighter opacity-50">/100</p>
        </div>`
            : ""
        }
      </div>

      <!-- Barra de Score (Solo si existe puntaje) -->
      ${
        score !== null
          ? `
      <div class="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-6 flex">
         <div class="h-full ${status.bar} transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(var(--status-rgb),0.5)]" style="width: ${score}%"></div>
      </div>`
          : '<div class="h-1 mb-6 opacity-0"></div>'
      }

      <!-- Firma del Instructor/TL (Opcional según data) -->
      <div class="flex items-center gap-1.5 mb-6 text-[10px] font-bold text-text-tertiary uppercase italic tracking-wider opacity-60">
        ${
          c.tl_name
            ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="text-brand-primary"><path d="M20 6L9 17l-5-5"/></svg>
        Revisión por: <span class="text-text-secondary">@${escapeHtml(c.tl_name)}</span>`
            : ""
        }
      </div>

      <!-- Tecnologías Reales -->
      <div class="flex flex-wrap gap-2 mb-8 min-h-[50px] content-start">
        ${chips}
      </div>

      <!-- Acciones -->
      <div class="flex flex-col gap-3 mt-auto">
        <button data-interest="${c.id}" data-name="${escapeHtml(c.name)}"
          class="relative group/btn w-full px-6 py-3 bg-brand-primary text-white text-[11px] font-black rounded-xl tracking-widest uppercase transition-all duration-300 hover:shadow-[0_10px_25px_rgba(128,68,240,0.4)] active:scale-[0.97]">
          Mostrar Interés Profesional
        </button>
        <button data-profile="${c.id}"
          class="w-full py-3 bg-[#121417] border border-white/5 hover:border-brand-primary/30 text-text-secondary hover:text-white text-[10px] font-bold rounded-xl tracking-widest uppercase transition-all duration-300">
          Analizar Perfil Técnico
        </button>
      </div>
    </div>`;
}

export function RecruiterView() {
  return `
    ${Header({})}
    <!-- Efecto Blur Ambiental -->
    <div class="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
      <div class="absolute top-[10%] right-[15%] w-[400px] h-[400px] bg-brand-primary/10 blur-[150px] animate-pulse"></div>
    </div>

    <main class="mx-auto max-w-7xl px-6 py-12">
      <!-- Encabezado Estilo Dashboard (Sin datos hardcodeados) -->
      <section class="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
        <div>
          <h1 class="text-5xl font-black text-text-primary tracking-tighter font-heading italic uppercase leading-none">Talent Discovery Hub</h1>
          <p class="text-text-tertiary text-sm mt-3 font-medium">Búsqueda avanzada de talento técnico certificado.</p>
        </div>
        <div class="flex items-center gap-4">
          <!-- Este badge indica el estado del sistema en lugar de un contador falso -->
          <div class="px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-full flex items-center gap-2.5">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#10b981]"></span>
            </span>
            <span class="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">Base de datos activa</span>
          </div>

          <div class="flex flex-col items-end">
            <span class="text-[10px] font-bold text-text-tertiary uppercase tracking-widest italic opacity-60">Resultados</span>
            <!-- result-count se actualiza solo con tu lógica de búsqueda -->
            <span class="text-xs font-black text-text-primary uppercase italic" id="result-count">...</span>
          </div>
        </div>
      </section>

      <!-- Panel de Búsqueda -->
      <section class="mb-16 space-y-6">
        <div class="relative flex flex-col md:flex-row gap-4 items-center">
          <div class="relative w-full shadow-2xl">
             <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-text-tertiary">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" class="opacity-30"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
             </div>
             <input id="skill-search" type="text" autocomplete="off"
               placeholder="Busca tecnologías o especialidades..."
               class="w-full bg-[#0B0E14] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-base font-medium text-text-primary placeholder:text-text-tertiary/40 focus:border-brand-primary/50 outline-none transition-all focus:bg-black/40" />
             <div id="skill-dropdown" class="hidden absolute z-30 mt-3 w-full max-h-72 overflow-y-auto bg-[#121417] border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl"></div>
          </div>
          <button id="search-btn"
            class="w-full md:w-auto h-[60px] px-10 bg-brand-primary text-white text-[11px] font-black rounded-2xl tracking-[0.2em] uppercase transition-all hover:bg-purple-500 hover:shadow-xl hover:shadow-brand-primary/20 hover:scale-105 active:scale-95">
            Filtrar Talento
          </button>
        </div>

        <div class="flex flex-col md:flex-row md:items-center justify-between border-t border-white/[0.03] pt-5 gap-4">
          <div id="selected-skills" class="flex flex-wrap gap-2 transition-all">
             <!-- Etiquetas generadas por JS -->
          </div>
          <button id="clear-btn"
            class="text-[10px] font-bold text-text-tertiary hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2 self-end">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            Limpiar Filtros
          </button>
        </div>
      </section>

      <!-- Grid de Resultados -->
      <section id="results" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-opacity duration-300">
        <!-- Renderizado dinámico vía coderCard -->
      </section>
    </main>
  `;
}

// --- MOUNT ---
export async function mountRecruiterView() {
  mountHeader();

  const selectedBox = document.getElementById("selected-skills");
  const searchInput = document.getElementById("skill-search");
  const dropdown = document.getElementById("skill-dropdown");
  const results = document.getElementById("results");
  const countEl = document.getElementById("result-count");

  // Cargar catálogo de tecnologías.
  try {
    state.allSkills = await skillService.getSkills();
  } catch (err) {
    searchInput.placeholder = "No se pudieron cargar las tecnologías";
    searchInput.disabled = true;
  }
  renderSelected();

  // --- Etiquetas seleccionadas ---
  function renderSelected() {
    if (state.selected.size === 0) {
      selectedBox.innerHTML = `<span class="text-xs text-text-tertiary italic">Ninguna tecnología seleccionada.</span>`;
      return;
    }
    selectedBox.innerHTML = [...state.selected]
      .map((id) => {
        const skill = state.allSkills.find((s) => s.id === id);
        if (!skill) return "";
        return `
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#8044F0] text-white">
            ${escapeHtml(skill.name)}
            <button data-remove="${id}" class="hover:text-white/70 leading-none text-sm" title="Quitar" aria-label="Quitar">&times;</button>
          </span>`;
      })
      .join("");
    selectedBox.querySelectorAll("[data-remove]").forEach((b) =>
      b.addEventListener("click", () => {
        state.selected.delete(Number(b.dataset.remove));
        renderSelected();
        renderDropdown(searchInput.value);
      }),
    );
  }

  // --- Desplegable filtrado por lo que se escribe ---
  function renderDropdown(query) {
    const q = query.trim().toLowerCase();
    const matches = state.allSkills.filter((s) =>
      s.name.toLowerCase().includes(q),
    );

    if (matches.length === 0) {
      dropdown.innerHTML = `<div class="px-4 py-3 text-xs text-text-tertiary">Sin coincidencias.</div>`;
      dropdown.classList.remove("hidden");
      return;
    }

    dropdown.innerHTML = matches
      .map((s) => {
        const on = state.selected.has(s.id);
        return `
          <button data-toggle="${s.id}" type="button"
            class="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors hover:bg-white/[0.04] ${on ? "text-[#8044F0] font-bold" : "text-text-secondary"}">
            <span>${escapeHtml(s.name)}</span>
            <span class="text-xs">${on ? "✓" : "+"}</span>
          </button>`;
      })
      .join("");

    dropdown.querySelectorAll("[data-toggle]").forEach((b) =>
      b.addEventListener("click", () => {
        const id = Number(b.dataset.toggle);
        state.selected.has(id)
          ? state.selected.delete(id)
          : state.selected.add(id);
        renderSelected();
        renderDropdown(searchInput.value);
        searchInput.focus();
      }),
    );
    dropdown.classList.remove("hidden");
  }

  searchInput.addEventListener("focus", () =>
    renderDropdown(searchInput.value),
  );
  searchInput.addEventListener("input", () =>
    renderDropdown(searchInput.value),
  );
  // Cerrar el desplegable al hacer clic fuera.
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#skill-dropdown") && e.target !== searchInput) {
      dropdown.classList.add("hidden");
    }
  });

  // --- Búsqueda de coders ---
  async function search() {
    dropdown.classList.add("hidden");
    results.innerHTML = `<div class="col-span-full py-16 text-center text-text-tertiary text-sm">Buscando…</div>`;
    countEl.textContent = "";

    try {
      let endpoint = "/coders/search";

      if (state.selected.size > 0) {
        const ids = [...state.selected].join(",");
        endpoint += `?skills=${ids}`;
      }

      const coders = await apiClient.get(endpoint);
      const list = Array.isArray(coders) ? coders : [];

      if (list.length === 0) {
        results.innerHTML = `
          <div class="col-span-full py-16 text-center">
            <p class="text-sm text-text-primary font-bold mb-1">Sin resultados</p>
            <p class="text-xs text-text-tertiary">Ningún coder disponible usa esas tecnologías. Prueba con otras o limpia el filtro.</p>
          </div>`;
        countEl.textContent = "0 resultados";
        return;
      }

      results.innerHTML = list.map(coderCard).join("");
      countEl.textContent = `${list.length} ${list.length === 1 ? "coder" : "coders"}`;
      wireCardButtons();
    } catch (err) {
      const msg =
        err.status === 401
          ? "Tu sesión expiró. Inicia sesión de nuevo."
          : "No se pudo realizar la búsqueda.";
      results.innerHTML = `<div class="col-span-full py-16 text-center text-state-error text-sm">${msg}</div>`;
      if (err.status === 401) setTimeout(() => navigate("/login"), 1200);
    }
  }

  function wireCardButtons() {
    results.querySelectorAll("[data-profile]").forEach((btn) => {
      btn.addEventListener("click", () =>
        navigate(`/profile/${btn.dataset.profile}`),
      );
    });
    results.querySelectorAll("[data-interest]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const coderId = Number(btn.dataset.interest);
        btn.disabled = true;
        btn.textContent = "ENVIANDO…";
        try {
          await interestService.showInterest(coderId);
          showToast(
            `Interés enviado. Se notificó al instructor de ${btn.dataset.name}.`,
            "success",
          );
          btn.textContent = "Interés Enviado ✓";
          btn.classList.remove("bg-[#8044F0]", "hover:bg-[#9A6AF5]");
          btn.classList.add(
            "bg-emerald-500/20",
            "text-emerald-300",
            "cursor-default",
          );
        } catch (err) {
          showToast(
            err.body?.error || "No se pudo enviar el interés.",
            "error",
          );
          btn.disabled = false;
          btn.textContent = "Mostrar Interés";
        }
      });
    });
  }
  await search();
  document.getElementById("search-btn").addEventListener("click", search);
  document.getElementById("clear-btn").addEventListener("click", () => {
    state.selected.clear();
    searchInput.value = "";
    renderSelected();
    dropdown.classList.add("hidden");
    search();
  });
}
