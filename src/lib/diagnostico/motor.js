// Motor de diagnóstico emprendedor.
// Traduce las respuestas del formulario en:
// madurez, validación, viabilidad temprana, tracción, potencial de crecimiento,
// perfil, semáforo por dimensión, fortaleza, reto, ruta y objetivo de 90 días.
//
// Regla principal (del prompt): la EVIDENCIA real pesa más que la percepción
// del estudiante. Por eso el perfil no se calcula solo con "etapa_actual".

const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));

function indiceOpcion(opciones, valor) {
  const i = opciones.indexOf(valor);
  return i === -1 ? 0 : i;
}

export function calcularDiagnostico(respuestas) {
  const r = respuestas;

  // ---------- Señales base ----------
  const opcionesSituacion = [
    "No tengo una idea todavía, pero me interesa emprender",
    "Tengo una o varias ideas",
    "Tengo una idea que quiero desarrollar",
    "Estoy trabajando activamente en una idea",
    "Estoy probando mi solución con posibles clientes",
    "Ya tengo clientes o ventas",
    "Tengo un emprendimiento funcionando y quiero hacerlo crecer",
    "Tengo un emprendimiento estructurado y estoy buscando escalarlo",
  ];
  const sinIdea = r.situacion_actual === opcionesSituacion[0];

  const acciones = r.acciones_realizadas ?? [];
  const numAcciones = acciones.includes("Todavía no he realizado acciones concretas")
    ? 0
    : acciones.length;

  const claridadIdea = Number(r.claridad_idea) || 0; // 1-5
  const claridadValor = Number(r.claridad_propuesta_valor) || 0; // 1-5
  const claridadModelo = Number(r.claridad_modelo_negocio) || 0; // 1-5
  const claridadVentas = Number(r.claridad_proceso_ventas) || 0; // 1-5

  // ---------- Madurez (0-100) ----------
  const madurez = clamp(
    (numAcciones / 17) * 30 + // qué tanto ha hecho
      (claridadIdea / 5) * 20 +
      (claridadValor / 5) * 15 +
      (claridadModelo / 5) * 20 +
      (claridadVentas / 5) * 15
  );

  // ---------- Validación (0-100) ----------
  const escalaEvidencia = [
    "No tengo evidencia todavía",
    "Personas dijeron que les gusta",
    "Personas dijeron que la comprarían",
    "Personas dejaron sus datos",
    "Personas probaron la solución",
    "Personas solicitaron el producto",
    "Conseguí preventas",
    "Conseguí clientes",
    "Conseguí ventas",
    "Tengo clientes recurrentes",
    "Tengo ingresos crecientes",
  ];
  const nivelEvidencia = indiceOpcion(escalaEvidencia, r.mayor_evidencia); // 0-10
  const escalaPruebas = ["Ninguna", "1–5", "6–10", "11–20", "Más de 20"];
  const nivelPruebas = indiceOpcion(escalaPruebas, r.pruebas_realizadas); // 0-4
  const escalaProbado = ["No", "Sí, informalmente", "Sí, con un prototipo", "Sí, con un MVP", "Sí, con usuarios reales", "Sí, con clientes que pagan"];
  const nivelProbado = indiceOpcion(escalaProbado, r.probado_solucion); // 0-5

  const validacion = clamp(
    (nivelEvidencia / 10) * 55 + (nivelPruebas / 4) * 20 + (nivelProbado / 5) * 25
  );

  // ---------- Tracción (0-100) ----------
  const escalaVentas = [
    "No", "Estoy preparando mi primera venta", "Estoy realizando pilotos", "Hice mi primera venta",
    "Tengo ventas ocasionales", "Tengo ventas frecuentes", "Tengo clientes recurrentes", "Tengo ventas crecientes",
  ];
  const nivelVentas = indiceOpcion(escalaVentas, r.has_vendido); // 0-7
  const escalaClientes = ["1–5", "6–10", "11–25", "26–50", "Más de 50"];
  const nivelClientesPagaron = r.clientes_pagaron === "Ninguno" ? 0 : indiceOpcion(escalaClientes, r.clientes_pagaron) + 1; // 0-5
  const escalaIngresos = ["No", "Sí, ocasionales", "Sí, mensuales", "Sí, crecientes", "Sí, es una fuente importante de ingresos"];
  const nivelIngresos = indiceOpcion(escalaIngresos, r.ingresos_actuales); // 0-4

  const traccion = clamp(
    (nivelVentas / 7) * 45 + (nivelClientesPagaron / 5) * 30 + (nivelIngresos / 4) * 25
  );

  // ---------- Viabilidad temprana (0-100) ----------
  const escalaMercado = ["Muy pequeño", "Pequeño", "Mediano", "Grande", "Muy grande", "No lo sé todavía"];
  const idxMercado = escalaMercado.indexOf(r.tamano_mercado);
  const nivelMercado = idxMercado === -1 || idxMercado === 5 ? 2 : idxMercado; // "no lo sé" cuenta como neutro (2)
  const dificultadCopiar = Number(r.dificultad_copiar) || 0; // 1-5
  const tieneVentaja = (r.ventaja_actual ?? []).some((v) => v !== "Ninguna clara todavía");
  const escalaCostos = ["No", "Tengo una estimación", "Sí, aproximadamente", "Sí, con bastante claridad"];
  const nivelCostos = indiceOpcion(escalaCostos, r.conoce_costos); // 0-3

  const viabilidad = clamp(
    (nivelMercado / 4) * 30 +
      (dificultadCopiar / 5) * 20 +
      (tieneVentaja ? 20 : 0) +
      (nivelCostos / 3) * 15 +
      (claridadValor / 5) * 15
  );

  // ---------- Capacidad de ejecución (promedio Likert 1-5 -> 0-100) ----------
  const itemsEjecucion = [
    "cap_alternativas", "cap_ajustar_evidencia", "cap_ideas_acciones", "cap_organizacion_tiempo",
    "cap_hablar_clientes", "cap_vender", "cap_buscar_apoyo", "cap_aprender_errores",
    "cap_trabajo_equipo", "cap_asumir_riesgos",
  ];
  const valoresEjecucion = itemsEjecucion.map((id) => Number(r[id]) || 0).filter((v) => v > 0);
  const promedioEjecucion = valoresEjecucion.length
    ? valoresEjecucion.reduce((a, b) => a + b, 0) / valoresEjecucion.length
    : 0;
  const capacidadEjecucion = clamp((promedioEjecucion / 5) * 100);

  // ---------- Potencial de crecimiento (0-100) ----------
  const potencial = clamp(
    viabilidad * 0.35 + traccion * 0.3 + capacidadEjecucion * 0.2 + (nivelMercado / 4) * 100 * 0.15
  );

  // ---------- Perfil (contrasta percepción vs. evidencia) ----------
  let perfil;
  if (sinIdea) {
    perfil = "Interés emprendedor";
  } else if (
    traccion >= 55 &&
    validacion >= 50 &&
    viabilidad >= 55 &&
    capacidadEjecucion >= 55 &&
    (nivelMercado >= 2)
  ) {
    perfil = "Potencial de incubación";
  } else if (traccion >= 30 || nivelVentas >= 3) {
    perfil = "En crecimiento";
  } else if (validacion >= 25 || numAcciones >= 5) {
    perfil = "En validación";
  } else {
    perfil = "Explorador";
  }

  // ¿Hay contradicción entre lo que el estudiante cree y la evidencia?
  const etapasAvanzadas = ["Negocio funcionando", "Negocio en crecimiento", "Ventas recurrentes"];
  const percibeAvanzado = etapasAvanzadas.includes(r.etapa_actual);
  const contradiccion = percibeAvanzado && traccion < 30 && validacion < 30;

  // ---------- Semáforo (contextual según perfil) ----------
  const nivel = (valor, uOk = 60, uAdvertencia = 30) => {
    if (valor >= uOk) return "verde";
    if (valor >= uAdvertencia) return "amarillo";
    return "rojo";
  };

  const esExplorador = perfil === "Explorador" || perfil === "Interés emprendedor";

  const semaforo = {
    idea: { estado: nivel(claridadIdea * 20), puntaje: clamp(claridadIdea * 20) },
    problema: {
      estado: r.problema_concreto ? nivel(importanciaProblema(r)) : "gris",
      puntaje: importanciaProblema(r),
    },
    cliente: { estado: nivel(nivelConocimientoCliente(r)), puntaje: nivelConocimientoCliente(r) },
    validacion: {
      estado: esExplorador && validacion < 30 ? "amarillo" : nivel(validacion),
      puntaje: validacion,
    },
    modelo: { estado: nivel(claridadModelo * 20), puntaje: clamp(claridadModelo * 20) },
    ventas: {
      estado: esExplorador && traccion < 20 ? "gris" : nivel(traccion),
      puntaje: traccion,
    },
    ejecucion: { estado: nivel(capacidadEjecucion), puntaje: capacidadEjecucion },
    potencial: { estado: nivel(potencial), puntaje: potencial },
  };

  // ---------- Fortaleza / reto / ruta / profesor / objetivo ----------
  const dimensiones = Object.entries(semaforo);
  const fortalezaDim = dimensiones.reduce((mejor, actual) =>
    actual[1].puntaje > mejor[1].puntaje ? actual : mejor
  );
  const retoDim = dimensiones.reduce((peor, actual) =>
    actual[1].puntaje < peor[1].puntaje ? actual : peor
  );

  const NOMBRES_DIMENSION = {
    idea: "Idea y oportunidad",
    problema: "Comprensión del problema",
    cliente: "Conocimiento del cliente",
    validacion: "Validación con el mercado",
    modelo: "Modelo de negocio",
    ventas: "Ventas y tracción",
    ejecucion: "Capacidad de ejecución",
    potencial: "Potencial de crecimiento",
  };

  const RUTAS = {
    "Interés emprendedor": ["Autoconocimiento", "Creatividad", "Identificación de problemas", "Ideación", "Exploración de oportunidades"],
    Explorador: ["Ideación", "Creatividad e innovación", "Design Thinking", "Problema", "Cliente", "Oportunidad", "Primeras pruebas"],
    "En validación": ["Problema", "Cliente", "Propuesta de valor", "Validación", "MVP", "Modelo de negocio", "Marketing", "Ventas"],
    "En crecimiento": ["Ventas", "Marketing", "Finanzas", "Operaciones", "Productividad", "Equipo", "Gestión", "Escalamiento"],
    "Potencial de incubación": ["Incubación", "Mentoría especializada", "Estrategia", "Finanzas", "Networking", "Inversión", "Escalamiento"],
  };

  const PROFESOR = {
    "Interés emprendedor": "Emprendimiento / creatividad / autoconocimiento",
    Explorador: "Emprendimiento / innovación / creatividad / Design Thinking",
    "En validación": "Emprendimiento + investigación de mercados + marketing",
    "En crecimiento": "Administración / finanzas / marketing / operaciones / emprendimiento",
    "Potencial de incubación": "Mentor empresarial / estrategia / inversión / escalamiento",
  };

  const objetivo90dias = generarObjetivo90dias(perfil, r);

  return {
    perfil,
    contradiccion,
    madurez,
    validacion,
    viabilidad,
    traccion,
    potencial,
    capacidadEjecucion,
    semaforo,
    fortalezaPrincipal: NOMBRES_DIMENSION[fortalezaDim[0]],
    retoPrincipal: NOMBRES_DIMENSION[retoDim[0]],
    ruta: RUTAS[perfil],
    profesorRecomendado: PROFESOR[perfil],
    objetivo90dias,
  };
}

