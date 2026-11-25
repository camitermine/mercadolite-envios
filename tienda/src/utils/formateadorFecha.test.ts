import { describe, expect, it } from 'vitest'
import { FormateadorFecha } from './formateadorFecha'

describe('FormateadorFecha', () => {
  it('formatea una fecha con el formato corto de Argentina', () => {
    const fecha = new Date(2026, 8, 24)

    expect(FormateadorFecha.formatear(fecha)).toBe('24 de sept de 2026')
  })

  it('acepta una fecha recibida como texto', () => {
    expect(FormateadorFecha.formatear('2026-09-24T12:00:00')).toBe('24 de sept de 2026')
  })
})
