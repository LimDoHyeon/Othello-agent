function minimax_abpruning(board, player) {
  const MAX_DEPTH = 4;
  const positionWeights = [
    [100, -20, 10, 5, 5, 10, -20, 100],
    [-20, -50, -2, -2, -2, -2, -50, -20],
    [10, -2, 5, 1, 1, 5, -2, 10],
    [5, -2, 1, 0, 0, 1, -2, 5],
    [5, -2, 1, 0, 0, 1, -2, 5],
    [10, -2, 5, 1, 1, 5, -2, 10],
    [-20, -50, -2, -2, -2, -2, -50, -20],
    [100, -20, 10, 5, 5, 10, -20, 100]
  ];

  // Copy the board
  function copyBoard(currBoard) {
    return currBoard.map(row => row.slice());
  }

  // Simulation
  function simulateMove(simBoard, move, currentPlayer) {
    simBoard[move.row][move.col] = currentPlayer;
    const opponent = (currentPlayer === BLACK ? WHITE : BLACK);
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    for (let [dRow, dCol] of directions) {
      let r = move.row + dRow;
      let c = move.col + dCol;
      const piecesToFlip = [];
      // Find continuous opponent pieces
      while (r >= 0 && r < 8 && c >= 0 && c < 8 && simBoard[r][c] === opponent) {
        piecesToFlip.push({ row: r, col: c });
        r += dRow;
        c += dCol;
      }
      // If current player's piece is found in that direction, flip the pieces
      if (piecesToFlip.length > 0 && r >= 0 && r < 8 && c >= 0 && c < 8 && simBoard[r][c] === currentPlayer) {
        for (let pos of piecesToFlip) {
          simBoard[pos.row][pos.col] = currentPlayer;
        }
      }
    }
  }

  // Evaluate the board based on modified positionWeights from the perspective of currentPlayer
  function evaluateBoard(simBoard, currentPlayer) {
    let score = 0;
    const opponent = (currentPlayer === BLACK ? WHITE : BLACK);
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (simBoard[i][j] === currentPlayer) {
          score += positionWeights[i][j];
        } else if (simBoard[i][j] === opponent) {
          score -= positionWeights[i][j];
        }
      }
    }
    return score;
  }

  // Check if game is over to determine 'game over' if neither player has valid moves
  function isGameOver(simBoard) {
    const originalBoard = board;
    board = simBoard;
    const noMoves = (getValidMoves(BLACK).length === 0 && getValidMoves(WHITE).length === 0);
    board = originalBoard;
    return noMoves;
  }

  // Minimax function with Alpha-Beta pruning
  function minimax(simBoard, depth, alpha, beta, maximizingPlayer, currentPlayer) {
    if (depth === 0 || isGameOver(simBoard)) {
      return evaluateBoard(simBoard, currentPlayer);
    }
    if (maximizingPlayer) {
      let maxEval = -Infinity;
      const originalBoard = board;
      board = simBoard;
      const moves = getValidMoves(currentPlayer);
      board = originalBoard;
      if (moves.length === 0) return evaluateBoard(simBoard, currentPlayer);
      for (let move of moves) {
        const newBoard = copyBoard(simBoard);
        simulateMove(newBoard, move, currentPlayer);
        const evalValue = minimax(newBoard, depth - 1, alpha, beta, false, currentPlayer);
        maxEval = Math.max(maxEval, evalValue);
        alpha = Math.max(alpha, evalValue);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      const opponent = (currentPlayer === BLACK ? WHITE : BLACK);
      const originalBoard = board;
      board = simBoard;
      const moves = getValidMoves(opponent);
      board = originalBoard;
      if (moves.length === 0) return evaluateBoard(simBoard, currentPlayer);
      for (let move of moves) {
        const newBoard = copyBoard(simBoard);
        simulateMove(newBoard, move, opponent);
        const evalValue = minimax(newBoard, depth - 1, alpha, beta, true, currentPlayer);
        minEval = Math.min(minEval, evalValue);
        beta = Math.min(beta, evalValue);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  // Main logic - evaluate each valid move with minimax and select the move with the best score
  const validMoves = getValidMoves(player);
  if (validMoves.length === 0) return null;
  let bestMove = null;
  let bestScore = -Infinity;
  const boardCopy = copyBoard(board);
  for (let move of validMoves) {
    const newBoard = copyBoard(boardCopy);
    simulateMove(newBoard, move, player);
    // Remaining depth after the first move is MAX_DEPTH - 1 (i.e., 3)
    const moveScore = minimax(newBoard, MAX_DEPTH - 1, -Infinity, Infinity, false, player);
    if (moveScore > bestScore) {
      bestScore = moveScore;
      bestMove = move;
    }
  }
  return bestMove;
}
