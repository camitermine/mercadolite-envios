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
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.put
import java.time.LocalDate

@SpringBootTest
@AutoConfigureMockMvc
class CarrierShipmentCountTest(
    @Autowired private val mockMvc: MockMvc,
    @Autowired private val shipmentRepository: ShipmentRepository,
) {
    private val tomorrow = LocalDate.now().plusDays(1)

    @BeforeEach
    fun resetRepositories() {
        shipmentRepository.reset()
    }

    private fun shipmentBody(carrierId: Long, trackingNumber: String? = null) = """
        {
          ${trackingNumber?.let { "\"trackingNumber\": \"$it\"," } ?: ""}
          "clientName": "Florencia",
          "address": "Av. Centenario 1250",
          "destination": "San Isidro",
          "product": "Zapatillas",
          "carrierId": $carrierId,
          "estimatedDate": "$tomorrow"
        }
    """.trimIndent()

    private fun expectShipmentCount(carrierId: Long, count: Int) {
        mockMvc.get("/carriers/$carrierId")
            .andExpect {
                status { isOk() }
                jsonPath("$.shipmentCount") { value(count) }
            }
    }

    @Test
    fun `cada transportista informa cuantos envios tiene`() {
        mockMvc.get("/carriers")
            .andExpect {
                status { isOk() }
                jsonPath("$[0].shipmentCount") { value(2) }
                jsonPath("$[4].shipmentCount") { value(0) }
            }
    }

    @Test
    fun `crear un envio suma uno al transportista`() {
        mockMvc.post("/shipments") {
            contentType = MediaType.APPLICATION_JSON
            content = shipmentBody(carrierId = 3, trackingNumber = "AR-100262")
        }.andExpect { status { isCreated() } }

        expectShipmentCount(3, 2)
    }

    @Test
    fun `reasignar un envio lo mueve de un transportista a otro`() {
        mockMvc.put("/shipments/AR-100234") {
            contentType = MediaType.APPLICATION_JSON
            content = shipmentBody(carrierId = 2)
        }.andExpect { status { isNoContent() } }

        expectShipmentCount(1, 1)
        expectShipmentCount(2, 2)
    }

    @Test
    fun `editar un transportista conserva sus envios`() {
        mockMvc.put("/carriers/1") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"name": "Andreani SA", "phone": "0810-122-1112", "coverage": "Nacional", "status": "Activo"}"""
        }.andExpect { status { isNoContent() } }

        expectShipmentCount(1, 2)

        mockMvc.delete("/carriers/1")
            .andExpect {
                status { isBadRequest() }
                jsonPath("$.code") { value(400) }
                jsonPath("$.data.carrierId") { value("1") }
                jsonPath("$.message") { value("No se puede eliminar un transportista asociado a un envío") }
            }
    }

    @Test
    fun `un transportista que se queda sin envios se puede eliminar`() {
        mockMvc.put("/shipments/AR-100236") {
            contentType = MediaType.APPLICATION_JSON
            content = shipmentBody(carrierId = 2)
        }.andExpect { status { isNoContent() } }

        mockMvc.delete("/carriers/3")
            .andExpect { status { isNoContent() } }
    }
}
