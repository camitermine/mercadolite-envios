import { NormalizadorTexto } from '../../utils/normalizadorTexto'

// La barra solo arma el texto a buscar: cada pantalla la conecta con link-busqueda-aplicada
// y decide contra qué fuente filtra (catálogo de productos, registro de pedidos, etc.).
export class BarraBusqueda {
  busqueda = ''
  busquedaAplicada = ''

  buscar(_barra?: BarraBusqueda, evento?: Event): void {
    evento?.preventDefault()
    this.busquedaAplicada = NormalizadorTexto.normalizarParaBusqueda(this.busqueda)
  }
}
