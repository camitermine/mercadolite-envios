import { router } from 'pelelajs'

type ClasesMenu = { 'menu-abierto': boolean }

export class BarraNavegacion {
  menuAbierto = false

  get menuCerrado(): boolean {
    return !this.menuAbierto
  }

  get clasesMenu(): ClasesMenu {
    return { 'menu-abierto': this.menuAbierto }
  }

  alternarMenu(): void {
    this.menuAbierto = !this.menuAbierto
  }

  irAlCatalogo(_navegacion?: BarraNavegacion, evento?: Event): void {
    this.navegarA('/catalogo', evento)
  }

  irAMisPedidos(_navegacion?: BarraNavegacion, evento?: Event): void {
    this.navegarA('/mis-pedidos', evento)
  }

  private navegarA(ruta: string, evento?: Event): void {
    evento?.preventDefault()
    this.menuAbierto = false
    router.navigateTo(ruta)
  }
}
