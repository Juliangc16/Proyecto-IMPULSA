"use client";

import { useState } from "react";
import { createClient } from "@lib/client";
import {
  ACCEPT_ARCHIVOS,
  BUCKET_TALLERES,
  TAMANO_MAXIMO_MB,
  abrirArchivo,
  construirRuta,
  validarArchivo,
} from "@/lib/proceso/almacenamiento";

const ESTADOS = ["Pendiente", "Entregado", "Revisado"];

// Clases escritas completas (Tailwind no detecta clases armadas dinámicamente).
const COLORES_MES = {
  1: {
    nodo: "bg-[#FCC21B] text-[#020201]",
    borde: "border-[#FCC21B]",
    fondo: "bg-[#FCC21B]/10",
    etiqueta: "text-[#020201]",
    estiloNodo: undefined,
  },
  2: {
    nodo: "bg-[#003893] text-white",
    borde: "border-[#003893]",
    fondo: "bg-[#003893]/5",
    etiqueta: "text-[#003893]",
    estiloNodo: undefined,
  },
  3: {
    nodo: "bg-[#CE1126] text-white",
    borde: "border-[#CE1126]",
    fondo: "bg-[#CE1126]/5",
    etiqueta: "text-[#CE1126]",
    estiloNodo: undefined,
  },
  4: {
    nodo: "text-white",
    borde: "border-[#003893]",
    fondo: "bg-[#003893]/5",
    etiqueta: "text-[#003893]",
    estiloNodo: { backgroundImage: "linear-gradient(135deg, #FCC21B 0%, #003893 55%, #CE1126 100%)" },
  },
};

const ESTILO_ESTADO = {
  Pendiente: "bg-[#FCC21B]/20 text-[#7a5b00] border-[#FCC21B]",
  Entregado: "bg-[#003893]/10 text-[#003893] border-[#003893]/40",
  Revisado: "bg-green-100 text-green-800 border-green-300",
};

function formatearFecha(valor) {
  if (!valor) return "";
  return new Date(valor).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "America/Bogota",
  });
}

/**
 * Acordeón de talleres.
 * @param {Array}  talleres        Filas de `talleres_proceso`.
 * @param {"estudiante"|"staff"} modo  "estudiante": sube su taller resuelto.
 *                                     "staff" (profesor/director/admin): sube el material guía y cambia el estado.
 * @param {Function} onActualizado Se llama con la fila actualizada para que el padre refresque su estado.
 */
