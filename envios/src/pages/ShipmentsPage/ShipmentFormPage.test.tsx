import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { ShipmentFormPage } from './ShipmentFormPage'
import { carrierService } from '../../services/carrierService'
import { ApiError } from '../../services/errors'
import { shipmentService } from '../../services/shipmentService'

vi.mock('../../services/carrierService', () => ({
  carrierService: {
    getAll: vi.fn(),
  },
}))

vi.mock('../../services/shipmentService', () => ({
  shipmentService: {
    getByTrackingNumber: vi.fn(),
    update: vi.fn(),
  },
}))

const DELAYED_SHIPMENT = {
  id: 2,
  trackingNumber: 'AR-100235',
  clientName: 'Martín González',
  address: 'Av. Rivadavia 6800',
  destination: 'Flores, CABA',
  product: 'Celular Samsung',
  carrierId: 5,
  carrier: 'Andreani',
  status: 'Demorado' as const,
  estimatedDate: '2020-01-10',
  effectiveDate: null,
}

const CARRIERS = [
  { id: 1, name: 'Andreani', phone: '0810-122-1112', coverage: 'Nacional', status: 'Activo' as const },
  { id: 4, name: 'Urbano', phone: '011-4000-1000', coverage: 'AMBA', status: 'Inactivo' as const },
  { id: 5, name: 'Cruz del Sur', phone: '0810-222-2789', coverage: 'Patagonia', status: 'Inactivo' as const },
]

function renderPage(mode: 'edit' | 'view', trackingNumber = DELAYED_SHIPMENT.trackingNumber) {
  return render(
    <MemoryRouter initialEntries={[`/shipments/${trackingNumber}/${mode}`]}>
      <Routes>
        <Route path={`/shipments/:trackingNumber/${mode}`} element={<ShipmentFormPage mode={mode} />} />
        <Route path="/shipments" element={<div>Listado de envíos</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ShipmentFormPage', () => {
  beforeEach(() => {
    vi.mocked(shipmentService.getByTrackingNumber).mockResolvedValue(DELAYED_SHIPMENT)
    vi.mocked(shipmentService.update).mockReset()
    vi.mocked(carrierService.getAll).mockResolvedValue(CARRIERS)
  })

  it('precarga el envío con su estado y fechas', async () => {
    renderPage('edit')

    expect(await screen.findByLabelText('Nº de seguimiento')).toHaveValue('AR-100235')
    expect(screen.getByLabelText('Cliente')).toHaveValue('Martín González')
    expect(screen.getByLabelText('Estado')).toHaveValue('Demorado')
    expect(screen.getByLabelText('Fecha estimada de entrega')).toHaveValue('2020-01-10')
    expect(screen.getByLabelText('Fecha efectiva de entrega')).toHaveValue('Sin entregar')
  })

  it('ofrece los transportistas activos y conserva el actual aunque esté inactivo', async () => {
    const user = userEvent.setup()
    renderPage('edit')

    await user.click(await screen.findByLabelText('Transportista'))
    const options = within(screen.getByRole('listbox')).getAllByRole('option')

    expect(options.map((option) => option.textContent)).toEqual(['Andreani', 'Cruz del Sur'])
  })

  it('guarda un envío demorado sin obligar a cambiar la fecha', async () => {
    const user = userEvent.setup()
    vi.mocked(shipmentService.update).mockResolvedValue(undefined)
    renderPage('edit')

    const client = await screen.findByLabelText('Cliente')
    await user.clear(client)
    await user.type(client, 'Lucía Fernández')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => expect(shipmentService.update).toHaveBeenCalledWith('AR-100235', {
      clientName: 'Lucía Fernández',
      address: 'Av. Rivadavia 6800',
      destination: 'Flores, CABA',
      product: 'Celular Samsung',
      carrierId: 5,
      estimatedDate: '2020-01-10',
    }))
    expect(await screen.findByText('Listado de envíos')).toBeInTheDocument()
  })

  it('rechaza cambiar la fecha por otra que no sea futura', async () => {
    const user = userEvent.setup()
    renderPage('edit')

    fireEvent.change(await screen.findByLabelText('Fecha estimada de entrega'), { target: { value: '2020-02-01' } })
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText('Elegí una fecha futura')).toBeInTheDocument()
    expect(shipmentService.update).not.toHaveBeenCalled()
  })

  it('valida los datos con las mismas reglas que la creación', async () => {
    const user = userEvent.setup()
    renderPage('edit')

    await user.clear(await screen.findByLabelText('Cliente'))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText('El cliente es obligatorio')).toBeInTheDocument()
    expect(shipmentService.update).not.toHaveBeenCalled()
  })

  it('en modo ver no permite modificar ni guardar', async () => {
    renderPage('view')

    expect(await screen.findByLabelText('Cliente')).toBeDisabled()
    expect(screen.getByLabelText('Fecha estimada de entrega')).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Guardar' })).not.toBeInTheDocument()
  })

  it('pide al backend solo el envío de la URL', async () => {
    renderPage('edit')

    await screen.findByLabelText('Nº de seguimiento')

    expect(shipmentService.getByTrackingNumber).toHaveBeenCalledWith('AR-100235', expect.any(AbortSignal))
  })

  it('avisa si el envío no existe', async () => {
    vi.mocked(shipmentService.getByTrackingNumber).mockRejectedValue(new ApiError(404, 'No se encontró el envío'))
    renderPage('edit', 'AR-999999')

    expect(await screen.findByText('No se encontró el envío')).toBeInTheDocument()
  })
})
