"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@lib/client";
import { esDirectorOAdministrador } from "@/lib/roles";

const SECCION_VIDEO = "nuestros_emprendedores";

// Extrae el ID de video de YouTube sin importar el formato del link:
// watch?v=, youtu.be/, shorts/, embed/ o live/.
function obtenerIdYoutube(url) {
  if (!url) return null;

  const patrones = [
    /youtube\.com\/watch\?[^#]*\bv=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const patron of patrones) {
    const coincidencia = url.match(patron);
    if (coincidencia) return coincidencia[1];
  }

  return null;
}

export function esShortDeYoutube(url) {
  return /youtube\.com\/shorts\//i.test(url || "");
}

function obtenerUrlEmbed(url) {
  if (!url) return null;

  const idYoutube = obtenerIdYoutube(url);
  if (idYoutube) {
    return `https://www.youtube.com/embed/${idYoutube}`;
  }

  try {
    const u = new URL(url);

    if (u.hostname.includes("vimeo.com") && !u.pathname.startsWith("/video/")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (id) return `https://player.vimeo.com/video/${id}`;
    }

    return url;
  } catch {
    return url;
  }
}

function esVideoDirecto(url) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url || "");
}

export default function VideoEmprendedores({ usuario }) {
  const [videos, setVideos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [indice, setIndice] = useState(0);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [tituloInput, setTituloInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [anchoInput, setAnchoInput] = useState(640);
  const [altoInput, setAltoInput] = useState(360);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const panelRef = useRef(null);
  const puedeAdministrar = esDirectorOAdministrador(usuario);

  const cargarVideos = async () => {
    setCargando(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("videos_home")
      .select("*")
      .eq("seccion", SECCION_VIDEO)
      .order("creado_en", { ascending: false });

    setVideos(data ?? []);
    setCargando(false);
  };

  useEffect(() => {
    cargarVideos();
  }, []);

  useEffect(() => {
    const manejarClicFuera = (evento) => {
      if (panelRef.current && !panelRef.current.contains(evento.target)) {
        setMostrarFormulario(false);
      }
    };
    document.addEventListener("mousedown", manejarClicFuera);
    return () => document.removeEventListener("mousedown", manejarClicFuera);
  }, []);

  const limpiarFormulario = () => {
    setTituloInput("");
    setUrlInput("");
    setAnchoInput(640);
    setAltoInput(360);
    setError(null);
  };

  const manejarGuardar = async (evento) => {
    evento.preventDefault();
    setError(null);

    if (!urlInput.trim()) {
      setError("Pega el link del video.");
      return;
    }

    const ancho = Number(anchoInput) || 640;
    const alto = Number(altoInput) || 360;

    setGuardando(true);
    const supabase = createClient();

    // Siempre insertamos un video NUEVO (nunca reemplazamos uno existente),
    // así se pueden acumular tantos videos como se quiera en esta sección.
    const { error: errorGuardado } = await supabase.from("videos_home").insert({
      seccion: SECCION_VIDEO,
      titulo: tituloInput.trim() || null,
      url: urlInput.trim(),
      ancho,
      alto,
      actualizado_por: usuario?.id ?? null,
      actualizado_en: new Date().toISOString(),
    });

    setGuardando(false);

    if (errorGuardado) {
      console.error("Error al guardar video:", errorGuardado);
      setError(
        `No se pudo guardar el video: ${errorGuardado.message ?? "error desconocido"}`
      );
      return;
    }

    limpiarFormulario();
    setMostrarFormulario(false);
    await cargarVideos();
    setIndice(0);
  };

  const manejarEliminar = async (video) => {
    if (!window.confirm("¿Eliminar este video de la sección?")) return;

    const supabase = createClient();
    await supabase.from("videos_home").delete().eq("id", video.id);
    setIndice(0);
    await cargarVideos();
  };

  if (cargando) return null;

  const total = videos.length;
  const videoActual = total > 0 ? videos[indice] : null;
  const urlEmbed = videoActual ? obtenerUrlEmbed(videoActual.url) : null;

  const anterior = () => setIndice((i) => (i - 1 + total) % total);
  const siguiente = () => setIndice((i) => (i + 1) % total);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative inline-flex items-center gap-3" ref={panelRef}>
        <h2 className="text-3xl md:text-4xl font-extrabold font-montserrat text-[#020201] tracking-tight leading-tight">
          Nuestros emprendedores
        </h2>

        {puedeAdministrar && (
          <button
            type="button"
            onClick={() => {
              limpiarFormulario();
              setMostrarFormulario((v) => !v);
            }}
            title="Agregar video"
            className="w-7 h-7 rounded-full bg-[#003893] text-white text-lg leading-none flex items-center justify-center hover:bg-[#003893]/90 transition-colors shrink-0"
          >
            +
          </button>
        )}

        {mostrarFormulario && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-80 bg-white rounded-2xl shadow-xl border border-black/10 p-4 z-50 text-left">
            <p className="font-montserrat font-bold text-sm text-[#020201] mb-3">
              Agregar video
            </p>

            <form onSubmit={manejarGuardar} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">
                  Título (opcional)
                </label>
                <input
                  type="text"
                  value={tituloInput}
                  onChange={(e) => setTituloInput(e.target.value)}
                  placeholder="Ej. Emprendimiento de María"
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#003893]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">
                  Link del video (YouTube, Vimeo o .mp4)
                </label>
                <input
                  type="url"
                  required
                  value={urlInput}
                  onChange={(e) => {
                    const valor = e.target.value;
                    setUrlInput(valor);

                    if (
                      esShortDeYoutube(valor) &&
                      Number(anchoInput) === 640 &&
                      Number(altoInput) === 360
                    ) {
                      setAnchoInput(360);
                      setAltoInput(640);
                    }
                  }}
                  placeholder="https://youtube.com/watch?v=... o .../shorts/..."
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#003893]"
                />
                {esShortDeYoutube(urlInput) && (
                  <p className="mt-1 text-[11px] text-stone-500">
                    Detectamos un YouTube Short: te sugerimos un tamaño vertical (360×640).
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-stone-500 mb-1">
                    Ancho (px)
                  </label>
                  <input
                    type="number"
                    min="200"
                    max="1200"
                    value={anchoInput}
                    onChange={(e) => setAnchoInput(e.target.value)}
                    className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#003893]"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-stone-500 mb-1">
                    Alto (px)
                  </label>
                  <input
                    type="number"
                    min="150"
                    max="800"
                    value={altoInput}
                    onChange={(e) => setAltoInput(e.target.value)}
                    className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#003893]"
                  />
                </div>
              </div>

              {error && <p className="text-xs text-[#CE1126]">{error}</p>}

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 rounded-lg bg-[#003893] px-3 py-2 text-white text-sm font-semibold hover:bg-[#003893]/90 disabled:opacity-60"
                >
                  {guardando ? "Guardando..." : "Agregar video"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {total === 0 && (
        <p className="text-stone-500 text-sm">Todavía no hay videos en esta sección.</p>
      )}

      {total > 0 && (
        <div className="relative flex flex-col items-center w-full">
          <div className="relative flex justify-center w-full px-4">
            {total > 1 && (
              <button
                type="button"
                onClick={anterior}
                aria-label="Video anterior"
                className="absolute left-0 md:-left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border border-stone-200 shadow-lg flex items-center justify-center text-stone-500 hover:text-[#CE1126] hover:border-[#CE1126] hover:scale-105 transition-all"
              >
                <span className="text-2xl leading-none">‹</span>
              </button>
            )}

            <div className="flex flex-col items-center gap-2">
              {videoActual.titulo && (
                <p className="font-montserrat font-semibold text-sm text-stone-600">
                  {videoActual.titulo}
                </p>
              )}

              {esVideoDirecto(videoActual.url) ? (
                <video
                  src={videoActual.url}
                  controls
                  style={{
                    width: `${videoActual.ancho}px`,
                    height: `${videoActual.alto}px`,
                    maxWidth: "100%",
                  }}
                  className="rounded-xl shadow-md bg-black"
                />
              ) : (
                <iframe
                  src={urlEmbed}
                  style={{
                    width: `${videoActual.ancho}px`,
                    height: `${videoActual.alto}px`,
                    maxWidth: "100%",
                  }}
                  className="rounded-xl shadow-md"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Video de IMPULSA LAB"
                />
              )}

              {puedeAdministrar && (
                <button
                  type="button"
                  onClick={() => manejarEliminar(videoActual)}
                  className="text-xs font-semibold text-[#CE1126] hover:underline"
                >
                  Eliminar este video
                </button>
              )}
            </div>

            {total > 1 && (
              <button
                type="button"
                onClick={siguiente}
                aria-label="Siguiente video"
                className="absolute right-0 md:-right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border border-stone-200 shadow-lg flex items-center justify-center text-stone-500 hover:text-[#CE1126] hover:border-[#CE1126] hover:scale-105 transition-all"
              >
                <span className="text-2xl leading-none">›</span>
              </button>
            )}
          </div>

          {total > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4 flex-wrap max-w-md">
              {videos.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Ir al video ${i + 1}`}
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
    </div>
  );
}