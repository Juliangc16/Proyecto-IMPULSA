export default function AuthShell({ eyebrow, title, footer, children }) {
  return (
    <div className="il-auth min-h-dvh w-full flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden font-inter">

      {/* Logos centrados arriba */}
      <div className="relative flex max-w-full items-end justify-center gap-3 sm:gap-6 mb-8 md:mb-14 z-20 rounded-2xl bg-white/85 backdrop-blur-md px-4 sm:px-6 py-3 shadow-[0_10px_30px_-12px_rgba(0,30,90,0.35)] border border-white/70">

        {/* Logo principal — Universitaria de Colombia */}
        <img
          src="/imagenes/universitaria.png"
          alt="Institución Universitaria de Colombia"
          className="h-8 sm:h-11 md:h-12 w-auto min-w-0 shrink object-contain block"
        />

        {/* Línea divisoria */}
        <div className="h-8 w-px bg-[#020201]/15 mb-1" />

        {/* Logo secundario — Impulsa Lab */}
        <img
          src="/imagenes/logoIMPULSALAB.png"
          alt="Impulsa Lab"
          className="h-8 sm:h-11 md:h-12 w-auto min-w-0 shrink object-contain block"
        />
      </div>

      {/* Formulario: centrado y más grande */}
      <div className="relative z-20 w-full max-w-lg">
        <div className="rounded-[26px] p-[2px] bg-gradient-to-br from-[#FCC21B] via-[#003893] to-[#CE1126] shadow-[0_30px_60px_-20px_rgba(0,30,90,0.45),0_8px_20px_-8px_rgba(2,2,1,0.25)]">

          <div className="bg-white/92 backdrop-blur-md rounded-[24px] overflow-hidden">

            <div className="px-6 py-9 md:px-12 md:py-12 [&_label]:text-base [&_input]:py-3.5 [&_input]:text-base [&_button[type=submit]]:py-3.5 [&_button[type=submit]]:text-lg">

              {/* Encabezado del formulario */}
              <div className="text-center mb-9">

                {eyebrow && (
                  <p className="text-xs font-semibold tracking-widest uppercase text-[#003893] mb-2">
                    {eyebrow}
                  </p>
                )}

                <h1 className="text-3xl md:text-4xl font-extrabold font-montserrat text-[#020201] tracking-tight">
                  {title}
                </h1>

              </div>

              {/* Contenido del formulario */}
              {children}

            </div>
          </div>
        </div>

        {/* Footer */}
        {footer && (
          <div className="mt-6 text-center text-base text-stone-700 rounded-xl bg-white/80 backdrop-blur-sm px-4 py-3 shadow-[0_8px_20px_-10px_rgba(2,2,1,0.3)]">
            {footer}
          </div>
        )}

      </div>
    </div>
  );
}