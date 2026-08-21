"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../../libreria/supabase/server";

export async function registrarUsuario(prevState, formData) {
  const usuario = formData.get("usuario")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();
  const confirmar = formData.get("confirmar")?.toString();
  const tieneIdea = formData.get("tieneIdea") === "on";

  if (!usuario) return { error: "El usuario es obligatorio." };
  if (!email) return { error: "El correo electrónico es obligatorio." };
  if (!password) return { error: "La contraseña es obligatoria." };
  if (password.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres." };
  if (password !== confirmar) return { error: "Las contraseñas no coinciden." };

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { usuario, rol: "ESTUDIANTE", tieneIdeaNegocio: tieneIdea },
    },
  });

  if (error) {
    if (error.code === "user_already_exists") {
      return { error: "El usuario ya existe." };
    }
    return { error: "No se pudo completar el registro. Inténtalo de nuevo." };
  }

  redirect("/login?registrado=1");
}