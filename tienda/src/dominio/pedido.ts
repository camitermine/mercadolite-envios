import { FormateadorFecha } from '../utils/formateadorFecha'
import { FormateadorMoneda } from '../utils/formateadorMoneda'
import type { DatosEntrega } from './datosEntrega'
import type { Producto } from './producto'

export type EstadoPedido = 'Pendiente' | 'En camino' | 'Demorado' | 'Entregado'

export interface PedidoConfig {
  numeroSeguimiento: string
  producto: Producto
  cantidad: number
  datosEntrega: DatosEntrega
  fecha: string
  estado: EstadoPedido
  fechaEstimada?: string
  fechaEntrega?: string
}

export class Pedido {
  readonly numeroSeguimiento: string
  readonly producto: Producto
  readonly cantidad: number
  readonly datosEntrega: DatosEntrega
  readonly fecha: string
  readonly estado: EstadoPedido
  readonly fechaEstimada?: string
  readonly fechaEntrega?: string

  constructor(pedido: PedidoConfig) {
    this.numeroSeguimiento = pedido.numeroSeguimiento
    this.producto = pedido.producto
    this.cantidad = pedido.cantidad
    this.datosEntrega = pedido.datosEntrega
    this.fecha = pedido.fecha
    this.estado = pedido.estado
    this.fechaEstimada = pedido.fechaEstimada
    this.fechaEntrega = pedido.fechaEntrega
  }

  get total(): number {
    return this.producto.precioPor(this.cantidad)
  }

  get totalFormateado(): string {
    return FormateadorMoneda.formatear(this.total)
  }

  get numeroFormateado(): string {
    return `Pedido ${this.numeroSeguimiento}`
  }

  get fechaFormateada(): string {
    return FormateadorFecha.formatear(this.fecha)
  }

  get detalleCantidadYFecha(): string {
    return `${this.cantidad} · ${this.fechaFormateada}`
  }

  get textoEstado(): string {
    return this.estado
  }

  get claseEstado(): string {
    return this.estado === 'Entregado' ? 'etiqueta-exito' : 'etiqueta-alerta'
  }

  get destinatario(): string {
    return `Para: ${this.datosEntrega.nombreApellido}`
  }

  get detalleEnvio(): string {
    if (this.fechaEntrega) return `Entregado el ${FormateadorFecha.formatear(this.fechaEntrega)}`
    if (!this.fechaEstimada) return ''

    const fechaEstimada = FormateadorFecha.formatear(this.fechaEstimada)
    return this.estado === 'Demorado'
      ? `Debía llegar el ${fechaEstimada}`
      : `Llega el ${fechaEstimada}`
  }

  get puedeCancelarse(): boolean {
    return this.estado === 'Pendiente'
  }
}
