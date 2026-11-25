import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { PendingPage } from './PendingPage'
import { carrierService } from '../../services/carrierService'
import { orderService } from '../../services/orderService'

vi.mock('../../services/carrierService', () => ({
  carrierService: {
    getAll: vi.fn(),
  },
}))

vi.mock('../../services/orderService', () => ({
  orderService: {
    getAll: vi.fn(),
  },
}))

const ORDER = {
  trackingNumber: 'AR-100262',
  clientName: 'Florencia Ibáñez',
  address: 'Av. Centenario 1250',
  destination: 'San Isidro, Bs. As.',
  product: 'Zapatillas running',
}

const OTHER_ORDER = {
  trackingNumber: 'AR-100263',
  clientName: 'Gonzalo Ríos',
  address: 'Bv. Santa Fe 415',
  destination: 'Rafaela, Santa Fe',
  product: 'Monitor 27"',
}

const CARRIERS = [
  { id: 1, name: 'Andreani', phone: '0810-122-1112', coverage: 'Nacional', status: 'Activo' as const },
  { id: 5, name: 'Cruz del Sur', phone: '0810-222-2789', coverage: 'Patagonia', status: 'Inactivo' as const },
]

function NewShipmentState() {
  return <div>{JSON.stringify(useLocation().state)}</div>
}

function renderPendingPage() {
  return render(
    <MemoryRouter initialEntries={['/pending']}>
      <Routes>
        <Route path="/pending" element={<PendingPage />} />
        <Route path="/shipments/new" element={<NewShipmentState />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('PendingPage', () => {
  beforeEach(() => {
    vi.mocked(orderService.getAll).mockResolvedValue([ORDER])
    vi.mocked(carrierService.getAll).mockResolvedValue(CARRIERS)
  })

  it('informa si no se pudieron cargar las órdenes', async () => {
    vi.mocked(orderService.getAll).mockRejectedValue(new TypeError('Failed to fetch'))
    renderPendingPage()

    expect(await screen.findByText(/^No pudimos cargar las órdenes pendientes: no hay conexión/)).toBeInTheDocument()
  })

  it('avisa si no hay órdenes pendientes', async () => {
    vi.mocked(orderService.getAll).mockResolvedValue([])
    renderPendingPage()

    expect(await screen.findByText('No hay órdenes pendientes.')).toBeInTheDocument()
  })

  it.each([
    ['número de seguimiento', '100263'],
    ['cliente', 'gonzalo'],
    ['cliente sin tildes', 'rios'],
  ])('filtra por %s', async (_field, search) => {
    const user = userEvent.setup()
    vi.mocked(orderService.getAll).mockResolvedValue([ORDER, OTHER_ORDER])
    renderPendingPage()

    await screen.findByText('Florencia Ibáñez')
    await user.type(screen.getByPlaceholderText('Buscar por nº o cliente'), search)

    expect(screen.getByText('Gonzalo Ríos')).toBeInTheDocument()
    expect(screen.queryByText('Florencia Ibáñez')).not.toBeInTheDocument()
  })

  it('avisa si ninguna orden coincide con la búsqueda', async () => {
    const user = userEvent.setup()
    renderPendingPage()

    await screen.findByText('Florencia Ibáñez')
    await user.type(screen.getByPlaceholderText('Buscar por nº o cliente'), 'no existe')

    expect(screen.getByText('No hay órdenes que coincidan con la búsqueda.')).toBeInTheDocument()
  })

  it('cancela la carga si se sale de la pantalla', async () => {
    const { unmount } = renderPendingPage()
    await screen.findByText('Florencia Ibáñez')

    unmount()

    expect(vi.mocked(orderService.getAll).mock.lastCall?.[0]?.aborted).toBe(true)
    expect(vi.mocked(carrierService.getAll).mock.lastCall?.[0]?.aborted).toBe(true)
  })

  it('solo permite asignar transportistas activos', async () => {
    const user = userEvent.setup()
    renderPendingPage()

    await user.click(await screen.findByRole('combobox', { name: 'Transportista para AR-100262' }))
    const options = within(screen.getByRole('listbox')).getAllByRole('option')

    expect(options.map((option) => option.textContent)).toEqual(['Sin asignar', 'Andreani'])
  })

  it('no permite confirmar una orden sin transportista', async () => {
    renderPendingPage()

    expect(await screen.findByRole('button', { name: 'Confirmar' })).toBeDisabled()
  })

  it('al confirmar navega a nuevo envío con la orden y el transportista elegido', async () => {
    const user = userEvent.setup()
    renderPendingPage()

    await user.click(await screen.findByRole('combobox', { name: 'Transportista para AR-100262' }))
    await user.click(screen.getByRole('option', { name: 'Andreani' }))
    await user.click(screen.getByRole('button', { name: 'Confirmar' }))

    expect(await screen.findByText(JSON.stringify({ order: ORDER, carrierId: 1 }))).toBeInTheDocument()
  })
})
