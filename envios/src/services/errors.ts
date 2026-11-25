const SERVER_ERROR = 'ocurrió un error en el servidor. Intentá de nuevo más tarde.'
const CONNECTION_ERROR = 'no hay conexión con el servidor. Revisá que esté disponible e intentá de nuevo.'

export class ApiError extends Error {
  readonly code: number
  readonly data: Record<string, string>

  constructor(code: number, message: string, data: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.data = data
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

/**
 * Arma el mensaje para el usuario a partir de un error y de la acción que falló,
 * por ejemplo "No pudimos guardar el envío".
 *
 * - 4xx: el mensaje del backend, que explica qué corregir.
 * - 5xx: la acción y un aviso genérico, sin exponer detalles internos.
 * - Falla de red: fetch rechaza con TypeError.
 */
export function errorMessage(error: unknown, action: string): string {
  if (error instanceof ApiError) {
    return error.code >= 500 ? `${action}: ${SERVER_ERROR}` : error.message
  }

  return error instanceof TypeError ? `${action}: ${CONNECTION_ERROR}` : `${action}.`
}

/** Devuelve los errores por campo que informó el backend, solo de los campos pedidos. */
export function fieldErrors<Field extends string>(
  error: unknown,
  fields: readonly Field[],
): Partial<Record<Field, string>> {
  if (!(error instanceof ApiError)) return {}

  return Object.fromEntries(
    fields.flatMap((field) => (error.data[field] ? [[field, error.data[field]]] : [])),
  ) as Partial<Record<Field, string>>
}
