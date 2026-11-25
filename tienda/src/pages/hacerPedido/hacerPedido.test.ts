import { router } from 'pelelajs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DatosEntrega } from '../../dominio/datosEntrega'
import type { Usuario } from '../../dominio/usuario'
import type { PedidoService } from '../../services/pedido.service'
import { ProductoService } from '../../services/producto.service'
import {
  crearDatosEntregaValidos,
  crearPedidoServiceSinApi,
  crearProducto,
  crearUsuario,
} from '../../testing/fixtures'
import { FormateadorMoneda } from '../../utils/formateadorMoneda'
import { HacerPedido } from './hacerPedido'

describe('HacerPedido', () => {
  let vm: HacerPedido
  let servicioPedidos: PedidoService
  let servicioProductos: ProductoService
  let usuario: Usuario

  beforeEach(() => {
    servicioPedidos = crearPedidoServiceSinApi()
    servicioProductos = new ProductoService()
    usuario = crearUsuario()
    vm = new HacerPedido(servicioPedidos, servicioProductos, usuario)
    vi.spyOn(router, 'navigateTo').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('al inicializarse', () => {
    it('carga el producto y la cantidad que vienen en la URL', async () => {
      const producto = crearProducto({ id: 7, stock: 5 })
      vi.spyOn(router, 'searchParameters').mockReturnValue({ producto: '7', cantidad: '3' })
      const obtenerProducto = vi
        .spyOn(servicioProductos, 'obtenerProducto')
        .mockResolvedValue(producto)

      await vm.initialize()

      expect(obtenerProducto).toHaveBeenCalledWith(7)
      expect(vm.producto).toBe(producto)
      expect(vm.cantidadPedido).toBe(3)
      expect(vm.productoCargado).toBe(true)
      expect(vm.cargandoProducto).toBe(false)
      expect(vm.precioTotalFormateado).toBe(FormateadorMoneda.formatear(300))
    })

    it('rechaza una cantidad que el producto no acepta', async () => {
      vi.spyOn(router, 'searchParameters').mockReturnValue({ producto: '1', cantidad: '-2' })
      vi.spyOn(servicioProductos, 'obtenerProducto').mockResolvedValue(crearProducto())

      await vm.initialize()

      expect(vm.producto).toBeNull()
      expect(vm.hayErrorProducto).toBe(true)
      expect(vm.mensajeErrorProducto).toBe('La cantidad pedida no es válida para este producto.')
    })

    it('informa un error si no se puede cargar el producto', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined)
      vi.spyOn(router, 'searchParameters').mockReturnValue({ producto: '1', cantidad: '1' })
      vi.spyOn(servicioProductos, 'obtenerProducto').mockRejectedValue(new Error('sin conexión'))

      await vm.initialize()

      expect(vm.productoCargado).toBe(false)
      expect(vm.precioTotalFormateado).toBe('')
      expect(vm.mensajeErrorProducto).toBe('No pudimos cargar el producto. Intentá nuevamente.')
      expect(vm.cargandoProducto).toBe(false)
    })
  })

  it('no muestra errores antes de intentar confirmar', () => {
    expect(vm.erroresVisibles.nombreApellido).toBe('')
    expect(vm.erroresVisibles.email).toBe('')
    expect(vm.clasesCampos.email).toEqual({ 'campo-error': false })
    expect(vm.mostrarErrorGeneral).toBe(false)
  })

  it('al confirmar con el formulario vacío, muestra los errores y no registra el pedido', async () => {
    const crear = vi.spyOn(servicioPedidos, 'crear')
    vm.producto = crearProducto()

    await vm.confirmar()

    expect(vm.mostrarErrorGeneral).toBe(true)
    expect(vm.erroresVisibles.nombreApellido).toBe('Ingresá tu nombre y apellido')
    expect(vm.erroresVisibles.email).toBe('Ingresá tu email')
    expect(vm.clasesCampos.email).toEqual({ 'campo-error': true })
    expect(crear).not.toHaveBeenCalled()
    expect(router.navigateTo).not.toHaveBeenCalled()
  })

  it('no confirma si todavía no hay un producto cargado', async () => {
    const crear = vi.spyOn(servicioPedidos, 'crear')
    vm.datosEntrega = crearDatosEntregaValidos()

    await vm.confirmar()

    expect(crear).not.toHaveBeenCalled()
    expect(router.navigateTo).not.toHaveBeenCalled()
  })

  it('al confirmar con datos válidos, registra el pedido del usuario con sus datos de entrega', async () => {
    const crear = vi.spyOn(servicioPedidos, 'crear')
    vm.datosEntrega = crearDatosEntregaValidos()
    vm.producto = crearProducto()
    vm.cantidadPedido = 2

    await vm.confirmar()

    expect(vm.mostrarErrorGeneral).toBe(false)
    expect(crear).toHaveBeenCalledWith(vm.producto, 2, vm.datosEntrega, usuario)
    expect(router.navigateTo).toHaveBeenCalledWith('/mis-pedidos?confirmado=AR-101')
  })

  it('informa un error y no navega si la API rechaza el pedido', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.spyOn(servicioPedidos, 'crear').mockRejectedValue(new Error('HTTP 500'))
    vm.datosEntrega = crearDatosEntregaValidos()
    vm.producto = crearProducto()

    await vm.confirmar()

    expect(vm.hayErrorConfirmacion).toBe(true)
    expect(vm.mensajeErrorConfirmacion).toBe('No pudimos registrar tu pedido. Intentá nuevamente.')
    expect(vm.confirmando).toBe(false)
    expect(router.navigateTo).not.toHaveBeenCalled()
  })

  it('no registra el pedido dos veces si ya se está confirmando', async () => {
    const crear = vi.spyOn(servicioPedidos, 'crear')
    vm.datosEntrega = crearDatosEntregaValidos()
    vm.producto = crearProducto()

    await Promise.all([vm.confirmar(), vm.confirmar()])

    expect(crear).toHaveBeenCalledTimes(1)
  })

  it('un email inválido bloquea la confirmación aunque el resto de los datos sea correcto', async () => {
    const crear = vi.spyOn(servicioPedidos, 'crear')
    vm.datosEntrega = crearDatosEntregaValidos()
    vm.datosEntrega.email = 'esto-no-es-un-email'
    vm.producto = crearProducto()

    await vm.confirmar()

    expect(crear).not.toHaveBeenCalled()
    expect(vm.erroresVisibles.email).toBe('Ingresá un email válido')
    expect(vm.erroresVisibles.nombreApellido).toBe('')
  })

  it('cancelar limpia el formulario y oculta los errores', async () => {
    vm.datosEntrega = crearDatosEntregaValidos()
    await vm.confirmar()

    vm.cancelar()

    expect(vm.datosEntrega).toEqual(new DatosEntrega())
    expect(vm.mostrarErrorGeneral).toBe(false)
    expect(vm.erroresVisibles.nombreApellido).toBe('')
  })
})
