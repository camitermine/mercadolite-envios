package ar.edu.unsam.mercadolite.domain

import ar.edu.unsam.mercadolite.error.BusinessException
import ar.edu.unsam.mercadolite.error.ConflictException
import java.time.LocalDate

class Order(
    val trackingNumber: String,
    var clientName: String,
    var address: String,
    var destination: String,
    var product: Product,
    val createdAt: LocalDate = LocalDate.now(),
    val userName: String = clientName,
) {
    var shipment: Shipment? = null
        private set

    var cancelled = false
        private set

    fun isPending() = shipment == null

    // assignShipment y cancel comparten el lock de la orden: si llegan a la vez
    // (crear el envío y cancelar el pedido), una espera a la otra y la segunda falla
    @Synchronized
    fun assignShipment(shipment: Shipment) {
        if (cancelled) {
            throw ConflictException("La orden fue cancelada")
        }
        if (!isPending()) {
            throw ConflictException("La orden ya tiene un envío")
        }
        this.shipment = shipment
    }

    @Synchronized
    fun cancel() {
        validateDeletable()
        cancelled = true
    }

    fun updateDetails(details: ShipmentDetails) {
        clientName = details.clientName
        address = details.address
        destination = details.destination
        product = product.copy(name = details.product)
    }

    private fun validateDeletable() {
        if (!isPending()) {
            throw BusinessException("No se puede cancelar un pedido que ya tiene un envío")
        }
    }
}
