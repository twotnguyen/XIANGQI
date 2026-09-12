import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase.js';
import { localTrackManager } from './track-manager.js';
import type { MediaScope, MediaTrack, MediaTransportDTO } from '@xiangqi/contracts';

export function useMedia(roomId: string | null, isPlayer: boolean) {
  const [cameraScope, setCameraScope] = useState<MediaScope>('OFF');
  const [micScope, setMicScope] = useState<MediaScope>('OFF');
  const [applying, setApplying] = useState(false);
  const [transports, setTransports] = useState<MediaTransportDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch media session from server
  const fetchSession = useCallback(async () => {
    if (!roomId) return;
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const res = await fetch(`/api/v1/rooms/${roomId}/media/session`, {
        headers: { Authorization: `Bearer ${session?.access_token ?? ''}` },
      });
      const data = await res.json();
      if (data.ok) {
        setTransports(data.data.transports);
      }
    } catch {
      // Non-fatal background fetch
    }
  }, [roomId]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Clean up on unmount: stop all local tracks immediately
  useEffect(() => {
    return () => {
      localTrackManager.stopAll();
    };
  }, []);

  const updatePolicy = async (track: MediaTrack, scope: MediaScope) => {
    if (!roomId || !isPlayer) return;

    setApplying(true);
    setError(null);

    try {
      // 1. Hardware capture handling
      if (scope !== 'OFF') {
        try {
          if (track === 'camera') {
            await localTrackManager.startCamera();
          } else {
            await localTrackManager.startMicrophone();
          }
        } catch {
          setError(`Không thể truy cập ${track === 'camera' ? 'máy ảnh' : 'microphone'}`);
          setApplying(false);
          return;
        }
      } else {
        // Immediate hardware stop on OFF
        if (track === 'camera') localTrackManager.stopCamera();
        else localTrackManager.stopMicrophone();
      }

      // 2. Server policy update
      const session = (await supabase.auth.getSession()).data.session;
      const res = await fetch(`/api/v1/rooms/${roomId}/media/policy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({ track, scope }),
      });

      const data = await res.json();
      if (data.ok) {
        if (track === 'camera') setCameraScope(scope);
        else setMicScope(scope);
        await fetchSession();
      } else {
        setError(data.error?.message ?? 'Cập nhật chính sách thất bại');
      }
    } catch {
      setError('Lỗi kết nối máy chủ');
    } finally {
      setApplying(false);
    }
  };

  return {
    cameraScope,
    micScope,
    applying,
    transports,
    error,
    updatePolicy,
  };
}
