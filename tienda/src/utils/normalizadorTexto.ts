export const NormalizadorTexto = {
  normalizar(valor: string): string {
    return valor.trim()
  },

  normalizarParaBusqueda(valor: string): string {
    return NormalizadorTexto.normalizar(valor).toLocaleLowerCase()
  },

  capitalizar(valor: string): string {
    return valor.charAt(0).toLocaleUpperCase() + valor.slice(1)
  },
}
