import { router } from 'pelelajs'
import type { Producto, Resena } from '../../dominio/producto'
import { type ProductoService, productoService } from '../../services/producto.service'

export class DetalleProducto {
  producto: Producto | null = null
  cantidad = 1
  mensajeError = ''
  cargando = false

  imagenes: {
    url: string
  }[] = []

  imagenPrincipal = ''

  resenas: Resena[] = []

  constructor(private readonly servicioProductos: ProductoService = productoService) {}

  get productoCargado(): boolean {
    return this.producto !== null
  }

  get hayMensajeError(): boolean {
    return this.mensajeError !== ''
  }

  get puedeHacerPedido(): boolean {
    return this.producto?.aceptaCantidad(this.cantidad) ?? false
  }

  async initialize(): Promise<void> {
    this.cargando = true
    this.mensajeError = ''

    try {
      const id = Number(router.urlParameters().id)
      const producto = await this.servicioProductos.obtenerProducto(id)

      this.producto = producto
      this.imagenes = [producto.thumbnail, ...producto.images].map((url) => ({ url }))
      this.imagenPrincipal = producto.thumbnail
      this.resenas = producto.reviews
      this.cantidad = producto.minimumOrderQuantity
    } catch (error: unknown) {
      console.error(error)
      this.mensajeError = 'No pudimos cargar el producto. Intentá nuevamente.'
    } finally {
      this.cargando = false
    }
  }

  aumentarCantidad(): void {
    if (this.producto?.aceptaCantidad(this.cantidad + 1)) this.cantidad += 1
  }

  disminuirCantidad(): void {
    if (this.producto?.aceptaCantidad(this.cantidad - 1)) this.cantidad -= 1
  }

  hacerPedido(): void {
    if (this.producto === null || !this.puedeHacerPedido) return

    router.navigateTo(`/hacer-pedido?producto=${this.producto.id}&cantidad=${this.cantidad}`)
  }
}
