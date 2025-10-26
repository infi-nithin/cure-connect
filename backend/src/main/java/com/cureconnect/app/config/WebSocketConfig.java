package com.cureconnect.app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 1. Prefix for destinations handled by the application's @MessageMapping methods
        registry.setApplicationDestinationPrefixes("/app");
        
        // 2. Prefix for the broker's destinations (used for broadcast and point-to-point)
        // /topic for public messages, /user for private messages
        registry.enableSimpleBroker("/topic", "/queue");
        
        // 3. User destination prefix for routing messages to specific users (e.g., /user/UUID/queue/messages)
        registry.setUserDestinationPrefix("/user");
    }
}
