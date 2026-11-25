import { describe, expect, it } from 'vitest'
import { ResenaCard } from './resena-card'

describe('ResenaCard', () => {
  it('muestra la inicial de quien escribió la reseña y la fecha formateada', () => {
    const card = new ResenaCard()
    card.resena = {
      rating: 4,
      comment: 'Muy bueno',
      date: '2026-09-24T12:00:00',
      reviewerName: 'Julieta',
    }

    expect(card.inicial).toBe('J')
    expect(card.fechaFormateada).toBe('24 de sept de 2026')
  })

  it('no muestra inicial si la reseña no tiene autor', () => {
    expect(new ResenaCard().inicial).toBe('')
  })
})
