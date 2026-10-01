"use client";

import { useEffect, useRef, useState } from "react";

// Cada cuántos milisegundos pasa sola a la siguiente tarjeta
const INTERVALO_AUTOMATICO_MS = 4500;

// Cuántos píxeles hay que deslizar el dedo para cambiar de tarjeta
const UMBRAL_DESLIZAR_PX = 40;

export default function TarjetasCarousel({ tarjetas = [], onClickTarjeta }) {
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);
  const toqueInicioRef = useRef(null);
  const total = tarjetas.length;

  // Pasa sola a la siguiente tarjeta si nadie la está tocando.
  // Al cambiar de tarjeta (sola o a mano) el conteo vuelve a empezar.
  useEffect(() => {
    if (total < 2 || pausado) return;

    const prefiereMenosMovimiento =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefiereMenosMovimiento) return;

    const temporizador = setInterval(() => {
      setIndice((i) => (i + 1) % total);
    }, INTERVALO_AUTOMATICO_MS);

    return () => clearInterval(temporizador);
  }, [total, pausado, indice]);

  if (!tarjetas.length) return null;

  const anterior = () => {
    setIndice((i) => (i - 1 + total) % total);
  };

  const siguiente = () => {
    setIndice((i) => (i + 1) % total);
  };

  // Deslizar con el dedo: izquierda = siguiente, derecha = anterior
  const alIniciarToque = (evento) => {
    const toque = evento.touches[0];
    toqueInicioRef.current = { x: toque.clientX, y: toque.clientY };
    setPausado(true);
  };

  const alTerminarToque = (evento) => {
    const inicio = toqueInicioRef.current;
    toqueInicioRef.current = null;
    setPausado(false);

    if (!inicio) return;

    const toque = evento.changedTouches[0];
    const dx = toque.clientX - inicio.x;
    const dy = toque.clientY - inicio.y;

    // Solo cuenta si fue un movimiento horizontal claro (no un scroll vertical)
    if (Math.abs(dx) < UMBRAL_DESLIZAR_PX || Math.abs(dx) < Math.abs(dy) * 1.2) return;

    if (dx < 0) siguiente();
    else anterior();
  };

  const alCancelarToque = () => {
    toqueInicioRef.current = null;
    setPausado(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto select-none px-4">
      {/* Carrusel */}
      <div
        className="relative w-full"
        style={{ touchAction: "pan-y" }}
        onTouchStart={alIniciarToque}
        onTouchEnd={alTerminarToque}
        onTouchCancel={alCancelarToque}
        onPointerEnter={(evento) => {
          if (evento.pointerType === "mouse") setPausado(true);
        }}
        onPointerLeave={(evento) => {
          if (evento.pointerType === "mouse") setPausado(false);
        }}
      >
        {/* Flecha izquierda */}
        <button
          type="button"
          onClick={anterior}
          aria-label="Tarjeta anterior"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border border-stone-200 shadow-lg flex items-center justify-center text-stone-500 hover:text-[#003893] hover:border-[#003893] hover:scale-105 transition-all"
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

              const esVisible = distancia === -1 || distancia === 0 || distancia === 1;

              if (!esVisible) return null;

              const clasesTarjeta = [
                "group relative shrink-0 w-[28%] min-w-[180px] md:min-w-0 rounded-2xl p-3 md:p-5 flex flex-col items-center text-center border-2 cursor-pointer transition-all duration-500 ease-out hover:scale-105 hover:z-30 hover:opacity-100",
                t.cardBg || "",
                t.cardBorder || "",
                esCentro ? "scale-110 z-10 shadow-2xl opacity-100" : "scale-90 z-0 shadow-md opacity-80",
              ]
                .filter(Boolean)
                .join(" ");

              const clasesBadge = [
                "max-w-full px-3 py-1.5 rounded-2xl text-[11px] md:text-xs font-bold uppercase tracking-wide leading-tight text-center break-words",
                t.badgeBg || "",
                t.badgeText || "",
              ]
                .filter(Boolean)
                .join(" ");

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
                  className={clasesTarjeta}
                >
                  {/* Imagen */}
                  <div className="w-full aspect-square max-w-[180px] flex items-center justify-center overflow-hidden rounded-xl bg-white/60">
                    <img
                      src={t.img}
                      alt={t.alt || t.title || "Tarjeta"}
                      draggable={false}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* Información */}
                  <div className="mt-4 flex flex-col items-center gap-2 w-full pt-3 border-t border-black/5">
                    <span className={clasesBadge}>{t.title}</span>

                    <p className="text-stone-600 text-xs leading-relaxed font-inter">{t.desc}</p>
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
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border border-stone-200 shadow-lg flex items-center justify-center text-stone-500 hover:text-[#003893] hover:border-[#003893] hover:scale-105 transition-all"
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
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === indice ? "w-6 bg-[#003893]" : "w-2.5 bg-stone-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}