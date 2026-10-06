// Configuración central de las 6 fases del diagnóstico "¿Qué clase de emprendedor soy?".
// Las columnas coinciden EXACTAMENTE con la tabla `diagnosticos` de Supabase.
//
// IMPORTANTE: reemplaza los textos de PROFESORES_POR_FASE por los nombres reales
// de los profesores expertos. Ese texto se guarda tal cual en
// `talleres_proceso.profesor_asignado` y en `diagnosticos.brechas_prioritarias`.

export const PROFESORES_POR_FASE = {
  1: "Profesor experto en Innovación (por asignar)",
  2: "Profesor experto en Estrategia (por asignar)",
  3: "Profesor experto en Finanzas (por asignar)",
  4: "Profesor experto en Comercial (por asignar)",
  5: "Profesor experto en Transformación Digital (por asignar)",
  6: "Profesor experto en Liderazgo (por asignar)",
};

export const FASES = [
  {
    numero: 1,
    clave: "innovacion",
    columna: "fase_1_innovacion",
    nombre: "Innovación",
    titulo: "Innovación y propuesta de valor",
    profesor: PROFESORES_POR_FASE[1],
  },
  {
    numero: 2,
    clave: "estrategia",
    columna: "fase_2_estrategia",
    nombre: "Estrategia",
    titulo: "Estrategia y modelo de negocio",
    profesor: PROFESORES_POR_FASE[2],
  },
  {
    numero: 3,
    clave: "finanzas",
    columna: "fase_3_finanzas",
    nombre: "Finanzas",
    titulo: "Finanzas y sostenibilidad",
    profesor: PROFESORES_POR_FASE[3],
  },
  {
    numero: 4,
    clave: "comercial",
    columna: "fase_4_comercial",
    nombre: "Comercial",
    titulo: "Gestión comercial y mercadeo",
    profesor: PROFESORES_POR_FASE[4],
  },
  {
    numero: 5,
    clave: "digital",
    columna: "fase_5_digital",
    nombre: "Digital",
    titulo: "Transformación digital",
    profesor: PROFESORES_POR_FASE[5],
  },
  {
    numero: 6,
    clave: "liderazgo",
    columna: "fase_6_liderazgo",
    nombre: "Liderazgo",
    titulo: "Liderazgo y gestión del equipo",
    profesor: PROFESORES_POR_FASE[6],
  },
];

// Cantidad de fases (las de menor puntaje) que pasan a tutoría mensual.
export const TOTAL_BRECHAS = 4;

export const SECTORES = [
  "Agroindustria y alimentos",
  "Comercio y retail",
  "Servicios profesionales",
  "Tecnología y software",
  "Moda, diseño y textil",
  "Turismo y gastronomía",
  "Educación y formación",
  "Salud y bienestar",
  "Industria y manufactura",
  "Arte, cultura y entretenimiento",
  "Impacto social y ambiental",
  "Otro",
];
