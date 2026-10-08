import React, { useState, useEffect, useMemo } from 'react';
import './App.css';

const BOARD_SIZE = 8;
const PLAYER_B = 'B';
const PLAYER_W = 'W';

const DIRECTIONS = [
  [-1, 0], [1, 0], [0, -1], [0, 1],
  [-1, -1], [-1, 1], [1, -1], [1, 1]
];

function App() {
  const [board, setBoard] = useState(() => 
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  );
  // Randomize starting player
  const [currentPlayer, setCurrentPlayer] = useState(() => Math.random() < 0.5 ? PLAYER_B : PLAYER_W);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);

  const scores = useMemo(() => {
    let black = 0;
    let white = 0;
    board.forEach(row => {
      row.forEach(cell => {
        if (cell === PLAYER_B) black++;
        if (cell === PLAYER_W) white++;
      });
    });
    return { black, white };
  }, [board]);

  useEffect(() => {
    // Check if board is full
    if (scores.black + scores.white === BOARD_SIZE * BOARD_SIZE) {
      setGameOver(true);
      if (scores.black > scores.white) setWinner(PLAYER_B);
      else if (scores.white > scores.black) setWinner(PLAYER_W);
      else setWinner('DRAW');
    }
  }, [scores]);

  useEffect(() => {
    if (gameOver) return;
    
    if (timeLeft === 0) {
      setCurrentPlayer(prev => prev === PLAYER_B ? PLAYER_W : PLAYER_B);
      setTimeLeft(15);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameOver]);

  const handleCellClick = (r, c) => {
    if (gameOver || board[r][c] !== null) return;

    // 1. Place newly placed piece
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = currentPlayer;

    // 2. Calculate captures based ONLY on the newly placed piece
    const piecesToFlip = [];

    for (const [dRow, dCol] of DIRECTIONS) {
      let currR = r + dRow;
      let currC = c + dCol;
      const opponentPieces = [];

      while (
        currR >= 0 && currR < BOARD_SIZE &&
        currC >= 0 && currC < BOARD_SIZE
      ) {
        const cell = newBoard[currR][currC];
        if (cell === null) {
          // Empty cell breaks the line
          break;
        } else if (cell !== currentPlayer) {
          // Opponent piece
          opponentPieces.push([currR, currC]);
        } else if (cell === currentPlayer) {
          // Found our own piece. If we have seen opponent pieces continuously, capture!
          if (opponentPieces.length > 0) {
            piecesToFlip.push(...opponentPieces);
          }
          break;
        }
        currR += dRow;
        currC += dCol;
      }
    }

    // 3. Flip the captured pieces (No chain reactions! - piecesToFlip handles only initial captures)
    for (const [flipR, flipC] of piecesToFlip) {
      newBoard[flipR][flipC] = currentPlayer;
    }

    setBoard(newBoard);
    setCurrentPlayer(prev => prev === PLAYER_B ? PLAYER_W : PLAYER_B);
    setTimeLeft(15);
  };

  const restartGame = () => {
    setBoard(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
    setCurrentPlayer(Math.random() < 0.5 ? PLAYER_B : PLAYER_W);
    setGameOver(false);
    setWinner(null);
    setTimeLeft(15);
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1 className="title">Eclipse Grid</h1>
        <p className="subtitle">Strategic 8×8 Board Game</p>
      </div>

      <div className="game-layout">
        <div className="scoreboard">
          <div className={`player-score ${currentPlayer === PLAYER_B && !gameOver ? 'active' : ''}`}>
            <span className="player-label">Black</span>
            <span className="score-value">{scores.black}</span>
          </div>
          <div className="turn-indicator">
            {!gameOver ? (
              <>
                <div>{currentPlayer === PLAYER_B ? 'Black' : 'White'}'s Turn</div>
                <div className="timer" style={{ color: timeLeft <= 5 ? '#ff4b4b' : 'var(--text-highlight)' }}>
                  {timeLeft}s
                </div>
              </>
            ) : (
              <div>Game Over</div>
            )}
          </div>
          <div className={`player-score ${currentPlayer === PLAYER_W && !gameOver ? 'active' : ''}`}>
            <span className="player-label">White</span>
            <span className="score-value">{scores.white}</span>
          </div>
        </div>

        <div className="board-container">
          {board.map((row, r) => 
            row.map((cell, c) => (
              <div 
                key={`${r}-${c}`}
                className={`cell ${cell !== null ? 'occupied' : ''}`}
                onClick={() => handleCellClick(r, c)}
              >
                {cell !== null && (
                  <div className="piece-container">
                    <div className={`piece-inner ${cell === PLAYER_B ? 'is-black' : 'is-white'}`}>
                      <div className="piece-face face-black"></div>
                      <div className="piece-face face-white"></div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-modal">
            <h2 className="game-over-title">Game Over</h2>
            <div className="winner-text">
              {winner === 'DRAW' 
                ? "It's a Draw!" 
                : `${winner === PLAYER_B ? 'Black' : 'White'} Wins!`}
            </div>
            <p>Final Score: {scores.black} - {scores.white}</p>
            <button className="restart-btn" onClick={restartGame}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
