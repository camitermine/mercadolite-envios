# MercadoLite Envíos

## Desarrollo

El proyecto utiliza exclusivamente pnpm.

```bash
corepack enable
pnpm install
pnpm dev
```

Comandos de validación:

```bash
pnpm lint
pnpm test
pnpm build
```

## Integración continua

El workflow `.github/workflows/ci.yml` de la raíz del repo corre el lint, los tests y el build en cada push y en cada pull request
hacia `main`.

## Backend

Las pantallas consumen la API de MercadoLite Envíos, que tiene que estar corriendo en `http://localhost:8080`
(se puede cambiar con la variable `VITE_API_URL`). El backend guarda los datos en memoria: se reinician al reiniciarlo.

La app usa el puerto `5173`, que es el que el backend habilita por CORS.

Al crear, editar o entregar, el backend responde solo con el status (`201` o `204`), sin cuerpo. Por eso, después
de entregar un envío, la pantalla vuelve a pedir la lista.

## Pendientes y la app de PelelaJS

La pantalla Pendientes lista las órdenes que todavía no tienen envío. Las órdenes se dan de alta desde la app de
PelelaJS (MercadoLite) al confirmar un pedido, y dejan de aparecer si el pedido se cancela ahí.
Al elegir un transportista y confirmar, se abre Nuevo envío; recién al guardar ese formulario se crea el envío.
