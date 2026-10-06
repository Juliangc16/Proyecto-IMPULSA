"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@lib/client";
import { SECTORES } from "@/lib/proceso/fases";
import { PASOS_PREGUNTAS, PREGUNTAS, TOTAL_PREGUNTAS } from "@/lib/proceso/preguntas";
import { armarTalleres, calcularPromedios, seleccionarBrechas } from "@/lib/proceso/calculo";

// Paso 0 = datos del emprendimiento; pasos 1 a 6 = grupos de 4 preguntas (1 a 24 continuas).
const TOTAL_PASOS = PASOS_PREGUNTAS.length + 1;

const CAMPO =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003893]";

export default function DiagnosticoForm({ nombreInicial = "" }) {
  const router = useRouter();

  const [paso, setPaso] = useState(0);
  const [datos, setDatos] = useState({
    nombre_emprendimiento: "",
    lider: nombreInicial,
    sector: "",
    programa: "",
  });
  const [respuestas, setRespuestas] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const respondidas = Object.keys(respuestas).length;
  const esUltimoPaso = paso === TOTAL_PASOS - 1;
  const preguntasDelPaso = paso === 0 ? [] : PASOS_PREGUNTAS[paso - 1];

  const actualizarDato = (campo, valor) => setDatos((prev) => ({ ...prev, [campo]: valor }));

  const elegirRespuesta = (preguntaId, puntaje) =>
    setRespuestas((prev) => ({ ...prev, [preguntaId]: puntaje }));

  const datosCompletos =
    datos.nombre_emprendimiento.trim() &&
    datos.lider.trim() &&
    datos.sector.trim() &&
    datos.programa.trim();

  const pasoCompleto =
    paso === 0 ? Boolean(datosCompletos) : preguntasDelPaso.every((p) => respuestas[p.id] !== undefined);

  const subirAlInicio = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const siguiente = () => {
    if (!pasoCompleto) {
      setError(paso === 0 ? "Completa todos los datos para continuar." : "Responde todas las preguntas para continuar.");
      return;
    }
    setError("");
    setPaso((p) => Math.min(p + 1, TOTAL_PASOS - 1));
    subirAlInicio();
  };

  const anterior = () => {
    setError("");
    setPaso((p) => Math.max(p - 1, 0));
    subirAlInicio();
  };

  const enviar = async () => {
    if (enviando) return;

    if (!pasoCompleto) {
      setError("Responde todas las preguntas para continuar.");
      return;
    }

    const sinResponder = PREGUNTAS.filter((p) => respuestas[p.id] === undefined);
    if (sinResponder.length > 0) {
      setError(`Faltan por responder las preguntas: ${sinResponder.map((p) => p.numero).join(", ")}.`);
      return;
    }

    setEnviando(true);
    setError("");

    const supabase = createClient();
    let diagnosticoId = null;

    try {
      // 1) Promedios independientes de las 6 fases y selección de las 4 más bajas
      const promedios = calcularPromedios(respuestas);
      const brechas = seleccionarBrechas(promedios);

      // 2) Usuario autenticado
      const {
        data: { user },
        error: errorUsuario,
      } = await supabase.auth.getUser();
      if (errorUsuario || !user) throw new Error("SESION_EXPIRADA");

      // 3) Inserción en `diagnosticos` (columnas fase_1_innovacion ... fase_6_liderazgo)
      const { data: diagnostico, error: errorDiagnostico } = await supabase
        .from("diagnosticos")
        .insert({
          user_id: user.id,
          nombre_emprendimiento: datos.nombre_emprendimiento.trim(),
          lider: datos.lider.trim(),
          sector: datos.sector.trim(),
          programa: datos.programa.trim(),
          ...promedios,
          brechas_prioritarias: brechas,
        })
        .select("id")
        .single();

      if (errorDiagnostico) throw errorDiagnostico;
      diagnosticoId = diagnostico.id;

      // 4) Los 4 registros de `talleres_proceso` (Mes 1 al 4)
      const { error: errorTalleres } = await supabase
        .from("talleres_proceso")
        .insert(armarTalleres(brechas, diagnosticoId, user.id));

      if (errorTalleres) throw errorTalleres;

      // 5) Listo: el estudiante pasa a ver su proceso
      router.push("/mi-proceso");
      router.refresh();
    } catch (e) {
      console.error("Error guardando el diagnóstico:", e);

      // Si el diagnóstico quedó guardado pero los talleres no, se intenta deshacer
      // para que el estudiante pueda volver a enviar sin quedar a medias.
      if (diagnosticoId) {
        await supabase.from("diagnosticos").delete().eq("id", diagnosticoId);
      }

      setError(
        e?.message === "SESION_EXPIRADA"
          ? "Tu sesión expiró. Inicia sesión de nuevo para guardar tu diagnóstico."
          : "No pudimos guardar tu diagnóstico. Revisa tu conexión e inténtalo de nuevo."
      );
      setEnviando(false);
    }
  };


  return (
    <div className="min-h-screen bg-stone-50 font-inter text-[#020201]">
      <header className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-4 sm:px-6">
        <Link href="/" className="font-montserrat font-bold text-[#020201]">
          ← IMPULSA LAB
        </Link>
        <span className="text-xs text-stone-400">
          Paso {paso + 1} de {TOTAL_PASOS}
        </span>
      </header>

      {/* Barra de avance: sin porcentajes ni nombres de fases */}
      <div
        className="h-2 w-full bg-stone-200"
        role="progressbar"
        aria-label="Avance del formulario"
        aria-valuemin={0}
        aria-valuemax={TOTAL_PREGUNTAS}
        aria-valuenow={respondidas}
      >
        <div
          className="h-2 bg-[#FCC21B] transition-all duration-300"
          style={{ width: `${(respondidas / TOTAL_PREGUNTAS) * 100}%` }}
        />
      </div>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-2 text-center font-montserrat text-2xl font-extrabold text-[#020201] md:text-3xl">
          ¿Qué clase de emprendedor soy?
        </h1>
        <p className="mb-8 text-center text-sm text-stone-600">
          Responde con total sinceridad. No hay respuestas buenas ni malas: este diagnóstico nos ayuda a
          acompañarte en lo que más necesitas.
        </p>

        {paso === 0 ? (
          <section className="space-y-5">
            <h2 className="font-montserrat text-lg font-bold text-[#003893]">Cuéntanos sobre tu emprendimiento</h2>

            <div>
              <label htmlFor="nombre_emprendimiento" className="mb-2 block text-sm font-medium text-stone-700">
                Nombre del emprendimiento
              </label>
              <input
                id="nombre_emprendimiento"
                type="text"
                value={datos.nombre_emprendimiento}
                onChange={(e) => actualizarDato("nombre_emprendimiento", e.target.value)}
                className={CAMPO}
                autoComplete="off"
              />
            </div>

            <div>
              <label htmlFor="lider" className="mb-2 block text-sm font-medium text-stone-700">
                Líder del emprendimiento
              </label>
              <input
                id="lider"
                type="text"
                value={datos.lider}
                onChange={(e) => actualizarDato("lider", e.target.value)}
                className={CAMPO}
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="sector" className="mb-2 block text-sm font-medium text-stone-700">
                Sector
              </label>
              <select
                id="sector"
                value={datos.sector}
                onChange={(e) => actualizarDato("sector", e.target.value)}
                className={CAMPO}
              >
                <option value="">Selecciona un sector</option>
                {SECTORES.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="programa" className="mb-2 block text-sm font-medium text-stone-700">
                Programa académico
              </label>
              <input
                id="programa"
                type="text"
                value={datos.programa}
                onChange={(e) => actualizarDato("programa", e.target.value)}
                className={CAMPO}
                placeholder="Ej.: Administración de Empresas"
                autoComplete="off"
              />
            </div>
          </section>
        ) : (
          <section className="space-y-8">
            <p className="text-sm font-medium text-stone-500">
              Has respondido {respondidas} de {TOTAL_PREGUNTAS} preguntas
            </p>

            {preguntasDelPaso.map((pregunta) => (
              <fieldset key={pregunta.id} className="space-y-3">
                <legend className="flex items-start gap-3 text-sm font-semibold text-stone-800 sm:text-base">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FCC21B] text-xs font-extrabold text-[#020201]">
                    {pregunta.numero}
                  </span>
                  <span>{pregunta.texto}</span>
                </legend>

                <div className="grid grid-cols-1 gap-2 pl-0 sm:pl-10">
                  {pregunta.opciones.map((opcion, indice) => {
                    const seleccionada = respuestas[pregunta.id] === opcion.puntaje;
                    return (
                      <label
                        key={opcion.texto}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition ${
                          seleccionada
                            ? "border-[#003893] bg-[#003893]/5"
                            : "border-stone-200 bg-white hover:border-stone-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name={pregunta.id}
                          value={indice}
                          checked={seleccionada}
                          onChange={() => elegirRespuesta(pregunta.id, opcion.puntaje)}
                          className="mt-0.5 accent-[#003893]"
                        />
                        <span>{opcion.texto}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </section>
        )}

        {error && (
          <p role="alert" className="mt-6 text-sm text-[#CE1126]">
            {error}
          </p>
        )}

        <div className="mt-10 flex items-center justify-between">
          <button
            type="button"
            onClick={anterior}
            disabled={paso === 0 || enviando}
            className="rounded-xl px-4 py-3 font-medium text-stone-500 transition hover:text-[#020201] disabled:opacity-0"
          >
            ← Anterior
          </button>

          {!esUltimoPaso ? (
            <button
              type="button"
              onClick={siguiente}
              className="rounded-xl bg-[#003893] px-6 py-3 font-montserrat font-semibold tracking-wide text-white transition hover:bg-[#003893]/90"
            >
              Siguiente →
            </button>
          ) : (
            <button
              type="button"
              onClick={enviar}
              disabled={enviando}
              className="rounded-xl bg-[#FCC21B] px-6 py-3 font-montserrat font-semibold tracking-wide text-[#020201] transition hover:bg-[#FCC21B]/90 disabled:opacity-60"
            >
              {enviando ? "Guardando..." : "Enviar y ver mi proceso"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}


