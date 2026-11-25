package ar.edu.unsam.mercadolite.controller.response

import ar.edu.unsam.mercadolite.domain.Shipment

data class DelayedShipmentResponse(
    val trackingNumber: String,
    val clientName: String,
    val delayDays: Int,
) {
    constructor(shipment: Shipment) : this(
        trackingNumber = shipment.trackingNumber,
        clientName = shipment.order.clientName,
        delayDays = shipment.delayDays(),
    )
}
