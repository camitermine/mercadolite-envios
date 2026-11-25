import { Producto, type Resena } from '../dominio/producto'
import { HttpService } from './http.service'

export interface ProductoJSON {
  id: number
  title: string
  category: string
  price: number
  rating: number
  stock: number
  thumbnail: string
  description: string
  discountPercentage: number
  sku: string
  shippingInformation: string
  returnPolicy: string
  minimumOrderQuantity: number
  images: string[]
  reviews: Resena[]
}

interface RespuestaProductosJSON {
  products: ProductoJSON[]
}

export class ProductoService {
  private readonly http = new HttpService('https://dummyjson.com')

  async obtenerProductos(): Promise<Producto[]> {
    const respuesta = await this.http.get<RespuestaProductosJSON>('/products?limit=0')

    return respuesta.products.map((producto) => this.crearProducto(producto))
  }

  async obtenerProducto(id: number): Promise<Producto> {
    const producto = await this.http.get<ProductoJSON>(`/products/${id}`)

    return this.crearProducto(producto)
  }

  private crearProducto(producto: ProductoJSON): Producto {
    return new Producto(
      producto.id,
      producto.title,
      producto.category,
      producto.price,
      producto.rating,
      producto.stock,
      producto.thumbnail,
      producto.description,
      producto.discountPercentage,
      producto.sku,
      producto.shippingInformation,
      producto.returnPolicy,
      producto.minimumOrderQuantity,
      producto.images,
      producto.reviews,
    )
  }
}

export const productoService: ProductoService = new ProductoService()
