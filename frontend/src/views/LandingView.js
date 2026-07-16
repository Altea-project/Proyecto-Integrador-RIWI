// import components
import { Badge } from "../components/Badge.js";
import { Button } from "../components/Button.js";
import { StatItem } from "../components/StatItem.js";
import { StepCard } from "../components/StepCard.js";
import { TestimonialCard } from "../components/TestimonialCard.js";

// icon imports
import iconBolt from "../../assets/icon/iconBolt.svg";
import iconNet from "../../assets/icon/iconNet.svg";
import iconUpload from "../../assets/icon/iconUpload.svg";
import iconCommunity from "../../assets/icon/iconCommunity.svg";
import iconEmploy from "../../assets/icon/iconEmploy.svg";
import rightArrow from "../../assets/icon/rightArrow.svg";
import Gmail from "../../assets/icon/Gmail.svg";
import LinkedIn from "../../assets/icon/LinkedIn.svg";
import Instagram from "../../assets/icon/Instagram.svg";

// logo imports
import horizontalLogoNegative from "../../assets/logos/horizontalLogoNegative.svg";

// --- CONFIGURACIÓN DE ACCESO PROFESIONAL (MAILTO) ---
const RECRUITER_EMAIL = "vinculacion@riwi.io";
const mailtoBody = encodeURIComponent(`Hola equipo Altea/RIWI,

Me interesa solicitar acceso profesional como reclutador para contratar talento verificado.

Mis datos de contacto:
- Nombre completo: 
- Teléfono: 
- Nombre de la Empresa: 
- Correo corporativo: 

Quedo atento a sus instrucciones.`);

const recruiterAction = `href="mailto:${RECRUITER_EMAIL}?subject=Solicitud%20Acceso%20Empresarial%20-%20Altea&body=${mailtoBody}"`;

const steps = [
  {
    number: "01",
    icon: `<div class="p-3 bg-[#8044F0]/20 rounded-xl"><img src="${iconUpload}" alt="" class="h-16 w-16" /></div>`,
    title: "Documentación de Evidencia",
    description:
      "Sube proyectos con descripción técnica, repositorios y demos reales. Empieza a construir un historial innegable.",
    checklist: [
      "Registro de repo y demo",
      "Tags técnicos reales",
      "Identidad verificada",
    ],
  },
  {
    number: "02",
    icon: `<div class="p-3 bg-[#8044F0]/20 rounded-xl"><img src="${iconCommunity}" alt="" class="h-16 w-16" /></div>`,
    title: "Auditoría por Expertos",
    description:
      "Tu Team Leader certifica tu código con notas, estrellas de distinción y feedback profesional directo.",
    checklist: [
      "Veredicto de mentor senior",
      "Cálculo de Score real",
      "Certificación por código",
    ],
  },
  {
    number: "03",
    icon: `<div class="p-3 bg-[#8044F0]/20 rounded-xl"><img src="${iconEmploy}" alt="" class="h-16 w-16" /></div>`,
    title: "Sinergia de Contratación",
    description:
      "Empresas buscan por habilidades exactas. Cuando conectan con tu talento, el flujo de acceso se agiliza.",
    checklist: [
      "Visibilidad estratégica",
      "Métricas de Pipeline",
      "Conexión B2B segura",
    ],
  },
];

const testimonials = [
  {
    quote:
      "Gracias al sistema de auditoría de Altea, demostré mi seniority antes de la entrevista técnica. Pasé de aprendiz a backend en tiempo récord.",
    initials: "DV",
    name: "Daniela Vargas",
    role: "Desarrolladora Full-Stack · RIWI",
    userType: "CODER",
  },
  {
    quote:
      "Filtramos talentos por métricas auditadas, no por lo que dice su CV. El sello Altea reduce nuestro riesgo de contratación un 40%.",
    initials: "MW",
    name: "Marcus Webb",
    role: "Sr. Recruiter · Stripe",
    userType: "EMPRESA",
  },
  {
    quote:
      "Ver el código real de otros clanes y recibir feedback de líderes técnicos comprimió mi curva de aprendizaje de forma exponencial.",
    initials: "SC",
    name: "Sofía Chen",
    role: "Frontend Dev · Mentor Cohorte",
    userType: "CODER",
  },
];

function renderHeader() {
  return `
    <header class="sticky top-0 z-50 w-full border-b border-[#1F2430]/60 bg-[#0B0E14]/80 backdrop-blur-xl">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="/" class="flex-shrink-0 transition-transform active:scale-95" data-nav>
          <img src="${horizontalLogoNegative}" alt="Altea" class="h-10 sm:h-10 w-auto" />
        </a>
        <div class="flex items-center gap-6">
          <a href="/login" class="text-[10px] font-bold text-[#9CA3AF] hover:text-[#FFFFFF] transition-colors tracking-widest uppercase">Identificarse</a>
          <a ${recruiterAction} class="hidden sm:inline-flex px-5 py-2 rounded-lg bg-[#8044F0] text-white text-[10px] font-black tracking-widest hover:bg-[#9A6AF5] transition-all uppercase shadow-lg shadow-[#8044F0]/20">
            SOLICITAR ACCESO
          </a>
        </div>
      </div>
    </header>
  `;
}

