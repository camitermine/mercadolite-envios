import { FormateadorMoneda } from '../utils/formateadorMoneda'
import { NormalizadorTexto } from '../utils/normalizadorTexto'

export interface Resena {
  rating: number
  comment: string
  date: string
  reviewerName: string
}

export class Producto {
  constructor(
    readonly id: number,
    readonly title: string,
    readonly category: string,
    readonly price: number,
    readonly rating: number,
    readonly stock: number,
    readonly thumbnail: string,
    readonly description = '',
    readonly discountPercentage = 0,
    readonly sku = '',
    readonly shippingInformation = '',
    readonly returnPolicy = '',
    readonly minimumOrderQuantity = 1,
    readonly images: string[] = [],
    readonly reviews: Resena[] = [],
  ) {}

  get precioFormateado(): string {
    return FormateadorMoneda.formatear(this.price)
  }

  get categoriaFormateada(): string {
    const categoria = this.category.replaceAll('-', ' ')
    return NormalizadorTexto.capitalizar(categoria)
  }

  get textoStock(): string {
    return this.stock === 0 ? 'Sin stock disponible' : `${this.stock} disponibles`
  }

  get claseStock(): string {
    return this.stock === 0 ? 'sin-stock' : ''
  }

  get claseTarjeta(): string {
    return this.stock === 0 ? 'producto-sin-stock' : ''
  }

  get precioAnterior(): string {
    if (this.discountPercentage <= 0) return ''

    const precioOriginal = this.price / (1 - this.discountPercentage / 100)

    return FormateadorMoneda.formatear(precioOriginal)
  }

  get tieneDescuento(): boolean {
    return this.discountPercentage > 0
  }

  get descuentoFormateado(): string {
    return `-${Math.round(this.discountPercentage)}%`
  }

  precioPor(cantidad: number): number {
    return this.price * cantidad
  }

  get tieneStock(): boolean {
    return this.stock > 0
  }

  aceptaCantidad(cantidad: number): boolean {
    return (
      Number.isInteger(cantidad) && cantidad >= this.minimumOrderQuantity && cantidad <= this.stock
    )
  }

  get cantidadResenas(): number {
    return this.reviews.length
  }

  get textoCantidadResenas(): string {
    return `${this.cantidadResenas} ${this.cantidadResenas === 1 ? 'reseña' : 'reseñas'}`
  }
}
