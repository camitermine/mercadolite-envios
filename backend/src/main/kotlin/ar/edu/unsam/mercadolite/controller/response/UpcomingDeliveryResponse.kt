package ar.edu.unsam.mercadolite.controller.response

import ar.edu.unsam.mercadolite.domain.Shipment
import com.fasterxml.jackson.annotation.JsonFormat
import java.time.LocalDate

data class UpcomingDeliveryResponse(
    val trackingNumber: String,
    val clientName: String,
    val destination: String,
    @JsonFormat(pattern = "dd/MM")
    val estimatedDate: LocalDate,
) {
    constructor(shipment: Shipment) : this(
        trackingNumber = shipment.trackingNumber,
        clientName = shipment.order.clientName,
        destination = shipment.order.destination,
        estimatedDate = shipment.estimatedDate,
    )
}
