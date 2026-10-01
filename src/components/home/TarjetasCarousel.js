"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import useDeslizar from "@/hooks/useDeslizar";

// Cada cuántos milisegundos pasa sola a la siguiente tarjeta
const INTERVALO_AUTOMATICO_MS = 4500;

// Duración del deslizamiento al soltar
const DURACION_MS = 450;

// Módulo que funciona bien con números negativos
const mod = (n, m) => ((n % m) + m) % m;

export default function TarjetasCarousel({ tarjetas = [], onClickTarjeta }) {
  const total = tarjetas.length;

  // "posicion" no se reinicia al dar la vuelta: así cada tarjeta conserva su
  // identidad y el movimiento circular se ve continuo (sin saltos).
  const [posicion, setPosicion] = useState(0);
  const [ajuste, setAjuste] = useState(0);
  const [animando, setAnimando] = useState(false);
  const [sobre, setSobre] = useState(false);
  const filaRef = useRef(null);
  const cuadroRef = useRef(0);

  useEffect(() => () => cancelAnimationFrame(cuadroRef.current), []);

  // direccion: 1 = siguiente, -1 = anterior, 0 = volver a su sitio.
  // dx: cuánto la arrastraron (para continuar el movimiento sin saltos).
  const mover = (direccion, dx = 0) => {
    if (total < 2) return;

    if (direccion === 0) {
      setAnimando(true);
      return;
    }

    // Distancia entre los centros de dos tarjetas vecinas
    const hijos = filaRef.current?.children;
    const paso =
      hijos && hijos.length > 1 ? hijos[1].offsetLeft - hijos[0].offsetLeft : 0;

    // 1) Cambiamos de tarjeta y compensamos el cambio de posición con
    //    "ajuste" (sin animación), para que visualmente nada salte.
    setPosicion((p) => p + direccion);
    setAjuste(dx + direccion * paso);
    setAnimando(false);

    // 2) Un instante después, animamos el ajuste hasta 0: la fila se desliza
    //    suavemente hasta dejar la nueva tarjeta al centro.
    cancelAnimationFrame(cuadroRef.current);
    cuadroRef.current = requestAnimationFrame(() => {
      cuadroRef.current = requestAnimationFrame(() => {
        setAnimando(true);
        setAjuste(0);
      });
    });
  };

  const { desplazamiento, arrastrando, propsGesto } = useDeslizar({
    alSoltar: mover,
    deshabilitado: total < 2,
  });

  // Pasa sola a la siguiente tarjeta si nadie la está tocando.
  // Al cambiar de tarjeta (sola o a mano) el conteo vuelve a empezar.
  const avanzarSola = useEffectEvent(() => mover(1));

  useEffect(() => {
    if (total < 2 || sobre || arrastrando) return;

    const prefiereMenosMovimiento =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefiereMenosMovimiento) return;

    const temporizador = setTimeout(() => avanzarSola(), INTERVALO_AUTOMATICO_MS);
    return () => clearTimeout(temporizador);
  }, [total, sobre, arrastrando, posicion]);

  if (!tarjetas.length) return null;

  const indice = mod(posicion, total);

  // Se dibujan 2 a cada lado del centro; las de los extremos (±2) son
  // invisibles, solo existen para que al deslizar entren y salgan suaves.
  const distancias = total === 1 ? [0] : [-2, -1, 0, 1, 2];

  return (
    <div className="w-full max-w-6xl mx-auto select-none px-4 overflow-x-clip">
      {/* Carrusel */}
      <div
        {...propsGesto}
        role="region"
        aria-roledescription="carrusel"
        aria-label="Opciones de IMPULSA LAB"
        className={`relative w-full outline-none ${
          total > 1 ? (arrastrando ? "cursor-grabbing" : "cursor-grab") : ""
        }`}
        onPointerEnter={(evento) => {
          if (evento.pointerType === "mouse") setSobre(true);
        }}
        onPointerLeave={(evento) => {
          if (evento.pointerType === "mouse") setSobre(false);
        }}
      >
        {/* Ventana del carrusel */}
        <div className="overflow-visible mx-2 md:mx-6 py-8">
          <div
            ref={filaRef}
            className="flex items-center justify-center gap-3 md:gap-5"
            style={{
              transform: `translateX(${desplazamiento + ajuste}px)`,
              transition:
                animando && !arrastrando
                  ? `transform ${DURACION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`
                  : "none",
            }}
          >
            {distancias.map((distancia) => {
              const t = tarjetas[mod(posicion + distancia, total)];

              const esCentro = distancia === 0;
              const esLejana = Math.abs(distancia) === 2;

              let estado = "scale-90 z-0 shadow-md opacity-80";
              if (esCentro) estado = "scale-110 z-10 shadow-2xl opacity-100";
              if (esLejana) estado = "scale-75 z-0 opacity-0 pointer-events-none";

              const clasesTarjeta = [
                "group relative shrink-0 w-[28%] min-w-[180px] md:min-w-0 rounded-2xl p-3 md:p-5 flex flex-col items-center text-center border-2 cursor-pointer transition-all duration-500 ease-out",
                !esLejana && "hover:scale-105 hover:z-30 hover:opacity-100",
                t.cardBg || "",
                t.cardBorder || "",
                estado,
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
                  key={posicion + distancia}
                  href={t.href || "#"}
                  target={t.target}
                  rel={t.target ? "noreferrer" : undefined}
                  aria-hidden={esLejana ? "true" : undefined}
                  tabIndex={esLejana ? -1 : undefined}
                  draggable={false}
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
      </div>

      {/* Indicadores (solo informativos, ya no son botones) */}
      {total > 1 && (
        <div className="flex items-center justify-center gap-2 mt-3" aria-hidden="true">
          {tarjetas.map((_, index) => (
            <span
              key={index}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === indice ? "w-6 bg-[#003893]" : "w-2.5 bg-stone-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}