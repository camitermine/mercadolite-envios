package ar.edu.unsam.mercadolite.controller.request

// Compartidos entre los requests de órdenes y envíos
internal object ShipmentValidationMessages {
    const val CLIENT_REQUIRED = "El cliente es obligatorio"
    const val CLIENT_TOO_LONG = "El cliente no puede superar los 80 caracteres"
    const val ADDRESS_REQUIRED = "La dirección es obligatoria"
    const val ADDRESS_TOO_LONG = "La dirección no puede superar los 120 caracteres"
    const val DESTINATION_REQUIRED = "La localidad es obligatoria"
    const val DESTINATION_TOO_LONG = "La localidad no puede superar los 120 caracteres"
    const val PRODUCT_REQUIRED = "El producto es obligatorio"
    const val PRODUCT_TOO_LONG = "El producto no puede superar los 120 caracteres"
    const val CARRIER_REQUIRED = "El transportista es obligatorio"
    const val DATE_REQUIRED = "La fecha estimada de entrega es obligatoria"
}
