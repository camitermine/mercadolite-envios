package ar.edu.unsam.mercadolite.error

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import kotlin.test.assertEquals

@SpringBootTest
@AutoConfigureMockMvc
class RestExceptionHandlerTests(
    @Autowired private val mockMvc: MockMvc,
) {
    private fun postCarrier(body: String) =
        mockMvc.post("/carriers") {
            contentType = MediaType.APPLICATION_JSON
            content = body
        }

    @Test
    fun `un json mal formado responde 400 con el formato comun`() {
        postCarrier("{ no es json")
            .andExpect {
                status { isBadRequest() }
                jsonPath("$.code") { value(400) }
                jsonPath("$.data") { isMap() }
                jsonPath("$.message") { value("La solicitud es inválida") }
            }
    }

    @Test
    fun `un campo faltante responde 400 con el formato comun`() {
        postCarrier("""{ "name": "Andreani" }""")
            .andExpect {
                status { isBadRequest() }
                jsonPath("$.code") { value(400) }
                jsonPath("$.message") { value("La solicitud es inválida") }
            }
    }

    @Test
    fun `un parametro de tipo invalido responde 400 con el formato comun`() {
        mockMvc.get("/carriers/abc")
            .andExpect {
                status { isBadRequest() }
                jsonPath("$.code") { value(400) }
                jsonPath("$.message") { value("La solicitud es inválida") }
            }
    }

    @Test
    fun `una ruta inexistente responde 404 con el formato comun`() {
        mockMvc.get("/no-existe")
            .andExpect {
                status { isNotFound() }
                jsonPath("$.code") { value(404) }
                jsonPath("$.message") { value("El recurso solicitado no existe") }
            }
    }

    @Test
    fun `un metodo no soportado responde 405 con el formato comun`() {
        mockMvc.delete("/orders")
            .andExpect {
                status { isMethodNotAllowed() }
                jsonPath("$.code") { value(405) }
                jsonPath("$.message") { value("La operación no está permitida") }
            }
    }

    @Test
    fun `un error inesperado responde 500 sin exponer el detalle`() {
        val response = RestExceptionHandler().handleUnexpected(IllegalStateException("detalle interno"))

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.statusCode)
        assertEquals(500, response.body?.code)
        assertEquals(emptyMap(), response.body?.data)
        assertEquals("Ocurrió un error inesperado", response.body?.message)
    }
}
