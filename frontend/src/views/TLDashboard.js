// ============================================================
// TLDashboard.js — "Centro de Calidad y Acompañamiento" (Dashboard del TL)
// Conectado a los endpoints reales:
//   - GET  /coders/mine        -> "Mi Squad de Coders"
//   - GET  /projects/pending   -> "Proyectos Pendientes de Revisión"
//   - PATCH /users/:id/status  -> cambiar estado del coder (HU-11)
//   - navega a /project/:id     -> evaluar un proyecto
// ============================================================

import { Header, mountHeader } from "../components/Header.js";
import { showToast } from "../components/Toast.js";
import { navigate } from "../router/router.js";
import { apiClient } from "../services/apiClient.js";
import { userService } from "../services/userService.js";
import { renderEditModal, renderDeleteModal, openModal, hideModal, showFieldError } from "./AdminView.js";
import { ROLES } from "../utils/constants.js";
import { validateForm } from "../utils/validators.js";

// Mapeo estado (BD) -> presentación
const STATUS_META = {
  available:       { label: "Disponible",      dot: "bg-emerald-400", text: "text-emerald-300", chip: "border-emerald-400/30 bg-emerald-400/10" },
  in_conversation: { label: "En Conversación", dot: "bg-amber-400",   text: "text-amber-300",   chip: "border-amber-400/30 bg-amber-400/10" },
  unavailable:     { label: "No Disponible",   dot: "bg-zinc-400",    text: "text-zinc-300",    chip: "border-zinc-400/30 bg-zinc-400/10" },
};

