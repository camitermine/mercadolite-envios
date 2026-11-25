package ar.edu.unsam.mercadolite.controller

import ar.edu.unsam.mercadolite.repository.ShipmentRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.patch
import org.springframework.test.web.servlet.post
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@SpringBootTest
@AutoConfigureMockMvc
class DashboardControllerTests(
    @Autowired private val mockMvc: MockMvc,
    @Autowired private val shipmentRepository: ShipmentRepository,
) {
    private val dayMonthFormatter = DateTimeFormatter.ofPattern("dd/MM")

    @BeforeEach
    fun resetRepositories() {
        shipmentRepository.reset()
    }

    private fun createInTransitShipment(
        trackingNumber: String,
        estimatedDate: LocalDate,
    ) {
        mockMvc.post("/shipments") {
            contentType = MediaType.APPLICATION_JSON
            content = """
                {
                  "trackingNumber": "$trackingNumber",
                  "clientName": "Cliente $trackingNumber",
                  "address": "Av. Centenario 1250",
                  "destination": "San Isidro, Buenos Aires",
                  "product": "Zapatillas running",
                  "carrierId": 1,
                  "estimatedDate": "$estimatedDate"
                }
            """.trimIndent()
        }.andExpect { status { isCreated() } }
    }

    @Test
    fun `devuelve los indicadores calculados a partir de las ordenes y los envios`() {
        mockMvc.get("/dashboard/stats")
            .andExpect {
                status { isOk() }
                jsonPath("$.preparing") { value(6) }
                jsonPath("$.inTransit") { value(2) }
                jsonPath("$.deliveredToday") { value(1) }
                jsonPath("$.delayed") { value(1) }
            }
    }

    @Test
    fun `entregar un envio en camino actualiza los indicadores`() {
        mockMvc.patch("/shipments/AR-100234/deliver")

        mockMvc.get("/dashboard/stats")
            .andExpect {
                status { isOk() }
                jsonPath("$.inTransit") { value(1) }
                jsonPath("$.deliveredToday") { value(2) }
            }
    }

    @Test
    fun `devuelve la primera pagina de envios demorados con sus dias de demora`() {
        mockMvc.get("/dashboard/delayed-shipments")
            .andExpect {
                status { isOk() }
                jsonPath("$.content.length()") { value(1) }
                jsonPath("$.content[0].trackingNumber") { value("AR-100235") }
                jsonPath("$.content[0].clientName") { value("Martín González") }
                jsonPath("$.content[0].delayDays") { value(2) }
                jsonPath("$.page") { value(0) }
                jsonPath("$.size") { value(4) }
                jsonPath("$.totalElements") { value(1) }
                jsonPath("$.totalPages") { value(1) }
            }
    }

    @Test
    fun `devuelve la primera pagina de proximas entregas ordenadas por fecha en formato dia y mes`() {
        mockMvc.get("/dashboard/upcoming-deliveries")
            .andExpect {
                status { isOk() }
                jsonPath("$.content.length()") { value(2) }
                jsonPath("$.content[0].trackingNumber") { value("AR-100234") }
                jsonPath("$.content[0].clientName") { value("Lucía Fernández") }
                jsonPath("$.content[0].destination") { value("Recoleta, CABA") }
                jsonPath("$.content[0].estimatedDate") { value(LocalDate.now().plusDays(3).format(dayMonthFormatter)) }
                jsonPath("$.content[1].trackingNumber") { value("AR-100236") }
                jsonPath("$.totalElements") { value(2) }
                jsonPath("$.totalPages") { value(1) }
            }
    }

    @Test
    fun `devuelve como maximo cuatro proximas entregas por pagina`() {
        val today = LocalDate.now()
        createInTransitShipment("AR-100260", today.plusDays(6))
        createInTransitShipment("AR-100261", today.plusDays(7))
        createInTransitShipment("AR-100262", today.plusDays(8))

        mockMvc.get("/dashboard/upcoming-deliveries?page=0")
            .andExpect {
                status { isOk() }
                jsonPath("$.content.length()") { value(4) }
                jsonPath("$.content[0].trackingNumber") { value("AR-100234") }
                jsonPath("$.content[3].trackingNumber") { value("AR-100261") }
                jsonPath("$.totalElements") { value(5) }
                jsonPath("$.totalPages") { value(2) }
            }

        mockMvc.get("/dashboard/upcoming-deliveries?page=1")
            .andExpect {
                status { isOk() }
                jsonPath("$.content.length()") { value(1) }
                jsonPath("$.content[0].trackingNumber") { value("AR-100262") }
                jsonPath("$.page") { value(1) }
            }
    }

    @Test
    fun `devuelve una pagina vacia cuando la pagina pedida no existe`() {
        mockMvc.get("/dashboard/delayed-shipments?page=5")
            .andExpect {
                status { isOk() }
                jsonPath("$.content.length()") { value(0) }
                jsonPath("$.page") { value(5) }
                jsonPath("$.totalPages") { value(1) }
            }
    }

    @Test
    fun `rechaza una pagina negativa`() {
        mockMvc.get("/dashboard/upcoming-deliveries?page=-1")
            .andExpect {
                status { isBadRequest() }
                jsonPath("$.code") { value(400) }
            }
    }
}
