import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@lib/server";
import { obtenerPerfilActual } from "@/lib/proceso/perfil";
import DiagnosticoForm from "./DiagnosticoForm";

export const metadata = {
  title: "¿Qué clase de emprendedor soy? | IMPULSA LAB",
};

export default async function QueClaseDeEmprendedorSoyPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Si ya hizo el diagnóstico, no se repite: se le lleva a su proceso.
  const { data: existente } = await supabase
    .from("diagnosticos")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (existente) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 px-6 font-inter text-[#020201]">
        <div className="w-full max-w-md space-y-4 rounded-2xl border-2 border-[#FCC21B] bg-white p-8 text-center">
          <h1 className="font-montserrat text-2xl font-extrabold">¡Ya completaste tu diagnóstico!</h1>
          <p className="text-sm text-stone-600">
            Consulta tus tutorías mensuales, tu profesor asignado y sube tus talleres en la sección Mi proceso.
          </p>
          <Link
            href="/mi-proceso"
            className="inline-block rounded-xl bg-[#003893] px-6 py-3 font-montserrat font-semibold text-white transition hover:bg-[#003893]/90"
          >
            Ir a Mi proceso
          </Link>
        </div>
      </div>
    );
  }

  const { nombreCompleto } = await obtenerPerfilActual(supabase, user.id);

  return <DiagnosticoForm nombreInicial={nombreCompleto} />;
}
