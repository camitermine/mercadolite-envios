import { CARRIER_STATUSES, type CarrierInput } from './Carrier'

export type CarrierErrors = Partial<Record<keyof CarrierInput, string>>

const PHONE_CHARACTERS = /^[+()\d\s-]+$/

export function normalizeCarrierInput(carrier: CarrierInput): CarrierInput {
  return {
    name: carrier.name.trim(),
    phone: carrier.phone.trim(),
    coverage: carrier.coverage.trim(),
    status: carrier.status,
  }
}

export function validateCarrier(carrier: CarrierInput): CarrierErrors {
  const errors: CarrierErrors = {}
  const normalizedCarrier = normalizeCarrierInput(carrier)
  const phoneDigits = normalizedCarrier.phone.replace(/\D/g, '')

  if (!normalizedCarrier.name) {
    errors.name = 'El nombre es obligatorio'
  } else if (normalizedCarrier.name.length < 2) {
    errors.name = 'El nombre debe tener al menos 2 caracteres'
  } else if (normalizedCarrier.name.length > 80) {
    errors.name = 'El nombre no puede superar los 80 caracteres'
  }

  if (!normalizedCarrier.phone) {
    errors.phone = 'El teléfono es obligatorio'
  } else if (!PHONE_CHARACTERS.test(normalizedCarrier.phone) || phoneDigits.length < 6 || phoneDigits.length > 15) {
    errors.phone = 'Ingresá un teléfono válido'
  }

  if (!normalizedCarrier.coverage) {
    errors.coverage = 'La cobertura es obligatoria'
  } else if (normalizedCarrier.coverage.length > 120) {
    errors.coverage = 'La cobertura no puede superar los 120 caracteres'
  }

  if (!CARRIER_STATUSES.includes(normalizedCarrier.status)) {
    errors.status = 'Seleccioná un estado válido'
  }

  return errors
}
