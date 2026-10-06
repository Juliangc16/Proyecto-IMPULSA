// Funciones de acceso a Supabase para el módulo "Mi proceso / Mentorías".
//
// NOTA: la configuración del cliente de Supabase ya existe en tu proyecto
// (libreria/supabase/client.js para el navegador y libreria/supabase/server.js para el servidor).
// Por eso estas funciones reciben el cliente como primer parámetro y sirven igual en una
// página de servidor (await createClient() de @lib/server) que en un componente de cliente
// (createClient() de @lib/client).

import { priorizarMentorias, profesoresPorEspecialidad } from "@/lib/proceso/mentorias";

const CAMPOS_PROFESOR = "id, nombre, correo, especialidad, disponibilidad, activo";
const SELECCION_PLAN = "*, profesor:profesores(id, nombre, correo, especialidad)";

/** Último diagnóstico del usuario (o null si todavía no lo ha hecho). */
export async function getDiagnostico(supabase, usuarioId) {
  const { data, error } = await supabase
    .from("diagnosticos")
    .select("*")
    .eq("user_id", usuarioId)
    .order("creado_en", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/** Lista de profesores (activos por defecto). Se puede filtrar por especialidad. */
export async function getProfesores(supabase, { especialidad = null, soloActivos = true } = {}) {
  let consulta = supabase.from("profesores").select(CAMPOS_PROFESOR).order("nombre", { ascending: true });

  if (soloActivos) consulta = consulta.eq("activo", true);
  if (especialidad) consulta = consulta.ilike("especialidad", `%${String(especialidad).replace(/[%_]/g, "")}%`);

  const { data, error } = await consulta;
  if (error) throw error;
  return data ?? [];
}

/** Plan de mentorías del usuario con los datos del profesor asignado. */
export async function getPlanMentorias(supabase, usuarioId) {
  const { data, error } = await supabase
    .from("plan_mentorias")
    .select(SELECCION_PLAN)
    .eq("usuario_id", usuarioId)
    .order("mentoria_num", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Si el usuario todavía no tiene plan, lo genera aplicando la regla del puntaje más bajo
 * y le asigna (si existe) el primer profesor activo de la especialidad requerida.
 * Es seguro llamarla varias veces: si el plan ya existe, solo lo devuelve.
 */
export async function crearPlanSiNoExiste(supabase, diagnostico, profesores = []) {
  const existente = await getPlanMentorias(supabase, diagnostico.user_id);
  if (existente.length > 0) return existente;

  const filas = priorizarMentorias(diagnostico).map((mentoria) => {
    const afin = profesoresPorEspecialidad(profesores, mentoria.especialidad)[0];

    return {
      usuario_id: diagnostico.user_id,
      diagnostico_id: diagnostico.id,
      mentoria_num: mentoria.mentoria_num,
      area_prioritaria: mentoria.area_prioritaria,
      puntaje_dx: mentoria.puntaje_dx,
      profesor_id: afin?.id ?? null,
      estado_sesion: mentoria.estado_sesion,
      horas: mentoria.horas,
    };
  });

  const { error } = await supabase.from("plan_mentorias").insert(filas);

  // 23505 = el plan ya fue creado en paralelo (por ejemplo, dos pestañas abiertas): no es un error.
  if (error && error.code !== "23505") throw error;

  return getPlanMentorias(supabase, diagnostico.user_id);
}

/** Cambia el profesor de una mentoría (UPDATE inmediato). profesorId vacío = sin asignar. */
export async function updateProfesorMentoria(supabase, planId, profesorId) {
  const { data, error } = await supabase
    .from("plan_mentorias")
    .update({ profesor_id: profesorId || null })
    .eq("id", planId)
    .select(SELECCION_PLAN)
    .single();

  if (error) throw error;
  return data;
}

/** Cambia el estado, la fecha programada o las horas de una sesión. */
export async function updateSesionMentoria(supabase, planId, cambios) {
  const permitidos = {};
  if ("estado_sesion" in cambios) permitidos.estado_sesion = cambios.estado_sesion;
  if ("fecha_programada" in cambios) permitidos.fecha_programada = cambios.fecha_programada || null;
  if ("horas" in cambios) permitidos.horas = cambios.horas;

  const { data, error } = await supabase
    .from("plan_mentorias")
    .update(permitidos)
    .eq("id", planId)
    .select(SELECCION_PLAN)
    .single();

  if (error) throw error;
  return data;
}

/** Talleres (entregables) de un diagnóstico, ordenados por mes. */
export async function getTalleres(supabase, diagnosticoId) {
  const { data, error } = await supabase
    .from("talleres_proceso")
    .select("*")
    .eq("diagnostico_id", diagnosticoId)
    .order("mes_index", { ascending: true });

  if (error) throw error;
  return data ?? [];
}