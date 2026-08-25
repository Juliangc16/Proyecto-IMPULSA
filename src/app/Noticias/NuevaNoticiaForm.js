"use client";
import { useState } from "react";
import { createClient } from "@lib/client";

export default function NuevaNoticiaForm({ usuario, onCerrar, onPublicada }) {
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
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
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
            <label className="block text-sm font-medium text-stone-600 mb-1">
              Título
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003893]"
              placeholder="Título de la noticia"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">
              Contenido
            </label>
            <textarea
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              rows={5}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003893]"
              placeholder="Redacta aquí la noticia..."
            />
          </div>

          {/* Espacio para que el director/administrador ponga su propia imagen */}
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">
              Imagen (opcional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={manejarImagen}
              className="w-full text-sm"
            />
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
              className="flex-1 rounded-xl bg-[#CE1126] px-4 py-3 text-white font-semibold font-montserrat tracking-wide transition hover:bg-[#CE1126]/90 disabled:opacity-60"
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
