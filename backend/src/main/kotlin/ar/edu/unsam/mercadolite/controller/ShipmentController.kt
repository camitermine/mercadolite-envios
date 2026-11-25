package ar.edu.unsam.mercadolite.controller

import ar.edu.unsam.mercadolite.controller.request.OnCreate
import ar.edu.unsam.mercadolite.controller.request.ShipmentRequest
import ar.edu.unsam.mercadolite.controller.response.MessageResponse
import ar.edu.unsam.mercadolite.controller.response.ShipmentResponse
import ar.edu.unsam.mercadolite.domain.Shipment
import ar.edu.unsam.mercadolite.domain.ShipmentDetails
import ar.edu.unsam.mercadolite.service.ShipmentService
import jakarta.validation.Valid
import jakarta.validation.groups.Default
import java.net.URI
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/shipments")
class ShipmentController(
    private val shipmentService: ShipmentService,
) {
    private val shipmentMapper = ShipmentMapper()

    @GetMapping
    fun getAll(
        @RequestParam(required = false) status: String?,
    ): List<ShipmentResponse> =
        shipmentService.getAll(status).map { shipmentMapper.toDTO(it) }

    @GetMapping("/statuses")
    fun getStatuses(): List<String> =
        shipmentService.getStatuses()

    @GetMapping("/{trackingNumber}")
    fun getByTrackingNumber(
        @PathVariable trackingNumber: String,
    ): ShipmentResponse =
        shipmentMapper.toDTO(shipmentService.getByTrackingNumber(trackingNumber))

    @PostMapping
    fun create(
        @Validated(Default::class, OnCreate::class) @RequestBody request: ShipmentRequest,
    ): ResponseEntity<MessageResponse> {
        val shipment = shipmentService.create(
            request.trackingNumber!!.trim(),
            shipmentMapper.toObject(request),
        )
        return ResponseEntity.created(URI.create("/shipments/${shipment.trackingNumber}"))
            .body(MessageResponse("Envío ${shipment.trackingNumber} creado"))
    }

    @PutMapping("/{trackingNumber}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun update(
        @PathVariable trackingNumber: String,
        @Valid @RequestBody request: ShipmentRequest,
    ) {
        shipmentService.update(trackingNumber, shipmentMapper.toObject(request))
    }

    @PatchMapping("/{trackingNumber}/deliver")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deliver(
        @PathVariable trackingNumber: String,
    ) {
        shipmentService.deliver(trackingNumber)
    }
}

class ShipmentMapper {

    fun toDTO(shipment: Shipment): ShipmentResponse =
        ShipmentResponse(shipment)

    fun toObject(request: ShipmentRequest): ShipmentDetails =
        request.toDetails()
}
