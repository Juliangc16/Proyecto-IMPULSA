"use client";

import Link from "next/link";
import { useActionState } from "react";
import AuthShell from "@/components/auth/AuthShell";
import PasswordField from "@/components/auth/PasswordField";
import { iniciarSesion } from "./actions";

export default function LoginPage() {
  const [estado, formAction, enviando] = useActionState(iniciarSesion, { error: null });

  return (
    <AuthShell
      eyebrow="Sistema universitario"
      title="Iniciar sesión"
      footer={
        <>
          ¿No tienes una cuenta?{" "}
          <Link href="/register" className="font-semibold text-[#003893] hover:underline">
            Registrarse
          </Link>
        </>
      }
    >
      <form action={formAction} className="space-y-5">
        <div>
          <label htmlFor="usuario" className="block text-sm font-medium text-[#020201] mb-1">
            Usuario
          </label>
          <input
            id="usuario"
            name="usuario"
            type="text"
            required
            autoComplete="username"
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-[#020201] outline-none transition focus:border-[#003893] focus:ring-2 focus:ring-[#003893]/20"
          />
        </div>

        <PasswordField id="password" name="password" label="Contraseña" autoComplete="current-password" />

        {estado?.error && (
          <p role="alert" className="text-sm text-[#CE1126] bg-[#CE1126]/5 border border-[#CE1126]/20 rounded-lg px-3 py-2">
            {estado.error}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-xl bg-[#003893] px-4 py-3 text-white font-semibold font-montserrat tracking-wide transition hover:bg-[#003893]/90 focus:outline-none focus:ring-2 focus:ring-[#003893]/40 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {enviando ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>
      </form>
    </AuthShell>
  );
}