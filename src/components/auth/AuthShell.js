export default function AuthShell({ eyebrow, title, footer, children }) {
  return (
    <div className="min-h-screen w-full bg-stone-50 flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden font-inter">
      {/* Fondo con profundidad usando los colores institucionales en baja opacidad */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#FCC21B]/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-[#003893]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-[#CE1126]/5 blur-3xl" />

      {/* Logos centrados arriba con ajuste vertical específico para el logo izquierdo */}
      <div className="relative flex items-center gap-6 mb-14 z-20">
        <div className="h-12 md:h-14 flex items-center -translate-y-1">
          <img
            src="/imagenes/universitaria.png"
            alt="Institución Universitaria de Colombia"
            className="max-h-full w-auto object-contain block"
          />
        </div>
        <div className="h-8 w-px bg-[#020201]/15 self-center" />
        <img
          src="/imagenes/logoIMPULSALAB.png"
          alt="Impulsa Lab"
          className="h-10 md:h-12 w-auto object-contain block"
        />
      </div>

      {/* Ave posada: Gran tamaño lateral */}
      <div className="hidden lg:block absolute -left-16 xl:-left-10 -bottom-8 z-10 pointer-events-none select-none">
        <img
          src="/imagenes/colombianita.png"
          alt="Colombianita Impulsa Lab"
          className="w-[600px] xl:w-[740px] 2xl:w-[820px] h-auto object-contain filter drop-shadow-[0_15px_20px_rgba(0,0,0,0.12)]"
        />
      </div>

      {/* Tarjeta de Formulario: EXACTAMENTE CENTRADA */}
      <div className="relative w-full max-w-md z-20">
        {/* Marco degradado envolviendo toda la tarjeta */}
        <div className="rounded-[26px] p-[2px] bg-gradient-to-br from-[#FCC21B] via-[#003893] to-[#CE1126] shadow-xl shadow-[#003893]/10">
          <div className="bg-white rounded-[24px] overflow-hidden">
            <div className="px-6 py-9 md:px-10 md:py-10">
              <div className="text-center mb-8">
                {eyebrow && (
                  <p className="text-xs font-semibold tracking-widest uppercase text-[#003893] mb-2">
                    {eyebrow}
                  </p>
                )}
                <h1 className="text-2xl md:text-3xl font-extrabold font-montserrat text-[#020201] tracking-tight">
                  {title}
                </h1>
              </div>
              {children}
            </div>
          </div>
        </div>

        {footer && (
          <div className="mt-6 text-center text-sm text-stone-600">{footer}</div>
        )}
      </div>
    </div>
  );
}