function renderHero() {
  return `
    <section class="relative px-6 py-24 sm:py-32 lg:py-40 text-center overflow-hidden">
      <!-- Decoración Aura -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[500px] bg-[#8044F0]/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div class="relative z-10 mx-auto flex max-w-5xl flex-col items-center">
        <div class="animate-in fade-in zoom-in duration-700">
           ${Badge({ text: "Sello de Garantía Técnica: Conocimiento Verificado", variant: "primary", icon: `<img src="${iconBolt}" class="h-3 w-3"/>` })}
        </div>

        <h1 class="mt-8 font-heading text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.05] text-white tracking-tighter uppercase mb-6">
          Cualquiera tiene código. <br/> <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#8044F0] to-[#4F46E5]">Tú tienes Altea.</span>
        </h1>

        <p class="max-w-2xl text-sm sm:text-lg text-[#9CA3AF] font-medium leading-relaxed mb-10 opacity-90 px-4">
          La infraestructura de auditoría profesional donde tu conocimiento académico se convierte en un activo de empleo verificado y certificado por expertos.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a ${recruiterAction} class="flex items-center gap-3 px-8 py-3.5 bg-text-primary text-bg-primary text-[11px] font-black rounded-xl hover:scale-105 transition-all shadow-xl active:scale-95 uppercase tracking-widest">
            Soy Reclutador 
            <img src="${rightArrow}" alt="" class="h-3 w-3" />
          </a>
          <button class="px-8 py-3.5 bg-white/[0.03] border border-[#1F2430] text-[#FFFFFF] text-[11px] font-black rounded-xl hover:bg-white/[0.07] transition-all tracking-widest uppercase">
             Ver Ledger de Proyectos
          </button>
        </div>

        <div class="mt-20 flex flex-wrap items-center justify-center gap-6 sm:gap-12 opacity-30">
          <span class="font-black text-[10px] tracking-widest italic grayscale hover:grayscale-0 transition-all cursor-default uppercase">Github</span>
          <span class="font-black text-[10px] tracking-widest italic grayscale hover:grayscale-0 transition-all cursor-default uppercase">Riwi.io</span>
          <span class="font-black text-[10px] tracking-widest italic grayscale hover:grayscale-0 transition-all cursor-default uppercase">Aws Cloud</span>
          <span class="font-black text-[10px] tracking-widest italic grayscale hover:grayscale-0 transition-all cursor-default uppercase">Postgresql</span>
        </div>
      </div>
    </section>
  `;
}

