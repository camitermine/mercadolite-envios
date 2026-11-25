package ar.edu.unsam.mercadolite.error

class BusinessException(
    message: String,
    val data: Map<String, String> = emptyMap(),
) : RuntimeException(message)

class ConflictException(
    message: String,
    val data: Map<String, String> = emptyMap(),
) : RuntimeException(message)

class NotFoundException(
    message: String,
    val data: Map<String, String> = emptyMap(),
) : RuntimeException(message)
