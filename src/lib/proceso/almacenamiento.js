// Utilidades para subir y abrir archivos del bucket privado `talleres`.
//
// Estructura de rutas (la primera carpeta es SIEMPRE el id del estudiante; las políticas
// de Storage se apoyan en eso):
//   {estudiante_id}/estudiante/mes-1-1760000000000-mi-taller.pdf
//   {estudiante_id}/profesor/mes-1-1760000000000-guia.pdf
//
// En las columnas taller_estudiante_url y taller_profesor_url se guarda la RUTA del archivo
// dentro del bucket. Para verlo se genera una URL firmada temporal (el bucket es privado).

export const BUCKET_TALLERES = "talleres";
export const TAMANO_MAXIMO_MB = 10;
export const EXTENSIONES_PERMITIDAS = ["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "png", "jpg", "jpeg", "zip"];
export const ACCEPT_ARCHIVOS = EXTENSIONES_PERMITIDAS.map((e) => `.${e}`).join(",");

export function validarArchivo(archivo) {
  if (!archivo) return "Selecciona un archivo.";

  const extension = archivo.name.includes(".") ? archivo.name.split(".").pop().toLowerCase() : "";
  if (!EXTENSIONES_PERMITIDAS.includes(extension)) {
    return `Formato no permitido. Usa: ${EXTENSIONES_PERMITIDAS.join(", ")}.`;
  }

  if (archivo.size > TAMANO_MAXIMO_MB * 1024 * 1024) {
    return `El archivo supera los ${TAMANO_MAXIMO_MB} MB.`;
  }

  return null;
}

// Quita tildes, espacios y caracteres raros para que la ruta sea válida en Storage.
export function limpiarNombre(nombre) {
  return nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/_+/g, "_")
    .slice(-80);
}

export function construirRuta({ estudianteId, lado, mes, nombreArchivo }) {
  return `${estudianteId}/${lado}/mes-${mes}-${Date.now()}-${limpiarNombre(nombreArchivo)}`;
}

// Abre un archivo guardado en el bucket en una pestaña nueva.
// Se abre la pestaña de inmediato (antes de pedir la URL) para que los celulares no la bloqueen.
export async function abrirArchivo(supabase, ruta) {
  if (/^https?:\/\//i.test(ruta)) {
    window.open(ruta, "_blank", "noopener,noreferrer");
    return;
  }

  const ventana = window.open("", "_blank");

  const { data, error } = await supabase.storage.from(BUCKET_TALLERES).createSignedUrl(ruta, 60 * 10);

  if (error || !data?.signedUrl) {
    if (ventana) ventana.close();
    throw error ?? new Error("No se pudo generar el enlace del archivo.");
  }

  if (ventana) {
    ventana.opener = null;
    ventana.location.href = data.signedUrl;
  } else {
    window.location.href = data.signedUrl;
  }
}