// --- helpers ---
const initials = (name) => (name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

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

function avatar(name) {
  return `<div class="w-9 h-9 rounded-full bg-[#8044F0]/15 border border-[#8044F0]/30 flex items-center justify-center text-[11px] font-black text-[#8044F0] shrink-0">${initials(name)}</div>`;
}

function typeBadge(isExternal) {
  const ext = !!isExternal;
  const label = ext ? "Externo" : "Formación";
  return `<span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${ext ? "text-cyan-300 border-cyan-400/30 bg-cyan-400/10" : "text-[#8044F0] border-[#8044F0]/30 bg-[#8044F0]/10"}">${label}</span>`;
}

function techChips(skills) {
  const arr = Array.isArray(skills) ? skills : [];
  if (arr.length === 0) return `<span class="text-[10px] text-text-tertiary italic">Sin tecnologías</span>`;
  const shown = arr.slice(0, 3);
  const more = arr.length - shown.length;
  const chips = shown.map((t) => `<span class="px-2.5 py-1 rounded-md text-[10px] font-bold text-text-secondary bg-white/[0.03] border border-border-default">${t}</span>`).join("");
  const extra = more > 0 ? `<span class="px-2 py-1 rounded-md text-[10px] font-black text-text-tertiary">+${more}</span>` : "";
  return `<div class="flex flex-wrap items-center gap-1.5">${chips}${extra}</div>`;
}

function statusBadge(status) {
  const m = STATUS_META[status] || STATUS_META.available;
  return `<span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black ${m.text} ${m.chip} border"><span class="w-1.5 h-1.5 rounded-full ${m.dot}"></span>${m.label}</span>`;
}

function statusSelect(id, status) {
  const opts = Object.entries(STATUS_META).map(
    ([val, m]) => `<option value="${val}" ${val === status ? "selected" : ""}>${m.label}</option>`
  ).join("");
  return `
    <select data-status-select data-coder-id="${id}"
      class="bg-[#0B0E14] border border-border-default rounded-lg px-3 py-2 text-[11px] font-bold text-text-primary focus:border-[#8044F0]/50 outline-none cursor-pointer">
      ${opts}
    </select>`;
}

function pendingRow(p) {
  return `
    <tr class="hover:bg-white/[0.02] transition-colors">
      <td class="py-4 px-6"><div class="flex items-center gap-3">${avatar(p.coderName)}<div><p class="text-sm font-bold text-text-primary">${p.coderName || "—"}</p><p class="text-[10px] text-text-tertiary uppercase tracking-wider">Estudiante</p></div></div></td>
      <td class="py-4 px-4"><p class="text-sm font-bold text-text-primary">${p.title}</p><span class="text-[10px] font-black text-amber-300 uppercase tracking-widest">Sin Calificar</span></td>
      <td class="py-4 px-4">${typeBadge(p.isExternal)}</td>
      <td class="py-4 px-4 text-xs text-text-tertiary">${tiempoRelativo(p.createdAt)}</td>
      <td class="py-4 px-4">${techChips(p.skills)}</td>
      <td class="py-4 px-6 text-right">
        <button data-evaluate="${p.id}" class="px-5 py-2.5 bg-[#8044F0] hover:bg-[#9A6AF5] text-white text-[10px] font-black rounded-lg tracking-widest uppercase transition-all active:scale-95 shadow-lg shadow-[#8044F0]/20">Evaluar Proyecto</button>
      </td>
    </tr>`;
}

function squadRow(c) {
  const score = c.avgScore != null ? c.avgScore : "—";
  const proys = c.projectCount != null ? `${c.projectCount} proyecto${c.projectCount === 1 ? "" : "s"}` : "";
  return `
    <tr class="hover:bg-white/[0.02] transition-colors">
      <td class="py-4 px-6"><div class="flex items-center gap-3">${avatar(c.name)}<div><p class="text-sm font-bold text-text-primary">${c.name}</p><p class="text-[10px] text-text-tertiary uppercase tracking-wider">${proys}</p></div></div></td>
      <td class="py-4 px-4"><span class="text-lg font-black text-[#8044F0]">${score}</span><span class="text-xs text-text-tertiary">/100</span></td>
      <td class="py-4 px-4">${statusBadge(c.availabilityStatus)}</td>
      <td class="py-4 px-4">${statusSelect(c.id, c.availabilityStatus)}</td>
      <td class="py-4 px-6 text-right">
        <div class="flex justify-end gap-2">
          <button data-action="tl-edit-user" data-user-id="${c.id}" class="p-2 rounded-xl bg-white/5 border border-border-default text-text-tertiary hover:text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-90" title="Editar Coder">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
          </button>
          <button data-action="tl-delete-user" data-user-id="${c.id}" data-user-name="${c.name}" class="p-2 rounded-xl bg-[#EF4444]/5 border border-[#EF4444]/10 text-text-tertiary hover:text-white hover:bg-[#EF4444] hover:border-[#EF4444]/40 transition-all active:scale-90" title="Eliminar Coder">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>
      </td>
    </tr>`;
}

function kpiCard(label, valId, sub, subId, accent) {
  return `
    <div class="p-6 bg-[#161B26]/60 backdrop-blur-xl border border-border-default/80 rounded-[10px] hover:border-[#8044F0]/40 transition-all hover:-translate-y-1">
      <p class="text-[10px] font-black text-text-tertiary tracking-[0.15em] mb-3 uppercase italic">${label}</p>
      <h4 id="${valId}" class="text-3xl font-black ${accent || "text-white"}">—</h4>
      <p id="${subId || ""}" class="text-[11px] text-text-tertiary mt-1">${sub}</p>
    </div>`;
}

// --- VISTA (cascarón; los datos se cargan en el mount) ---
export function TLDashboard() {
  const loadingRow = (cols) => `<tr><td colspan="${cols}" class="py-8 px-6 text-center text-xs text-text-tertiary">Cargando…</td></tr>`;

  return `
    ${Header({})}
    <div class="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none opacity-40">
      <div class="absolute top-[5%] -left-1/4 w-[500px] h-[500px] bg-[#8044F0]/10 rounded-full blur-[140px]"></div>
    </div>

    <main class="mx-auto max-w-7xl px-6 py-12">
      <!-- CABECERA -->
      <section class="mb-10">
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 class="text-4xl font-black text-white tracking-tighter font-heading">Centro de Calidad y Acompañamiento</h1>
            <p class="text-text-secondary text-sm mt-1">Tu consola de evaluación · <span class="text-text-primary font-bold">Líder de Equipo</span></p>
          </div>
          <span class="px-4 py-2 rounded-full text-[11px] font-black text-[#8044F0] border border-[#8044F0]/30 bg-[#8044F0]/10 uppercase tracking-widest">Líder de Equipo</span>
        </div>
        <!-- KPIs -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
          ${kpiCard("Puntaje Promedio", "kpi-avg", "de todos tus coders", null, "text-[#8044F0]")}
          ${kpiCard("Pendientes de Revisión", "kpi-pending", "requieren tu atención", null, "text-amber-300")}
          ${kpiCard("Coders a tu Cargo", "kpi-squad", "en tu equipo", null, null)}
          ${kpiCard("Tasa de Inserción", "kpi-hire", "empleados", "kpi-hire-sub", "text-emerald-300")}
        </div>
      </section>

      <!-- PENDIENTES DE REVISIÓN -->
      <section class="mb-10 bg-bg-secondary/30 backdrop-blur-3xl rounded-[10px] border border-border-default overflow-hidden">
        <div class="px-8 py-6 border-b border-border-default/40 flex items-center gap-3">
          <span class="text-amber-300">⚠</span>
          <h2 class="text-sm font-black text-text-primary uppercase tracking-widest">Proyectos Pendientes de Revisión</h2>
          <span id="pending-count" class="px-2.5 py-0.5 rounded-full text-[10px] font-black text-amber-300 bg-amber-400/10 border border-amber-400/30">0</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="border-b border-border-default"><tr class="text-[10px] font-black text-[#8044F0] tracking-[0.2em] uppercase">
              <th class="py-4 px-6">Estudiante</th><th class="py-4 px-4">Proyecto</th><th class="py-4 px-4">Tipo</th><th class="py-4 px-4">Enviado</th><th class="py-4 px-4">Tecnologías</th><th class="py-4 px-6 text-right">Acciones</th>
            </tr></thead>
            <tbody id="tl-pending-body" class="divide-y divide-border-default/40">${loadingRow(6)}</tbody>
          </table>
        </div>
      </section>

      <!-- MI SQUAD -->
      <section class="bg-bg-secondary/30 backdrop-blur-3xl rounded-[10px] border border-border-default overflow-hidden">
        <div class="px-8 py-6 border-b border-border-default/40 flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center gap-3">
            <span class="text-[#8044F0]">👥</span>
            <h2 class="text-sm font-black text-text-primary uppercase tracking-widest">Mi Squad de Coders</h2>
            <span id="squad-count" class="px-2.5 py-0.5 rounded-full text-[10px] font-black text-[#8044F0] bg-[#8044F0]/10 border border-[#8044F0]/30">0</span>
          </div>
          <div class="flex items-center gap-4 text-[11px] font-bold">
            <span class="text-emerald-300">● Disponibles <span id="squad-disp">0</span></span>
            <span class="text-amber-300">● En Conversación <span id="squad-conv">0</span></span>
            <span class="text-zinc-300">● No Disponibles <span id="squad-empl">0</span></span>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="border-b border-border-default"><tr class="text-[10px] font-black text-[#8044F0] tracking-[0.2em] uppercase">
              <th class="py-4 px-6">Coder</th><th class="py-4 px-4">Puntaje Prom.</th><th class="py-4 px-4">Estado</th><th class="py-4 px-4">Cambiar Estado</th><th class="py-4 px-6 text-right">Acciones</th>
            </tr></thead>
            <tbody id="tl-squad-body" class="divide-y divide-border-default/40">${loadingRow(5)}</tbody>
          </table>
        </div>
      </section>
    </main>

    ${renderEditModal()}
    ${renderDeleteModal()}
  `;
}

let tlSelectedUser = null;
let tlUserToDelete = null;

const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
const setHTML = (id, val) => { const el = document.getElementById(id); if (el) el.innerHTML = val; };

async function refreshSquad() {
  try {
    const squad = await apiClient.get("/coders/mine");
    const coders = Array.isArray(squad) ? squad : [];
    const squadBody = document.getElementById("tl-squad-body");
    if (squadBody) {
      squadBody.innerHTML = coders.length
        ? coders.map(squadRow).join("")
        : `<tr><td colspan="5" class="py-8 px-6 text-center text-xs text-text-tertiary">No tienes coders asignados todavía.</td></tr>`;
    }
    setText("squad-count", coders.length);

    const disp = coders.filter((c) => c.availabilityStatus === "available").length;
    const conv = coders.filter((c) => c.availabilityStatus === "in_conversation").length;
    const empl = coders.filter((c) => c.availabilityStatus === "unavailable").length;
    setText("squad-disp", disp);
    setText("squad-conv", conv);
    setText("squad-empl", empl);

    const scores = coders.filter((c) => c.avgScore != null).map((c) => c.avgScore);
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : "—";
    setHTML("kpi-avg", `${avg}<span class="text-lg text-text-tertiary">/100</span>`);
    setText("kpi-squad", coders.length);

    const tasa = coders.length ? Math.round((empl / coders.length) * 100) : 0;
    setText("kpi-hire", `${tasa}%`);
    setText("kpi-hire-sub", `${empl} de ${coders.length} coders`);

    bindSquadEvents();
  } catch (err) {
    showToast("No se pudo refrescar la tabla.", "error");
  }
}

function bindSquadEvents() {
  document.querySelectorAll("[data-evaluate]").forEach((btn) => {
    btn.removeEventListener("click", btn._evaluateHandler);
    btn._evaluateHandler = () => navigate(`/project/${btn.dataset.evaluate}`);
    btn.addEventListener("click", btn._evaluateHandler);
  });

  document.querySelectorAll("[data-status-select]").forEach((sel) => {
    sel.removeEventListener("change", sel._statusHandler);
    sel._statusHandler = async (e) => {
      const coderId = e.target.dataset.coderId;
      const status = e.target.value;
      try {
        await apiClient.patch(`/users/${coderId}/status`, { status });
        showToast("Estado actualizado.", "success");
        const badgeCell = e.target.closest("tr")?.querySelector("td:nth-child(3)");
        if (badgeCell) badgeCell.innerHTML = statusBadge(status);
      } catch (err) {
        showToast(err.body?.error || "No se pudo cambiar el estado.", "error");
      }
    };
    sel.addEventListener("change", sel._statusHandler);
  });

  document.querySelectorAll("[data-action='tl-edit-user']").forEach((btn) => {
    btn.removeEventListener("click", btn._editHandler);
    btn._editHandler = async (e) => {
      const id = Number(e.currentTarget.dataset.userId);
      try {
        const res = await apiClient.get(`/users/${id}`);
        tlSelectedUser = res.data.user;
        openEditModal();
      } catch (err) {
        showToast("No se pudo cargar la información del coder.", "error");
      }
    };
    btn.addEventListener("click", btn._editHandler);
  });

  document.querySelectorAll("[data-action='tl-delete-user']").forEach((btn) => {
    btn.removeEventListener("click", btn._deleteHandler);
    btn._deleteHandler = (e) => {
      const id = Number(e.currentTarget.dataset.userId);
      const name = e.currentTarget.dataset.userName;
      tlUserToDelete = { id, name };
      openModal("modal-delete");
    };
    btn.addEventListener("click", btn._deleteHandler);
  });
}

function openEditModal() {
  document.getElementById("edit-name").value = tlSelectedUser.name || "";
  document.getElementById("edit-email").value = tlSelectedUser.email || "";
  document.getElementById("edit-phone").value = tlSelectedUser.phone || "";
  document.getElementById("edit-document").value = tlSelectedUser.document || "";
  document.getElementById("edit-role").value = tlSelectedUser.roleName || "";
  document.getElementById("edit-company").value = tlSelectedUser.company || "";

  const companyField = document.getElementById("edit-company-field");
  if (tlSelectedUser.roleName === ROLES.RECRUITER) {
    companyField.classList.remove("hidden");
    requestAnimationFrame(() => {
      companyField.classList.add("max-h-[200px]", "opacity-100");
      companyField.classList.remove("max-h-0", "opacity-0");
    });
  } else {
    companyField.classList.add("hidden", "opacity-0");
  }

  document.querySelectorAll("#edit-form [id$='-error']").forEach((el) => el.classList.add("hidden"));
  const formError = document.getElementById("edit-form-error");
  if (formError) formError.classList.add("hidden");

  openModal("modal-edit");
}

async function handleTlEditUser() {
  document.querySelectorAll("#edit-form [id$='-error']").forEach((el) => el.classList.add("hidden"));

  const payload = {
    name: document.getElementById("edit-name")?.value.trim(),
    email: document.getElementById("edit-email")?.value.trim(),
    role: document.getElementById("edit-role")?.value,
    phone: document.getElementById("edit-phone")?.value.trim() || undefined,
    document: document.getElementById("edit-document")?.value.trim() || undefined,
    company: document.getElementById("edit-role")?.value === ROLES.RECRUITER
      ? document.getElementById("edit-company")?.value.trim()
      : undefined,
  };

  let valid = true;
  if (!payload.name) {
    showFieldError("edit-name-error", "La firma es obligatoria.");
    valid = false;
  }
  if (!payload.role) {
    showFieldError("edit-role-error", "El nivel de sistema es requerido.");
    valid = false;
  }
  const { valid: emailOk, errors } = validateForm({ email: payload.email });
  if (!emailOk) {
    showFieldError("edit-email-error", errors.email);
    valid = false;
  }

  if (!valid) return;

  const btn = document.getElementById("edit-submit-btn");
  btn.disabled = true;
  btn.textContent = "SINCRONIZANDO...";

  try {
    await userService.updateUser(tlSelectedUser.id, payload);
    hideModal("modal-edit");
    showToast("CODER ACTUALIZADO CON ÉXITO.", "success");
    await refreshSquad();
  } catch (error) {
    const msg = error.body?.error || "Falla en la red del ledger.";
    showToast(msg, "error");
    const errEl = document.getElementById("edit-form-error");
    errEl.textContent = msg;
    errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false;
    btn.textContent = "GUARDAR CAMBIOS";
  }
}

async function handleTlDeleteUser() {
  if (!tlUserToDelete) return;

  const btn = document.getElementById("delete-confirm-btn");
  btn.disabled = true;
  btn.textContent = "DELETING...";

  try {
    await userService.deleteUser(tlUserToDelete.id);
    hideModal("modal-delete");
    showToast("CODER ELIMINADO DE ALTEA.", "error");
    tlUserToDelete = null;
    await refreshSquad();
  } catch (error) {
    const msg = error.body?.error || "No se pudo eliminar el coder.";
    showToast(msg, "error");
    btn.disabled = false;
    btn.textContent = "Eliminar";
  }
}

// --- MOUNT (trae datos reales y liga eventos) ---
export async function mountTLDashboard() {
  mountHeader();

  const pendingBody = document.getElementById("tl-pending-body");
  const squadBody = document.getElementById("tl-squad-body");

  try {
    const [squad, pendResp] = await Promise.all([
      apiClient.get("/coders/mine"),
      apiClient.get("/projects/pending"),
    ]);

    const coders = Array.isArray(squad) ? squad : [];
    const pending = pendResp?.data?.projects || [];

    // --- tabla pendientes ---
    pendingBody.innerHTML = pending.length
      ? pending.map(pendingRow).join("")
      : `<tr><td colspan="6" class="py-8 px-6 text-center text-xs text-text-tertiary">No tienes proyectos pendientes de revisión. 🎉</td></tr>`;
    setText("pending-count", pending.length);

    // --- tabla squad ---
    squadBody.innerHTML = coders.length
      ? coders.map(squadRow).join("")
      : `<tr><td colspan="5" class="py-8 px-6 text-center text-xs text-text-tertiary">No tienes coders asignados todavía.</td></tr>`;
    setText("squad-count", coders.length);

    // --- KPIs ---
    const scores = coders.filter((c) => c.avgScore != null).map((c) => c.avgScore);
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : "—";
    setHTML("kpi-avg", `${avg}<span class="text-lg text-text-tertiary">/100</span>`);
    setText("kpi-pending", pending.length);
    setText("kpi-squad", coders.length);

    const disp = coders.filter((c) => c.availabilityStatus === "available").length;
    const conv = coders.filter((c) => c.availabilityStatus === "in_conversation").length;
    const empl = coders.filter((c) => c.availabilityStatus === "unavailable").length;
    setText("squad-disp", disp);
    setText("squad-conv", conv);
    setText("squad-empl", empl);

    const tasa = coders.length ? Math.round((empl / coders.length) * 100) : 0;
    setText("kpi-hire", `${tasa}%`);
    setText("kpi-hire-sub", `${empl} de ${coders.length} coders`);

    bindSquadEvents();

    document.querySelectorAll("[data-modal-close]").forEach((el) => {
      el.addEventListener("click", () => hideModal(el.dataset.modalClose));
    });

    document.getElementById("edit-submit-btn")?.addEventListener("click", handleTlEditUser);
    document.getElementById("delete-confirm-btn")?.addEventListener("click", handleTlDeleteUser);
  } catch (err) {
    const msg = err.status === 401 ? "Tu sesión expiró. Inicia sesión de nuevo." : "No se pudieron cargar los datos del dashboard.";
    if (pendingBody) pendingBody.innerHTML = `<tr><td colspan="6" class="py-8 px-6 text-center text-xs text-state-error">${msg}</td></tr>`;
    if (squadBody) squadBody.innerHTML = `<tr><td colspan="5" class="py-8 px-6 text-center text-xs text-state-error">${msg}</td></tr>`;
    showToast(msg, "error");
    if (err.status === 401) setTimeout(() => navigate("/login"), 1200);
  }
}
