"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fila de navegación cuyos elementos, al pasar el mouse (hover) o al
 * hacer click/toque, despliegan un panel con información, en vez de
 * llevar a otra sección de la página. Se cierra al pasar el mouse
 * fuera, al hacer click afuera o con la tecla Escape.
 */
export default function InfoDropdownNav({ items }) {
  const [abierto, setAbierto] = useState(null);
  const contenedorRef = useRef(null);

  useEffect(() => {
    const manejarClicFuera = (evento) => {
      if (contenedorRef.current && !contenedorRef.current.contains(evento.target)) {
        setAbierto(null);
      }
    };
    const manejarTecla = (evento) => {
      if (evento.key === "Escape") setAbierto(null);
    };

    document.addEventListener("mousedown", manejarClicFuera);
    document.addEventListener("keydown", manejarTecla);
    return () => {
      document.removeEventListener("mousedown", manejarClicFuera);
      document.removeEventListener("keydown", manejarTecla);
    };
  }, []);

  return (
    <div
      ref={contenedorRef}
      className="flex items-center justify-center flex-wrap gap-4 md:gap-10 font-montserrat text-sm flex-1 min-w-0 my-auto"
    >
      {items.map((item) => {
        const estaAbierto = abierto === item.id;

        return (
          <div
            key={item.id}
            className="relative"
            onMouseEnter={() => setAbierto(item.id)}
            onMouseLeave={() => setAbierto((actual) => (actual === item.id ? null : actual))}
          >
            <button
              type="button"
              onClick={() => setAbierto((actual) => (actual === item.id ? null : item.id))}
              aria-expanded={estaAbierto}
              className={`font-medium transition-colors duration-300 whitespace-nowrap ${
                estaAbierto ? "text-[#003893]" : "text-[#020201] hover:text-[#003893]"
              }`}
            >
              {item.label}
            </button>

            {estaAbierto && (
              <div
                role="dialog"
                className="il-scale-in absolute left-1/2 top-full z-50 mt-3 w-80 max-w-[88vw] -translate-x-1/2 rounded-2xl border border-black/10 bg-white p-6 text-left shadow-xl"
              >
                <h3 className="font-montserrat font-bold text-sm text-[#003893] mb-2 uppercase tracking-wide">
                  {item.titulo}
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">{item.texto}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}