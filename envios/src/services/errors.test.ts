import { describe, expect, it } from 'vitest'
import { ApiError, errorMessage, fieldErrors, isAbortError } from './errors'

const ACTION = 'No pudimos guardar el envío'

describe('errorMessage', () => {
  it.each([400, 404, 405])('muestra el mensaje del backend ante un error %i', (status) => {
    expect(errorMessage(new ApiError(status, 'La orden solicitada no existe'), ACTION))
      .toBe('La orden solicitada no existe')
  })

  it.each([500, 503])('no expone el detalle de un error %i', (status) => {
    expect(errorMessage(new ApiError(status, 'NullPointerException'), ACTION))
      .toBe('No pudimos guardar el envío: ocurrió un error en el servidor. Intentá de nuevo más tarde.')
  })

  it('avisa si no hay conexión sin mostrar el error técnico', () => {
    expect(errorMessage(new TypeError('Failed to fetch'), ACTION))
      .toBe('No pudimos guardar el envío: no hay conexión con el servidor. Revisá que esté disponible e intentá de nuevo.')
  })

  it('usa solo la acción ante un error desconocido', () => {
    expect(errorMessage(new Error('undefined is not a function'), ACTION)).toBe('No pudimos guardar el envío.')
  })
})

describe('fieldErrors', () => {
  const FIELDS = ['name', 'phone'] as const

  it('devuelve solo los errores de los campos pedidos', () => {
    const error = new ApiError(400, 'Hay datos inválidos', { phone: 'Teléfono inválido', other: 'Otro error' })

    expect(fieldErrors(error, FIELDS)).toEqual({ phone: 'Teléfono inválido' })
  })

  it('no devuelve nada si el error no es de la API', () => {
    expect(fieldErrors(new TypeError('Failed to fetch'), FIELDS)).toEqual({})
  })
})

describe('isAbortError', () => {
  it('reconoce una request cancelada', () => {
    expect(isAbortError(new DOMException('Aborted', 'AbortError'))).toBe(true)
    expect(isAbortError(new TypeError('Failed to fetch'))).toBe(false)
  })
})
