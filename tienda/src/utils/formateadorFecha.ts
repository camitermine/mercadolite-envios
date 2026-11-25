export const FormateadorFecha = {
  formatear(fecha: Date | string): string {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  },
}
