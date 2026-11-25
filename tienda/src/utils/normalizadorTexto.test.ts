import { describe, expect, it } from 'vitest'
import { NormalizadorTexto } from './normalizadorTexto'

describe('NormalizadorTexto', () => {
  it('saca los espacios de los extremos', () => {
    expect(NormalizadorTexto.normalizar('  hola  ')).toBe('hola')
  })

  it('prepara el texto para búsquedas sin distinguir mayúsculas', () => {
    expect(NormalizadorTexto.normalizarParaBusqueda('  TeLéFoNo ')).toBe('teléfono')
  })

  it('pone en mayúscula solo la primera letra', () => {
    expect(NormalizadorTexto.capitalizar('home decoration')).toBe('Home decoration')
    expect(NormalizadorTexto.capitalizar('')).toBe('')
  })
})
