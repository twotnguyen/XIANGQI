import { useCallback, useEffect, useRef, useState } from "react";
import type { Move } from "@xiangqi/xiangqi-core";
import { AiGame, type AiGameSnapshot } from "./AiGame.js";
import { AiSetupDialog, type AiSetupSelection } from "./AiSetupDialog.js";
import { makeAiClient, type AiClient, type AiResponse } from "./ai-client.js";
import {
  connectAi,
  type AiConnection,
  type AiControl,
} from "./ai-socket-client.js";
import { createGameAudio } from "../rooms/game-audio.js";
import type { AuthorizedFetch } from "../rooms/room-client.js";
import type { PublicRoomAuthProof } from "@xiangqi/shared";
import { navigate } from "../../shared/navigation/navigation.js";
import { Button, Dialog } from "../../shared/ui/primitives.js";

type Proof = () => Promise<PublicRoomAuthProof>;
type Api = AiClient;

const unavailable = "Chưa thể kết nối ván với máy. Kiểm tra mạng và thử lại.";
// Server codes meaning the in-memory AI game no longer exists (restart/expiry).
const goneCodes: Record<string, true> = {
  AI_NOT_FOUND: true,
  AI_BOOT_EXPIRED: true,
  AI_GAME_EXPIRED: true,
};

function codeOf(cause: unknown): string | undefined {
  const code = (cause as { code?: unknown } | null)?.code;
  return typeof code === "string" ? code : undefined;
}

/**
 * Tạo ván mới trên server (phe và mức do người chơi chọn) và trả về ID ván server cấp.
 * Mở kết nối socket tạm để lấy quyền điều khiển tab trước khi gọi create.
 */
export async function startAiGame(
  authorizedFetch: AuthorizedFetch,
  getProof: Proof,
  selection: AiSetupSelection,
): Promise<string> {
  const connection = connectAi({
    getProof,
    onControl: () => {},
    onSnapshot: () => {},
    onConnection: () => {},
    onError: () => {},
  });
  try {
    await connection.getControl();
    const client = makeAiClient(authorizedFetch, () => connection.getControl());
    const response = await client.create(selection);
    return response.snapshot.id;
  } finally {
    connection.disconnect();
  }
}

/**
 * Đầu hàng ván còn ACTIVE trước khi rời trang hoặc đăng xuất. Ván đã kết thúc thì không làm gì.
 */
export async function resignActiveAiGame(
  authorizedFetch: AuthorizedFetch,
  getProof: Proof,
  gameId: string,
): Promise<void> {
  const connection = connectAi({
    getProof,
    onControl: () => {},
    onSnapshot: () => {},
    onConnection: () => {},
    onError: () => {},
  });
  try {
    await connection.watch(gameId);
    const client = makeAiClient(authorizedFetch, () => connection.getControl());
    const { snapshot } = await client.read(gameId);
    if (snapshot.status !== "ACTIVE") return;
    await client.resign(gameId, snapshot.version);
  } finally {
    connection.disconnect();
  }
}

/**
 * Trang ván cờ với máy. Toàn bộ trạng thái (vị trí, lượt, undo, kết thúc) lấy từ server;
 * không tìm nước đi cục bộ và không lưu ván trong sessionStorage.
 */
