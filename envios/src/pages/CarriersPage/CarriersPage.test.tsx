import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { CarriersPage } from './CarriersPage'
import { carrierService } from '../../services/carrierService'

vi.mock('../../services/carrierService', () => ({
  carrierService: {
    getAll: vi.fn(),
    delete: vi.fn(),
  },
}))

const CARRIER = {
  id: 1,
  name: 'Andreani',
  phone: '0810-122-1112',
  coverage: 'Nacional',
  status: 'Activo' as const,
}

describe('CarriersPage', () => {
  beforeEach(() => {
    vi.mocked(carrierService.getAll).mockResolvedValue([CARRIER])
    vi.mocked(carrierService.delete).mockResolvedValue()
  })

  it('muestra los transportistas obtenidos', async () => {
    render(<MemoryRouter><CarriersPage /></MemoryRouter>)

    expect(await screen.findByText('Andreani')).toBeInTheDocument()
    expect(screen.getByText('0810-122-1112')).toBeInTheDocument()
  })

  it('elimina desde el evento y actualiza la lista', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><CarriersPage /></MemoryRouter>)

    await user.click(await screen.findByRole('button', { name: 'Eliminar Andreani' }))
    const dialog = screen.getByRole('dialog', { name: 'Eliminar transportista' })

    expect(within(dialog).getByText(/¿Querés eliminar a Andreani\?/)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Eliminar' }))

    expect(carrierService.delete).toHaveBeenCalledWith(1)
    await waitFor(() => expect(screen.queryByText('Andreani')).not.toBeInTheDocument())
  })

  it('cancela la eliminación desde el modal', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><CarriersPage /></MemoryRouter>)

    await user.click(await screen.findByRole('button', { name: 'Eliminar Andreani' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }))

    expect(carrierService.delete).not.toHaveBeenCalled()
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByText('Andreani')).toBeInTheDocument()
  })

  it('informa un error de carga', async () => {
    vi.mocked(carrierService.getAll).mockRejectedValue(new TypeError('Failed to fetch'))
    render(<MemoryRouter><CarriersPage /></MemoryRouter>)

    expect(await screen.findByText(/^No pudimos cargar los transportistas: no hay conexión/)).toBeInTheDocument()
    expect(screen.queryByText('Failed to fetch')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })
})