function renderHowItWorks() {
  return `
    <section class="bg-[#161B26]/30 border-y border-[#1F2430] px-6 py-28 backdrop-blur-3xl">
      <div class="mx-auto max-w-7xl">
        <div class="text-center mb-16 space-y-3">
           <p class="text-[10px] font-black text-[#8044F0] uppercase tracking-[0.4em] italic">Infraestructura</p>
           <h2 class="font-heading text-4xl sm:text-5xl font-black text-white tracking-tighter uppercase italic">De Aula al <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#8044F0] to-[#FFFFFF]">Mercado.</span></h2>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
            ${steps
              .map(
                (step) => `
                <div class="flex flex-col p-8 rounded-3xl bg-[#161B26]/40 border border-[#1F2430] hover:border-[#8044F0]/30 transition-all duration-500 group">
                    <span class="text-4xl font-black text-[#8044F0]/10 mb-4 group-hover:text-[#8044F0]/30 transition-colors">${step.number}</span>
                    ${step.icon}
                    <h3 class="mt-6 text-sm font-black text-white uppercase tracking-widest">${step.title}</h3>
                    <p class="mt-4 text-[13px] text-[#9CA3AF] font-medium leading-relaxed">${step.description}</p>
                    <ul class="mt-6 space-y-2">
                        ${step.checklist.map((item) => `<li class="flex items-center gap-2 text-[10px] font-bold text-[#8044F0]/80"><div class="w-1 h-1 rounded-full bg-[#8044F0]"></div> ${item}</li>`).join("")}
                    </ul>
                </div>
            `,
              )
              .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderTestimonials() {
  return `
    <section class="px-6 py-28 relative">
       <div class="mx-auto max-w-7xl">
         <div class="mb-20 text-center lg:text-left flex flex-col lg:flex-row items-end justify-between gap-6">
            <h2 class="text-4xl sm:text-5xl font-black text-white tracking-tighter uppercase leading-[0.9]">Confianza <br/> <span class="text-[#8044F0]">Certificada.</span></h2>
            <p class="text-[#9CA3AF] text-sm max-w-xs font-medium italic opacity-70">Impacto real en desarrolladores y empresas globales.</p>
         </div>
         <div class="grid md:grid-cols-3 gap-6 animate-in slide-in-from-bottom duration-1000">
             ${testimonials
               .map(
                 (t) => `
                <div class="p-8 rounded-[32px] bg-[#161B26]/20 border border-[#1F2430] hover:bg-white/[0.01] transition-all">
                    <p class="text-sm text-[#FFFFFF] leading-relaxed mb-8 italic opacity-90 font-medium">"${t.quote}"</p>
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-[#8044F0] flex items-center justify-center font-black text-[10px] text-white border-2 border-white/5 shadow-lg shadow-[#8044F0]/10">${t.initials}</div>
                        <div>
                            <p class="text-xs font-black text-white uppercase tracking-tight">${t.name}</p>
                            <p class="text-[9px] font-bold text-[#8044F0] uppercase tracking-widest">${t.role}</p>
                        </div>
                    </div>
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
    <section class="px-6 py-20 pb-32">
       <div class="mx-auto max-w-4xl rounded-[40px] bg-gradient-to-br from-[#1F2430] to-[#0B0E14] border-2 border-white/5 p-12 lg:p-24 text-center relative overflow-hidden shadow-2xl">
            <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-[#8044F0]/5 rounded-full blur-[100px]"></div>
            
            <h2 class="text-4xl lg:text-6xl font-black text-white uppercase tracking-tighter mb-8 leading-none italic italic">La Identidad IT<br/> <span class="text-[#8044F0]">del Futuro.</span></h2>
            <p class="text-[#9CA3AF] text-base mb-12 max-w-xl mx-auto italic opacity-70">Los reclutadores de primer nivel ya están en el Ledger de Altea. ¿Listo para elevar el perfil de tu empresa?</p>
            
            <div class="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <a ${recruiterAction} class="inline-flex px-12 py-4 bg-[#8044F0] text-white text-[11px] font-black rounded-xl tracking-widest uppercase hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#8044F0]/10">
                 CONECTAR EMPRESA
              </a>
              <a href="/login" class="text-[10px] font-black text-[#9CA3AF] hover:text-white transition-colors tracking-widest uppercase italic border-b-2 border-transparent hover:border-[#8044F0]">Solo acceso certificado →</a>
            </div>
       </div>
    </section>
  `;
}

function renderFooter() {
  return `
    <footer class="bg-bg-primary px-6 py-20 border-t border-[#1F2430]">
      <div class="mx-auto max-w-7xl">
        <div class="flex flex-col lg:flex-row justify-between items-center gap-12 border-b border-[#1F2430] pb-20">
            <div class="space-y-4 max-w-sm text-center lg:text-left">
                <img src="${horizontalLogoNegative}" alt="Altea" class="h-12 grayscale brightness-200 mx-auto lg:mx-0" />
                <p class="text-[11px] font-semibold text-[#6B7280] tracking-tight">Forjando la transparencia técnica. Ecosistema de validación diseñado en Barranquilla, Co. para el escalafón global.</p>
            </div>
            <div class="flex items-center gap-8">
                <div class="flex gap-4">
                  <a href="#" class="p-2 bg-white/5 rounded-lg hover:bg-[#8044F0]/20 transition-all opacity-60 hover:opacity-100">
                    <img src="${LinkedIn}" alt="" class="h-4 w-4 grayscale" />
                  </a>
                  <a href="#" class="p-2 bg-white/5 rounded-lg hover:bg-[#8044F0]/20 transition-all opacity-60 hover:opacity-100">
                    <img src="${Gmail}" alt="" class="h-4 w-4 grayscale" />
                  </a>
                </div>
            </div>
        </div>
        <div class="pt-10 flex flex-col md:flex-row justify-between items-center text-[9px] font-black text-[#6B7280] tracking-[0.2em] uppercase">
            <span>© ${new Date().getFullYear()} ALTEA · VINCULACIÓN ACADÉMICA RIWI</span>
            <div class="flex gap-8 mt-6 md:mt-0">
               <a href="#" class="hover:text-[#8044F0] transition-colors underline-offset-4 underline italic">Terminos Legales</a>
               <a href="#" class="hover:text-[#8044F0] transition-colors underline-offset-4 underline italic">Protocolos</a>
            </div>
        </div>
      </div>
    </footer>
  `;
}

export function LandingView() {
  return `
    <div class="bg-[#0B0E14] text-white selection:bg-[#8044F0]/40 overflow-hidden font-body antialiased">
      ${renderHeader()}
      <main class="animate-in fade-in duration-700">
        ${renderHero()}
        ${renderHowItWorks()}
        ${renderTestimonials()}
        ${renderFinalCTA()}
      </main>
      ${renderFooter()}
    </div>
  `;
}
