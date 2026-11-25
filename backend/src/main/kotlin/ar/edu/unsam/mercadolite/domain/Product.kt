package ar.edu.unsam.mercadolite.domain

data class Product(
    val id: Long,
    val name: String,
    val price: Double,
    val thumbnail: String,
    val quantity: Int,
)
