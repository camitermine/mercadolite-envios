package ar.edu.unsam.mercadolite.controller.request

import ar.edu.unsam.mercadolite.domain.ShipmentDetails
import jakarta.validation.constraints.Future
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.time.LocalDate

interface OnCreate

data class ShipmentRequest(
    @field:NotBlank(message = "El número de seguimiento es obligatorio", groups = [OnCreate::class])
    val trackingNumber: String? = null,

    @field:NotBlank(message = ShipmentValidationMessages.CLIENT_REQUIRED)
    @field:Size(max = 80, message = ShipmentValidationMessages.CLIENT_TOO_LONG)
    val clientName: String,

    @field:NotBlank(message = ShipmentValidationMessages.ADDRESS_REQUIRED)
    @field:Size(max = 120, message = ShipmentValidationMessages.ADDRESS_TOO_LONG)
    val address: String,

    @field:NotBlank(message = ShipmentValidationMessages.DESTINATION_REQUIRED)
    @field:Size(max = 120, message = ShipmentValidationMessages.DESTINATION_TOO_LONG)
    val destination: String,

    @field:NotBlank(message = ShipmentValidationMessages.PRODUCT_REQUIRED)
    @field:Size(max = 120, message = ShipmentValidationMessages.PRODUCT_TOO_LONG)
    val product: String,

    @field:NotNull(message = ShipmentValidationMessages.CARRIER_REQUIRED)
    val carrierId: Long?,

    @field:NotNull(message = ShipmentValidationMessages.DATE_REQUIRED)
    @field:Future(message = "La fecha estimada de entrega debe ser futura", groups = [OnCreate::class])
    val estimatedDate: LocalDate?,
) {
    fun toDetails() =
        ShipmentDetails(
            clientName = clientName.trim(),
            address = address.trim(),
            destination = destination.trim(),
            product = product.trim(),
            carrierId = carrierId!!,
            estimatedDate = estimatedDate!!,
        )
}
