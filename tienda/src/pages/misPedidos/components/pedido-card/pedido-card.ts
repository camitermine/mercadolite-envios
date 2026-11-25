import { router } from 'pelelajs'
import { DatosEntrega } from '../../../../dominio/datosEntrega'
import { Pedido } from '../../../../dominio/pedido'
import { Producto } from '../../../../dominio/producto'

type CancelarPedido = (contexto: { pedido: Pedido }) => void | Promise<void>

export class PedidoCard {
  pedido = new Pedido({
    numeroSeguimiento: '',
    producto: new Producto(0, '', '', 0, 0, 0, ''),
    cantidad: 0,
    datosEntrega: new DatosEntrega(),
    fecha: '',
    estado: 'Pendiente',
  })

  alCancelar: CancelarPedido = () => undefined

  verDetalle(): void {
    router.navigateTo(`/detalle/${this.pedido.producto.id}`)
  }

  pedirCancelacion = (): void => {
    this.alCancelar({ pedido: this.pedido })
  }
}
