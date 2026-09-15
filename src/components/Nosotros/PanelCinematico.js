"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const COLOR_TEXTO = {
  amarillo: "text-[#a8790a]",
  azul: "text-[#003893]",
  rojo: "text-[#CE1126]",
};

const COLOR_BLOQUE = {
  amarillo: "il-nos-bloque-amarillo",
  azul: "il-nos-bloque-azul",
  rojo: "il-nos-bloque-rojo",
};

const COLOR_CHIP = {
  amarillo: "bg-[#FCC21B] text-[#020201]",
  azul: "bg-[#003893] text-white",
  rojo: "bg-[#CE1126] text-white",
};

/**
 * Ícono de "eyebrow" (etiqueta pequeña) con diamantes + línea + flecha,
 * inspirado en el lenguaje visual de sitios editoriales tipo estudio de
 * videojuegos, pero reinterpretado con la paleta de IMPULSA LAB.
 */
function Eyebrow({ texto, color }) {
  return (
    <span className={`il-nos-eyebrow ${COLOR_TEXTO[color]}`}>
      <span className="il-nos-eyebrow-diamantes">
        <span />
        <span />
        <span />
      </span>
      {texto}
      <span className="il-nos-eyebrow-linea" />
    </span>
  );
}

/**
 * Panel de pantalla completa para cada bloque de "Sobre nosotros"
 * (Quiénes somos / Qué hacemos / Cuál es nuestro propósito).
 *
 * Al entrar en el viewport, la imagen se revela con un efecto de
 * "cortina" (clip-path) y el texto aparece con un fundido + desplazamiento.
 */
export default function PanelCinematico({ item, index, registrarRef }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const imagenDerecha = index % 2 === 1;

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
      { threshold: 0.25 }
    );

    observador.observe(nodo);
    return () => observador.disconnect();
  }, []);

  return (
    <section
      ref={(nodo) => {
        ref.current = nodo;
        if (registrarRef) registrarRef(item.id, nodo);
      }}
      id={`detalle-${item.id}`}
      className={`il-nos-panel il-nos-textura relative flex h-screen w-screen shrink-0 snap-center items-center justify-center overflow-hidden px-6 pb-12 pt-40 md:px-12 md:pb-14 md:pt-44 ${
        visible ? "il-nos-visible" : ""
      }`}
    >
      <div
        className={`mx-auto flex h-full w-full max-w-6xl flex-col items-center justify-center gap-8 md:gap-14 ${
          imagenDerecha ? "md:flex-row-reverse" : "md:flex-row"
        }`}
      >
        {/* IMAGEN */}
        <div
          className={`relative w-full max-w-[220px] shrink-0 md:max-w-[300px] ${
            imagenDerecha ? "il-nos-imagen-derecha" : ""
          }`}
        >
          <div className={`il-nos-bloque ${COLOR_BLOQUE[item.color]}`} />

          <div
            className={`il-nos-imagen-marco il-nos-wipe ${
              imagenDerecha ? "il-nos-wipe-derecha" : ""
            } ${visible ? "il-nos-visible" : ""}`}
          >
            <div className="relative aspect-[4/5] w-full">
              <Image
                src={item.imagen}
                alt={item.titulo}
                fill
                sizes="(max-width: 768px) 90vw, 420px"
                className="object-cover"
              />
            </div>
          </div>

          <span
            className={`absolute -bottom-4 ${
              imagenDerecha ? "-left-4" : "-right-4"
            } z-10 rounded-full px-4 py-1.5 text-xs font-bold font-montserrat shadow-lg ${
              COLOR_CHIP[item.color]
            }`}
          >
            {String(index + 1).padStart(2, "0")} / 03
          </span>
        </div>

        {/* TEXTO */}
        <div
          className={`il-reveal ${visible ? "il-visible" : ""} flex-1 text-center md:text-left`}
          style={{ transitionDelay: "150ms" }}
        >
          <Eyebrow texto={item.eyebrow} color={item.color} />

          <h2 className="il-nos-titulo-gigante mt-3 text-3xl text-[#020201] md:text-5xl">
            <span className="block">{item.tituloPartido[0]}</span>
            <span className={COLOR_TEXTO[item.color]}>{item.tituloPartido[1]}</span>
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-stone-600 md:text-base">
            {item.texto}
          </p>

          <p
            className={`mt-4 max-w-xl border-l-4 pl-4 text-left font-montserrat text-base font-semibold italic leading-snug md:text-lg ${COLOR_TEXTO[item.color]}`}
            style={{ borderColor: "currentColor" }}
          >
            "{item.destacado}"
          </p>
        </div>
      </div>
    </section>
  );
}