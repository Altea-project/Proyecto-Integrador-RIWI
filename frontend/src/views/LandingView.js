// import components
import { Badge } from "../components/Badge.js";
import { Button } from "../components/Button.js";

// icon imports
import iconBolt from "../../assets/icon/iconBolt.svg";
import iconNet from "../../assets/icon/iconNet.svg";
import iconUpload from "../../assets/icon/iconUpload.svg";
import iconCommunity from "../../assets/icon/iconCommunity.svg";
import iconEmploy from "../../assets/icon/iconEmploy.svg";
import rightArrow from "../../assets/icon/rightArrow.svg";
import Gmail from "../../assets/icon/Gmail.svg";
import LinkedIn from "../../assets/icon/LinkedIn.svg";

// logo imports
import horizontalLogoNegative from "../../assets/logos/horizontalLogoNegative.svg";

const RECRUITER_EMAIL = "talento@altea.io";
const mailtoBody = encodeURIComponent(
  `Solicitud Acceso Reclutador - Altea\n\nNombre: \nEmpresa: \nContacto: \n\nDeseo acceder al Ledger.`,
);
const recruiterAction = `href="mailto:${RECRUITER_EMAIL}?subject=Acceso%20B2B%20Altea&body=${mailtoBody}"`;

const steps = [
  {
    number: "01",
    icon: iconUpload,
    title: "Carga de Evidencia",
    desc: "El Coder vincula proyectos con documentación y repositorios reales.",
  },
  {
    number: "02",
    icon: iconCommunity,
    title: "Auditoría de Mentor",
    desc: "El TL certifica la arquitectura y lógica asignando un Score oficial.",
  },
  {
    number: "03",
    icon: iconEmploy,
    title: "Conexión de Valor",
    desc: "Empresas filtran perfiles ya auditados para una contratación ágil.",
  },
];

const testimonials = [
  {
    initials: "DV",
    name: "Daniela Vargas",
    role: "Frontend Dev · RIWI",
    quote:
      "En una sola URL, las empresas vieron mi código ya auditado. Es impresionante.",
  },
  {
    initials: "MW",
    name: "Marcus Webb",
    role: "Sr. Recruiter · Stripe",
    quote:
      "Dejamos de leer PDFs para mirar Altea. La calidad está garantizada por expertos.",
  },
  {
    initials: "SC",
    name: "Sofía Chen",
    role: "Software Lead · Uber",
    quote:
      "La sinergia entre clanes es oro puro. Es una red social con esteroides técnicos.",
  },
];

function renderHeader() {
  return `
    <header class="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0B0E14]/70 backdrop-blur-lg">
      <div class="mx-auto flex h-14 sm:h-16 max-w-[1400px] items-center justify-between px-6 xl:px-10">
        <a href="/" class="flex-shrink-0" data-nav>
          <img src="${horizontalLogoNegative}" alt="Altea" class="h-10 sm:h-10 w-auto" />
        </a>
        <div class="flex items-center gap-6">
          <a href="/login" class="text-[10px] font-bold text-text-secondary hover:text-white transition-all tracking-widest uppercase hidden sm:block">Login</a>
          <a ${recruiterAction} class="px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg bg-white text-bg-primary text-[10px] font-black tracking-widest hover:bg-[#8044F0] hover:text-white transition-all uppercase shadow-lg shadow-white/5 active:scale-95">
            Empresas
          </a>
        </div>
      </div>
    </header>
  `;
}

