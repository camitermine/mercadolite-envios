
import { matchesSearchTerm } from '../utils/text'

export interface Shipment {
  id: number
  trackingNumber: string
  clientName: string
  address: string
  destination: string
  product: string
  carrierId: number
  carrier: string
  status: ShipmentStatus
  estimatedDate: string
  effectiveDate: string | null
}

export const SHIPMENT_STATUSES = [
  'En camino',
  'Demorado',
  'Entregado',
] as const

export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number]

export const INITIAL_SHIPMENT_STATUS: ShipmentStatus = 'En camino'

export interface ShipmentInput {
  trackingNumber: string
  clientName: string
  address: string
  destination: string
  product: string
  carrierId?: number
  estimatedDate: string
}

export function matchesShipmentSearch(
  shipment: Shipment,
  search: string,
): boolean {
  return matchesSearchTerm(search, [
    shipment.trackingNumber,
    shipment.clientName,
  ])
}
