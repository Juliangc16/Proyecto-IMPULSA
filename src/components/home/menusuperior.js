"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Menú superior del home (Ferias, Mi proceso, Tienda digital).
 * Se despliega al pasar el mouse (o con click/toque) y NO lleva a ninguna
 * otra página: solo muestra un panel informativo.
 * Se cierra al sacar el mouse, al hacer click afuera o con la tecla Escape.
 *
 * Para llenar el contenido más adelante, edita el arreglo `items` que se
 * le pasa desde page.js: cada elemento tiene un `id`, un `label` y una lista
 * de `enlaces` ({ titulo, descripcion }).
 */
const FLECHA = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    className="w-3.5 h-3.5"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

export default function MenuSuperior({ items = [] }) {
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

  if (!items.length) return null;

  return (
    <nav
      ref={contenedorRef}
      aria-label="Menú principal"
      className="hidden lg:flex flex-1 min-w-0 items-center justify-center gap-8 xl:gap-10 font-inter"
    >
      {items.map((item) => {
        const estaAbierto = abierto === item.id;

        return (
          <div
            key={item.id}
            className="relative"
            onMouseEnter={() => setAbierto(item.id)}
            onMouseLeave={() =>
              setAbierto((actual) => (actual === item.id ? null : actual))
            }
          >
            <button
              type="button"
              onClick={() =>
                setAbierto((actual) => (actual === item.id ? null : item.id))
              }
              aria-expanded={estaAbierto}
              aria-haspopup="true"
              className={`flex items-center gap-1.5 py-2 text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${
                estaAbierto ? "text-[#8A6508]" : "text-[#020201] hover:text-[#8A6508]"
              }`}
            >
              {item.label}
              <span
                className={`transition-transform duration-200 ${
                  estaAbierto ? "rotate-180" : ""
                }`}
              >
                {FLECHA}
              </span>
            </button>

            {estaAbierto && (
              <div className="absolute left-1/2 top-full z-50 w-80 max-w-[88vw] -translate-x-1/2 pt-2">
                <div
                  role="menu"
                  className="il-scale-in rounded-2xl border border-black/10 bg-white p-2 text-left shadow-xl"
                >
                  {(item.enlaces || []).map((enlace, indice) => (
                    <div
                      key={indice}
                      role="menuitem"
                      className="rounded-xl px-4 py-2.5 transition-colors hover:bg-stone-50"
                    >
                      <p className="text-sm font-semibold text-[#020201] leading-snug">
                        {enlace.titulo}
                      </p>
                      {enlace.descripcion && (
                        <p className="text-xs text-stone-500 leading-snug mt-0.5">
                          {enlace.descripcion}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}