package org.example.connectfourblitz.service;

import org.example.connectfourblitz.model.GameSession;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GameService {

    // Хранилище сессий в RAM (in-memory)
    private final Map<String, GameSession> games = new ConcurrentHashMap<>();

    /**
     * Возвращает все существующие игровые сессии.
     * Используется контроллером для фильтрации доступных комнат (Lobby).
     */
    public Map<String, GameSession> getAllGames() {
        return this.games;
    }

    /**
     * Создание новой комнаты игроком 1.
     */
    public GameSession createGame(String playerId) {
        GameSession session = new GameSession(playerId);
        games.put(session.getId(), session);
        return session;
    }

    /**
     * Подключение игрока 2 к созданной комнате.
     */
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

    /**
     * Обработка хода игрока.
     */
    public GameSession makeMove(String gameId, String playerId, int col) {
        GameSession session = games.get(gameId);

        // 1. Проверяем, существует ли игра, активна ли она
        if (session == null || session.isGameOver() || !"PLAYING".equals(session.getStatus())) {
            return session;
        }

        // 2. Валидация корректности колонки (индексы от 0 до 6)
        if (col < 0 || col > 6) {
            return session;
        }

        int[][] grid = session.getBoard().getGrid();

        // 3. Валидация на переполнение колонки (если верхняя ячейка уже занята)
        if (grid[0][col] != 0) {
            return session;
        }

        // 4. Проверяем, чей сейчас ход согласно логике бэкенда и фронтенда
        boolean isPlayer1 = playerId.equals(session.getPlayer1Id());
        boolean isPlayer2 = playerId.equals(session.getPlayer2Id());

        if ((session.getCurrentTurn() == 1 && !isPlayer1) || (session.getCurrentTurn() == 2 && !isPlayer2)) {
            return session; // Ход не текущего игрока, игнорируем запрос
        }

        int playerMark = session.getCurrentTurn();

        // 5. Логика Connect 4: ищем самую нижнюю пустую ячейку (0) в выбранной колонке
        for (int row = 5; row >= 0; row--) {
            if (grid[row][col] == 0) {
                grid[row][col] = playerMark;

                // Проверяем, привел ли этот ход к завершению игры (победа или ничья)
                checkWinCondition(session, playerMark);

                // Если игра НЕ завершена, передаем ход следующему игроку
                if (!session.isGameOver()) {
                    session.setCurrentTurn(playerMark == 1 ? 2 : 1);
                }
                break;
            }
        }

        return session;
    }

    /**
     * Алгоритм проверки условий победы (4 в ряд) и ничьей.
     */
    private void checkWinCondition(GameSession session, int playerMark) {
        int[][] grid = session.getBoard().getGrid();

        // 1. Поиск четырех фишек в ряд по всей сетке 6x7
        for (int r = 0; r < 6; r++) {
            for (int c = 0; c < 7; c++) {
                // Если ячейка не принадлежит текущему игроку, проверять от неё ряды нет смысла
                if (grid[r][c] != playerMark) continue;

                // Горизонталь вправо
                if (c + 3 < 7 && grid[r][c+1] == playerMark && grid[r][c+2] == playerMark && grid[r][c+3] == playerMark) {
                    setWinner(session, playerMark);
                    return;
                }
                // Вертикаль вниз
                if (r + 3 < 6 && grid[r+1][c] == playerMark && grid[r+2][c] == playerMark && grid[r+3][c] == playerMark) {
                    setWinner(session, playerMark);
                    return;
                }
                // Диагональ вниз-вправо
                if (r + 3 < 6 && c + 3 < 7 && grid[r+1][c+1] == playerMark && grid[r+2][c+2] == playerMark && grid[r+3][c+3] == playerMark) {
                    setWinner(session, playerMark);
                    return;
                }
                // Диагональ вверх-вправо
                if (r - 3 >= 0 && c + 3 < 7 && grid[r-1][c+1] == playerMark && grid[r-2][c+2] == playerMark && grid[r-3][c+3] == playerMark) {
                    setWinner(session, playerMark);
                    return;
                }
            }
        }

        // 2. Проверка на ничью (если в самой верхней строчке [0] не осталось пустых мест)
        boolean isDraw = true;
        for (int c = 0; c < 7; c++) {
            if (grid[0][c] == 0) {
                isDraw = false;
                break;
            }
        }

        if (isDraw) {
            session.setGameOver(true);
            session.setStatus("FINISHED");
            session.setWinnerId("DRAW");
        }
    }

    /**
     * Вспомогательный метод фиксации победителя.
     */
    private void setWinner(GameSession session, int playerMark) {
        session.setGameOver(true);
        session.setStatus("FINISHED");
        session.setWinnerId(playerMark == 1 ? session.getPlayer1Id() : session.getPlayer2Id());
    }
}