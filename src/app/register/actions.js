"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../../libreria/supabase/server";

export async function registrarUsuario(prevState, formData) {
  const nombre = formData.get("nombre")?.toString().trim();
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const telefono = formData.get("telefono")?.toString().trim();
  const password = formData.get("password")?.toString() || "";
  const confirmarPassword =
    formData.get("confirmarPassword")?.toString() || "";

  const tieneIdea = formData.get("tieneIdea") === "on";

  const nombreEmprendimiento =
    formData.get("nombreEmprendimiento")?.toString().trim() || "";

  if (!nombre) {
    return { error: "El nombre completo es obligatorio." };
  }

  if (!email) {
    return { error: "El correo electrónico es obligatorio." };
  }

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailValido) {
    return { error: "Escribe un correo electrónico válido." };
  }

  if (!telefono) {
    return { error: "El número de teléfono es obligatorio." };
  }

  if (!password) {
    return { error: "La contraseña es obligatoria." };
  }

  if (password.length < 8) {
    return {
      error: "La contraseña debe tener al menos 8 caracteres.",
    };
  }

  if (password !== confirmarPassword) {
    return { error: "Las contraseñas no coinciden." };
  }

  if (tieneIdea && !nombreEmprendimiento) {
    return {
      error:
        "Debes escribir el nombre del emprendimiento porque marcaste que tienes una idea emprendedora.",
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nombre,
        telefono,
        rol: "ESTUDIANTE",
        tieneIdeaNegocio: tieneIdea,
        nombreEmprendimiento: tieneIdea ? nombreEmprendimiento : null,
      },
    },
  });

  if (error) {
    if (
      error.code === "user_already_exists" ||
      error.message?.toLowerCase().includes("already registered")
    ) {
      return {
        error: "Este correo ya se encuentra registrado.",
      };
    }

    console.error("Error de registro en Supabase:", error);
    return {
      error: `No se pudo completar el registro: ${error.message}`,
    };
  }

  if (data?.user && !data.session) {
    return {
      success: `Cuenta creada. Revisa tu correo (${email}) y confirma tu cuenta antes de iniciar sesión.`,
    };
  }

  redirect("/login?registrado=1");
}