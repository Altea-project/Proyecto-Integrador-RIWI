import { Header, mountHeader } from "../components/Header.js";
import { Modal } from "../components/AdminModal.js";
import { Input } from "../components/Input.js";
import { Select } from "../components/Select.js";
import { Button } from "../components/Button.js";
import { userService } from "../services/userService.js";
import { showToast } from "../components/Toast.js";
import { ROLES } from "../utils/constants.js";
import { validateForm } from "../utils/validators.js";
import { UserRow } from "../components/UserRow.js";

const ROLE_OPTIONS = [
  { value: ROLES.ADMIN, label: "Administrador de Red" },
  { value: ROLES.CODER, label: "Coder (Estudiante)" },
  { value: ROLES.INSTRUCTOR, label: "Team Leader (Mentor)" },
  { value: ROLES.RECRUITER, label: "Partner / Reclutador" },
];

let lastCreatedUser = null;
let currentUsers = [];
let activeFilter = "all";
let searchTerm = "";

// --- COMPONENTE: MODAL DE REGISTRO ---
function renderRegisterModal() {
  return Modal({
    id: "modal-register",
    title: "Nueva Identidad en Altea",
    size: "md",
    content: `
      <div class="space-y-7 animate-in fade-in zoom-in duration-300">
        <!-- Badge Superior Informativo -->
        <div class="flex items-center gap-4 p-5 bg-[#8044F0]/5 rounded-2xl border border-[#8044F0]/15 relative overflow-hidden group">
            <div class="absolute inset-0 bg-gradient-to-r from-[#8044F0]/0 via-[#8044F0]/5 to-[#8044F0]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div class="p-3 bg-[#8044F0]/20 rounded-xl text-[#8044F0] shadow-sm">
                <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/></svg>
            </div>
            <div>
                <p class="text-[11px] font-bold text-[#8044F0] uppercase tracking-[0.15em] mb-0.5">Seguridad Altea</p>
                <p class="text-sm font-medium text-text-secondary">Generando acceso para el nuevo escalafón técnico.</p>
            </div>
        </div>
        
        <form id="register-form" class="space-y-6" novalidate>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="space-y-1.5">
              ${Input({ id: "reg-name", label: "Nombre Profesional", placeholder: "Identificación del usuario" })}
              <p id="reg-name-error" class="text-state-error text-[10px] font-bold hidden px-1"></p>
            </div>
            <div class="space-y-1.5">
              ${Input({ id: "reg-email", label: "Correo Corporativo", type: "email", placeholder: "ejemplo@riwi.io" })}
              <p id="reg-email-error" class="text-state-error text-[10px] font-bold hidden px-1"></p>
            </div>
          </div>

          <div class="space-y-1.5">
            ${Select({ id: "reg-role", label: "Rango de Sistema", options: ROLE_OPTIONS, placeholder: "Definir privilegios..." })}
            <p id="reg-role-error" class="text-state-error text-[10px] font-bold hidden px-1"></p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-border-default/50">
            ${Input({ id: "reg-phone", label: "Teléfono", placeholder: "+57 300..." })}
            ${Input({ id: "reg-document", label: "DNI / Documento", placeholder: "ID Institucional" })}
          </div>

          <div id="reg-company-field" class="hidden overflow-hidden transition-all duration-500 ease-in-out">
             <div class="p-4 rounded-2xl bg-bg-primary/50 border border-[#8044F0]/30 shadow-inner mt-2">
                ${Input({ id: "reg-company", label: "Compañía Partner", placeholder: "Empresa de reclutamiento" })}
             </div>
          </div>

          <p id="register-form-error" class="bg-state-error/10 text-state-error p-4 rounded-xl text-[11px] font-black text-center border border-state-error/20 hidden" role="alert"></p>
        </form>
      </div>
    `,
    footer: `
      <div class="flex items-center justify-end gap-5 w-full border-t border-border-default pt-6 mt-4">
        <button type="button" data-modal-close="modal-register" class="text-[11px] font-black text-text-tertiary hover:text-text-primary tracking-widest uppercase transition-all duration-300 active:scale-95">
          DESCARTAR
        </button>
        <button type="button" id="register-submit-btn" class="px-8 py-3.5 bg-[#8044F0] text-text-primary text-[11px] font-black rounded-xl hover:bg-[#9A6AF5] hover:shadow-[0_8px_20px_-4px_rgba(128,68,240,0.4)] transition-all duration-300 tracking-widest uppercase shadow-lg shadow-[#8044F0]/10 active:scale-95">
          INSCRIBIR MIEMBRO
        </button>
      </div>
    `,
  });
}

