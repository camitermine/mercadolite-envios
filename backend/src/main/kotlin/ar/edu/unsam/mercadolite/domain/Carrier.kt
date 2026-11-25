package ar.edu.unsam.mercadolite.domain

import ar.edu.unsam.mercadolite.error.BusinessException
import ar.edu.unsam.mercadolite.error.ConflictException

enum class CarrierStatuses(val description: String) {
    ACTIVE("Activo"),
    INACTIVE("Inactivo");

    companion object {
        fun fromDescription(description: String): CarrierStatuses =
            entries.find { it.description == description }
                ?: throw BusinessException("El estado del transportista es inválido")
    }
}

class Carrier(
    val id: Long,
    var name: String,
    var phone: String,
    var coverage: String,
    var status: CarrierStatuses,
) {
    private val shipments = mutableListOf<Shipment>()

    val shipmentCount: Int
        get() = shipments.size

    var deleted = false
        private set

    fun hasShipments() = shipments.isNotEmpty()

    // addShipment y delete comparten el lock del transportista: si llegan a la vez
    // (crear un envío con él y eliminarlo), una espera a la otra y la segunda falla
    @Synchronized
    fun addShipment(shipment: Shipment) {
        if (deleted) {
            throw ConflictException("El transportista fue eliminado")
        }
        shipments.add(shipment)
    }

    @Synchronized
    fun removeShipment(shipment: Shipment) {
        shipments.remove(shipment)
    }

    @Synchronized
    fun delete() {
        validateDeletable()
        deleted = true
    }

    fun update(name: String, phone: String, coverage: String, status: CarrierStatuses) {
        this.name = name
        this.phone = phone
        this.coverage = coverage
        this.status = status
    }

    fun validateAssignable() {
        if (status != CarrierStatuses.ACTIVE) {
            throw BusinessException("El transportista seleccionado está inactivo")
        }
    }

    private fun validateDeletable() {
        if (hasShipments()) {
            throw BusinessException(
                "No se puede eliminar un transportista asociado a un envío",
                mapOf("carrierId" to id.toString()),
            )
        }
    }
}
