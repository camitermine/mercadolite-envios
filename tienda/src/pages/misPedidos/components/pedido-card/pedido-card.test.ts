import { router } from 'pelelajs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  crearPedidoServiceSinApi,
  crearProducto,
  crearUsuario,
  pedirYObtener,
} from '../../../../testing/fixtures'
import { PedidoCard } from './pedido-card'

async function crearCard(): Promise<PedidoCard> {
  const card = new PedidoCard()
  card.pedido = await pedirYObtener(
    crearPedidoServiceSinApi(),
    crearProducto({ id: 9 }),
    2,
    crearUsuario(),
  )
  return card
}

describe('PedidoCard', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('avisa con su pedido cuando se pide la cancelación', async () => {
    const card = await crearCard()
    const alCancelar = vi.fn()
    card.alCancelar = alCancelar

    card.pedirCancelacion()

    expect(alCancelar).toHaveBeenCalledWith({ pedido: card.pedido })
  })

  it('no falla si nadie escucha la cancelación', async () => {
    const card = await crearCard()

    expect(() => card.pedirCancelacion()).not.toThrow()
  })

  it('navega al detalle del producto pedido', async () => {
    vi.spyOn(router, 'navigateTo').mockImplementation(() => undefined)
    const card = await crearCard()

    card.verDetalle()

    expect(router.navigateTo).toHaveBeenCalledWith('/detalle/9')
  })
})
