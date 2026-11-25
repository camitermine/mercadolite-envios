import { describe, expect, it } from 'vitest'
import { CalificacionEstrellas } from './calificacion-estrellas'

describe('CalificacionEstrellas', () => {
  it('representa una calificación decimal con estrellas completas, media y vacías', () => {
    const calificacion = new CalificacionEstrellas()
    calificacion.calificacion = 4.7

    expect(calificacion.estrellas).toEqual([
      'ph-fill ph-star estrella-llena',
      'ph-fill ph-star estrella-llena',
      'ph-fill ph-star estrella-llena',
      'ph-fill ph-star estrella-llena',
      'ph-fill ph-star-half estrella-mitad',
    ])
  })

  it('redondea la calificación a la media estrella más cercana', () => {
    const calificacion = new CalificacionEstrellas()
    calificacion.calificacion = 3.9

    expect(calificacion.estrellas).toEqual([
      'ph-fill ph-star estrella-llena',
      'ph-fill ph-star estrella-llena',
      'ph-fill ph-star estrella-llena',
      'ph-fill ph-star estrella-llena',
      'ph ph-star estrella-vacia',
    ])
  })

  it('limita la calificación al rango de cero a cinco', () => {
    const calificacion = new CalificacionEstrellas()
    calificacion.calificacion = 8

    expect(calificacion.estrellas).toHaveLength(5)
    expect(calificacion.estrellas).toEqual(Array(5).fill('ph-fill ph-star estrella-llena'))
  })
})
