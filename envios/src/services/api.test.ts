import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from './api'
import { ApiError } from './errors'

const fetchMock = vi.fn()

function response(status: number, json: () => Promise<unknown>): Response {
  return { ok: status >= 200 && status < 300, status, json } as unknown as Response
}

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

describe('apiRequest', () => {
  it('devuelve el cuerpo de una respuesta exitosa', async () => {
    fetchMock.mockResolvedValue(response(200, async () => [{ id: 1 }]))

    await expect(apiRequest('/carriers')).resolves.toEqual([{ id: 1 }])
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/carriers', { headers: undefined })
  })

  it('avisa que manda JSON solo cuando la request tiene cuerpo', async () => {
    fetchMock.mockResolvedValue(response(201, async () => undefined))

    await apiRequest('/carriers', { method: 'POST', body: '{}' })

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/carriers', {
      method: 'POST',
      body: '{}',
      headers: { 'Content-Type': 'application/json' },
    })
  })

  it.each([201, 204])('no intenta leer el cuerpo de una respuesta %i', async (status) => {
    const json = vi.fn().mockRejectedValue(new SyntaxError('Unexpected end of JSON input'))
    fetchMock.mockResolvedValue(response(status, json))

    await expect(apiRequest('/shipments', { method: 'POST', body: '{}' })).resolves.toBeUndefined()
    expect(json).not.toHaveBeenCalled()
  })

  it('convierte el error del backend en un ApiError con su código, mensaje y campos', async () => {
    const data = { clientName: 'El cliente es obligatorio' }
    fetchMock.mockResolvedValue(
      response(400, async () => ({ code: 400, data, message: 'Hay datos inválidos' })),
    )

    const error = await apiRequest('/shipments').catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ code: 400, message: 'Hay datos inválidos', data })
  })

  it('usa el status y un mensaje genérico si el error no trae un cuerpo legible', async () => {
    fetchMock.mockResolvedValue(
      response(502, async () => {
        throw new SyntaxError('Unexpected token <')
      }),
    )

    await expect(apiRequest('/shipments')).rejects.toMatchObject({
      code: 502,
      message: 'No se pudo completar la solicitud',
      data: {},
    })
  })

  it('deja pasar el error de red para que la pantalla avise que no hay conexión', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(apiRequest('/shipments')).rejects.toBeInstanceOf(TypeError)
  })
})
