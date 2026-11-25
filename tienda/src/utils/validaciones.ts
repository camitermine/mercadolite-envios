import { NormalizadorTexto } from './normalizadorTexto'

export type Validador = (valor: string) => string | undefined

export type Regla = {
  cumple: (texto: string) => boolean
  mensaje: string
}

export const LONGITUD_MINIMA_NOMBRE = 2
const LONGITUD_MINIMA_TELEFONO = 6

const SOLO_LETRAS = /^[\p{L}\p{M}]+(?:[ '-][\p{L}\p{M}]+)*$/u
const EMAIL_BASICO = /^\S+@\S+\.\S+$/
const TELEFONO_BASICO = /^[0-9+\-\s()]+$/

export function requerido(mensaje: string): Regla {
  return { cumple: (texto: string): boolean => texto !== '', mensaje }
}

export function largoMinimo(minimo: number, mensaje: string): Regla {
  return { cumple: (texto: string): boolean => texto.length >= minimo, mensaje }
}

export function formato(patron: RegExp, mensaje: string): Regla {
  return { cumple: (texto: string): boolean => patron.test(texto), mensaje }
}

export function validar(valor: string, ...reglas: Regla[]): string | undefined {
  const texto = NormalizadorTexto.normalizar(valor)
  return reglas.find((regla) => !regla.cumple(texto))?.mensaje
}

export function validarNombre(
  valor: string,
  mensajeVacio: string = 'Ingresá tu nombre',
): string | undefined {
  return validar(
    valor,
    requerido(mensajeVacio),
    largoMinimo(LONGITUD_MINIMA_NOMBRE, 'El nombre es demasiado corto'),
    formato(SOLO_LETRAS, 'El nombre solo puede contener letras'),
  )
}

export function validarEmail(valor: string): string | undefined {
  return validar(
    valor,
    requerido('Ingresá tu email'),
    formato(EMAIL_BASICO, 'Ingresá un email válido'),
  )
}

export function validarTelefono(valor: string): string | undefined {
  return validar(
    valor,
    requerido('Ingresá tu teléfono'),
    largoMinimo(LONGITUD_MINIMA_TELEFONO, 'El teléfono es demasiado corto'),
    formato(TELEFONO_BASICO, 'El teléfono solo puede contener números'),
  )
}

export function validarLocalidad(valor: string): string | undefined {
  return validar(valor, requerido('Ingresá tu localidad'))
}

export function validarDireccion(valor: string): string | undefined {
  return validar(valor, requerido('Ingresá tu dirección'))
}
