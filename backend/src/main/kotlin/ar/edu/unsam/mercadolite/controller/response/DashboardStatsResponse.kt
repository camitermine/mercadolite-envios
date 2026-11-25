package ar.edu.unsam.mercadolite.controller.response

import ar.edu.unsam.mercadolite.domain.DashboardStats

data class DashboardStatsResponse(
    val preparing: Int,
    val inTransit: Int,
    val deliveredToday: Int,
    val delayed: Int,
) {
    constructor(stats: DashboardStats) : this(
        preparing = stats.preparing,
        inTransit = stats.inTransit,
        deliveredToday = stats.deliveredToday,
        delayed = stats.delayed,
    )
}
