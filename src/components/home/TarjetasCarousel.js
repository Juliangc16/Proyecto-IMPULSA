"use client";

import { useState } from "react";

export default function TarjetasCarousel({ tarjetas = [], onClickTarjeta }) {
  const [indice, setIndice] = useState(0);
  const total = tarjetas.length;

  if (!tarjetas.length) return null;

  const anterior = () => {
    setIndice((i) => (i - 1 + total) % total);
  };

  const siguiente = () => {
    setIndice((i) => (i + 1) % total);
  };

  return (
    <div className="w-full max-w-6xl mx-auto select-none px-4">

      {/* Carrusel */}
      <div className="relative w-full">

        {/* Flecha izquierda */}
        <button
          type="button"
          onClick={anterior}
          aria-label="Tarjeta anterior"
          className="
            absolute left-0 top-1/2 -translate-y-1/2 z-20
            w-10 h-10 md:w-12 md:h-12
            rounded-full
            bg-white
            border border-stone-200
            shadow-lg
            flex items-center justify-center
            text-stone-500
            hover:text-[#003893]
            hover:border-[#003893]
            hover:scale-105
            transition-all
          "
        >
          <span className="text-2xl leading-none">‹</span>
        </button>

        {/* Ventana del carrusel */}
        <div className="overflow-visible mx-10 md:mx-14 py-8">
          <div className="flex items-center justify-center gap-3 md:gap-5">

            {tarjetas.map((t, index) => {
              let distancia = index - indice;

              // Ajuste para carrusel circular
              if (distancia > total / 2) distancia -= total;
              if (distancia < -total / 2) distancia += total;

              const esCentro = distancia === 0;

              const esVisible =
                distancia === -1 ||
                distancia === 0 ||
                distancia === 1;

              if (!esVisible) return null;

              return (
                <a
                  key={index}
                  href={t.href || "#"}
                  target={t.target}
                  rel={t.target ? "noreferrer" : undefined}
                  onClick={(e) => {
                    if (onClickTarjeta) {
                      onClickTarjeta(e, t);
                    }
                  }}
                  className={`
                    group
                    relative
                    shrink-0
                    w-[28%]
                    min-w-[180px]
                    md:min-w-0
                    rounded-2xl
                    p-3 md:p-5
                    flex flex-col items-center text-center
                    border-2
                    ${t.cardBg || ""}
                    ${t.cardBorder || ""}
                    cursor-pointer

                    transition-all
                    duration-500
                    ease-out

                    ${
                      esCentro
                        ? "scale-110 z-10 shadow-2xl opacity-100"
                        : "scale-90 z-0 shadow-md opacity-80"
                    }

                    hover:scale-105
                    hover:z-30
                    hover:opacity-100
                  `}
                >

                  {/* Imagen */}
                  <div
                    className="
                      w-full
                      aspect-square
                      max-w-[180px]
                      flex items-center justify-center
                      overflow-hidden
                      rounded-xl
                      bg-white/60
                    "
                  >
                    <img
                      src={t.img}
                      alt={t.alt || t.title || "Tarjeta"}
                      className="
                        w-full
                        h-full
                        object-contain
                        transition-transform
                        duration-300
                        group-hover:scale-105
                      "
                    />
                  </div>

                  {/* Información */}
                  <div
                    className="
                      mt-4
                      flex flex-col
                      items-center
                      gap-2
                      w-full
                      pt-3
                      border-t
                      border-black/5
                    "
                  >
                    <span
                      className={`
                        ${t.badgeBg || ""}
                        ${t.badgeText || ""}
                        px-3
                        py-0.5
                        rounded-full
                        text-xs
                        font-bold
                        uppercase
                        tracking-wider
                      `}
                    >
                      Destacado
                    </span>

                    <h3
                      className="
                        font-montserrat
                        font-bold
                        text-sm
                        text-[#020201]
                        leading-tight
                      "
                    >
                      {t.title}
                    </h3>

                    <p
                      className="
                        text-stone-600
                        text-xs
                        leading-relaxed
                        font-inter
                      "
                    >
                      {t.desc}
                    </p>
                  </div>
                </a>
              );
            })}

          </div>
        </div>

        {/* Flecha derecha */}
        <button
          type="button"
          onClick={siguiente}
          aria-label="Siguiente tarjeta"
          className="
            absolute right-0 top-1/2 -translate-y-1/2 z-20
            w-10 h-10 md:w-12 md:h-12
            rounded-full
            bg-white
            border border-stone-200
            shadow-lg
            flex items-center justify-center
            text-stone-500
            hover:text-[#003893]
            hover:border-[#003893]
            hover:scale-105
            transition-all
          "
        >
          <span className="text-2xl leading-none">›</span>
        </button>
      </div>

      {/* Indicadores */}
      <div className="flex items-center justify-center gap-2 mt-3">
        {tarjetas.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Ir a la tarjeta ${index + 1}`}
            onClick={() => setIndice(index)}
            className={`
              h-2.5
              rounded-full
              transition-all
              duration-300
              ${
                index === indice
                  ? "w-6 bg-[#003893]"
                  : "w-2.5 bg-stone-300"
              }
            `}
          />
        ))}
      </div>

    </div>
  );
}