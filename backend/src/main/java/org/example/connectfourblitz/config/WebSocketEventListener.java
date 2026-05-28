package org.example.connectfourblitz.config;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebSocketEventListener {

    // Мапа для связи технического сокета с реальным игроком: sessionId -> playerId
    private final Map<String, String> sessionToPlayerMap = new ConcurrentHashMap<>();

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();

        // Когда фронтенд подключается к сокету, он может передать свой playerId в заголовках (headers)
        String playerId = headerAccessor.getFirstNativeHeader("playerId");

        if (playerId != null && sessionId != null) {
            sessionToPlayerMap.put(sessionId, playerId);
            System.out.println("Игрок " + playerId + " подключил сокет: " + sessionId);
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();

        if (sessionId != null) {
            String playerId = sessionToPlayerMap.remove(sessionId);
            if (playerId != null) {
                System.out.println("Игрок " + playerId + " отключился (закрыл вкладку/пропал интернет)");

                // ТУТ ЛОГИКА:
                // 1. Ищем через GameService, в какой игре участвовал этот playerId
                // 2. Меняем статус игры на FINISHED
                // 3. Присуждаем победу второму игроку
                // 4. Пушим обновленную сессию в топик комнаты через messagingTemplate
            }
        }
    }
}