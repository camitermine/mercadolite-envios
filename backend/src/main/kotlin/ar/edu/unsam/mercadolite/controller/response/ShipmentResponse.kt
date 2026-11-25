package ar.edu.unsam.mercadolite.controller.response

import ar.edu.unsam.mercadolite.domain.Shipment
import java.time.LocalDate

data class ShipmentResponse(
    val id: Long,
    val trackingNumber: String,
    val clientName: String,
    val address: String,
    val destination: String,
    val product: String,
    val carrierId: Long,
    val carrier: String,
    val estimatedDate: LocalDate,
    val effectiveDate: LocalDate?,
    val status: String,
) {
    constructor(shipment: Shipment) : this(
        id = shipment.id,
        trackingNumber = shipment.trackingNumber,
        clientName = shipment.order.clientName,
        address = shipment.order.address,
        destination = shipment.order.destination,
        product = shipment.order.product.name,
        carrierId = shipment.carrier.id,
        carrier = shipment.carrier.name,
        estimatedDate = shipment.estimatedDate,
        effectiveDate = shipment.effectiveDate,
        status = shipment.status.description,
    )
}
