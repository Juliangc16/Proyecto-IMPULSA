"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@lib/client";
import { ROLES } from "@/lib/roles";
import Reveal from "@/components/ui/Reveal";

function formatearFecha(fecha) {
  if (!fecha) return "";
  return new Date(fecha).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function NoticiasHome({ usuario }) {
  const [noticias, setNoticias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [noticiaAbierta, setNoticiaAbierta] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [indice, setIndice] = useState(0);

  const rol = usuario?.user_metadata?.rol ?? null;
  const esAdministrador = rol === ROLES.ADMINISTRADOR;
  const total = noticias.length;

  const cargarNoticias = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("noticias")
      .select("*")
      .order("creado_en", { ascending: false })
      .limit(12);

    if (!error) setNoticias(data ?? []);
    setCargando(false);
  }, []);

  useEffect(() => {
    if (!esAdministrador) {
      setCargando(false);
      return;
    }
    cargarNoticias();
  }, [cargarNoticias, esAdministrador]);

  // Reinicia el índice si cambia el total de noticias (evita quedar fuera de rango).
  useEffect(() => {
    setIndice(0);
  }, [total]);

  // Avance automático: cada 10 segundos pasa a la siguiente noticia.
  useEffect(() => {
    if (total <= 1) return;
    const temporizador = setInterval(() => {
      setIndice((i) => (i + 1) % total);
    }, 10000);
    return () => clearInterval(temporizador);
  }, [total]);

  const anterior = () => setIndice((i) => (i - 1 + total) % total);
  const siguiente = () => setIndice((i) => (i + 1) % total);

  if (!esAdministrador) return null;
  if (cargando) return null;

  const noticiaActual = noticias[indice];

  return (
    <Reveal as="section" className="w-full max-w-3xl mx-auto px-2">
      <div className="flex items-center justify-between gap-3 mb-4 px-2">
        <h2 className="text-2xl md:text-3xl font-extrabold font-montserrat text-[#020201] tracking-tight">
          Noticias
        </h2>

        <button
          onClick={() => setMostrarFormulario(true)}
          className="il-hover-lift rounded-xl bg-[#CE1126] px-3 py-2 text-white text-xs md:text-sm font-semibold font-montserrat tracking-wide transition hover:bg-[#CE1126]/90"
        >
          + Agregar noticia
        </button>
      </div>

      {noticias.length === 0 ? (
        <p className="text-center text-stone-500 py-6">
          Todavía no hay noticias publicadas.
        </p>
      ) : (
        <div className="relative w-full max-w-xl mx-auto">
          {total > 1 && (
            <button
              type="button"
              onClick={anterior}
              aria-label="Noticia anterior"
              className="absolute -left-3 md:-left-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-11 md:h-11 rounded-full bg-white border border-stone-200 shadow-lg flex items-center justify-center text-stone-500 hover:text-[#CE1126] hover:border-[#CE1126] hover:scale-105 transition-all"
            >
              <span className="text-xl leading-none">‹</span>
            </button>
          )}

          <button
            key={noticiaActual.id}
            onClick={() => setNoticiaAbierta(noticiaActual)}
            className="il-fade-in il-hover-lift text-left w-full bg-white rounded-2xl border-2 border-[#CE1126]/20 overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300"
          >
            <div className="w-full aspect-video bg-stone-100 overflow-hidden">
              {noticiaActual.imagen_url ? (
                <img
                  src={noticiaActual.imagen_url}
                  alt={noticiaActual.titulo}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-300 text-sm">
                  Sin imagen
                </div>
              )}
            </div>
            <div className="p-4 space-y-1.5">
              <h3 className="font-montserrat font-bold text-sm text-[#020201] line-clamp-2">
                {noticiaActual.titulo}
              </h3>
              <p className="text-stone-600 text-xs leading-relaxed line-clamp-2">
                {noticiaActual.contenido}
              </p>
              <p className="text-[11px] text-stone-400 pt-1">
                {noticiaActual.autor_nombre ?? "IMPULSA LAB"} · {formatearFecha(noticiaActual.creado_en)}
              </p>
            </div>
          </button>

          {total > 1 && (
            <button
              type="button"
              onClick={siguiente}
              aria-label="Siguiente noticia"
              className="absolute -right-3 md:-right-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-11 md:h-11 rounded-full bg-white border border-stone-200 shadow-lg flex items-center justify-center text-stone-500 hover:text-[#CE1126] hover:border-[#CE1126] hover:scale-105 transition-all"
            >
              <span className="text-xl leading-none">›</span>
            </button>
          )}

          {total > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              {noticias.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Ir a la noticia ${i + 1}`}
                  onClick={() => setIndice(i)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    i === indice ? "w-6 bg-[#CE1126]" : "w-2.5 bg-stone-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {noticiaAbierta && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4 il-fade-in"
          onClick={() => setNoticiaAbierta(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="il-scale-in bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
          >
            {noticiaAbierta.imagen_url && (
              <img
                src={noticiaAbierta.imagen_url}
                alt={noticiaAbierta.titulo}
                className="w-full aspect-video object-cover rounded-t-2xl"
              />
            )}
            <div className="p-6 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-montserrat font-bold text-lg text-[#020201]">
                  {noticiaAbierta.titulo}
                </h3>
                <button
                  onClick={() => setNoticiaAbierta(null)}
                  className="text-stone-400 hover:text-[#020201] text-xl leading-none shrink-0"
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>
              <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
                {noticiaAbierta.contenido}
              </p>
              <p className="text-xs text-stone-400 pt-2">
                {noticiaAbierta.autor_nombre ?? "IMPULSA LAB"} ·{" "}
                {formatearFecha(noticiaAbierta.creado_en)}
              </p>
            </div>
          </div>
        </div>
      )}

      {mostrarFormulario && (
        <FormularioNoticia
          usuario={usuario}
          onCerrar={() => setMostrarFormulario(false)}
          onPublicada={cargarNoticias}
        />
      )}
    </Reveal>
  );
}

function FormularioNoticia({ usuario, onCerrar, onPublicada }) {
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [imagenArchivo, setImagenArchivo] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const manejarImagen = (e) => {
    const archivo = e.target.files?.[0] ?? null;
    setImagenArchivo(archivo);
    setImagenPreview(archivo ? URL.createObjectURL(archivo) : null);
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError("");

    if (!titulo.trim() || !contenido.trim()) {
      setError("El título y el contenido son obligatorios.");
      return;
    }

    setEnviando(true);
    const supabase = createClient();
    let imagenUrl = null;

    try {
      if (imagenArchivo) {
        const nombreArchivo = `${Date.now()}-${imagenArchivo.name}`;
        const { error: errorSubida } = await supabase.storage
          .from("noticias")
          .upload(nombreArchivo, imagenArchivo, { upsert: false });

        if (errorSubida) throw errorSubida;

        const { data: urlPublica } = supabase.storage
          .from("noticias")
          .getPublicUrl(nombreArchivo);

        imagenUrl = urlPublica?.publicUrl ?? null;
      }

      const { error: errorInsercion } = await supabase.from("noticias").insert({
        titulo: titulo.trim(),
        contenido: contenido.trim(),
        imagen_url: imagenUrl,
        autor_id: usuario?.id ?? null,
        autor_nombre: usuario?.user_metadata?.usuario ?? usuario?.email ?? "IMPULSA LAB",
      });

      if (errorInsercion) throw errorInsercion;

      onPublicada?.();
      onCerrar?.();
    } catch (err) {
      setError(err?.message ?? "No se pudo publicar la noticia. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4 il-fade-in">
      <div className="il-scale-in bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-montserrat font-bold text-lg text-[#020201]">
            Nueva noticia
          </h3>
          <button
            type="button"
            onClick={onCerrar}
            className="text-stone-400 hover:text-[#020201] text-xl leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <form onSubmit={manejarEnvio} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Título</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-[#003893]"
              placeholder="Título de la noticia"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Contenido</label>
            <textarea
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              rows={5}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-[#003893]"
              placeholder="Redacta aquí la noticia..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">
              Imagen (opcional)
            </label>
            <input type="file" accept="image/*" onChange={manejarImagen} className="w-full text-sm" />
            {imagenPreview && (
              <img
                src={imagenPreview}
                alt="Vista previa"
                className="mt-3 w-full max-h-48 object-cover rounded-lg border border-stone-200"
              />
            )}
          </div>

          {error && <p className="text-sm text-[#CE1126]">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={enviando}
              className="il-hover-lift flex-1 rounded-xl bg-[#CE1126] px-4 py-3 text-white font-semibold font-montserrat tracking-wide transition hover:bg-[#CE1126]/90 disabled:opacity-60"
            >
              {enviando ? "Publicando..." : "Publicar noticia"}
            </button>
            <button
              type="button"
              onClick={onCerrar}
              className="rounded-xl px-4 py-3 text-stone-500 font-medium transition hover:text-[#020201]"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}