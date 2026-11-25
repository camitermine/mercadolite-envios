import type { Shipment, ShipmentInput, ShipmentStatus } from '../domain/Shipment'
import { apiRequest } from './api'

export type ShipmentUpdateInput = Omit<ShipmentInput, 'trackingNumber'>

export const shipmentService = {
  // Sin estado trae todos; con estado, el filtro lo hace el backend
  async getAll(signal?: AbortSignal, status?: ShipmentStatus): Promise<Shipment[]> {
    const path = status ? `/shipments?status=${encodeURIComponent(status)}` : '/shipments'

    return apiRequest<Shipment[]>(path, { signal })
  },

  async getStatuses(signal?: AbortSignal): Promise<ShipmentStatus[]> {
    return apiRequest<ShipmentStatus[]>('/shipments/statuses', { signal })
  },

  async getByTrackingNumber(trackingNumber: string, signal?: AbortSignal): Promise<Shipment> {
    return apiRequest(`/shipments/${trackingNumber}`, { signal })
  },

  async create(input: ShipmentInput): Promise<void> {
    await apiRequest('/shipments', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  async update(trackingNumber: string, data: ShipmentUpdateInput): Promise<void> {
    await apiRequest(`/shipments/${trackingNumber}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async deliver(trackingNumber: string): Promise<void> {
    await apiRequest(`/shipments/${trackingNumber}/deliver`, {
      method: 'PATCH',
    })
  },
}
