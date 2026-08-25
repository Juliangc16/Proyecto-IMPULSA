"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@lib/client";
import { BLOQUES } from "@/lib/diagnostico/preguntas";
import { calcularDiagnostico } from "@/lib/diagnostico/motor";

const COLORES_SEMAFORO = {
  verde: { emoji: "🟢", texto: "text-green-700", fondo: "bg-green-50", borde: "border-green-300" },
  amarillo: { emoji: "🟡", texto: "text-yellow-700", fondo: "bg-yellow-50", borde: "border-yellow-300" },
  rojo: { emoji: "🔴", texto: "text-[#CE1126]", fondo: "bg-red-50", borde: "border-red-300" },
  gris: { emoji: "⚪", texto: "text-stone-500", fondo: "bg-stone-50", borde: "border-stone-300" },
};

export default function DiagnosticoForm({ usuario }) {
  const [pasoActual, setPasoActual] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState(null);

  const totalPasos = BLOQUES.length;
  const bloque = BLOQUES[pasoActual];
  const progreso = Math.round(((pasoActual + 1) / totalPasos) * 100);

  const actualizarRespuesta = (id, valor) => {
    setRespuestas((prev) => ({ ...prev, [id]: valor }));
  };

  const alternarMulti = (id, opcion, max) => {
    setRespuestas((prev) => {
      const actual = prev[id] ?? [];
      const yaSeleccionada = actual.includes(opcion);
      let nuevo;
      if (yaSeleccionada) {
        nuevo = actual.filter((o) => o !== opcion);
      } else {
        if (max && actual.length >= max) return prev;
        nuevo = [...actual, opcion];
      }
      return { ...prev, [id]: nuevo };
    });
  };

  const siguiente = () => setPasoActual((p) => Math.min(p + 1, totalPasos - 1));
  const anterior = () => setPasoActual((p) => Math.max(p - 1, 0));

  const enviar = async () => {
    setEnviando(true);
    setError("");
    try {
      const calculo = calcularDiagnostico(respuestas);
      setResultado(calculo);

      const supabase = createClient();
      const { error: errorGuardar } = await supabase.from("diagnosticos").insert({
        usuario_id: usuario?.id ?? null,
        respuestas,
        perfil: calculo.perfil,
        madurez: calculo.madurez,
        validacion: calculo.validacion,
        viabilidad: calculo.viabilidad,
        traccion: calculo.traccion,
        potencial: calculo.potencial,
        semaforo: calculo.semaforo,
        fortaleza_principal: calculo.fortalezaPrincipal,
        reto_principal: calculo.retoPrincipal,
        ruta: calculo.ruta,
        profesor_recomendado: calculo.profesorRecomendado,
        objetivo_90_dias: calculo.objetivo90dias,
      });

      if (errorGuardar) {
        // El resultado ya se muestra igual; solo avisamos que no quedó guardado.
        setError("Tu resultado se calculó, pero no se pudo guardar en el sistema. Muéstraselo a tu mentor si es necesario.");
      }
    } catch (e) {
      setError("Ocurrió un problema calculando tu diagnóstico. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  const esUltimoPaso = pasoActual === totalPasos - 1;

  if (resultado) {
    return <PantallaResultado resultado={resultado} error={error} />;
  }

  return (
    <div className="min-h-screen bg-stone-50 text-[#020201] font-inter">
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-montserrat font-bold text-[#020201]">
          ← IMPULSA LAB
        </Link>
        <span className="text-xs text-stone-400">
          Paso {pasoActual + 1} de {totalPasos}
        </span>
      </header>

      <div className="w-full h-2 bg-stone-200">
        <div
          className="h-2 bg-[#FCC21B] transition-all duration-300"
          style={{ width: `${progreso}%` }}
        />
      </div>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl md:text-3xl font-extrabold font-montserrat text-[#020201] mb-2 text-center">
          ¿Qué clase de emprendedor soy?
        </h1>
        <p className="text-stone-600 text-sm text-center mb-8">
          Este diagnóstico no busca calificarte. Busca entender en qué etapa
          está tu emprendimiento y cuál es tu siguiente paso.
        </p>

        <h2 className="font-montserrat font-bold text-lg text-[#003893] mb-4">
          {bloque.titulo}
        </h2>

        <div className="space-y-8">
          {bloque.preguntas.map((p) => (
            <PreguntaCampo
              key={p.id}
              pregunta={p}
              valor={respuestas[p.id]}
              onCambiar={(v) => actualizarRespuesta(p.id, v)}
              onAlternarMulti={(opcion) => alternarMulti(p.id, opcion, p.max)}
            />
          ))}
        </div>

        {error && !resultado && <p className="text-sm text-[#CE1126] mt-6">{error}</p>}

        <div className="flex items-center justify-between mt-10">
          <button
            type="button"
            onClick={anterior}
            disabled={pasoActual === 0}
            className="rounded-xl px-4 py-3 text-stone-500 font-medium transition hover:text-[#020201] disabled:opacity-0"
          >
            ← Anterior
          </button>

          {!esUltimoPaso ? (
            <button
              type="button"
              onClick={siguiente}
              className="rounded-xl bg-[#003893] px-6 py-3 text-white font-semibold font-montserrat tracking-wide transition hover:bg-[#003893]/90"
            >
              Siguiente →
            </button>
          ) : (
            <button
              type="button"
              onClick={enviar}
              disabled={enviando}
              className="rounded-xl bg-[#FCC21B] px-6 py-3 text-[#020201] font-semibold font-montserrat tracking-wide transition hover:bg-[#FCC21B]/90 disabled:opacity-60"
            >
              {enviando ? "Calculando..." : "Ver mi diagnóstico"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

function PreguntaCampo({ pregunta, valor, onCambiar, onAlternarMulti }) {
  if (pregunta.tipo === "texto") {
    return (
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">{pregunta.texto}</label>
        <textarea
          value={valor ?? ""}
          onChange={(e) => onCambiar(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003893]"
        />
      </div>
    );
  }

  if (pregunta.tipo === "escala") {
    return (
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">{pregunta.texto}</label>
        <div className="flex items-center gap-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onCambiar(n)}
              className={`w-10 h-10 rounded-full border-2 font-semibold transition ${
                Number(valor) === n
                  ? "bg-[#003893] border-[#003893] text-white"
                  : "border-stone-300 text-stone-500 hover:border-[#003893]"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (pregunta.tipo === "multi") {
    const seleccion = valor ?? [];
    return (
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">{pregunta.texto}</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {pregunta.opciones.map((op) => (
            <label
              key={op}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition ${
                seleccion.includes(op)
                  ? "border-[#003893] bg-[#003893]/5"
                  : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <input
                type="checkbox"
                checked={seleccion.includes(op)}
                onChange={() => onAlternarMulti(op)}
                className="accent-[#003893]"
              />
              {op}
            </label>
          ))}
        </div>
      </div>
    );
  }

  // single
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-2">{pregunta.texto}</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {pregunta.opciones.map((op) => (
          <label
            key={op}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition ${
              valor === op ? "border-[#003893] bg-[#003893]/5" : "border-stone-200 hover:border-stone-300"
            }`}
          >
            <input
              type="radio"
              checked={valor === op}
              onChange={() => onCambiar(op)}
              className="accent-[#003893]"
            />
            {op}
          </label>
        ))}
      </div>
    </div>
  );
}

function PantallaResultado({ resultado, error }) {
  const dimensionesOrden = [
    ["idea", "💡 Idea y oportunidad"],
    ["problema", "🎯 Problema"],
    ["cliente", "👤 Cliente"],
    ["validacion", "🧪 Validación"],
    ["modelo", "💰 Modelo de negocio"],
    ["ventas", "🛒 Ventas y tracción"],
    ["ejecucion", "⚙️ Capacidad de ejecución"],
    ["potencial", "🚀 Potencial de crecimiento"],
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-[#020201] font-inter">
      <header className="bg-white border-b border-stone-200 px-6 py-4">
        <Link href="/" className="font-montserrat font-bold text-[#020201]">
          ← IMPULSA LAB
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        <div className="text-center space-y-2">
          <p className="text-sm uppercase tracking-widest text-[#003893] font-bold">Tu mapa emprendedor</p>
          <h1 className="text-3xl font-extrabold font-montserrat">{resultado.perfil}</h1>
          {resultado.contradiccion && (
            <p className="text-xs text-[#CE1126] max-w-md mx-auto">
              Notamos que tu percepción de la etapa va más adelantada que la evidencia real
              (validación y tracción todavía bajas). Este diagnóstico se basa en la evidencia.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Indicador etiqueta="Madurez" valor={resultado.madurez} />
          <Indicador etiqueta="Validación" valor={resultado.validacion} />
          <Indicador etiqueta="Viabilidad" valor={resultado.viabilidad} />
          <Indicador etiqueta="Tracción" valor={resultado.traccion} />
          <Indicador etiqueta="Potencial" valor={resultado.potencial} />
          <Indicador etiqueta="Ejecución" valor={resultado.capacidadEjecucion} />
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3">
          <h2 className="font-montserrat font-bold text-base">🚦 Mi semáforo emprendedor</h2>
          <div className="space-y-2">
            {dimensionesOrden.map(([clave, etiqueta]) => {
              const dato = resultado.semaforo[clave];
              const color = COLORES_SEMAFORO[dato.estado];
              return (
                <div
                  key={clave}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${color.fondo} ${color.borde}`}
                >
                  <span>{etiqueta}</span>
                  <span className={`font-semibold ${color.texto}`}>{color.emoji}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <h3 className="font-montserrat font-bold text-sm text-[#003893] mb-1">Tu principal fortaleza</h3>
            <p className="text-sm text-stone-600">{resultado.fortalezaPrincipal}</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <h3 className="font-montserrat font-bold text-sm text-[#CE1126] mb-1">Tu principal desafío</h3>
            <p className="text-sm text-stone-600">{resultado.retoPrincipal}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <h3 className="font-montserrat font-bold text-sm mb-2">Ruta recomendada</h3>
          <ol className="list-decimal list-inside text-sm text-stone-600 space-y-1">
            {resultado.ruta.map((paso) => (
              <li key={paso}>{paso}</li>
            ))}
          </ol>
        </div>

        <div className="bg-[#FCC21B]/10 border-2 border-[#FCC21B] rounded-2xl p-5 space-y-2">
          <h3 className="font-montserrat font-bold text-sm">Acompañamiento recomendado</h3>
          <p className="text-sm text-stone-700">{resultado.profesorRecomendado}</p>
          <h3 className="font-montserrat font-bold text-sm pt-2">Tu meta de 90 días</h3>
          <p className="text-sm text-stone-700">{resultado.objetivo90dias}</p>
        </div>

        {error && <p className="text-sm text-[#CE1126] text-center">{error}</p>}

        <div className="text-center pt-4">
          <Link
            href="/"
            className="inline-block rounded-xl bg-[#003893] px-6 py-3 text-white font-semibold font-montserrat tracking-wide transition hover:bg-[#003893]/90"
          >
            Volver al inicio
          </Link>
        </div>
      </main>
    </div>
  );
}

function Indicador({ etiqueta, valor }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-3 text-center">
      <p className="text-2xl font-extrabold font-montserrat text-[#003893]">{valor}</p>
      <p className="text-xs text-stone-500">{etiqueta}/100</p>
    </div>
  );
}
