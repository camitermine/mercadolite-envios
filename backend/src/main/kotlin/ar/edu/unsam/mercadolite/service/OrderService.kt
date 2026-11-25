package ar.edu.unsam.mercadolite.service

import ar.edu.unsam.mercadolite.domain.Order
import ar.edu.unsam.mercadolite.domain.Product
import ar.edu.unsam.mercadolite.error.NotFoundException
import ar.edu.unsam.mercadolite.repository.OrderRepository
import org.springframework.stereotype.Service

@Service
class OrderService(
    private val orderRepository: OrderRepository,
) {
    fun getAll(): List<Order> = orderRepository.findAll().filter { it.isPending() }

    fun getByUserName(userName: String): List<Order> = orderRepository.findByUserName(userName)

    fun create(
        userName: String,
        clientName: String,
        address: String,
        destination: String,
        product: Product,
    ): Order = orderRepository.create(userName, clientName, address, destination, product)

    fun delete(trackingNumber: String) {
        val order = orderRepository.findByTrackingNumber(trackingNumber)
            ?: throw NotFoundException("La orden solicitada no existe")
        order.cancel()
        orderRepository.delete(order)
    }
}
