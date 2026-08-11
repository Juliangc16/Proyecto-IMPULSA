"use client";
import { useEffect, useState } from "react";

const URL_CUADRO_AMARILLO = "/que-clase-de-emprendedor-soy";
const URL_CUADRO_AZUL = "https://forms.cloud.microsoft/r/zz5CaG15Kq";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [frase, setFrase] = useState({ texto: "", autor: "" });

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
      desc: "Da el primer paso para convertir tu idea en un proyecto real."
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

  // PANTALLA DE CARGA (LOADER)
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

      {/* Marca de agua / Metadatos */}
      <div className="hidden pointer-events-none opacity-0 select-none" data-creator="julian-magick">
        IMPULSA LAB 2026 - Todos los derechos reservados.
      </div>

      {/* CABECERA FIJA CON FONDO BLANCO SÓLIDO */}
      <div 
        className="fixed top-0 left-0 w-full z-50 shadow-md"
        style={{ backgroundColor: "#ffffff" }}
      >
        {/* ESPACIADOR INVISIBLE DE SEGURIDAD (Empuja el contenido hacia abajo sin que se note visualmente, garantizando que el "Bienvenidos" nunca quede oculto detrás de la cabecera fija) */}
        <div className="w-full h-8 md:h-5 bg-white" aria-hidden="true"></div>

        {/* LOGOS Y MENÚ */}
        <header 
          className="flex items-center justify-between px-8 py-3"
          style={{ backgroundColor: "#ffffff" }}
        >
          {/* CONTENEDOR DE LOGOS: Logo de la universidad ajustado 0.5 cm más hacia abajo (-10px) */}
          <div className="flex items-center shrink-0">
            <a
              href="https://universitariadecolombia.edu.co/"
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

          {/* NAVEGACIÓN: Centrados verticalmente, separados del logo de Impulsa por un margen izquierdo de ~5 cm (ml-[5cm]), separacion de 5cm entre enlaces y espacio para login */}
          <nav className="flex items-center justify-end gap-[5cm] font-montserrat text-sm ml-[5cm] mr-[5cm] my-auto">
            {enlacesNavegacion.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="text-[#020201] hover:text-[#003893] font-medium transition-colors duration-300 whitespace-nowrap"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </header>

        {/* FRANJAS APILADAS DE BORDE A BORDE */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] flex flex-col">
          <div className="w-full h-[6px] bg-[#FCC21B]"></div>
          <div className="w-full h-[4.5px] bg-[#003893]"></div>
          <div className="w-full h-[4.5px] bg-[#CE1126]"></div>
        </div>

      </div>

      {/* CUERPO PRINCIPAL */}
      <main className="flex-1 flex flex-col items-center px-6 py-8 gap-10">
        <section className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold font-montserrat text-[#020201] tracking-tight leading-tight">
            Bienvenidos a IMPULSA LAB
          </h1>

          <p className="text-stone-600 text-base md:text-lg leading-relaxed font-inter max-w-xl mx-auto text-center">
            Transformamos ideas estudiantiles en negocios reales, sostenibles y conectados con el entorno empresarial.
          </p>
        </section>

        {/* TARJETAS LADO A LADO: Espaciado de ~5 cm entre cuadros */}
        <section className="flex flex-row justify-center items-stretch gap-[5cm] w-full max-w-5xl mx-auto">
          {tarjetas.map((t, index) => (
            <a
              key={index}
              href={t.href}
              className={`group ${t.cardBg} border-2 ${t.cardBorder} rounded-2xl p-4 flex flex-col items-center text-center transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer max-w-[240px] w-full`}
            >
              <div className="w-[200px] h-[200px] shrink-0 flex items-center justify-center overflow-hidden rounded-xl bg-white/50">
                <img
                  src={t.img}
                  alt={t.alt}
                  className="w-[200px] h-[200px] object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="mt-4 flex flex-col items-center gap-2 w-full pt-2 border-t border-black/5">
                <span className={`${t.badgeBg} ${t.badgeText} px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider`}>
                  Destacado
                </span>
                <h3 className="font-montserrat font-bold text-sm text-[#020201] leading-tight">
                  {t.title}
                </h3>
                <p className="text-stone-600 text-xs leading-relaxed font-inter">
                  {t.desc}
                </p>
              </div>
            </a>
          ))}
        </section>
      </main>

      <section id="Nuestros-emprendedore">
          <div className="px-6 py-8 text-center ">
          <h2 className="text-3xl md:text-4xl font-extrabold font-montserrat text-[#020201] tracking-tight leading-tight">Nuestros emprendedores</h2>
          </div>
      </section>
<hr className="my-12 border-0 border-t border-black-300"/> 
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
<hr className="my-12 border-0 border-t border-black-300"/> 
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
<hr className="my-12 border-0 border-t border-black-300"/>     
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
      {/* FOOTER */}
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
    </div>
  );
}