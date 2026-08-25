"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@lib/client";
import { esDirectorOAdministrador } from "@/lib/roles";
import NuevaNoticiaForm from "./NuevaNoticiaForm";

export default function NoticiasPage() {
  const [usuario, setUsuario] = useState(null);
  const [noticias, setNoticias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const cargarNoticias = useCallback(async () => {
    setCargando(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("noticias")
      .select("*")
      .order("creado_en", { ascending: false });

    if (!error) setNoticias(data ?? []);
    setCargando(false);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUsuario(data?.user ?? null));
    cargarNoticias();
  }, [cargarNoticias]);

  const puedePublicar = esDirectorOAdministrador(usuario);

  return (
    <div className="min-h-screen bg-stone-50 text-[#020201] font-inter">
      {/* Encabezado simple con vuelta al inicio */}
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-montserrat font-bold text-[#020201]">
          ← IMPULSA LAB
        </Link>
        {puedePublicar && (
          <button
            onClick={() => setMostrarFormulario(true)}
            className="rounded-xl bg-[#CE1126] px-4 py-2 text-white text-sm font-semibold font-montserrat tracking-wide transition hover:bg-[#CE1126]/90"
          >
            + Agregar noticia
          </button>
        )}
      </header>

      <div className="w-full h-[6px] bg-[#FCC21B]" />
      <div className="w-full h-[4.5px] bg-[#003893]" />
      <div className="w-full h-[4.5px] bg-[#CE1126]" />

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl md:text-4xl font-extrabold font-montserrat text-[#020201] mb-8 text-center">
          Noticias IMPULSA LAB
        </h1>

        {cargando && (
          <p className="text-center text-stone-500">Cargando noticias...</p>
        )}

        {!cargando && noticias.length === 0 && (
          <p className="text-center text-stone-500">
            Todavía no hay noticias publicadas.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {noticias.map((noticia) => (
            <article
              key={noticia.id}
              className="bg-white border-2 border-[#CE1126]/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition"
            >
              {/* Espacio de imagen: se llena con la imagen que suba el director/administrador */}
              <div className="w-full aspect-video bg-stone-100 flex items-center justify-center overflow-hidden">
                {noticia.imagen_url ? (
                  <img
                    src={noticia.imagen_url}
                    alt={noticia.titulo}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-stone-300 text-sm">Sin imagen</span>
                )}
              </div>

              <div className="p-5 space-y-2">
                <h2 className="font-montserrat font-bold text-base text-[#020201]">
                  {noticia.titulo}
                </h2>
                <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
                  {noticia.contenido}
                </p>
                <p className="text-xs text-stone-400 pt-2">
                  {noticia.autor_nombre ?? "IMPULSA LAB"} ·{" "}
                  {noticia.creado_en
                    ? new Date(noticia.creado_en).toLocaleDateString("es-CO", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : ""}
                </p>
              </div>
            </article>
          ))}
        </div>
      </main>

      {mostrarFormulario && (
        <NuevaNoticiaForm
          usuario={usuario}
          onCerrar={() => setMostrarFormulario(false)}
          onPublicada={cargarNoticias}
        />
      )}
    </div>
  );
}
