import { router } from 'pelelajs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Pedido } from '../../dominio/pedido'
import type { Usuario } from '../../dominio/usuario'
import type { PedidoService } from '../../services/pedido.service'
import {
  crearPedidoServiceSinApi,
  crearProducto,
  crearUsuario,
  pedirYObtener,
} from '../../testing/fixtures'
import { MisPedidos } from './misPedidos'

describe('MisPedidos', () => {
  let servicio: PedidoService
  let usuario: Usuario

  function pedir(
    title: string = 'Producto',
    cantidad: number = 1,
    quien: Usuario = usuario,
  ): Promise<Pedido> {
    return pedirYObtener(servicio, crearProducto({ title }), cantidad, quien)
  }

  async function abrirMisPedidos(): Promise<MisPedidos> {
    const misPedidos = new MisPedidos(servicio, usuario)
    await misPedidos.initialize()
    return misPedidos
  }

  beforeEach(() => {
    servicio = crearPedidoServiceSinApi()
    usuario = crearUsuario()
    vi.spyOn(router, 'navigateTo').mockImplementation(() => undefined)
    vi.spyOn(router, 'searchParameters').mockReturnValue({})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('al entrar carga desde la API los pedidos del usuario', async () => {
    await pedir('Teléfono', 1)
    await pedir('Auriculares', 3)
    await pedir('Mate', 1, crearUsuario('Otra Persona'))

    const misPedidos = await abrirMisPedidos()

    expect(misPedidos.pedidos.map((pedido) => pedido.producto.title)).toEqual([
      'Teléfono',
      'Auriculares',
    ])
    expect(misPedidos.hayPedidos).toBe(true)
    expect(misPedidos.estadoVacio).toBe(false)
    expect(misPedidos.cargando).toBe(false)
  })

  it('muestra el estado vacío cuando no hay pedidos', async () => {
    const misPedidos = await abrirMisPedidos()

    expect(misPedidos.estadoVacio).toBe(true)
    expect(misPedidos.sinResultados).toBe(false)
  })

  it('no muestra el estado vacío mientras carga', () => {
    const misPedidos = new MisPedidos(servicio, usuario)

    misPedidos.cargando = true

    expect(misPedidos.estadoVacio).toBe(false)
  })

  it('informa un error si no puede cargar los pedidos', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.spyOn(servicio, 'obtenerDelUsuario').mockRejectedValue(new Error('sin conexión'))

    const misPedidos = await abrirMisPedidos()

    expect(misPedidos.mensajeError).toBe('No pudimos cargar tus pedidos. Intentá nuevamente.')
    expect(misPedidos.estadoVacio).toBe(false)
    expect(misPedidos.cargando).toBe(false)
  })

  it('filtra los pedidos por el nombre del producto', async () => {
    await pedir('Teléfono')
    await pedir('Auriculares', 2)
    const misPedidos = await abrirMisPedidos()

    misPedidos.busquedaAplicada = 'auriculares'

    expect(misPedidos.pedidosFiltrados.map((pedido) => pedido.producto.title)).toEqual([
      'Auriculares',
    ])
    expect(misPedidos.sinResultados).toBe(false)
  })

  it('indica cuando ningún pedido coincide con la búsqueda', async () => {
    await pedir()
    const misPedidos = await abrirMisPedidos()

    misPedidos.busquedaAplicada = 'inexistente'

    expect(misPedidos.pedidosFiltrados).toEqual([])
    expect(misPedidos.sinResultados).toBe(true)
    expect(misPedidos.estadoVacio).toBe(false)
  })

  describe('confirmación de un pedido recién hecho', () => {
    it('muestra el mensaje con el número de seguimiento que llega en la URL', async () => {
      vi.spyOn(router, 'searchParameters').mockReturnValue({ confirmado: 'AR-104' })

      const misPedidos = await abrirMisPedidos()

      expect(misPedidos.mensajeConfirmacion).toBe('¡Pedido AR-104 confirmado con éxito!')
    })

    it('saca el número de la URL para que no vuelva a aparecer al recargar', async () => {
      const replaceState = vi.fn()
      vi.stubGlobal('history', { replaceState })
      vi.spyOn(router, 'searchParameters').mockReturnValue({ confirmado: 'AR-104' })

      await abrirMisPedidos()

      expect(replaceState).toHaveBeenCalledWith(null, '', '/mis-pedidos')
    })

    it('no toca la URL si no viene de confirmar un pedido', async () => {
      const replaceState = vi.fn()
      vi.stubGlobal('history', { replaceState })

      await abrirMisPedidos()

      expect(replaceState).not.toHaveBeenCalled()
    })

    it('no muestra mensaje si se entra a la pantalla directamente', async () => {
      const misPedidos = await abrirMisPedidos()

      expect(misPedidos.mensajeConfirmacion).toBe('')
    })

    it('se puede cerrar', async () => {
      vi.spyOn(router, 'searchParameters').mockReturnValue({ confirmado: 'AR-104' })
      const misPedidos = await abrirMisPedidos()

      misPedidos.cerrarConfirmacion()

      expect(misPedidos.mensajeConfirmacion).toBe('')
    })
  })

  describe('cancelarPedido', () => {
    it('expone un callback para las cards que cancela el pedido recibido', async () => {
      const pedido = await pedir()
      const misPedidos = await abrirMisPedidos()

      await misPedidos.alCancelarPedido({ pedido })

      expect(misPedidos.pedidos).toEqual([])
    })

    it('le pide la cancelación al service y vuelve a cargar la lista', async () => {
      const primero = await pedir('Teléfono')
      await pedir('Auriculares', 2)
      const misPedidos = await abrirMisPedidos()

      await misPedidos.cancelarPedido(primero)

      expect(misPedidos.pedidos.map((pedido) => pedido.producto.title)).toEqual(['Auriculares'])
    })

    it('oculta la confirmación si se cancela el pedido recién confirmado', async () => {
      const pedido = await pedir()
      vi.spyOn(router, 'searchParameters').mockReturnValue({
        confirmado: pedido.numeroSeguimiento,
      })
      const misPedidos = await abrirMisPedidos()

      await misPedidos.cancelarPedido(pedido)

      expect(misPedidos.mensajeConfirmacion).toBe('')
    })

    it('informa un error y conserva el pedido si no se puede cancelar', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined)
      const pedido = await pedir()
      vi.spyOn(servicio, 'cancelar').mockRejectedValue(new Error('HTTP 400'))
      const misPedidos = await abrirMisPedidos()

      await misPedidos.cancelarPedido(pedido)

      expect(misPedidos.pedidos).toHaveLength(1)
      expect(misPedidos.mensajeError).toBe('No pudimos cancelar el pedido. Intentá nuevamente.')
    })
  })

  it('navega al catálogo sin recargar la página', () => {
    const evento = { preventDefault: vi.fn() } as unknown as Event
    const misPedidos = new MisPedidos(servicio, usuario)

    misPedidos.irAlCatalogo(misPedidos, evento)

    expect(evento.preventDefault).toHaveBeenCalled()
    expect(router.navigateTo).toHaveBeenCalledWith('/catalogo')
  })
})
