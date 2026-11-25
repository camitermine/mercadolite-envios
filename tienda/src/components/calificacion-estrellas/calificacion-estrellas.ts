export class CalificacionEstrellas {
  calificacion = 0

  get estrellas(): string[] {
    const calificacionNormalizada = Math.round(Math.min(5, Math.max(0, this.calificacion)) * 2) / 2

    return Array.from({ length: 5 }, (_, indice) => {
      const posicion = indice + 1

      if (posicion <= calificacionNormalizada) {
        return 'ph-fill ph-star estrella-llena'
      }

      if (posicion - 0.5 === calificacionNormalizada) {
        return 'ph-fill ph-star-half estrella-mitad'
      }

      return 'ph ph-star estrella-vacia'
    })
  }
}
