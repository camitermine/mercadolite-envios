import { describe, expect, it } from 'vitest'
import {
  formato,
  largoMinimo,
  requerido,
  validar,
  validarDireccion,
  validarEmail,
  validarLocalidad,
  validarNombre,
  validarTelefono,
} from './validaciones'

describe('validar', () => {
  it('devuelve el mensaje de la primera regla que no se cumple', () => {
    const error = validar(
      'ab',
      requerido('vacío'),
      largoMinimo(3, 'corto'),
      formato(/^\d+$/, 'números'),
    )

    expect(error).toBe('corto')
  })

  it('ignora los espacios de los extremos antes de validar', () => {
    expect(validar('   ', requerido('vacío'))).toBe('vacío')
  })

  it('devuelve undefined si se cumplen todas las reglas', () => {
    expect(validar('123', requerido('vacío'), formato(/^\d+$/, 'números'))).toBeUndefined()
  })
})

describe('validarNombre', () => {
  it('rechaza el nombre vacío, con un mensaje configurable', () => {
    expect(validarNombre('')).toBe('Ingresá tu nombre')
    expect(validarNombre('   ', 'Ingresá tu nombre y apellido')).toBe(
      'Ingresá tu nombre y apellido',
    )
  })

  it('rechaza nombres demasiado cortos', () => {
    expect(validarNombre('J')).toBe('El nombre es demasiado corto')
  })

  it('rechaza nombres con números o símbolos', () => {
    expect(validarNombre('Julieta123')).toBe('El nombre solo puede contener letras')
    expect(validarNombre('Julieta@Fernández')).toBe('El nombre solo puede contener letras')
  })

  it('acepta nombres compuestos, acentuados, con apóstrofe o guion', () => {
    expect(validarNombre('Julieta Fernández')).toBeUndefined()
    expect(validarNombre("O'Connor")).toBeUndefined()
    expect(validarNombre('Ana-Laura')).toBeUndefined()
  })
})

describe('validarEmail', () => {
  it('rechaza el email vacío', () => {
    expect(validarEmail('')).toBe('Ingresá tu email')
  })

  it('rechaza emails sin arroba o sin dominio', () => {
    expect(validarEmail('julieta.correo.com')).toBe('Ingresá un email válido')
    expect(validarEmail('julieta@correo')).toBe('Ingresá un email válido')
    expect(validarEmail('@correo.com')).toBe('Ingresá un email válido')
  })

  it('acepta un email con formato válido', () => {
    expect(validarEmail('julieta.fernandez@correo.com')).toBeUndefined()
  })
})

describe('validarTelefono', () => {
  it('rechaza el teléfono vacío', () => {
    expect(validarTelefono('')).toBe('Ingresá tu teléfono')
  })

  it('rechaza teléfonos demasiado cortos', () => {
    expect(validarTelefono('123')).toBe('El teléfono es demasiado corto')
  })

  it('rechaza teléfonos con letras', () => {
    expect(validarTelefono('11-ABCD-6789')).toBe('El teléfono solo puede contener números')
  })

  it('acepta un teléfono con formato válido', () => {
    expect(validarTelefono('+54 (11) 2345-6789')).toBeUndefined()
  })
})

describe('validarLocalidad y validarDireccion', () => {
  it('rechazan valores vacíos', () => {
    expect(validarLocalidad('')).toBe('Ingresá tu localidad')
    expect(validarDireccion('  ')).toBe('Ingresá tu dirección')
  })

  it('aceptan cualquier texto no vacío', () => {
    expect(validarLocalidad('Palermo, CABA')).toBeUndefined()
    expect(validarDireccion('Av. Siempre Viva 742')).toBeUndefined()
  })
})
