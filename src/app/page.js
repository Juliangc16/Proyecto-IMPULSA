"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@lib/client";
import TarjetasCarousel from "@/components/home/TarjetasCarousel";
import VideoEmprendedores from "@/components/home/VideoEmprendedores";
import PanelAcademico from "@/components/home/PanelAcademico";

const URL_CUADRO_AMARILLO = "/que-clase-de-emprendedor-soy";
const URL_CUADRO_AZUL = "https://forms.cloud.microsoft/r/zz5CaG15Kq";
const URL_CUADRO_ROJO = "/Noticias";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [frase, setFrase] = useState({ texto: "", autor: "" });
  const [usuario, setUsuario] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [avisoLogin, setAvisoLogin] = useState(false);
  const [mostrarTarjetaUsuario, setMostrarTarjetaUsuario] = useState(false);

  const menuUsuarioRef = useRef(null);

  const frasesMotivadoras = [
    { texto: "El único modo de hacer un gran trabajo es amar lo que haces.", autor: "Steve Jobs" },
    { texto: "Estar preparado es importante, saber esperarlo lo es aún más.", autor: "Arthur Schnitzler" },
    { texto: "No todos los que trabajan duro son recompensados, pero todos los que son alguien han trabajado duro.", autor: "Genji Kamogawa" }
  ];

  const enlacesNavegacion = [
    { label: "¿Quiénes somos?",href: "#Quienes_somos"},
    { label: "¿Qué hacemos?", href: "#Que_hacemos" },
    { label: "¿Cuál es nuestro propósito?", href: "#nuestro_proposito" }
  ];

  const tarjetas = [
    {
      href: URL_CUADRO_AMARILLO,
      img: "imagenes/nuevaidea.jpeg",
      alt: "¿Qué clase de emprendedor soy?",
      badgeBg: "bg-[#FCC21B]",
      badgeText: "text-[#020201]",
      cardBg: "bg-[#FCC21B]/10",
      cardBorder: "border-[#FCC21B]",
      title: "¿Qué clase de emprendedor soy?",
      desc: "Descubre tu perfil emprendedor y las fortalezas que puedes aprovechar."
    },
    {
      href: URL_CUADRO_AZUL,
      img: "imagenes/emprendedor.jpeg",
      alt: "Mi idea comienza aquí",
      badgeBg: "bg-[#003893]",
      badgeText: "text-white",
      cardBg: "bg-[#003893]/10",
      cardBorder: "border-[#003893]",
      title: "Mi idea comienza aquí",
      desc: "Da el primer paso para convertir tu idea en un proyecto real.",
      publica: true,
      target: "_blank"
    },
    {
      href: URL_CUADRO_ROJO,
      img: "imagenes/noticias.jpeg",
      alt: "Noticias IMPULSA LAB",
      badgeBg: "bg-[#CE1126]",
      badgeText: "text-white",
      cardBg: "bg-[#CE1126]/10",
      cardBorder: "border-[#CE1126]",
      title: "Noticias",
      desc: "Entérate de las novedades, logros y actividades de IMPULSA LAB.",
      publica: true
    }
  ];

  useEffect(() => {
    const autor = "JULIAN";
    const marca = "magick";

    console.log(
      `%c🚀 Impulsa Web - Desarrollado por ${autor} (${marca})`,
      "color: #FCC21B; font-size: 16px; font-weight: bold; background-color: #020201; padding: 8px; border-radius: 4px;"
    );

    const fraseAleatoria = frasesMotivadoras[Math.floor(Math.random() * frasesMotivadoras.length)];
    setFrase(fraseAleatoria);

    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUsuario(data?.user ?? null);
      setCargandoSesion(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_evento, session) => {
      setUsuario(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const manejarClicFuera = (evento) => {
      if (menuUsuarioRef.current && !menuUsuarioRef.current.contains(evento.target)) {
        setMostrarTarjetaUsuario(false);
      }
    };

    document.addEventListener("mousedown", manejarClicFuera);
    return () => document.removeEventListener("mousedown", manejarClicFuera);
  }, []);

  const manejarClicTarjeta = (evento, tarjeta) => {
    if (tarjeta?.publica) return;
    if (!usuario) {
      evento.preventDefault();
      setAvisoLogin(true);
    }
  };

  const manejarCerrarSesion = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUsuario(null);
    setMostrarTarjetaUsuario(false);
    router.push("/");
  };

  const verificarDerechos = () => {
    const k1 = "magick";
    const k2 = "julian";
    return Boolean(k1 && k2);
  };

  if (!verificarDerechos()) {
    if (typeof window !== "undefined") {
      window.location.replace("https://google.com");
    }
    return null;
  }

  if (loading) {
    return (
      <div className="fixed inset-0 w-screen h-screen bg-white grid place-items-center z-50 p-6 font-inter">
        <div className="max-w-2xl w-full text-center space-y-6 flex flex-col items-center justify-center">
          <p className="text-2xl md:text-3xl font-montserrat font-semibold italic text-[#020201] leading-relaxed">
            "{frase.texto}"
          </p>

          <p className="text-sm md:text-base tracking-widest text-[#CE1126] uppercase font-bold font-montserrat">
            — {frase.autor}
          </p>

          <div className="mt-4 w-10 h-10 border-4 border-stone-200 border-t-[#003893] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-[#020201] font-inter flex flex-col pt-20 md:pt-24">

      <div className="hidden pointer-events-none opacity-0 select-none" data-creator="julian-magick">
        IMPULSA LAB 2026 - Todos los derechos reservados.
      </div>

      <div 
        className="fixed top-0 left-0 w-full z-50 shadow-md"
        style={{ backgroundColor: "#ffffff" }}
      >
        <div className="w-full h-8 md:h-5 bg-white" aria-hidden="true"></div>

        <header 
          className="flex items-center justify-between gap-4 px-4 md:px-8 py-3 flex-wrap"
          style={{ backgroundColor: "#ffffff" }}
        >
          <div className="flex items-center shrink-0">
            <a href="https://universitariadecolombia.edu.co/"
              target="_blank"
              rel="noreferrer"
              className="transition hover:opacity-80 flex items-center shrink-0 -mt-[10px]"
            >
              <img
                src="imagenes/universitaria.png"
                alt="Institución Universitaria de Colombia"
                className="h-[40px] w-auto object-contain"
              />
            </a>

            <div style={{ width: "20px", minWidth: "20px" }} aria-hidden="true" />

            <div 
              className="h-7 bg-[#020201] rounded-full shrink-0" 
              style={{ width: "2px", minWidth: "2px" }}
            />

            <div style={{ width: "20px", minWidth: "20px" }} aria-hidden="true" />

            <div className="flex items-center shrink-0">
              <img
                src="imagenes/logoIMPULSALAB.png"
                alt="Logo Impulsa Lab"
                className="h-[40px] w-auto object-contain"
              />
            </div>
          </div>

          <nav className="flex items-center justify-center flex-wrap gap-4 md:gap-10 font-montserrat text-sm flex-1 min-w-0 my-auto">
            {enlacesNavegacion.map((item, index) => (
              <a key={index}
                href={item.href}
                className="text-[#020201] hover:text-[#003893] font-medium transition-colors duration-300 whitespace-nowrap"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {usuario ? (
            <div className="relative shrink-0" ref={menuUsuarioRef}>
              <button
                onClick={() => setMostrarTarjetaUsuario((valor) => !valor)}
                className="text-sm font-semibold text-[#020201] hover:text-[#003893] transition-colors whitespace-nowrap"
              >
                Hola, {usuario.user_metadata?.nombre ?? usuario.email}
              </button>

              {mostrarTarjetaUsuario && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-black/10 p-4 z-50 text-left">
                  <p className="font-montserrat font-bold text-sm text-[#020201]">
                    {usuario.user_metadata?.nombre ?? "Sin nombre registrado"}
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5 break-all">
                    {usuario.email}
                  </p>

                  <div className="mt-3 pt-3 border-t border-stone-100">
                    {usuario.user_metadata?.tieneIdeaNegocio ? (
                      <>
                        <p className="text-xs font-medium text-stone-500 mb-1">
                          Idea de negocio
                        </p>
                        <p className="text-sm font-semibold text-[#003893]">
                          {usuario.user_metadata?.nombreEmprendimiento}
                        </p>
                      </>
                    ) : (
                      <a target="_blank" rel="noreferrer" href={URL_CUADRO_AZUL}
                        className="block text-sm font-semibold text-[#003893] hover:underline"
                      >
                        ¿Quieres crear una idea de negocio?
                      </a>
                    )}
                  </div>

                  <button
                    onClick={manejarCerrarSesion}
                    className="mt-4 w-full text-sm font-medium text-[#CE1126] hover:text-[#CE1126]/80 transition-colors text-center"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 shrink-0 group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-9 h-9 text-stone-400 group-hover:text-[#003893] transition-colors"
              >
                <path
                  fillRule="evenodd"
                  d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium text-stone-500 group-hover:text-[#003893] transition-colors whitespace-nowrap">
                ¿Iniciar sesión?
              </span>
            </Link>
          )}
        </header>

        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] flex flex-col">
          <div className="w-full h-[6px] bg-[#FCC21B]"></div>
          <div className="w-full h-[4.5px] bg-[#003893]"></div>
          <div className="w-full h-[4.5px] bg-[#CE1126]"></div>
        </div>

      </div>

      <main className="flex-1 flex flex-col items-center px-6 py-8 gap-10">
        <section className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold font-montserrat text-[#020201] tracking-tight leading-tight">
            Bienvenidos a IMPULSA LAB
          </h1>

          <p className="text-stone-600 text-base md:text-lg leading-relaxed font-inter max-w-xl mx-auto text-center">
            Transformamos ideas estudiantiles en negocios reales, sostenibles y conectados con el entorno empresarial.
          </p>
        </section>

        <section className="w-full">
          <TarjetasCarousel tarjetas={tarjetas} onClickTarjeta={manejarClicTarjeta} />
        </section>
      </main>

      <PanelAcademico usuario={usuario} />

      <section id="Nuestros-emprendedores">
        <div className="px-6 py-8">
          <VideoEmprendedores usuario={usuario} />
        </div>
      </section>

<hr className="w-[98%] mx-auto"/> 
      <section id= "Quienes_somos">   
        <div className="px-6 py-8 text-center">   
          <h2 className="font-montserrat font-bold text-base text-[#020201] mb-2">
              Quienes somos
          </h2>
          <p>
            <strong>IMPULSA LAB</strong> es el laboratorio de emprendimiento universitario diseñado para trasformar el talento, creatividad y el potencial de los estudiantes en emprendimientos sostenibles y de alto impacto. Somos un espacio de inovacion, aprendizaje y colaboracion donde atraves de una metologia estructura, mentorias especializadas, brindamos a los estudiantes las herramientas necesarias para diseñar, validar, lanzar y escalar sus proyectos emprendedores. En IMPULSA LAB creemos que cada idea tiene el potencial de generar valor, impacto social y desarrollo economico cuando recibe el apoyo adecuado.
          </p>
      </div>   
      </section> 
<hr className="w-[98%] mx-auto my-6"/> 
      <section id= "Que_hacemos">
        <div className="PX-6 PY-8 text-center">
          <h2 className="font-montserrat font-bold text-base text-[#020201] mb-2">
            Que hacemos
          </h2>
          <p>
            En <strong>IMPULSA LAB</strong> impulsamos el desarrollo de emprendedores desde la etapa de la idea hasta la consolidación de negocios reales, acompañamos a los estudiantes en todo su proceso emprendedor mediante programas de formación, talleres prácticos, mentorias perosonalizadas, vlaidacion de modelos de negocio, desarrollo de prototipos, conexión con aliados estratégicos y espacios de networking.
          </p>
        </div>
      </section>
<hr className="w-[98%] mx-auto my-6"/>     
      <section id= "nuestro_proposito">
          <div className="PX-6 PY-8 text-center">
            <h2 className="font-montserrat font-bold text-base text-[#020201] mb-2">
              ¿Cual es nuestro proposito?
            </h2>
            <p>
              Nuestro proposito es formar una nueva generacion de emprendedores capaces de transformar sus ideas en empresas exitosas, innovadoras y sostenibles, buscamos despertar el espíritu emprendedor de los estudiantes, fortalecer sus competencias y proporcionales el acompañamiento necesario para que conviertan el conocimiento en oportunidades de negocio.
            </p>
          </div>
      </section>
      <hr className="w-[98%] mx-auto my-6"/> 
      <footer className="mt-auto border-t border-stone-200/50 bg-white">
        <div className="px-6 py-8 text-center">
          <h4 className="font-montserrat font-bold text-base text-[#020201] mb-2">
            Contáctenos
          </h4>
          <p className="text-stone-600 text-sm leading-relaxed font-inter max-w-md mx-auto">
            Escríbenos a{" "}
            <a href="mailto:impulsalab@universitariadecolombia.edu.co" className="text-[#003893] font-medium hover:underline">
              impulsalab@universitariadecolombia.edu.co
            </a>{" "}
            o comunícate con nosotros a través de nuestras redes sociales.
          </p>
        </div>
        <div className="py-4 text-center text-xs text-stone-400 font-inter border-t border-stone-200/50">
          © 2026 IMPULSA LAB — Institución Universitaria de Colombia
        </div>
      </footer>

      {avisoLogin && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-[#003893]/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-[#003893]">
                <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="font-montserrat font-bold text-lg text-[#020201]">
              Debes iniciar sesión
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Para continuar necesitas iniciar sesión o crear una cuenta en IMPULSA LAB.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => router.push("/login")}
                className="w-full rounded-xl bg-[#003893] px-4 py-3 text-white font-semibold font-montserrat tracking-wide transition hover:bg-[#003893]/90"
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => setAvisoLogin(false)}
                className="w-full rounded-xl px-4 py-3 text-stone-500 font-medium transition hover:text-[#020201]"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}