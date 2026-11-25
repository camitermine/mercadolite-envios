import { describe, expect, it, vi } from 'vitest'
import { BarraBusqueda } from './barra-busqueda'

describe('BarraBusqueda', () => {
  it('aplica la búsqueda normalizada sin recargar la página', () => {
    const barra = new BarraBusqueda()
    const evento = { preventDefault: vi.fn() } as unknown as Event
    barra.busqueda = '  AURICULARES '

    barra.buscar(barra, evento)

    expect(evento.preventDefault).toHaveBeenCalled()
    expect(barra.busquedaAplicada).toBe('auriculares')
  })

  it('no aplica el texto hasta que se busca', () => {
    const barra = new BarraBusqueda()

    barra.busqueda = 'teléfono'

    expect(barra.busquedaAplicada).toBe('')
  })
})
