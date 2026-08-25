import { createClient } from "../../../libreria/supabase/server";
import DiagnosticoForm from "./DiagnosticoForm";

export default async function QueClaseDeEmprendedorSoyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <DiagnosticoForm usuario={user} />;
}
