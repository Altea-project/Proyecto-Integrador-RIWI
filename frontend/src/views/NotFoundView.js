export function NotFoundView() {
  return `
  <section class="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0B0E14]">

    <!-- Contenido -->
    <div class="relative z-10 flex flex-col items-center px-6 text-center">

      <!-- 404 -->
      <h2
        class="
          font-['Poppins']
          font-extrabold
          leading-none
          tracking-tight
          text-[#3B82F6]

          text-5xl
          sm:text-6xl
          md:text-7xl
        ">
        404
      </h2>

      <!-- Título -->
      <h1
        class="
          mt-4

          max-w-xs
          sm:max-w-2xl
          lg:max-w-5xl

          font-['Poppins']
          font-extrabold
          uppercase

          text-4xl
          sm:text-5xl
          md:text-6xl
          lg:text-[68px]

          leading-none
          tracking-tight

          text-[#FFFFFF]
        ">
        EVIDENCIA EXTRAVIADA
      </h1>

      <!-- Texto -->
      <p
        class="
          mt-8

          max-w-xs
          sm:max-w-xl
          md:max-w-3xl

          px-2

          font-['Inter']
          font-normal

          text-sm
          sm:text-base
          md:text-lg
          lg:text-[20px]

          leading-7
          md:leading-9

          text-[#6B7280]
        ">
        Los datos que buscas no han sido auditados en nuestro ecosistema.
        <br class="hidden sm:block" />
        Vuelve al centro de control para reanudar tu proceso.
      </p>

      <!-- Botones -->
      <div
        class="
          mt-10

          flex
          flex-col
          sm:flex-row

          items-center

          gap-4
          sm:gap-5

          w-full
          max-w-md
        ">

        <button
          id="dashboardBtn"
          class="
            h-14
            w-full
            sm:w-56

            rounded-xl

            bg-[#8044F0]

            font-['Poppins']
            font-semibold

            text-[#FFFFFF]

            

            transition-all
            duration-300

            hover:bg-[#9A6AF5]
            
          ">
          Regresar al Dashboard
        </button>

        <button
          id="galleryBtn"
          class="
            h-14
            w-full
            sm:w-56

            rounded-xl

            border
            border-[#1F2430]

            bg-transparent

            font-['Poppins']
            font-semibold

            text-[#FFFFFF]

            transition-all
            duration-300

            hover:border-[#8044F0]
          ">
          Explorar Galería
        </button>

      </div>

    </div>

  </section>
  `;
}


