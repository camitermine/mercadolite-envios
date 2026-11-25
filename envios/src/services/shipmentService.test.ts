import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Shipment } from '../domain/Shipment'
import { shipmentService } from './shipmentService'

const SHIPMENT: Shipment = {
  id: 1,
  trackingNumber: 'AR-100234',
  clientName: 'Martín Gutiérrez',
  address: 'Av. Santa Fe 2450',
  destination: 'Palermo, CABA',
  product: 'Notebook Lenovo',
  carrierId: 1,
  carrier: 'Andreani',
  status: 'En camino',
  estimatedDate: '2026-07-05',
  effectiveDate: null,
}

const fetchMock = vi.fn()

function response(body?: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response
}

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

describe('shipmentService', () => {
  it('obtiene los envíos con su transportista en una sola petición', async () => {
    fetchMock.mockResolvedValue(response([SHIPMENT]))

    await expect(shipmentService.getAll()).resolves.toEqual([
      SHIPMENT,
    ])

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/shipments',
      expect.any(Object),
    )

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('solicita los envíos filtrados por estado al backend', async () => {
    const delayedShipment = {
      ...SHIPMENT,
      status: 'Demorado',
    }

    fetchMock.mockResolvedValue(response([delayedShipment]))

    await expect(
      shipmentService.getAll(undefined, 'Demorado'),
    ).resolves.toEqual([delayedShipment])

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/shipments?status=Demorado',
      expect.any(Object),
    )

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('solicita todos los envíos cuando no hay filtro de estado', async () => {
    fetchMock.mockResolvedValue(response([SHIPMENT]))

    await expect(shipmentService.getAll()).resolves.toEqual([SHIPMENT])

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/shipments',
      expect.any(Object),
    )

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('obtiene los estados disponibles del backend', async () => {
    const statuses = ['En camino', 'Demorado', 'Entregado']

    fetchMock.mockResolvedValue(response(statuses))

    await expect(
      shipmentService.getStatuses(),
    ).resolves.toEqual(statuses)

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/shipments/statuses',
      expect.any(Object),
    )

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('obtiene un envío por su número de seguimiento', async () => {
    fetchMock.mockResolvedValue(response(SHIPMENT))

    await expect(
      shipmentService.getByTrackingNumber('AR-100234'),
    ).resolves.toEqual(SHIPMENT)

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/shipments/AR-100234',
      expect.any(Object),
    )

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('crea un envío y no espera datos en la respuesta', async () => {
    const input = {
      trackingNumber: 'AR-100262',
      clientName: 'Florencia Ibáñez',
      address: 'Av. Centenario 1250',
      destination: 'San Isidro, Bs. As.',
      product: 'Zapatillas running',
      carrierId: 1,
      estimatedDate: '2026-07-10',
    }

    fetchMock.mockResolvedValue(
      response({ message: 'Envío AR-100262 creado' }, 201),
    )

    await expect(shipmentService.create(input)).resolves.toBeUndefined()

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/shipments',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(input),
      }),
    )
  })

  it('informa el motivo si el backend rechaza el envío', async () => {
    fetchMock.mockResolvedValue(
      response({ code: 409, data: {}, message: 'La orden ya tiene un envío' }, 409),
    )

    await expect(
      shipmentService.create({
        trackingNumber: 'AR-100234',
        clientName: 'Martín Gutiérrez',
        address: 'Av. Santa Fe 2450',
        destination: 'Palermo, CABA',
        product: 'Notebook Lenovo',
        carrierId: 1,
        estimatedDate: '2026-07-10',
      }),
    ).rejects.toMatchObject({
      code: 409,
      message: 'La orden ya tiene un envío',
    })
  })

  it('registra la entrega de un envío', async () => {
    fetchMock.mockResolvedValue(response(undefined, 204))

    await expect(
      shipmentService.deliver('AR-100234'),
    ).resolves.toBeUndefined()

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/shipments/AR-100234/deliver',
      expect.objectContaining({
        method: 'PATCH',
      }),
    )
  })

  it('edita los datos de un envío', async () => {
    const updatedData = {
      clientName: 'Martín González',
      address: 'Av. Corrientes 1500',
      destination: 'Balvanera, CABA',
      product: 'Notebook Lenovo',
      carrierId: 1,
      estimatedDate: '2026-07-10',
    }

    fetchMock.mockResolvedValue(response(undefined, 204))

    await expect(
      shipmentService.update('AR-100234', updatedData),
    ).resolves.toBeUndefined()

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/shipments/AR-100234',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(updatedData),
      }),
    )
  })
})
