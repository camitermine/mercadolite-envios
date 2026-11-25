import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import type { Pedido } from '../dominio/pedido'
import type { Producto } from '../dominio/producto'
import type { Usuario } from '../dominio/usuario'
import { crearDatosEntregaValidos, crearProducto, crearUsuario } from '../testing/fixtures'
import { PedidoService } from './pedido.service'

const producto: Producto = crearProducto({ id: 7, title: 'Teclado', price: 50, stock: 10 })

function ordenJSON(
  trackingNumber: string,
  status: string = 'Pendiente',
  fechasEnvio: { estimatedDate?: string; effectiveDate?: string } = {},
): Record<string, unknown> {
  return {
    ...fechasEnvio,
    trackingNumber,
    clientName: 'Julieta Fernández',
    address: 'Av. Siempre Viva 742',
    destination: 'Palermo, CABA',
    product: { id: 7, name: 'Teclado', price: 50, thumbnail: 'imagen-7.jpg', quantity: 2 },
    createdAt: '2026-09-24',
    status,
  }
}

function respuesta(cuerpo: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(cuerpo), { status })
}

// La API responde un alta solo con el status y la ubicación del recurso creado.
function respuestaAlta(trackingNumber: string): Response {
  return new Response(null, { status: 201, headers: { Location: `/orders/${trackingNumber}` } })
}

async function pedidoExistente(service: PedidoService, usuario: Usuario): Promise<Pedido> {
  const [pedido] = await service.obtenerDelUsuario(usuario)
  return pedido
}

describe('PedidoService', () => {
  let fetchMock: Mock<typeof fetch>
  let service: PedidoService
  let usuario: Usuario

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>()
    fetchMock.mockImplementation(async () => respuestaAlta('AR-101'))
    vi.stubGlobal('fetch', fetchMock)
    service = new PedidoService()
    usuario = crearUsuario()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('da de alta el pedido en la API con el usuario, el destinatario, el producto y la cantidad', async () => {
    const datos = crearDatosEntregaValidos()

    const numeroSeguimiento = await service.crear(producto, 2, datos, usuario)

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userName: usuario.nombre,
        clientName: datos.nombreApellido,
        address: datos.direccion,
        destination: datos.localidad,
        product: { id: 7, name: 'Teclado', price: 50, thumbnail: 'imagen-7.jpg', quantity: 2 },
      }),
    })
    expect(numeroSeguimiento).toBe('AR-101')
  })

  it('falla si la API no informa dónde quedó el pedido creado', async () => {
    fetchMock.mockImplementation(async () => new Response(null, { status: 201 }))

    await expect(service.crear(producto, 1, crearDatosEntregaValidos(), usuario)).rejects.toThrow()
  })

  it('no acepta cantidades que el producto no permite', async () => {
    await expect(service.crear(producto, 0, crearDatosEntregaValidos(), usuario)).rejects.toThrow()
    await expect(service.crear(producto, 11, crearDatosEntregaValidos(), usuario)).rejects.toThrow()

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('falla si la API rechaza el pedido', async () => {
    fetchMock.mockImplementation(async () => new Response(null, { status: 400 }))

    await expect(service.crear(producto, 1, crearDatosEntregaValidos(), usuario)).rejects.toThrow()
  })

  it('obtiene los pedidos del usuario desde la API, con su estado', async () => {
    fetchMock.mockImplementation(async () =>
      respuesta([ordenJSON('AR-101'), ordenJSON('AR-102', 'En camino')]),
    )

    const [pendiente, enCamino] = await service.obtenerDelUsuario(usuario)

    expect(fetchMock.mock.lastCall?.[0]).toBe(
      `http://localhost:8080/orders/user/${encodeURIComponent(usuario.nombre)}`,
    )
    expect(pendiente.numeroSeguimiento).toBe('AR-101')
    expect(pendiente.puedeCancelarse).toBe(true)
    expect(enCamino.estado).toBe('En camino')
    expect(enCamino.puedeCancelarse).toBe(false)
  })

  it('arma cada pedido con el producto, la cantidad, la entrega y la fecha de la API', async () => {
    fetchMock.mockImplementation(async () => respuesta([ordenJSON('AR-101')]))

    const [pedido] = await service.obtenerDelUsuario(usuario)

    expect(pedido.producto.id).toBe(7)
    expect(pedido.producto.title).toBe('Teclado')
    expect(pedido.producto.thumbnail).toBe('imagen-7.jpg')
    expect(pedido.cantidad).toBe(2)
    expect(pedido.total).toBe(100)
    expect(pedido.destinatario).toBe('Para: Julieta Fernández')
    expect(pedido.datosEntrega.direccion).toBe('Av. Siempre Viva 742')
    expect(pedido.datosEntrega.localidad).toBe('Palermo, CABA')
    expect(pedido.fechaFormateada).toBe('24 de sept de 2026')
  })

  it('trae las fechas del envío cuando el pedido ya tiene uno', async () => {
    fetchMock.mockImplementation(async () =>
      respuesta([
        ordenJSON('AR-101'),
        ordenJSON('AR-102', 'En camino', { estimatedDate: '2026-09-30' }),
        ordenJSON('AR-103', 'Entregado', {
          estimatedDate: '2026-09-30',
          effectiveDate: '2026-09-28',
        }),
      ]),
    )

    const [pendiente, enCamino, entregado] = await service.obtenerDelUsuario(usuario)

    expect(pendiente.detalleEnvio).toBe('')
    expect(enCamino.detalleEnvio).toBe('Llega el 30 de sept de 2026')
    expect(entregado.detalleEnvio).toBe('Entregado el 28 de sept de 2026')
  })

  it('cancela el pedido en la API', async () => {
    fetchMock.mockImplementation(async () => respuesta([ordenJSON('AR-101')]))
    const pedido = await pedidoExistente(service, usuario)
    fetchMock.mockImplementation(async () => new Response(null, { status: 204 }))

    await service.cancelar(pedido)

    expect(fetchMock.mock.lastCall?.[0]).toBe('http://localhost:8080/orders/AR-101')
    expect(fetchMock.mock.lastCall?.[1]).toMatchObject({ method: 'DELETE' })
  })

  it('falla si la API no permite cancelarlo', async () => {
    fetchMock.mockImplementation(async () => respuesta([ordenJSON('AR-101')]))
    const pedido = await pedidoExistente(service, usuario)
    fetchMock.mockImplementation(async () => new Response(null, { status: 400 }))

    await expect(service.cancelar(pedido)).rejects.toThrow()
  })
})
