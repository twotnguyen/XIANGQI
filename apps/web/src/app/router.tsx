import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { createInitialPosition, getLegalMoves } from '@xiangqi/game-rules';
import { Board } from '../components/board/Board.js';
import { Login } from '../features/auth/Login.js';
import { Register } from '../features/auth/Register.js';
import { Callback } from '../features/auth/Callback.js';
import { ResetPassword } from '../features/auth/ResetPassword.js';
import { Onboarding } from '../features/auth/Onboarding.js';
import { Friends } from '../features/friends/Friends.js';
import { Lobby } from '../features/lobby/Lobby.js';
import { RoomWaiting } from '../features/room/RoomWaiting.js';
import { JoinRedirect } from '../features/auth/JoinRedirect.js';
import { MatchPage } from '../features/match/MatchPage.js';
import { NewAiMatch } from '../features/ai/NewAiMatch.js';
import { HistoryList } from '../features/history/HistoryList.js';
import { MatchReplay } from '../features/history/MatchReplay.js';
import type { Move, Side } from '@xiangqi/contracts';

function Home() {
  return (
    <main style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', textAlign: 'center' }}>
      <h1>Cờ Tướng Online</h1>
      <p>Chào mừng đến với ứng dụng cờ tướng trực tuyến.</p>
      <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <a href="/login">Đăng nhập</a>
        <a href="/register">Đăng ký</a>
        <a href="/dev/board">Bàn cờ thử nghiệm</a>
      </div>
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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<Callback />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/rooms/:id" element={<RoomWaiting />} />
        <Route path="/matches/:id" element={<MatchPage />} />
        <Route path="/matches/:id/replay" element={<MatchReplay />} />
        <Route path="/history" element={<HistoryList />} />
        <Route path="/ai/new" element={<NewAiMatch />} />
        <Route path="/join" element={<JoinRedirect />} />
        <Route path="/dev/board" element={<DevBoard />} />
      </Routes>
    </BrowserRouter>
  );
}
