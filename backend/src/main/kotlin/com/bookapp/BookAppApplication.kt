package com.bookapp

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

/** Boot application entrypoint for the Book App backend service. */
@SpringBootApplication
class BookAppApplication

fun main(args: Array<String>) {
    runApplication<BookAppApplication>(*args)
}

