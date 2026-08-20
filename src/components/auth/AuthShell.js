import Link from "next/link";

export default function AuthShell({ eyebrow, title, footer, children }) {
  return (
    <div className="min-h-screen w-full bg-stone-50 flex flex-col font-inter">
      <div className="w-full h-[6px] bg-[#FCC21B]" />
      <div className="w-full h-[4.5px] bg-[#003893]" />
      <div className="w-full h-[4.5px] bg-[#CE1126]" />

      <header className="px-6 md:px-10 pt-6">
        <div className="flex items-center gap-3">
          <img
            src="/imagenes/universitaria.png"
            alt="Institución Universitaria de Colombia"
            className="h-9 w-auto object-contain"
          />
          <div className="h-6 w-px bg-black/10" />
          <img
            src="/imagenes/logoIMPULSALAB.png"
            alt="Impulsa Lab"
            className="h-9 w-auto object-contain"
          />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm px-6 py-8 md:px-10 md:py-10">
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
          {footer && (
            <div className="mt-6 text-center text-sm text-stone-600">{footer}</div>
          )}
        </div>
      </main>
    </div>
  );
}