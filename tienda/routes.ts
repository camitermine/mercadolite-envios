import type { RouteDefinition } from 'pelelajs'
import { Catalogo } from './src/pages/catalogo/catalogo'
import { DetalleProducto } from './src/pages/detalleProducto/detalleProducto'
import { HacerPedido } from './src/pages/hacerPedido/hacerPedido'
import { Login } from './src/pages/login/login'
import { MisPedidos } from './src/pages/misPedidos/misPedidos'

export const routes: RouteDefinition[] = [
  { path: '/', component: Login },
  { path: '/catalogo', component: Catalogo },
  { path: '/detalle/:id', component: DetalleProducto },
  { path: '/hacer-pedido', component: HacerPedido },
  { path: '/mis-pedidos', component: MisPedidos },
  { path: '*', component: Login },
]