// --- COMPONENTE: MODAL CLAVE TEMPORAL ---
function renderTempPasswordModal() {
  const u = lastCreatedUser;
  console.log("lastCreatedUser:", u);
  return Modal({
    id: "modal-temp-password",
    title: "Acceso Generado",
    size: "sm",
    content: `
      <div class="text-center py-6 px-2 animate-in slide-in-from-bottom duration-500">
        <h3 class="text-text-primary font-black text-2xl mb-1 tracking-tighter">${u?.user?.name || "Registro Exitoso"}</h3>
        <p class="text-[10px] text-text-tertiary uppercase tracking-widest mb-8 font-bold italic opacity-70">Certificación cifrada Altea v.1.0</p>
        
        <div class="relative group bg-[#0B0E14] rounded-3xl border border-[#8044F0]/20 p-8 overflow-hidden shadow-2xl">
          <div class="absolute inset-0 bg-gradient-to-tr from-[#8044F0]/10 via-transparent to-transparent opacity-50"></div>
          <p class="text-[9px] font-bold text-[#8044F0] mb-4 uppercase tracking-[0.2em] relative z-10 text-center">ClaveMaestra de entrada</p>
          <div class="flex items-center justify-center gap-6 relative z-10 font-mono">
            <code id="temp-password-value" class="text-3xl font-black text-text-primary tracking-[0.1em] drop-shadow-lg">${u?.tempPassword || "••••••"}</code>
            <button id="copy-temp-password-btn" class="p-3 bg-[#161B26] hover:bg-[#8044F0] rounded-2xl text-text-primary border border-border-default transition-all duration-300 hover:-translate-y-1 active:translate-y-0 active:scale-90 group-hover:shadow-[0_10px_20px_-5px_rgba(128,68,240,0.5)]">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>
          </div>
        </div>
        <div class="mt-8 bg-[#EF4444]/10 p-3 rounded-xl border border-[#EF4444]/20 flex items-center gap-3">
             <svg class="text-[#EF4444] shrink-0" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
             <p class="text-[9px] text-[#EF4444] font-black uppercase text-left leading-tight tracking-wide">AVISO: Esta credencial solo aparecerá en esta sesión de administrador.</p>
        </div>
      </div>
    `,
    footer: `
      <button data-modal-close="modal-temp-password" class="w-full bg-[#FFFFFF] hover:bg-text-secondary text-bg-primary font-black py-4 rounded-2xl border-none transition-all duration-300 tracking-[0.2em] text-xs shadow-xl active:scale-95">
        ENTENDIDO
      </button>
    `,
  });
}

