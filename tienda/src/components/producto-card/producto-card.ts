import { Producto } from '../../dominio/producto'

type SeleccionarProducto = (contexto: { producto: Producto }) => void

export class ProductoCard {
  producto = new Producto(0, '', '', 0, 0, 0, '')
  alSeleccionar: SeleccionarProducto = () => undefined

  seleccionar = (): void => {
    this.alSeleccionar({ producto: this.producto })
  }
}
