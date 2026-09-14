"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hace aparecer suavemente un elemento cuando entra en pantalla.
 * Respeta prefers-reduced-motion.
 *
 * IMPORTANTE:
 * Cuando el elemento ya está visible usamos transform: none.
 * Esto evita crear un stacking context que pueda colocar los
 * modales por debajo de otros elementos de la página.
 */
export default function Reveal({
  children,
  className = "",
  delayMs = 0,
  as: Tag = "div",
  ...props
}) {
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

  const { style: styleExtra, ...otrasProps } = props;

  return (
    <Tag
      ref={ref}
      {...otrasProps}
      className={`il-reveal ${
        visible ? "il-visible" : ""
      } ${className}`}
      style={
        delayMs
          ? { transitionDelay: `${delayMs}ms`, ...styleExtra }
          : styleExtra
      }
    >
      {children}
    </Tag>
  );
}