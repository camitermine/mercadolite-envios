
package ar.edu.unsam.mercadolite.repository

import ar.edu.unsam.mercadolite.domain.Shipment
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
class ShipmentRepository(
    private val orderRepository: OrderRepository,
    private val carrierRepository: CarrierRepository,
) {
    private var shipments = mutableListOf<Shipment>()
    private var nextId = INITIAL_ID

    fun findAll(): List<Shipment> = shipments.toList()

    fun findByTrackingNumber(trackingNumber: String): Shipment? =
        shipments.find { it.trackingNumber == trackingNumber }

    @Synchronized
    fun create(shipment: Shipment): Shipment {
        shipment.assignId(nextId++)
        shipments.add(shipment)
        return shipment
    }

    // Las órdenes y los transportistas conocen sus envíos: se reinician todos juntos
    fun reset() {
        carrierRepository.reset()
        orderRepository.reset()
        shipments = sampleShipments()
        nextId = shipments.size.toLong() + 1
    }

    private fun sampleShipments(): MutableList<Shipment> {
        val today = LocalDate.now()
        return mutableListOf(
            shipment("AR-100234", carrierId = 1, estimatedDate = today.plusDays(3)),
            shipment("AR-100235", carrierId = 2, estimatedDate = today.minusDays(2)),
            shipment("AR-100236", carrierId = 3, estimatedDate = today.plusDays(5)),
            shipment("AR-100237", carrierId = 4, estimatedDate = today.minusDays(1), effectiveDate = today),
            shipment("AR-100238", carrierId = 1, estimatedDate = today.minusDays(4), effectiveDate = today.minusDays(2)),
        ).also { list ->
            list.forEachIndexed { index, shipment ->
                shipment.assignId(index.toLong() + 1)
            }
        }
    }

    private fun shipment(
        trackingNumber: String,
        carrierId: Long,
        estimatedDate: LocalDate,
        effectiveDate: LocalDate? = null,
    ) = Shipment(
        orderRepository.findByTrackingNumber(trackingNumber)!!,
        carrierRepository.findById(carrierId),
        estimatedDate,
        effectiveDate,
    )

    private companion object {
        const val INITIAL_ID = 1L
    }
}
