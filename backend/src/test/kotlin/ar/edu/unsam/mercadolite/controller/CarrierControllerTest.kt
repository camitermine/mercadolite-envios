package ar.edu.unsam.mercadolite.controller

import ar.edu.unsam.mercadolite.repository.ShipmentRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.header
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@SpringBootTest
@AutoConfigureMockMvc
class CarrierControllerTest {
    @Autowired
    lateinit var mockMvc: MockMvc

    @Autowired
    lateinit var shipmentRepository: ShipmentRepository

    @BeforeEach
    fun resetRepository() {
        shipmentRepository.reset()
    }

    @Test
    fun `lists the initial carriers`() {
        mockMvc.perform(get("/carriers"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(5))
            .andExpect(jsonPath("$[0].name").value("Andreani"))
    }

    @Test
    fun `creates and deletes a carrier`() {
        mockMvc.perform(
            post("/carriers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "name": "Transporte Federal",
                      "phone": "011-4444-5555",
                      "coverage": "Nacional",
                      "status": "Activo"
                    }
                    """.trimIndent(),
                ),
        )
            .andExpect(status().isCreated)
            .andExpect(header().string("Location", "/carriers/6"))
            .andExpect(jsonPath("$.message").value("Transportista 6 creado"))

        mockMvc.perform(get("/carriers/6"))
            .andExpect(jsonPath("$.name").value("Transporte Federal"))

        mockMvc.perform(delete("/carriers/6"))
            .andExpect(status().isNoContent)
    }

    @Test
    fun `returns validation errors for invalid data`() {
        mockMvc.perform(
            post("/carriers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "name": "",
                      "phone": "abc",
                      "coverage": "",
                      "status": "Activo"
                    }
                    """.trimIndent(),
                ),
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.data.name").exists())
            .andExpect(jsonPath("$.data.phone").exists())
    }

    @Test
    fun `rejects a carrier with an invalid status`() {
        mockMvc.perform(
            post("/carriers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "name": "Transporte Federal",
                      "phone": "011-4444-5555",
                      "coverage": "Nacional",
                      "status": "Suspendido"
                    }
                    """.trimIndent(),
                ),
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.message").value("El estado del transportista es inválido"))
    }

    @Test
    fun `returns not found for a missing carrier`() {
        mockMvc.perform(get("/carriers/999"))
            .andExpect(status().isNotFound)
            .andExpect(jsonPath("$.message").value("El transportista solicitado no existe"))
    }

    @Test
    fun `updates a carrier`() {
        mockMvc.perform(
            put("/carriers/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "name": "Andreani actualizado",
                      "phone": "0810-122-1112",
                      "coverage": "Nacional",
                      "status": "Inactivo"
                    }
                    """.trimIndent(),
                ),
        )
            .andExpect(status().isNoContent)
            .andExpect(content().string(""))

        mockMvc.perform(get("/carriers/1"))
            .andExpect(jsonPath("$.name").value("Andreani actualizado"))
            .andExpect(jsonPath("$.status").value("Inactivo"))
    }

    @Test
    fun `does not delete a carrier assigned to a shipment`() {
        mockMvc.perform(delete("/carriers/1"))
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.message").value("No se puede eliminar un transportista asociado a un envío"))
    }
}
