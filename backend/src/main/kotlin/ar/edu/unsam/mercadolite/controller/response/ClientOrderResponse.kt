package ar.edu.unsam.mercadolite.controller.response

import ar.edu.unsam.mercadolite.domain.Order
import ar.edu.unsam.mercadolite.domain.Product
import java.time.LocalDate

data class ProductResponse(
    val id: Long,
    val name: String,
    val price: Double,
    val thumbnail: String,
    val quantity: Int,
) {
    constructor(product: Product) : this(
        id = product.id,
        name = product.name,
        price = product.price,
        thumbnail = product.thumbnail,
        quantity = product.quantity,
    )
}

data class ClientOrderResponse(
    val trackingNumber: String,
    val userName: String,
    val clientName: String,
    val address: String,
    val destination: String,
    val product: ProductResponse,
    val createdAt: LocalDate,
    val status: String,
    val estimatedDate: LocalDate?,
    val effectiveDate: LocalDate?,
) {
    constructor(order: Order) : this(
        trackingNumber = order.trackingNumber,
        userName = order.userName,
        clientName = order.clientName,
        address = order.address,
        destination = order.destination,
        product = ProductResponse(order.product),
        createdAt = order.createdAt,
        status = order.shipment?.status?.description ?: PENDING_STATUS,
        estimatedDate = order.shipment?.estimatedDate,
        effectiveDate = order.shipment?.effectiveDate,
    )

    private companion object {
        const val PENDING_STATUS = "Pendiente"
    }
}
