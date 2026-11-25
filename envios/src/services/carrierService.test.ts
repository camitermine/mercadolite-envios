import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Carrier } from '../domain/Carrier'
import { carrierService } from './carrierService'

const CARRIER: Carrier = {
  id: 1,
  name: 'Andreani',
  phone: '0810-122-1112',
  coverage: 'Nacional',
  status: 'Activo',
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

describe('carrierService', () => {
  it('obtiene los transportistas del backend', async () => {
    fetchMock.mockResolvedValue(response([CARRIER]))

    await expect(carrierService.getAll()).resolves.toEqual([CARRIER])
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/carriers', expect.any(Object))
  })

  it('crea un transportista en el backend', async () => {
    fetchMock.mockResolvedValue(response(undefined, 201))
    const input = {
      name: CARRIER.name,
      phone: CARRIER.phone,
      coverage: CARRIER.coverage,
      status: CARRIER.status,
    }

    await expect(carrierService.create(input)).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/carriers',
      expect.objectContaining({ method: 'POST', body: JSON.stringify(input) }),
    )
  })

  it('actualiza un transportista en el backend', async () => {
    fetchMock.mockResolvedValue(response(undefined, 204))

    await carrierService.update(CARRIER.id, {
      name: CARRIER.name,
      phone: CARRIER.phone,
      coverage: CARRIER.coverage,
      status: CARRIER.status,
    })

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/carriers/1',
      expect.objectContaining({ method: 'PUT' }),
    )
  })

  it('elimina un transportista en el backend', async () => {
    fetchMock.mockResolvedValue(response(undefined, 204))

    await carrierService.delete(1)

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/carriers/1',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('conserva los errores de campo enviados por el backend', async () => {
    const errors = { coverage: 'La cobertura no puede superar los 120 caracteres' }
    fetchMock.mockResolvedValue(response({ code: 400, data: errors, message: 'Hay datos inválidos' }, 400))

    await expect(carrierService.create({
      name: CARRIER.name,
      phone: CARRIER.phone,
      coverage: 'a'.repeat(121),
      status: CARRIER.status,
    })).rejects.toMatchObject({ code: 400, data: errors })
  })
})