function importanciaProblema(r) {
  const importancia = Number(r.importancia_problema) || 0;
  const frecuencias = ["Una vez", "Ocasionalmente", "Mensualmente", "Semanalmente", "Diariamente", "Constantemente"];
  const idxFrecuencia = frecuencias.indexOf(r.frecuencia_problema);
  const frecuenciaNorm = idxFrecuencia === -1 ? 0 : idxFrecuencia / 5;
  return clamp((importancia / 5) * 60 + frecuenciaNorm * 40);
}

function nivelConocimientoCliente(r) {
  const conocidos = (r.conocimiento_cliente ?? []).filter((v) => v !== "No lo conozco suficientemente").length;
  const escalaComoSabes = ["Es una suposición", "Es mi experiencia personal", "Lo observé", "Investigué", "Hice encuestas", "Hice entrevistas", "Probé con usuarios", "Ya tengo clientes de ese perfil"];
  const idx = escalaComoSabes.indexOf(r.como_sabes_cliente);
  const nivelFuente = idx === -1 ? 0 : idx / 7;
  return clamp((conocidos / 9) * 50 + nivelFuente * 50);
}

function generarObjetivo90dias(perfil, r) {
  switch (perfil) {
    case "Interés emprendedor":
      return "Explorar al menos 3 problemas reales de tu entorno y elegir uno para empezar a idear soluciones.";
    case "Explorador":
      return "Definir con claridad el problema y el cliente, y realizar al menos 15 entrevistas de descubrimiento.";
    case "En validación":
      return "Validar la propuesta de valor con al menos 20 clientes potenciales y conseguir las primeras 5 ventas.";
    case "En crecimiento":
      return "Sistematizar el proceso de ventas y ordenar la operación (finanzas, equipo, marketing) para crecer de forma sostenible.";
    case "Potencial de incubación":
      return "Diseñar un plan de escalamiento e iniciar conversaciones con mentores, aliados o inversionistas.";
    default:
      return r.resultado_90_dias || "Definir un objetivo claro para los próximos 90 días.";
  }
}
