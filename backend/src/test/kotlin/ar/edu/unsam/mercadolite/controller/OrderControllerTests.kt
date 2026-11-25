package ar.edu.unsam.mercadolite.controller

import ar.edu.unsam.mercadolite.repository.ShipmentRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.patch
import org.springframework.test.web.servlet.post
import java.time.LocalDate

@SpringBootTest
@AutoConfigureMockMvc
class OrderControllerTests(
    @Autowired private val mockMvc: MockMvc,
    @Autowired private val shipmentRepository: ShipmentRepository,
) {
    @BeforeEach
    fun resetRepository() {
        shipmentRepository.reset()
    }

    @Test
    fun `devuelve las ordenes pendientes`() {
        mockMvc.get("/orders")
            .andExpect {
                status { isOk() }
                jsonPath("$.length()") { value(6) }
                jsonPath("$[0].trackingNumber") { value("AR-100260") }
                jsonPath("$[0].clientName") { value("Rocío Benítez") }
                jsonPath("$[0].address") { value("Av. Corrientes 5320") }
                jsonPath("$[0].destination") { value("Villa Crespo, CABA") }
                jsonPath("$[0].product") { value("Auriculares inalámbricos") }
                jsonPath("$[0].status") { doesNotExist() }
            }
    }

    @Test
    fun `permite pedidos desde el frontend`() {
        mockMvc.get("/orders") { header("Origin", "http://localhost:5173") }
            .andExpect {
                status { isOk() }
                header { string("Access-Control-Allow-Origin", "http://localhost:5173") }
            }
    }

    @Test
    fun `deja que el navegador lea el header Location de un alta`() {
        mockMvc.get("/orders") { header("Origin", "http://localhost:5174") }
            .andExpect {
                header { string("Access-Control-Expose-Headers", "Location") }
            }
    }

    @Test
    fun `permite pedidos desde la app de pelela`() {
        mockMvc.get("/orders") { header("Origin", "http://localhost:5174") }
            .andExpect {
                status { isOk() }
                header { string("Access-Control-Allow-Origin", "http://localhost:5174") }
            }
    }

    private fun postOrder(
        userName: String = "Pepe",
        clientName: String = "Julieta Fernández",
        quantity: Int = 2,
    ) =
        mockMvc.post("/orders") {
            contentType = MediaType.APPLICATION_JSON
            content = """
                {
                  "userName": "$userName",
                  "clientName": "$clientName",
                  "address": "Av. Siempre Viva 742",
                  "destination": "Palermo, CABA",
                  "product": {
                    "id": 1,
                    "name": "Essence Mascara",
                    "price": 9.99,
                    "thumbnail": "https://cdn.dummyjson.com/mascara.webp",
                    "quantity": $quantity
                  }
                }
            """.trimIndent()
        }

    private fun postOrderWithoutProduct() =
        mockMvc.post("/orders") {
            contentType = MediaType.APPLICATION_JSON
            content = """
                {
                  "userName": "Pepe",
                  "clientName": "Julieta Fernández",
                  "address": "Av. Siempre Viva 742",
                  "destination": "Palermo, CABA"
                }
            """.trimIndent()
        }

    private fun createShipment(trackingNumber: String, clientName: String = "Julieta Fernández") =
        mockMvc.post("/shipments") {
            contentType = MediaType.APPLICATION_JSON
            content = """
                {
                  "trackingNumber": "$trackingNumber",
                  "clientName": "$clientName",
                  "address": "Av. Siempre Viva 742",
                  "destination": "Palermo, CABA",
                  "product": "Essence Mascara",
                  "carrierId": 1,
                  "estimatedDate": "${LocalDate.now().plusDays(3)}"
                }
            """.trimIndent()
        }

    @Test
    fun `da de alta un pedido con numero de seguimiento generado y queda pendiente`() {
        postOrder()
            .andExpect {
                status { isCreated() }
                header { string("Location", "/orders/AR-100266") }
                jsonPath("$.message") { value("Pedido AR-100266 creado") }
            }

        mockMvc.get("/orders/user/Pepe")
            .andExpect {
                jsonPath("$[0].trackingNumber") { value("AR-100266") }
                jsonPath("$[0].clientName") { value("Julieta Fernández") }
                jsonPath("$[0].address") { value("Av. Siempre Viva 742") }
                jsonPath("$[0].destination") { value("Palermo, CABA") }
                jsonPath("$[0].product.id") { value(1) }
                jsonPath("$[0].product.name") { value("Essence Mascara") }
                jsonPath("$[0].product.price") { value(9.99) }
                jsonPath("$[0].product.quantity") { value(2) }
                jsonPath("$[0].status") { value("Pendiente") }
            }

        mockMvc.get("/orders")
            .andExpect {
                jsonPath("$.length()") { value(7) }
                jsonPath("$[6].trackingNumber") { value("AR-100266") }
            }
    }

    @Test
    fun `no da de alta un pedido con datos invalidos`() {
        postOrder(clientName = "")
            .andExpect {
                status { isBadRequest() }
                jsonPath("$.data.clientName") { value("El cliente es obligatorio") }
            }
    }

    @Test
    fun `no da de alta un pedido sin el usuario que lo hizo`() {
        postOrder(userName = "")
            .andExpect {
                status { isBadRequest() }
                jsonPath("$.data.userName") { value("El usuario es obligatorio") }
            }
    }

    @Test
    fun `no da de alta un pedido sin producto`() {
        postOrderWithoutProduct()
            .andExpect {
                status { isBadRequest() }
                jsonPath("$.data.product") { value("El producto es obligatorio") }
            }
    }

    @Test
    fun `no da de alta un pedido con cantidad invalida`() {
        postOrder(quantity = 0)
            .andExpect {
                status { isBadRequest() }
                jsonPath("$.data['product.quantity']") { value("La cantidad debe ser mayor a cero") }
            }
    }

    @Test
    fun `devuelve solo los pedidos del usuario, pendientes`() {
        postOrder()
        postOrder(userName = "Otro Usuario")

        mockMvc.get("/orders/user/pepe")
            .andExpect {
                status { isOk() }
                jsonPath("$.length()") { value(1) }
                jsonPath("$[0].trackingNumber") { value("AR-100266") }
                jsonPath("$[0].userName") { value("Pepe") }
                jsonPath("$[0].clientName") { value("Julieta Fernández") }
                jsonPath("$[0].product.name") { value("Essence Mascara") }
                jsonPath("$[0].status") { value("Pendiente") }
                jsonPath("$[0].estimatedDate") { doesNotExist() }
            }
    }

    @Test
    fun `el pedido del usuario refleja el envio creado y entregado`() {
        postOrder()
        createShipment("AR-100266").andExpect { status { isCreated() } }

        mockMvc.get("/orders/user/Pepe")
            .andExpect {
                jsonPath("$[0].status") { value("En camino") }
                jsonPath("$[0].estimatedDate") { value(LocalDate.now().plusDays(3).toString()) }
            }

        mockMvc.patch("/shipments/AR-100266/deliver").andExpect { status { isNoContent() } }

        mockMvc.get("/orders/user/Pepe")
            .andExpect {
                jsonPath("$[0].status") { value("Entregado") }
                jsonPath("$[0].effectiveDate") { value(LocalDate.now().toString()) }
            }
    }

    @Test
    fun `el pedido sigue siendo del usuario aunque al crear el envio se cambie el cliente`() {
        postOrder()
        createShipment("AR-100266", clientName = "Marta Gómez").andExpect { status { isCreated() } }

        mockMvc.get("/orders/user/Pepe")
            .andExpect {
                jsonPath("$.length()") { value(1) }
                jsonPath("$[0].trackingNumber") { value("AR-100266") }
                jsonPath("$[0].userName") { value("Pepe") }
                jsonPath("$[0].clientName") { value("Marta Gómez") }
            }
    }

    @Test
    fun `un usuario sin pedidos recibe una lista vacia`() {
        mockMvc.get("/orders/user/Nadie")
            .andExpect {
                status { isOk() }
                jsonPath("$.length()") { value(0) }
            }
    }

    @Test
    fun `cancelar un pedido pendiente lo saca de la lista`() {
        mockMvc.delete("/orders/AR-100260")
            .andExpect { status { isNoContent() } }

        mockMvc.get("/orders")
            .andExpect {
                jsonPath("$.length()") { value(5) }
                jsonPath("$[0].trackingNumber") { value("AR-100261") }
            }
    }

    @Test
    fun `el numero de seguimiento de un pedido cancelado no se vuelve a usar`() {
        postOrder().andExpect { header { string("Location", "/orders/AR-100266") } }
        mockMvc.delete("/orders/AR-100266").andExpect { status { isNoContent() } }

        postOrder().andExpect { header { string("Location", "/orders/AR-100267") } }
    }

    @Test
    fun `no se puede cancelar un pedido que ya tiene envio`() {
        mockMvc.delete("/orders/AR-100234")
            .andExpect {
                status { isBadRequest() }
                jsonPath("$.message") { value("No se puede cancelar un pedido que ya tiene un envío") }
            }
    }

    @Test
    fun `cancelar un pedido inexistente responde 404`() {
        mockMvc.delete("/orders/AR-999999")
            .andExpect {
                status { isNotFound() }
                jsonPath("$.message") { value("La orden solicitada no existe") }
            }
    }
}
