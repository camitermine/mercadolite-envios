import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { CarrierFormPage } from './CarrierFormPage'
import { carrierService } from '../../services/carrierService'
import { ApiError } from '../../services/errors'

vi.mock('../../services/carrierService', () => ({
  carrierService: {
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}))

function renderNewCarrierForm() {
  return render(
    <MemoryRouter initialEntries={['/carriers/new']}>
      <Routes>
        <Route path="/carriers/new" element={<CarrierFormPage />} />
        <Route path="/carriers" element={<div>Listado de transportistas</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('CarrierFormPage', () => {
  beforeEach(() => {
    vi.mocked(carrierService.create).mockResolvedValue()
  })

  it('muestra validaciones al guardar vacío', async () => {
    const user = userEvent.setup()
    renderNewCarrierForm()

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText('El nombre es obligatorio')).toBeInTheDocument()
    expect(screen.getByText('El teléfono es obligatorio')).toBeInTheDocument()
    expect(screen.getByText('La cobertura es obligatoria')).toBeInTheDocument()
    expect(carrierService.create).not.toHaveBeenCalled()
  })

  it('normaliza, crea y vuelve al listado', async () => {
    const user = userEvent.setup()
    renderNewCarrierForm()

    await user.type(screen.getByLabelText('Nombre'), '  Andreani  ')
    await user.type(screen.getByLabelText('Teléfono'), ' 0810-122-1112 ')
    await user.type(screen.getByLabelText('Cobertura'), ' Nacional ')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => expect(carrierService.create).toHaveBeenCalledWith({
      name: 'Andreani',
      phone: '0810-122-1112',
      coverage: 'Nacional',
      status: 'Activo',
    }))
    expect(await screen.findByText('Listado de transportistas')).toBeInTheDocument()
  })

  it('muestra junto al campo los errores enviados por el backend', async () => {
    const user = userEvent.setup()
    vi.mocked(carrierService.create).mockRejectedValue(
      new ApiError(400, 'Hay datos inválidos', { phone: 'El teléfono ya está registrado' }),
    )
    renderNewCarrierForm()

    await user.type(screen.getByLabelText('Nombre'), 'Andreani')
    await user.type(screen.getByLabelText('Teléfono'), '0810-122-1112')
    await user.type(screen.getByLabelText('Cobertura'), 'Nacional')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText('El teléfono ya está registrado')).toBeInTheDocument()
    expect(screen.queryByText('Hay datos inválidos')).not.toBeInTheDocument()
  })
})
