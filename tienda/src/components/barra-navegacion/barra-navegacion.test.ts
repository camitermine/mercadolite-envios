import { router } from 'pelelajs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BarraNavegacion } from './barra-navegacion'

describe('BarraNavegacion', () => {
  let navegacion: BarraNavegacion

  beforeEach(() => {
    navegacion = new BarraNavegacion()
    vi.spyOn(router, 'navigateTo').mockImplementation(() => undefined)
  })

  it('arranca con el menú cerrado', () => {
    expect(navegacion.menuAbierto).toBe(false)
    expect(navegacion.menuCerrado).toBe(true)
    expect(navegacion.clasesMenu).toEqual({ 'menu-abierto': false })
  })

  it('abre y cierra el menú hamburguesa', () => {
    navegacion.alternarMenu()

    expect(navegacion.menuAbierto).toBe(true)
    expect(navegacion.clasesMenu).toEqual({ 'menu-abierto': true })

    navegacion.alternarMenu()

    expect(navegacion.menuAbierto).toBe(false)
  })

  it('navega al catálogo sin recargar la aplicación y cierra el menú', () => {
    const evento = { preventDefault: vi.fn() } as unknown as Event
    navegacion.alternarMenu()

    navegacion.irAlCatalogo(navegacion, evento)

    expect(evento.preventDefault).toHaveBeenCalled()
    expect(router.navigateTo).toHaveBeenCalledWith('/catalogo')
    expect(navegacion.menuAbierto).toBe(false)
  })

  it('navega a mis pedidos', () => {
    navegacion.irAMisPedidos()

    expect(router.navigateTo).toHaveBeenCalledWith('/mis-pedidos')
  })
})
