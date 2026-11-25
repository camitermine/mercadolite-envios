package ar.edu.unsam.mercadolite.controller

import ar.edu.unsam.mercadolite.controller.request.OrderRequest
import ar.edu.unsam.mercadolite.controller.response.ClientOrderResponse
import ar.edu.unsam.mercadolite.controller.response.MessageResponse
import ar.edu.unsam.mercadolite.controller.response.OrderResponse
import ar.edu.unsam.mercadolite.service.OrderService
import jakarta.validation.Valid
import java.net.URI
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/orders")
class OrderController(
    private val orderService: OrderService,
) {
    @GetMapping
    fun getAll(): List<OrderResponse> = orderService.getAll().map(::OrderResponse)

    @GetMapping("/user/{userName}")
    fun getByUserName(@PathVariable userName: String): List<ClientOrderResponse> =
        orderService.getByUserName(userName).map(::ClientOrderResponse)

    @PostMapping
    fun create(@Valid @RequestBody request: OrderRequest): ResponseEntity<MessageResponse> {
        val order = orderService.create(
            userName = request.userName.trim(),
            clientName = request.clientName.trim(),
            address = request.address.trim(),
            destination = request.destination.trim(),
            product = request.product!!.toProduct(),
        )
        return ResponseEntity.created(URI.create("/orders/${order.trackingNumber}"))
            .body(MessageResponse("Pedido ${order.trackingNumber} creado"))
    }

    @DeleteMapping("/{trackingNumber}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable trackingNumber: String) = orderService.delete(trackingNumber)
}
