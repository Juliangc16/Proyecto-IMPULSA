// Lógica pura del diagnóstico (sin Supabase): promedios, brechas y talleres.

import { FASES, TOTAL_BRECHAS } from "./fases";
import { PREGUNTAS } from "./preguntas";

/**
 * Calcula el promedio (20 a 100) de cada fase.
 * @param {Record<string, number>} respuestas  { q1: 60, q2: 100, ... } con el puntaje elegido.
 * @returns {Record<string, number>} { fase_1_innovacion: 65, ..., fase_6_liderazgo: 80 }
 *          Las llaves son EXACTAMENTE las columnas de la tabla `diagnosticos`.
 */
export function calcularPromedios(respuestas) {
  const promedios = {};

  for (const fase of FASES) {
    const preguntasDeFase = PREGUNTAS.filter((p) => p.fase === fase.numero);

    const puntajes = preguntasDeFase.map((p) => {
      const valor = Number(respuestas[p.id]);
      if (!Number.isFinite(valor) || valor < 20 || valor > 100) {
        throw new Error(`Falta o es inválida la respuesta de la pregunta ${p.numero}.`);
      }
      return valor;
    });

    const suma = puntajes.reduce((total, n) => total + n, 0);
    promedios[fase.columna] = Math.round((suma / puntajes.length) * 100) / 100;
  }

  return promedios;
}

/**
 * Selecciona las 4 fases con menor puntaje (las brechas prioritarias).
 * Mes 1 = la fase más débil, Mes 4 = la cuarta más débil.
 * En caso de empate gana la fase de menor número (resultado siempre determinista).
 * @returns {Array<{mes, fase_numero, fase_clave, columna, titulo_fase, puntaje, profesor_asignado}>}
 */
export function seleccionarBrechas(promedios) {
  return FASES.map((fase) => ({ fase, puntaje: promedios[fase.columna] }))
    .sort((a, b) => a.puntaje - b.puntaje || a.fase.numero - b.fase.numero)
    .slice(0, TOTAL_BRECHAS)
    .map(({ fase, puntaje }, indice) => ({
      mes: indice + 1,
      fase_numero: fase.numero,
      fase_clave: fase.clave,
      columna: fase.columna,
      titulo_fase: fase.titulo,
      puntaje,
      profesor_asignado: fase.profesor,
    }));
}

/**
 * Arma las 4 filas que se insertan en `talleres_proceso`.
 * `estado` se omite a propósito: la base de datos pone 'Pendiente' por defecto.
 */
export function armarTalleres(brechas, diagnosticoId, estudianteId) {
  return brechas.map((brecha) => ({
    diagnostico_id: diagnosticoId,
    estudiante_id: estudianteId,
    mes_index: brecha.mes,
    titulo_fase: brecha.titulo_fase,
    profesor_asignado: brecha.profesor_asignado,
  }));
}

/** Promedio general de las 6 fases (solo para el panel de control). */
export function promedioGeneral(diagnostico) {
  const valores = FASES.map((fase) => Number(diagnostico[fase.columna])).filter(Number.isFinite);
  if (valores.length === 0) return 0;
  return Math.round((valores.reduce((a, b) => a + b, 0) / valores.length) * 10) / 10;
}
