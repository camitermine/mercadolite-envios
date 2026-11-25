import { describe, expect, it, vi } from 'vitest'
import { crearProducto } from '../../testing/fixtures'
import { ProductoCard } from './producto-card'

describe('ProductoCard', () => {
  it('notifica al catálogo qué producto fue seleccionado', () => {
    const producto = crearProducto({ id: 15 })
    const alSeleccionar = vi.fn()
    const card = new ProductoCard()
    card.producto = producto
    card.alSeleccionar = alSeleccionar

    card.seleccionar()

    expect(alSeleccionar).toHaveBeenCalledWith({ producto })
  })

  it('no falla si nadie escucha la selección', () => {
    expect(() => new ProductoCard().seleccionar()).not.toThrow()
  })
})