function renderHero() {
  return `
    <section class="relative px-6 py-20 sm:py-28 lg:py-32 xl:py-40 text-center overflow-hidden">
      <!-- Glow Adaptativo -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[250px] sm:h-[400px] bg-[#8044F0]/10 rounded-full blur-[120px] pointer-events-none opacity-70"></div>

      <div class="relative z-10 mx-auto flex max-w-[1200px] flex-col items-center">
        <div class="mb-5">
           <span class="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#161B26]/80 border border-white/5 text-[9px] font-black text-brand-primary tracking-[0.25em] uppercase italic">
            <span class="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></span> Sistema de Validación Técnica
           </span>
        </div>

        <h1 class="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-8xl font-black leading-[1.1] text-white tracking-tighter uppercase mb-6 drop-shadow-sm">
          Conocimiento <br class="hidden sm:block" /> <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-[#9A6AF5] to-indigo-400 italic">Certificado.</span>
        </h1>

        <p class="max-w-xl text-xs sm:text-sm lg:text-base text-text-secondary font-medium leading-relaxed mb-10 opacity-70 font-body px-2 sm:px-0">
          La primera infraestructura donde el talento no se presume: se demuestra ante líderes senior para crear una identidad profesional verificable.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 w-full max-w-[280px] sm:max-w-none justify-center">
          <a ${recruiterAction} class="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-brand-primary text-white text-[10px] font-black rounded-xl hover:bg-brand-hover hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-primary/15 tracking-[0.1em] uppercase group">
            Soy Reclutador 
            <img src="${rightArrow}" class="h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </a>
          <button class="px-8 py-3.5 bg-white/5 border border-border-default backdrop-blur-sm text-text-primary text-[10px] font-black rounded-xl hover:bg-white/10 hover:border-brand-primary/30 transition-all tracking-[0.1em] uppercase">
             Directorio de Talento
          </button>
        </div>

              <div class="mt-16 sm:mt-24 flex flex-wrap justify-center gap-6 sm:gap-12 opacity-30 filter grayscale hover:opacity-50 transition-opacity duration-700">
          <span class="font-black text-[10px] sm:text-[12px] tracking-[0.4em] uppercase italic cursor-default">
              AUDIT PROTOCOL v.1
          </span>
          <span class="font-black text-[10px] sm:text-[12px] tracking-[0.4em] uppercase italic cursor-default text-brand-primary opacity-80">
              RIWI BARRANQUILLA
          </span>
          <span class="font-black text-[10px] sm:text-[12px] tracking-[0.4em] uppercase italic cursor-default">
              Saas INFRASTRUCTURE
          </span>
          <span class="font-black text-[10px] sm:text-[12px] tracking-[0.4em] uppercase italic cursor-default">
              TECHNICAL LEDGER
          </span>
        </div>
      </div>
    </section>
  `;
}

