
package ar.edu.unsam.mercadolite.domain

import ar.edu.unsam.mercadolite.error.BusinessException
import java.time.LocalDate
import java.time.temporal.ChronoUnit

enum class ShipmentStatuses(val description: String) {
    IN_TRANSIT("En camino"),
    DELAYED("Demorado"),
    DELIVERED("Entregado"),
    ;

    companion object {
        fun fromDescription(description: String): ShipmentStatuses =
            entries.find { it.description == description }
                ?: throw BusinessException("El estado \"$description\" no existe")
    }
}

data class ShipmentDetails(
    val clientName: String,
    val address: String,
    val destination: String,
    val product: String,
    val carrierId: Long,
    val estimatedDate: LocalDate,
)

class Shipment(
    val order: Order,
    carrier: Carrier,
    estimatedDate: LocalDate,
    effectiveDate: LocalDate? = null,
) {
    var id: Long = 0
        private set

    var carrier = carrier
        private set

    var estimatedDate = estimatedDate
        private set

    var effectiveDate = effectiveDate
        private set

    val trackingNumber: String
        get() = order.trackingNumber

    val status: ShipmentStatuses
        get() = when {
            effectiveDate != null -> ShipmentStatuses.DELIVERED
            isOverdue(LocalDate.now()) -> ShipmentStatuses.DELAYED
            else -> ShipmentStatuses.IN_TRANSIT
        }

    init {
        carrier.validateAssignable()
        carrier.addShipment(this)
        // Si la orden ya no admite envío, se deshace el enlace con el transportista
        // para que nada quede a medias
        try {
            order.assignShipment(this)
        } catch (error: RuntimeException) {
            carrier.removeShipment(this)
            throw error
        }
    }

    fun assignId(id: Long) {
        this.id = id
    }

    @Synchronized
    fun update(details: ShipmentDetails, carrier: Carrier, today: LocalDate = LocalDate.now()) {
        if (effectiveDate != null) {
            throw BusinessException("No se puede editar un envío entregado")
        }
        if (carrier != this.carrier) {
            carrier.validateAssignable()
        }
        if (details.estimatedDate != estimatedDate && !details.estimatedDate.isAfter(today)) {
            throw BusinessException("La fecha estimada de entrega debe ser futura")
        }
        // Primero el transportista: si fue eliminado, falla antes de tocar la orden
        changeCarrier(carrier)
        order.updateDetails(details)
        estimatedDate = details.estimatedDate
    }

    @Synchronized
    fun deliver(today: LocalDate = LocalDate.now()) {
        if (effectiveDate != null) {
            throw BusinessException("El envío ya fue entregado")
        }
        effectiveDate = today
    }

    fun isDeliveredOn(date: LocalDate) = effectiveDate == date

    fun delayDays(today: LocalDate = LocalDate.now()): Int =
        if (estimatedDate.isBefore(today)) ChronoUnit.DAYS.between(estimatedDate, today).toInt() else 0

    private fun changeCarrier(carrier: Carrier) {
        if (carrier == this.carrier) return
        carrier.addShipment(this)
        this.carrier.removeShipment(this)
        this.carrier = carrier
    }

    private fun isOverdue(today: LocalDate) = estimatedDate.isBefore(today)
}
