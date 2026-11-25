import { DatosEntrega } from '../dominio/datosEntrega'
import { type EstadoPedido, Pedido } from '../dominio/pedido'
import { Producto } from '../dominio/producto'
import type { Usuario } from '../dominio/usuario'
import { HttpService } from './http.service'

interface ProductoOrdenJSON {
  id: number
  name: string
  price: number
  thumbnail: string
  quantity: number
}

interface DatosOrden {
  clientName: string
  address: string
  destination: string
  product: ProductoOrdenJSON
}

interface OrdenRequest extends DatosOrden {
  userName: string
}

interface OrdenJSON extends DatosOrden {
  trackingNumber: string
  createdAt: string
  status: EstadoPedido
  estimatedDate?: string | null
  effectiveDate?: string | null
}

function fechaLocal(fecha: string): string {
  return `${fecha}T00:00:00`
}

export class PedidoService {
  private readonly http = new HttpService('http://localhost:8080')

  // Da de alta el pedido y devuelve su número de seguimiento, que la API informa en Location.
  async crear(
    producto: Producto,
    cantidad: number,
    datosEntrega: DatosEntrega,
    usuario: Usuario,
  ): Promise<string> {
    if (!producto.aceptaCantidad(cantidad)) {
      throw new Error(`Cantidad inválida para ${producto.title}: ${cantidad}`)
    }

    const ubicacion = await this.http.create<OrdenRequest>('/orders', {
      userName: usuario.nombre,
      clientName: datosEntrega.nombreApellido,
      address: datosEntrega.direccion,
      destination: datosEntrega.localidad,
      product: {
        id: producto.id,
        name: producto.title,
        price: producto.price,
        thumbnail: producto.thumbnail,
        quantity: cantidad,
      },
    })

    return decodeURIComponent(ubicacion.substring(ubicacion.lastIndexOf('/') + 1))
  }

  async obtenerDelUsuario(usuario: Usuario): Promise<Pedido[]> {
    const ordenes = await this.http.get<OrdenJSON[]>(
      `/orders/user/${encodeURIComponent(usuario.nombre)}`,
    )

    return ordenes.map((orden) => this.crearPedido(orden))
  }

  async cancelar(pedido: Pedido): Promise<void> {
    await this.http.delete<void>(`/orders/${pedido.numeroSeguimiento}`)
  }

  private crearPedido(orden: OrdenJSON): Pedido {
    const { product } = orden

    return new Pedido({
      numeroSeguimiento: orden.trackingNumber,
      producto: new Producto(product.id, product.name, '', product.price, 0, 0, product.thumbnail),
      cantidad: product.quantity,
      datosEntrega: new DatosEntrega({
        nombreApellido: orden.clientName,
        direccion: orden.address,
        localidad: orden.destination,
      }),
      fecha: fechaLocal(orden.createdAt),
      estado: orden.status,
      fechaEstimada: orden.estimatedDate ? fechaLocal(orden.estimatedDate) : undefined,
      fechaEntrega: orden.effectiveDate ? fechaLocal(orden.effectiveDate) : undefined,
    })
  }
}

export const pedidoService: PedidoService = new PedidoService()
