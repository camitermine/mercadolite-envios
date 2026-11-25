package ar.edu.unsam.mercadolite.domain

import ar.edu.unsam.mercadolite.error.BusinessException
import ar.edu.unsam.mercadolite.error.ConflictException
import org.junit.jupiter.api.Test
import java.time.LocalDate
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertSame
import kotlin.test.assertTrue

class ShipmentLinksTest {
    private val today = LocalDate.of(2026, 7, 1)
    private val tomorrow = today.plusDays(1)
    private val andreani = Carrier(1, "Andreani", "0810", "Nacional", CarrierStatuses.ACTIVE)
    private val oca = Carrier(2, "OCA", "0810", "Nacional", CarrierStatuses.ACTIVE)
    private val cruzDelSur = Carrier(5, "Cruz del Sur", "0810", "Patagonia", CarrierStatuses.INACTIVE)

    private fun details(carrierId: Long = 2, estimatedDate: LocalDate = tomorrow) =
        ShipmentDetails("Lucía", "Mitre 1", "Rosario", "Monitor", carrierId, estimatedDate)

    private fun pendingOrder() = Order("AR-1", "Diego", "Belgrano 2", "Córdoba", Product(1, "Teclado", 79.99, "", 1))

    @Test
    fun `una orden sin envio esta pendiente`() {
        val order = pendingOrder()

        assertTrue(order.isPending())
        assertNull(order.shipment)
    }

    @Test
    fun `se puede cancelar una orden pendiente`() {
        val order = pendingOrder()

        order.cancel()

        assertTrue(order.cancelled)
    }

    @Test
    fun `no se puede cancelar una orden que ya tiene envio`() {
        val order = pendingOrder()
        Shipment(order, andreani, tomorrow)

        val error = assertFailsWith<BusinessException> { order.cancel() }

        assertEquals("No se puede cancelar un pedido que ya tiene un envío", error.message)
        assertFalse(order.cancelled)
    }

    @Test
    fun `no se puede crear un envio para una orden cancelada y nada queda enlazado`() {
        val order = pendingOrder()
        order.cancel()

        val error = assertFailsWith<ConflictException> { Shipment(order, andreani, tomorrow) }

        assertEquals("La orden fue cancelada", error.message)
        assertNull(order.shipment)
        assertEquals(0, andreani.shipmentCount)
    }

    @Test
    fun `se puede eliminar un transportista sin envios`() {
        andreani.delete()

        assertTrue(andreani.deleted)
    }

    @Test
    fun `no se puede eliminar un transportista con envios`() {
        Shipment(pendingOrder(), andreani, tomorrow)

        assertFailsWith<BusinessException> { andreani.delete() }
        assertFalse(andreani.deleted)
    }

    @Test
    fun `no se puede crear un envio con un transportista eliminado y la orden sigue pendiente`() {
        val order = pendingOrder()
        andreani.delete()

        val error = assertFailsWith<ConflictException> { Shipment(order, andreani, tomorrow) }

        assertEquals("El transportista fue eliminado", error.message)
        assertTrue(order.isPending())
        assertEquals(0, andreani.shipmentCount)
    }

    @Test
    fun `no se puede pasar un envio a un transportista eliminado y nada cambia`() {
        val order = pendingOrder()
        val shipment = Shipment(order, andreani, tomorrow)
        oca.delete()

        assertFailsWith<ConflictException> { shipment.update(details(carrierId = 2), oca, today) }

        assertSame(andreani, shipment.carrier)
        assertEquals(1, andreani.shipmentCount)
        assertEquals(0, oca.shipmentCount)
        assertEquals("Diego", order.clientName)
    }

    @Test
    fun `un envio conoce su orden y su transportista y ambos lo conocen a el`() {
        val order = pendingOrder()

        val shipment = Shipment(order, andreani, tomorrow)

        assertSame(order, shipment.order)
        assertSame(andreani, shipment.carrier)
        assertSame(shipment, order.shipment)
        assertEquals(1, andreani.shipmentCount)
    }

    @Test
    fun `un transportista sabe cuantos envios tiene asignados`() {
        assertEquals(0, andreani.shipmentCount)
        assertFalse(andreani.hasShipments())

        Shipment(pendingOrder(), andreani, tomorrow)
        Shipment(pendingOrder(), andreani, tomorrow)

        assertEquals(2, andreani.shipmentCount)
        assertTrue(andreani.hasShipments())
    }

    @Test
    fun `no se puede crear un envio con un transportista inactivo y nada queda enlazado`() {
        val order = pendingOrder()

        assertFailsWith<BusinessException> { Shipment(order, cruzDelSur, tomorrow) }

        assertTrue(order.isPending())
        assertEquals(0, cruzDelSur.shipmentCount)
    }

    @Test
    fun `una orden no puede tener dos envios`() {
        val order = pendingOrder()
        Shipment(order, andreani, tomorrow)

        assertFailsWith<ConflictException> { Shipment(order, oca, tomorrow) }

        assertEquals(1, andreani.shipmentCount)
        assertEquals(0, oca.shipmentCount)
    }

    @Test
    fun `cambiar de transportista le pasa el envio al nuevo`() {
        val shipment = Shipment(pendingOrder(), andreani, tomorrow)

        shipment.update(details(), oca, today)

        assertSame(oca, shipment.carrier)
        assertEquals(0, andreani.shipmentCount)
        assertEquals(1, oca.shipmentCount)
    }

    @Test
    fun `editar con el mismo transportista no cambia su cantidad de envios`() {
        val shipment = Shipment(pendingOrder(), andreani, tomorrow)

        shipment.update(details(), andreani, today)

        assertEquals(1, andreani.shipmentCount)
    }

    @Test
    fun `una edicion rechazada no modifica nada`() {
        val shipment = Shipment(pendingOrder(), andreani, tomorrow)

        assertFailsWith<BusinessException> { shipment.update(details(), cruzDelSur, today) }

        assertEquals("Diego", shipment.order.clientName)
        assertSame(andreani, shipment.carrier)
        assertEquals(1, andreani.shipmentCount)
        assertEquals(0, cruzDelSur.shipmentCount)
    }
}
