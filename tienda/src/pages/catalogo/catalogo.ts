import { router } from 'pelelajs'

import type { Producto } from '../../dominio/producto'
import { type ProductoService, productoService } from '../../services/producto.service'
import { NormalizadorTexto } from '../../utils/normalizadorTexto'

const PRODUCTOS_POR_PAGINA = 8

export class Catalogo {
  productos: Producto[] = []
  categorias: string[] = []
  busquedaAplicada = ''
  categoriaSeleccionada = ''
  ordenPrecio = ''
  private paginacion = { pagina: 1, filtros: '' }
  mensajeError = ''
  cargando = false

  constructor(private readonly servicioProductos: ProductoService = productoService) {}

  async initialize(): Promise<void> {
    this.cargando = true
    this.mensajeError = ''

    try {
      this.productos = await this.servicioProductos.obtenerProductos()
      this.categorias = [
        ...new Set(this.productos.map((producto) => producto.categoriaFormateada)),
      ].sort()
    } catch (error: unknown) {
      console.error(error)
      this.mensajeError = 'No pudimos cargar el catálogo. Intentá nuevamente.'
    } finally {
      this.cargando = false
    }
  }

  get productosFiltrados(): Producto[] {
    const productos = this.productos.filter((producto) => {
      const coincideBusqueda = NormalizadorTexto.normalizarParaBusqueda(producto.title).includes(
        this.busquedaAplicada,
      )
      const coincideCategoria =
        this.categoriaSeleccionada === '' ||
        producto.categoriaFormateada === this.categoriaSeleccionada

      return coincideBusqueda && coincideCategoria
    })

    if (this.ordenPrecio === '') return productos

    const direccion = this.ordenPrecio === 'asc' ? 1 : -1
    return [...productos].sort(
      (productoA, productoB) => (productoA.price - productoB.price) * direccion,
    )
  }

  get productosVisibles(): Producto[] {
    const inicio = (this.paginaActual - 1) * PRODUCTOS_POR_PAGINA
    return this.productosFiltrados.slice(inicio, inicio + PRODUCTOS_POR_PAGINA)
  }

  get sinResultados(): boolean {
    return !this.cargando && this.mensajeError === '' && this.productosFiltrados.length === 0
  }

  get cantidadProductos(): string {
    const cantidad = this.productosFiltrados.length
    return `${cantidad} ${cantidad === 1 ? 'producto' : 'productos'}`
  }

  private get filtrosActuales(): string {
    return [this.busquedaAplicada, this.categoriaSeleccionada, this.ordenPrecio].join('|')
  }

  // Si cambió algún filtro desde la última vez que se paginó, se vuelve a la primera página.
  get paginaActual(): number {
    return this.paginacion.filtros === this.filtrosActuales ? this.paginacion.pagina : 1
  }

  get cantidadPaginas(): number {
    return Math.max(1, Math.ceil(this.productosFiltrados.length / PRODUCTOS_POR_PAGINA))
  }

  get paginaAnteriorHabilitada(): boolean {
    return this.paginaActual > 1
  }

  get paginaSiguienteHabilitada(): boolean {
    return this.paginaActual < this.cantidadPaginas
  }

  get indicadorPagina(): string {
    return `Página ${this.paginaActual} de ${this.cantidadPaginas}`
  }

  paginaAnterior(): void {
    if (this.paginaAnteriorHabilitada) this.irAPagina(this.paginaActual - 1)
  }

  paginaSiguiente(): void {
    if (this.paginaSiguienteHabilitada) this.irAPagina(this.paginaActual + 1)
  }

  private irAPagina(pagina: number): void {
    this.paginacion = { pagina, filtros: this.filtrosActuales }
  }

  verProducto = ({ producto }: { producto: Producto }): void => {
    router.navigateTo(`/detalle/${producto.id}`)
  }
}
