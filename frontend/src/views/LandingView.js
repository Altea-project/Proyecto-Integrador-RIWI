// import components
import { Badge } from "../components/Badge.js";
import { Button } from "../components/Button.js";
import { StatItem } from "../components/StatItem.js";
import { StepCard } from "../components/StepCard.js";
import { TestimonialCard } from "../components/TestimonialCard.js";
// icon imports
import iconBolt from "../../assets/icon/iconBolt.svg";
import iconNet from "../../assets/icon/iconNet.svg";
import iconCommunity from "../../assets/icon/iconCommunity.svg";
import iconEmploy from "../../assets/icon/iconEmploy.svg";
import iconCheck from "../../assets/icon/iconCheck.svg";
import rightArrow from "../../assets/icon/rightArrow.svg";
import iconUpload from "../../assets/icon/iconUpload.svg";
import Gmail from "../../assets/icon/Gmail.svg";
import LinkedIn from "../../assets/icon/LinkedIn.svg";
import Instagram from "../../assets/icon/Instagram.svg";
// logo imports
import horizontalLogoNegative from "../../assets/logos/horizontalLogoNegative.svg";

const steps = [
  {
    number: "01",
    icon: `<img src="${iconUpload}" alt="" class="h-14 w-14" />`,
    title: "Publica Tu Proyecto",
    description:
      "Sube tu proyecto: nombre, descripción, enlace al repositorio, demo y las habilidades técnicas que aplicaste. Así vas armando tu portafolio verificable dentro de Altea.",
    checklist: [
      "Registro de proyecto con repo y demo",
      "Habilidades técnicas asociadas",
      "Portafolio visible en tu perfil",
    ],
  },
  {
    number: "02",
    icon: `<img src="${iconCommunity}" alt="" class="h-14 w-14" />`,
    title: "Calificado por tu Team Leader",
    description:
      "Tu Team Leader revisa tu proyecto y te asigna una calificación con estrellas, una nota y comentarios técnicos. Esa evaluación queda como respaldo verificado de tu nivel real.",
    checklist: [
      "Calificación por estrellas",
      "Nota y comentario del TL",
      "Evaluación verificada, no autoevaluada",
    ],
  },
  {
    number: "03",
    icon: `<img src="${iconEmploy}" alt="" class="h-14 w-14" />`,
    title: "Te Encuentran los Reclutadores",
    description:
      "Los reclutadores buscan y filtran coders por habilidades y disponibilidad. Cuando muestran interés en tu perfil, tu Team Leader recibe la notificación y gestiona el siguiente paso contigo.",
    checklist: [
      "Búsqueda por habilidades verificadas",
      "Notificación automática a tu TL",
      "Seguimiento del estado",
    ],
  },
];

const testimonials = [
  {
    quote:
      "Antes de Altea, mi GitHub era solo ruido. Ahora los reclutadores me escriben cada semana — y ya conocen mi stack antes de la primera llamada. Conseguí mi oferta en una empresa Serie B en menos de tres semanas.",
    initials: "DV",
    name: "Daniela Vargas",
    role: "Desarrolladora Full-Stack · RIWI Cohorte '24",
    userType: "DESARROLLADOR",
    rating: 4,
  },
  {
    quote:
      "Reemplazamos todo nuestro proceso de pruebas técnicas con perfiles de Altea. Los badges revisados por pares nos dan una señal 10 veces más predictiva que cualquier currículum.",
    initials: "MW",
    name: "Marcus Webb",
    role: "Reclutador Senior de Ingeniería · Stripe",
    userType: "RECLUTADOR",
  },
  {
    quote:
      "Soy autodidacta sin título universitario. El sistema de reputación me permitió demostrar mis habilidades de forma objetiva. Recibí tres ofertas competidoras y elegí la del mejor equipo de ingeniería.",
    initials: "PN",
    name: "Priya Nair",
    role: "Ingeniera Backend · Freelancer → Contratada",
    userType: "DESARROLLADOR",
  },
  {
    quote:
      "El gráfico de habilidades verificadas reduce nuestro tiempo de selección en un 60%. Vemos exactamente qué lenguajes, frameworks y patrones domina un desarrollador — no lo que dice dominar.",
    initials: "JO",
    name: "James Okonkwo",
    role: "Director de Adquisición de Talento · Vercel",
    userType: "RECLUTADOR",
  },
  {
    quote:
      "El proceso de revisión de pares es riguroso pero justo. Recibir feedback de ingenieros senior al inicio de mi carrera comprimió en meses lo que habría tardado años en aprender.",
    initials: "SC",
    name: "Sofía Chen",
    role: "Desarrolladora React · Bootcamp → Rol Senior",
    userType: "DESARROLLADOR",
  },
  {
    quote:
      "Contratamos a cuatro ingenieros de Altea el trimestre pasado. Los cuatro superan el rendimiento de contrataciones por canales tradicionales. La calidad de la señal aquí es simplemente mejor.",
    initials: "LH",
    name: "Liam Hartley",
    role: "VP de Ingeniería · Linear",
    userType: "RECLUTADOR",
  },
];

