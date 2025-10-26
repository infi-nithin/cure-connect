package com.cureconnect.app.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "Bearer Authentication";

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            // 1. Define the Security Scheme Component (How authentication works)
            .components(new Components()
                .addSecuritySchemes(SECURITY_SCHEME_NAME, createSecurityScheme()))
            
            .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
            
            .info(new Info()
                .title("CureConnect API")
                .description("API documentation for the CureConnect healthcare platform, secured with JWT.")
                .version("v1.0.0"));
    }

    private SecurityScheme createSecurityScheme() {
        return new SecurityScheme()
            .name(SECURITY_SCHEME_NAME)
            .type(SecurityScheme.Type.HTTP) // Type HTTP for bearer token
            .scheme("bearer")             // Scheme is 'bearer'
            .bearerFormat("JWT")          // Format is JWT
            .in(SecurityScheme.In.HEADER)  // Token is passed in the Authorization header
            .description("Provide the JWT access token obtained after login/registration.");
    }
}