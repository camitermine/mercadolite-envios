import { afterEach, describe, expect, it, vi } from 'vitest'
import { dashboardService } from './dashboardService'

const STATS = { preparing: 18, inTransit: 42, deliveredToday: 27, delayed: 6 }

const DELAYED_SHIPMENTS_PAGE = {
  content: [{ trackingNumber: 'AR-100236', clientName: 'Diego Sosa', delayDays: 3 }],
  page: 0,
  size: 4,
  totalElements: 1,
  totalPages: 1,
}

const UPCOMING_DELIVERIES_PAGE = {
  content: [
    { trackingNumber: 'AR-100239', clientName: 'Valentina Díaz', destination: 'Mendoza, Mendoza', estimatedDate: '08/07' },
  ],
  page: 1,
  size: 4,
  totalElements: 5,
  totalPages: 2,
}

function stubFetch(body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(body)))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('dashboardService', () => {
  it('obtiene los indicadores de envíos desde el backend', async () => {
    const fetchMock = stubFetch(STATS)

    const stats = await dashboardService.getStats()

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/dashboard/stats', { signal: undefined })
    expect(stats).toEqual(STATS)
  })

  it('obtiene la página pedida de envíos demorados desde el backend', async () => {
    const fetchMock = stubFetch(DELAYED_SHIPMENTS_PAGE)

    const delayedShipments = await dashboardService.getDelayedShipments(0)

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/dashboard/delayed-shipments?page=0', { signal: undefined })
    expect(delayedShipments).toEqual(DELAYED_SHIPMENTS_PAGE)
  })

  it('obtiene la página pedida de próximas entregas desde el backend', async () => {
    const fetchMock = stubFetch(UPCOMING_DELIVERIES_PAGE)

    const upcomingDeliveries = await dashboardService.getUpcomingDeliveries(1)

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/dashboard/upcoming-deliveries?page=1', { signal: undefined })
    expect(upcomingDeliveries).toEqual(UPCOMING_DELIVERIES_PAGE)
  })

  it('falla con el status de la respuesta cuando el backend responde con error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 500 })))

    await expect(dashboardService.getStats()).rejects.toMatchObject({ code: 500 })
  })
})
