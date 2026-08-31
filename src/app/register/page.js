"use client";

import Link from "next/link";
import { useState } from "react";
import { useActionState } from "react";

import AuthShell from "@/components/auth/AuthShell";
import PasswordField from "@/components/auth/PasswordField";

import { registrarUsuario } from "./actions";

export default function RegisterPage() {
  const [estado, formAction, enviando] = useActionState(
    registrarUsuario,
    { error: null }
  );

  const [tieneIdea, setTieneIdea] = useState(false);

  return (
    <AuthShell
      eyebrow="IMPULSA lab"
      title="Crear cuenta"
      footer={
        <>
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#003893] hover:underline"
          >
            Iniciar sesión
          </Link>
        </>
      }
    >
      <form action={formAction} className="space-y-5">

        {/* NOMBRE COMPLETO */}
        <div>
          <label
            htmlFor="nombre"
            className="block text-sm font-medium text-[#020201] mb-1"
          >
            Nombre completo
          </label>

          <input
            id="nombre"
            name="nombre"
            type="text"
            required
            autoComplete="name"
            placeholder="Escribe tu nombre completo"
            className="
              w-full
              rounded-xl
              border
              border-black/10
              bg-white
              px-4
              py-3
              text-[#020201]
              outline-none
              transition
              focus:border-[#003893]
              focus:ring-2
              focus:ring-[#003893]/20
            "
          />
        </div>

        {/* USUARIO */}
        <div>
          <label
            htmlFor="usuario"
            className="block text-sm font-medium text-[#020201] mb-1"
          >
            Usuario
          </label>

          <input
            id="usuario"
            name="usuario"
            type="text"
            required
            autoComplete="username"
            placeholder="Ejemplo: antuan123"
            className="
              w-full
              rounded-xl
              border
              border-black/10
              bg-white
              px-4
              py-3
              text-[#020201]
              outline-none
              transition
              focus:border-[#003893]
              focus:ring-2
              focus:ring-[#003893]/20
            "
          />
        </div>

        {/* TELÉFONO */}
        <div>
          <label
            htmlFor="telefono"
            className="block text-sm font-medium text-[#020201] mb-1"
          >
            Número de teléfono
          </label>

          <input
            id="telefono"
            name="telefono"
            type="tel"
            required
            autoComplete="tel"
            placeholder="Ej: 3001234567"
            className="
              w-full
              rounded-xl
              border
              border-black/10
              bg-white
              px-4
              py-3
              text-[#020201]
              outline-none
              transition
              focus:border-[#003893]
              focus:ring-2
              focus:ring-[#003893]/20
            "
          />
        </div>

        {/* CONTRASEÑA */}
        <PasswordField
          id="password"
          name="password"
          label="Contraseña"
          autoComplete="new-password"
        />

        {/* CONFIRMAR CONTRASEÑA */}
        <PasswordField
          id="confirmarPassword"
          name="confirmarPassword"
          label="Confirmar contraseña"
          autoComplete="new-password"
        />

        {/* CHECKBOX IDEA EMPRENDEDORA */}
        <div className="pt-1">
          <label
            htmlFor="tieneIdea"
            className="
              flex
              items-center
              gap-3
              cursor-pointer
              rounded-xl
              border
              border-black/10
              bg-[#003893]/5
              px-4
              py-3
              transition
              hover:border-[#003893]/30
            "
          >
            <input
              id="tieneIdea"
              name="tieneIdea"
              type="checkbox"
              checked={tieneIdea}
              onChange={(e) => setTieneIdea(e.target.checked)}
              className="
                h-5
                w-5
                cursor-pointer
                accent-[#003893]
              "
            />

            <div>
              <p className="text-sm font-semibold text-[#020201]">
                Tengo una idea emprendedora
              </p>

              <p className="text-xs text-stone-500 mt-0.5">
                Marca esta opción si ya tienes una idea o emprendimiento.
              </p>
            </div>
          </label>
        </div>

        {/* NOMBRE DEL EMPRENDIMIENTO */}
        {tieneIdea && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label
              htmlFor="nombreEmprendimiento"
              className="block text-sm font-medium text-[#020201] mb-1"
            >
              Nombre del emprendimiento
            </label>

            <input
              id="nombreEmprendimiento"
              name="nombreEmprendimiento"
              type="text"
              required={tieneIdea}
              placeholder="Escribe el nombre de tu emprendimiento"
              className="
                w-full
                rounded-xl
                border
                border-black/10
                bg-white
                px-4
                py-3
                text-[#020201]
                outline-none
                transition
                focus:border-[#003893]
                focus:ring-2
                focus:ring-[#003893]/20
              "
            />

            <p className="mt-1 text-xs text-stone-500">
              Este campo es obligatorio porque marcaste que tienes una idea
              emprendedora.
            </p>
          </div>
        )}

        {/* ERROR DEL SERVIDOR */}
        {estado?.error && (
          <p
            role="alert"
            className="
              text-sm
              text-[#CE1126]
              bg-[#CE1126]/5
              border
              border-[#CE1126]/20
              rounded-lg
              px-3
              py-2
            "
          >
            {estado.error}
          </p>
        )}

        {/* MENSAJE DE ÉXITO */}
        {estado?.success && (
          <p
            role="status"
            className="
              text-sm
              text-green-700
              bg-green-50
              border
              border-green-200
              rounded-lg
              px-3
              py-2
            "
          >
            {estado.success}
          </p>
        )}

        {/* BOTÓN */}
        <button
          type="submit"
          disabled={enviando}
          className="
            w-full
            rounded-xl
            bg-[#003893]
            px-4
            py-3
            text-white
            font-semibold
            font-montserrat
            tracking-wide
            transition
            hover:bg-[#003893]/90
            focus:outline-none
            focus:ring-2
            focus:ring-[#003893]/40
            disabled:opacity-60
            disabled:cursor-not-allowed
          "
        >
          {enviando ? "Creando cuenta..." : "Crear cuenta"}
        </button>

      </form>
    </AuthShell>
  );
}