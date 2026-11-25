
package ar.edu.unsam.mercadolite.domain

import ar.edu.unsam.mercadolite.error.BusinessException
import org.junit.jupiter.api.Test
import java.time.LocalDate
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertSame

class ShipmentTest {
    private val today = LocalDate.of(2026, 7, 1)
    private val tomorrow = today.plusDays(1)
    private val andreani = Carrier(1, "Andreani", "0810", "Nacional", CarrierStatuses.ACTIVE)
    private val oca = Carrier(2, "OCA", "0810", "Nacional", CarrierStatuses.ACTIVE)
    private val cruzDelSur = Carrier(5, "Cruz del Sur", "0810", "Patagonia", CarrierStatuses.INACTIVE)

    private fun details(carrierId: Long = 2, estimatedDate: LocalDate = tomorrow) =
        ShipmentDetails("Lucía", "Mitre 1", "Rosario", "Monitor", carrierId, estimatedDate)

    private fun pendingOrder() =
        Order("AR-1", "Diego", "Belgrano 2", "Córdoba", Product(1, "Teclado", 79.99, "", 1))

    private fun shipment(
        carrier: Carrier = andreani,
        estimatedDate: LocalDate = tomorrow,
        effectiveDate: LocalDate? = null,
    ) = Shipment(pendingOrder(), carrier, estimatedDate, effectiveDate)

    @Test
    fun `un envio nuevo toma el seguimiento de su orden y todavia no fue entregado`() {
        val order = pendingOrder()

        val shipment = Shipment(order, oca, tomorrow)

        assertFalse(order.isPending())
        assertEquals("AR-1", shipment.trackingNumber)
        assertSame(oca, shipment.carrier)
        assertEquals(tomorrow, shipment.estimatedDate)
        assertNull(shipment.effectiveDate)
    }

    @Test
    fun `entregar guarda la fecha efectiva`() {
        val shipment = shipment()

        shipment.deliver(today)

        assertEquals(today, shipment.effectiveDate)
        assertEquals(ShipmentStatuses.DELIVERED, shipment.status)
    }

    @Test
    fun `no se puede entregar dos veces`() {
        assertFailsWith<BusinessException> {
            shipment(effectiveDate = today).deliver(today)
        }
    }

    @Test
    fun `editar actualiza la orden y conserva el seguimiento`() {
        val shipment = shipment()

        shipment.update(details(), oca, today)

        assertEquals("AR-1", shipment.trackingNumber)
        assertEquals("Lucía", shipment.order.clientName)
        assertSame(oca, shipment.carrier)
        assertNull(shipment.effectiveDate)
    }

    @Test
    fun `no se puede editar un envio entregado`() {
        val shipment = shipment(effectiveDate = today)

        val error = assertFailsWith<BusinessException> {
            shipment.update(details(), oca, today)
        }

        assertEquals("No se puede editar un envío entregado", error.message)
        assertEquals("Diego", shipment.order.clientName)
        assertSame(andreani, shipment.carrier)
        assertEquals(tomorrow, shipment.estimatedDate)
        assertEquals(today, shipment.effectiveDate)
    }

    @Test
    fun `editar acepta una fecha pasada solo si no cambia`() {
        val past = today.minusDays(3)
        val shipment = shipment(estimatedDate = past)

        shipment.update(details(estimatedDate = past), andreani, today)

        assertEquals(past, shipment.estimatedDate)

        assertFailsWith<BusinessException> {
            shipment().update(details(estimatedDate = past), andreani, today)
        }
    }

    @Test
    fun `editar conserva un transportista que paso a inactivo pero no permite cambiar a uno`() {
        val shipment = shipment(carrier = oca)
        oca.status = CarrierStatuses.INACTIVE

        shipment.update(details(), oca, today)

        assertSame(oca, shipment.carrier)

        assertFailsWith<BusinessException> {
            shipment().update(details(), cruzDelSur, today)
        }
    }

    @Test
    fun `un envio vencido esta demorado y calcula sus dias de demora`() {
        val now = LocalDate.now()
        val delayed = shipment(estimatedDate = now.minusDays(2))

        assertEquals(ShipmentStatuses.DELAYED, delayed.status)
        assertEquals(2, delayed.delayDays(now))
        assertEquals(0, shipment(estimatedDate = now.plusDays(1)).delayDays(now))
    }

    @Test
    fun `solo un transportista activo se puede asignar`() {
        andreani.validateAssignable()

        assertFailsWith<BusinessException> {
            cruzDelSur.validateAssignable()
        }
    }
}
