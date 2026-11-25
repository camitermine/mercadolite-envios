package ar.edu.unsam.mercadolite.controller.response

import ar.edu.unsam.mercadolite.domain.Order

data class OrderResponse(
    val trackingNumber: String,
    val clientName: String,
    val address: String,
    val destination: String,
    val product: String,
) {
    constructor(order: Order) : this(
        trackingNumber = order.trackingNumber,
        clientName = order.clientName,
        address = order.address,
        destination = order.destination,
        product = order.product.name,
    )
}
