package org.example.connectfourblitz.controller;

import lombok.Data;
import org.example.connectfourblitz.model.GameSession;
import org.example.connectfourblitz.service.GameService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@CrossOrigin(
        origins = {"http://localhost:3000", "http://127.0.0.1:3000"},
        allowCredentials = "true"
)
public class GameWebSocketController {

    private final GameService gameService;
    private final SimpMessagingTemplate messagingTemplate;

    public GameWebSocketController(GameService gameService, SimpMessagingTemplate messagingTemplate) {
        this.gameService = gameService;
        this.messagingTemplate = messagingTemplate;
    }

    // --- 1. REST API (Принимаем JSON из тела запроса) ---

    @ResponseBody
    @PostMapping("/api/game/create")
    public ResponseEntity<GameSession> createRoom(@RequestBody CreateRoomRequest request) {
        GameSession session = gameService.createGame(request.playerId());
        return ResponseEntity.ok(session);
    }

    @ResponseBody
    @PostMapping("/api/game/join")
    public ResponseEntity<GameSession> joinRoom(@RequestBody JoinRoomRequest request) {
        GameSession session = gameService.joinGame(request.gameId(), request.playerId());
        return ResponseEntity.ok(session);
    }

    // --- 2. WebSocket Обработчик ходов (/app/move) ---

    @MessageMapping("/move")
    public void handleMove(MoveRequest request) {
        GameSession updatedGame = gameService.makeMove(request.getGameId(), request.getPlayerId(), request.getCol());

        // Пушим обновленное состояние всем подписчикам топика этой комнаты
        messagingTemplate.convertAndSend("/topic/game/" + request.getGameId(), updatedGame);
    }

    // --- 3. Records для REST DTO (Автоматический маппинг JSON) ---

    public record CreateRoomRequest(String playerId) {}

    public record JoinRoomRequest(String gameId, String playerId) {}
}

// DTO для WebSocket-сообщений (использует Lombok)
@Data
class MoveRequest {
    private String gameId;
    private String playerId;
    private int col;
}