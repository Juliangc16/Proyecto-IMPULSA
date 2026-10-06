"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@lib/client";
import TalleresAcordeon from "@/components/proceso/TalleresAcordeon";
import { updateProfesorMentoria, updateSesionMentoria } from "@/lib/supabaseClient";
import {
  ESTADOS_SESION,
  ROLES_GESTION_DOCENTES,
  especialidadDeArea,
  etapaDetectada,
  etiquetaMentoria,
  formatearFechaCorta,
  formatearPuntaje,
  madurezGlobal,
  prioridadMentoria,
  profesoresPorEspecialidad,
} from "@/lib/proceso/mentorias";

// Tablas responsivas: en pantallas grandes (lg) se ven como tabla; en celular, cada fila es una tarjeta.
// Las clases van escritas completas para que Tailwind las detecte.
const COLUMNAS_PLAN = "lg:grid-cols-[1.15fr_1.7fr_0.9fr_1fr_1.8fr_1.7fr_1.1fr_0.6fr]";
const COLUMNAS_COMPROMISOS = "lg:grid-cols-[1.1fr_2.4fr_1.2fr_1fr_1fr]";

const ENCABEZADOS_PLAN = [
  "N° Mentoría",
  "Área / Tema crítico a fortalecer",
  "Puntaje Dx (1.0 - 5.0)",
  "Nivel de prioridad",
  "Profesor / Mentor asignado",
  "Contacto / Correo docente",
  "Estado de la sesión",
  "Horas",
];

const ENCABEZADOS_COMPROMISOS = [
  "Mentoría",
  "Compromisos del emprendedor",
  "Fecha programada",
  "Sesión",
  "Entrega del taller",
];

const ACENTO_MENTORIA = {
  1: "border-l-[#FCC21B]",
  2: "border-l-[#003893]",
  3: "border-l-[#CE1126]",
  4: "border-l-[#020201]",
};

const ESTILO_SESION = {
  Pendiente: "bg-[#FCC21B]/20 text-[#7a5b00] border-[#FCC21B]",
  Programada: "bg-[#003893]/10 text-[#003893] border-[#003893]/40",
  Realizada: "bg-green-100 text-green-800 border-green-300",
  Cancelada: "bg-[#CE1126]/10 text-[#CE1126] border-[#CE1126]/40",
};

const ESTILO_ENTREGA = {
  Pendiente: "bg-[#FCC21B]/20 text-[#7a5b00] border-[#FCC21B]",
  Entregado: "bg-[#003893]/10 text-[#003893] border-[#003893]/40",
  Revisado: "bg-green-100 text-green-800 border-green-300",
};

const CAMPO_SELECT =
  "w-full rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003893] disabled:opacity-60";

