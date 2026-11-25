import type { Resena } from '../../dominio/producto'
import { FormateadorFecha } from '../../utils/formateadorFecha'

export class ResenaCard {
  resena: Resena = {
    rating: 0,
    comment: '',
    date: '',
    reviewerName: '',
  }

  get inicial(): string {
    return this.resena.reviewerName.charAt(0)
  }

  get fechaFormateada(): string {
    return FormateadorFecha.formatear(this.resena.date)
  }
}
