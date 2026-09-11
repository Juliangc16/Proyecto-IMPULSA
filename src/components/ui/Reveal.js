"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Envuelve cualquier contenido y lo hace aparecer suavemente
 * (fade + slide up) cuando entra en la pantalla al hacer scroll.
 * No usa librerías externas y respeta prefers-reduced-motion
 * (ver .il-reveal en globals.css).
 */
export default function Reveal({ children, className = "", delayMs = 0, as: Tag = "div" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo) return;

    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            setVisible(true);
            observador.unobserve(entrada.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    observador.observe(nodo);
    return () => observador.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`il-reveal ${visible ? "il-visible" : ""} ${className}`}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}