import { ApiError } from './errors'

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

// Las altas (201) y las modificaciones (204) responden solo con el status, sin cuerpo
const NO_BODY_STATUSES = [201, 204]

interface ErrorResponse {
  code?: number
  data?: Record<string, string>
  message?: string
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: options.body
      ? { 'Content-Type': 'application/json' }
      : undefined,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null) as ErrorResponse | null

    throw new ApiError(
      error?.code ?? response.status,
      error?.message ?? 'No se pudo completar la solicitud',
      error?.data,
    )
  }

  if (NO_BODY_STATUSES.includes(response.status)) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export function getJson<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  return apiRequest(path, { signal })
}
