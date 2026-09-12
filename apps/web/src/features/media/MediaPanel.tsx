import React, { useRef, useEffect } from 'react';
import { useMedia } from './useMedia.js';
import { localTrackManager } from './track-manager.js';
import type { MediaScope } from '@xiangqi/contracts';

interface MediaPanelProps {
  roomId: string | null;
  isPlayer: boolean;
}

export function MediaPanel({ roomId, isPlayer }: MediaPanelProps) {
  const { cameraScope, micScope, applying, error, updatePolicy } = useMedia(roomId, isPlayer);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Bind local camera stream to preview element
  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localTrackManager.getCameraStream();
    }
  }, [cameraScope]);

  if (!roomId) return null;

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '12px',
        backgroundColor: '#fff',
        margin: '12px 0',
      }}
      data-testid="media-panel"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '14px', color: '#28221C' }}>
          📹 Video & Âm thanh
        </h4>
        {applying && (
          <span style={{ fontSize: '11px', color: '#B45309', fontWeight: 'bold' }}>
            Đang cập nhật...
          </span>
        )}
      </div>

      {error && (
        <div role="alert" style={{ color: '#DC3545', fontSize: '12px', marginBottom: '8px' }}>
          {error}
        </div>
      )}

      {/* Video preview row */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {isPlayer && cameraScope !== 'OFF' ? (
          <div style={{ width: '160px', height: '120px', backgroundColor: '#000', borderRadius: '4px', overflow: 'hidden' }}>
            {/* Own preview MUST be muted to prevent echo loop */}
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              data-testid="local-video-preview"
            />
          </div>
        ) : (
          <div
            style={{
              width: '160px',
              height: '120px',
              backgroundColor: '#eee',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: '#888',
            }}
          >
            Camera đã tắt
          </div>
        )}
      </div>

      {/* Player controls */}
      {isPlayer ? (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <label htmlFor="cam-select" style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
              Chia sẻ camera
            </label>
            <select
              id="cam-select"
              aria-label="Chia sẻ camera"
              value={cameraScope}
              disabled={applying}
              onChange={(e) => updatePolicy('camera', e.target.value as MediaScope)}
              style={{ fontSize: '12px', padding: '4px 8px' }}
            >
              <option value="OFF">Tắt</option>
              <option value="OPPONENT_ONLY">Chỉ đối thủ</option>
              <option value="PUBLIC">Cả khán giả</option>
            </select>
          </div>

          <div>
            <label htmlFor="mic-select" style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
              Chia sẻ mic
            </label>
            <select
              id="mic-select"
              aria-label="Chia sẻ mic"
              value={micScope}
              disabled={applying}
              onChange={(e) => updatePolicy('microphone', e.target.value as MediaScope)}
              style={{ fontSize: '12px', padding: '4px 8px' }}
            >
              <option value="OFF">Tắt</option>
              <option value="OPPONENT_ONLY">Chỉ đối thủ</option>
              <option value="PUBLIC">Cả khán giả</option>
            </select>
          </div>
        </div>
      ) : (
        <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
          Bạn đang xem với tư cách khán giả (chỉ nhận âm thanh và video được phát công khai).
        </p>
      )}
    </div>
  );
}
