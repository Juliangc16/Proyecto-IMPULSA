"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../../libreria/supabase/server";

export async function iniciarSesion(prevState, formData) {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString();

  if (!email) return { error: "El correo electrónico es obligatorio." };
  if (!password) return { error: "La contraseña es obligatoria." };

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (
      error.code === "email_not_confirmed" ||
      error.message?.toLowerCase().includes("email not confirmed")
    ) {
      return {
        error:
          "Debes confirmar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.",
      };
    }

    return { error: "Correo o contraseña incorrectos." };
  }

  redirect("/");
}