export default function TalleresAcordeon({ talleres, modo = "estudiante", onActualizado }) {
  const ordenados = [...talleres].sort((a, b) => a.mes_index - b.mes_index);

  const [abierto, setAbierto] = useState(ordenados[0]?.mes_index ?? null);
  const [ocupado, setOcupado] = useState("");
  const [errores, setErrores] = useState({});

  const esStaff = modo === "staff";

  const fijarError = (tallerId, mensaje) =>
    setErrores((prev) => ({ ...prev, [tallerId]: mensaje }));

  const subirArchivo = async (taller, lado, evento) => {
    const entrada = evento.target;
    const archivo = entrada.files?.[0];
    entrada.value = "";
    if (!archivo) return;

    const problema = validarArchivo(archivo);
    if (problema) {
      fijarError(taller.id, problema);
      return;
    }

    const columna = lado === "profesor" ? "taller_profesor_url" : "taller_estudiante_url";
    const supabase = createClient();
    const ruta = construirRuta({
      estudianteId: taller.estudiante_id,
      lado,
      mes: taller.mes_index,
      nombreArchivo: archivo.name,
    });

    setOcupado(`${taller.id}:${lado}`);
    fijarError(taller.id, "");

    try {
      const { error: errorSubida } = await supabase.storage
        .from(BUCKET_TALLERES)
        .upload(ruta, archivo, {
          upsert: false,
          cacheControl: "3600",
          contentType: archivo.type || undefined,
        });
      if (errorSubida) throw errorSubida;

      const cambios = { [columna]: ruta, actualizado_en: new Date().toISOString() };
      if (lado === "estudiante" && taller.estado === "Pendiente") {
        cambios.estado = "Entregado";
      }

      const { data, error: errorActualizar } = await supabase
        .from("talleres_proceso")
        .update(cambios)
        .eq("id", taller.id)
        .select()
        .single();

      if (errorActualizar) {
        // Si no se pudo registrar, se intenta borrar el archivo para no dejar basura.
        await supabase.storage.from(BUCKET_TALLERES).remove([ruta]);
        throw errorActualizar;
      }

      onActualizado?.(data);
    } catch (e) {
      console.error("Error subiendo el taller:", e);
      fijarError(taller.id, "No se pudo subir el archivo. Verifica tu conexión e inténtalo de nuevo.");
    } finally {
      setOcupado("");
    }
  };

  const verArchivo = async (taller, ruta) => {
    fijarError(taller.id, "");
    try {
      await abrirArchivo(createClient(), ruta);
    } catch (e) {
      console.error("Error abriendo el archivo:", e);
      fijarError(taller.id, "No se pudo abrir el archivo. Inténtalo de nuevo.");
    }
  };

  const cambiarEstado = async (taller, estado) => {
    fijarError(taller.id, "");
    setOcupado(`${taller.id}:estado`);

    const { data, error } = await createClient()
      .from("talleres_proceso")
      .update({ estado, actualizado_en: new Date().toISOString() })
      .eq("id", taller.id)
      .select()
      .single();

    setOcupado("");

    if (error) {
      console.error("Error cambiando el estado:", error);
      fijarError(taller.id, "No se pudo cambiar el estado.");
      return;
    }
    onActualizado?.(data);
  };

  if (ordenados.length === 0) {
    return <p className="text-sm text-stone-500">Todavía no hay talleres registrados.</p>;
  }

  return (
    <ol className="relative space-y-4 pl-12">
      {/* Línea vertical institucional: amarillo → azul → rojo */}
      <span
        aria-hidden="true"
        className="absolute left-[1.125rem] top-4 bottom-4 w-1 -translate-x-1/2 rounded-full"
        style={{ backgroundImage: "linear-gradient(to bottom, #FCC21B 0%, #003893 55%, #CE1126 100%)" }}
      />

      {ordenados.map((taller) => {
        const color = COLORES_MES[taller.mes_index] ?? COLORES_MES[4];
        const estaAbierto = abierto === taller.mes_index;
        const idPanel = `panel-taller-${taller.id}`;
        const estado = taller.estado ?? "Pendiente";
        const subiendoGuia = ocupado === `${taller.id}:profesor`;
        const subiendoTaller = ocupado === `${taller.id}:estudiante`;

        return (
          <li key={taller.id} className="relative">
            <span
              aria-hidden="true"
              className={`absolute -left-12 top-3 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white text-sm font-extrabold font-montserrat shadow ${color.nodo}`}
              style={color.estiloNodo}
            >
              {taller.mes_index}
            </span>

            <div className={`overflow-hidden rounded-2xl border-2 bg-white ${color.borde}`}>
              <button
                type="button"
                onClick={() => setAbierto(estaAbierto ? null : taller.mes_index)}
                aria-expanded={estaAbierto}
                aria-controls={idPanel}
                className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-stone-50 ${
                  estaAbierto ? color.fondo : ""
                }`}
              >
                <span className="min-w-0">
                  <span className={`block text-xs font-bold uppercase tracking-widest ${color.etiqueta}`}>
                    Tutoría del mes {taller.mes_index}
                  </span>
                  <span className="block truncate font-montserrat text-base font-bold text-[#020201]">
                    {taller.titulo_fase}
                  </span>
                </span>

                <span className="flex shrink-0 items-center gap-2">
                  <span
                    className={`hidden rounded-full border px-2.5 py-1 text-xs font-semibold sm:inline-block ${
                      ESTILO_ESTADO[estado] ?? ESTILO_ESTADO.Pendiente
                    }`}
                  >
                    {estado}
                  </span>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    className={`h-5 w-5 text-stone-500 transition-transform ${estaAbierto ? "rotate-180" : ""}`}
                    fill="currentColor"
                  >
                    <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" />
                  </svg>
                </span>
              </button>

              {estaAbierto && (
                <div id={idPanel} className="space-y-5 border-t border-stone-200 px-4 py-5">
                  <span
                    className={`inline-block rounded-full border px-2.5 py-1 text-xs font-semibold sm:hidden ${
                      ESTILO_ESTADO[estado] ?? ESTILO_ESTADO.Pendiente
                    }`}
                  >
                    {estado}
                  </span>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className={`rounded-xl border p-3 ${color.borde} ${color.fondo}`}>
                      <p className="text-xs font-bold uppercase tracking-wide text-stone-500">Competencia crítica</p>
                      <p className="mt-1 text-sm font-semibold text-[#020201]">{taller.titulo_fase}</p>
                    </div>
                    <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-stone-500">Profesor asignado</p>
                      <p className="mt-1 text-sm font-semibold text-[#020201]">{taller.profesor_asignado}</p>
                    </div>
                  </div>

                  {/* Material guía del profesor */}
                  <section className="space-y-2">
                    <h4 className="font-montserrat text-sm font-bold text-[#003893]">Material guía del profesor</h4>

                    {taller.taller_profesor_url ? (
                      <BotonAccion color="azul" onClick={() => verArchivo(taller, taller.taller_profesor_url)}>
                        Ver material guía
                      </BotonAccion>
                    ) : (
                      <p className="text-sm text-stone-500">
                        {esStaff ? "Aún no has subido el material guía." : "Tu profesor aún no ha subido el material guía."}
                      </p>
                    )}

                    {esStaff && (
                      <BotonSubir
                        color="amarillo"
                        cargando={subiendoGuia}
                        onSeleccionar={(e) => subirArchivo(taller, "profesor", e)}
                      >
                        {taller.taller_profesor_url ? "Reemplazar material guía" : "Subir material guía"}
                      </BotonSubir>
                    )}
                  </section>

                  {/* Taller resuelto del estudiante */}
                  <section className="space-y-2">
                    <h4 className="font-montserrat text-sm font-bold text-[#CE1126]">
                      {esStaff ? "Taller resuelto del estudiante" : "Mi taller resuelto"}
                    </h4>

                    {taller.taller_estudiante_url ? (
                      <BotonAccion color="rojo" onClick={() => verArchivo(taller, taller.taller_estudiante_url)}>
                        {esStaff ? "Ver taller del estudiante" : "Ver mi taller"}
                      </BotonAccion>
                    ) : (
                      <p className="text-sm text-stone-500">
                        {esStaff ? "El estudiante aún no ha entregado su taller." : "Todavía no has subido tu taller."}
                      </p>
                    )}

                    {!esStaff && (
                      <BotonSubir
                        color="amarillo"
                        cargando={subiendoTaller}
                        onSeleccionar={(e) => subirArchivo(taller, "estudiante", e)}
                      >
                        {taller.taller_estudiante_url ? "Reemplazar mi taller" : "Subir mi taller resuelto"}
                      </BotonSubir>
                    )}
                  </section>

                  {esStaff && (
                    <section className="space-y-2">
                      <label
                        htmlFor={`estado-${taller.id}`}
                        className="block font-montserrat text-sm font-bold text-[#020201]"
                      >
                        Estado de la tutoría
                      </label>
                      <select
                        id={`estado-${taller.id}`}
                        value={estado}
                        disabled={ocupado === `${taller.id}:estado`}
                        onChange={(e) => cambiarEstado(taller, e.target.value)}
                        className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003893]"
                      >
                        {ESTADOS.map((e) => (
                          <option key={e} value={e}>
                            {e}
                          </option>
                        ))}
                      </select>
                    </section>
                  )}

                  <p className="text-xs text-stone-400">
                    Formatos permitidos: PDF, Word, PowerPoint, Excel, imágenes o ZIP (máx. {TAMANO_MAXIMO_MB} MB).
                    {taller.actualizado_en && ` Última actualización: ${formatearFecha(taller.actualizado_en)}.`}
                  </p>

                  {errores[taller.id] && (
                    <p role="alert" className="text-sm text-[#CE1126]">
                      {errores[taller.id]}
                    </p>
                  )}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

const ESTILO_BOTON = {
  azul: "bg-[#003893] text-white hover:bg-[#003893]/90",
  rojo: "bg-[#CE1126] text-white hover:bg-[#CE1126]/90",
  amarillo: "bg-[#FCC21B] text-[#020201] hover:bg-[#FCC21B]/90",
};

function BotonAccion({ color, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold font-montserrat transition ${ESTILO_BOTON[color]}`}
    >
      {children}
    </button>
  );
}

function BotonSubir({ color, cargando, onSeleccionar, children }) {
  return (
    <div>
      <label
        className={`inline-flex cursor-pointer items-center rounded-xl px-4 py-2 text-sm font-semibold font-montserrat transition focus-within:ring-2 focus-within:ring-[#003893] focus-within:ring-offset-2 ${
          ESTILO_BOTON[color]
        } ${cargando ? "pointer-events-none opacity-60" : ""}`}
      >
        <input
          type="file"
          accept={ACCEPT_ARCHIVOS}
          disabled={cargando}
          onChange={onSeleccionar}
          className="sr-only"
        />
        {cargando ? "Subiendo..." : children}
      </label>
    </div>
  );
}
