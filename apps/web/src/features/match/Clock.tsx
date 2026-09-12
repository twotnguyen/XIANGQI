import React, { useState, useEffect } from 'react';
import type { ClockState, Side } from '@xiangqi/contracts';

interface ClockProps {
  clock: ClockState;
  currentTurn: Side;
  serverNowMs: number;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function Clock({ clock, currentTurn }: ClockProps) {
  const [localNow, setLocalNow] = useState(Date.now());

  useEffect(() => {
    if (!clock) return;
    const interval = setInterval(() => {
      setLocalNow(Date.now());
    }, 200);
    return () => clearInterval(interval);
  }, [clock]);

  if (!clock) {
    return (
      <div style={{ textAlign: 'center', color: '#666', fontSize: '14px', margin: '8px 0' }}>
        Thời gian: Không giới hạn
      </div>
    );
  }

  // Calculate local monotonic elapsed since runningSinceEpochMs
  const elapsed = Math.max(0, localNow - clock.runningSinceEpochMs);
  const redRemaining = currentTurn === 'RED' ? Math.max(0, clock.redMs - elapsed) : clock.redMs;
  const blackRemaining = currentTurn === 'BLACK' ? Math.max(0, clock.blackMs - elapsed) : clock.blackMs;

  const isRedLow = redRemaining < 30000;
  const isBlackLow = blackRemaining < 30000;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 16px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        border: '1px solid #ddd',
        margin: '8px 0',
      }}
      data-testid="match-clock"
    >
      <div style={{ textAlign: 'left' }}>
        <span style={{ fontSize: '12px', color: '#A51F25', fontWeight: 'bold' }}>
          ĐỎ {currentTurn === 'RED' && '●'}
        </span>
        <div
          style={{
            fontSize: '20px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            color: isRedLow ? '#DC3545' : '#28221C',
          }}
          data-testid="clock-red"
        >
          {formatTime(redRemaining)}
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <span style={{ fontSize: '12px', color: '#24201C', fontWeight: 'bold' }}>
          {currentTurn === 'BLACK' && '●'} ĐEN
        </span>
        <div
          style={{
            fontSize: '20px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            color: isBlackLow ? '#DC3545' : '#28221C',
          }}
          data-testid="clock-black"
        >
          {formatTime(blackRemaining)}
        </div>
      </div>
    </div>
  );
}
