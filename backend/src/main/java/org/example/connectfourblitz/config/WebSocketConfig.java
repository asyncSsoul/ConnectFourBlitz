package org.example.connectfourblitz.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker // Включает обработку сообщений через WebSocket с поддержкой брокера
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Включаем простой брокер в памяти.
        // На эндпоинты, начинающиеся с /topic, фронтенд будет ПОДПИСЫВАТЬСЯ для получения обновлений сессии
        config.enableSimpleBroker("/topic");

        // Префикс для сообщений из фронтенда, которые должны маршрутизироваться на методы @MessageMapping в контроллер
        // Например: клик по колонке полетит на /app/move
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")  // временно для теста
                .withSockJS();
    }
}