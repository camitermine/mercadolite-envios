export const CARRIER_STATUSES = ['Activo', 'Inactivo'] as const

export type CarrierStatus = (typeof CARRIER_STATUSES)[number]

export interface Carrier {
  id: number
  name: string
  phone: string
  coverage: string
  status: CarrierStatus
}

export type CarrierInput = Omit<Carrier, 'id'>

export function isActiveCarrier(carrier: Carrier): boolean {
  return carrier.status === 'Activo'
}

export function assignableCarriers(carriers: Carrier[], currentCarrierId?: number): Carrier[] {
  return carriers.filter((carrier) => isActiveCarrier(carrier) || carrier.id === currentCarrierId)
}
