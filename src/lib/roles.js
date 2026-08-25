
export const ROLES = {
  ESTUDIANTE: "ESTUDIANTE",
  PROFESOR: "PROFESOR",
  DIRECTOR: "DIRECTOR",
  ADMINISTRADOR: "ADMINISTRADOR",
};

export function obtenerRol(usuario) {
  return usuario?.user_metadata?.rol ?? ROLES.ESTUDIANTE;
}

export function esDirectorOAdministrador(usuario) {
  const rol = obtenerRol(usuario);

  return rol === ROLES.DIRECTOR || rol === ROLES.ADMINISTRADOR;
}