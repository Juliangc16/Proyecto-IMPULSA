// Lógica pura del módulo de Mentorías (sin Supabase).
//
// Regla de asignación (jerarquía por puntaje):
//   1. Se ordenan las 6 áreas del diagnóstico de MENOR a MAYOR puntaje.
//   2. Mentoría 1 (Mes 1)   = el puntaje MÁS BAJO (la falencia más urgente).
//      Mentoría 2 (Mes 1-2) = el segundo más bajo.
//      Mentoría 3 (Mes 2-3) = el tercero más bajo.
//      Mentoría 4 (Mes 3)   = el cuarto más bajo.
//   3. Si hay empate, gana la fase más inicial (la de menor número).
//
// En la base de datos los promedios van de 20 a 100. Para mostrarlos en la escala
// de 1.0 a 5.0 se divide entre 20 (20 = 1.0, 60 = 3.0, 100 = 5.0).

import { ROLES } from "@/lib/roles";
import { FASES } from "./fases";
import { seleccionarBrechas } from "./calculo";

export const HORAS_POR_MENTORIA = 4;

export const MENTORIAS = {
  1: { periodo: "Mes 1", prioridad: "CRÍTICA / URGENTE" },
  2: { periodo: "Mes 1-2", prioridad: "ALTA" },
  3: { periodo: "Mes 2-3", prioridad: "MEDIA" },
  4: { periodo: "Mes 3", prioridad: "MEDIA" },
};

export const ESTADOS_SESION = ["Pendiente", "Programada", "Realizada", "Cancelada"];

// Quién puede asignar / reemplazar profesores en cualquier momento.
export const ROLES_GESTION_DOCENTES = [ROLES.DIRECTOR, ROLES.ADMINISTRADOR];

export function etiquetaMentoria(numero) {
  const periodo = MENTORIAS[numero]?.periodo ?? "";
  return periodo ? `Mentoría ${numero} (${periodo})` : `Mentoría ${numero}`;
}

export function prioridadMentoria(numero) {
  return MENTORIAS[numero]?.prioridad ?? "MEDIA";
}

/** Convierte un promedio de 20-100 a la escala 1.0-5.0 con un decimal. */
export function puntajeEscala5(puntaje100) {
  return Math.round((Number(puntaje100) / 20) * 10) / 10;
}

export function formatearPuntaje(valor) {
  const n = Number(valor);
  return Number.isFinite(n) ? `${n.toFixed(1)} / 5.0` : "—";
}

/** Nivel de madurez global (%): promedio de las 6 áreas. 3.0 / 5.0 equivale a 60 %. */
export function madurezGlobal(diagnostico) {
  const valores = FASES.map((fase) => Number(diagnostico[fase.columna])).filter(Number.isFinite);
  if (valores.length === 0) return 0;
  return Math.round((valores.reduce((a, b) => a + b, 0) / valores.length) * 10) / 10;
}

/** Etapa detectada según el nivel de madurez global (ajusta los rangos si lo necesitas). */
export function etapaDetectada(porcentaje) {
  if (porcentaje < 40) return "Idea y exploración";
  if (porcentaje < 60) return "Validación temprana";
  if (porcentaje < 80) return "Consolidación";
  return "Crecimiento";
}

export function normalizarTexto(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Especialidad requerida para un área (ej.: "Finanzas y sostenibilidad" -> "Finanzas"). */
export function especialidadDeArea(areaPrioritaria) {
  const fase = FASES.find((f) => f.titulo === areaPrioritaria);
  return fase ? fase.nombre : null;
}

/**
 * Filtra la lista de profesores por especialidad. Coincide aunque la especialidad
 * guardada sea más larga (ej.: "Finanzas y contabilidad" coincide con "Finanzas").
 */
export function profesoresPorEspecialidad(profesores, especialidad, { soloActivos = true } = {}) {
  const buscada = normalizarTexto(especialidad);

  return profesores.filter((profesor) => {
    if (soloActivos && profesor.activo === false) return false;
    if (!buscada) return true;
    return normalizarTexto(profesor.especialidad).includes(buscada);
  });
}

/**
 * Aplica la regla de jerarquía por puntaje y devuelve las 4 mentorías.
 * @returns {Array<{mentoria_num, area_prioritaria, puntaje_dx, puntaje_100, especialidad, horas, estado_sesion}>}
 */
export function priorizarMentorias(diagnostico) {
  const promedios = {};

  for (const fase of FASES) {
    const valor = Number(diagnostico[fase.columna]);
    if (!Number.isFinite(valor)) {
      throw new Error("El diagnóstico no tiene los 6 puntajes completos.");
    }
    promedios[fase.columna] = valor;
  }

  return seleccionarBrechas(promedios).map((brecha) => ({
    mentoria_num: brecha.mes,
    area_prioritaria: brecha.titulo_fase,
    puntaje_dx: puntajeEscala5(brecha.puntaje),
    puntaje_100: brecha.puntaje,
    especialidad: FASES.find((f) => f.numero === brecha.fase_numero)?.nombre ?? null,
    horas: HORAS_POR_MENTORIA,
    estado_sesion: "Pendiente",
  }));
}

/** "2026-10-15" -> "15/10/2026" (sin pasar por Date para evitar corrimientos de zona horaria). */
export function formatearFechaCorta(fechaIso) {
  if (!fechaIso) return "";
  const [anio, mes, dia] = String(fechaIso).slice(0, 10).split("-");
  return anio && mes && dia ? `${dia}/${mes}/${anio}` : "";
}