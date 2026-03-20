package com.bookapp.shared.web

import com.bookapp.shared.auth.AuthHeaders
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

/**
 * Configures cross-origin access for browser-based clients that call the backend API directly
 * during local development.
 */
@Configuration
class ApiCorsConfiguration(
    @Value("\${app.cors.allowed-origin-patterns:http://localhost:*,http://127.0.0.1:*}")
    private val allowedOriginPatterns: List<String>,
) : WebMvcConfigurer {
    override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/api/**")
            .allowedOriginPatterns(*allowedOriginPatterns.toTypedArray())
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("Content-Type", AuthHeaders.USER_ID, AuthHeaders.USER_NAME)
            .maxAge(3600)
    }
}
