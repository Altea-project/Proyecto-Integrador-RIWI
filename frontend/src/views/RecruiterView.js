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
  escapeHtml((name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase());

const STATUS_META = {
  available:       { label: "Disponible",      text: "text-emerald-300", chip: "border-emerald-400/30 bg-emerald-400/10", dot: "bg-emerald-400" },
  in_conversation: { label: "En Conversación", text: "text-amber-300",   chip: "border-amber-400/30 bg-amber-400/10",   dot: "bg-amber-400" },
};

function statusBadge(status) {
  const m = STATUS_META[status] || STATUS_META.available;
  return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black ${m.text} ${m.chip} border"><span class="w-1.5 h-1.5 rounded-full ${m.dot}"></span>${m.label}</span>`;
}

function coderCard(c) {
  const score = c.avg_score != null ? `${c.avg_score}` : "—";
  const star = c.has_starred
    ? `<span class="inline-flex items-center gap-1 text-[10px] font-black text-amber-300 uppercase tracking-widest">★ Destacado</span>`
    : "";
  const chips = (c.skills || [])
    .map((s) => `<span class="px-2.5 py-1 rounded-md text-[10px] font-bold text-text-secondary bg-white/[0.03] border border-border-default">${escapeHtml(s)}</span>`)
    .join("");

  return `
    <div class="p-6 bg-bg-secondary/30 border border-border-default rounded-[10px] hover:border-[#8044F0]/40 transition-all flex flex-col gap-4">
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-full bg-[#8044F0]/15 border border-[#8044F0]/30 flex items-center justify-center text-xs font-black text-[#8044F0]">${initials(c.name)}</div>
          <div>
            <p class="text-sm font-black text-text-primary">${escapeHtml(c.name)}</p>
            ${star || `<p class="text-[10px] text-text-tertiary uppercase tracking-wider">Coder verificado</p>`}
          </div>
        </div>
        ${statusBadge(c.availability_status)}
      </div>

      <div class="flex items-baseline gap-1">
        <span class="text-2xl font-black text-[#8044F0]">${score}</span>
        <span class="text-xs text-text-tertiary">/100 · puntaje promedio</span>
      </div>

      <div class="flex flex-wrap gap-1.5">${chips}</div>

      <div class="flex gap-2 mt-auto pt-2">
        <button data-interest="${c.id}" data-name="${escapeHtml(c.name)}"
          class="flex-1 px-4 py-2.5 bg-[#8044F0] hover:bg-[#9A6AF5] text-white text-[10px] font-black rounded-lg tracking-widest uppercase transition-all active:scale-95">
          Mostrar Interés
        </button>
        <button data-profile="${c.id}"
          class="px-4 py-2.5 bg-[#161B26] border border-border-default hover:border-[#8044F0]/40 text-text-primary text-[10px] font-black rounded-lg tracking-widest uppercase transition-all">
          Ver Perfil
        </button>
      </div>
    </div>`;
}

// --- VISTA (cascarón; datos y eventos en el mount) ---
export function RecruiterView() {
  return `
    ${Header({})}
    <div class="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none opacity-40">
      <div class="absolute top-[5%] -right-1/4 w-[500px] h-[500px] bg-[#8044F0]/10 rounded-full blur-[140px]"></div>
    </div>

    <main class="mx-auto max-w-7xl px-6 py-12">
      <section class="mb-8">
        <h1 class="text-4xl font-black text-white tracking-tighter font-heading">Buscador de Talento</h1>
        <p class="text-text-secondary text-sm mt-1">Encuentra coders por tecnología, ordenados por puntaje verificado.</p>
      </section>

      <!-- Panel de búsqueda -->
      <section class="mb-10 p-6 bg-bg-secondary/30 border border-border-default rounded-[10px]">
        <p class="text-[10px] font-black text-[#8044F0] uppercase tracking-[0.2em] mb-3">Filtra por tecnologías</p>

        <!-- Tecnologías seleccionadas (etiquetas removibles) -->
        <div id="selected-skills" class="flex flex-wrap gap-2 mb-3"></div>

        <!-- Buscador con desplegable -->
        <div class="relative">
          <input id="skill-search" type="text" autocomplete="off"
            placeholder="Escribe una tecnología (ej. React, Node.js)…"
            class="w-full bg-[#0B0E14] border border-border-default rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-[#8044F0]/50 outline-none" />
          <div id="skill-dropdown" class="hidden absolute z-30 mt-1 w-full max-h-60 overflow-y-auto bg-[#161B26] border border-border-default rounded-lg shadow-2xl shadow-black/40"></div>
        </div>

        <div class="flex items-center gap-3 flex-wrap mt-4">
          <button id="search-btn"
            class="px-6 py-2.5 bg-[#8044F0] hover:bg-[#9A6AF5] text-white text-[11px] font-black rounded-lg tracking-widest uppercase transition-all active:scale-95">
            Buscar Talento
          </button>
          <button id="clear-btn"
            class="text-[11px] font-black text-text-tertiary hover:text-text-primary tracking-widest uppercase transition-all">
            Limpiar
          </button>
          <span id="result-count" class="text-xs text-text-tertiary"></span>
        </div>
      </section>

      <!-- Resultados -->
      <section id="results" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div class="col-span-full py-16 text-center text-text-tertiary">
          <p class="text-sm">Busca y selecciona una o más tecnologías, luego presiona <span class="text-text-primary font-bold">Buscar Talento</span>.</p>
        </div>
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
    const matches = state.allSkills.filter((s) => s.name.toLowerCase().includes(q));

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
        state.selected.has(id) ? state.selected.delete(id) : state.selected.add(id);
        renderSelected();
        renderDropdown(searchInput.value);
        searchInput.focus();
      }),
    );
    dropdown.classList.remove("hidden");
  }

  searchInput.addEventListener("focus", () => renderDropdown(searchInput.value));
  searchInput.addEventListener("input", () => renderDropdown(searchInput.value));
  // Cerrar el desplegable al hacer clic fuera.
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#skill-dropdown") && e.target !== searchInput) {
      dropdown.classList.add("hidden");
    }
  });

  // --- Búsqueda de coders ---
  async function search() {
    if (state.selected.size === 0) {
      showToast("Selecciona al menos una tecnología.", "info");
      return;
    }
    dropdown.classList.add("hidden");
    results.innerHTML = `<div class="col-span-full py-16 text-center text-text-tertiary text-sm">Buscando…</div>`;
    countEl.textContent = "";

    try {
      const ids = [...state.selected].join(",");
      const coders = await apiClient.get(`/coders/search?skills=${ids}`); // array crudo
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
      const msg = err.status === 401 ? "Tu sesión expiró. Inicia sesión de nuevo." : "No se pudo realizar la búsqueda.";
      results.innerHTML = `<div class="col-span-full py-16 text-center text-state-error text-sm">${msg}</div>`;
      if (err.status === 401) setTimeout(() => navigate("/login"), 1200);
    }
  }

  function wireCardButtons() {
    results.querySelectorAll("[data-profile]").forEach((btn) => {
      btn.addEventListener("click", () => navigate(`/profile/${btn.dataset.profile}`));
    });
    results.querySelectorAll("[data-interest]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const coderId = Number(btn.dataset.interest);
        btn.disabled = true;
        btn.textContent = "ENVIANDO…";
        try {
          await interestService.showInterest(coderId);
          showToast(`Interés enviado. Se notificó al instructor de ${btn.dataset.name}.`, "success");
          btn.textContent = "Interés Enviado ✓";
          btn.classList.remove("bg-[#8044F0]", "hover:bg-[#9A6AF5]");
          btn.classList.add("bg-emerald-500/20", "text-emerald-300", "cursor-default");
        } catch (err) {
          showToast(err.body?.error || "No se pudo enviar el interés.", "error");
          btn.disabled = false;
          btn.textContent = "Mostrar Interés";
        }
      });
    });
  }

  document.getElementById("search-btn").addEventListener("click", search);
  document.getElementById("clear-btn").addEventListener("click", () => {
    state.selected.clear();
    searchInput.value = "";
    renderSelected();
    dropdown.classList.add("hidden");
    results.innerHTML = `<div class="col-span-full py-16 text-center text-text-tertiary text-sm">Busca y selecciona tecnologías, luego presiona Buscar Talento.</div>`;
    countEl.textContent = "";
  });
}
