package org.example.connectfourblitz.controller;

import org.example.connectfourblitz.model.GameSession;
import org.example.connectfourblitz.service.GameService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/game")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class GameRestController {

    private final GameService gameService;
    private final SimpMessagingTemplate messagingTemplate; // Внедряем для реалтайм-старта игры

    public GameRestController(GameService gameService, SimpMessagingTemplate messagingTemplate) {
        this.gameService = gameService;
        this.messagingTemplate = messagingTemplate;
    }

    @PostMapping({"/create", "/create/"})
    public ResponseEntity<GameSession> createRoom(@RequestBody CreateRoomRequest request) {
        GameSession session = gameService.createGame(request.playerId());
        return ResponseEntity.ok(session);
    }

    @PostMapping({"/join", "/join/"})
    public ResponseEntity<GameSession> joinRoom(@RequestBody JoinRoomRequest request) {
        GameSession session = gameService.joinGame(request.gameId(), request.playerId());

        // Оповещаем создателя комнаты по WebSocket, что к нему зашёл соперник и игра стартует!
        messagingTemplate.convertAndSend("/topic/game/" + session.getId(), session);

        return ResponseEntity.ok(session);
    }

    @GetMapping("/rooms")
    public ResponseEntity<List<GameSession>> getAvailableRooms() {
        List<GameSession> waitingGames = gameService.getAllGames().values().stream()
                .filter(g -> "WAITING".equals(g.getStatus()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(waitingGames);
    }

    // Records для REST DTO
    public record CreateRoomRequest(String playerId) {}
    public record JoinRoomRequest(String gameId, String playerId) {}
}