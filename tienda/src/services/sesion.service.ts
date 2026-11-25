const CLAVE_SESION: string = 'mercadolite.usuario'

export class SesionService {
  constructor(private readonly almacenamiento: () => Storage = () => sessionStorage) {}

  iniciar(nombre: string): void {
    try {
      this.almacenamiento().setItem(CLAVE_SESION, nombre)
    } catch (error: unknown) {
      console.error(error)
    }
  }

  restaurar(): string | undefined {
    try {
      return this.almacenamiento().getItem(CLAVE_SESION) ?? undefined
    } catch (error: unknown) {
      console.error(error)
      return undefined
    }
  }
}

export const sesionService: SesionService = new SesionService()
