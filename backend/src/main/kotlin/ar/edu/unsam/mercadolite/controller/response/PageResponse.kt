package ar.edu.unsam.mercadolite.controller.response

class PageResponse<T>(
    items: List<T>,
    val page: Int,
    val size: Int,
) {
    private val pages = items.chunked(size)
    val content: List<T> = pages.getOrElse(page) { emptyList() }
    val totalElements: Int = items.size
    val totalPages: Int = pages.size
}
