type ContextoMiniatura = {
  indice: number
  mostrarImagen: (indice: number) => void
}

export class GaleriaProducto {
  imagenes: {
    url: string
  }[] = []

  imagenActual = 0
  imagenPrincipal = ''

  mostrarImagen(indice: number): void {
    if (this.imagenes.length === 0) return

    this.imagenActual = indice
    this.imagenPrincipal = this.imagenes[indice].url
  }

  imagenAnterior(): void {
    if (this.imagenes.length === 0) return

    let nuevoIndice = this.imagenActual - 1

    if (nuevoIndice < 0) {
      nuevoIndice = this.imagenes.length - 1
    }

    this.mostrarImagen(nuevoIndice)
  }

  imagenSiguiente(): void {
    if (this.imagenes.length === 0) return

    let nuevoIndice = this.imagenActual + 1

    if (nuevoIndice >= this.imagenes.length) {
      nuevoIndice = 0
    }

    this.mostrarImagen(nuevoIndice)
  }

  seleccionarImagen = (contexto: ContextoMiniatura): void => {
    contexto.mostrarImagen(contexto.indice)
  }
}
