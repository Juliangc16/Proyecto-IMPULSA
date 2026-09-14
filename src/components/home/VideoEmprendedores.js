"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@lib/client";
import { esDirectorOAdministrador } from "@/lib/roles";

const SECCION_VIDEO = "nuestros_emprendedores";

// Extrae el ID de video de YouTube sin importar el formato del link:
// watch?v=, youtu.be/, shorts/, embed/ o live/. Esto es lo que faltaba
// para que los YouTube Shorts funcionaran (no era un problema de la
// base de datos, sino que el link de un Short no se reconocía aquí).
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
  const [video, setVideo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [anchoInput, setAnchoInput] = useState(640);
  const [altoInput, setAltoInput] = useState(360);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const panelRef = useRef(null);
  const puedeAdministrar = esDirectorOAdministrador(usuario);

  useEffect(() => {
    const supabase = createClient();

    supabase
      .from("videos_home")
      .select("*")
      .eq("seccion", SECCION_VIDEO)
      .maybeSingle()
      .then(({ data }) => {
        setVideo(data ?? null);
        if (data) {
          setUrlInput(data.url);
          setAnchoInput(data.ancho);
          setAltoInput(data.alto);
        }
        setCargando(false);
      });
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

    const { data, error: errorGuardado } = await supabase
      .from("videos_home")
      .upsert(
        {
          seccion: SECCION_VIDEO,
          url: urlInput.trim(),
          ancho,
          alto,
          actualizado_por: usuario?.id ?? null,
          actualizado_en: new Date().toISOString(),
        },
        { onConflict: "seccion" }
      )
      .select()
      .single();

    setGuardando(false);

    if (errorGuardado) {
      setError("No se pudo guardar el video. Inténtalo de nuevo.");
      return;
    }

    setVideo(data);
    setMostrarFormulario(false);
  };

  const manejarQuitar = async () => {
    setGuardando(true);
    const supabase = createClient();
    await supabase.from("videos_home").delete().eq("seccion", SECCION_VIDEO);
    setGuardando(false);
    setVideo(null);
    setUrlInput("");
    setMostrarFormulario(false);
  };

  if (cargando) return null;

  const urlEmbed = video ? obtenerUrlEmbed(video.url) : null;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative inline-flex items-center gap-3" ref={panelRef}>
        <h2 className="text-3xl md:text-4xl font-extrabold font-montserrat text-[#020201] tracking-tight leading-tight">
          Nuestros emprendedores
        </h2>

        {puedeAdministrar && (
          <button
            type="button"
            onClick={() => setMostrarFormulario((v) => !v)}
            title={video ? "Cambiar video" : "Agregar video"}
            className="w-7 h-7 rounded-full bg-[#003893] text-white text-lg leading-none flex items-center justify-center hover:bg-[#003893]/90 transition-colors shrink-0"
          >
            +
          </button>
        )}

        {mostrarFormulario && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-80 bg-white rounded-2xl shadow-xl border border-black/10 p-4 z-50 text-left">
            <p className="font-montserrat font-bold text-sm text-[#020201] mb-3">
              {video ? "Cambiar video" : "Agregar video"}
            </p>

            <form onSubmit={manejarGuardar} className="space-y-3">
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

                    // Si es un Short (formato vertical) y el usuario no ha
                    // tocado las medidas todavía, sugerimos un tamaño
                    // vertical automáticamente para que se vea bien.
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
                  {guardando ? "Guardando..." : "Guardar"}
                </button>

                {video && (
                  <button
                    type="button"
                    onClick={manejarQuitar}
                    disabled={guardando}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-[#CE1126] hover:bg-[#CE1126]/5"
                  >
                    Quitar
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>

      {video && urlEmbed && (
        <div className="flex justify-center w-full px-4">
          {esVideoDirecto(video.url) ? (
            <video
              src={video.url}
              controls
              style={{ width: `${video.ancho}px`, height: `${video.alto}px`, maxWidth: "100%" }}
              className="rounded-xl shadow-md bg-black"
            />
          ) : (
            <iframe
              src={urlEmbed}
              style={{ width: `${video.ancho}px`, height: `${video.alto}px`, maxWidth: "100%" }}
              className="rounded-xl shadow-md"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Video de IMPULSA LAB"
            />
          )}
        </div>
      )}
    </div>
  );
}