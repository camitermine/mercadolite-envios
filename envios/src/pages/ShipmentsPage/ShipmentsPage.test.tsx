import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import type { Shipment } from '../../domain/Shipment'
import { ApiError } from '../../services/errors'
import { shipmentService } from '../../services/shipmentService'
import { ShipmentsPage } from './ShipmentsPage'

vi.mock('../../services/shipmentService', () => ({
  shipmentService: {
    getAll: vi.fn(),
    getStatuses: vi.fn(),
    deliver: vi.fn(),
  },
}))

const IN_TRANSIT: Shipment = {
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

const DELAYED: Shipment = {
  ...IN_TRANSIT,
  id: 2,
  trackingNumber: 'AR-100236',
  clientName: 'Diego Sosa',
  destination: 'Córdoba, Córdoba',
  carrier: 'Correo Argentino',
  status: 'Demorado',
  estimatedDate: '2026-07-01',
}

const DELIVERED: Shipment = {
  ...IN_TRANSIT,
  id: 3,
  trackingNumber: 'AR-100237',
  clientName: 'Sofía Ramírez',
  destination: 'La Plata, Bs. As.',
  status: 'Entregado',
  estimatedDate: '2026-07-02',
  effectiveDate: '2026-07-03',
}

function manyShipments(count: number): Shipment[] {
  return Array.from({ length: count }, (_, index) => ({
    ...IN_TRANSIT,
    id: index + 1,
    trackingNumber: `AR-2000${String(index + 1).padStart(2, '0')}`,
    clientName: `Cliente ${index + 1}`,
  }))
}

function renderShipmentsPage() {
  return render(
    <MemoryRouter initialEntries={['/shipments']}>
      <Routes>
        <Route path="/shipments" element={<ShipmentsPage />} />
        <Route path="/shipments/:trackingNumber/view" element={<div>Detalle del envío</div>} />
        <Route path="/shipments/:trackingNumber/edit" element={<div>Edición del envío</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

function rowOf(trackingNumber: string): HTMLElement {
  return screen.getByText(trackingNumber).closest('tr') as HTMLElement
}

describe('ShipmentsPage', () => {
  beforeEach(() => {
    vi.mocked(shipmentService.getAll).mockReset()
    vi.mocked(shipmentService.getStatuses).mockReset()
    vi.mocked(shipmentService.deliver).mockReset()

    vi.mocked(shipmentService.getAll).mockResolvedValue([IN_TRANSIT, DELAYED, DELIVERED])
    vi.mocked(shipmentService.getStatuses).mockResolvedValue([
      'En camino',
      'Demorado',
      'Entregado',
    ])
    vi.mocked(shipmentService.deliver).mockResolvedValue()
  })

  it('muestra cada envío con su estado, transportista y fecha estimada', async () => {
    renderShipmentsPage()

    await screen.findByText('AR-100234')
    const row = within(rowOf('AR-100236'))

    expect(row.getByText('Diego Sosa')).toBeInTheDocument()
    expect(row.getByText('Córdoba, Córdoba')).toBeInTheDocument()
    expect(row.getByText('Demorado')).toBeInTheDocument()
    expect(row.getByText('Correo Argentino')).toBeInTheDocument()
    expect(row.getByText('2026-07-01')).toBeInTheDocument()
  })

  it('muestra la fecha estimada aunque el envío ya tenga fecha de entrega', async () => {
    renderShipmentsPage()

    await screen.findByText('AR-100237')
    const row = within(rowOf('AR-100237'))

    expect(row.getByText('2026-07-02')).toBeInTheDocument()
    expect(row.queryByText('2026-07-03')).not.toBeInTheDocument()
  })

  it('informa si no se pudieron cargar los envíos', async () => {
    vi.mocked(shipmentService.getAll).mockRejectedValue(new TypeError('Failed to fetch'))
    renderShipmentsPage()

    expect(await screen.findByText(/^No pudimos cargar los envíos: no hay conexión/)).toBeInTheDocument()
  })

  it('avisa si no hay envíos para mostrar', async () => {
    vi.mocked(shipmentService.getAll).mockResolvedValue([])
    renderShipmentsPage()

    expect(await screen.findByText('No hay envíos que coincidan con la búsqueda.')).toBeInTheDocument()
  })

  it.each([
    ['número de seguimiento', '100236'],
    ['cliente', 'diego'],
  ])('filtra por %s', async (_field, search) => {
    const user = userEvent.setup()
    renderShipmentsPage()

    await screen.findByText('AR-100234')
    await user.type(screen.getByPlaceholderText('Buscar por nº o cliente'), search)

    expect(screen.getByText('AR-100236')).toBeInTheDocument()
    expect(screen.queryByText('AR-100234')).not.toBeInTheDocument()
    expect(screen.queryByText('AR-100237')).not.toBeInTheDocument()
  })

  it('obtiene los estados disponibles del backend', async () => {
    const user = userEvent.setup()

    vi.mocked(shipmentService.getStatuses).mockResolvedValue([
      'En camino',
      'Demorado',
    ])

    renderShipmentsPage()

    await screen.findByText('AR-100234')
    await user.click(screen.getByRole('combobox'))

    expect(shipmentService.getStatuses).toHaveBeenCalledTimes(1)
    expect(await screen.findByRole('option', { name: 'En camino' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Demorado' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Entregado' })).not.toBeInTheDocument()
  })

  it('solicita al backend los envíos filtrados por estado', async () => {
    const user = userEvent.setup()

    vi.mocked(shipmentService.getAll)
      .mockResolvedValueOnce([IN_TRANSIT, DELAYED, DELIVERED])
      .mockResolvedValueOnce([DELIVERED])

    renderShipmentsPage()

    await screen.findByText('AR-100234')
    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'Entregado' }))

    expect(await screen.findByText('AR-100237')).toBeInTheDocument()
    expect(shipmentService.getAll).toHaveBeenLastCalledWith(
      expect.any(AbortSignal),
      'Entregado',
    )
    expect(screen.queryByText('AR-100234')).not.toBeInTheDocument()
    expect(screen.queryByText('AR-100236')).not.toBeInTheDocument()
  })

  it('muestra de a 10 envíos y el resto en la página siguiente', async () => {
    const user = userEvent.setup()
    vi.mocked(shipmentService.getAll).mockResolvedValue(manyShipments(12))
    renderShipmentsPage()

    await screen.findByText('AR-200001')
    expect(screen.getByText('AR-200010')).toBeInTheDocument()
    expect(screen.queryByText('AR-200011')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /page 2/i }))

    expect(screen.getByText('AR-200011')).toBeInTheDocument()
    expect(screen.getByText('AR-200012')).toBeInTheDocument()
    expect(screen.queryByText('AR-200001')).not.toBeInTheDocument()
  })

  it('no muestra el paginado si los envíos entran en una página', async () => {
    renderShipmentsPage()

    await screen.findByText('AR-100234')

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('al buscar vuelve a la primera página', async () => {
    const user = userEvent.setup()
    vi.mocked(shipmentService.getAll).mockResolvedValue(manyShipments(12))
    renderShipmentsPage()

    await screen.findByText('AR-200001')
    await user.click(screen.getByRole('button', { name: /page 2/i }))
    await user.click(screen.getByPlaceholderText('Buscar por nº o cliente'))
    await user.paste('AR-200003')

    expect(screen.getByText('AR-200003')).toBeInTheDocument()
  })

  it('solo ofrece entregar los envíos que no fueron entregados', async () => {
    renderShipmentsPage()

    await screen.findByText('AR-100234')

    expect(within(rowOf('AR-100234')).getByRole('button', { name: 'Entregar' })).toBeInTheDocument()
    expect(within(rowOf('AR-100236')).getByRole('button', { name: 'Entregar' })).toBeInTheDocument()
    expect(within(rowOf('AR-100237')).queryByRole('button', { name: 'Entregar' })).not.toBeInTheDocument()
  })

  it('al entregar avisa al backend y vuelve a pedir los envíos', async () => {
    const user = userEvent.setup()
    vi.mocked(shipmentService.getAll)
      .mockResolvedValueOnce([IN_TRANSIT])
      .mockResolvedValueOnce([{ ...IN_TRANSIT, status: 'Entregado', effectiveDate: '2026-07-04' }])
    renderShipmentsPage()

    await user.click(await screen.findByRole('button', { name: 'Entregar' }))

    await screen.findByText('Entregado')
    expect(shipmentService.deliver).toHaveBeenCalledWith('AR-100234')
    expect(shipmentService.getAll).toHaveBeenCalledTimes(2)
    expect(screen.queryByRole('button', { name: 'Entregar' })).not.toBeInTheDocument()
  })

  it('con "Todos" pide los envíos sin filtro de estado', async () => {
    renderShipmentsPage()

    await screen.findByText('AR-100234')

    expect(shipmentService.getAll).toHaveBeenCalledWith(expect.any(AbortSignal), undefined)
  })

  it('mientras entrega deshabilita los botones para no mandar dos veces el pedido', async () => {
    const user = userEvent.setup()
    let finishDelivery = () => {}
    vi.mocked(shipmentService.deliver).mockReturnValue(
      new Promise<void>((resolve) => {
        finishDelivery = resolve
      }),
    )
    renderShipmentsPage()

    await screen.findByText('AR-100234')
    await user.click(within(rowOf('AR-100234')).getByRole('button', { name: 'Entregar' }))

    expect(within(rowOf('AR-100234')).getByRole('button', { name: 'Entregando...' })).toBeDisabled()
    expect(within(rowOf('AR-100236')).getByRole('button', { name: 'Entregar' })).toBeDisabled()

    finishDelivery()

    expect(await within(rowOf('AR-100236')).findByRole('button', { name: 'Entregar' })).toBeEnabled()
    expect(shipmentService.deliver).toHaveBeenCalledTimes(1)
  })

  it('al filtrar deja la tabla visible mientras llegan los datos', async () => {
    const user = userEvent.setup()
    vi.mocked(shipmentService.getAll)
      .mockResolvedValueOnce([IN_TRANSIT, DELAYED, DELIVERED])
      .mockReturnValueOnce(new Promise(() => {}))
    renderShipmentsPage()

    await screen.findByText('AR-100234')
    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'Demorado' }))

    expect(screen.getByText('AR-100236')).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('muestra el motivo del backend si no se pudo entregar y deja la lista como estaba', async () => {
    const user = userEvent.setup()
    vi.mocked(shipmentService.deliver).mockRejectedValue(new ApiError(400, 'El envío ya fue entregado'))
    renderShipmentsPage()

    await screen.findByText('AR-100234')
    await user.click(within(rowOf('AR-100234')).getByRole('button', { name: 'Entregar' }))

    expect(await screen.findByText('El envío ya fue entregado')).toBeInTheDocument()
    expect(shipmentService.getAll).toHaveBeenCalledTimes(1)
    expect(within(rowOf('AR-100234')).getByText('En camino')).toBeInTheDocument()
  })

  it.each([
    ['Ver', 'Detalle del envío'],
    ['Editar', 'Edición del envío'],
  ])('%s navega a la pantalla del envío', async (action, destination) => {
    const user = userEvent.setup()
    renderShipmentsPage()

    await screen.findByText('AR-100234')
    await user.click(within(rowOf('AR-100234')).getByRole('button', { name: action }))

    expect(await screen.findByText(destination)).toBeInTheDocument()
  })
})
