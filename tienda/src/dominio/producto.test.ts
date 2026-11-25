import { describe, expect, it } from 'vitest'
import { FormateadorMoneda } from '../utils/formateadorMoneda'
import { Producto, type Resena } from './producto'

const resena: Resena = { rating: 5, comment: 'Muy bueno', date: '2026-09-24', reviewerName: 'Ana' }

type OpcionesProducto = {
  stock?: number
  discountPercentage?: number
  minimumOrderQuantity?: number
  reviews?: Resena[]
}

function productoCon({
  stock = 10,
  discountPercentage = 0,
  minimumOrderQuantity = 1,
  reviews = [],
}: OpcionesProducto = {}): Producto {
  return new Producto(
    1,
    'Sillón',
    'home-decoration',
    300,
    4.5,
    stock,
    'imagen.jpg',
    '',
    discountPercentage,
    '',
    '',
    '',
    minimumOrderQuantity,
    [],
    reviews,
  )
}

describe('Producto', () => {
  it('formatea el precio y la categoría para mostrarlos', () => {
    const producto = productoCon()

    expect(producto.precioFormateado).toBe(FormateadorMoneda.formatear(300))
    expect(producto.categoriaFormateada).toBe('Home decoration')
  })

  describe('stock', () => {
    it('indica claramente cuando no tiene stock', () => {
      const producto = productoCon({ stock: 0 })

      expect(producto.tieneStock).toBe(false)
      expect(producto.textoStock).toBe('Sin stock disponible')
      expect(producto.claseStock).toBe('sin-stock')
      expect(producto.claseTarjeta).toBe('producto-sin-stock')
    })

    it('muestra las unidades disponibles cuando tiene stock', () => {
      const producto = productoCon({ stock: 7 })

      expect(producto.tieneStock).toBe(true)
      expect(producto.textoStock).toBe('7 disponibles')
      expect(producto.claseStock).toBe('')
      expect(producto.claseTarjeta).toBe('')
    })
  })

  describe('descuento', () => {
    it('sin descuento no muestra precio anterior', () => {
      const producto = productoCon()

      expect(producto.tieneDescuento).toBe(false)
      expect(producto.precioAnterior).toBe('')
    })

    it('con descuento calcula el precio anterior y el porcentaje redondeado', () => {
      const producto = productoCon({ discountPercentage: 25.4 })

      expect(producto.tieneDescuento).toBe(true)
      expect(producto.precioAnterior).toBe(FormateadorMoneda.formatear(300 / (1 - 0.254)))
      expect(producto.descuentoFormateado).toBe('-25%')
    })
  })

  describe('aceptaCantidad', () => {
    const producto = productoCon({ stock: 5, minimumOrderQuantity: 2 })

    it('acepta cantidades entre el pedido mínimo y el stock', () => {
      expect(producto.aceptaCantidad(2)).toBe(true)
      expect(producto.aceptaCantidad(5)).toBe(true)
    })

    it('rechaza cantidades fuera de rango o no enteras', () => {
      expect(producto.aceptaCantidad(1)).toBe(false)
      expect(producto.aceptaCantidad(6)).toBe(false)
      expect(producto.aceptaCantidad(2.5)).toBe(false)
      expect(producto.aceptaCantidad(Number.NaN)).toBe(false)
    })
  })

  it('calcula el precio para una cantidad', () => {
    expect(productoCon().precioPor(3)).toBe(900)
  })

  it('cuenta sus reseñas en singular y en plural', () => {
    expect(productoCon({ reviews: [resena] }).textoCantidadResenas).toBe('1 reseña')
    expect(productoCon({ reviews: [resena, resena] }).textoCantidadResenas).toBe('2 reseñas')
    expect(productoCon().cantidadResenas).toBe(0)
  })
})
