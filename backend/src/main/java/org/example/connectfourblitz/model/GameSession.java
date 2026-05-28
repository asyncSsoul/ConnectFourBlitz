package org.example.connectfourblitz.model;

import lombok.Data;
import java.util.UUID;

@Data
public class GameSession {
    private String id;
    private String player1Id;
    private String player2Id;
    private Board board;       // Объект доски, содержащий grid
    private String status;     // "WAITING", "PLAYING", "FINISHED"
    private int currentTurn;   // 1 для player1, 2 для player2
    private boolean gameOver;
    private String winnerId;   // ID игрока или "DRAW"

    public GameSession(String player1Id) {
        this.id = UUID.randomUUID().toString();
        this.player1Id = player1Id;
        this.status = "WAITING";
        this.currentTurn = 1;
        this.gameOver = false;
        this.board = new Board();
    }

    @Data
    public static class Board {
        private int[][] grid; // 6 строк на 7 колонок. 0 - пусто, 1 - игрок 1, 2 - игрок 2

        public Board() {
            this.grid = new int[6][7]; // Java автоматически заполняет массив нулями
        }
    }
}