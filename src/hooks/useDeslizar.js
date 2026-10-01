"use client";

import { useRef, useState } from "react";

// Cuántos píxeles hay que mover el puntero para considerar que la persona
// está arrastrando y no solo haciendo clic.
const MOVIMIENTO_MINIMO_PX = 6;

// Velocidad (px/ms) a partir de la cual un "latigazo" corto también cuenta
// como deslizar aunque no llegue al umbral de distancia.
const VELOCIDAD_RAPIDA = 0.5;

/**
 * Detecta el gesto de arrastrar (mantener clic y mover con el mouse, o
 * deslizar el dedo en el celular) para usarlo en carruseles sin botones.
 *
 * Usa "pointer events", así que el mismo código sirve para mouse, táctil
 * y lápiz. El scroll vertical de la página sigue funcionando con normalidad.
 *
 * Parámetros:
 *  - alSoltar(direccion, dx): se llama cuando termina el gesto.
 *      direccion =  1 → ir al siguiente (arrastró hacia la izquierda)
 *      direccion = -1 → ir al anterior  (arrastró hacia la derecha)
 *      direccion =  0 → no alcanzó el umbral, hay que volver a su sitio
 *    También se llama con ±1 cuando se usan las flechas del teclado.
 *  - umbral: distancia mínima (px) para cambiar de elemento.
 *  - deshabilitado: ignora los gestos.
 *
 * Devuelve:
 *  - desplazamiento: cuántos px lleva arrastrados (para mover el carrusel
 *    mientras el dedo / mouse sigue presionado).
 *  - arrastrando: true mientras el gesto está activo.
 *  - propsGesto: se esparce (`{...propsGesto}`) en el contenedor del carrusel.
 *
 * Para que el celular no robe el gesto horizontal, el contenedor debe tener
 * `touch-action: pan-y` (ya viene incluido en propsGesto.style).
 */
export default function useDeslizar({
  alSoltar,
  umbral = 60,
  deshabilitado = false,
}) {
  const [desplazamiento, setDesplazamiento] = useState(0);
  const [arrastrando, setArrastrando] = useState(false);
  const gestoRef = useRef(null);
  const huboArrastreRef = useRef(false);

  const alBajarPuntero = (evento) => {
    if (deshabilitado) return;
    if (evento.pointerType === "mouse" && evento.button !== 0) return;

    // Zonas que NO deben arrastrar el carrusel (ej. la barra de un <video>)
    if (evento.target.closest?.("[data-no-deslizar]")) return;

    huboArrastreRef.current = false;
    gestoRef.current = {
      id: evento.pointerId,
      x: evento.clientX,
      y: evento.clientY,
      t0: performance.now(),
      dx: 0,
      horizontal: false,
    };
  };

  const alMoverPuntero = (evento) => {
    const gesto = gestoRef.current;
    if (!gesto || gesto.id !== evento.pointerId) return;

    const dx = evento.clientX - gesto.x;
    const dy = evento.clientY - gesto.y;

    if (!gesto.horizontal) {
      if (Math.abs(dx) < MOVIMIENTO_MINIMO_PX && Math.abs(dy) < MOVIMIENTO_MINIMO_PX) {
        return;
      }

      // Movimiento más vertical que horizontal: es un scroll de la página,
      // no un deslizamiento del carrusel.
      if (Math.abs(dy) > Math.abs(dx)) {
        gestoRef.current = null;
        return;
      }

      gesto.horizontal = true;
      huboArrastreRef.current = true;

      // Desde aquí seguimos al puntero aunque se salga del carrusel
      evento.currentTarget.setPointerCapture(evento.pointerId);
      window.getSelection?.()?.removeAllRanges();
      setArrastrando(true);
    }

    gesto.dx = dx;
    setDesplazamiento(dx);
  };

  const terminarGesto = (evento, cancelado) => {
    const gesto = gestoRef.current;
    if (!gesto || gesto.id !== evento.pointerId) return;

    gestoRef.current = null;
    if (!gesto.horizontal) return;

    if (evento.currentTarget.hasPointerCapture?.(evento.pointerId)) {
      evento.currentTarget.releasePointerCapture(evento.pointerId);
    }

    const dx = gesto.dx;
    const duracion = Math.max(1, performance.now() - gesto.t0);
    const velocidad = Math.abs(dx) / duracion;

    const alcanza =
      Math.abs(dx) >= umbral || (velocidad > VELOCIDAD_RAPIDA && Math.abs(dx) > 20);

    let direccion = 0;
    if (!cancelado && alcanza) direccion = dx < 0 ? 1 : -1;

    setArrastrando(false);
    setDesplazamiento(0);
    alSoltar?.(direccion, dx);
  };

  // Si hubo arrastre, el "clic" que el navegador dispara al soltar no debe
  // abrir el enlace / tarjeta que quedó debajo del puntero.
  const alHacerClicCaptura = (evento) => {
    if (!huboArrastreRef.current) return;
    huboArrastreRef.current = false;
    evento.preventDefault();
    evento.stopPropagation();
  };

  // Accesibilidad: con el carrusel enfocado, las flechas del teclado
  // también cambian de elemento (ya no hay botones visibles).
  const alPresionarTecla = (evento) => {
    if (deshabilitado || evento.target !== evento.currentTarget) return;

    if (evento.key === "ArrowRight") {
      evento.preventDefault();
      alSoltar?.(1, 0);
    } else if (evento.key === "ArrowLeft") {
      evento.preventDefault();
      alSoltar?.(-1, 0);
    }
  };

  return {
    desplazamiento,
    arrastrando,
    propsGesto: {
      onPointerDown: alBajarPuntero,
      onPointerMove: alMoverPuntero,
      onPointerUp: (evento) => terminarGesto(evento, false),
      onPointerCancel: (evento) => terminarGesto(evento, true),
      onClickCapture: alHacerClicCaptura,
      onKeyDown: alPresionarTecla,
      // Evita el "fantasma" de arrastrar imágenes / enlaces del navegador
      onDragStart: (evento) => evento.preventDefault(),
      tabIndex: 0,
      style: { touchAction: "pan-y" },
    },
  };
}