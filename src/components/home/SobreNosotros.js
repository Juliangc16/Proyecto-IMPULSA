"use client";

import Reveal from "@/components/ui/Reveal";

const ICONOS = {
  quienes: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-7 h-7 md:w-8 md:h-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  ),
  hacemos: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-7 h-7 md:w-8 md:h-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>
  ),
  proposito: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-7 h-7 md:w-8 md:h-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
    </svg>
  ),
};

const FLECHA_ABAJO = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-y-0.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

export function SobreNosotrosTeaser({ items = [] }) {
  if (!items.length) return null;

  return (
    <section className="w-full max-w-5xl mx-auto px-2">
      <Reveal as="div" className="text-center mb-6 md:mb-8">
        <span className="inline-block text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-[#003893] mb-2">
          Nuestro propósito
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold font-montserrat text-[#020201] tracking-tight">
          Conoce IMPULSA LAB
        </h2>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        {items.map((item, index) => (
          <Reveal key={item.id} delayMs={index * 120} className="h-full">
            <a
              href={"/Nosotros#detalle-" + item.id}
              className="il-card il-hover-lift group flex h-full flex-col items-center gap-3 p-6 md:p-7 text-center"
            >
              <span className="flex w-14 h-14 md:w-16 md:h-16 shrink-0 items-center justify-center rounded-2xl bg-[#003893]/10 text-[#003893] transition-colors duration-300 group-hover:bg-[#003893] group-hover:text-white">
                {ICONOS[item.id]}
              </span>

              <h3 className="font-montserrat font-bold text-base md:text-lg text-[#020201]">
                {item.titulo}
              </h3>

              <p className="text-stone-600 text-xs md:text-sm leading-relaxed line-clamp-3">
                {item.resumen}
              </p>

              <span className="mt-auto inline-flex items-center gap-1 pt-2 text-xs font-semibold text-[#003893]">
                Conocer más
                {FLECHA_ABAJO}
              </span>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}