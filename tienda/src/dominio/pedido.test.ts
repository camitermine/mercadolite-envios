import { describe, expect, it } from 'vitest'
import { crearDatosEntregaValidos, crearProducto } from '../testing/fixtures'
import { FormateadorMoneda } from '../utils/formateadorMoneda'
import { type EstadoPedido, Pedido } from './pedido'

function crearPedido(
  estado: EstadoPedido = 'Pendiente',
  fechasEnvio: { fechaEstimada?: string; fechaEntrega?: string } = {},
): Pedido {
  return new Pedido({
    ...fechasEnvio,
    numeroSeguimiento: 'AR-100266',
    producto: crearProducto({ price: 250 }),
    cantidad: 3,
    datosEntrega: crearDatosEntregaValidos(),
    fecha: '2026-09-24T12:00:00',
    estado,
  })
}

describe('Pedido', () => {
  it('calcula el total a partir del precio del producto y la cantidad', () => {
    const pedido = crearPedido()

    expect(pedido.total).toBe(750)
    expect(pedido.totalFormateado).toBe(FormateadorMoneda.formatear(750))
  })

  it('muestra su número, cantidad y fecha', () => {
    const pedido = crearPedido()

    expect(pedido.numeroFormateado).toBe('Pedido AR-100266')
    expect(pedido.fechaFormateada).toBe('24 de sept de 2026')
    expect(pedido.detalleCantidadYFecha).toBe('3 · 24 de sept de 2026')
  })

  it('muestra el estado con su texto y su clase', () => {
    expect(crearPedido('Pendiente').textoEstado).toBe('Pendiente')
    expect(crearPedido('Pendiente').claseEstado).toBe('etiqueta-alerta')
    expect(crearPedido('En camino').claseEstado).toBe('etiqueta-alerta')
    expect(crearPedido('Demorado').textoEstado).toBe('Demorado')
    expect(crearPedido('Entregado').textoEstado).toBe('Entregado')
    expect(crearPedido('Entregado').claseEstado).toBe('etiqueta-exito')
  })

  it('muestra a nombre de quién está el pedido', () => {
    expect(crearPedido().destinatario).toBe('Para: Julieta Fernández')
  })

  it('un pedido pendiente no tiene detalle de envío', () => {
    expect(crearPedido('Pendiente').detalleEnvio).toBe('')
  })

  it('un pedido con envío muestra cuándo llega, o cuándo debía llegar si está demorado', () => {
    const fechaEstimada = '2026-09-30T00:00:00'

    expect(crearPedido('En camino', { fechaEstimada }).detalleEnvio).toBe(
      'Llega el 30 de sept de 2026',
    )
    expect(crearPedido('Demorado', { fechaEstimada }).detalleEnvio).toBe(
      'Debía llegar el 30 de sept de 2026',
    )
  })

  it('un pedido entregado muestra la fecha en que se entregó', () => {
    const pedido = crearPedido('Entregado', {
      fechaEstimada: '2026-09-30T00:00:00',
      fechaEntrega: '2026-09-28T00:00:00',
    })

    expect(pedido.detalleEnvio).toBe('Entregado el 28 de sept de 2026')
  })

  it('solo se puede cancelar mientras está pendiente', () => {
    expect(crearPedido('Pendiente').puedeCancelarse).toBe(true)
    expect(crearPedido('En camino').puedeCancelarse).toBe(false)
    expect(crearPedido('Demorado').puedeCancelarse).toBe(false)
    expect(crearPedido('Entregado').puedeCancelarse).toBe(false)
  })
})
