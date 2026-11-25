import { afterEach, describe, expect, it, vi } from 'vitest'
import { orderService } from './orderService'

const ORDERS = [
  {
    trackingNumber: 'AR-100260',
    clientName: 'Rocío Benítez',
    address: 'Av. Corrientes 5320',
    destination: 'Villa Crespo, CABA',
    product: 'Auriculares inalámbricos',
  },
]

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('orderService', () => {
  it('obtiene las órdenes pendientes desde el backend', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(ORDERS)))
    vi.stubGlobal('fetch', fetchMock)

    const orders = await orderService.getAll()

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/orders', { signal: undefined })
    expect(orders).toEqual(ORDERS)
  })

  it('falla con el status de la respuesta cuando el backend responde con error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 500 })))

    await expect(orderService.getAll()).rejects.toMatchObject({ code: 500 })
  })
})
