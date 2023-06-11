const express = require('express');
const WebSocket = require('ws');

const app = express();
const server = app.listen(3000, () => {
  console.log('Server started on port 3000');
});

const wss = new WebSocket.Server({ server });

// WebSocket connection handling
wss.on('connection', (ws) => {
  // Handle WebSocket messages from clients
  ws.on('message', (message) => {
    // Process the received message from the client
    handleMessage(ws, message);
  });

  // Handle client disconnections
  ws.on('close', () => {
    handleDisconnect(ws);
  });

  // Send a welcome message to the newly connected client
  ws.send("Welcome to Jim & Wassopie's Tic-Tac-Toe Classic!");
});

// Store the connected clients
const clients = new Set();

// Game state
const gameState = {
  board: [
    ['', '', '', '', '', ''],
    ['', '', '', '', '', ''],
    ['', '', '', '', '', ''],
    ['', '', '', '', '', ''],
    ['', '', '', '', '', ''],
    ['', '', '', '', '', ''],
  ],
  currentPlayer: 'X'
};

// Function to broadcast a message to all connected clients
function broadcast(message) {
  for (const client of clients) {
    client.send(JSON.stringify(message));
  }
}

// Function to handle WebSocket messages from clients
function handleMessage(ws, message) {
  const move = JSON.parse(message);

  // Update the game state
  gameState.board[move.row][move.col] = move.currentPlayer;

  // Send the move to all clients
  broadcast({
    type: 'move',
    move
  });

  // Check for a win
  const player = move.currentPlayer;
  const row = move.row;
  const col = move.col;
  if (checkWin(row, col, player)) {
    // Broadcast the game over message
    broadcast({
      type: 'gameover',
      winner: player
    });
    // Reset the game after a delay
    setTimeout(resetGame, 3000);
  }
}

// Function to handle client disconnections
function handleDisconnect(ws) {
  // Remove the disconnected client from the set
  clients.delete(ws);
}

// Reset the game state
function resetGame() {
  gameState.board.forEach(row => row.fill(''));
  broadcast({ type: 'reset' });
}

