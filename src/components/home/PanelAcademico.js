"use client";

import { useEffect, useState } from "react";
import { createClient } from "@lib/client";

const ROLES = {
  ESTUDIANTE: "ESTUDIANTE",
  PROFESOR: "PROFESOR",
  DIRECTOR: "DIRECTOR",
  ADMINISTRADOR: "ADMINISTRADOR",
};

export default function PanelAcademico({ usuario }) {
  const rol = usuario?.user_metadata?.rol ?? null;

  const [cargando, setCargando] = useState(true);
  const [estudiantes, setEstudiantes] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [directores, setDirectores] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [diagnosticosPorUsuario, setDiagnosticosPorUsuario] = useState({});
  const [asignando, setAsignando] = useState(null);
  const [profesorSeleccionado, setProfesorSeleccionado] = useState("");

  const puedeAsignar = rol === ROLES.DIRECTOR || rol === ROLES.ADMINISTRADOR;
  const esProfesor = rol === ROLES.PROFESOR;
  const esEstudiante = rol === ROLES.ESTUDIANTE;

  useEffect(() => {
    if (!usuario || !rol) {
      setCargando(false);
      return;
    }

    const cargar = async () => {
      const supabase = createClient();

      const { data: perfiles } = await supabase.from("profiles").select("*");
      const listaEstudiantes = (perfiles ?? []).filter((p) => p.rol === "ESTUDIANTE");
      const listaProfesores = (perfiles ?? []).filter((p) => p.rol === "PROFESOR");
      const listaDirectores = (perfiles ?? []).filter((p) => p.rol === "DIRECTOR");

      setEstudiantes(listaEstudiantes);
      setProfesores(listaProfesores);
      setDirectores(listaDirectores);

      const { data: listaAsignaciones } = await supabase.from("asignaciones").select("*");
      setAsignaciones(listaAsignaciones ?? []);

      if (listaEstudiantes.length > 0) {
        const idsEstudiantes = listaEstudiantes.map((e) => e.id);
        const { data: diagnosticos } = await supabase
          .from("diagnosticos")
          .select("usuario_id, perfil, creado_en")
          .in("usuario_id", idsEstudiantes)
          .order("creado_en", { ascending: false });

        const mapa = {};
        (diagnosticos ?? []).forEach((d) => {
          if (!mapa[d.usuario_id]) mapa[d.usuario_id] = d.perfil;
        });
        setDiagnosticosPorUsuario(mapa);
      }

      setCargando(false);
    };

    cargar();
  }, [usuario, rol]);

  const profesoresDe = (estudianteId) =>
    asignaciones
      .filter((a) => a.estudiante_id === estudianteId)
      .map((a) => profesores.find((p) => p.id === a.profesor_id))
      .filter(Boolean);

  const estudiantesDe = (profesorId) =>
    asignaciones
      .filter((a) => a.profesor_id === profesorId)
      .map((a) => estudiantes.find((e) => e.id === a.estudiante_id))
      .filter(Boolean);

  const manejarAsignar = async (estudianteId) => {
    if (!profesorSeleccionado) return;
    const supabase = createClient();
    const { error } = await supabase.from("asignaciones").insert({
      estudiante_id: estudianteId,
      profesor_id: profesorSeleccionado,
      asignado_por: usuario.id,
    });
    if (!error) {
      setAsignaciones((prev) => [
        ...prev,
        { id: crypto.randomUUID(), estudiante_id: estudianteId, profesor_id: profesorSeleccionado },
      ]);
    }
    setAsignando(null);
    setProfesorSeleccionado("");
  };

  const manejarQuitarAsignacion = async (estudianteId, profesorId) => {
    const supabase = createClient();
    await supabase
      .from("asignaciones")
      .delete()
      .eq("estudiante_id", estudianteId)
      .eq("profesor_id", profesorId);
    setAsignaciones((prev) =>
      prev.filter((a) => !(a.estudiante_id === estudianteId && a.profesor_id === profesorId))
    );
  };

  if (!usuario || !rol || cargando) return null;

  if (esEstudiante) {
    const misProfesores = asignaciones
      .filter((a) => a.estudiante_id === usuario.id)
      .map((a) => profesores.find((p) => p.id === a.profesor_id))
      .filter(Boolean);

    return (
      <section className="px-6 py-8 max-w-2xl mx-auto w-full">
        <h3 className="font-montserrat font-bold text-lg text-[#020201] mb-3">
          Tu profesor asignado
        </h3>
        {misProfesores.length === 0 ? (
          <p className="text-sm text-stone-500">
            Todavía no tienes un profesor asignado.
          </p>
        ) : (
          <ul className="space-y-2">
            {misProfesores.map((p) => (
              <li key={p.id} className="bg-white border border-black/10 rounded-xl px-4 py-3">
                <p className="font-semibold text-sm text-[#020201]">{p.nombre ?? p.email}</p>
                <p className="text-xs text-stone-500">{p.email}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  if (esProfesor) {
    const misEstudiantes = estudiantesDe(usuario.id);

    return (
      <section className="px-6 py-8 max-w-4xl mx-auto w-full">
        <h3 className="font-montserrat font-bold text-lg text-[#020201] mb-3">
          Mis estudiantes
        </h3>
        <TablaEstudiantes
          estudiantes={misEstudiantes}
          diagnosticosPorUsuario={diagnosticosPorUsuario}
        />
      </section>
    );
  }

  return (
    <section className="px-6 py-8 max-w-5xl mx-auto w-full space-y-10">
      <div>
        <h3 className="font-montserrat font-bold text-lg text-[#020201] mb-3">
          Estudiantes
        </h3>
        <TablaEstudiantes
          estudiantes={estudiantes}
          diagnosticosPorUsuario={diagnosticosPorUsuario}
          profesoresDe={profesoresDe}
          profesoresDisponibles={profesores}
          puedeAsignar={puedeAsignar}
          asignando={asignando}
          setAsignando={setAsignando}
          profesorSeleccionado={profesorSeleccionado}
          setProfesorSeleccionado={setProfesorSeleccionado}
          onAsignar={manejarAsignar}
          onQuitar={manejarQuitarAsignacion}
        />
      </div>

      <div>
        <h3 className="font-montserrat font-bold text-lg text-[#020201] mb-3">
          Profesores
        </h3>
        <div className="overflow-x-auto rounded-xl border border-black/10">
          <table className="w-full text-sm text-left">
            <thead className="bg-stone-50 text-stone-500">
              <tr>
                <th className="px-4 py-2 font-medium">Nombre</th>
                <th className="px-4 py-2 font-medium">Correo</th>
                <th className="px-4 py-2 font-medium">Estudiantes asignados</th>
              </tr>
            </thead>
            <tbody>
              {profesores.map((p) => (
                <tr key={p.id} className="border-t border-black/5">
                  <td className="px-4 py-2">{p.nombre ?? "—"}</td>
                  <td className="px-4 py-2">{p.email}</td>
                  <td className="px-4 py-2">{estudiantesDe(p.id).length}</td>
                </tr>
              ))}
              {profesores.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-center text-stone-400">
                    No hay profesores registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {rol === ROLES.ADMINISTRADOR && (
        <div>
          <h3 className="font-montserrat font-bold text-lg text-[#020201] mb-3">
            Directores
          </h3>
          <div className="overflow-x-auto rounded-xl border border-black/10">
            <table className="w-full text-sm text-left">
              <thead className="bg-stone-50 text-stone-500">
                <tr>
                  <th className="px-4 py-2 font-medium">Nombre</th>
                  <th className="px-4 py-2 font-medium">Correo</th>
                </tr>
              </thead>
              <tbody>
                {directores.map((d) => (
                  <tr key={d.id} className="border-t border-black/5">
                    <td className="px-4 py-2">{d.nombre ?? "—"}</td>
                    <td className="px-4 py-2">{d.email}</td>
                  </tr>
                ))}
                {directores.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-4 py-4 text-center text-stone-400">
                      No hay directores registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

function TablaEstudiantes({
  estudiantes,
  diagnosticosPorUsuario,
  profesoresDe,
  profesoresDisponibles,
  puedeAsignar,
  asignando,
  setAsignando,
  profesorSeleccionado,
  setProfesorSeleccionado,
  onAsignar,
  onQuitar,
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-black/10">
      <table className="w-full text-sm text-left">
        <thead className="bg-stone-50 text-stone-500">
          <tr>
            <th className="px-4 py-2 font-medium">Nombre</th>
            <th className="px-4 py-2 font-medium">Emprendimiento</th>
            <th className="px-4 py-2 font-medium">Teléfono</th>
            <th className="px-4 py-2 font-medium">Etapa</th>
            <th className="px-4 py-2 font-medium">Profesor(es)</th>
          </tr>
        </thead>
        <tbody>
          {estudiantes.map((e) => (
            <tr key={e.id} className="border-t border-black/5 align-top">
              <td className="px-4 py-2">{e.nombre ?? "—"}</td>
              <td className="px-4 py-2">{e.nombre_emprendimiento ?? "—"}</td>
              <td className="px-4 py-2">{e.telefono ?? "—"}</td>
              <td className="px-4 py-2">{diagnosticosPorUsuario[e.id] ?? "Sin diagnóstico"}</td>
              <td className="px-4 py-2">
                <div className="flex flex-wrap gap-1 items-center">
                  {profesoresDe
                    ? profesoresDe(e.id).map((p) => (
                        <span
                          key={p.id}
                          className="inline-flex items-center gap-1 bg-[#003893]/10 text-[#003893] text-xs px-2 py-1 rounded-full"
                        >
                          {p.nombre ?? p.email}
                          {puedeAsignar && (
                            <button
                              onClick={() => onQuitar(e.id, p.id)}
                              className="hover:text-[#CE1126]"
                              title="Quitar"
                            >
                              ×
                            </button>
                          )}
                        </span>
                      ))
                    : null}

                  {puedeAsignar &&
                    (asignando === e.id ? (
                      <div className="flex items-center gap-1">
                        <select
                          value={profesorSeleccionado}
                          onChange={(ev) => setProfesorSeleccionado(ev.target.value)}
                          className="text-xs border border-black/10 rounded-lg px-2 py-1"
                        >
                          <option value="">Elige...</option>
                          {profesoresDisponibles.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nombre ?? p.email}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => onAsignar(e.id)}
                          className="text-xs font-semibold text-[#003893] hover:underline"
                        >
                          Asignar
                        </button>
                        <button
                          onClick={() => setAsignando(null)}
                          className="text-xs text-stone-400 hover:text-stone-600"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAsignando(e.id)}
                        className="text-xs font-semibold text-[#003893] hover:underline"
                      >
                        + Profesor
                      </button>
                    ))}
                </div>
              </td>
            </tr>
          ))}
          {estudiantes.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-4 text-center text-stone-400">
                No hay estudiantes para mostrar.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}