import { describe, expect, it } from 'vitest'
import type { ShipmentInput } from './Shipment'
import { normalizeShipmentInput, validateShipment } from './shipmentValidation'

const TODAY = new Date(2026, 6, 1)

const VALID_SHIPMENT: ShipmentInput = {
  trackingNumber: 'AR-100262',
  clientName: 'Florencia Ibáñez',
  address: 'Av. Centenario 1250',
  destination: 'San Isidro, Buenos Aires',
  product: 'Zapatillas running',
  carrierId: 1,
  estimatedDate: '2026-07-02',
}

describe('shipmentValidation', () => {
  it('acepta un envío válido', () => {
    expect(validateShipment(VALID_SHIPMENT, TODAY)).toEqual({})
  })

  it('valida los campos obligatorios', () => {
    expect(validateShipment({
      ...VALID_SHIPMENT,
      clientName: ' ',
      address: '',
      destination: '',
      product: '',
      carrierId: undefined,
    }, TODAY)).toEqual({
      clientName: 'El cliente es obligatorio',
      address: 'La dirección es obligatoria',
      destination: 'La localidad es obligatoria',
      product: 'El producto es obligatorio',
      carrierId: 'Seleccioná un transportista',
    })
  })

  it('valida el largo máximo de los textos', () => {
    expect(validateShipment({ ...VALID_SHIPMENT, clientName: 'a'.repeat(81) }, TODAY)).toEqual({
      clientName: 'El cliente no puede superar los 80 caracteres',
    })
  })

  it.each(['', '2026-07-01', '2026-06-30', '02/07/2026'])('rechaza la fecha estimada "%s"', (estimatedDate) => {
    expect(validateShipment({ ...VALID_SHIPMENT, estimatedDate }, TODAY)).toEqual({
      estimatedDate: 'Elegí una fecha futura',
    })
  })

  it('acepta una fecha pasada solo si es la que el envío ya tenía', () => {
    const delayedShipment = { ...VALID_SHIPMENT, estimatedDate: '2026-06-20' }

    expect(validateShipment(delayedShipment, TODAY, '2026-06-20')).toEqual({})
    expect(validateShipment(delayedShipment, TODAY, '2026-06-25')).toEqual({
      estimatedDate: 'Elegí una fecha futura',
    })
  })

  it('normaliza los textos antes de enviarlos', () => {
    expect(normalizeShipmentInput({
      ...VALID_SHIPMENT,
      clientName: '  Florencia Ibáñez ',
      address: ' Av. Centenario 1250  ',
    })).toEqual(VALID_SHIPMENT)
  })
})
