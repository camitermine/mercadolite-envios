# MercadoLite 🛒

Trabajo práctico de la materia **Algoritmos III** (UNSAM) — Ciclo 2026.

## Integrantes del grupo 👥

- BONOMI, IVÁN — ivanbonomi13 
- DIEZ, NICOLAS PABLO — nicodiez02
- ELHALEM, JULIETA — julietaelhalem
- TERMINE, CAMILA DENISE — camitermine

## Descripción general 📖

MercadoLite es una plataforma de e-commerce.

## Entrega 1 — Maquetación 🖼

En esta primera entrega se realiza el **maquetado estático** en **HTML y CSS** de las siguientes vistas, contemplando versión mobile y versión web:

- **Login**
- **Catálogo**
- **Detalle de Producto**
- **Hacer Pedido**
- **Mis Pedidos**

### Requisitos técnicos 🛠

- Maquetado en HTML y CSS.
- Paleta de colores implementada de forma fácilmente modificable.
- Tamaños de referencia por dispositivo:
  - **Mobile:** ancho máximo de 375px.
  - **Web:** ancho máximo de 1440px.

### Recomendaciones ✨

- Fuentes: [Google Fonts](https://fonts.google.com/)
- Íconos: [Phosphor Icons](https://phosphoricons.com/)

## Entrega 2 — PelelaJS 🪴

En esta segunda entrega se desarrolla la aplicación con [PelelaJS](https://algo3.uqbar-project.org/herramientas/pelelajs), consumiendo la [API de productos de DummyJSON](https://dummyjson.com/docs/products). El código de la aplicación vive en la raíz del repositorio; el maquetado estático de la Entrega 1 se conserva como referencia en [`Maquetado/`](./Maquetado).

### Requisitos 🛠

- Node 24
- [pnpm](https://pnpm.io/)

### Cómo correrlo

```bash
pnpm install
pnpm dev
```

## Entrega 3 — Conexión con MercadoLite Envíos 📦

Al confirmar un pedido, la app lo da de alta en la API de envíos (`POST /orders`) y aparece en la pantalla Pendientes de React. Al cancelarlo, se da de baja (`DELETE /orders/{trackingNumber}`) y sale de Pendientes; si ya tiene un envío, la API rechaza la cancelación.

El alta responde solo `201 Created`, sin cuerpo: el número de seguimiento que generó el backend se lee del header `Location` (`/orders/AR-100001`) y se usa para el mensaje de confirmación.

Para probarlo, el backend tiene que estar corriendo en `http://localhost:8080`. Esta app usa el puerto `5174`, porque React usa el `5173`.

### Mis pedidos

Los pedidos se guardan solo en el backend (en memoria, sin base de datos). Cada pedido tiene dos nombres:

- el **usuario** con el que se ingresó a la app (`userName`): es el dueño del pedido y no cambia;
- el **destinatario**, que es el "Nombre y apellido" de los datos de entrega (`clientName`): es el cliente que ve React, y desde ahí se puede corregir al crear o editar el envío.

Cada vez que se entra a Mis pedidos, la app pide los pedidos del usuario con `GET /orders/user/{nombre}` y muestra de cada uno a nombre de quién está, su estado actual (`Pendiente`, `En camino`, `Demorado` o `Entregado`) y, si ya tiene envío, la fecha estimada o la de entrega. Si desde React se crea el envío de un pedido, se le cambia el cliente o se lo marca como entregado, se ve al volver a entrar a Mis pedidos. Solo se pueden cancelar los pedidos pendientes.

El email, el teléfono y el método de entrega se validan en el formulario pero no se guardan: la API de envíos no los usa.

La sesión se guarda en `sessionStorage`: al recargar la página (F5) no hace falta volver a ingresar el nombre. Se pierde al cerrar la pestaña. Si se reinicia el backend, se pierden los pedidos dados de alta.

### Deuda técnica

- **Errores de la API:** `HttpService` solo informa el código HTTP y descarta el detalle que manda el backend (`code`, `message` y `data` con los errores por campo). Por eso, ante cualquier falla, las pantallas muestran un mensaje genérico. Faltaría leer ese cuerpo y mostrar los errores junto a cada campo.
- **Mis pedidos no se actualiza solo:** el estado de los pedidos se consulta al entrar a la pantalla. PelelaJS avisa cuando se entra a una pantalla (`initialize`) pero no cuando se sale, así que un refresco automático cada cierto tiempo quedaría corriendo en las demás pantallas.
