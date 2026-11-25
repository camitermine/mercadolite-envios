package ar.edu.unsam.mercadolite.controller.request

import ar.edu.unsam.mercadolite.domain.Product
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.PositiveOrZero
import jakarta.validation.constraints.Size

data class OrderRequest(
    @field:NotBlank(message = "El usuario es obligatorio")
    @field:Size(max = 80, message = "El usuario no puede superar los 80 caracteres")
    val userName: String,

    @field:NotBlank(message = ShipmentValidationMessages.CLIENT_REQUIRED)
    @field:Size(max = 80, message = ShipmentValidationMessages.CLIENT_TOO_LONG)
    val clientName: String,

    @field:NotBlank(message = ShipmentValidationMessages.ADDRESS_REQUIRED)
    @field:Size(max = 120, message = ShipmentValidationMessages.ADDRESS_TOO_LONG)
    val address: String,

    @field:NotBlank(message = ShipmentValidationMessages.DESTINATION_REQUIRED)
    @field:Size(max = 120, message = ShipmentValidationMessages.DESTINATION_TOO_LONG)
    val destination: String,

    @field:NotNull(message = ShipmentValidationMessages.PRODUCT_REQUIRED)
    @field:Valid
    val product: ProductRequest?,
)

data class ProductRequest(
    @field:NotNull(message = "El identificador del producto es obligatorio")
    @field:Positive(message = "El identificador del producto es inválido")
    val id: Long?,

    @field:NotBlank(message = ShipmentValidationMessages.PRODUCT_REQUIRED)
    @field:Size(max = 120, message = ShipmentValidationMessages.PRODUCT_TOO_LONG)
    val name: String,

    @field:NotNull(message = "El precio del producto es obligatorio")
    @field:PositiveOrZero(message = "El precio del producto no puede ser negativo")
    val price: Double?,

    val thumbnail: String = "",

    @field:NotNull(message = "La cantidad es obligatoria")
    @field:Positive(message = "La cantidad debe ser mayor a cero")
    val quantity: Int?,
) {
    fun toProduct() =
        Product(
            id = id!!,
            name = name.trim(),
            price = price!!,
            thumbnail = thumbnail.trim(),
            quantity = quantity!!,
        )
}
