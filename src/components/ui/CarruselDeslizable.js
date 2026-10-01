"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useDeslizar from "@/hooks/useDeslizar";

const DURACION_MS = 320;
const CURVA = "cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * Carrusel de un elemento a la vez, sin botones.
 *
 * - Mantén el clic y arrastra (o desliza el dedo): el elemento sigue al
 *   puntero y se alcanza a ver el anterior / siguiente al lado.
 * - Al soltar, si arrastraste lo suficiente, el nuevo elemento queda
 *   adelante; si no, el actual vuelve a su lugar.
 * - Es circular: después del último vuelve al primero.
 *
 * Props:
 *  - items: lista de elementos.
 *  - indice / onCambiar(nuevoIndice): el índice lo controla quien lo usa.
 *  - renderItem(item, i, esActual): devuelve el contenido de cada elemento.
 *    `esActual` es false en los vecinos que solo se ven mientras se arrastra
 *    (úsalo para no cargar cosas pesadas, como iframes, en los vecinos).
 *  - autoMs: si es > 0, pasa solo al siguiente cada esos milisegundos
 *    (se pausa mientras se toca o con el mouse encima).
 */
export default function CarruselDeslizable({
  items = [],
  indice,
  onCambiar,
  renderItem,
  autoMs = 0,
  className = "",
  etiqueta = "Carrusel",
}) {
  const total = items.length;

  // salida: 1 = saliendo hacia el siguiente, -1 = hacia el anterior, 0 = quieto
  const [salida, setSalida] = useState(0);
  const [volviendo, setVolviendo] = useState(false);
  const [sobre, setSobre] = useState(false);
  const temporizadorRef = useRef(null);

  useEffect(() => () => clearTimeout(temporizadorRef.current), []);

  const ocupado = salida !== 0 || volviendo;

  const mover = useCallback(
    (direccion) => {
      if (total < 2 || ocupado) return;

      setSalida(direccion);
      temporizadorRef.current = setTimeout(() => {
        onCambiar((indice + direccion + total) % total);
        setSalida(0);
      }, DURACION_MS);
    },
    [total, ocupado, indice, onCambiar]
  );

  const alSoltar = (direccion) => {
    if (total < 2 || ocupado) return;

    if (direccion === 0) {
      setVolviendo(true);
      temporizadorRef.current = setTimeout(() => setVolviendo(false), DURACION_MS);
      return;
    }

    mover(direccion);
  };

  const { desplazamiento, arrastrando, propsGesto } = useDeslizar({
    alSoltar,
    deshabilitado: total < 2 || ocupado,
  });

  // Avance automático (se reinicia cada vez que cambia el elemento)
  useEffect(() => {
    if (!autoMs || total < 2 || ocupado || arrastrando || sobre) return;

    const prefiereMenosMovimiento =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefiereMenosMovimiento) return;

    const temporizador = setTimeout(() => mover(1), autoMs);
    return () => clearTimeout(temporizador);
  }, [autoMs, total, ocupado, arrastrando, sobre, indice, mover]);

  if (total === 0) return null;

  const anterior = (indice - 1 + total) % total;
  const siguiente = (indice + 1) % total;

  let traslado = `${desplazamiento}px`;
  if (salida === 1) traslado = "-100%";
  if (salida === -1) traslado = "100%";

  return (
    <div
      {...propsGesto}
      role="region"
      aria-roledescription="carrusel"
      aria-label={etiqueta}
      onPointerEnter={(evento) => {
        if (evento.pointerType === "mouse") setSobre(true);
      }}
      onPointerLeave={(evento) => {
        if (evento.pointerType === "mouse") setSobre(false);
      }}
      style={{ ...propsGesto.style, cursor: total > 1 ? (arrastrando ? "grabbing" : "grab") : undefined }}
      // -mx-3 + px-3 en cada panel: deja espacio para que las sombras de las
      // tarjetas no se corten, sin cambiar el ancho visible del contenido.
      className={`relative -mx-3 overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[#003893]/30 rounded-2xl ${
        arrastrando ? "select-none" : ""
      } ${className}`}
    >
      <div
        className="relative"
        style={{
          transform: `translateX(${traslado})`,
          transition: ocupado ? `transform ${DURACION_MS}ms ${CURVA}` : "none",
          willChange: "transform",
        }}
      >
        {total > 1 && (
          <div
            aria-hidden="true"
            inert
            className="absolute right-full top-0 w-full px-3 py-2"
          >
            {renderItem(items[anterior], anterior, false)}
          </div>
        )}

        <div className="w-full px-3 py-2">
          {renderItem(items[indice], indice, true)}
        </div>

        {total > 1 && (
          <div
            aria-hidden="true"
            inert
            className="absolute left-full top-0 w-full px-3 py-2"
          >
            {renderItem(items[siguiente], siguiente, false)}
          </div>
        )}
      </div>
    </div>
  );
}