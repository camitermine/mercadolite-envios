package ar.edu.unsam.mercadolite.controller

import ar.edu.unsam.mercadolite.domain.CarrierStatuses
import ar.edu.unsam.mercadolite.repository.CarrierRepository
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
import org.springframework.test.web.servlet.put
import java.time.LocalDate

@SpringBootTest
@AutoConfigureMockMvc
class ShipmentControllerTests(
    @Autowired private val mockMvc: MockMvc,
    @Autowired private val shipmentRepository: ShipmentRepository,
    @Autowired private val carrierRepository: CarrierRepository,
) {

    private val tomorrow = LocalDate.now().plusDays(1)

    @BeforeEach
    fun resetRepositories() {
        shipmentRepository.reset()
    }

    private fun shipmentJson(
        trackingNumber: String = "AR-100262",
        clientName: String = "Florencia Ibáñez",
        carrierId: Long = 1,
        estimatedDate: LocalDate = tomorrow,
    ) = """
        {
          "trackingNumber": "$trackingNumber",
          "clientName": "$clientName",
          "address": "Av. Centenario 1250",
          "destination": "San Isidro, Buenos Aires",
          "product": "Zapatillas running",
          "carrierId": $carrierId,
          "estimatedDate": "$estimatedDate"
        }
    """.trimIndent()

    private fun updateJson(
        clientName: String = "Lucía Fernández",
        carrierId: Long = 2,
        estimatedDate: LocalDate = tomorrow,
    ) = """
        {
          "clientName": "$clientName",
          "address": "Av. Corrientes 1500",
          "destination": "Balvanera, CABA",
          "product": "Notebook Lenovo",
          "carrierId": $carrierId,
          "estimatedDate": "$estimatedDate"
        }
    """.trimIndent()

    private fun postShipment(body: String) =
        mockMvc.post("/shipments") {
            contentType = MediaType.APPLICATION_JSON
            content = body
        }

    private fun updateShipment(
        trackingNumber: String,
        body: String,
    ) = mockMvc.put("/shipments/$trackingNumber") {
        contentType = MediaType.APPLICATION_JSON
        content = body
    }

    @Test
    fun `crea el envio y la orden deja de estar pendiente`() {
        postShipment(shipmentJson())
            .andExpect {
                status { isCreated() }
                header { string("Location", "/shipments/AR-100262") }
                jsonPath("$.message") { value("Envío AR-100262 creado") }
            }

        mockMvc.get("/shipments/AR-100262")
            .andExpect {
                jsonPath("$.carrierId") { value(1) }
                jsonPath("$.status") { value("En camino") }
                jsonPath("$.effectiveDate") { value(null) }
            }

        mockMvc.get("/orders")
            .andExpect {
                jsonPath("$.length()") { value(5) }
            }

        mockMvc.get("/shipments")
            .andExpect {
                jsonPath("$.length()") { value(6) }
                jsonPath("$[?(@.trackingNumber == 'AR-100262')]") {
                    isNotEmpty()
                }
            }
    }

    @Test
    fun `los envios tienen id y uno nuevo toma el siguiente`() {
        mockMvc.get("/shipments")
            .andExpect {
                jsonPath("$[0].id") { value(1) }
                jsonPath("$[4].id") { value(5) }
            }

        postShipment(shipmentJson()).andExpect { status { isCreated() } }

        mockMvc.get("/shipments/AR-100262")
            .andExpect { jsonPath("$.id") { value(6) } }
    }

    @Test
    fun `devuelve un envio por su numero de seguimiento`() {
        mockMvc.get("/shipments/AR-100235")
            .andExpect {
                status { isOk() }
                jsonPath("$.id") { value(2) }
                jsonPath("$.trackingNumber") { value("AR-100235") }
                jsonPath("$.clientName") { value("Martín González") }
                jsonPath("$.carrierId") { value(2) }
                jsonPath("$.status") { value("Demorado") }
            }
    }

    @Test
    fun `pedir un envio inexistente responde 404`() {
        mockMvc.get("/shipments/AR-999999")
            .andExpect {
                status { isNotFound() }
                jsonPath("$.message") { value("No se encontró el envío") }
            }
    }

    @Test
    fun `no crea un envio sin numero de seguimiento`() {
        postShipment(updateJson())
            .andExpect {
                status { isBadRequest() }
                jsonPath("$.data.trackingNumber") {
                    value("El número de seguimiento es obligatorio")
                }
            }
    }

    @Test
    fun `al crear el envio la orden toma los datos editados en el formulario`() {
        postShipment(shipmentJson(clientName = "Otro Cliente"))
            .andExpect { status { isCreated() } }

        mockMvc.get("/shipments/AR-100262")
            .andExpect {
                jsonPath("$.clientName") { value("Otro Cliente") }
            }
    }

    @Test
    fun `un envio rechazado no modifica los datos de la orden`() {
        postShipment(shipmentJson(clientName = "Otro Cliente", carrierId = 5))
            .andExpect { status { isBadRequest() } }

        mockMvc.get("/orders")
            .andExpect {
                jsonPath("$[?(@.trackingNumber == 'AR-100262')].clientName") {
                    value("Florencia Ibáñez")
                }
            }
    }

    @Test
    fun `crear el envio de una orden que ya tiene uno responde 409`() {
        postShipment(
            shipmentJson(
                trackingNumber = "AR-100234",
                clientName = "Otro Cliente",
            )
        )
            .andExpect {
                status { isConflict() }
                jsonPath("$.code") { value(409) }
                jsonPath("$.message") { value("La orden ya tiene un envío") }
            }

        mockMvc.get("/shipments/AR-100234")
            .andExpect {
                jsonPath("$.clientName") { value("Lucía Fernández") }
            }
    }

    @Test
    fun `no crea un envio para una orden inexistente`() {
        postShipment(shipmentJson(trackingNumber = "AR-999999"))
            .andExpect {
                status { isNotFound() }
                jsonPath("$.message") {
                    value("La orden solicitada no existe")
                }
            }
    }

    @Test
    fun `no crea un envio con un transportista inactivo`() {
        postShipment(shipmentJson(carrierId = 5))
            .andExpect {
                status { isBadRequest() }
                jsonPath("$.message") {
                    value("El transportista seleccionado está inactivo")
                }
            }
    }

    @Test
    fun `valida los datos obligatorios y que la fecha sea futura`() {
        postShipment(
            shipmentJson(
                clientName = "",
                estimatedDate = LocalDate.now(),
            )
        )
            .andExpect {
                status { isBadRequest() }
                jsonPath("$.data.clientName") {
                    value("El cliente es obligatorio")
                }
                jsonPath("$.data.estimatedDate") {
                    value("La fecha estimada de entrega debe ser futura")
                }
            }
    }

    @Test
    fun `un envio vencido aparece demorado`() {
        mockMvc.get("/shipments")
            .andExpect {
                status { isOk() }
                jsonPath("$[?(@.trackingNumber == 'AR-100235')].status") {
                    value("Demorado")
                }
            }
    }

    @Test
    fun `entregar un envio guarda la fecha efectiva`() {
        mockMvc.patch("/shipments/AR-100234/deliver")
            .andExpect {
                status { isNoContent() }
                content { string("") }
            }

        mockMvc.get("/shipments/AR-100234")
            .andExpect {
                jsonPath("$.status") { value("Entregado") }
                jsonPath("$.effectiveDate") {
                    value(LocalDate.now().toString())
                }
            }
    }

    @Test
    fun `no permite entregar dos veces`() {
        mockMvc.patch("/shipments/AR-100237/deliver")
            .andExpect {
                status { isBadRequest() }
                jsonPath("$.message") {
                    value("El envío ya fue entregado")
                }
            }
    }

    @Test
    fun `edita los datos de un envio`() {
        updateShipment("AR-100234", updateJson())
            .andExpect {
                status { isNoContent() }
                content { string("") }
            }

        mockMvc.get("/shipments/AR-100234")
            .andExpect {
                jsonPath("$.clientName") { value("Lucía Fernández") }
                jsonPath("$.address") { value("Av. Corrientes 1500") }
                jsonPath("$.destination") { value("Balvanera, CABA") }
                jsonPath("$.carrierId") { value(2) }
            }
    }

    @Test
    fun `no permite editar un envio entregado`() {
        val original = shipmentRepository.findByTrackingNumber("AR-100237")!!
        val originalClientName = original.order.clientName
        val originalCarrierId = original.carrier.id
        val originalEstimatedDate = original.estimatedDate
        val originalEffectiveDate = original.effectiveDate

        updateShipment("AR-100237", updateJson())
            .andExpect {
                status { isBadRequest() }
                jsonPath("$.message") {
                    value("No se puede editar un envío entregado")
                }
            }

        mockMvc.get("/shipments/AR-100237")
            .andExpect {
                jsonPath("$.trackingNumber") {
                    value(original.trackingNumber)
                }
                jsonPath("$.clientName") {
                    value(originalClientName)
                }
                jsonPath("$.carrierId") {
                    value(originalCarrierId)
                }
                jsonPath("$.estimatedDate") {
                    value(originalEstimatedDate.toString())
                }
                jsonPath("$.effectiveDate") {
                    value(originalEffectiveDate.toString())
                }
                jsonPath("$.status") { value("Entregado") }
            }
    }

    @Test
    fun `editar conserva el transportista aunque este inactivo`() {
        carrierRepository.findById(2).status = CarrierStatuses.INACTIVE

        updateShipment("AR-100235", updateJson(carrierId = 2))
            .andExpect { status { isNoContent() } }

        mockMvc.get("/shipments/AR-100235")
            .andExpect {
                jsonPath("$.carrierId") { value(2) }
            }
    }

    @Test
    fun `editar no permite cambiar a un transportista inactivo`() {
        updateShipment("AR-100234", updateJson(carrierId = 5))
            .andExpect {
                status { isBadRequest() }
                jsonPath("$.message") {
                    value("El transportista seleccionado está inactivo")
                }
            }
    }

    @Test
    fun `editar un envio demorado permite conservar su fecha`() {
        val delayedDate =
            shipmentRepository.findByTrackingNumber("AR-100235")!!.estimatedDate

        updateShipment(
            "AR-100235",
            updateJson(estimatedDate = delayedDate),
        )
            .andExpect { status { isNoContent() } }

        mockMvc.get("/shipments/AR-100235")
            .andExpect {
                jsonPath("$.status") { value("Demorado") }
            }
    }

    @Test
    fun `editar no permite cambiar a una fecha que no sea futura`() {
        updateShipment(
            "AR-100234",
            updateJson(estimatedDate = LocalDate.now()),
        )
            .andExpect {
                status { isBadRequest() }
                jsonPath("$.message") {
                    value("La fecha estimada de entrega debe ser futura")
                }
            }
    }

    @Test
    fun `editar o entregar un envio inexistente responde 404`() {
        updateShipment("AR-999999", updateJson())
            .andExpect {
                status { isNotFound() }
                jsonPath("$.message") {
                    value("No se encontró el envío")
                }
            }

        mockMvc.patch("/shipments/AR-999999/deliver")
            .andExpect {
                status { isNotFound() }
                jsonPath("$.message") {
                    value("No se encontró el envío")
                }
            }
    }

    @Test
    fun `no permite editar un envio con datos invalidos`() {
        updateShipment(
            "AR-100234",
            updateJson(clientName = ""),
        )
            .andExpect {
                status { isBadRequest() }
                jsonPath("$.data.clientName") {
                    value("El cliente es obligatorio")
                }
            }
    }

    @Test
    fun `el listado incluye el nombre del transportista`() {
        val shipment =
            shipmentRepository.findByTrackingNumber("AR-100235")!!

        mockMvc.get("/shipments")
            .andExpect {
                status { isOk() }
                jsonPath("$[?(@.trackingNumber == 'AR-100235')].carrier") {
                    value(shipment.carrier.name)
                }
            }
    }

    @Test
    fun `filtra los envios demorados por estado`() {
        mockMvc.get("/shipments") {
            param("status", "Demorado")
        }.andExpect {
            status { isOk() }
            jsonPath("$[?(@.trackingNumber == 'AR-100235')]") {
                isNotEmpty()
            }
            jsonPath("$[?(@.status != 'Demorado')]") {
                isEmpty()
            }
        }
    }

    @Test
    fun `filtra los envios entregados por estado`() {
        mockMvc.get("/shipments") {
            param("status", "Entregado")
        }.andExpect {
            status { isOk() }
            jsonPath("$[?(@.trackingNumber == 'AR-100237')]") {
                isNotEmpty()
            }
            jsonPath("$[?(@.status != 'Entregado')]") {
                isEmpty()
            }
        }
    }

    @Test
    fun `devuelve los estados disponibles de los envios`() {
        mockMvc.get("/shipments/statuses")
            .andExpect {
                status { isOk() }
                jsonPath("$.length()") { value(3) }
                jsonPath("$[0]") { value("En camino") }
                jsonPath("$[1]") { value("Demorado") }
                jsonPath("$[2]") { value("Entregado") }
            }
    }

    @Test
    fun `filtrar por un estado que no existe responde 400`() {
        mockMvc.get("/shipments") {
            param("status", "Perdido")
        }.andExpect {
            status { isBadRequest() }
            jsonPath("$.code") { value(400) }
            jsonPath("$.message") { value("El estado \"Perdido\" no existe") }
        }
    }
}
