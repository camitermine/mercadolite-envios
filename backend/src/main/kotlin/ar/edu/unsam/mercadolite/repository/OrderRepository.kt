package ar.edu.unsam.mercadolite.repository

import ar.edu.unsam.mercadolite.domain.Order
import ar.edu.unsam.mercadolite.domain.Product
import ar.edu.unsam.mercadolite.helper.equalsTrimmedIgnoreCase
import org.springframework.stereotype.Repository

@Repository
class OrderRepository {
    private var orders = mutableListOf<Order>()
    private var lastTrackingNumber = INITIAL_TRACKING_NUMBER

    fun findAll(): List<Order> = orders.toList()

    fun findByTrackingNumber(trackingNumber: String): Order? =
        orders.find { it.trackingNumber == trackingNumber }

    fun findByUserName(userName: String): List<Order> =
        orders.filter { it.userName.equalsTrimmedIgnoreCase(userName) }

    @Synchronized
    fun create(
        userName: String,
        clientName: String,
        address: String,
        destination: String,
        product: Product,
    ): Order {
        val order = Order(nextTrackingNumber(), clientName, address, destination, product, userName = userName)
        orders.add(order)
        return order
    }

    @Synchronized
    fun delete(order: Order) {
        orders.remove(order)
    }

    fun reset() {
        orders = sampleOrders()
        lastTrackingNumber = orders.maxOf { it.trackingNumber.removePrefix(TRACKING_PREFIX).toInt() }
    }

    // Lleva la cuenta aparte para no repetir el número de una orden cancelada
    private fun nextTrackingNumber(): String = "$TRACKING_PREFIX${++lastTrackingNumber}"

    private fun sampleOrders() =
        mutableListOf(
            Order("AR-100234", "Lucía Fernández", "Av. Santa Fe 2450", "Recoleta, CABA", sampleProduct(78, "Notebook Lenovo", 1899.99)),
            Order("AR-100235", "Martín González", "Av. Rivadavia 6800", "Flores, CABA", sampleProduct(122, "Celular Samsung", 899.99)),
            Order("AR-100236", "Sofía Martínez", "Belgrano 450", "Rosario, Santa Fe", sampleProduct(100, "Auriculares Bluetooth", 49.99)),
            Order("AR-100237", "Diego Ramírez", "San Martín 1250", "Córdoba, Córdoba", sampleProduct(84, "Monitor", 299.99)),
            Order("AR-100238", "Valentina López", "Mitre 780", "La Plata, Buenos Aires", sampleProduct(85, "Teclado mecánico", 79.99)),
            Order("AR-100260", "Rocío Benítez", "Av. Corrientes 5320", "Villa Crespo, CABA", sampleProduct(101, "Auriculares inalámbricos", 59.99)),
            Order("AR-100261", "Emiliano Cabrera", "San Martín 870", "Godoy Cruz, Mendoza", sampleProduct(68, "Cafetera express", 129.99)),
            Order("AR-100262", "Florencia Ibáñez", "Av. Centenario 1250", "San Isidro, Bs. As.", sampleProduct(157, "Zapatillas running", 89.99)),
            Order("AR-100263", "Gonzalo Ríos", "Bv. Santa Fe 415", "Rafaela, Santa Fe", sampleProduct(86, "Monitor 27\"", 349.99)),
            Order("AR-100264", "Malena Ferreyra", "Av. Mitre 2190", "Posadas, Misiones", sampleProduct(69, "Set de mate", 24.99)),
            Order("AR-100265", "Ignacio Peralta", "Sobremonte 640", "Río Cuarto, Córdoba", sampleProduct(85, "Teclado mecánico", 79.99)),
        )

    private fun sampleProduct(id: Long, name: String, price: Double) =
        Product(id, name, price, thumbnail = "", quantity = 1)

    private companion object {
        const val TRACKING_PREFIX = "AR-"
        const val INITIAL_TRACKING_NUMBER = 100000
    }
}
