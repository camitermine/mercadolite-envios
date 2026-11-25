import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SesionService } from './sesion.service'

class AlmacenamientoEnMemoria implements Storage {
  private datos = new Map<string, string>()

  get length(): number {
    return this.datos.size
  }

  clear(): void {
    this.datos.clear()
  }

  getItem(clave: string): string | null {
    return this.datos.get(clave) ?? null
  }

  key(indice: number): string | null {
    return [...this.datos.keys()][indice] ?? null
  }

  removeItem(clave: string): void {
    this.datos.delete(clave)
  }

  setItem(clave: string, valor: string): void {
    this.datos.set(clave, valor)
  }
}

describe('SesionService', () => {
  let sesion: SesionService

  beforeEach(() => {
    const almacenamiento = new AlmacenamientoEnMemoria()
    sesion = new SesionService(() => almacenamiento)
  })

  it('no restaura nada si nunca se inició sesión', () => {
    expect(sesion.restaurar()).toBeUndefined()
  })

  it('restaura el nombre con el que se inició sesión', () => {
    sesion.iniciar('María José')

    expect(sesion.restaurar()).toBe('María José')
  })

  it('no falla si el navegador no permite usar el almacenamiento', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const sinAlmacenamiento = new SesionService(() => {
      throw new Error('sin acceso')
    })

    expect(() => sinAlmacenamiento.iniciar('Iván')).not.toThrow()
    expect(sinAlmacenamiento.restaurar()).toBeUndefined()
  })
})
