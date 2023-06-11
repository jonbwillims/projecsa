document.addEventListener('DOMContentLoaded', () => {
  const socket = new WebSocket('ws://localhost:3000');

  socket.addEventListener('open', () => {
    console.log('Connected to the server');
  });

  socket.addEventListener('message', (event) => {
    // Process the received message from the server
    handleServerMessage(JSON.parse(event.data));
  });

  function sendMove(row, col) {
    const move = {
      row,
      col,
      currentPlayer
    };
    socket.send(JSON.stringify(move));
  }

  function handleServerMessage(message) {
    if (message.type === 'move') {
      const { row, col } = message.move;
      if (currentPlayer === 'X') {
        board[row][col] = 'X';
        cells[row * 6 + col].textContent = 'X';
      } else {
        board[row][col] = 'O';
        cells[row * 6 + col].textContent = 'O';
      }
      checkWin(row, col, currentPlayer);
      currentPlayer = (currentPlayer === 'X') ? 'O' : 'X';
    } else if (message.type === 'gameover') {
      alert('Player ' + message.winner + ' wins!');
      resetGame();
    } else if (message.type === 'reset') {
      resetGame();
    }
  }

  const board = [
    ['', '', '', '', '', ''],
    ['', '', '', '', '', ''],
    ['', '', '', '', '', ''],
    ['', '', '', '', '', ''],
    ['', '', '', '', '', ''],
    ['', '', '', '', '', ''],
  ];
  function activateDestroyer() {
    const playerSign = currentPlayer === 'X' ? 'X' : 'O';
  
    // Get the row index from the user
    const rowIndex = prompt('Enter the row index (0-5) to destroy:');
  
    // Validate the user input
    const row = parseInt(rowIndex);
    if (isNaN(row) || row < 0 || row > 5) {
      alert('Invalid row index. Please enter a number between 0 and 5.');
      return;
    }
  
    // Check if the selected row is empty
    let isEmptyRow = true;
    for (let col = 0; col < 6; col++) {
      if (board[row][col] !== '') {
        isEmptyRow = false;
        break;
      }
    }
  
    if (!isEmptyRow) {
      destroyRow(row);
      checkWin(row, 0, playerSign);
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    } else {
      alert('Selected row is already empty. Please choose a different row.');
    }
  }
  
  
  const cells = document.querySelectorAll('.cell');
  let currentPlayer = 'X';
  let tankActive = false;
  let destroyerUsed = false;

  cells.forEach((cell, index) => {
    const row = Math.floor(index / 6);
    const col = index % 6;
  
    cell.addEventListener('click', () => {
      if (board[row][col] === '') {
        if (currentPlayer === 'X') {
          board[row][col] = 'X';
          cell.textContent = 'X';
        } else {
          board[row][col] = 'O';
          cell.textContent = 'O';
        }
  
        if (tankActive) {
          claimSpot(row, col);
          tankActive = false;
        }
  
        if (destroyerUsed) {
          destroyRow(row);
          destroyerUsed = false;
        }
  
        checkWin(row, col, currentPlayer);
  
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      }
    });
  });

  function claimSpot(row, col) {
    for (let i = row; i < row + 3; i++) {
      for (let j = col; j < col + 3; j++) {
        board[i][j] = currentPlayer;
        cells[i * 6 + j].textContent = currentPlayer;
      }
    }
  }

  function destroyRow(row) {
    for (let col = 0; col < 6; col++) {
      board[row][col] = '';
      cells[row * 6 + col].textContent = '';
    }
  }

  function checkWin(row, col, player) {
    if (checkRow(row, player) || checkColumn(col, player) || checkDiagonal(row, col, player)) {
      alert('Player ' + player + ' wins!');
      resetGame();
    }
  }

  function checkRow(row, player) {
    for (let col = 0; col < 6; col++) {
      if (board[row][col] !== player) {
        return false;
      }
    }
    return true;
  }

  function checkColumn(col, player) {
    for (let row = 0; row < 6; row++) {
      if (board[row][col] !== player) {
        return false;
      }
    }
    return true;
  }

  function checkDiagonal(row, col, player) {
    // Check diagonal from top-left to bottom-right
    let diagonalCount = 0;
    for (let i = 0; i < 6; i++) {
      if (row + i < 6 && col + i < 6 && board[row + i][col + i] === player) {
        diagonalCount++;
      } else {
        break;
      }
    }
    if (diagonalCount === 3) {
      return true;
    }

    // Check diagonal from top-right to bottom-left
    diagonalCount = 0;
    for (let i = 0; i < 6; i++) {
      if (row + i < 6 && col - i >= 0 && board[row + i][col - i] === player) {
        diagonalCount++;
      } else {
        break;
      }
    }
    if (diagonalCount === 3) {
      return true;
    }

    return false;
  }

  function resetGame() {
    board.forEach(row => row.fill(''));
    cells.forEach(cell => cell.textContent = '');
    currentPlayer = 'X';
    tankActive = false;
    destroyerUsed = false;
  }

  // Event listener for Tank button
  const tankButton = document.getElementById('tank-button');
  tankButton.addEventListener('click', () => {
    if (!tankActive && !destroyerUsed) {
      tankActive = true;
      tankButton.classList.add('active');
    }
  });

  // Event listener for Destroyer button
  const destroyerButton = document.getElementById('destroyer-button');
  destroyerButton.addEventListener('click', () => {
  if (!tankActive && !destroyerUsed) {
    destroyerUsed = true;
    destroyerButton.classList.add('active');
  }
  });

// Event listener for Zigzag Zap button
const zigzagZapButton = document.getElementById('zigzag-zap-button');
zigzagZapButton.addEventListener('click', () => {
  if (!tankActive && !destroyerUsed) {
    activateZigzagZap();
  }
});

function activateZigzagZap() {
  const playerSign = currentPlayer === 'X' ? 'X' : 'O';

  // Find all cells with the player's sign
  const playerCells = [];
  cells.forEach((cell, index) => {
    if (cell.textContent === playerSign) {
      playerCells.push(index);
    }
  });

  if (playerCells.length >= 2) {
    // Shuffle the positions of the selected cells
    shuffle(playerCells);

    const shuffledValues = playerCells.map((cellIndex) => cells[cellIndex].textContent);

    playerCells.forEach((cellIndex, i) => {
      const randomCell = playerCells[(i + 1) % playerCells.length];

      // Swap the positions of the selected cells
      const temp = cells[cellIndex].textContent;
      cells[cellIndex].textContent = cells[randomCell].textContent;
      cells[randomCell].textContent = temp;

      // Add a class to the swapped cells to trigger the animation
      cells[cellIndex].classList.add('zigzag-zap-animation');
      cells[randomCell].classList.add('zigzag-zap-animation');

      // Remove the animation class after a delay
      setTimeout(() => {
        cells[cellIndex].classList.remove('zigzag-zap-animation');
        cells[randomCell].classList.remove('zigzag-zap-animation');
      }, 1000); // Adjust the delay (in milliseconds) as desired
    });

    // Update the board with shuffled values
    playerCells.forEach((cellIndex, i) => {
      cells[cellIndex].textContent = shuffledValues[i];
    });
  }
}


function shuffle(array) {
  let currentIndex = array.length;
  let temporaryValue, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
const randomMoveButton = document.getElementById('random-move-button');
  randomMoveButton.addEventListener('click', () => {
    if (!tankActive && !destroyerUsed) {
      makeRandomMove();
    }
  });

  function makeRandomMove() {
    const emptyCells = [];
    board.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === '') {
          emptyCells.push({ row: rowIndex, col: colIndex });
        }
      });
    });

    if (emptyCells.length > 0) {
      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      const randomCell = emptyCells[randomIndex];
      const { row, col } = randomCell;

      if (currentPlayer === 'X') {
        board[row][col] = 'X';
        cells[row * 6 + col].textContent = 'X';
      } else {
        board[row][col] = 'O';
        cells[row * 6 + col].textContent = 'O';
      }

      checkWin(row, col, currentPlayer);
      currentPlayer = (currentPlayer === 'X') ? 'O' : 'X';
    }
  }

  // Event listener for Nuclear Bomb button
  const nuclearBombButton = document.getElementById('nuclear-bomb-button');
  nuclearBombButton.addEventListener('click', () => {
    if (!tankActive && !destroyerUsed) {
      activateNuclearBomb();
    }
  });

  function activateNuclearBomb() {
    // Add a class to the board to trigger the animation
    const boardElement = document.querySelector('.board');
    boardElement.classList.add('nuclear-bomb-animation');

    // Clear the board after a delay
    setTimeout(() => {
      resetGame();
      // Remove the animation class
      boardElement.classList.remove('nuclear-bomb-animation');
    }, 2000); // Adjust the delay (in milliseconds) as desired
  }
});
