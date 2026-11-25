import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HomePage } from './HomePage'
import { dashboardService } from './dashboardService'

vi.mock('./dashboardService', () => ({
  dashboardService: {
    getStats: vi.fn(),
    getDelayedShipments: vi.fn(),
    getUpcomingDeliveries: vi.fn(),
  },
}))

const STATS = { preparing: 6, inTransit: 5, deliveredToday: 1, delayed: 1 }

const DELAYED_SHIPMENTS_PAGE = {
  content: [{ trackingNumber: 'AR-100235', clientName: 'Martín González', delayDays: 2 }],
  page: 0,
  size: 4,
  totalElements: 1,
  totalPages: 1,
}

function upcomingDelivery(trackingNumber: string, clientName: string) {
  return { trackingNumber, clientName, destination: 'Recoleta, CABA', estimatedDate: '20/11' }
}

const UPCOMING_DELIVERIES_FIRST_PAGE = {
  content: [
    upcomingDelivery('AR-100234', 'Lucía Fernández'),
    upcomingDelivery('AR-100236', 'Sofía Martínez'),
    upcomingDelivery('AR-100260', 'Rocío Benítez'),
    upcomingDelivery('AR-100261', 'Emiliano Cabrera'),
  ],
  page: 0,
  size: 4,
  totalElements: 5,
  totalPages: 2,
}

const UPCOMING_DELIVERIES_SECOND_PAGE = {
  content: [upcomingDelivery('AR-100262', 'Florencia Ibáñez')],
  page: 1,
  size: 4,
  totalElements: 5,
  totalPages: 2,
}

function upcomingDeliveriesCard() {
  return screen.getByRole('heading', { name: 'Próximas entregas' }).parentElement!
}

function delayedShipmentsCard() {
  return screen.getByRole('heading', { name: 'Envíos demorados' }).parentElement!
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.mocked(dashboardService.getStats).mockResolvedValue(STATS)
    vi.mocked(dashboardService.getDelayedShipments).mockResolvedValue(DELAYED_SHIPMENTS_PAGE)
    vi.mocked(dashboardService.getUpcomingDeliveries).mockImplementation(async (page) =>
      page === 0 ? UPCOMING_DELIVERIES_FIRST_PAGE : UPCOMING_DELIVERIES_SECOND_PAGE,
    )
  })

  it('muestra la paginación cuando una lista tiene más de una página', async () => {
    render(<HomePage />)

    expect(await screen.findByText('Lucía Fernández')).toBeInTheDocument()
    expect(within(upcomingDeliveriesCard()).getByRole('navigation')).toBeInTheDocument()
  })

  it('no muestra la paginación cuando una lista tiene una sola página', async () => {
    render(<HomePage />)

    expect(await screen.findByText('AR-100235')).toBeInTheDocument()
    expect(within(delayedShipmentsCard()).queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('pide la página siguiente al backend al cambiar de página', async () => {
    const user = userEvent.setup()
    render(<HomePage />)

    await screen.findByText('Lucía Fernández')
    await user.click(within(upcomingDeliveriesCard()).getByRole('button', { name: /page 2/i }))

    expect(await screen.findByText('Florencia Ibáñez')).toBeInTheDocument()
    expect(screen.queryByText('Lucía Fernández')).not.toBeInTheDocument()
    expect(dashboardService.getUpcomingDeliveries).toHaveBeenLastCalledWith(1, expect.any(AbortSignal))
  })
})
