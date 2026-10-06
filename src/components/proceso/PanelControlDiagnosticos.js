"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@lib/client";
import { FASES } from "@/lib/proceso/fases";
import { promedioGeneral } from "@/lib/proceso/calculo";
import TalleresAcordeon from "@/components/proceso/TalleresAcordeon";

// Colores de las celdas según el puntaje (escala 20 a 100)
function claseNota(valor) {
  const n = Number(valor);
  if (n < 50) return "bg-[#CE1126]/10 text-[#CE1126]";
  if (n < 75) return "bg-[#FCC21B]/25 text-[#7a5b00]";
  return "bg-[#003893]/10 text-[#003893]";
}

function formatearFecha(valor) {
  if (!valor) return "—";
  return new Date(valor).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "America/Bogota",
  });
}

function formatearNumero(valor) {
  const n = Number(valor);
  return Number.isFinite(n) ? String(Math.round(n * 10) / 10) : "—";
}

export default function PanelControlDiagnosticos({ diagnosticos, rol }) {
  const [busqueda, setBusqueda] = useState("");
  const [sector, setSector] = useState("");
  const [abierto, setAbierto] = useState(null);
  const [cargandoId, setCargandoId] = useState(null);
  const [talleresPorDiagnostico, setTalleresPorDiagnostico] = useState({});
  const [errorTalleres, setErrorTalleres] = useState("");

  const sectores = useMemo(
    () => [...new Set(diagnosticos.map((d) => d.sector).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es")),
    [diagnosticos]
  );

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return diagnosticos.filter((d) => {
      const coincideSector = !sector || d.sector === sector;
      const coincideTexto =
        !texto ||
        [d.estudiante_nombre, d.estudiante_correo, d.nombre_emprendimiento, d.lider, d.programa]
          .filter(Boolean)
          .some((campo) => campo.toLowerCase().includes(texto));
      return coincideSector && coincideTexto;
    });
  }, [diagnosticos, busqueda, sector]);

  const alternarFila = async (diagnosticoId) => {
    if (abierto === diagnosticoId) {
      setAbierto(null);
      return;
    }

    setAbierto(diagnosticoId);
    setErrorTalleres("");

    if (talleresPorDiagnostico[diagnosticoId]) return;

    setCargandoId(diagnosticoId);
    const { data, error } = await createClient()
      .from("talleres_proceso")
      .select("*")
      .eq("diagnostico_id", diagnosticoId)
      .order("mes_index", { ascending: true });
    setCargandoId(null);

    if (error) {
      console.error("Error cargando los talleres:", error);
      setErrorTalleres("No se pudieron cargar los talleres de este estudiante.");
      return;
    }

    setTalleresPorDiagnostico((prev) => ({ ...prev, [diagnosticoId]: data ?? [] }));
  };

  const reemplazarTaller = (diagnosticoId, actualizado) =>
    setTalleresPorDiagnostico((prev) => ({
      ...prev,
      [diagnosticoId]: (prev[diagnosticoId] ?? []).map((t) => (t.id === actualizado.id ? actualizado : t)),
    }));

  const totalColumnas = 5 + FASES.length + 1;

  return (
    <div className="min-h-screen bg-stone-50 font-inter text-[#020201]">
      <header className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-4 sm:px-6">
        <Link href="/" className="font-montserrat font-bold text-[#020201]">
          ← IMPULSA LAB
        </Link>
        <span className="rounded-full bg-[#003893]/10 px-3 py-1 text-xs font-semibold text-[#003893]">{rol}</span>
      </header>

      <div className="flex h-2 w-full" aria-hidden="true">
        <div className="flex-1 bg-[#FCC21B]" />
        <div className="flex-1 bg-[#003893]" />
        <div className="flex-1 bg-[#CE1126]" />
      </div>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <div className="space-y-1">
          <h1 className="font-montserrat text-2xl font-extrabold md:text-3xl">Panel de control</h1>
          <p className="text-sm text-stone-600">
            Puntajes del diagnóstico por estudiante (escala de 20 a 100). Abre una fila para ver sus brechas
            prioritarias, subir el material guía y revisar los talleres.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por estudiante, emprendimiento o programa"
            aria-label="Buscar"
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003893] sm:max-w-sm"
          />
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            aria-label="Filtrar por sector"
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003893]"
          >
            <option value="">Todos los sectores</option>
            {sectores.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <p className="text-sm text-stone-500 sm:ml-auto">
            {filtrados.length} de {diagnosticos.length} diagnósticos
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600">
          <span className="font-semibold">Referencia:</span>
          <span className="rounded bg-[#CE1126]/10 px-2 py-1 font-semibold text-[#CE1126]">Menos de 50</span>
          <span className="rounded bg-[#FCC21B]/25 px-2 py-1 font-semibold text-[#7a5b00]">50 a 74</span>
          <span className="rounded bg-[#003893]/10 px-2 py-1 font-semibold text-[#003893]">75 o más</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-black/10 bg-white">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="bg-stone-50 text-stone-500">
              <tr>
                <th className="px-3 py-2 font-medium">Estudiante</th>
                <th className="px-3 py-2 font-medium">Emprendimiento</th>
                <th className="px-3 py-2 font-medium">Sector</th>
                <th className="px-3 py-2 font-medium">Programa</th>
                <th className="px-3 py-2 font-medium">Fecha</th>
                {FASES.map((fase) => (
                  <th key={fase.columna} className="px-3 py-2 text-center font-medium" title={fase.titulo}>
                    {fase.nombre}
                  </th>
                ))}
                <th className="px-3 py-2 text-center font-medium">Promedio</th>
              </tr>
            </thead>

            <tbody>
              {filtrados.map((d) => {
                const estaAbierto = abierto === d.id;
                const talleres = talleresPorDiagnostico[d.id];
                const brechas = Array.isArray(d.brechas_prioritarias) ? d.brechas_prioritarias : [];

                return (
                  <Fragment key={d.id}>
                    <tr
                      className={`cursor-pointer border-t border-black/5 transition hover:bg-stone-50 ${
                        estaAbierto ? "bg-stone-50" : ""
                      }`}
                      onClick={() => alternarFila(d.id)}
                    >
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          aria-expanded={estaAbierto}
                          aria-label={`Ver detalle de ${d.estudiante_nombre}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            alternarFila(d.id);
                          }}
                          className="text-left font-semibold text-[#003893] hover:underline"
                        >
                          {estaAbierto ? "▾ " : "▸ "}
                          {d.estudiante_nombre}
                        </button>
                        {d.estudiante_correo && <p className="text-xs text-stone-400">{d.estudiante_correo}</p>}
                      </td>
                      <td className="px-3 py-2">{d.nombre_emprendimiento}</td>
                      <td className="px-3 py-2">{d.sector}</td>
                      <td className="px-3 py-2">{d.programa}</td>
                      <td className="whitespace-nowrap px-3 py-2">{formatearFecha(d.creado_en)}</td>
                      {FASES.map((fase) => (
                        <td key={fase.columna} className="px-2 py-2 text-center">
                          <span
                            className={`inline-block min-w-[3rem] rounded-md px-2 py-1 font-semibold ${claseNota(
                              d[fase.columna]
                            )}`}
                          >
                            {formatearNumero(d[fase.columna])}
                          </span>
                        </td>
                      ))}
                      <td className="px-3 py-2 text-center font-bold">{formatearNumero(promedioGeneral(d))}</td>
                    </tr>

                    {estaAbierto && (
                      <tr className="border-t border-black/5 bg-stone-50">
                                                <td colSpan={totalColumnas} className="px-4 py-5">
                          <div className="space-y-5">
                            <Link
                              href={`/mi-proceso?estudiante=${d.user_id}`}
                              className="inline-block rounded-xl bg-[#003893] px-4 py-2 font-montserrat text-sm font-semibold text-white transition hover:bg-[#003893]/90"
                            >
                              Abrir plan de mentorías (docentes, fechas y estados)
                            </Link>
                            <div>
                              <h3 className="mb-2 font-montserrat text-sm font-bold text-[#003893]">
                                Brechas prioritarias (Mes 1 al 4)
                              </h3>
                              {brechas.length === 0 ? (
                                <p className="text-sm text-stone-500">Sin brechas registradas.</p>
                              ) : (
                                <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                  {brechas.map((b) => (
                                    <li
                                      key={`${d.id}-${b.mes}`}
                                      className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
                                    >
                                      <p className="font-semibold">
                                        Mes {b.mes} · {b.titulo_fase}{" "}
                                        <span className={`ml-1 rounded px-1.5 py-0.5 text-xs ${claseNota(b.puntaje)}`}>
                                          {formatearNumero(b.puntaje)}
                                        </span>
                                      </p>
                                      <p className="text-xs text-stone-500">{b.profesor_asignado}</p>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>

                            <div>
                              <h3 className="mb-3 font-montserrat text-sm font-bold text-[#CE1126]">
                                Talleres y material guía
                              </h3>

                              {cargandoId === d.id && <p className="text-sm text-stone-500">Cargando talleres...</p>}

                              {errorTalleres && (
                                <p role="alert" className="text-sm text-[#CE1126]">
                                  {errorTalleres}
                                </p>
                              )}

                              {talleres && (
                                <TalleresAcordeon
                                  talleres={talleres}
                                  modo="staff"
                                  onActualizado={(actualizado) => reemplazarTaller(d.id, actualizado)}
                                />
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}

              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={totalColumnas} className="px-4 py-8 text-center text-stone-400">
                    No hay diagnósticos que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
