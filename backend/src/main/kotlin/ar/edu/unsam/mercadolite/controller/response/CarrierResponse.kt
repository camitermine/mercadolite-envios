package ar.edu.unsam.mercadolite.controller.response

import ar.edu.unsam.mercadolite.domain.Carrier

data class CarrierResponse(
    val id: Long,
    val name: String,
    val phone: String,
    val coverage: String,
    val status: String,
    val shipmentCount: Int,
) {
    constructor(carrier: Carrier) : this(
        id = carrier.id,
        name = carrier.name,
        phone = carrier.phone,
        coverage = carrier.coverage,
        status = carrier.status.description,
        shipmentCount = carrier.shipmentCount,
    )
}
