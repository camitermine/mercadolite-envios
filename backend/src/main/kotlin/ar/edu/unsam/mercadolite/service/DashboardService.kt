package ar.edu.unsam.mercadolite.service

import ar.edu.unsam.mercadolite.domain.DashboardStats
import ar.edu.unsam.mercadolite.domain.Shipment
import ar.edu.unsam.mercadolite.domain.ShipmentStatuses
import ar.edu.unsam.mercadolite.repository.OrderRepository
import ar.edu.unsam.mercadolite.repository.ShipmentRepository
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class DashboardService(
    private val orderRepository: OrderRepository,
    private val shipmentRepository: ShipmentRepository,
) {
    fun getStats(): DashboardStats {
        val today = LocalDate.now()
        val shipments = shipmentRepository.findAll()
        return DashboardStats(
            preparing = orderRepository.findAll().count { it.isPending() },
            inTransit = shipments.count { it.status == ShipmentStatuses.IN_TRANSIT },
            deliveredToday = shipments.count { it.isDeliveredOn(today) },
            delayed = shipments.count { it.status == ShipmentStatuses.DELAYED },
        )
    }

    fun getDelayedShipments(): List<Shipment> =
        findShipmentsByStatus(ShipmentStatuses.DELAYED)

    fun getUpcomingDeliveries(): List<Shipment> =
        findShipmentsByStatus(ShipmentStatuses.IN_TRANSIT)

    private fun findShipmentsByStatus(status: ShipmentStatuses): List<Shipment> =
        shipmentRepository.findAll()
            .filter { it.status == status }
            .sortedBy { it.estimatedDate }
}
