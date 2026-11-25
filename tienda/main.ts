import './styles.css'
import { router } from 'pelelajs'
import 'virtual:pelela-auto-register'
import { routes } from './routes'
import { usuarioActual } from './src/dominio/usuario'
import { sesionService } from './src/services/sesion.service'

const nombreEnSesion: string | undefined = sesionService.restaurar()
if (nombreEnSesion !== undefined) usuarioActual.identificarCon(nombreEnSesion)
if (usuarioActual.estaIdentificado && window.location.pathname === '/') {
  history.replaceState(null, '', '/catalogo')
}

const root: HTMLElement = document.getElementById('app') ?? document.body
router.start(root, routes)
