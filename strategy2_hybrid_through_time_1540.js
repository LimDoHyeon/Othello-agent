function hybrid_through_time_1540(board, player) {
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

  // Validate move
  function isValidMove(simBoard, row, col, player) {
    if (simBoard[row][col] !== EMPTY) return false;
    const opponent = player === BLACK ? WHITE : BLACK;
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    for (const [dr, dc] of directions) {
      let r = row + dr;
      let c = col + dc;
      let foundOpponent = false;
      while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && simBoard[r][c] === opponent) {
        foundOpponent = true;
        r += dr;
        c += dc;
      }
      if (foundOpponent && r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && simBoard[r][c] === player) {
        return true;
      }
    }
    return false;
  }

  // Get valid moves from the current board
  function getValidMoves(simBoard, player) {
    const moves = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (simBoard[row][col] === EMPTY && isValidMove(simBoard, row, col, player)) {
          moves.push({ row, col });
        }
      }
    }
    return moves;
  }

  // Simulate a move on a board copy
  function simulateMove(simBoard, row, col, player) {
    simBoard[row][col] = player;
    const opponent = player === BLACK ? WHITE : BLACK;
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    for (const [dr, dc] of directions) {
      let r = row + dr;
      let c = col + dc;
      const piecesToFlip = [];
      while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && simBoard[r][c] === opponent) {
        piecesToFlip.push({ row: r, col: c });
        r += dr;
        c += dc;
      }
      if (piecesToFlip.length > 0 && r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && simBoard[r][c] === player) {
        for (const piece of piecesToFlip) {
          simBoard[piece.row][piece.col] = player;
        }
      }
    }
  }

  // Evaluate the board using positionWeights
  function evaluateBoard(simBoard, player) {
    let score = 0;
    const opponent = player === BLACK ? WHITE : BLACK;
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (simBoard[row][col] === player) {
          score += positionWeights[row][col];
        } else if (simBoard[row][col] === opponent) {
          score -= positionWeights[row][col];
        }
      }
    }
    return score;
  }

  // Minimax search with alpha-beta pruning (depth = 4)
  function minimaxSearch(simBoard, depth, originalPlayer, currentPlayer, maximizingPlayer, alpha, beta) {
    if (depth === 0) {
      return evaluateBoard(simBoard, originalPlayer);
    }
    const moves = getValidMoves(simBoard, currentPlayer);
    if (moves.length === 0) {
      return evaluateBoard(simBoard, originalPlayer);
    }
    if (maximizingPlayer) {
      let maxEval = -Infinity;
      for (const move of moves) {
        const boardCopy = simBoard.map(row => row.slice());
        simulateMove(boardCopy, move.row, move.col, currentPlayer);
        const opponent = currentPlayer === BLACK ? WHITE : BLACK;
        const evalValue = minimaxSearch(boardCopy, depth - 1, originalPlayer, opponent, false, alpha, beta);
        maxEval = Math.max(maxEval, evalValue);
        alpha = Math.max(alpha, evalValue);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        const boardCopy = simBoard.map(row => row.slice());
        simulateMove(boardCopy, move.row, move.col, currentPlayer);
        const opponent = currentPlayer === BLACK ? WHITE : BLACK;
        const evalValue = minimaxSearch(boardCopy, depth - 1, originalPlayer, opponent, true, alpha, beta);
        minEval = Math.min(minEval, evalValue);
        beta = Math.min(beta, evalValue);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  // Count total pieces on the board
  let totalPlaced = 0;
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] !== EMPTY) totalPlaced++;
    }
  }

  // Retrieve list of valid moves
  const validMoves = getValidMoves(board, player);
  if (validMoves.length === 0) return null;
  let bestMove = null;

  // Determine strategy based on game phase
  if (totalPlaced <= 15) {
    // Early game: choose move that minimizes opponent's mobility
    let minOpponentMoves = Infinity;
    for (const move of validMoves) {
      const boardCopy = board.map(row => row.slice());
      simulateMove(boardCopy, move.row, move.col, player);
      const opponent = player === BLACK ? WHITE : BLACK;
      const oppMovesCount = getValidMoves(boardCopy, opponent).length;
      if (oppMovesCount < minOpponentMoves) {
        minOpponentMoves = oppMovesCount;
        bestMove = move;
      }
    }
  } else if (totalPlaced <= 40) {
    // Mid game: choose move that maximizes position weight score
    let bestScore = -Infinity;
    for (const move of validMoves) {
      const boardCopy = board.map(row => row.slice());
      simulateMove(boardCopy, move.row, move.col, player);
      const score = evaluateBoard(boardCopy, player);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
  } else {
    // Late game: use minimax search
    let bestEval = -Infinity;
    let chosenMove = null;
    const depth = 4;
    for (const move of validMoves) {
      const boardCopy = board.map(row => row.slice());
      simulateMove(boardCopy, move.row, move.col, player);
      const opponent = player === BLACK ? WHITE : BLACK;
      const evalValue = minimaxSearch(boardCopy, depth - 1, player, opponent, false, -Infinity, Infinity);
      if (evalValue > bestEval) {
        bestEval = evalValue;
        chosenMove = move;
      }
    }
    bestMove = chosenMove;
  }

  return bestMove;
}