function renderFeatures() {
  return `
    <section class="bg-bg-primary border-y border-white/5 px-6 py-24 sm:py-32">
      <div class="mx-auto max-w-[1200px]">
        <div class="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">
            <div class="text-left space-y-5 animate-in slide-in-from-left duration-1000 px-2 sm:px-0">
               <div class="flex items-center gap-2 font-black text-[8px] sm:text-[9px] text-brand-primary uppercase tracking-[0.4em]">
                  <div class="h-px w-6 sm:w-10 bg-brand-primary/40"></div>
                  Metodología Altea
               </div>
               <h2 class="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-none uppercase italic italic">Fábrica de <span class="text-brand-primary opacity-90 underline decoration-white/10 underline-offset-8">Garantía.</span></h2>
               <p class="text-xs sm:text-sm lg:text-base text-text-secondary font-medium leading-relaxed max-w-md font-body opacity-60 italic italic">
                  Transformamos proyectos de formación en evidencia de grado profesional lista para contrataciones críticas.
               </p>
            </div>
            
            <div class="grid gap-4 sm:gap-6">
                ${steps
                  .map(
                    (step) => `
                    <div class="p-6 sm:p-7 rounded-[28px] bg-bg-secondary/40 border border-white/[0.04] hover:border-brand-primary/30 transition-all duration-500 flex items-center sm:items-start gap-6 group hover:bg-[#161B26]/80">
                        <div class="w-10 h-10 sm:w-16 sm:h-16 flex-shrink-0 flex items-center justify-center rounded-xl bg-[#0B0E14] border border-white/10 text-brand-primary shadow-lg shadow-black/20 group-hover:scale-105 transition-transform duration-300">
                           <img src="${step.icon}" class="w-14 h-14 sm:w-16 sm:h-16 opacity-80" />
                        </div>
                        <div class="space-y-1">
                            <h3 class="text-[10px] sm:text-[11px] font-black text-text-primary uppercase tracking-widest transition-colors">${step.title}</h3>
                            <p class="text-[11px] sm:text-[12px] text-text-secondary leading-relaxed max-w-[280px] font-medium opacity-60">${step.desc}</p>
                        </div>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        </div>
      </div>
    </section>
  `;
}

function renderTestimonials() {
  return `
    <section class="bg-gradient-to-b from-[#161B26]/10 to-transparent px-6 py-24 sm:py-32">
      <div class="mx-auto max-w-[1200px]">
        <div class="text-center lg:text-left mb-14 px-2">
            <h2 class="text-4xl sm:text-5xl font-black text-white tracking-tight uppercase leading-none italic mb-4 italic italic">Confianza. <span class="text-brand-primary">Casos de éxito.</span></h2>
            <div class="w-10 h-1 bg-brand-primary rounded-full mx-auto lg:mx-0 opacity-40"></div>
        </div>

        <div class="grid lg:grid-cols-3 gap-6">
           ${testimonials
             .map(
               (t) => `
               <div class="p-8 sm:p-9 rounded-[35px] bg-[#161B26]/20 border border-white/[0.05] relative group hover:bg-[#1F2430]/30 transition-all hover:translate-y-[-2px]">
                  <p class="text-[13px] sm:text-sm text-text-primary leading-relaxed italic font-medium opacity-80 relative z-10 font-body mb-10">"${t.quote}"</p>
                  <div class="flex items-center gap-4 border-t border-white/5 pt-7 relative z-10">
                     <div class="w-9 h-9 rounded-full bg-gradient-to-br from-brand-primary to-indigo-600 flex items-center justify-center font-black text-[9px] text-white shadow-xl shadow-brand-primary/10">${t.initials}</div>
                     <div class="flex flex-col">
                        <span class="text-[11px] font-black text-white tracking-tight uppercase font-heading group-hover:text-brand-primary transition-colors">${t.name}</span>
                        <span class="text-[8px] font-black text-brand-primary tracking-widest italic opacity-60 uppercase">${t.role}</span>
                     </div>
                  </div>
                  <div class="absolute top-6 right-8 text-[32px] font-black text-brand-primary opacity-5 italic select-none">”</div>
               </div>
           `,
             )
             .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderFinalCTA() {
  return `
    <section class="px-6 py-24 sm:py-40">
      <div class="mx-auto max-w-[1100px] rounded-[45px] bg-[#161B26] border border-white/[0.04] p-10 lg:p-20 relative overflow-hidden shadow-2xl shadow-black/40">
          <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>
          
          <div class="relative z-10 text-center space-y-6 sm:space-y-8">
            <h2 class="text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter leading-tight italic">Acceso Privado a la <span class="text-brand-primary underline decoration-brand-primary/10 underline-offset-[12px]">Elite Técnica.</span></h2>
            <p class="text-xs sm:text-base text-text-secondary font-medium max-w-md mx-auto opacity-70 italic font-body">
                Reclutadores filtran talento auditado bajo estándares industriales en Barranquilla y para el mundo.
            </p>
            <div class="flex flex-col sm:flex-row gap-5 justify-center items-center pt-4">
              <a ${recruiterAction} class="inline-flex px-10 py-4 bg-brand-primary text-white text-[10px] font-black rounded-xl tracking-widest uppercase hover:bg-brand-hover hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-primary/20 italic">
                Solicitar Conexión
              </a>
            </div>
          </div>
      </div>
    </section>
  `;
}

function renderFooter() {
  return `
    <footer class="bg-bg-primary px-6 py-14 border-t border-white/5 font-body">
      <div class="mx-auto max-w-[1200px]">
        <div class="flex flex-col md:flex-row justify-between items-start gap-12 pb-16 px-4">
            <div class="space-y-4">
                <img src="${horizontalLogoNegative}" alt="Altea" class="h-6 sm:h-7 opacity-30 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-700" />
                <p class="text-[10px] font-bold text-text-tertiary tracking-[0.2em] max-w-[240px] uppercase leading-tight italic">Vinculación de talento por RIWI Academy.</p>
            </div>
            
            <div class="grid grid-cols-2 gap-12 sm:gap-20 text-[9px] font-black tracking-[0.25em] text-text-tertiary uppercase">
                <div class="flex flex-col gap-5">
                    <span class="text-white opacity-20 italic">Ledger</span>
                    <a href="#" class="hover:text-brand-primary transition-all">Auditados</a>
                    <a href="#" class="hover:text-brand-primary transition-all">Clanes IT</a>
                </div>
                <div class="flex flex-col gap-5">
                    <span class="text-white opacity-20 italic">Oficial</span>
                    <a href="#" class="hover:text-brand-primary transition-all">Protocolo</a>
                    <a href="#" class="hover:text-brand-primary transition-all">Seguridad</a>
                </div>
            </div>
        </div>

        <div class="pt-10 flex flex-col md:flex-row justify-between items-center border-t border-white/[0.03] text-[8px] font-black text-text-tertiary tracking-[0.35em] uppercase italic opacity-40">
            <span>© ${new Date().getFullYear()} ALTEA · EL PRÓXIMO ESCALAFÓN TÉCNICO</span>
            <div class="flex gap-6 mt-5 sm:mt-0 grayscale">
                  <a href="#"><img src="${LinkedIn}" class="w-3.5 h-3.5"/></a>
                  <a href="#"><img src="${Gmail}" class="w-3.5 h-3.5"/></a>
            </div>
        </div>
      </div>
    </footer>
  `;
}

export function LandingView() {
  return `
    <div class="bg-bg-primary text-white selection:bg-brand-primary/50 font-body antialiased overflow-x-hidden min-h-screen">
      ${renderHeader()}
      <main class="animate-in fade-in zoom-in-95 duration-700 ease-out">
        ${renderHero()}
        ${renderFeatures()}
        ${renderTestimonials()}
        ${renderFinalCTA()}
      </main>
      ${renderFooter()}
    </div>
  `;
}
