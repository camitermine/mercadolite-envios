import { router } from 'pelelajs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Producto } from '../../dominio/producto'
import { ProductoService } from '../../services/producto.service'
import { crearProducto } from '../../testing/fixtures'
import { DetalleProducto } from './detalleProducto'

describe('DetalleProducto', () => {
  let servicio: ProductoService
  let vm: DetalleProducto

  beforeEach(() => {
    servicio = new ProductoService()
    vm = new DetalleProducto(servicio)
    vi.spyOn(router, 'navigateTo').mockImplementation(() => undefined)
  })

  it('comienza sin producto ni mensaje de error', () => {
    expect(vm.productoCargado).toBe(false)
    expect(vm.mensajeError).toBe('')
    expect(vm.hayMensajeError).toBe(false)
    expect(vm.puedeHacerPedido).toBe(false)
  })

  describe('al inicializarse', () => {
    it('carga el producto de la URL con sus imágenes, reseñas y cantidad mínima', async () => {
      const resena = { rating: 5, comment: 'Excelente', date: '2026-09-24', reviewerName: 'Ana' }
      const producto = new Producto(
        3,
        'Producto de prueba',
        'categoria',
        100,
        4.5,
        10,
        'imagen-principal.jpg',
        'Descripción',
        0,
        'SKU-001',
        'Entrega rápida',
        'Devolución disponible',
        2,
        ['imagen-2.jpg', 'imagen-3.jpg'],
        [resena],
      )
      vi.spyOn(router, 'urlParameters').mockReturnValue({ id: '3' })
      const obtenerProducto = vi.spyOn(servicio, 'obtenerProducto').mockResolvedValue(producto)

      await vm.initialize()

      expect(obtenerProducto).toHaveBeenCalledWith(3)
      expect(vm.producto).toBe(producto)
      expect(vm.imagenes).toEqual([
        { url: 'imagen-principal.jpg' },
        { url: 'imagen-2.jpg' },
        { url: 'imagen-3.jpg' },
      ])
      expect(vm.imagenPrincipal).toBe('imagen-principal.jpg')
      expect(vm.resenas).toEqual([resena])
      expect(vm.cantidad).toBe(2)
      expect(vm.cargando).toBe(false)
    })

    it('informa un error si no se puede cargar el producto', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined)
      vi.spyOn(router, 'urlParameters').mockReturnValue({ id: '3' })
      vi.spyOn(servicio, 'obtenerProducto').mockRejectedValue(new Error('404'))

      await vm.initialize()

      expect(vm.productoCargado).toBe(false)
      expect(vm.mensajeError).toBe('No pudimos cargar el producto. Intentá nuevamente.')
      expect(vm.cargando).toBe(false)
    })
  })

  describe('con un producto cargado', () => {
    beforeEach(() => {
      vm.producto = crearProducto({ id: 5, stock: 10, minimumOrderQuantity: 2 })
      vm.cantidad = 2
    })

    it('aumenta la cantidad cuando todavía hay stock', () => {
      vm.aumentarCantidad()

      expect(vm.cantidad).toBe(3)
    })

    it('no permite superar el stock disponible', () => {
      vm.cantidad = 10

      vm.aumentarCantidad()

      expect(vm.cantidad).toBe(10)
    })

    it('disminuye la cantidad cuando supera el mínimo', () => {
      vm.cantidad = 5

      vm.disminuirCantidad()

      expect(vm.cantidad).toBe(4)
    })

    it('no permite bajar de la cantidad mínima', () => {
      vm.disminuirCantidad()

      expect(vm.cantidad).toBe(2)
    })

    it('navega a hacer pedido con el producto y la cantidad elegida', () => {
      vm.cantidad = 4

      vm.hacerPedido()

      expect(router.navigateTo).toHaveBeenCalledWith('/hacer-pedido?producto=5&cantidad=4')
    })
  })

  it('no permite hacer pedido de un producto sin stock', () => {
    vm.producto = crearProducto({ stock: 0 })

    vm.hacerPedido()

    expect(vm.puedeHacerPedido).toBe(false)
    expect(router.navigateTo).not.toHaveBeenCalled()
  })

  it('no cambia la cantidad si no hay producto cargado', () => {
    vm.aumentarCantidad()
    vm.disminuirCantidad()

    expect(vm.cantidad).toBe(1)
  })
})
