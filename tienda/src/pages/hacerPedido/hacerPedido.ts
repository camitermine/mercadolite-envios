import { router } from 'pelelajs'
import {
  CAMPOS_ENTREGA,
  type CampoEntrega,
  DatosEntrega,
  METODOS_ENTREGA,
} from '../../dominio/datosEntrega'
import type { Producto } from '../../dominio/producto'
import { type Usuario, usuarioActual } from '../../dominio/usuario'
import { type PedidoService, pedidoService } from '../../services/pedido.service'
import { type ProductoService, productoService } from '../../services/producto.service'
import { FormateadorMoneda } from '../../utils/formateadorMoneda'

type ClasesCampo = { 'campo-error': boolean }

type PorCampo<T> = Record<CampoEntrega, T>

function porCampo<T>(valorDe: (campo: CampoEntrega) => T): PorCampo<T> {
  return Object.fromEntries(CAMPOS_ENTREGA.map((campo) => [campo, valorDe(campo)])) as PorCampo<T>
}

export class HacerPedido {
  datosEntrega = new DatosEntrega()
  metodosEntrega: string[] = [...METODOS_ENTREGA]
  intentoConfirmar = false

  producto: Producto | null = null
  cantidadPedido = 1
  cargandoProducto = false
  mensajeErrorProducto = ''
  confirmando = false
  mensajeErrorConfirmacion = ''

  constructor(
    private readonly servicioPedidos: PedidoService = pedidoService,
    private readonly servicioProductos: ProductoService = productoService,
    private readonly usuario: Usuario = usuarioActual,
  ) {}

  async initialize(): Promise<void> {
    this.cargandoProducto = true
    this.mensajeErrorProducto = ''

    try {
      const parametros = router.searchParameters()
      const producto = await this.servicioProductos.obtenerProducto(Number(parametros.producto))
      const cantidad = Number(parametros.cantidad)

      if (!producto.aceptaCantidad(cantidad)) {
        this.mensajeErrorProducto = 'La cantidad pedida no es válida para este producto.'
        return
      }

      this.producto = producto
      this.cantidadPedido = cantidad
    } catch (error: unknown) {
      console.error(error)
      this.mensajeErrorProducto = 'No pudimos cargar el producto. Intentá nuevamente.'
    } finally {
      this.cargandoProducto = false
    }
  }

  get productoCargado(): boolean {
    return this.producto !== null
  }

  get hayErrorProducto(): boolean {
    return this.mensajeErrorProducto !== ''
  }

  get precioTotalFormateado(): string {
    if (this.producto === null) return ''
    return FormateadorMoneda.formatear(this.producto.precioPor(this.cantidadPedido))
  }

  get hayErrorConfirmacion(): boolean {
    return this.mensajeErrorConfirmacion !== ''
  }

  get mostrarErrorGeneral(): boolean {
    return this.intentoConfirmar && !this.datosEntrega.sonValidos
  }

  // Los errores solo se muestran después del primer intento de confirmar.
  // Siempre tiene todos los campos (con '' si no hay error) para poder usarlo desde la vista.
  get erroresVisibles(): PorCampo<string> {
    const errores = this.datosEntrega.errores
    return porCampo((campo) => (this.intentoConfirmar ? (errores[campo] ?? '') : ''))
  }

  get clasesCampos(): PorCampo<ClasesCampo> {
    const errores = this.erroresVisibles
    return porCampo((campo) => ({ 'campo-error': errores[campo] !== '' }))
  }

  async confirmar(): Promise<void> {
    this.intentoConfirmar = true

    if (this.producto === null || !this.datosEntrega.sonValidos || this.confirmando) return

    this.confirmando = true
    this.mensajeErrorConfirmacion = ''

    try {
      const numeroSeguimiento = await this.servicioPedidos.crear(
        this.producto,
        this.cantidadPedido,
        this.datosEntrega,
        this.usuario,
      )
      router.navigateTo(`/mis-pedidos?confirmado=${numeroSeguimiento}`)
    } catch (error: unknown) {
      console.error(error)
      this.mensajeErrorConfirmacion = 'No pudimos registrar tu pedido. Intentá nuevamente.'
    } finally {
      this.confirmando = false
    }
  }

  cancelar(): void {
    this.datosEntrega = new DatosEntrega()
    this.intentoConfirmar = false
    this.mensajeErrorConfirmacion = ''
  }
}
