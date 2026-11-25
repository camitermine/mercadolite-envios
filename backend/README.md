# MercadoLite Envíos - Backend

Backend REST desarrollado con Kotlin, Spring Boot y Gradle.

La aplicación sigue una estructura simple de capas:

- `controller`: publica los endpoints HTTP.
- `service`: contiene las reglas del negocio.
- `repository`: guarda los datos en memoria.
- `domain`: representa los transportistas.

Por ahora no usa base de datos: todo vive en memoria. Al iniciar la aplicación solo se cargan los transportistas; las órdenes llegan desde la app de PelelaJS y los envíos se crean desde React. Los números de seguimiento arrancan en `AR-100001`.

Con el perfil `demo` (`./gradlew bootRun --args='--spring.profiles.active=demo'`) también se cargan órdenes y envíos de ejemplo. Es el que usa el `start.bat` de la raíz del repo.

## Respuestas

- Las consultas (`GET`) devuelven los datos en JSON.
- Las altas (`POST`) responden solo `201 Created`, sin cuerpo. El header `Location` indica dónde quedó el recurso creado (por ejemplo `/orders/AR-100001`); así el cliente conoce el número de seguimiento o el id generado.
- Las modificaciones (`PUT`, `PATCH`) y las bajas (`DELETE`) responden solo `204 No Content`.
- Los errores usan siempre el formato `{ code, data, message }`.

## Endpoints de transportistas

- `GET /carriers`
- `GET /carriers/{id}`
- `POST /carriers`
- `PUT /carriers/{id}`
- `DELETE /carriers/{id}`

## Endpoints de órdenes

- `GET /orders`: órdenes pendientes (todavía sin envío), para la pantalla Pendientes de React.
- `GET /orders/user/{userName}`: todos los pedidos que hizo un usuario de PelelaJS (pendientes y con envío), con su producto, estado (`Pendiente`, `En camino`, `Demorado` o `Entregado`) y fechas del envío. Lo usa la pantalla Mis pedidos de PelelaJS.
- `POST /orders`: alta de un pedido confirmado en la app de PelelaJS. El número de seguimiento lo genera el backend. `userName` es el usuario que hizo el pedido y no cambia; `clientName` es quien lo recibe, y se puede corregir desde React al crear o editar el envío. Cuerpo:

  ```json
  {
    "userName": "Pepe",
    "clientName": "Julieta Fernández",
    "address": "Av. Siempre Viva 742",
    "destination": "Palermo, CABA",
    "product": { "id": 1, "name": "Essence Mascara", "price": 9.99, "thumbnail": "https://...", "quantity": 2 }
  }
  ```
- `DELETE /orders/{trackingNumber}`: baja de un pedido cancelado en PelelaJS, si todavía no tiene envío.

## Endpoints de envíos

- `GET /shipments`
- `GET /shipments/{trackingNumber}`
- `POST /shipments`: crea el envío de una orden pendiente; el número de seguimiento de la orden va en el cuerpo. Responde `404` si la orden no existe y `409` si ya tiene un envío.
- `PUT /shipments/{trackingNumber}`
- `PATCH /shipments/{trackingNumber}/deliver`: marca el envío como entregado con la fecha de hoy.

## Requisitos

- JDK 21

## Comandos

En Windows:

```powershell
.\gradlew.bat bootRun
.\gradlew.bat test
.\gradlew.bat build
```

En Linux o macOS:

```bash
./gradlew bootRun
./gradlew test
./gradlew build
```

La aplicación utiliza el puerto `8080` de forma predeterminada.

## Integración continua

El workflow `.github/workflows/ci.yml` corre `./gradlew build` (compila y ejecuta todos los tests) en cada push y en cada pull request hacia `main` o `dev`. Si un test falla, el reporte queda adjunto a la ejecución.
