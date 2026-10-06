// Banco de 24 preguntas del diagnóstico: 4 por fase, numeradas de forma continua (1 a 24).
// Cada pregunta tiene 5 opciones ordenadas de menor a mayor madurez, con puntajes 20, 40, 60, 80 y 100.
// El estudiante NUNCA ve los puntajes ni los nombres de las fases: solo el texto de cada opción.

import { FASES } from "./fases";

export const PUNTAJES = [20, 40, 60, 80, 100];

// Cada entrada: { texto, opciones: [5 textos de menor a mayor] }
const BANCO_POR_FASE = {
  // ---------- Fase 1 ----------
  1: [
    {
      texto: "¿Qué tan claro tienes el problema o la necesidad real que resuelve tu emprendimiento?",
      opciones: [
        "Todavía no lo tengo definido",
        "Tengo una idea general, pero no la he confirmado con nadie",
        "Lo tengo definido, pero lo he conversado con muy pocas personas",
        "Lo he confirmado con varias personas de mi público objetivo",
        "Lo tengo comprobado con evidencia (entrevistas, encuestas o pruebas reales)",
      ],
    },
    {
      texto: "¿Qué tan diferente es tu producto o servicio frente a lo que ya existe en el mercado?",
      opciones: [
        "No sé qué ofrece la competencia",
        "Es muy parecido a lo que ya existe",
        "Tiene algunas diferencias, pero fáciles de copiar",
        "Tiene una diferencia clara que los clientes valoran",
        "Tiene un diferencial fuerte y difícil de imitar",
      ],
    },
    {
      texto: "¿Con qué frecuencia mejoras tu producto o servicio a partir de lo que dicen tus clientes?",
      opciones: [
        "Nunca lo he mejorado",
        "Lo hago muy rara vez y sin un método",
        "Lo hago cuando recibo quejas importantes",
        "Lo hago de forma periódica, recogiendo opiniones",
        "Tengo un proceso constante de prueba, aprendizaje y mejora",
      ],
    },
    {
      texto: "¿Qué tan claro tienes por qué un cliente te elegiría a ti y no a otro?",
      opciones: [
        "No lo tengo claro",
        "Lo intuyo, pero no sé explicarlo",
        "Puedo explicarlo, pero con argumentos poco concretos",
        "Lo explico con claridad y mis clientes lo reconocen",
        "Lo tengo formulado, probado y lo comunico de forma consistente",
      ],
    },
  ],

  // ---------- Fase 2 ----------
  2: [
    {
      texto: "¿Qué tan definido tienes tu modelo de negocio (cómo creas, entregas y cobras por tu valor)?",
      opciones: [
        "No lo tengo definido",
        "Lo tengo en mi cabeza, pero no escrito",
        "Lo tengo escrito, pero es muy general",
        "Lo tengo estructurado y lo reviso de vez en cuando",
        "Lo tengo estructurado, probado y lo ajusto con base en resultados",
      ],
    },
    {
      texto: "¿Conoces a tu competencia y has analizado cómo te diferencias de ella?",
      opciones: [
        "No he analizado a mi competencia",
        "Conozco a uno o dos competidores de manera informal",
        "Conozco a varios competidores, pero sin un análisis ordenado",
        "Tengo un análisis comparativo de mis principales competidores",
        "Monitoreo a la competencia de forma permanente y ajusto mi estrategia",
      ],
    },
    {
      texto: "¿Tienes metas claras a corto y mediano plazo para tu emprendimiento?",
      opciones: [
        "No tengo metas definidas",
        "Tengo deseos generales, sin fechas ni cifras",
        "Tengo metas, pero no les hago seguimiento",
        "Tengo metas con fechas y las reviso con frecuencia",
        "Tengo metas medibles, un plan de acción y un seguimiento constante",
      ],
    },
    {
      texto: "¿Qué tan claros tienes tus aliados, proveedores y recursos clave para operar?",
      opciones: [
        "No sé qué recursos o aliados necesito",
        "Sé lo que necesito, pero no tengo cómo conseguirlo",
        "Cuento con algunos proveedores y aliados de manera informal",
        "Tengo proveedores y aliados identificados y estables",
        "Tengo una red de aliados estratégicos y alternativas ante cualquier imprevisto",
      ],
    },
  ],

  // ---------- Fase 3 ----------
  3: [
    {
      texto: "¿Conoces cuánto te cuesta producir tu producto o prestar tu servicio?",
      opciones: [
        "No lo sé",
        "Tengo una idea aproximada",
        "Conozco los costos principales, pero me faltan algunos",
        "Conozco todos mis costos directos e indirectos",
        "Conozco mis costos al detalle y los reviso periódicamente",
      ],
    },
    {
      texto: "¿Cómo defines el precio al que vendes?",
      opciones: [
        "Pongo el precio al azar o según mi intuición",
        "Copio el precio de la competencia",
        "Sumo mis costos y agrego una ganancia aproximada",
        "Calculo costos, margen deseado y lo comparo con el mercado",
        "Tengo una estrategia de precios validada con mis clientes y mis márgenes",
      ],
    },
    {
      texto: "¿Llevas un registro de los ingresos y gastos de tu emprendimiento?",
      opciones: [
        "No llevo ningún registro",
        "Lo llevo de memoria o en notas sueltas",
        "Lo llevo en un cuaderno o archivo, de forma irregular",
        "Lo llevo de forma ordenada y actualizada",
        "Lo llevo con un sistema contable y genero informes periódicos",
      ],
    },
    {
      texto: "¿Sabes cuánto necesitas vender para cubrir tus costos y has proyectado tus finanzas?",
      opciones: [
        "No lo sé ni lo he proyectado",
        "Tengo una idea, pero no lo he calculado",
        "Lo he calculado una vez, pero no lo uso",
        "Conozco mi punto de equilibrio y proyecto algunos meses",
        "Proyecto mis finanzas a futuro y tomo decisiones con esos números",
      ],
    },
  ],

  // ---------- Fase 4 ----------
  4: [
    {
      texto: "¿Qué tan bien definido tienes quién es tu cliente ideal?",
      opciones: [
        "Le vendo a cualquier persona que me compre",
        "Tengo una idea general de mi cliente",
        "Conozco su edad, ubicación y algunas necesidades",
        "Conozco sus necesidades, hábitos de compra y motivaciones",
        "Tengo perfiles de cliente detallados, basados en datos reales",
      ],
    },
    {
      texto: "¿Cómo consigues nuevos clientes?",
      opciones: [
        "Todavía no tengo clientes",
        "Solo por casualidad o por conocidos",
        "Por recomendaciones y redes sociales, sin un plan",
        "Con acciones planeadas que repito con regularidad",
        "Tengo varios canales de captación medidos y optimizados",
      ],
    },
    {
      texto: "¿Qué tan estructurado es tu proceso de venta?",
      opciones: [
        "No tengo un proceso: vendo cuando se da",
        "Vendo de manera informal, sin pasos definidos",
        "Tengo algunos pasos claros, pero no siempre los sigo",
        "Tengo un proceso definido que casi siempre aplico",
        "Tengo un proceso de venta medido, documentado y repetible",
      ],
    },
    {
      texto: "¿Qué haces para que tus clientes vuelvan a comprarte y te recomienden?",
      opciones: [
        "Nada en particular",
        "Les agradezco cuando me compran",
        "Hago seguimiento ocasional a algunos clientes",
        "Tengo acciones definidas de fidelización y servicio posventa",
        "Tengo un programa de fidelización y mido la recompra y la recomendación",
      ],
    },
  ],

  // ---------- Fase 5 ----------
  5: [
    {
      texto: "¿Qué tan presente está tu emprendimiento en canales digitales (redes sociales, página web, marketplaces)?",
      opciones: [
        "No tengo presencia digital",
        "Tengo un perfil básico que casi no uso",
        "Publico de forma irregular en una o dos plataformas",
        "Tengo presencia constante con una imagen coherente",
        "Tengo una estrategia digital planeada, con contenidos y canales definidos",
      ],
    },
    {
      texto: "¿Usas herramientas digitales para gestionar tu negocio (inventario, facturación, atención a clientes)?",
      opciones: [
        "No uso ninguna herramienta digital",
        "Uso solo el celular y WhatsApp",
        "Uso hojas de cálculo u otras herramientas básicas",
        "Uso varias herramientas digitales especializadas",
        "Tengo mis procesos principales digitalizados e integrados",
      ],
    },
    {
      texto: "¿Mides los resultados de tus acciones digitales (alcance, contactos, ventas por canal)?",
      opciones: [
        "No mido nada",
        "Solo miro los “me gusta” o seguidores",
        "Reviso algunas métricas de vez en cuando",
        "Mido métricas clave con regularidad",
        "Mido, analizo y ajusto mis acciones con base en los datos",
      ],
    },
    {
      texto: "¿Vendes o recibes pagos por medios digitales?",
      opciones: [
        "No, todo es presencial y en efectivo",
        "Recibo transferencias ocasionales",
        "Recibo pagos digitales con frecuencia, pero vendo de forma manual",
        "Vendo y cobro de manera digital en uno o dos canales",
        "Tengo un proceso completo de venta y pago digital en varios canales",
      ],
    },
  ],

  // ---------- Fase 6 ----------
  6: [
    {
      texto: "¿Cómo tomas decisiones importantes cuando hay incertidumbre?",
      opciones: [
        "Las pospongo o las evito",
        "Decido por impulso o por lo que sienta en el momento",
        "Decido con base en mi experiencia, sin analizar mucho",
        "Reúno información y consulto a otras personas antes de decidir",
        "Analizo datos, evalúo riesgos y decido con un método claro",
      ],
    },
    {
      texto: "¿Qué tan bien delegas tareas y organizas a tu equipo o a tus aliados?",
      opciones: [
        "Hago todo yo solo",
        "Delego poco porque me cuesta confiar",
        "Delego tareas puntuales, pero sin una estructura clara",
        "Tengo roles definidos y hago seguimiento",
        "Mi equipo trabaja con objetivos claros y autonomía",
      ],
    },
    {
      texto: "¿Cómo manejas tu tiempo y tus prioridades como líder del emprendimiento?",
      opciones: [
        "Siempre voy apagando incendios",
        "Me cuesta priorizar y se me acumulan las tareas",
        "Hago listas, pero no siempre las cumplo",
        "Planifico mi semana y cumplo casi todas las prioridades",
        "Planifico, delego y reviso mis resultados de forma constante",
      ],
    },
    {
      texto: "¿Qué haces cuando algo no sale como esperabas o cometes un error?",
      opciones: [
        "Me desanimo y suelo abandonar",
        "Me cuesta aceptar el error y sigo igual",
        "Lo acepto, pero casi no cambio nada",
        "Analizo lo que pasó y ajusto mi plan",
        "Lo uso como aprendizaje, lo comparto con mi equipo y mejoro mis procesos",
      ],
    },
  ],
};

