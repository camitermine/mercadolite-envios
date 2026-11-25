import { router } from 'pelelajs'
import { describe, expect, it, vi } from 'vitest'
import { Producto } from '../../dominio/producto'
import { ProductoService } from '../../services/producto.service'
import { Catalogo } from './catalogo'

const crearProducto = (
  id: number,
  title: string,
  category: string,
  price: number,
  stock: number = 1,
): Producto => new Producto(id, title, category, price, 4.5, stock, `imagen-${id}.jpg`)

const productos: Producto[] = [
  crearProducto(1, 'Teléfono', 'tecnología', 500),
  crearProducto(2, 'Auriculares', 'tecnología', 100),
  crearProducto(3, 'Sillón', 'hogar', 300, 0),
]

const serviceCon = (resultado: Producto[]): ProductoService => {
  const service = new ProductoService()
  vi.spyOn(service, 'obtenerProductos').mockResolvedValue(resultado)
  return service
}

describe('Catalogo', () => {
  it('expone la navegación de las cards como una función propia de la instancia', () => {
    const catalogo = new Catalogo(serviceCon(productos))

    expect(Object.hasOwn(catalogo, 'verProducto')).toBe(true)
    expect(catalogo.verProducto).toBeTypeOf('function')
  })

  it('carga los productos y sus categorías al inicializarse', async () => {
    const catalogo = new Catalogo(serviceCon(productos))

    await catalogo.initialize()

    expect(catalogo.productos).toEqual(productos)
    expect(catalogo.categorias).toEqual(['Hogar', 'Tecnología'])
    expect(catalogo.mensajeError).toBe('')
  })

  it('filtra utilizando la búsqueda aplicada por el header', async () => {
    const catalogo = new Catalogo(serviceCon(productos))
    await catalogo.initialize()

    expect(catalogo.productosFiltrados).toHaveLength(3)

    catalogo.busquedaAplicada = 'teléfono'

    expect(catalogo.productosFiltrados).toEqual([productos[0]])
  })

  it('combina el filtro por categoría con el orden por precio', async () => {
    const catalogo = new Catalogo(serviceCon(productos))
    await catalogo.initialize()
    catalogo.categoriaSeleccionada = 'Tecnología'
    catalogo.ordenPrecio = 'asc'

    expect(catalogo.productosFiltrados).toEqual([productos[1], productos[0]])
  })

  it('pagina de a ocho productos', async () => {
    const muchosProductos = Array.from({ length: 10 }, (_, indice) =>
      crearProducto(indice + 1, `Producto ${indice + 1}`, 'general', indice + 1),
    )
    const catalogo = new Catalogo(serviceCon(muchosProductos))
    await catalogo.initialize()

    expect(catalogo.productosVisibles).toHaveLength(8)

    catalogo.paginaSiguiente()

    expect(catalogo.productosVisibles).toHaveLength(2)
    expect(catalogo.paginaActual).toBe(2)
  })

  it('vuelve a la primera página cuando cambia la búsqueda o algún filtro', async () => {
    const muchosProductos = Array.from({ length: 20 }, (_, indice) =>
      crearProducto(indice + 1, `Producto ${indice + 1}`, 'general', indice + 1),
    )
    const catalogo = new Catalogo(serviceCon(muchosProductos))
    await catalogo.initialize()

    catalogo.paginaSiguiente()
    expect(catalogo.paginaActual).toBe(2)

    catalogo.busquedaAplicada = 'producto'
    expect(catalogo.paginaActual).toBe(1)

    catalogo.paginaSiguiente()
    catalogo.ordenPrecio = 'desc'
    expect(catalogo.paginaActual).toBe(1)
  })

  it('informa un error si falla la API', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const service = new ProductoService()
    vi.spyOn(service, 'obtenerProductos').mockRejectedValue(new Error('sin conexión'))
    const catalogo = new Catalogo(service)

    await catalogo.initialize()

    expect(catalogo.mensajeError).toBe('No pudimos cargar el catálogo. Intentá nuevamente.')
    expect(catalogo.cargando).toBe(false)
  })

  it('ordena de mayor a menor precio', async () => {
    const catalogo = new Catalogo(serviceCon(productos))
    await catalogo.initialize()

    catalogo.ordenPrecio = 'desc'

    expect(catalogo.productosFiltrados).toEqual([productos[0], productos[2], productos[1]])
  })

  it('informa la cantidad de productos y cuando no hay resultados', async () => {
    const catalogo = new Catalogo(serviceCon(productos))
    await catalogo.initialize()

    expect(catalogo.cantidadProductos).toBe('3 productos')
    expect(catalogo.sinResultados).toBe(false)

    catalogo.busquedaAplicada = 'sillón'
    expect(catalogo.cantidadProductos).toBe('1 producto')

    catalogo.busquedaAplicada = 'inexistente'
    expect(catalogo.sinResultados).toBe(true)
    expect(catalogo.cantidadPaginas).toBe(1)
  })

  it('pagina hacia atrás y no se pasa de los límites', async () => {
    const muchosProductos = Array.from({ length: 10 }, (_, indice) =>
      crearProducto(indice + 1, `Producto ${indice + 1}`, 'general', indice + 1),
    )
    const catalogo = new Catalogo(serviceCon(muchosProductos))
    await catalogo.initialize()

    catalogo.paginaAnterior()
    expect(catalogo.paginaActual).toBe(1)
    expect(catalogo.paginaAnteriorHabilitada).toBe(false)

    catalogo.paginaSiguiente()
    catalogo.paginaSiguiente()
    expect(catalogo.indicadorPagina).toBe('Página 2 de 2')
    expect(catalogo.paginaSiguienteHabilitada).toBe(false)

    catalogo.paginaAnterior()
    expect(catalogo.indicadorPagina).toBe('Página 1 de 2')
  })

  it('navega al detalle del producto seleccionado en una card', () => {
    vi.spyOn(router, 'navigateTo').mockImplementation(() => undefined)
    const catalogo = new Catalogo(serviceCon(productos))

    catalogo.verProducto({ producto: productos[1] })

    expect(router.navigateTo).toHaveBeenCalledWith('/detalle/2')
  })
})
