package org.example.connectfourblitz.service;

import lombok.extern.slf4j.Slf4j;
import org.example.connectfourblitz.model.GameSession;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
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
        log.info("Создана новая игра. ID: {}, Игрок 1: {}", session.getId(), playerId);
        return session;
    }

    /**
     * Подключение игрока 2 к созданной комнате.
     */
    public GameSession joinGame(String gameId, String playerId) {
        GameSession session = games.get(gameId);
        if (session == null) {
            log.error("Попытка подключения к несуществующей игре с ID: {}", gameId);
            throw new IllegalArgumentException("Игра с ID " + gameId + " не найдена");
        }

        // Если комната ждет игрока и заходит не создатель — подключаем его
        if ("WAITING".equals(session.getStatus()) && !session.getPlayer1Id().equals(playerId)) {
            session.setPlayer2Id(playerId);
            session.setStatus("PLAYING");
            log.info("Игрок 2 [{}] успешно подключился к игре {}. Статус игры: PLAYING", playerId, gameId);
        } else {
            log.warn("Не удалось подключить игрока {} к игре {}. Текущий статус: {}", playerId, gameId, session.getStatus());
        }
        return session;
    }

    /**
     * Обработка хода игрока.
     */
    public GameSession makeMove(String gameId, String playerId, int col) {
        log.info("");
        log.info("=== [ВХОДЯЩИЙ ХОД] ===");
        log.info("ID игры: {}", gameId);
        log.info("Кто пытается ходить (playerId из сокета): [{}]", playerId);

        GameSession session = games.get(gameId);

        if (session == null) {
            log.warn("[ОТКЛОНЕНО]: Сессия игры не найдена в RAM для ID: {}", gameId);
            return null;
        }

        log.info("Текущий статус игры: {}", session.getStatus());
        log.info("Игрок 1 в сессии (создатель): [{}]", session.getPlayer1Id());
        log.info("Игрок 2 в сессии (соперник): [{}]", session.getPlayer2Id());
        log.info("Чей сейчас ход по логике бэка (currentTurn): {}", session.getCurrentTurn());

        // 1. Проверяем статус игры
        if (session.isGameOver() || !"PLAYING".equals(session.getStatus())) {
            log.warn("[ОТКЛОНЕНО]: Игра завершена или статус не PLAYING (сейчас: {})", session.getStatus());
            return session;
        }

        if (session.getPlayer2Id() == null) {
            log.warn("[ОТКЛОНЕНО]: Игрок 2 ещё не подключился (null)!");
            return session;
        }

        // 2. Валидация колонки
        if (col < 0 || col > 6) {
            log.warn("[ОТКЛОНЕНО]: Неверный индекс колонки: {}", col);
            return session;
        }

        int[][] grid = session.getBoard().getGrid();

        // 3. Валидация на переполнение колонки
        if (grid[0][col] != 0) {
            log.warn("[ОТКЛОНЕНО]: Колонка {} уже заполнена!", col);
            return session;
        }

        // 4. Проверяем, чей сейчас ход
        boolean isPlayer1 = playerId.equals(session.getPlayer1Id());
        boolean isPlayer2 = playerId.equals(session.getPlayer2Id());

        log.info("Проверка совпадения ID:");
        log.info("- Это Игрок 1? -> {}", isPlayer1);
        log.info("- Это Игрок 2? -> {}", isPlayer2);

        if ((session.getCurrentTurn() == 1 && !isPlayer1) || (session.getCurrentTurn() == 2 && !isPlayer2)) {
            log.warn("[ОТКЛОНЕНО]: Нарушена очерёдность хода! Ходить должен другой игрок.");
            return session;
        }

        int playerMark = session.getCurrentTurn();
        log.info("[УСПЕХ]: Проверки пройдены. Фишка игрока {} падает в колонку {}", playerMark, col);

        // 5. Логика Connect 4
        for (int row = 5; row >= 0; row--) {
            if (grid[row][col] == 0) {
                grid[row][col] = playerMark;
                checkWinCondition(session, playerMark);

                if (!session.isGameOver()) {
                    session.setCurrentTurn(playerMark == 1 ? 2 : 1);
                    log.info("Ход перешёл к Игроку {}", session.getCurrentTurn());
                } else {
                    log.info("Игра ОКОНЧЕНА! Статус: {}, Победитель: {}", session.getStatus(), session.getWinnerId());
                }
                break;
            }
        }

        log.info("=== [КОНЕЦ ОБРАБОТКИ ХОДА] ===");
        log.info("");
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
            log.info("Зафиксирована НИЧЬЯ в игре {}", session.getId());
        }
    }

    /**
     * Вспомогательный метод фиксации победителя.
     */
    private void setWinner(GameSession session, int playerMark) {
        session.setGameOver(true);
        session.setStatus("FINISHED");
        String winnerId = (playerMark == 1) ? session.getPlayer1Id() : session.getPlayer2Id();
        session.setWinnerId(winnerId);
        log.info("Определен победитель матча! Игра: {}, Выиграл игрок (марк {}): {}", session.getId(), playerMark, winnerId);
    }
}