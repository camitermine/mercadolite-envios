package ar.edu.unsam.mercadolite.controller.request

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

data class CarrierRequest(
    @field:NotBlank(message = "El nombre es obligatorio")
    @field:Size(min = 2, max = 80, message = "El nombre debe tener entre 2 y 80 caracteres")
    val name: String,

    @field:NotBlank(message = "El teléfono es obligatorio")
    @field:Pattern(
        regexp = "^(?=(?:\\D*\\d){6,15}\\D*$)[+()\\d\\s-]+$",
        message = "El teléfono tiene un formato inválido",
    )
    @field:Size(max = 30, message = "El teléfono no puede superar los 30 caracteres")
    val phone: String,

    @field:NotBlank(message = "La cobertura es obligatoria")
    @field:Size(max = 120, message = "La cobertura no puede superar los 120 caracteres")
    val coverage: String,

    @field:NotBlank(message = "El estado es obligatorio")
    val status: String,
)
