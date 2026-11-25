import type { Order } from '../domain/Order'
import { getJson } from './api'

export const orderService = {
  async getAll(signal?: AbortSignal): Promise<Order[]> {
    return getJson<Order[]>('/orders', signal)
  },
}
