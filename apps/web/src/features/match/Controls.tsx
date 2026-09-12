import React, { useState } from 'react';

interface ControlsProps {
  disabled: boolean;
  onProposeDraw: () => void;
  onProposeUndo: () => void;
  onResign: () => void;
}

export function Controls({
  disabled,
  onProposeDraw,
  onProposeUndo,
  onResign,
}: ControlsProps) {
  const [confirmResign, setConfirmResign] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        margin: '12px 0',
      }}
      data-testid="match-controls"
    >
      <button
        onClick={onProposeDraw}
        disabled={disabled}
        data-testid="propose-draw-btn"
        style={{ padding: '8px 16px', fontSize: '13px' }}
      >
        Xin hòa
      </button>

      <button
        onClick={onProposeUndo}
        disabled={disabled}
        data-testid="propose-undo-btn"
        style={{ padding: '8px 16px', fontSize: '13px' }}
      >
        Xin đi lại
      </button>

      {confirmResign ? (
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => {
              onResign();
              setConfirmResign(false);
            }}
            style={{
              padding: '8px 12px',
              fontSize: '13px',
              backgroundColor: '#DC3545',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
            }}
            data-testid="confirm-resign-btn"
          >
            Chắc chắn
          </button>
          <button
            onClick={() => setConfirmResign(false)}
            style={{ padding: '8px 12px', fontSize: '13px' }}
          >
            Hủy
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirmResign(true)}
          disabled={disabled}
          data-testid="resign-btn"
          style={{
            padding: '8px 16px',
            fontSize: '13px',
            color: '#DC3545',
          }}
        >
          Đầu hàng
        </button>
      )}
    </div>
  );
}
