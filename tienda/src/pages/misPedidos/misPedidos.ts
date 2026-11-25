import { router } from 'pelelajs'
import type { Pedido } from '../../dominio/pedido'
import { type Usuario, usuarioActual } from '../../dominio/usuario'
import { type PedidoService, pedidoService } from '../../services/pedido.service'
import { NormalizadorTexto } from '../../utils/normalizadorTexto'

export class MisPedidos {
  pedidos: Pedido[] = []
  busquedaAplicada = ''
  seguimientoConfirmado = ''
  cargando = false
  mensajeError = ''

  constructor(
    private readonly servicioPedidos: PedidoService = pedidoService,
    private readonly usuario: Usuario = usuarioActual,
  ) {}

  // HacerPedido navega a /mis-pedidos?confirmado=<número de seguimiento> después de confirmar.
  async initialize(): Promise<void> {
    this.seguimientoConfirmado = router.searchParameters().confirmado ?? ''
    if (this.seguimientoConfirmado !== '')
      globalThis.history?.replaceState(null, '', '/mis-pedidos')
    await this.cargarPedidos()
  }

  async cargarPedidos(): Promise<void> {
    this.cargando = true
    this.mensajeError = ''

    try {
      this.pedidos = await this.servicioPedidos.obtenerDelUsuario(this.usuario)
    } catch (error: unknown) {
      console.error(error)
      this.mensajeError = 'No pudimos cargar tus pedidos. Intentá nuevamente.'
    } finally {
      this.cargando = false
    }
  }

  get hayPedidos(): boolean {
    return this.pedidos.length > 0
  }

  get estadoVacio(): boolean {
    return !this.cargando && this.mensajeError === '' && !this.hayPedidos
  }

  get pedidosFiltrados(): Pedido[] {
    return this.pedidos.filter((pedido) =>
      NormalizadorTexto.normalizarParaBusqueda(pedido.producto.title).includes(
        this.busquedaAplicada,
      ),
    )
  }

  get sinResultados(): boolean {
    return this.hayPedidos && this.pedidosFiltrados.length === 0
  }

  get mensajeConfirmacion(): string {
    return this.seguimientoConfirmado !== ''
      ? `¡Pedido ${this.seguimientoConfirmado} confirmado con éxito!`
      : ''
  }

  cerrarConfirmacion(): void {
    this.seguimientoConfirmado = ''
  }

  irAlCatalogo(_misPedidos?: MisPedidos, evento?: Event): void {
    evento?.preventDefault()
    router.navigateTo('/catalogo')
  }

  // Pelela lee este getter a través del view model reactivo: la función que devuelve
  // queda atada a él, así que al cancelar la vista se actualiza.
  get alCancelarPedido(): (contexto: { pedido: Pedido }) => Promise<void> {
    return ({ pedido }: { pedido: Pedido }): Promise<void> => this.cancelarPedido(pedido)
  }

  async cancelarPedido(pedido: Pedido): Promise<void> {
    this.mensajeError = ''

    try {
      await this.servicioPedidos.cancelar(pedido)
      if (pedido.numeroSeguimiento === this.seguimientoConfirmado) this.cerrarConfirmacion()
      await this.cargarPedidos()
    } catch (error: unknown) {
      console.error(error)
      this.mensajeError = 'No pudimos cancelar el pedido. Intentá nuevamente.'
    }
  }
}