export function AiGamePage({
  gameId,
  authorizedFetch,
  getProof,
}: {
  gameId: string;
  authorizedFetch: AuthorizedFetch;
  getProof: Proof;
}) {
  const [snapshot, setSnapshot] = useState<AiGameSnapshot | null>(null);
  const [control, setControl] = useState<AiControl | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [gone, setGone] = useState(false);
  const [newGameDialog, setNewGameDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const connection = useRef<AiConnection | null>(null);
  const api = useRef<Api | null>(null);
  const audio = useRef<{ unlock(): unknown } | null>(null);
  const alive = useRef(true);
  // Tăng khi kết nối, quyền điều khiển hoặc ván đổi: phản hồi HTTP của epoch cũ bị bỏ.
  const fence = useRef(0);
  // Chỉ bật khi control mới nhất của kết nối hiện tại là controller đúng ván.
  const writable = useRef(false);
  // Chặn gửi trùng: một lệnh ván (move/resign/retry/undo) tại một thời điểm.
  const busy = useRef(false);

  useEffect(() => {
    alive.current = true;
    audio.current = createGameAudio();
    return () => {
      alive.current = false;
      audio.current = null;
    };
  }, []);

  useEffect(() => {
    let live = true;
    let lastControl: AiControl | null = null;
    setSnapshot(null);
    setControl(null);
    setConnected(false);
    setGone(false);
    setLastMove(null);
    setError("");
    const bump = () => {
      fence.current++;
      busy.current = false;
      writable.current = false;
    };
    const apply = (response: AiResponse) => {
      if (!live || !alive.current || response.snapshot.id !== gameId) return;
      setSnapshot((prev) =>
        prev && prev.version > response.snapshot.version
          ? prev
          : response.snapshot,
      );
    };
    const conn = connectAi({
      getProof,
      onControl: (value) => {
        if (!live || !alive.current) return;
        // Đổi generation/kết nối/mode/ván: mọi yêu cầu đang bay của quyền cũ bị vô hiệu.
        if (
          lastControl &&
          (lastControl.generation !== value.generation ||
            lastControl.connectionId !== value.connectionId ||
            lastControl.mode !== value.mode ||
            lastControl.gameId !== value.gameId)
        )
          bump();
        lastControl = value;
        writable.current =
          value.mode === "controller" && value.gameId === gameId;
        setControl(value);
      },
      onSnapshot: apply,
      onConnection: (ready) => {
        if (!live || !alive.current) return;
        if (!ready) {
          bump();
          lastControl = null;
          setControl(null);
        }
        setConnected(ready);
      },
      onError: (message) => {
        if (live && alive.current) setError(message);
      },
    });
    const client = makeAiClient(authorizedFetch, () => conn.getControl());
    connection.current = conn;
    api.current = client;
    conn.watch(gameId).catch(() => {
      if (live && alive.current) setError(unavailable);
    });
    // Đọc lại khi epoch đổi trước khi phản hồi về: không bỏ trống trạng thái ván.
    const load = () => {
      const token = fence.current;
      client.read(gameId).then(
        (response) => {
          if (!live || !alive.current) return;
          if (token !== fence.current) {
            load();
            return;
          }
          apply(response);
        },
        (cause: unknown) => {
          if (!live || !alive.current) return;
          if (token !== fence.current) {
            load();
            return;
          }
          if (goneCodes[codeOf(cause) ?? ""] === true) setGone(true);
          else setError(unavailable);
        },
      );
    };
    load();
    return () => {
      live = false;
      bump();
      connection.current = null;
      api.current = null;
      conn.disconnect();
    };
  }, [gameId, getProof, authorizedFetch]);

  const canControl =
    control?.mode === "controller" && control.gameId === gameId;

  const run = useCallback(
    async (
      work: (client: Api, current: AiGameSnapshot) => Promise<AiResponse>,
    ): Promise<AiResponse | null> => {
      const client = api.current;
      if (
        !snapshot ||
        snapshot.id !== gameId ||
        !client ||
        busy.current ||
        !alive.current
      )
        return null;
      if (!writable.current) {
        setError("Tab này chỉ có thể xem. Tiếp quản để thao tác.");
        return null;
      }
      busy.current = true;
      const token = fence.current;
      setError("");
      try {
        const response = await work(client, snapshot);
        // Phản hồi của epoch cũ (takeover, reconnect, đổi ván, unmount) không được ghi đè.
        if (!alive.current || token !== fence.current) return null;
        if (response.snapshot.id === gameId) {
          setSnapshot((prev) =>
            prev && prev.version > response.snapshot.version
              ? prev
              : response.snapshot,
          );
          void audio.current?.unlock();
        }
        return response;
      } catch (cause) {
        if (alive.current && token === fence.current) {
          if (goneCodes[codeOf(cause) ?? ""] === true) setGone(true);
          else setError(cause instanceof Error ? cause.message : unavailable);
        }
        throw cause;
      } finally {
        if (token === fence.current) busy.current = false;
      }
    },
    [gameId, snapshot],
  );

  const handleMove = useCallback(
    async (move: Move) => {
      const response = await run((client, current) =>
        client.move(current.id, current.version, move),
      );
      if (response && response.snapshot.id === gameId) setLastMove(move);
    },
    [gameId, run],
  );

  const handleResign = useCallback(async () => {
    await run((client, current) => client.resign(current.id, current.version));
  }, [run]);

  const handleRetry = useCallback(async () => {
    const response = await run((client, current) =>
      client.retry(current.id, current.version),
    );
    // ABANDONED tạo ván mới với ID khác: chỉ chuyển sang ván mới khi tab được điều khiển.
    if (
      response &&
      response.snapshot.id !== gameId &&
      response.control.mode === "controller" &&
      alive.current
    )
      navigate(`/ai/${response.snapshot.id}`);
  }, [gameId, run]);

  const handleUndo = useCallback(async () => {
    const response = await run((client, current) =>
      client.undo(current.id, current.version),
    );
    if (response && response.snapshot.id === gameId) setLastMove(null);
  }, [gameId, run]);

  // Lỗi được ném lại để AiSetupDialog giữ level/side và hiện thông báo.
  const handleStart = useCallback(
    async (selection: AiSetupSelection) => {
      setCreating(true);
      setError("");
      try {
        const id = await startAiGame(authorizedFetch, getProof, selection);
        if (!alive.current) return;
        setNewGameDialog(false);
        navigate(`/ai/${id}`);
      } finally {
        if (alive.current) setCreating(false);
      }
    },
    [authorizedFetch, getProof],
  );

  const takeover = useCallback(() => {
    const current = connection.current;
    if (!current) return;
    const token = fence.current;
    current.takeover().catch(() => {
      if (alive.current && token === fence.current) setError(unavailable);
    });
  }, []);

  const requestLeave = useCallback(() => {
    if (snapshot?.status === "ACTIVE") setLeaving(true);
    else navigate("/lobby");
  }, [snapshot]);

  const confirmLeave = useCallback(async () => {
    try {
      const response = await run((client, current) =>
        client.resign(current.id, current.version),
      );
      if (response) navigate("/lobby");
      else if (alive.current) setLeaving(false);
    } catch {
      if (alive.current) setLeaving(false);
    }
  }, [run]);

  if (gone) {
    return (
      <section className="xq-panel xq-stack" role="alert">
        <h1>Đánh với máy</h1>
        <p>
          Ván này không còn trạng thái để tiếp tục. Máy chủ đã khởi động lại
          hoặc ván đã hết hạn.
        </p>
        <div className="xq-ai-actions">
          <Button variant="secondary" onClick={() => navigate("/lobby")}>
            Về Sảnh
          </Button>
          <Button onClick={() => setNewGameDialog(true)}>Ván mới</Button>
        </div>
        {newGameDialog && (
          <AiSetupDialog
            open={newGameDialog}
            pending={creating}
            onClose={() => setNewGameDialog(false)}
            onStart={handleStart}
          />
        )}
      </section>
    );
  }

  if (!snapshot) {
    return <p role="status">{error || "Đang tải ván với máy…"}</p>;
  }

  return (
    <>
      {!canControl && control && (
        <div role="status">
          <p>Ván này đang mở ở tab khác.</p>
          <button type="button" disabled={!connected} onClick={takeover}>
            Chuyển quyền điều khiển về tab này
          </button>
        </div>
      )}
      {error && <p role="alert">{error}</p>}
      <AiGame
        snapshot={snapshot}
        connected={connected}
        canControl={canControl}
        undoRemaining={3 - snapshot.undoUsed}
        lastMove={lastMove}
        onMove={handleMove}
        onResign={handleResign}
        onRetry={handleRetry}
        onUndo={handleUndo}
        onNewGame={() => setNewGameDialog(true)}
        onLobby={requestLeave}
      />
      {newGameDialog && (
        <AiSetupDialog
          open={newGameDialog}
          initial={{
            level: snapshot.level,
            requestedSide: snapshot.requestedSide,
          }}
          pending={creating}
          onClose={() => setNewGameDialog(false)}
          onStart={handleStart}
        />
      )}
      <Dialog
        open={leaving}
        onClose={() => setLeaving(false)}
        title="Rời ván đấu?"
        danger
        onConfirm={() => void confirmLeave()}
        confirmLabel="Đầu hàng và rời ván"
        cancelLabel="Ở lại"
      >
        <p>
          Rời ván sẽ được tính là đầu hàng và thua. Ván đấu với máy không thay
          đổi Elo.
        </p>
      </Dialog>
    </>
  );
}