// Lista plana y continua de las 24 preguntas.
// { id: "q1", numero: 1, fase: 1, texto, opciones: [{ texto, puntaje }] }
export const PREGUNTAS = FASES.flatMap((fase) => BANCO_POR_FASE[fase.numero].map((p) => ({ ...p, fase: fase.numero }))).map(
  (p, indice) => ({
    id: `q${indice + 1}`,
    numero: indice + 1,
    fase: p.fase,
    texto: p.texto,
    opciones: p.opciones.map((texto, i) => ({ texto, puntaje: PUNTAJES[i] })),
  })
);

export const TOTAL_PREGUNTAS = PREGUNTAS.length;
export const PREGUNTAS_POR_PASO = 4;

// Verificación temprana: si alguien edita el banco y rompe la estructura, falla al cargar.
if (TOTAL_PREGUNTAS !== 24) {
  throw new Error(`El banco debe tener 24 preguntas y tiene ${TOTAL_PREGUNTAS}.`);
}
FASES.forEach((fase) => {
  const cantidad = PREGUNTAS.filter((p) => p.fase === fase.numero).length;
  if (cantidad !== 4) {
    throw new Error(`La fase ${fase.numero} debe tener 4 preguntas y tiene ${cantidad}.`);
  }
});
PREGUNTAS.forEach((p) => {
  if (p.opciones.length !== 5) {
    throw new Error(`La pregunta ${p.numero} debe tener 5 opciones.`);
  }
});

// Pasos del formulario: 6 grupos de 4 preguntas consecutivas (sin títulos de fase).
export const PASOS_PREGUNTAS = Array.from({ length: TOTAL_PREGUNTAS / PREGUNTAS_POR_PASO }, (_, i) =>
  PREGUNTAS.slice(i * PREGUNTAS_POR_PASO, (i + 1) * PREGUNTAS_POR_PASO)
);
