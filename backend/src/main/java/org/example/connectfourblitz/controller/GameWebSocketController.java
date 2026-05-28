package org.example.connectfourblitz.controller;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.example.connectfourblitz.model.GameSession;
import org.example.connectfourblitz.service.GameService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Slf4j
@Controller
public class GameWebSocketController {

    private final GameService gameService;
    private final SimpMessagingTemplate messagingTemplate;

    public GameWebSocketController(GameService gameService, SimpMessagingTemplate messagingTemplate) {
        this.gameService = gameService;
        this.messagingTemplate = messagingTemplate;
    }

    // --- WebSocket Обработчик ходов (/app/move) ---
    @MessageMapping("/move")
    public void handleMove(MoveRequest request) {
        log.info("Получено сообщение на /app/move");

        if (request == null) {
            log.warn("Критическая ошибка: MoveRequest пришел null!");
            return;
        }

        log.info("Данные запроса -> gameId: {}, playerId: {}, col: {}",
                request.getGameId(), request.getPlayerId(), request.getCol());

        // Вызываем сервис
        GameSession updatedGame = gameService.makeMove(request.getGameId(), request.getPlayerId(), request.getCol());

        log.info("Отправляем обновление в топик: /topic/game/{}", request.getGameId());

        // Пушим обновленное состояние всем подписчикам топика этой комнаты
        messagingTemplate.convertAndSend("/topic/game/" + request.getGameId(), updatedGame);
    }
}

// DTO для WebSocket-сообщений
@Data
class MoveRequest {
    private String gameId;
    private String playerId;
    private int col;
}