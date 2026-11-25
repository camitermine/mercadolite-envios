export class HttpService {
  constructor(private readonly pathname: string) {}

  async get<TResponse>(endpoint: string): Promise<TResponse> {
    return this.request<never, TResponse>(endpoint, 'GET')
  }

  async post<TRequest, TResponse>(endpoint: string, payload: TRequest): Promise<TResponse> {
    return this.request<TRequest, TResponse>(endpoint, 'POST', payload)
  }

  // Alta de un recurso: la API responde 201 sin cuerpo e informa dónde quedó en el header Location.
  async create<TRequest>(endpoint: string, payload: TRequest): Promise<string> {
    const response = await this.send(endpoint, 'POST', payload)
    const location = response.headers.get('Location')

    if (location === null) {
      throw new Error(`POST ${endpoint} no informó la ubicación del recurso creado`)
    }

    return location
  }

  async put<TRequest, TResponse>(endpoint: string, payload: TRequest): Promise<TResponse> {
    return this.request<TRequest, TResponse>(endpoint, 'PUT', payload)
  }

  async patch<TRequest, TResponse>(endpoint: string, payload: TRequest): Promise<TResponse> {
    return this.request<TRequest, TResponse>(endpoint, 'PATCH', payload)
  }

  async delete<TResponse>(endpoint: string): Promise<TResponse> {
    return this.request<never, TResponse>(endpoint, 'DELETE')
  }

  private async request<TRequest, TResponse>(
    endpoint: string,
    method: string,
    payload?: TRequest,
  ): Promise<TResponse> {
    const response = await this.send(endpoint, method, payload)

    if (response.status === 204) return undefined as TResponse

    return (await response.json()) as TResponse
  }

  private async send<TRequest>(
    endpoint: string,
    method: string,
    payload?: TRequest,
  ): Promise<Response> {
    const response = await fetch(`${this.pathname}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: payload === undefined ? undefined : JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${method} ${endpoint}`)
    }

    return response
  }
}
