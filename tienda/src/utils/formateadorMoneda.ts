export const FormateadorMoneda = {
  formatear(monto: number): string {
    return monto.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
    })
  },
}
