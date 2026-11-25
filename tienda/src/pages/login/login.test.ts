import { router } from 'pelelajs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Usuario } from '../../dominio/usuario'
import { SesionService } from '../../services/sesion.service'
import { Login } from './login'

describe('Login', () => {
  let usuario: Usuario
  let sesion: SesionService
  let login: Login

  beforeEach(() => {
    usuario = new Usuario()
    sesion = new SesionService()
    vi.spyOn(sesion, 'iniciar').mockImplementation(() => undefined)
    login = new Login(usuario, sesion)
    vi.spyOn(router, 'navigateTo').mockImplementation(() => undefined)
  })

  it('no muestra errores antes del primer intento de ingreso', () => {
    expect(login.errorNombre).toBe('')
    expect(login.claseNombre).toBe('')
  })

  it('calcula la clase del campo a partir del error actual', () => {
    login.errorNombre = 'Error de prueba'

    expect(login.claseNombre).toBe('campo-error')
  })

  it('muestra un error y no inicia la sesión si el nombre es inválido', () => {
    login.ingresar()

    expect(login.errorNombre).toBe('Ingresá tu nombre')
    expect(login.claseNombre).toBe('campo-error')
    expect(usuario.nombre).toBe('')
    expect(sesion.iniciar).not.toHaveBeenCalled()
    expect(router.navigateTo).not.toHaveBeenCalled()
  })

  it('informa que un nombre numérico solo puede contener letras', () => {
    login.nombre = '1234'

    login.ingresar()

    expect(login.errorNombre).toBe('El nombre solo puede contener letras')
    expect(login.claseNombre).toBe('campo-error')
    expect(router.navigateTo).not.toHaveBeenCalled()
  })

  it('evita que el formulario recargue la página al presionar Enter', () => {
    const evento = { preventDefault: vi.fn() } as unknown as Event
    login.nombre = '1234'

    login.ingresar(login, evento)

    expect(evento.preventDefault).toHaveBeenCalled()
    expect(login.nombre).toBe('1234')
    expect(login.errorNombre).toBe('El nombre solo puede contener letras')
  })

  it('guarda el nombre normalizado, inicia la sesión y navega al catálogo si es válido', () => {
    login.nombre = '  María José  '

    login.ingresar()

    expect(usuario.nombre).toBe('María José')
    expect(sesion.iniciar).toHaveBeenCalledWith('María José')
    expect(router.navigateTo).toHaveBeenCalledWith('/catalogo')
  })
})
