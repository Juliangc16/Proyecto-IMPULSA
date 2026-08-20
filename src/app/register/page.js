"use client";

import Link from "next/link";
import { useActionState } from "react";
import AuthShell from "@/components/auth/AuthShell";
import PasswordField from "@/components/auth/PasswordField";
import { registrarUsuario } from "./actions";

export default function RegisterPage() {
  const [estado, formAction, enviando] = useActionState(registrarUsuario, { error: null });

  return (
    <AuthShell
      eyebrow="Sistema universitario"
      title="Crear cuenta"
      footer={
        <>
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="font-semibold text-[#003893] hover:underline">
            Iniciar sesión
          </Link>
        </>
      }
    >
      <form action={formAction} className="space-y-5">
        <div>
          <label htmlFor="usuario" className="block text-sm font-medium text-[#020201] mb-1">
            Usuario
          </label>
          <input id="usuario" name="usuario" type="text" required autoComplete="username"
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-[#020201] outline-none transition focus:border-[#003893] focus:ring-2 focus:ring-[#003893]/20" />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#020201] mb-1">
            Correo electrónico
          </label>
          <input id="email" name="email" type="email" required autoComplete="email"
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-[#020201] outline-none transition focus:border-[#003893] focus:ring-2 focus:ring-[#003893]/20" />
        </div>

        <PasswordField id="password" name="password" label="Contraseña" autoComplete="new-password" />
        <PasswordField id="confirmar" name="confirmar" label="Confirmar contraseña" autoComplete="new-password" />

        <div className="flex items-center gap-2 rounded-xl border border-[#FCC21B]/40 bg-[#FCC21B]/10 px-4 py-3">
          <input type="checkbox" checked disabled readOnly className="h-4 w-4 rounded accent-[#003893]" />
          <span className="text-sm font-medium text-[#020201]">Estudiante</span>
        </div>

        <label htmlFor="tieneIdea" className="flex items-center gap-3 rounded-xl border border-black/10 px-4 py-3 cursor-pointer hover:border-[#003893]/40 transition">
          <input id="tieneIdea" name="tieneIdea" type="checkbox" className="h-4 w-4 rounded accent-[#003893]" />
          <span className="text-sm text-[#020201]">💡 Tengo una idea de negocio</span>
        </label>

        {estado?.error && (
          <p role="alert" className="text-sm text-[#CE1126] bg-[#CE1126]/5 border border-[#CE1126]/20 rounded-lg px-3 py-2">
            {estado.error}
          </p>
        )}

        <button type="submit" disabled={enviando}
          className="w-full rounded-xl bg-[#003893] px-4 py-3 text-white font-semibold font-montserrat tracking-wide transition hover:bg-[#003893]/90 focus:outline-none focus:ring-2 focus:ring-[#003893]/40 disabled:opacity-60 disabled:cursor-not-allowed">
          {enviando ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>
    </AuthShell>
  );
}