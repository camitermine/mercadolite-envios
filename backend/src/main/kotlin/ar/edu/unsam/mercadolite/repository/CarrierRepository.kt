package ar.edu.unsam.mercadolite.repository

import ar.edu.unsam.mercadolite.domain.Carrier
import ar.edu.unsam.mercadolite.domain.CarrierStatuses
import ar.edu.unsam.mercadolite.error.NotFoundException
import org.springframework.stereotype.Repository

@Repository
class CarrierRepository {
    private var carriers = initialCarriers()

    fun findAll(): List<Carrier> = carriers.toList()

    fun findById(id: Long): Carrier =
        carriers.find { it.id == id }
            ?: throw carrierNotFound()

    @Synchronized
    fun create(
        name: String,
        phone: String,
        coverage: String,
        status: CarrierStatuses,
    ): Carrier {
        val carrier = Carrier(nextId(), name, phone, coverage, status)
        carriers.add(carrier)
        return carrier
    }

    @Synchronized
    fun delete(carrier: Carrier) {
        carriers.remove(carrier)
    }

    fun reset() {
        carriers = initialCarriers()
    }

    private fun carrierNotFound() = NotFoundException("El transportista solicitado no existe")

    private fun nextId(): Long = (carriers.maxOfOrNull { it.id } ?: 0) + 1

    private fun initialCarriers() =
        mutableListOf(
            Carrier(1, "Andreani", "0810-122-1112", "Nacional", CarrierStatuses.ACTIVE),
            Carrier(2, "OCA", "0810-999-6222", "Nacional", CarrierStatuses.ACTIVE),
            Carrier(3, "Correo Argentino", "0800-267-7267", "Nacional", CarrierStatuses.ACTIVE),
            Carrier(4, "Urbano", "011-4000-1000", "AMBA y Litoral", CarrierStatuses.ACTIVE),
            Carrier(5, "Cruz del Sur", "0810-222-2789", "Patagonia", CarrierStatuses.INACTIVE),
        )
}
