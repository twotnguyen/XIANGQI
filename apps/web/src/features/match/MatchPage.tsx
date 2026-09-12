import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase.js';
import { getLegalMoves, isInCheck } from '@xiangqi/game-rules';
import { Board } from '../../components/board/Board.js';
import { Clock } from './Clock.js';
import { Controls } from './Controls.js';
import { useMatch } from './useMatch.js';
import { ChatPanel } from '../chat/ChatPanel.js';
import { MediaPanel } from '../media/MediaPanel.js';
import type { Side } from '@xiangqi/contracts';

export function MatchPage() {
  const { id: matchId } = useParams<{ id: string }>();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    snapshot,
    error,
    isPending,
    makeMove,
    propose,
    respond,
    resign,
  } = useMatch(matchId);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setCurrentUserId(session.user.id);
    });
  }, []);

  if (!snapshot) {
    return (
      <main style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', textAlign: 'center' }}>
        <p>Đang tải ván cờ...</p>
        {error && <p role="alert" style={{ color: '#DC3545' }}>{error}</p>}
      </main>
    );
  }

  // Determine user role and orientation
  const isRed = snapshot.redUserId === currentUserId;
  const isBlack = snapshot.blackUserId === currentUserId;
  const isPlayer = isRed || isBlack;
  const mySide: Side = isRed ? 'RED' : 'BLACK';
  const orientation: Side = isBlack ? 'BLACK' : 'RED'; // Red plays from bottom, Black flips

  const isMyTurn = isPlayer && snapshot.position.turn === mySide;
  const isInteractive = isPlayer && isMyTurn && snapshot.status === 'ACTIVE' && !isPending;

  // Legal moves for current side
  const legalMoves = isInteractive ? getLegalMoves(snapshot.position) : [];

  // Check state
  const inCheckSide = isInCheck(snapshot.position, snapshot.position.turn)
    ? snapshot.position.turn
    : null;

  // Pending proposal from opponent
  const incomingProposal = snapshot.proposal && snapshot.proposal.requesterId !== currentUserId
    ? snapshot.proposal
    : null;

  return (
    <main style={{ maxWidth: '600px', margin: '10px auto', padding: '12px' }}>
      {/* Top bar: status, back button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <button onClick={() => navigate('/lobby')} style={{ padding: '6px 12px', fontSize: '13px' }}>
          ← Sảnh chờ
        </button>
        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
          {snapshot.status === 'ACTIVE'
            ? isMyTurn
              ? 'Lượt của bạn'
              : `Lượt của ${snapshot.position.turn === 'RED' ? 'Đỏ' : 'Đen'}`
            : 'Ván đấu kết thúc'}
        </span>
        <span style={{ fontSize: '12px', color: '#666' }}>
          {isPlayer ? `Bạn cầm quân ${mySide === 'RED' ? 'Đỏ' : 'Đen'}` : 'Đang xem'}
        </span>
      </div>

      {/* Clock */}
      <Clock
        clock={snapshot.clock}
        currentTurn={snapshot.position.turn}
        serverNowMs={snapshot.serverNowMs}
      />

      {/* Error alert */}
      {error && (
        <div role="alert" style={{ color: '#DC3545', margin: '4px 0', textAlign: 'center', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* Check alert */}
      {inCheckSide && snapshot.status === 'ACTIVE' && (
        <div
          style={{
            backgroundColor: '#FFF3CD',
            color: '#856404',
            padding: '6px',
            borderRadius: '4px',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '14px',
            margin: '4px 0',
          }}
          data-testid="check-banner"
        >
          CHIẾU TƯỚNG! Bên {inCheckSide === 'RED' ? 'Đỏ' : 'Đen'} đang bị chiếu!
        </div>
      )}

      {/* Incoming proposal prompt */}
      {incomingProposal && (
        <div
          style={{
            backgroundColor: '#D1ECF1',
            color: '#0C5460',
            padding: '10px',
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            margin: '8px 0',
          }}
          data-testid="proposal-banner"
        >
          <span>Đối thủ xin {incomingProposal.kind === 'DRAW' ? 'hòa' : 'đi lại nước trước'}.</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => respond(incomingProposal.id, true)}
              style={{ backgroundColor: '#28A745', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px' }}
              data-testid="accept-proposal-btn"
            >
              Đồng ý
            </button>
            <button
              onClick={() => respond(incomingProposal.id, false)}
              style={{ padding: '6px 12px', borderRadius: '4px' }}
              data-testid="reject-proposal-btn"
            >
              Từ chối
            </button>
          </div>
        </div>
      )}

      {/* Terminal banner and post-game actions */}
      {snapshot.outcome && (
        <div style={{ margin: '12px 0', textAlign: 'center' }}>
          <div
            style={{
              backgroundColor: snapshot.outcome.winner === mySide ? '#D4EDDA' : '#F8D7DA',
              color: snapshot.outcome.winner === mySide ? '#155724' : '#721C24',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '16px',
              marginBottom: '12px',
            }}
            data-testid="outcome-banner"
          >
            {snapshot.outcome.winner === null
              ? `Hòa! Lý do: ${snapshot.outcome.reason}`
              : snapshot.outcome.winner === mySide
                ? `Bạn đã thắng! (${snapshot.outcome.reason})`
                : `Bạn đã thua! (${snapshot.outcome.reason})`}
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button
              onClick={() => navigate(`/matches/${snapshot.id}/replay`)}
              style={{ padding: '8px 16px', fontSize: '13px', backgroundColor: '#155E75', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              data-testid="view-replay-btn"
            >
              Xem lại ván cờ
            </button>

            {snapshot.mode === 'ONLINE' && snapshot.roomId && (
              <button
                onClick={async () => {
                  const session = (await supabase.auth.getSession()).data.session;
                  await fetch(`/api/v1/rooms/${snapshot.roomId}/rematch`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${session?.access_token ?? ''}`,
                    },
                    body: JSON.stringify({ expectedMatchId: snapshot.id }),
                  });
                }}
                style={{ padding: '8px 16px', fontSize: '13px', backgroundColor: '#A51F25', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                data-testid="rematch-btn"
              >
                Tái đấu (Đổi bên)
              </button>
            )}

            {snapshot.mode === 'AI' && (
              <button
                onClick={() => navigate('/ai/new')}
                style={{ padding: '8px 16px', fontSize: '13px', backgroundColor: '#A51F25', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                data-testid="play-again-ai-btn"
              >
                Chơi ván mới
              </button>
            )}
          </div>
        </div>
      )}

      {/* AI thinking / queued status banner */}
      {snapshot.mode === 'AI' && snapshot.aiState && snapshot.status === 'ACTIVE' && (
        <div
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            backgroundColor: snapshot.aiState.state === 'THINKING' ? '#FEF3C7' : '#E0F2FE',
            color: snapshot.aiState.state === 'THINKING' ? '#92400E' : '#0369A1',
            fontWeight: 'bold',
            fontSize: '14px',
            textAlign: 'center',
            margin: '8px 0',
          }}
          data-testid="ai-status"
        >
          {snapshot.aiState.state === 'THINKING'
            ? '🤖 Máy đang suy nghĩ...'
            : snapshot.aiState.state === 'QUEUED'
              ? '⏳ Máy đang trong hàng đợi tính toán...'
              : 'Lượt của bạn'}
        </div>
      )}

      {/* Board */}
      <Board
        position={snapshot.position}
        orientation={orientation}
        interactive={isInteractive}
        legalMoves={legalMoves}
        onMove={makeMove}
        inCheckSide={inCheckSide}
      />

      {/* Player action controls */}
      {isPlayer && snapshot.status === 'ACTIVE' && (
        <Controls
          disabled={isPending}
          isAiMode={snapshot.mode === 'AI'}
          canUndo={snapshot.ply > 0}
          onProposeDraw={() => propose('DRAW')}
          onProposeUndo={async () => {
            if (snapshot.mode === 'AI') {
              // Call instant undo for AI
              const session = (await supabase.auth.getSession()).data.session;
              await fetch(`/api/v1/matches/${snapshot.id}/commands/undo-ai`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${session?.access_token ?? ''}`,
                },
                body: JSON.stringify({
                  commandId: crypto.randomUUID(),
                  expectedVersion: snapshot.version,
                  payload: {},
                }),
              });
            } else {
              propose('UNDO');
            }
          }}
          onResign={resign}
        />
      )}

      {/* Media camera/mic panel */}
      {snapshot.roomId && (
        <MediaPanel roomId={snapshot.roomId} isPlayer={isPlayer} />
      )}

      {/* Room chat */}
      {snapshot.roomId && (
        <ChatPanel roomId={snapshot.roomId} />
      )}
    </main>
  );
}
