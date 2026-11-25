import { afterEach, describe, expect, it, vi } from 'vitest'
import { Producto } from '../dominio/producto'
import { type ProductoJSON, ProductoService } from './producto.service'

const productoJSON: ProductoJSON = {
  id: 1,
  title: 'Essence Mascara',
  category: 'beauty',
  price: 9.99,
  rating: 4.94,
  stock: 5,
  thumbnail: 'thumbnail.webp',
  description: 'Descripción',
  discountPercentage: 7.17,
  sku: 'RCH45Q1A',
  shippingInformation: 'Ships in 1 month',
  returnPolicy: '30 days return policy',
  minimumOrderQuantity: 2,
  images: ['1.webp'],
  reviews: [{ rating: 2, comment: 'Meh', date: '2024-05-23', reviewerName: 'John' }],
}

function responderCon(cuerpo: unknown): void {
  vi.stubGlobal(
    'fetch',
    vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(cuerpo))),
  )
}

describe('ProductoService', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('pide todos los productos a DummyJSON y los convierte en objetos Producto', async () => {
    responderCon({ products: [productoJSON] })

    const productos = await new ProductoService().obtenerProductos()

    expect(fetch).toHaveBeenCalledWith('https://dummyjson.com/products?limit=0', expect.anything())
    expect(productos).toHaveLength(1)
    expect(productos[0]).toBeInstanceOf(Producto)
    expect(productos[0].title).toBe('Essence Mascara')
  })

  it('pide un producto por id y copia todos sus datos', async () => {
    responderCon(productoJSON)

    const producto = await new ProductoService().obtenerProducto(1)

    expect(fetch).toHaveBeenCalledWith('https://dummyjson.com/products/1', expect.anything())
    expect(producto).toEqual(
      new Producto(
        1,
        'Essence Mascara',
        'beauty',
        9.99,
        4.94,
        5,
        'thumbnail.webp',
        'Descripción',
        7.17,
        'RCH45Q1A',
        'Ships in 1 month',
        '30 days return policy',
        2,
        ['1.webp'],
        productoJSON.reviews,
      ),
    )
  })
})
