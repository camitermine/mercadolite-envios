package ar.edu.unsam.mercadolite.service

import ar.edu.unsam.mercadolite.domain.Shipment
import ar.edu.unsam.mercadolite.domain.ShipmentDetails
import ar.edu.unsam.mercadolite.domain.ShipmentStatuses
import ar.edu.unsam.mercadolite.error.NotFoundException
import ar.edu.unsam.mercadolite.repository.CarrierRepository
import ar.edu.unsam.mercadolite.repository.OrderRepository
import ar.edu.unsam.mercadolite.repository.ShipmentRepository
import org.springframework.stereotype.Service

@Service
class ShipmentService(
    private val shipmentRepository: ShipmentRepository,
    private val orderRepository: OrderRepository,
    private val carrierRepository: CarrierRepository,
) {
    // Sin estado devuelve todos; con un estado que no existe, 400
    fun getAll(status: String? = null): List<Shipment> {
        val shipments = shipmentRepository.findAll()
        if (status == null) return shipments

        val wantedStatus = ShipmentStatuses.fromDescription(status)
        return shipments.filter { it.status == wantedStatus }
    }

    fun getStatuses(): List<String> =
        ShipmentStatuses.entries.map { it.description }

    // La concurrencia se resuelve con @Synchronized en el dominio (Order, Shipment)
    // y en los repositorios (altas y bajas), no en el service
    fun create(trackingNumber: String, details: ShipmentDetails): Shipment {
        val order = orderRepository.findByTrackingNumber(trackingNumber)
            ?: throw NotFoundException("La orden solicitada no existe")
        val carrier = carrierRepository.findById(details.carrierId)
        val shipment = Shipment(order, carrier, details.estimatedDate)
        order.updateDetails(details)
        return shipmentRepository.create(shipment)
    }

    fun update(trackingNumber: String, details: ShipmentDetails): Shipment {
        val shipment = getByTrackingNumber(trackingNumber)
        val carrier = carrierRepository.findById(details.carrierId)
        shipment.update(details, carrier)
        return shipment
    }

    fun deliver(trackingNumber: String): Shipment {
        val shipment = getByTrackingNumber(trackingNumber)
        shipment.deliver()
        return shipment
    }

    fun getByTrackingNumber(trackingNumber: String): Shipment =
        shipmentRepository.findByTrackingNumber(trackingNumber)
            ?: throw NotFoundException("No se encontró el envío")
}
