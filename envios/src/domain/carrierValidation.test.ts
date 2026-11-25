import { describe, expect, it } from 'vitest'
import type { CarrierInput } from './Carrier'
import { normalizeCarrierInput, validateCarrier } from './carrierValidation'

const VALID_CARRIER: CarrierInput = {
  name: 'Andreani',
  phone: '0810-122-1112',
  coverage: 'Nacional',
  status: 'Activo',
}

describe('carrierValidation', () => {
  it('acepta un transportista válido', () => {
    expect(validateCarrier(VALID_CARRIER)).toEqual({})
  })

  it('valida los campos obligatorios y el teléfono', () => {
    expect(validateCarrier({ ...VALID_CARRIER, name: ' ', phone: 'abc', coverage: '' })).toEqual({
      name: 'El nombre es obligatorio',
      phone: 'Ingresá un teléfono válido',
      coverage: 'La cobertura es obligatoria',
    })
  })

  it('normaliza los textos antes de enviarlos', () => {
    expect(normalizeCarrierInput({
      ...VALID_CARRIER,
      name: '  Andreani  ',
      phone: '  0810-122-1112 ',
      coverage: ' Nacional ',
    })).toEqual(VALID_CARRIER)
  })

  it('respeta los mismos límites definidos por el backend', () => {
    expect(validateCarrier({
      ...VALID_CARRIER,
      name: 'A',
      phone: '1234567890123456',
      coverage: 'a'.repeat(121),
    })).toEqual({
      name: 'El nombre debe tener al menos 2 caracteres',
      phone: 'Ingresá un teléfono válido',
      coverage: 'La cobertura no puede superar los 120 caracteres',
    })
  })
})
