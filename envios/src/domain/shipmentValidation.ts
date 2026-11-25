import type { ShipmentInput } from './Shipment'
import { toIsoDate } from '../utils/date'

export type ShipmentErrors = Partial<Record<keyof ShipmentInput, string>>

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

const TEXT_RULES = {
  trackingNumber: { required: 'El número de seguimiento es obligatorio', tooLong: 'El número de seguimiento', maxLength: 20 },
  clientName: { required: 'El cliente es obligatorio', tooLong: 'El cliente', maxLength: 80 },
  address: { required: 'La dirección es obligatoria', tooLong: 'La dirección', maxLength: 120 },
  destination: { required: 'La localidad es obligatoria', tooLong: 'La localidad', maxLength: 120 },
  product: { required: 'El producto es obligatorio', tooLong: 'El producto', maxLength: 120 },
} as const

type TextField = keyof typeof TEXT_RULES

const TEXT_FIELDS = Object.keys(TEXT_RULES) as TextField[]

export const SHIPMENT_MAX_LENGTHS = Object.fromEntries(
  TEXT_FIELDS.map((field) => [field, TEXT_RULES[field].maxLength]),
) as Record<TextField, number>

export function normalizeShipmentInput(shipment: ShipmentInput): ShipmentInput {
  return {
    ...shipment,
    trackingNumber: shipment.trackingNumber.trim(),
    clientName: shipment.clientName.trim(),
    address: shipment.address.trim(),
    destination: shipment.destination.trim(),
    product: shipment.product.trim(),
  }
}

export function validateShipment(
  shipment: ShipmentInput,
  today: Date = new Date(),
  currentEstimatedDate?: string,
): ShipmentErrors {
  const errors: ShipmentErrors = {}
  const normalizedShipment = normalizeShipmentInput(shipment)

  TEXT_FIELDS.forEach((field) => {
    const rule = TEXT_RULES[field]
    const value = normalizedShipment[field]

    if (!value) {
      errors[field] = rule.required
    } else if (value.length > rule.maxLength) {
      errors[field] = `${rule.tooLong} no puede superar los ${rule.maxLength} caracteres`
    }
  })

  if (normalizedShipment.carrierId === undefined) {
    errors.carrierId = 'Seleccioná un transportista'
  }

  // Un envío demorado ya tiene una fecha pasada: solo se valida si se cambia
  const keepsCurrentDate = normalizedShipment.estimatedDate === currentEstimatedDate

  if (
    !keepsCurrentDate &&
    (!ISO_DATE.test(normalizedShipment.estimatedDate) || normalizedShipment.estimatedDate <= toIsoDate(today))
  ) {
    errors.estimatedDate = 'Elegí una fecha futura'
  }

  return errors
}