const brandLogos = ["RIWI", "GitHub", "AWS", "Vercel"];

const footerColumns = [
  {
    title: "PRODUCTO",
    links: ["Cómo Funciona", "Galería de Proyectos", "Para Reclutadores"],
  },
  {
    title: "COMUNIDAD",
    links: ["Sobre RIWI", "Coders Verificados"],
  },
  {
    title: "EMPRESA",
    links: ["Contacto", "Política de Privacidad", "Términos de Uso"],
  },
];

function renderHeader() {
  return `
     <header class="sticky top-0 z-20 border-b border-border-default/60 bg-bg-primary/80 backdrop-blur">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
       <a href="#" class="flex items-center gap-2 font-heading text-lg font-semibold text-text-primary">
        <img src="${horizontalLogoNegative}" alt="horizontal Logo Negative" class="h-10 w-auto sm:h-12" />
      </a>
        <div class="flex items-center gap-3">
          <a href="#" class="font-body text-sm font-medium text-text-secondary hover:text-text-primary">Log In</a>
          ${Button({ text: "Join Now", variant: "primary", extraClasses: "px-3 py-1 text-xs sm:px-6 sm:py-2 sm:text-sm" })}
        </div>
      </div>
    </header>
  `;
}
function renderHero() {
  return `
    <section class="relative overflow-hidden bg-starfield px-6 pb-24 pt-20 text-center">
      <div class="mx-auto flex max-w-3xl flex-col items-center">
        <div class="w-full max-w-[92%] sm:max-w-none sm:w-auto [&>span]:flex-wrap [&>span]:justify-center [&>span]:text-center [&>span]:gap-x-2 [&>span]:gap-y-1 [&>span]:max-w-full">
  ${Badge({ text: "Beta Pública — 300+ desarrolladores ya dentro", icon: `<img src="${iconBolt}" alt="" class="h-3 w-3" />` })}
</div>

        <h1 class="mt-6 font-heading text-4xl font-bold leading-tight text-text-primary sm:text-5xl">
          Tu código, <span class="text-gradient-primary">verificado.</span><br />
          Tu carrera, acelerada.
        </h1>

        <p class="mt-6 max-w-xl text-base leading-relaxed text-text-secondary font-body">
          Altea es el registro oficial de talento técnico donde el código real se convierte en oportunidades reales.
        </p>

        <div class="mt-8 flex flex-col items-center gap-4 sm:flex-row">
          ${Button({ text: "Empieza como Coder", variant: "primary", icon: `<img src="${iconNet}" alt="" class="h-4 w-4" />`, iconPosition: "left", extraClasses: "w-full justify-center text-xs sm:w-auto sm:text-sm" })}
          ${Button({ text: "Soy Reclutador", variant: "secondary", icon: `<img src="${rightArrow}" alt="" class="h-4 w-4" />`, iconPosition: "right", extraClasses: "w-full justify-center text-xs sm:w-auto sm:text-sm" })}
        </div>

        <div class="mt-10 flex flex-wrap items-center justify-center gap-3">
          ${StatItem({ value: "300+", label: "Coders" })}
          ${StatItem({ value: "10+", label: "Companies" })}
          ${StatItem({ value: "100%", label: "Verified by Team Leaders" })}
        </div>
      </div>
    </section>
  `;
}

function renderLogoCloud() {
  const logos = brandLogos
    .map(
      (logo) => `
        <span class="font-heading text-lg font-semibold text-text-tertiary">${logo}</span>
      `,
    )
    .join("");

  return `
    <section class="border-y border-border-default/60 px-6 py-14">
      <div class="mx-auto max-w-5xl text-center">
        <p class="mb-8 text-xs font-semibold tracking-widest text-text-tertiary font-body">
          CON LA CONFIANZA DE EQUIPOS EN
        </p>
        <div class="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          ${logos}
        </div>
      </div>
    </section>
  `;
}

