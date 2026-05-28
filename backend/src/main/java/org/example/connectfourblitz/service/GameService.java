package org.example.connectfourblitz.service;

import org.example.connectfourblitz.model.GameSession;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GameService {

    // Хранилище сессий в RAM
    private final Map<String, GameSession> games = new ConcurrentHashMap<>();

    public GameSession createGame(String playerId) {
        GameSession session = new GameSession(playerId);
        games.put(session.getId(), session);
        return session;
    }

    public GameSession joinGame(String gameId, String playerId) {
        GameSession session = games.get(gameId);
        if (session == null) {
            throw new IllegalArgumentException("Игра с ID " + gameId + " не найдена");
        }

        // Если комната ждет игрока и заходит не создатель — подключаем его
        if ("WAITING".equals(session.getStatus()) && !session.getPlayer1Id().equals(playerId)) {
            session.setPlayer2Id(playerId);
            session.setStatus("PLAYING");
        }
        return session;
    }

    public GameSession makeMove(String gameId, String playerId, int col) {
        GameSession session = games.get(gameId);
        if (session == null || session.isGameOver() || !"PLAYING".equals(session.getStatus())) {
            return session;
        }

        // Проверяем, чей сейчас ход
        boolean isPlayer1 = playerId.equals(session.getPlayer1Id());
        boolean isPlayer2 = playerId.equals(session.getPlayer2Id());

        if ((session.getCurrentTurn() == 1 && !isPlayer1) || (session.getCurrentTurn() == 2 && !isPlayer2)) {
            return session; // Не твой ход
        }

        int[][] grid = session.getBoard().getGrid();
        int playerMark = session.getCurrentTurn();

        // Логика Connect 4: ищем самую нижнюю пустую ячейку (0) в выбранной колонке
        for (int row = 5; row >= 0; row--) {
            if (grid[row][col] == 0) {
                grid[row][col] = playerMark;

                // Переключаем ход (с 1 на 2 или с 2 на 1)
                session.setCurrentTurn(playerMark == 1 ? 2 : 1);
                break;
            }
        }

        // Здесь в будущем можно вызвать метод проверки победы:
        // checkWinCondition(session);

        return session;
    }
}