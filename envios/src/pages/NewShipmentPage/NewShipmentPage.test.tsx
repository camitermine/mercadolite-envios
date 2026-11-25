
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { NewShipmentPage } from './NewShipmentPage'
import { ApiError } from '../../services/errors'
import { carrierService } from '../../services/carrierService'
import { shipmentService } from '../../services/shipmentService'

vi.mock('../../services/carrierService', () => ({
  carrierService: {
    getAll: vi.fn(),
  },
}))

vi.mock('../../services/shipmentService', () => ({
  shipmentService: {
    create: vi.fn(),
  },
}))

const ORDER = {
  trackingNumber: 'AR-100262',
  clientName: 'Florencia Ibáñez',
  address: 'Av. Centenario 1250',
  destination: 'San Isidro, Bs. As.',
  product: 'Zapatillas running',
}

const CARRIERS = [
  { id: 1, name: 'Andreani', phone: '0810-122-1112', coverage: 'Nacional', status: 'Activo' as const },
  { id: 2, name: 'OCA', phone: '0810-999-6222', coverage: 'Nacional', status: 'Activo' as const },
  { id: 5, name: 'Cruz del Sur', phone: '0810-222-2789', coverage: 'Patagonia', status: 'Inactivo' as const },
]

function renderNewShipmentPage(state?: object) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/shipments/new', state }]}>
      <Routes>
        <Route path="/shipments/new" element={<NewShipmentPage />} />
        <Route path="/shipments" element={<div>Listado de envíos</div>} />
        <Route path="/pending" element={<div>Listado de pendientes</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('NewShipmentPage', () => {
  beforeEach(() => {
    vi.mocked(carrierService.getAll).mockResolvedValue(CARRIERS)
    vi.mocked(shipmentService.create).mockReset()
  })

  it('precarga los datos de la orden y el transportista elegido', async () => {
    renderNewShipmentPage({ order: ORDER, carrierId: 2 })

    expect(await screen.findByLabelText('Nº de seguimiento')).toHaveValue('AR-100262')
    expect(screen.getByLabelText('Cliente')).toHaveValue('Florencia Ibáñez')
    expect(screen.getByLabelText('Dirección')).toHaveValue('Av. Centenario 1250')
    expect(screen.getByLabelText('Localidad')).toHaveValue('San Isidro, Bs. As.')
    expect(screen.getByLabelText('Producto')).toHaveValue('Zapatillas running')
    expect(screen.getByLabelText('Transportista')).toHaveTextContent('OCA')
  })

  it('muestra el estado inicial del envío sin permitir cambiarlo', async () => {
    renderNewShipmentPage({ order: ORDER, carrierId: 1 })

    const status = await screen.findByLabelText('Estado')

    expect(status).toHaveValue('En camino')
    expect(status).toHaveAttribute('readonly')
  })

  it('solo ofrece transportistas activos', async () => {
    const user = userEvent.setup()
    renderNewShipmentPage({ order: ORDER, carrierId: 1 })

    await user.click(await screen.findByLabelText('Transportista'))
    const carrierOptions = within(screen.getByRole('listbox')).getAllByRole('option')

    expect(carrierOptions.map((option) => option.textContent)).toEqual(['Andreani', 'OCA'])
  })

  it('muestra validaciones y no guarda si faltan datos', async () => {
    const user = userEvent.setup()
    renderNewShipmentPage({ order: ORDER, carrierId: 1 })

    await user.clear(await screen.findByLabelText('Cliente'))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText('El cliente es obligatorio')).toBeInTheDocument()
    expect(screen.getByText('Elegí una fecha futura')).toBeInTheDocument()
    expect(shipmentService.create).not.toHaveBeenCalled()
  })

  it('pide elegir de nuevo si el transportista elegido está inactivo', async () => {
    const user = userEvent.setup()
    renderNewShipmentPage({ order: ORDER, carrierId: 5 })

    await user.click(await screen.findByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText('Seleccioná un transportista')).toBeInTheDocument()
  })

  it('crea el envío y navega a la vista de envíos', async () => {
    const user = userEvent.setup()

    vi.mocked(shipmentService.create).mockResolvedValue()

    renderNewShipmentPage({ order: ORDER, carrierId: 1 })

    fireEvent.change(await screen.findByLabelText('Fecha estimada de entrega'), {
      target: { value: '2999-01-01' },
    })
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(shipmentService.create).toHaveBeenCalledWith({
        ...ORDER,
        carrierId: 1,
        estimatedDate: '2999-01-01',
      }),
    )

    expect(await screen.findByText('Listado de envíos')).toBeInTheDocument()
  })

  it.each([
    [404, 'La orden solicitada no existe'],
    [400, 'El transportista seleccionado está inactivo'],
  ])('muestra el mensaje del backend cuando responde %i', async (status, message) => {
    const user = userEvent.setup()
    vi.mocked(shipmentService.create).mockRejectedValue(new ApiError(status, message))
    renderNewShipmentPage({ order: ORDER, carrierId: 1 })

    fireEvent.change(await screen.findByLabelText('Fecha estimada de entrega'), {
      target: { value: '2999-01-01' },
    })
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText(message)).toBeInTheDocument()
  })

  it('muestra junto al campo los errores enviados por el backend', async () => {
    const user = userEvent.setup()

    vi.mocked(shipmentService.create).mockRejectedValue(
      new ApiError(400, 'Hay datos inválidos', {
        clientName: 'El cliente no puede superar los 80 caracteres',
      }),
    )

    renderNewShipmentPage({ order: ORDER, carrierId: 1 })

    fireEvent.change(await screen.findByLabelText('Fecha estimada de entrega'), {
      target: { value: '2999-01-01' },
    })
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText('El cliente no puede superar los 80 caracteres')).toBeInTheDocument()
    expect(screen.queryByText('Hay datos inválidos')).not.toBeInTheDocument()
  })

  it.each([
    ['un error 500', new ApiError(500, 'NullPointerException'), /^No pudimos guardar el envío: ocurrió un error en el servidor/],
    ['una falla de red', new TypeError('Failed to fetch'), /^No pudimos guardar el envío: no hay conexión/],
  ])('muestra un mensaje sin detalles técnicos ante %s', async (_case, error, expected) => {
    const user = userEvent.setup()
    vi.mocked(shipmentService.create).mockRejectedValue(error)
    renderNewShipmentPage({ order: ORDER, carrierId: 1 })

    fireEvent.change(await screen.findByLabelText('Fecha estimada de entrega'), {
      target: { value: '2999-01-01' },
    })
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText(expected)).toBeInTheDocument()
    expect(screen.queryByText(error.message)).not.toBeInTheDocument()
  })

  it('vuelve a pendientes si se accede sin una orden', async () => {
    renderNewShipmentPage()

    expect(await screen.findByText('Listado de pendientes')).toBeInTheDocument()
  })
})
