package ar.edu.unsam.mercadolite.controller

import ar.edu.unsam.mercadolite.controller.request.CarrierRequest
import ar.edu.unsam.mercadolite.controller.response.CarrierResponse
import ar.edu.unsam.mercadolite.controller.response.MessageResponse
import ar.edu.unsam.mercadolite.domain.CarrierStatuses
import ar.edu.unsam.mercadolite.service.CarrierService
import jakarta.validation.Valid
import java.net.URI
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/carriers")
class CarrierController(
    private val carrierService: CarrierService,
) {
    @GetMapping
    fun getAll(): List<CarrierResponse> = carrierService.getAll().map(::CarrierResponse)

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): CarrierResponse = CarrierResponse(carrierService.getById(id))

    @PostMapping
    fun create(@Valid @RequestBody request: CarrierRequest): ResponseEntity<MessageResponse> {
        val carrier = carrierService.create(
            name = request.name.trim(),
            phone = request.phone.trim(),
            coverage = request.coverage.trim(),
            status = CarrierStatuses.fromDescription(request.status.trim()),
        )
        return ResponseEntity.created(URI.create("/carriers/${carrier.id}"))
            .body(MessageResponse("Transportista ${carrier.id} creado"))
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun update(
        @PathVariable id: Long,
        @Valid @RequestBody request: CarrierRequest,
    ) {
        carrierService.update(
            id = id,
            name = request.name.trim(),
            phone = request.phone.trim(),
            coverage = request.coverage.trim(),
            status = CarrierStatuses.fromDescription(request.status.trim()),
        )
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable id: Long) = carrierService.delete(id)
}
