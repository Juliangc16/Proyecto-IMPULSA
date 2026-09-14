"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import PanelCinematico from "@/components/Nosotros/PanelCinematico";
import Reveal from "@/components/ui/Reveal";
import { SOBRE_NOSOTROS } from "@/lib/sobreNosotrosData";

const FLECHA_IZQUIERDA = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

export default function NosotrosPage() {
  const [progreso, setProgreso] = useState(0);
  const [conFondo, setConFondo] = useState(false);
  const contenedorRef = useRef(null);

  // Barra de progreso y fondo del encabezado, ahora basados en cuánto
  // te has desplazado lateralmente (antes era con el scroll vertical).
  useEffect(() => {
    const contenedor = contenedorRef.current;
    if (!contenedor) return;

    const alScrollear = () => {
      const maximo = contenedor.scrollWidth - contenedor.clientWidth;
      const avance = maximo > 0 ? (contenedor.scrollLeft / maximo) * 100 : 0;
      setProgreso(avance);
      setConFondo(contenedor.scrollLeft > 40);
    };

    alScrollear();
    contenedor.addEventListener("scroll", alScrollear, { passive: true });
    return () => contenedor.removeEventListener("scroll", alScrollear);
  }, []);

  // Convierte el gesto normal de scroll (rueda del mouse hacia abajo)
  // en desplazamiento lateral, para que toda la página se navegue de
  // lado a lado sin necesidad de flechas ni botones.
  useEffect(() => {
    const contenedor = contenedorRef.current;
    if (!contenedor) return;

    const alGirarRueda = (evento) => {
      if (Math.abs(evento.deltaY) > Math.abs(evento.deltaX)) {
        evento.preventDefault();
        contenedor.scrollBy({ left: evento.deltaY });
      }
    };

    contenedor.addEventListener("wheel", alGirarRueda, { passive: false });
    return () => contenedor.removeEventListener("wheel", alGirarRueda);
  }, []);

  // Si se llega desde un link tipo /Nosotros#detalle-quienes (por ejemplo
  // desde las tarjetas de la página de inicio), ubica el scroll horizontal
  // directamente en esa sección al cargar la página.
  useEffect(() => {
    const id = window.location.hash.replace("#detalle-", "");
    const contenedor = contenedorRef.current;
    if (!id || !contenedor) return;

    const nodo = document.getElementById(`detalle-${id}`);
    if (nodo) {
      requestAnimationFrame(() => {
        contenedor.scrollLeft = nodo.offsetLeft;
      });
    }
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-stone-50 text-[#020201] font-inter">
      <div className="il-nos-progreso" style={{ width: `${progreso}%` }} />

      <header
        className={`fixed left-0 top-0 z-50 w-full transition-colors duration-300 ${
          conFondo ? "il-glass-header" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <div className="flex items-center shrink-0">
            <a
              href="https://universitariadecolombia.edu.co/"
              target="_blank"
              rel="noreferrer"
              className="flex shrink-0 items-center transition hover:opacity-80"
            >
              <img
                src="/imagenes/universitaria.png"
                alt="Institución Universitaria de Colombia"
                className="h-8 w-auto object-contain md:h-9"
              />
            </a>

            <div
              className="mx-3 h-6 shrink-0 rounded-full bg-[#020201]/70 md:mx-4"
              style={{ width: "2px" }}
            />

            <img
              src="/imagenes/logoIMPULSALAB.png"
              alt="Logo Impulsa Lab"
              className="h-7 w-auto object-contain md:h-8"
            />
          </div>

          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2 rounded-full border border-[#020201]/15 bg-white/70 px-4 py-2 text-xs font-semibold font-montserrat text-[#020201] transition-colors hover:border-[#003893] hover:text-[#003893] md:text-sm"
          >
            {FLECHA_IZQUIERDA}
            Volver al inicio
          </Link>
        </div>

        <div className="flex w-full">
          <div className="h-[4px] flex-1 bg-[#FCC21B]" />
          <div className="h-[4px] flex-1 bg-[#003893]" />
          <div className="h-[4px] flex-1 bg-[#CE1126]" />
        </div>
      </header>

      <div
        ref={contenedorRef}
        className="il-nos-carrusel flex h-screen w-screen snap-x snap-mandatory overflow-x-auto"
      >
        {/* HERO */}
        <section className="il-nos-textura relative flex h-screen w-screen shrink-0 snap-center flex-col items-center justify-center overflow-hidden px-6 pt-28 text-center md:pt-24">
          <div
            className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-20 md:h-96 md:w-96"
            style={{ background: "#FCC21B", filter: "blur(10px)" }}
          />
          <div
            className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full opacity-20 md:h-96 md:w-96"
            style={{ background: "#003893", filter: "blur(10px)" }}
          />

          <Reveal as="div" className="relative z-10 max-w-3xl">
            <span className="il-nos-eyebrow justify-center text-[#003893]">
              <span className="il-nos-eyebrow-diamantes">
                <span /><span /><span />
              </span>
              Institución Universitaria de Colombia
            </span>

            <h1 className="il-nos-titulo-gigante mt-5 text-5xl text-[#020201] md:text-8xl">
              IMPULSA
              <span className="block text-[#CE1126]">LAB</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-stone-600 md:text-lg">
              Conoce a fondo quiénes somos, qué hacemos y hacia dónde vamos como
              laboratorio de emprendimiento universitario.
            </p>
          </Reveal>

          <Reveal as="div" delayMs={200} className="relative z-10 mt-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="h-7 w-7 -rotate-90 text-stone-400 animate-pulse"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </Reveal>
        </section>

        {SOBRE_NOSOTROS.map((item, index) => (
          <PanelCinematico key={item.id} item={item} index={index} />
        ))}

        {/* CTA + PIE DE PÁGINA, todo en el último "slide" */}
        <section className="il-surface-mesh flex h-screen w-screen shrink-0 snap-center flex-col items-center justify-center px-6 pt-24 text-center md:pt-20">
          <Reveal as="div" className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-extrabold font-montserrat tracking-tight text-[#020201] md:text-4xl">
              ¿Listo para convertir tu idea en un proyecto real?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-stone-600">
              Súmate a IMPULSA LAB y empieza a construir tu emprendimiento con
              acompañamiento, mentorías y una comunidad que cree en tu talento.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="https://forms.cloud.microsoft/r/zz5CaG15Kq"
                target="_blank"
                rel="noreferrer"
                className="il-btn il-btn-primary w-full sm:w-auto"
              >
                Mi idea comienza aquí
              </a>
              <Link href="/Eventos" className="il-btn il-btn-outline w-full sm:w-auto">
                Ver nuestros eventos
              </Link>
            </div>
          </Reveal>

          <footer className="mt-10 w-full max-w-2xl border-t border-stone-200/50 pt-6 text-center text-xs text-stone-400 font-inter">
            © 2026 IMPULSA LAB — Institución Universitaria de Colombia
          </footer>
        </section>
      </div>
    </div>
  );
}