import { beforeEach, describe, expect, it } from 'vitest'
import { GaleriaProducto } from './galeria-producto'

describe('GaleriaProducto', () => {
  let vm: GaleriaProducto

  beforeEach(() => {
    vm = new GaleriaProducto()

    vm.imagenes = [
      { url: 'imagen-principal.jpg' },
      { url: 'imagen-2.jpg' },
      { url: 'imagen-3.jpg' },
    ]

    vm.imagenPrincipal = 'imagen-principal.jpg'
  })

  it('cambia la imagen principal al seleccionar otra imagen', () => {
    vm.mostrarImagen(1)

    expect(vm.imagenPrincipal).toBe('imagen-2.jpg')
    expect(vm.imagenActual).toBe(1)
  })

  it('avanza a la siguiente imagen', () => {
    vm.imagenSiguiente()

    expect(vm.imagenActual).toBe(1)
    expect(vm.imagenPrincipal).toBe('imagen-2.jpg')
  })

  it('vuelve a la primera imagen al avanzar desde la última', () => {
    vm.imagenActual = 2

    vm.imagenSiguiente()

    expect(vm.imagenActual).toBe(0)
    expect(vm.imagenPrincipal).toBe('imagen-principal.jpg')
  })

  it('vuelve a la última imagen al retroceder desde la primera', () => {
    vm.imagenAnterior()

    expect(vm.imagenActual).toBe(2)
    expect(vm.imagenPrincipal).toBe('imagen-3.jpg')
  })

  it('selecciona la miniatura elegida según su índice', () => {
    vm.seleccionarImagen({
      indice: 2,
      mostrarImagen: (indice: number): void => vm.mostrarImagen(indice),
    })

    expect(vm.imagenActual).toBe(2)
    expect(vm.imagenPrincipal).toBe('imagen-3.jpg')
  })

  it('no hace nada si no hay imágenes', () => {
    const vacia = new GaleriaProducto()

    vacia.imagenSiguiente()
    vacia.imagenAnterior()

    expect(vacia.imagenActual).toBe(0)
    expect(vacia.imagenPrincipal).toBe('')
  })
})
