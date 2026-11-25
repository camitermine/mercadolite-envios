import { matchesSearchTerm } from '../utils/text'

export interface Order {
  trackingNumber: string
  clientName: string
  address: string
  destination: string
  product: string
}

export function matchesOrderSearch(order: Order, search: string): boolean {
  return matchesSearchTerm(search, [order.trackingNumber, order.clientName])
}
