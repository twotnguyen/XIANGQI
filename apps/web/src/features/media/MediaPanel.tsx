/**
 * Camera/microphone panel (ISSUE-026).
 *
 * Two independent selectors per player (OFF / opponent only / opponent and
 * spectators), a muted self preview, and rendered remote tracks for the opponent
 * (players) or the public sources a spectator was granted. Spectators get no
 * publish controls, only a local mute toggle.
 */
import React, { useEffect, useRef, useState } from 'react';
import { useMedia } from './useMedia.js';
import { localTrackManager } from './track-manager.js';
import type { RemoteMedia } from './lib/sfu-client.js';
import type { Audience } from '@xiangqi/contracts';

const AUDIENCE_LABELS: Record<Audience, string> = {
  OFF: 'Tắt',
  OPPONENT_ONLY: 'Chỉ đối thủ',
  OPPONENT_AND_SPECTATORS: 'Đối thủ và người xem',
};

interface MediaPanelProps {
  roomId: string | null;
  matchId: string | null;
  isPlayer: boolean;
}

function participantLabel(media: RemoteMedia, isPlayer: boolean): string {
  if (!isPlayer) return media.audience === 'WATCH' ? 'Người chơi' : 'Đối thủ';
  return media.audience === 'PRIVATE' ? 'Đối thủ' : 'Khán giả xem';
}

function RemoteVideoTile({ media, isPlayer }: { media: RemoteMedia; isPlayer: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;
    media.track.attach(element);
    void element.play().catch(() => undefined);
    return () => {
      media.track.detach(element);
    };
  }, [media]);

  return (
    <figure style={{ margin: 0, width: '160px' }} data-testid={`remote-video-${media.participantIdentity}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: '160px', height: '120px', backgroundColor: '#000', borderRadius: '4px', objectFit: 'cover' }}
      />
      <figcaption style={{ fontSize: '11px', color: '#555', textAlign: 'center' }}>
        {participantLabel(media, isPlayer)}
      </figcaption>
    </figure>
  );
}

function RemoteAudioSink({ media, muted }: { media: RemoteMedia; muted: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const element = audioRef.current;
    if (!element) return;
    media.track.attach(element);
    void element.play().catch(() => undefined);
    return () => {
      media.track.detach(element);
    };
  }, [media]);

  return <audio ref={audioRef} autoPlay muted={muted} data-testid={`remote-audio-${media.participantIdentity}`} />;
}

export function MediaPanel({ roomId, matchId, isPlayer }: MediaPanelProps) {
  const {
    cameraScope,
    micScope,
    ownPolicy,
    policies,
    remote,
    status,
    applying,
    mediaUnavailable,
    error,
    updatePolicy,
  } = useMedia(roomId, matchId, isPlayer);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(false);

  const remoteCameras = remote.filter((media) => media.source === 'camera');
  const remoteAudios = remote.filter((media) => media.source === 'microphone');
  const opponent = policies.find((policy) => policy.userId !== ownPolicy?.userId);

  // Self preview is always muted: the local source must never echo back.
  useEffect(() => {
    const element = localVideoRef.current;
    if (!element) return;
    element.srcObject = localTrackManager.getStream('camera');
  }, [cameraScope, status]);

  if (!roomId || !matchId) return null;

  return (
    <div
      style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '12px', backgroundColor: '#fff', margin: '12px 0' }}
      data-testid="media-panel"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '14px', color: '#28221C' }}>📹 Video &amp; Âm thanh</h4>
        <span style={{ fontSize: '11px', color: '#666' }} data-testid="media-status">
          {applying || ownPolicy?.status === 'APPLYING' || mediaUnavailable
            ? 'Đang ngừng chia sẻ / đang áp dụng...'
            : status === 'LIVE'
              ? 'Đã kết nối'
              : status === 'CONNECTING'
                ? 'Đang kết nối...'
                : status === 'ERROR'
                  ? 'Mất kết nối'
                  : ''}
        </span>
      </div>

      {error && (
        <div role="alert" style={{ color: '#DC3545', fontSize: '12px', marginBottom: '8px' }}>
          {error}
        </div>
      )}

      {/* Media tiles: own muted preview + rendered remote tracks */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {isPlayer ? (
          cameraScope !== 'OFF' ? (
            <figure style={{ margin: 0, width: '160px' }}>
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '160px', height: '120px', backgroundColor: '#000', borderRadius: '4px', objectFit: 'cover' }}
                data-testid="local-video-preview"
              />
              <figcaption style={{ fontSize: '11px', color: '#555', textAlign: 'center' }}>Bạn (không tiếng)</figcaption>
            </figure>
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
          )
        ) : null}

        {remoteCameras.map((media) => (
          <RemoteVideoTile key={media.key} media={media} isPlayer={isPlayer} />
        ))}

        {remoteCameras.length === 0 && isPlayer && cameraScope === 'OFF' ? (
          <div style={{ fontSize: '12px', color: '#888', alignSelf: 'center' }}>
            Chưa nhận được hình từ đối thủ
          </div>
        ) : null}
      </div>

      {remoteAudios.map((media) => (
        <RemoteAudioSink key={media.key} media={media} muted={muted} />
      ))}

      {(remoteAudios.length > 0 || remoteCameras.length > 0) && (
        <button
          type="button"
          onClick={() => setMuted((value) => !value)}
          style={{ fontSize: '12px', padding: '4px 10px', marginBottom: '8px' }}
          data-testid="media-mute-toggle"
        >
          {muted ? '🔇 Bật âm thanh' : '🔊 Tắt âm thanh'}
        </button>
      )}

      {/* Players control their own sources; spectators never publish. */}
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
              onChange={(event) => void updatePolicy('CAMERA', event.target.value as Audience)}
              style={{ fontSize: '12px', padding: '4px 8px' }}
            >
              {(Object.keys(AUDIENCE_LABELS) as Audience[]).map((value) => (
                <option key={value} value={value}>
                  {AUDIENCE_LABELS[value]}
                </option>
              ))}
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
              onChange={(event) => void updatePolicy('MICROPHONE', event.target.value as Audience)}
              style={{ fontSize: '12px', padding: '4px 8px' }}
            >
              {(Object.keys(AUDIENCE_LABELS) as Audience[]).map((value) => (
                <option key={value} value={value}>
                  {AUDIENCE_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
          Bạn đang xem với tư cách khán giả: chỉ nhận nguồn mà người chơi chia sẻ công khai, không có quyền phát.
          {opponent?.status === 'APPLYING' ? ' Người chơi đang cập nhật quyền chia sẻ.' : ''}
        </p>
      )}
    </div>
  );
}