function renderAssignTlModal() {
  return Modal({
    id: "modal-assign-tl",
    title: "Vincular Protocolo de Mentoría",
    size: "sm",
    content: `
      <div class="space-y-8 pt-2 animate-in fade-in slide-in-from-top-4 duration-300">
        
        <!-- Badge de Contexto: Identidad del Coder -->
        <div class="p-5 bg-white/[0.02] border border-white/[0.05] rounded-[24px] relative overflow-hidden group">
            <div class="absolute top-0 left-0 w-1 h-full bg-[#8044F0] opacity-60"></div>
            <p class="text-[9px] font-black text-text-tertiary uppercase tracking-[0.25em] mb-3 italic">Miembro a Certificar</p>
            <div class="flex items-center gap-3">
               <div class="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
                  <svg width="14" height="14" class="text-brand-primary" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
               </div>
               <span id="assign-tl-coder-name" class="text-lg font-black text-white tracking-tighter uppercase font-heading group-hover:text-brand-primary transition-colors"></span>
            </div>
        </div>

        <!-- Selector de Mentor -->
        <div class="space-y-3">
          <div class="flex items-center justify-between pl-1">
             <label class="text-[10px] font-black text-[#8044F0] uppercase tracking-[0.2em]">Escoger Auditor Técnico</label>
             <span class="text-[9px] text-text-tertiary font-bold tracking-widest italic opacity-50 underline decoration-[#8044F0]/40">TL Nivel 2+</span>
          </div>
          
          <div class="relative group">
             <select id="assign-tl-select" class="w-full bg-[#0B0E14] border-2 border-border-default rounded-[18px] px-5 py-4 text-sm text-text-primary font-medium focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all cursor-pointer appearance-none">
                <option value="">Desplegar Roster de Mentores...</option>
             </select>
             <!-- Icono custom para el select -->
             <div class="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-text-tertiary group-focus-within:text-brand-primary transition-colors">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
             </div>
          </div>
          
          <p id="assign-tl-error" class="bg-state-error/10 text-state-error text-[10px] font-black p-3 rounded-xl border border-state-error/20 mt-3 hidden text-center uppercase tracking-tight"></p>
        </div>

        <p class="text-[9px] text-text-tertiary text-center leading-relaxed font-medium uppercase tracking-widest px-4 opacity-40">
           Al vincular un mentor, el Coder heredará automáticamente la línea de supervisión y reporte para empresas externas.
        </p>
      </div>
    `,
    footer: `
      <div class="flex items-center justify-between w-full pt-6 mt-2 border-t border-border-default/40">
        <button type="button" data-modal-close="modal-assign-tl" class="text-[10px] font-black text-text-tertiary hover:text-text-primary tracking-widest uppercase transition-all duration-300 hover:scale-105 active:scale-90">
          Descargar
        </button>
        <button type="button" id="assign-tl-submit-btn" class="px-10 py-4 bg-text-primary text-bg-primary text-[11px] font-black rounded-xl hover:bg-brand-primary hover:text-white transition-all tracking-[0.2em] shadow-xl active:scale-95 shadow-white/5 uppercase active:shadow-brand-primary/20">
          Asignar Auditor
        </button>
      </div>
    `,
  });
}
// --- VISTA DASHBOARD (HIGH FIDELITY) ---
export function AdminView() {
  return `
    ${Header({})}
    
    <!-- ELEMENTO DE FONDO: AMBIENCE GLOW -->
    <div class="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none opacity-40">
        <div class="absolute top-[5%] -left-1/4 w-[500px] h-[500px] bg-[#8044F0]/10 rounded-full blur-[140px]"></div>
        <div class="absolute top-[20%] -right-1/4 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px]"></div>
    </div>

    <main class="mx-auto max-w-7xl px-6 py-14" data-admin-container>
      
      <!-- CABECERA: COMAND HUB -->
      <section class="mb-14">
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
          <div class="space-y-2">
             <div class="flex items-center gap-3 mb-1 animate-in slide-in-from-left duration-500">
                <span class="w-2 h-2 rounded-full bg-[#8044F0] shadow-[0_0_10px_#8044F0] animate-pulse"></span>
                <span class="text-[10px] font-black text-[#8044F0] tracking-[0.3em] uppercase">Control Maestro Altea</span>
             </div>
             <h1 class="text-6xl font-black text-white tracking-tighter uppercase font-heading leading-[0.9]">Identidades</h1>
             <p class="text-text-secondary text-base max-w-xl font-body leading-relaxed pt-2">Visualización de alto nivel del escalafón técnico y perfiles que estructuran nuestra plataforma.</p>
          </div>

          <div class="flex items-center bg-[#161B26] p-2 rounded-2xl border border-border-default/50 animate-in slide-in-from-right duration-500">
            <span data-action="open-register-modal">
               ${Button({
                 text: "INSCRIBIR MIEMBRO",
                 variant: "primary",
                 size: "md",
                 icon: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>`,
               })}
            </span>
          </div>
        </div>

       <!-- KPI SUMMARY (VISIÓN Saas) -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-8 animate-in fade-in slide-in-from-bottom duration-700">
           <div class="p-6 bg-[#161B26]/60 backdrop-blur-xl border border-border-default/80 rounded-[10px] hover:border-[#8044F0]/40 transition-all hover:translate-y-[-4px]">
              <p class="text-[10px] font-black text-text-tertiary tracking-[0.15em] mb-3 uppercase italic">Talento Global</p>
              <div class="flex items-end gap-2">
                 <h4 id="kpi-total" class="text-3xl font-black text-white">—</h4>
              </div>
           </div>
           <div class="p-6 bg-gradient-to-br from-[#161B26] to-[#1a2131] border-l-4 border-l-[#8044F0] border-r border-t border-b border-border-default/80 rounded-[10px] shadow-lg shadow-black/20 hover:shadow-[#8044F0]/5 transition-all hover:translate-y-[-4px]">
              <p class="text-[10px] font-black text-[#8044F0] tracking-[0.15em] mb-3 uppercase italic font-bold">Roster Coders</p>
              <h4 id="kpi-coders" class="text-3xl font-black text-white">—</h4>
           </div>
           <div class="p-6 bg-[#161B26]/60 backdrop-blur-xl border border-border-default/80 rounded-[10px] hover:border-[#8044F0]/40 transition-all hover:translate-y-[-4px]">
              <p class="text-[10px] font-black text-text-tertiary tracking-[0.15em] mb-3 uppercase italic font-bold">Escuadrón TL</p>
              <h4 id="kpi-instructors" class="text-3xl font-black text-white">—</h4>
           </div>
           <div class="p-6 bg-[#161B26]/60 backdrop-blur-xl border border-border-default/80 rounded-[10px] hover:border-[#8044F0]/40 transition-all hover:translate-y-[-4px]">
              <p class="text-[10px] font-black text-text-tertiary tracking-[0.15em] mb-3 uppercase italic font-bold">Red Partners</p>
              <h4 id="kpi-recruiters" class="text-3xl font-black text-white">—</h4>
           </div>
        </div>
      </section>

          <!-- DATA SECTION (MÓDULO MAESTRO) -->
      <section class="bg-bg-secondary/30 backdrop-blur-3xl rounded-[10px] border border-border-default shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-500">
          
          <!-- TOOLBAR SUPERIOR -->
          <div class="px-10 py-10 flex flex-col xl:flex-row justify-between items-center gap-10 border-b border-border-default/40 bg-white/[0.01]">
              
             <!-- NAVEGACIÓN POR RANGOS -->
              <nav class="flex gap-2.5 p-1.5 bg-bg-primary/80 rounded-[10px] border border-border-default shadow-inner">
                  <button data-filter="all" class="filter-tab px-8 py-3.5 text-[10px] font-black rounded-[6px] bg-brand-primary text-text-primary shadow-[0_10px_20px_-5px_rgba(128,68,240,0.4)] tracking-[0.2em] transition-all hover:scale-105 active:scale-95 font-heading">
                      PANORAMA
                  </button>
                  <button data-filter="coder" class="filter-tab px-7 py-3.5 text-[10px] font-bold rounded-[6px] text-text-secondary hover:text-text-primary hover:bg-white/[0.03] transition-all tracking-[0.2em] uppercase font-heading active:scale-95">
                      Coders
                  </button>
                  <button data-filter="instructor" class="filter-tab px-7 py-3.5 text-[10px] font-bold rounded-[6px] text-text-secondary hover:text-text-primary hover:bg-white/[0.03] transition-all tracking-[0.2em] uppercase font-heading active:scale-95">
                      Instructores
                  </button>
              </nav>
              <!-- BARRA DE BÚSQUEDA -->
              <div class="relative w-full max-w-lg group">
                  <div class="absolute left-6 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-brand-primary group-focus-within:drop-shadow-[0_0_8px_rgba(128,68,240,0.5)] transition-all duration-300">
                      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                      </svg>
                  </div>
                  
                  <input 
                      id="user-search-input"
                      type="text" 
                      placeholder="Localizar registro en el Ledger..." 
                      class="w-full bg-bg-primary/40 border border-border-default rounded-[10px] py-3.5 pl-16 pr-10 text-sm font-body text-text-primary placeholder:text-text-tertiary placeholder:tracking-[0.1em] placeholder:uppercase focus:border-brand-primary/50 focus:ring-0 outline-none transition-all font-medium focus:shadow-[0_0_40px_-10px_rgba(128,68,240,0.15)] group-hover:bg-bg-primary/60"
                  >

                  <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <kbd class="px-2 py-1 rounded bg-bg-secondary border border-border-default text-[10px] font-black text-text-tertiary font-mono uppercase tracking-tighter shadow-sm">Audit-K</kbd>
                  </div>
              </div>
          </div>

          <!-- EL LISTADO SE SIGUE RENDERIZANDO DEBAJO... -->
      </section>

        <div class="overflow-x-auto">
          <table class="w-full text-left table-auto">
            <thead class="bg-[#0B0E14]/20 border-b border-border-default">
              <tr class="text-[11px] font-black text-[#8044F0] tracking-[0.25em] uppercase">
                <th class="py-6 px-10">IDENTIDAD DE RED</th>
                <th class="py-6 px-6">ESCALAFÓN / NIVEL</th>
                <th class="py-6 px-6">VALIDACIÓN / CLAN</th>
                <th class="py-6 px-10 text-right">AUDITORÍA</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-default/40">
                <!-- Se pobla dinámicamente con UserRow -->
            </tbody>
          </table>
        </div>
      </section>

      <div id="temp-password-modal-mount"></div>
    </main>

    ${renderRegisterModal()}
    ${renderAssignTlModal()}
  `;
}

// --- LÓGICA CORE Y HANDLERS (SE MANTIENE IGUAL PERO CON MEJORA UI EN ABIERTOS) ---

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove("opacity-0", "invisible");
  const modalBox = modal.querySelector(":scope > div");
  if (modalBox) {
    modalBox.classList.add("scale-100", "opacity-100");
    modalBox.classList.remove("scale-95", "opacity-0");
  }
  document.body.style.overflow = "hidden";
}

function hideModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  const modalBox = modal.querySelector(":scope > div");
  if (modalBox) {
    modalBox.classList.replace("scale-100", "scale-95");
  }
  modal.classList.add("opacity-0", "invisible");
  document.body.style.overflow = "";
}

function bindModalCloseEvents() {
  document.querySelectorAll("[data-modal-close]").forEach((el) => {
    el.addEventListener("click", () => hideModal(el.dataset.modalClose));
  });
}

function bindRegisterRoleChange() {
  const roleSelect = document.getElementById("reg-role");
  const companyField = document.getElementById("reg-company-field");

  if (roleSelect && companyField) {
    roleSelect.addEventListener("change", () => {
      const show = roleSelect.value === ROLES.RECRUITER;
      if (show) {
        companyField.classList.remove("hidden");
        // Forzamos el reflow para que se note la animación de entrada
        requestAnimationFrame(() => {
          companyField.classList.add("max-h-[200px]", "opacity-100");
          companyField.classList.remove("max-h-0", "opacity-0");
        });
      } else {
        companyField.classList.add("opacity-0");
        setTimeout(() => companyField.classList.add("hidden"), 300);
      }
    });
  }
}

async function handleRegisterUser() {
  document
    .querySelectorAll("[id$='-error']")
    .forEach((el) => el.classList.add("hidden"));

  const payload = {
    name: document.getElementById("reg-name")?.value.trim(),
    email: document.getElementById("reg-email")?.value.trim(),
    role: document.getElementById("reg-role")?.value,
    phone: document.getElementById("reg-phone")?.value.trim() || undefined,
    document:
      document.getElementById("reg-document")?.value.trim() || undefined,
    company:
      document.getElementById("reg-role")?.value === ROLES.RECRUITER
        ? document.getElementById("reg-company")?.value.trim()
        : undefined,
  };

  let valid = true;
  if (!payload.name) {
    showFieldError("reg-name-error", "La firma es obligatoria.");
    valid = false;
  }
  if (!payload.role) {
    showFieldError("reg-role-error", "El nivel de sistema es requerido.");
    valid = false;
  }
  const { valid: emailOk, errors } = validateForm({ email: payload.email });
  if (!emailOk) {
    showFieldError("reg-email-error", errors.email);
    valid = false;
  }

  if (!valid) return;

  const btn = document.getElementById("register-submit-btn");
  btn.disabled = true;
  btn.textContent = "INICIANDO PROTOCOLO...";

  try {
    const res = await userService.createUser(payload);
    lastCreatedUser = res.data;

    hideModal("modal-register");
    document.getElementById("register-form").reset();

    const mount = document.getElementById("temp-password-modal-mount");
    mount.innerHTML = renderTempPasswordModal();

    bindCopyTempPassword();
    bindModalCloseEvents();
    openModal("modal-temp-password");
    showToast("CERTIFICADO REGISTRADO CON ÉXITO.", "success");
    await loadUsers();
  } catch (error) {
    const msg = error.body?.error || "Falla en la red del ledger.";
    showToast(msg, "error");
    const errEl = document.getElementById("register-form-error");
    errEl.textContent = msg;
    errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false;
    btn.textContent = "INSCRIBIR MIEMBRO";
  }
}

let selectedCoderId = null;

function bindAssignTlDelegation() {
  const tbody = document.querySelector("tbody");
  tbody.addEventListener("click", (e) => {
    const btn = e.target.closest('[data-action="assign-tl"]');
    if (!btn) return;

    selectedCoderId = Number(btn.dataset.userId);
    const coderName = btn.dataset.userName;
    document.getElementById("assign-tl-coder-name").textContent = coderName;

    const select = document.getElementById("assign-tl-select");
    const instructors = currentUsers.filter((u) => u.roleName === "instructor");
    select.innerHTML =
      `<option value="">Seleccionar del roster de mentores...</option>` +
      instructors
        .map((i) => `<option value="${i.id}">${i.name}</option>`)
        .join("");

    document.getElementById("assign-tl-error").classList.add("hidden");
    openModal("modal-assign-tl");
  });
}

async function handleAssignTl() {
  const select = document.getElementById("assign-tl-select");
  const tlId = select.value;
  const errorEl = document.getElementById("assign-tl-error");

  if (!tlId) {
    errorEl.textContent = "La elección de mentor es obligatoria.";
    errorEl.classList.remove("hidden");
    return;
  }

  const btn = document.getElementById("assign-tl-submit-btn");
  btn.disabled = true;
  btn.textContent = "VALIDANDO...";

  try {
    await userService.assignTl(selectedCoderId, Number(tlId));
    hideModal("modal-assign-tl");
    showToast("MENTORÍA ASIGNADA.", "success");
    await loadUsers();
  } catch (error) {
    const msg = error.body?.error || "Interrupción en el flujo.";
    errorEl.textContent = msg;
    errorEl.classList.remove("hidden");
  } finally {
    btn.disabled = false;
    btn.textContent = "ASIGNAR";
  }
}

function showFieldError(id, msg) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = msg;
    el.classList.remove("hidden");
  }
}

function bindOpenRegisterModal() {
  document
    .querySelector('[data-action="open-register-modal"]')
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      openModal("modal-register");
    });
}

function bindCopyTempPassword() {
  const btn = document.getElementById("copy-temp-password-btn");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    const pass = document.getElementById("temp-password-value").textContent;
    await navigator.clipboard.writeText(pass);
    showToast("CLAVE COPIADA A PORTAPAPELES.", "success");
  });
}

function bindFilterTabs() {
  document.querySelectorAll(".filter-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      activeFilter = tab.dataset.filter;

      // Actualiza el estilo visual: cuál tab está activo
      document.querySelectorAll(".filter-tab").forEach((t) => {
        t.classList.remove(
          "bg-brand-primary",
          "text-text-primary",
          "shadow-[0_10px_20px_-5px_rgba(128,68,240,0.4)]",
        );
        t.classList.add("text-text-secondary");
      });
      tab.classList.add(
        "bg-brand-primary",
        "text-text-primary",
        "shadow-[0_10px_20px_-5px_rgba(128,68,240,0.4)]",
      );
      tab.classList.remove("text-text-secondary");

      renderFilteredTable();
    });
  });
}

function bindSearchInput() {
  const input = document.getElementById("user-search-input");
  input?.addEventListener("input", (e) => {
    searchTerm = e.target.value;
    renderFilteredTable();
  });
}

export async function mountAdminView() {
  mountHeader();
  bindOpenRegisterModal();
  bindRegisterRoleChange();
  bindModalCloseEvents();

  document
    .getElementById("register-submit-btn")
    ?.addEventListener("click", handleRegisterUser);
  await loadUsers();
  bindAssignTlDelegation();
  document
    .getElementById("assign-tl-submit-btn")
    ?.addEventListener("click", handleAssignTl);

  bindFilterTabs();
  bindSearchInput();
}

async function loadUsers() {
  try {
    const res = await userService.getUsers();
    currentUsers = res.data.users;
    updateKpis(currentUsers);
    renderFilteredTable();
  } catch (error) {
    showToast("No se pudo cargar el listado de usuarios", "error");
  }
}

function renderFilteredTable() {
  let filtered = currentUsers;

  if (activeFilter !== "all") {
    filtered = filtered.filter((u) => u.roleName === activeFilter);
  }

  if (searchTerm.trim() !== "") {
    const term = searchTerm.trim().toLowerCase();
    filtered = filtered.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term),
    );
  }

  const tbody = document.querySelector("tbody");
  tbody.innerHTML = filtered.length
    ? filtered.map((user) => UserRow(user)).join("")
    : `<tr><td colspan="4" class="py-10 text-center text-text-tertiary text-sm">Sin resultados</td></tr>`;
}

// NUEVO: calcula los totales por rol y los pinta en las tarjetas KPI
function updateKpis(users) {
  const total = users.length;
  const coders = users.filter((u) => u.roleName === "coder").length;
  const instructors = users.filter((u) => u.roleName === "instructor").length;
  const recruiters = users.filter((u) => u.roleName === "recruiter").length;

  document.getElementById("kpi-total").textContent = total;
  document.getElementById("kpi-coders").textContent = coders;
  document.getElementById("kpi-instructors").textContent = instructors;
  document.getElementById("kpi-recruiters").textContent = recruiters;
}
