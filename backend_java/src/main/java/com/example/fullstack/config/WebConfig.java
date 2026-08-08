package com.example.fullstack.config;

import org.springframework.beans.factory.annotation.Value;
// import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// Disabled to avoid competing with Spring Security CORS configuration.
// This is Spring MVC. Spring Security is using gCorsProperties.java.
// Spring Boot will not register WebConfig as a configuration class, so addCorsMappings() won't be applied.
// @Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins.split(","))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .maxAge(3600);
    }
}
