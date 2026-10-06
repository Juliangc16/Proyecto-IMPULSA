import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@lib/server";
import { esRolAvanzado, obtenerPerfilActual } from "@/lib/proceso/perfil";
import PanelControlDiagnosticos from "@/components/proceso/PanelControlDiagnosticos";

export const metadata = {
  title: "Panel de control | IMPULSA LAB",
};

export default async function PanelDeControlPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { rol } = await obtenerPerfilActual(supabase, user.id);

  // Vista exclusiva: Profesor, Administrador o Director.
  // (La seguridad real la imponen las políticas RLS de Supabase; esto es solo la puerta de la interfaz.)
  if (!esRolAvanzado(rol)) redirect("/");

  const { data: diagnosticos, error } = await supabase
    .from("diagnosticos")
    .select(
      "id, user_id, nombre_emprendimiento, lider, sector, programa, fase_1_innovacion, fase_2_estrategia, fase_3_finanzas, fase_4_comercial, fase_5_digital, fase_6_liderazgo, brechas_prioritarias, creado_en"
    )
    .order("creado_en", { ascending: false });

  if (error) {
    console.error("Error cargando los diagnósticos:", error);
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 px-6 font-inter">
        <div className="max-w-md space-y-3 rounded-2xl border-2 border-[#CE1126] bg-white p-8 text-center">
          <h1 className="font-montserrat text-xl font-extrabold">No pudimos cargar los diagnósticos</h1>
          <p className="text-sm text-stone-600">Verifica tus permisos o inténtalo de nuevo en unos minutos.</p>
          <Link href="/" className="text-sm text-stone-500 underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // Nombres de los estudiantes desde `perfiles`. Si la política no deja leer alguno, se usa el campo `lider`.
  const ids = [...new Set((diagnosticos ?? []).map((d) => d.user_id).filter(Boolean))];
  let perfilesPorId = {};

  if (ids.length > 0) {
    const { data: perfiles } = await supabase.from("perfiles").select("id, nombre, apellido, email").in("id", ids);
    perfilesPorId = Object.fromEntries((perfiles ?? []).map((p) => [p.id, p]));
  }

  const filas = (diagnosticos ?? []).map((d) => {
    const perfil = perfilesPorId[d.user_id];
    const nombrePerfil = [perfil?.nombre, perfil?.apellido].filter(Boolean).join(" ").trim();
    return {
      ...d,
      estudiante_nombre: nombrePerfil || d.lider,
      estudiante_correo: perfil?.email ?? "",
    };
  });

  return <PanelControlDiagnosticos diagnosticos={filas} rol={rol} />;
}