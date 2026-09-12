import React from 'react';
import type { RoomMemberDTO } from '@xiangqi/contracts';

interface SpectatorPanelProps {
  members: RoomMemberDTO[];
}

export function SpectatorPanel({ members }: SpectatorPanelProps) {
  const spectators = members.filter((m) => m.role === 'SPECTATOR');
  const count = spectators.length;
  const isFull = count >= 5;

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '12px',
        backgroundColor: '#fff',
        margin: '12px 0',
      }}
      data-testid="spectator-panel"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0, fontSize: '14px' }}>
          Người xem ({count}/5)
        </h4>
        {isFull && (
          <span
            style={{
              fontSize: '11px',
              backgroundColor: '#DC3545',
              color: '#fff',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: 'bold',
            }}
            data-testid="spectator-full-badge"
          >
            ĐẦY
          </span>
        )}
      </div>

      {spectators.length === 0 ? (
        <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#999' }}>
          Chưa có người xem nào.
        </p>
      ) : (
        <ul style={{ margin: '8px 0 0 0', paddingLeft: '16px', fontSize: '13px' }}>
          {spectators.map((s) => (
            <li key={s.userId}>
              {s.userId.slice(0, 8)}... {s.online ? '🟢' : '⚪'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
