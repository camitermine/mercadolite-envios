import { router } from 'pelelajs'
import { type Usuario, usuarioActual } from '../../dominio/usuario'
import { type SesionService, sesionService } from '../../services/sesion.service'

export class Login {
  nombre = ''
  errorNombre = ''

  constructor(
    private readonly usuario: Usuario = usuarioActual,
    private readonly sesion: SesionService = sesionService,
  ) {}

  get claseNombre(): string {
    return this.errorNombre === '' ? '' : 'campo-error'
  }

  ingresar(_login?: Login, evento?: Event): void {
    evento?.preventDefault()

    this.errorNombre = this.usuario.validarNombre(this.nombre) ?? ''
    if (this.errorNombre !== '') return

    this.usuario.identificarCon(this.nombre)
    this.sesion.iniciar(this.usuario.nombre)
    router.navigateTo('/catalogo')
  }
}
