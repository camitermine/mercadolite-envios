import { getJson } from '../../services/api'

export interface DashboardStats {
  preparing: number
  inTransit: number
  deliveredToday: number
  delayed: number
}

export interface DelayedShipment {
  trackingNumber: string
  clientName: string
  delayDays: number
}

export interface UpcomingDelivery {
  trackingNumber: string
  clientName: string
  destination: string
  estimatedDate: string
}

export interface Page<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export const dashboardService = {
  async getStats(signal?: AbortSignal): Promise<DashboardStats> {
    return getJson<DashboardStats>('/dashboard/stats', signal)
  },

  async getDelayedShipments(page: number, signal?: AbortSignal): Promise<Page<DelayedShipment>> {
    return getJson<Page<DelayedShipment>>(`/dashboard/delayed-shipments?page=${page}`, signal)
  },

  async getUpcomingDeliveries(page: number, signal?: AbortSignal): Promise<Page<UpcomingDelivery>> {
    return getJson<Page<UpcomingDelivery>>(`/dashboard/upcoming-deliveries?page=${page}`, signal)
  },
}
