"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../../libreria/supabase/server";

export async function iniciarSesion(prevState, formData) {
  const usuario = formData.get("usuario")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!usuario) return { error: "El usuario es obligatorio." };
  if (!password) return { error: "La contraseña es obligatoria." };

  const supabase = await createClient();

  const { data: email, error: errorBusqueda } = await supabase.rpc(
    "obtener_email_por_usuario",
    { nombre_usuario: usuario }
  );

  if (errorBusqueda || !email) {
    return { error: "Usuario o contraseña incorrectos." };
  }

  const { error: errorLogin } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (errorLogin) {
    return { error: "Usuario o contraseña incorrectos." };
  }

  redirect("/");
}