function renderHowItWorks() {
  const stepCards = steps.map((step) => StepCard(step)).join("");

  return `
    <section class="px-6 py-24">
      <div class="mx-auto max-w-3xl text-center">
        ${Badge({ text: "Cómo Funciona", variant: "primary" })}
        <h2 class="mt-5 font-heading text-3xl font-bold text-text-primary sm:text-4xl">
          Del código a tu carrera en tres pasos
        </h2>
        <p class="mt-4 text-base leading-relaxed text-text-secondary font-body">
          Un proceso estructurado que convierte tus commits en credenciales verificadas en las que los equipos de contratación realmente confían.
        </p>
      </div>

      <div class="mx-auto mt-12 flex max-w-3xl flex-col gap-6">
        ${stepCards}
      </div>
    </section>
  `;
}

function renderTestimonials() {
  const cards = testimonials.map((t) => TestimonialCard(t)).join("");

  return `
    <section class="px-6 py-24">
      <div class="mx-auto max-w-3xl text-center">
        ${Badge({ text: "Lo Que Dicen", variant: "primary" })}
        <h2 class="mt-5 font-heading text-3xl font-bold text-text-primary sm:text-4xl">
          Con la confianza de coders y los equipos que los contratan
        </h2>
      </div>

      <div class="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
        ${cards}
      </div>
    </section>
  `;
}

function renderFinalCta() {
  return `
    <section class="px-6 pb-24">
      <div class="mx-auto max-w-4xl rounded-3xl border border-border-default bg-bg-secondary px-8 py-16 text-center">
        ${Badge({ text: "Sin CV Requerido", icon: `<img src="${iconBolt}" alt="" class="h-3 w-3" />` })}
        <h2 class="mt-5 font-heading text-3xl font-bold text-text-primary sm:text-4xl">
          Tu código es tu currículum.
        </h2>
        <p class="mx-auto mt-4 max-w-xl text-base leading-relaxed text-text-secondary font-body">
          Únete a miles de desarrolladores que dejan que su trabajo hable por ellos. Empieza a construir tu portafolio verificado hoy.
        </p>
        <div class="mt-8 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
  ${Button({ text: "Únete como Coder — Es Gratis", variant: "primary", icon: `<img src="${iconNet}" alt="" class="h-3 w-3" />`, iconPosition: "left", extraClasses: "w-full justify-center text-xs sm:w-auto sm:text-sm" })}
  ${Button({ text: "Contratar Talento", variant: "secondary", icon: `<img src="${rightArrow}" alt="" class="h-3 w-3" />`, iconPosition: "right", extraClasses: "w-full justify-center text-xs sm:w-auto sm:text-sm" })}
</div>
      </div>
    </section>
  `;
}

function renderFooter() {
  const columns = footerColumns
    .map(
      (col) => `
        <div>
          <p class="mb-4 text-xs font-semibold tracking-widest text-text-tertiary font-body">${col.title}</p>
          <ul class="space-y-3">
            ${col.links
              .map(
                (link) => `
                  <li>
                    <a href="#" class="text-sm text-text-secondary hover:text-text-primary font-body">${link}</a>
                  </li>
                `,
              )
              .join("")}
          </ul>
        </div>
      `,
    )
    .join("");

  return `
    <footer class="border-t border-border-default/60 px-6 pt-16 pb-8">
      <div class="mx-auto grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <a href="#" class="flex items-center gap-2 font-heading text-lg font-semibold text-text-primary">
             <img src="../assets/logos/horizontalLogoNegative.svg" alt="Altea" class="h-12 w-auto" />
          </a>
          <p class="mt-4 max-w-xs text-sm leading-relaxed text-text-secondary font-body">
            El registro oficial de talento técnico donde los desarrolladores demuestran sus habilidades reales.
          </p>
          <div class="mt-6 flex items-center gap-4 text-text-secondary">
            <a href="#" aria-label="Instagram" class="hover:opacity-75">
              <img src="${Instagram}" alt="" class="h-6 w-6" />
            </a>
            <a href="#" aria-label="LinkedIn" class="hover:opacity-75">
              <img src="${LinkedIn}" alt="" class="h-6 w-6" />
            </a>
            <a href="#" aria-label="Gmail" class="hover:opacity-75">
              <img src="${Gmail}" alt="" class="h-6 w-6" />
            </a>
          </div>
        </div>

        ${columns}
      </div>

      <div class="mx-auto mt-12 max-w-7xl border-t border-border-default/60 pt-6">
            <p class="text-xs text-text-tertiary font-body">
              © ${new Date().getFullYear()} Altea. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  `;
}

export function LandingView() {
  return `
    ${renderHeader()}
    <main>
      ${renderHero()}
      ${renderLogoCloud()}
      ${renderHowItWorks()}
      ${renderTestimonials()}
      ${renderFinalCta()}
    </main>
    ${renderFooter()}
  `;
}
