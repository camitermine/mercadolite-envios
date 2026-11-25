import { vi } from 'vitest'
import { DatosEntrega } from '../dominio/datosEntrega'
import type { Pedido } from '../dominio/pedido'
import { Producto } from '../dominio/producto'
import { Usuario } from '../dominio/usuario'
import { PedidoService } from '../services/pedido.service'

type OpcionesProducto = {
  id?: number
  title?: string
  category?: string
  price?: number
  stock?: number
  minimumOrderQuantity?: number
}

export function crearProducto({
  id = 1,
  title = 'Producto',
  category = 'general',
  price = 100,
  stock = 10,
  minimumOrderQuantity = 1,
}: OpcionesProducto = {}): Producto {
  return new Producto(
    id,
    title,
    category,
    price,
    4.5,
    stock,
    `imagen-${id}.jpg`,
    '',
    0,
    '',
    '',
    '',
    minimumOrderQuantity,
  )
}

export function crearDatosEntregaValidos(): DatosEntrega {
  return new DatosEntrega({
    nombreApellido: 'Julieta Fernández',
    email: 'julieta.fernandez@correo.com',
    telefono: '11 2345-6789',
    localidad: 'Palermo, CABA',
    direccion: 'Av. Siempre Viva 742',
    metodoEntrega: 'Envío a domicilio',
  })
}

export function crearUsuario(nombre: string = 'Pepe'): Usuario {
  const usuario = new Usuario()
  usuario.identificarCon(nombre)
  return usuario
}

// Da de alta un pedido y lo devuelve como lo trae Mis pedidos.
export async function pedirYObtener(
  servicio: PedidoService,
  producto: Producto,
  cantidad: number,
  usuario: Usuario,
): Promise<Pedido> {
  const numeroSeguimiento = await servicio.crear(
    producto,
    cantidad,
    crearDatosEntregaValidos(),
    usuario,
  )
  const pedidos = await servicio.obtenerDelUsuario(usuario)
  const pedido = pedidos.find((candidato) => candidato.numeroSeguimiento === numeroSeguimiento)

  if (pedido === undefined) throw new Error(`No se encontró el pedido ${numeroSeguimiento}`)

  return pedido
}

type OrdenSimulada = { trackingNumber: string; userName: string; status: string }

// PedidoService real, con la API de envíos simulada.
export function crearPedidoServiceSinApi(): PedidoService {
  let ultimoSeguimiento = 100
  let ordenes: OrdenSimulada[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn<typeof fetch>(async (url, opciones) => {
      const ruta = String(url).replace('http://localhost:8080', '')
      if (opciones?.method === 'DELETE') {
        ordenes = ordenes.filter((orden) => ruta !== `/orders/${orden.trackingNumber}`)
        return new Response(null, { status: 204 })
      }
      if (opciones?.method === 'POST') {
        ultimoSeguimiento += 1
        const orden = {
          ...JSON.parse(String(opciones.body)),
          trackingNumber: `AR-${ultimoSeguimiento}`,
          createdAt: '2026-09-24',
          status: 'Pendiente',
        }
        ordenes = [...ordenes, orden]
        return new Response(null, {
          status: 201,
          headers: { Location: `/orders/${orden.trackingNumber}` },
        })
      }
      const usuario = decodeURIComponent(ruta.replace('/orders/user/', ''))
      return new Response(JSON.stringify(ordenes.filter((orden) => orden.userName === usuario)), {
        status: 200,
      })
    }),
  )
  return new PedidoService()
}
