import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { HttpService } from './http.service'

function respuesta(cuerpo: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(cuerpo), { status })
}

describe('HttpService', () => {
  let fetchMock: Mock<typeof fetch>
  const http = new HttpService('https://api.test')

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('hace un GET a la URL completa y devuelve el JSON de la respuesta', async () => {
    fetchMock.mockResolvedValue(respuesta({ id: 1 }))

    const resultado = await http.get<{ id: number }>('/products/1')

    expect(resultado).toEqual({ id: 1 })
    expect(fetchMock).toHaveBeenCalledWith('https://api.test/products/1', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: undefined,
    })
  })

  it.each([
    ['post', 'POST'],
    ['put', 'PUT'],
    ['patch', 'PATCH'],
  ] as const)('%s envía el cuerpo serializado como JSON', async (metodo, verbo) => {
    fetchMock.mockResolvedValue(respuesta({ ok: true }))

    await http[metodo]('/products/1', { title: 'Nuevo' })

    expect(fetchMock).toHaveBeenCalledWith('https://api.test/products/1', {
      method: verbo,
      headers: { 'Content-Type': 'application/json' },
      body: '{"title":"Nuevo"}',
    })
  })

  it('create hace un POST y devuelve la ubicación del recurso creado', async () => {
    fetchMock.mockResolvedValue(
      new Response(null, { status: 201, headers: { Location: '/orders/AR-1' } }),
    )

    await expect(http.create('/orders', { title: 'Nuevo' })).resolves.toBe('/orders/AR-1')
    expect(fetchMock).toHaveBeenCalledWith('https://api.test/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"title":"Nuevo"}',
    })
  })

  it('create falla si la respuesta no informa la ubicación', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 201 }))

    await expect(http.create('/orders', {})).rejects.toThrow('POST /orders')
  })

  it('create falla si la API rechaza el alta', async () => {
    fetchMock.mockResolvedValue(respuesta({ message: 'datos inválidos' }, 400))

    await expect(http.create('/orders', {})).rejects.toThrow('HTTP 400 - POST /orders')
  })

  it('hace un DELETE sin cuerpo', async () => {
    fetchMock.mockResolvedValue(respuesta({ isDeleted: true }))

    await http.delete('/products/1')

    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: 'DELETE', body: undefined })
  })

  it('no intenta leer el cuerpo de una respuesta 204', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }))

    await expect(http.delete('/orders/AR-1')).resolves.toBeUndefined()
  })

  it('lanza un error si la respuesta no es exitosa', async () => {
    fetchMock.mockResolvedValue(respuesta({ message: 'not found' }, 404))

    await expect(http.get('/products/999')).rejects.toThrow('HTTP 404 - GET /products/999')
  })
})
