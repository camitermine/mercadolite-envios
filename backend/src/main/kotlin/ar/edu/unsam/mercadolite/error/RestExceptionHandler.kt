package ar.edu.unsam.mercadolite.error

import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.HttpStatusCode
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.context.request.WebRequest
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler

// Todas las respuestas de error de la API tienen este formato
data class ApiErrorResponse(
    val code: Int,
    val data: Map<String, String> = emptyMap(),
    val message: String,
)

@RestControllerAdvice
class RestExceptionHandler : ResponseEntityExceptionHandler() {
    @ExceptionHandler(NotFoundException::class)
    fun handleNotFound(exception: NotFoundException): ResponseEntity<ApiErrorResponse> =
        response(HttpStatus.NOT_FOUND, exception.message, exception.data)

    @ExceptionHandler(BusinessException::class)
    fun handleBusinessError(exception: BusinessException): ResponseEntity<ApiErrorResponse> =
        response(HttpStatus.BAD_REQUEST, exception.message, exception.data)

    @ExceptionHandler(ConflictException::class)
    fun handleConflict(exception: ConflictException): ResponseEntity<ApiErrorResponse> =
        response(HttpStatus.CONFLICT, exception.message, exception.data)

    // El detalle queda en el log: al cliente nunca se le exponen datos internos
    @ExceptionHandler(Exception::class)
    fun handleUnexpected(exception: Exception): ResponseEntity<ApiErrorResponse> {
        logger.error("Error inesperado", exception)
        return response(HttpStatus.INTERNAL_SERVER_ERROR, UNEXPECTED_ERROR)
    }

    override fun handleMethodArgumentNotValid(
        ex: MethodArgumentNotValidException,
        headers: HttpHeaders,
        status: HttpStatusCode,
        request: WebRequest,
    ): ResponseEntity<Any>? {
        val errors = ex.bindingResult.fieldErrors.associate { error ->
            error.field to (error.defaultMessage ?: "Valor inválido")
        }
        return handleExceptionInternal(
            ex,
            errorResponse(status, "Hay datos inválidos", errors),
            headers,
            status,
            request,
        )
    }

    // Spring pasa por acá sus propios errores: JSON mal formado, parámetro inválido, ruta inexistente, etc.
    override fun handleExceptionInternal(
        ex: Exception,
        body: Any?,
        headers: HttpHeaders,
        statusCode: HttpStatusCode,
        request: WebRequest,
    ): ResponseEntity<Any>? =
        super.handleExceptionInternal(
            ex,
            body as? ApiErrorResponse ?: errorResponse(statusCode, messageFor(statusCode)),
            headers,
            statusCode,
            request,
        )

    private fun messageFor(status: HttpStatusCode): String =
        when {
            status.isSameCodeAs(HttpStatus.NOT_FOUND) -> "El recurso solicitado no existe"
            status.isSameCodeAs(HttpStatus.METHOD_NOT_ALLOWED) -> "La operación no está permitida"
            status.is4xxClientError -> "La solicitud es inválida"
            else -> UNEXPECTED_ERROR
        }

    private fun response(
        status: HttpStatus,
        message: String?,
        data: Map<String, String> = emptyMap(),
    ): ResponseEntity<ApiErrorResponse> =
        ResponseEntity.status(status).body(errorResponse(status, message ?: UNEXPECTED_ERROR, data))

    private fun errorResponse(
        status: HttpStatusCode,
        message: String,
        data: Map<String, String> = emptyMap(),
    ) = ApiErrorResponse(status.value(), data, message)

    private companion object {
        const val UNEXPECTED_ERROR = "Ocurrió un error inesperado"
    }
}
