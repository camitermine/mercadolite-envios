package ar.edu.unsam.mercadolite.controller.response

// Cuerpo de las altas: el 201 + Location ya alcanza para nuestros fronts,
// pero quien use la API desde afuera recibe además una confirmación legible
data class MessageResponse(val message: String)
