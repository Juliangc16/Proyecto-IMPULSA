// Obtiene el rol REAL del usuario desde la tabla `perfiles` (no desde user_metadata,
// que el propio usuario puede editar). Funciona con el cliente de servidor y el de navegador.

import { ROLES } from "@/lib/roles";

export const ROLES_AVANZADOS = [ROLES.PROFESOR, ROLES.DIRECTOR, ROLES.ADMINISTRADOR];

export function esRolAvanzado(rol) {
  return ROLES_AVANZADOS.includes(rol);
}

export async function obtenerPerfilActual(supabase, usuarioId) {
  if (!usuarioId) {
    return { rol: null, nombreCompleto: "" };
  }

  const { data } = await supabase
    .from("perfiles")
    .select("rol, nombre, apellido")
    .eq("id", usuarioId)
    .maybeSingle();

  const rol = String(data?.rol ?? "").trim().toUpperCase() || ROLES.ESTUDIANTE;
  const nombreCompleto = [data?.nombre, data?.apellido].filter(Boolean).join(" ").trim();

  return { rol, nombreCompleto };
}
