import { describe, expect, it } from 'vitest'
import { Usuario } from './usuario'

describe('Usuario.validarNombre', () => {
  const usuario = new Usuario()

  it('rechaza un nombre vacío o compuesto solamente por espacios', () => {
    expect(usuario.validarNombre('')).toBe('Ingresá tu nombre')
    expect(usuario.validarNombre('   ')).toBe('Ingresá tu nombre')
  })

  it('rechaza un nombre demasiado corto', () => {
    expect(usuario.validarNombre('J')).toBe('El nombre es demasiado corto')
  })

  it('rechaza números y símbolos que no pertenecen a un nombre', () => {
    expect(usuario.validarNombre('Juan123')).toBe('El nombre solo puede contener letras')
    expect(usuario.validarNombre('Juan@')).toBe('El nombre solo puede contener letras')
  })

  it('acepta nombres simples, compuestos, acentuados y con apóstrofe', () => {
    expect(usuario.validarNombre('Iván')).toBeUndefined()
    expect(usuario.validarNombre('María José')).toBeUndefined()
    expect(usuario.validarNombre("O'Connor")).toBeUndefined()
  })
})

describe('Usuario', () => {
  it('se identifica con el nombre sin espacios externos', () => {
    const usuario = new Usuario()

    usuario.identificarCon('  María José  ')

    expect(usuario.nombre).toBe('María José')
  })

  it('está identificado solo después de identificarse con un nombre', () => {
    const usuario = new Usuario()

    expect(usuario.estaIdentificado).toBe(false)

    usuario.identificarCon('Iván')

    expect(usuario.estaIdentificado).toBe(true)
  })
})
