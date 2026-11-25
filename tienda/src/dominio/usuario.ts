import { NormalizadorTexto } from '../utils/normalizadorTexto'
import { validarNombre } from '../utils/validaciones'

export class Usuario {
  nombre = ''

  validarNombre(valor: string): string | undefined {
    return validarNombre(valor)
  }

  get estaIdentificado(): boolean {
    return this.nombre !== ''
  }

  identificarCon(nombre: string): void {
    this.nombre = NormalizadorTexto.normalizar(nombre)
  }
}

export const usuarioActual: Usuario = new Usuario()
