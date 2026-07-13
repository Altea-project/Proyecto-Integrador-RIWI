import { Button } from "../components/Button.js";

export function NotFoundView() {
  return `
  <section class="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-primary">
    <div class="relative z-10 flex flex-col items-center px-6 text-center">

      <h2 class="font-heading text-5xl font-extrabold leading-none tracking-tight text-state-info sm:text-6xl md:text-7xl">
        404
      </h2>

      <h1 class="mt-4 max-w-xs font-heading text-4xl font-extrabold uppercase leading-none tracking-tight text-text-primary sm:max-w-2xl sm:text-5xl md:max-w-5xl md:text-6xl lg:text-[68px]">
        EVIDENCIA EXTRAVIADA
      </h1>

      <p class="mt-8 max-w-xs px-2 font-body text-sm leading-7 text-text-tertiary sm:max-w-xl sm:text-base md:max-w-3xl md:text-lg md:leading-9 lg:text-[20px]">
        Los datos que buscas no han sido auditados en nuestro ecosistema.
        <br class="hidden sm:block" />
        Vuelve al centro de control para reanudar tu proceso.
      </p>

      <div class="mt-10 flex w-full max-w-md flex-col items-center gap-4 sm:flex-row sm:gap-5">
        ${Button({
          text: "Regresar al Dashboard",
          variant: "primary",
          href: "#",
          extraClasses: "h-10 w-full justify-center sm:w-56",
        })}
        ${Button({
          text: "Explorar Galería",
          variant: "secondary",
          href: "#",
          extraClasses: "h-10 w-full justify-center sm:w-56",
        })}
      </div>

    </div>
  </section>
  `;
}
