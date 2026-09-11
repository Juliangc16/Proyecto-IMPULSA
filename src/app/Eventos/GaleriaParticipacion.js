"use client";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@lib/client";
import { esDirectorOAdministrador } from "@/lib/roles";
import Reveal from "@/components/ui/Reveal";

export default function GaleriaParticipacion({ usuario }) {
  const [fotos, setFotos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");
  const [fotoAmpliada, setFotoAmpliada] = useState(null);

  const puedeAdministrar = esDirectorOAdministrador(usuario);

  const cargarFotos = useCallback(async () => {
    const supabase = createClient();
    const { data, error: errorConsulta } = await supabase
      .from("eventos_participacion_fotos")
      .select("*")
      .order("creado_en", { ascending: false });

    if (!errorConsulta) setFotos(data ?? []);
    setCargando(false);
  }, []);

  useEffect(() => {
    cargarFotos();
  }, [cargarFotos]);

  const manejarAgregarFoto = async (e) => {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;

    setError("");
    setSubiendo(true);
    const supabase = createClient();

    try {
      const nombreArchivo = `${Date.now()}-${archivo.name}`;
      const { error: errorSubida } = await supabase.storage
        .from("eventos-participacion")
        .upload(nombreArchivo, archivo, { upsert: false });

      if (errorSubida) throw errorSubida;

      const { data: urlPublica } = supabase.storage
        .from("eventos-participacion")
        .getPublicUrl(nombreArchivo);

      const { error: errorInsercion } = await supabase
        .from("eventos_participacion_fotos")
        .insert({
          imagen_url: urlPublica?.publicUrl ?? null,
          ruta_almacenamiento: nombreArchivo,
          autor_id: usuario?.id ?? null,
        });

      if (errorInsercion) throw errorInsercion;

      await cargarFotos();
    } catch (err) {
      setError(err?.message ?? "No se pudo subir la fotografía.");
    } finally {
      setSubiendo(false);
    }
  };

  const manejarEliminarFoto = async (foto) => {
    const supabase = createClient();

    if (foto.ruta_almacenamiento) {
      await supabase.storage.from("eventos-participacion").remove([foto.ruta_almacenamiento]);
    }

    await supabase.from("eventos_participacion_fotos").delete().eq("id", foto.id);
    setFotos((prev) => prev.filter((f) => f.id !== foto.id));
    setFotoAmpliada(null);
  };

  if (cargando) return null;

  return (
    <Reveal as="section" className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="text-2xl md:text-3xl font-extrabold font-montserrat text-[#020201] tracking-tight">
          Eventos en los que participamos
        </h2>

        {puedeAdministrar && (
          <label className="il-hover-lift cursor-pointer rounded-xl bg-[#003893] px-3 py-2 text-white text-xs md:text-sm font-semibold font-montserrat tracking-wide transition hover:bg-[#003893]/90">
            {subiendo ? "Subiendo..." : "+ Agregar foto"}
            <input
              type="file"
              accept="image/*"
              onChange={manejarAgregarFoto}
              disabled={subiendo}
              className="hidden"
            />
          </label>
        )}
      </div>

      {error && <p className="text-sm text-[#CE1126] mb-3">{error}</p>}

      {fotos.length === 0 ? (
        <p className="text-center text-stone-500 py-6">
          Todavía no hay fotografías de eventos en los que hayamos participado.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {fotos.map((foto, indice) => (
            <div
              key={foto.id}
              className="il-reveal il-visible group relative aspect-square rounded-xl overflow-hidden bg-stone-100 il-hover-lift cursor-pointer"
              style={{ transitionDelay: `${Math.min(indice, 6) * 50}ms` }}
              onClick={() => setFotoAmpliada(foto)}
            >
              <img
                src={foto.imagen_url}
                alt="Evento en el que participamos"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {puedeAdministrar && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    manejarEliminarFoto(foto);
                  }}
                  aria-label="Eliminar foto"
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#CE1126]"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {fotoAmpliada && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 il-fade-in"
          onClick={() => setFotoAmpliada(null)}
        >
          <img
            src={fotoAmpliada.imagen_url}
            alt="Evento en el que participamos"
            className="il-scale-in max-h-[85vh] max-w-full rounded-xl object-contain"
          />
        </div>
      )}
    </Reveal>
  );
}