export default function MiProceso({ diagnostico, planInicial, profesores, talleresIniciales, rol, esGestion }) {
  const [plan, setPlan] = useState(planInicial);
  const [talleres, setTalleres] = useState(talleresIniciales);
  const [guardandoId, setGuardandoId] = useState(null);
  const [errores, setErrores] = useState({});
  const [verTodos, setVerTodos] = useState(false);

  const puedeAsignar = ROLES_GESTION_DOCENTES.includes(rol); // director / administrador
  const puedeGestionarSesion = esGestion; // profesor, director, administrador

  const madurez = madurezGlobal(diagnostico);
  const etapa = etapaDetectada(madurez);
  const tallerPorMes = Object.fromEntries(talleres.map((t) => [t.mes_index, t]));

  const aplicarFila = (fila) => {
    setPlan((prev) => prev.map((p) => (p.id === fila.id ? fila : p)));
    // El trigger de la base de datos ya sincronizó el nombre en talleres_proceso; aquí se refleja en pantalla.
    setTalleres((prev) =>
      prev.map((t) =>
        t.mes_index === fila.mentoria_num ? { ...t, profesor_asignado: fila.profesor?.nombre ?? "Sin asignar" } : t
      )
    );
  };

  const ejecutarCambio = async (filaId, accion) => {
    setGuardandoId(filaId);
    setErrores((prev) => ({ ...prev, [filaId]: "" }));

    try {
      const actualizada = await accion(createClient());
      aplicarFila(actualizada);
    } catch (error) {
      console.error("Error guardando el cambio en el plan de mentorías:", error);
      setErrores((prev) => ({
        ...prev,
        [filaId]: "No se pudo guardar el cambio. Verifica tus permisos e inténtalo de nuevo.",
      }));
    } finally {
      setGuardandoId(null);
    }
  };

  const cambiarProfesor = (fila, profesorId) =>
    ejecutarCambio(fila.id, (supabase) => updateProfesorMentoria(supabase, fila.id, profesorId));

  const cambiarSesion = (fila, cambios) =>
    ejecutarCambio(fila.id, (supabase) => updateSesionMentoria(supabase, fila.id, cambios));

  const reemplazarTaller = (actualizado) =>
    setTalleres((prev) => prev.map((t) => (t.id === actualizado.id ? actualizado : t)));

  return (
    <div className="min-h-screen bg-stone-50 font-inter text-[#020201]">
      <header className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-4 sm:px-6">
        <Link href={esGestion ? "/panel-de-control" : "/"} className="font-montserrat font-bold text-[#020201]">
          {esGestion ? "← Panel de control" : "← IMPULSA LAB"}
        </Link>
      </header>

      {/* Línea gráfica institucional: amarillo, azul y rojo */}
      <div className="flex h-2 w-full" aria-hidden="true">
        <div className="flex-1 bg-[#FCC21B]" />
        <div className="flex-1 bg-[#003893]" />
        <div className="flex-1 bg-[#CE1126]" />
      </div>

      <main className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 sm:py-10">
        {esGestion && (
          <div className="rounded-xl border border-[#FCC21B] bg-[#FCC21B]/15 px-4 py-3 text-sm">
            Vista de gestión ({rol}). Estás viendo el proceso de <strong>{diagnostico.lider}</strong>.
            {puedeAsignar
              ? " Puedes asignar o reemplazar docentes en cualquier momento."
              : " Puedes actualizar fechas y estados de las sesiones."}
          </div>
        )}

        <div className="space-y-1 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#003893]">Mi proceso de acompañamiento</p>
          <h1 className="font-montserrat text-2xl font-extrabold md:text-3xl">{diagnostico.nombre_emprendimiento}</h1>
        </div>

        {/* ---------- Resumen ---------- */}
        <section aria-label="Resumen del emprendimiento" className="rounded-2xl border-2 border-[#003893] bg-white p-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-stone-500">Emprendimiento</dt>
              <dd className="mt-1 font-semibold">{diagnostico.nombre_emprendimiento}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-stone-500">Líder</dt>
              <dd className="mt-1 font-semibold">{diagnostico.lider}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-stone-500">Estado / madurez global</dt>
              <dd className="mt-1 font-semibold text-[#003893]">{etapa}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-stone-500">Nivel de madurez</dt>
              <dd className="mt-1 font-semibold">{madurez} %</dd>
              <div
                className="mt-2 h-2 w-full rounded-full bg-stone-200"
                role="progressbar"
                aria-label="Nivel de madurez global"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={madurez}
              >
                <div className="h-2 rounded-full bg-[#003893]" style={{ width: `${madurez}%` }} />
              </div>
            </div>
          </dl>
        </section>

        {/* ---------- Plan de mentorías priorizado ---------- */}
        <section aria-labelledby="titulo-plan" className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="titulo-plan" className="font-montserrat text-xl font-extrabold">
                Plan de mentorías priorizado
              </h2>
              <p className="text-sm text-stone-600">De mayor a menor urgencia: la Mentoría 1 trabaja tu área más débil.</p>
            </div>

            {puedeAsignar && (
              <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-700">
                <input
                  type="checkbox"
                  checked={verTodos}
                  onChange={(e) => setVerTodos(e.target.checked)}
                  className="h-4 w-4 accent-[#003893]"
                />
                Ver todos los docentes
              </label>
            )}
          </div>

          <div role="table" aria-label="Plan de mentorías priorizado" className="overflow-hidden rounded-2xl border border-black/10 bg-white">
            <div
              role="row"
              className={`hidden bg-stone-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-stone-500 lg:grid lg:gap-3 ${COLUMNAS_PLAN}`}
            >
              {ENCABEZADOS_PLAN.map((titulo) => (
                <div key={titulo} role="columnheader">
                  {titulo}
                </div>
              ))}
            </div>

            {plan.map((fila) => {
              const guardando = guardandoId === fila.id;
              const estado = fila.estado_sesion ?? "Pendiente";

              return (
                <div
                  key={fila.id}
                  role="row"
                  className={`space-y-3 border-l-4 border-t border-t-black/5 px-4 py-4 first:border-t-0 lg:grid lg:items-center lg:gap-3 lg:space-y-0 ${ACENTO_MENTORIA[fila.mentoria_num] ?? ""} ${COLUMNAS_PLAN}`}
                >
                  <Celda etiqueta="N° Mentoría">
                    <span className="font-montserrat font-bold">{etiquetaMentoria(fila.mentoria_num)}</span>
                  </Celda>

                  <Celda etiqueta="Área / Tema crítico a fortalecer">
                    <span className="text-sm font-semibold">{fila.area_prioritaria}</span>
                  </Celda>

                  <Celda etiqueta="Puntaje Dx (1.0 - 5.0)">
                    <span className="text-sm font-bold">{formatearPuntaje(fila.puntaje_dx)}</span>
                  </Celda>

                  <Celda etiqueta="Nivel de prioridad">
                    <BadgePrioridad numero={fila.mentoria_num} />
                  </Celda>

                  <Celda etiqueta="Profesor / Mentor asignado">
                    {puedeAsignar ? (
                      <SelectorProfesor
                        fila={fila}
                        profesores={profesores}
                        verTodos={verTodos}
                        deshabilitado={guardando}
                        onCambiar={cambiarProfesor}
                      />
                    ) : (
                      <span className="text-sm">{fila.profesor?.nombre ?? "Por asignar"}</span>
                    )}
                  </Celda>

                  <Celda etiqueta="Contacto / Correo docente">
                    {fila.profesor?.correo ? (
                      <a
                        href={`mailto:${fila.profesor.correo}`}
                        className="break-all text-sm font-medium text-[#003893] hover:underline"
                      >
                        {fila.profesor.correo}
                      </a>
                    ) : (
                      <span className="text-sm text-stone-400">—</span>
                    )}
                  </Celda>

                  <Celda etiqueta="Estado de la sesión">
                    {puedeGestionarSesion ? (
                      <select
                        aria-label={`Estado de la mentoría ${fila.mentoria_num}`}
                        value={estado}
                        disabled={guardando}
                        onChange={(e) => cambiarSesion(fila, { estado_sesion: e.target.value })}
                        className={CAMPO_SELECT}
                      >
                        {ESTADOS_SESION.map((e) => (
                          <option key={e} value={e}>
                            {e}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <BadgeSesion estado={estado} />
                    )}
                  </Celda>

                  <Celda etiqueta="Horas">
                    <span className="text-sm font-semibold">{Number(fila.horas)} hrs</span>
                  </Celda>

                  {guardando && <p className="text-xs text-stone-500 lg:col-span-full">Guardando…</p>}
                  {errores[fila.id] && (
                    <p role="alert" className="text-sm text-[#CE1126] lg:col-span-full">
                      {errores[fila.id]}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {puedeAsignar && (
            <p className="text-xs text-stone-500">
              Las columnas “Profesor / Mentor asignado” y “Contacto / Correo docente” son editables: al elegir otro
              docente el cambio se guarda de inmediato. La lista se filtra por la especialidad que pide cada área.
            </p>
          )}
        </section>

        {/* ---------- Tabla de compromisos ---------- */}
        <section aria-labelledby="titulo-compromisos" className="space-y-3">
          <div>
            <h2 id="titulo-compromisos" className="font-montserrat text-xl font-extrabold">
              Tabla de compromisos
            </h2>
            <p className="text-sm text-stone-600">Lo que se espera de cada mentoría y cómo va su avance.</p>
          </div>

          <div role="table" aria-label="Tabla de compromisos" className="overflow-hidden rounded-2xl border border-black/10 bg-white">
            <div
              role="row"
              className={`hidden bg-stone-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-stone-500 lg:grid lg:gap-3 ${COLUMNAS_COMPROMISOS}`}
            >
              {ENCABEZADOS_COMPROMISOS.map((titulo) => (
                <div key={titulo} role="columnheader">
                  {titulo}
                </div>
              ))}
            </div>

            {plan.map((fila) => {
              const guardando = guardandoId === fila.id;
              const taller = tallerPorMes[fila.mentoria_num];
              const entrega = taller?.estado ?? "Pendiente";

              return (
                <div
                  key={fila.id}
                  role="row"
                  className={`space-y-3 border-l-4 border-t border-t-black/5 px-4 py-4 first:border-t-0 lg:grid lg:items-start lg:gap-3 lg:space-y-0 ${ACENTO_MENTORIA[fila.mentoria_num] ?? ""} ${COLUMNAS_COMPROMISOS}`}
                >
                  <Celda etiqueta="Mentoría">
                    <span className="font-montserrat font-bold">{etiquetaMentoria(fila.mentoria_num)}</span>
                  </Celda>

                  <Celda etiqueta="Compromisos del emprendedor">
                    <ul className="list-disc space-y-1 pl-4 text-sm">
                      <li>
                        Asistir a la sesión de {Number(fila.horas)} horas con {fila.profesor?.nombre ?? "el docente asignado"}.
                      </li>
                      <li>Entregar el taller resuelto de «{fila.area_prioritaria}».</li>
                    </ul>
                  </Celda>

                  <Celda etiqueta="Fecha programada">
                    {puedeGestionarSesion ? (
                      <input
                        type="date"
                        aria-label={`Fecha de la mentoría ${fila.mentoria_num}`}
                        value={fila.fecha_programada ?? ""}
                        disabled={guardando}
                        onChange={(e) => cambiarSesion(fila, { fecha_programada: e.target.value })}
                        className={CAMPO_SELECT}
                      />
                    ) : (
                      <span className="text-sm">
                        {fila.fecha_programada ? formatearFechaCorta(fila.fecha_programada) : "Por programar"}
                      </span>
                    )}
                  </Celda>

                  <Celda etiqueta="Sesión">
                    <BadgeSesion estado={fila.estado_sesion ?? "Pendiente"} />
                  </Celda>

                  <Celda etiqueta="Entrega del taller">
                    <span
                      className={`inline-block rounded-full border px-2.5 py-1 text-xs font-semibold ${
                        ESTILO_ENTREGA[entrega] ?? ESTILO_ENTREGA.Pendiente
                      }`}
                    >
                      {entrega}
                    </span>
                  </Celda>

                  {errores[fila.id] && (
                    <p role="alert" className="text-sm text-[#CE1126] lg:col-span-full">
                      {errores[fila.id]}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ---------- Talleres y entregables ---------- */}
        <section aria-labelledby="titulo-talleres" className="mx-auto max-w-3xl space-y-4">
          <div className="text-center">
            <h2 id="titulo-talleres" className="font-montserrat text-xl font-extrabold">
              Talleres y material de cada mentoría
            </h2>
            <p className="text-sm text-stone-600">
              {esGestion
                ? "Sube el material guía y revisa los talleres resueltos."
                : "Consulta el material guía de tu profesor y sube tus talleres resueltos."}
            </p>
          </div>

          <TalleresAcordeon
            talleres={talleres}
            modo={esGestion ? "staff" : "estudiante"}
            onActualizado={reemplazarTaller}
          />
        </section>
      </main>
    </div>
  );
}

/* =========================================================
   Piezas pequeñas
   ========================================================= */

function Celda({ etiqueta, children }) {
  return (
    <div role="cell" className="min-w-0">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-stone-400 lg:hidden">
        {etiqueta}
      </span>
      {children}
    </div>
  );
}

function BadgePrioridad({ numero }) {
  const estilo =
    numero === 1
      ? "bg-[#CE1126] text-white"
      : numero === 2
        ? "bg-[#FCC21B] text-[#020201]"
        : "border border-[#003893]/30 bg-[#003893]/10 text-[#003893]";

  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold tracking-wide ${estilo}`}>
      {prioridadMentoria(numero)}
    </span>
  );
}

function BadgeSesion({ estado }) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-1 text-xs font-semibold ${
        ESTILO_SESION[estado] ?? ESTILO_SESION.Pendiente
      }`}
    >
      {estado}
    </span>
  );
}

function SelectorProfesor({ fila, profesores, verTodos, deshabilitado, onCambiar }) {
  const especialidad = especialidadDeArea(fila.area_prioritaria);
  const candidatos = verTodos
    ? profesoresPorEspecialidad(profesores, null)
    : profesoresPorEspecialidad(profesores, especialidad);

  // Si el docente actual ya no aparece en la lista (inactivo o de otra especialidad), se conserva como opción.
  const opciones =
    fila.profesor && !candidatos.some((p) => p.id === fila.profesor.id) ? [fila.profesor, ...candidatos] : candidatos;

  const idCampo = `profesor-${fila.id}`;

  return (
    <div>
      <label htmlFor={idCampo} className="sr-only">
        Profesor de la mentoría {fila.mentoria_num}
      </label>
      <select
        id={idCampo}
        value={fila.profesor_id ?? ""}
        disabled={deshabilitado}
        onChange={(e) => onCambiar(fila, e.target.value)}
        className={CAMPO_SELECT}
      >
        <option value="">Sin asignar</option>
        {opciones.map((profesor) => (
          <option key={profesor.id} value={profesor.id}>
            {verTodos ? `${profesor.nombre} (${profesor.especialidad})` : profesor.nombre}
          </option>
        ))}
      </select>

      {!verTodos && candidatos.length === 0 && (
        <p className="mt-1 text-xs text-stone-500">
          No hay docentes activos de {especialidad ?? "esta especialidad"}. Activa “Ver todos los docentes”.
        </p>
      )}
    </div>
  );
}