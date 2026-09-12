import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { createInitialPosition, getLegalMoves } from '@xiangqi/game-rules';
import { Board } from '../components/board/Board.js';
import type { Move, Side } from '@xiangqi/contracts';

function Home() {
  return (
    <main>
      <h1>Cờ Tướng Online</h1>
      <p>Chào mừng đến với ứng dụng cờ tướng trực tuyến.</p>
    </main>
  );
}

function DevBoard() {
  const [position] = useState(createInitialPosition);
  const [orientation, setOrientation] = useState<Side>('RED');
  const [interactive, setInteractive] = useState(true);
  const [lastMove, setLastMove] = useState<Move | null>(null);

  const legalMoves = getLegalMoves(position);

  const handleMove = (move: Move) => {
    // In dev mode, just note the move
    setLastMove(move);
  };

  return (
    <main style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Bàn cờ thử nghiệm</h2>
      <div style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setOrientation((o) => (o === 'RED' ? 'BLACK' : 'RED'))}
        >
          Lật bàn ({orientation})
        </button>
        <button onClick={() => setInteractive((i) => !i)}>
          Tương tác: {interactive ? 'BẬT' : 'TẮT'}
        </button>
      </div>
      <Board
        position={position}
        orientation={orientation}
        interactive={interactive}
        legalMoves={legalMoves}
        onMove={handleMove}
        lastMove={lastMove}
      />
    </main>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dev/board" element={<DevBoard />} />
      </Routes>
    </BrowserRouter>
  );
}
