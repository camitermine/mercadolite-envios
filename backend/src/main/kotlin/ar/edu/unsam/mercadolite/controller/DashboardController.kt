package ar.edu.unsam.mercadolite.controller

import ar.edu.unsam.mercadolite.controller.response.DashboardStatsResponse
import ar.edu.unsam.mercadolite.controller.response.DelayedShipmentResponse
import ar.edu.unsam.mercadolite.controller.response.PageResponse
import ar.edu.unsam.mercadolite.controller.response.UpcomingDeliveryResponse
import ar.edu.unsam.mercadolite.service.DashboardService
import jakarta.validation.constraints.Min
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/dashboard")
class DashboardController(
    private val dashboardService: DashboardService,
) {
    @GetMapping("/stats")
    fun getStats(): DashboardStatsResponse = DashboardStatsResponse(dashboardService.getStats())

    @GetMapping("/delayed-shipments")
    fun getDelayedShipments(
        @RequestParam(defaultValue = "0") @Min(0) page: Int,
    ): PageResponse<DelayedShipmentResponse> =
        PageResponse(dashboardService.getDelayedShipments().map(::DelayedShipmentResponse), page, DASHBOARD_PAGE_SIZE)

    @GetMapping("/upcoming-deliveries")
    fun getUpcomingDeliveries(
        @RequestParam(defaultValue = "0") @Min(0) page: Int,
    ): PageResponse<UpcomingDeliveryResponse> =
        PageResponse(dashboardService.getUpcomingDeliveries().map(::UpcomingDeliveryResponse), page, DASHBOARD_PAGE_SIZE)

    private companion object {
        const val DASHBOARD_PAGE_SIZE = 4
    }
}
