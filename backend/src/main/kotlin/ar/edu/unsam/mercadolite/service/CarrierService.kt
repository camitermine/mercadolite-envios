package ar.edu.unsam.mercadolite.service

import ar.edu.unsam.mercadolite.domain.Carrier
import ar.edu.unsam.mercadolite.domain.CarrierStatuses
import ar.edu.unsam.mercadolite.repository.CarrierRepository
import org.springframework.stereotype.Service

@Service
class CarrierService(
    private val carrierRepository: CarrierRepository,
) {
    fun getAll(): List<Carrier> = carrierRepository.findAll()

    fun getById(id: Long): Carrier = carrierRepository.findById(id)

    fun create(
        name: String,
        phone: String,
        coverage: String,
        status: CarrierStatuses,
    ): Carrier = carrierRepository.create(name, phone, coverage, status)

    fun update(
        id: Long,
        name: String,
        phone: String,
        coverage: String,
        status: CarrierStatuses,
    ): Carrier {
        val carrier = carrierRepository.findById(id)
        carrier.update(name, phone, coverage, status)
        return carrier
    }

    fun delete(id: Long) {
        val carrier = carrierRepository.findById(id)
        carrier.delete()
        carrierRepository.delete(carrier)
    }
}
