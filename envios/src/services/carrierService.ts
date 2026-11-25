import type { Carrier, CarrierInput } from '../domain/Carrier'
import { apiRequest } from './api'

export const carrierService = {
  async getAll(signal?: AbortSignal): Promise<Carrier[]> {
    return apiRequest('/carriers', { signal })
  },

  async getById(id: number, signal?: AbortSignal): Promise<Carrier> {
    return apiRequest(`/carriers/${id}`, { signal })
  },

  async create(input: CarrierInput): Promise<void> {
    await apiRequest('/carriers', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  async update(id: number, input: CarrierInput): Promise<void> {
    await apiRequest(`/carriers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    })
  },

  async delete(id: number): Promise<void> {
    return apiRequest(`/carriers/${id}`, { method: 'DELETE' })
  },
}
