package ar.edu.unsam.mercadolite.helper

fun String.equalsTrimmedIgnoreCase(other: String): Boolean =
    trim().equals(other.trim(), ignoreCase = true)
