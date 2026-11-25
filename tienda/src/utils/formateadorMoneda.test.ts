import { describe, expect, it } from 'vitest'
import { FormateadorMoneda } from './formateadorMoneda'

describe('FormateadorMoneda', () => {
  it('formatea montos en pesos argentinos', () => {
    expect(FormateadorMoneda.formatear(1234.5)).toMatch(/^\$\s?1\.234,50$/)
  })
})
