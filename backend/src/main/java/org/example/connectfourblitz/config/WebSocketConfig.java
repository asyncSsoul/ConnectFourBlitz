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
        // Регистрируем точку входа, по которой Next.js будет устанавливать сокет-соединение
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:3000", "http://127.0.0.1:3000") // CORS для Next.js
                .withSockJS(); // Включаем SockJS как фолбек-вариант, если WebSocket не поддерживается браузером
    }
}