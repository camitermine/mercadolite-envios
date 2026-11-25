import {
  type Validador,
  validarDireccion,
  validarEmail,
  validarLocalidad,
  validarNombre,
  validarTelefono,
} from '../utils/validaciones'

export const METODOS_ENTREGA = [
  'Envío a domicilio',
  'Retiro por sucursal',
  'Entrega express',
] as const

export type MetodoEntrega = (typeof METODOS_ENTREGA)[number]

export const CAMPOS_ENTREGA = [
  'nombreApellido',
  'email',
  'telefono',
  'localidad',
  'direccion',
  'metodoEntrega',
] as const

export type CampoEntrega = (typeof CAMPOS_ENTREGA)[number]

export type ErroresDatosEntrega = Partial<Record<CampoEntrega, string>>

export function validarMetodoEntrega(valor: string): string | undefined {
  if (!METODOS_ENTREGA.includes(valor as MetodoEntrega)) return 'Elegí un método de entrega'
  return undefined
}

const VALIDADORES: Record<CampoEntrega, Validador> = {
  nombreApellido: (valor: string): string | undefined =>
    validarNombre(valor, 'Ingresá tu nombre y apellido'),
  email: validarEmail,
  telefono: validarTelefono,
  localidad: validarLocalidad,
  direccion: validarDireccion,
  metodoEntrega: validarMetodoEntrega,
}

export class DatosEntrega {
  nombreApellido = ''
  email = ''
  telefono = ''
  localidad = ''
  direccion = ''
  metodoEntrega: string = METODOS_ENTREGA[0]

  constructor(datos: Partial<Record<CampoEntrega, string>> = {}) {
    Object.assign(this, datos)
  }

  get errores(): ErroresDatosEntrega {
    const errores: ErroresDatosEntrega = {}

    for (const campo of CAMPOS_ENTREGA) {
      const error = VALIDADORES[campo](this[campo])
      if (error) errores[campo] = error
    }

    return errores
  }

  get sonValidos(): boolean {
    return Object.keys(this.errores).length === 0
  }
}
