import { describe, expect, it } from 'vitest'
import { DatosEntrega, validarMetodoEntrega } from './datosEntrega'

function datosValidos(): DatosEntrega {
  return new DatosEntrega({
    nombreApellido: 'Julieta Fernández',
    email: 'julieta.fernandez@correo.com',
    telefono: '11 2345-6789',
    localidad: 'Palermo, CABA',
    direccion: 'Av. Siempre Viva 742',
    metodoEntrega: 'Envío a domicilio',
  })
}

describe('validarMetodoEntrega', () => {
  it('rechaza un método que no existe', () => {
    expect(validarMetodoEntrega('Teletransportación')).toBeDefined()
  })

  it('acepta uno de los métodos válidos', () => {
    expect(validarMetodoEntrega('Retiro por sucursal')).toBeUndefined()
  })
})

describe('DatosEntrega', () => {
  it('arranca vacío y con el primer método de entrega elegido', () => {
    const datos = new DatosEntrega()

    expect(datos.nombreApellido).toBe('')
    expect(datos.metodoEntrega).toBe('Envío a domicilio')
    expect(datos.sonValidos).toBe(false)
  })

  it('no tiene errores cuando todos los datos son válidos', () => {
    const datos = datosValidos()

    expect(datos.errores).toEqual({})
    expect(datos.sonValidos).toBe(true)
  })

  it('usa un mensaje propio para el nombre y apellido vacío', () => {
    const datos = datosValidos()
    datos.nombreApellido = ''

    expect(datos.errores.nombreApellido).toBe('Ingresá tu nombre y apellido')
  })

  it('acumula un error por cada campo inválido', () => {
    const datos = new DatosEntrega({ email: 'no-es-un-email', metodoEntrega: 'Teletransportación' })

    expect(datos.sonValidos).toBe(false)
    expect(Object.keys(datos.errores)).toEqual([
      'nombreApellido',
      'email',
      'telefono',
      'localidad',
      'direccion',
      'metodoEntrega',
    ])
  })
})
