import { useState, useEffect, useRef, useCallback } from "react";
import {
  initialPosition,
  serializePosition,
  parsePosition,
  playMove,
  ending,
  type Move,
  type Side,
} from "@xiangqi/xiangqi-core";
import { searchPosition } from "@xiangqi/engine";
import { AiGame, type AiGameSnapshot } from "./AiGame.js";
import { AiSetupDialog, type AiSetupSelection } from "./AiSetupDialog.js";
import { createGameAudio } from "../rooms/game-audio.js";
import { navigate } from "../../shared/navigation/navigation.js";

interface AiGameStorage {
  level: "easy" | "medium" | "hard";
  requestedSide: Side | "random";
  actualSide: Side;
  position: string;
  history: string[];
  version: number;
  undoRemaining: number;
  status: "ACTIVE" | "FINALIZING" | "FINISHED" | "ABANDONED";
  outcome: AiGameSnapshot["outcome"];
  lastMove?: Move | null;
}

function findMoveBetween(prevFen: string, currFen: string): Move | null {
  try {
    const prevPos = parsePosition(prevFen);
    const currPos = parsePosition(currFen);
    let from: number | null = null;
    let to: number | null = null;
    for (let i = 0; i < 90; i++) {
      const p = prevPos.board[i];
      const c = currPos.board[i];
      if (p && !c) {
        from = i;
      } else if (c && (!p || p.side !== c.side || p.type !== c.type)) {
        to = i;
      }
    }
    if (from !== null && to !== null) {
      return { from, to };
    }
  } catch {
    return null;
  }
  return null;
}

function storageKey(gameId: string) {
  return `xiangqi_ai_game_${gameId}`;
}

function loadGame(gameId: string): AiGameStorage | null {
  try {
    const raw = sessionStorage.getItem(storageKey(gameId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.position === "string"
    ) {
      return parsed as AiGameStorage;
    }
  } catch {
    /* Ignore corrupt storage */
  }
  return null;
}

function saveGame(gameId: string, data: AiGameStorage) {
  try {
    sessionStorage.setItem(storageKey(gameId), JSON.stringify(data));
  } catch {
    /* Quota or disabled */
  }
}

export function AiGamePage({
  gameId,
  initialSetup,
}: {
  gameId: string;
  initialSetup?: {
    level: "easy" | "medium" | "hard";
    requestedSide: Side | "random";
  };
}) {
  const [snapshot, setSnapshot] = useState<AiGameSnapshot>(() => {
    const saved = loadGame(gameId);
    if (saved) {
      return {
        id: gameId,
        requestedSide: saved.requestedSide,
        actualSide: saved.actualSide,
        level: saved.level,
        position: saved.position,
        history: saved.history,
        version: saved.version,
        status: saved.status,
        engineState: "IDLE",
        engineError: null,
        outcome: saved.outcome,
      };
    }
    const level = initialSetup?.level ?? "easy";
    const requestedSide = initialSetup?.requestedSide ?? "red";
    const actualSide: Side =
      requestedSide === "random"
        ? Math.random() < 0.5
          ? "red"
          : "black"
        : requestedSide;
    const initialFen = serializePosition(initialPosition());
    return {
      id: gameId,
      requestedSide,
      actualSide,
      level,
      position: initialFen,
      history: [initialFen],
      version: 0,
      status: "ACTIVE",
      engineState: "IDLE",
      engineError: null,
      outcome: null,
    };
  });

  const [undoRemaining, setUndoRemaining] = useState<number>(() => {
    const saved = loadGame(gameId);
    return saved?.undoRemaining ?? 3;
  });

  const [lastMove, setLastMove] = useState<Move | null>(() => {
    const saved = loadGame(gameId);
    if (saved?.lastMove) return saved.lastMove;
    if (saved && saved.history && saved.history.length >= 2) {
      return findMoveBetween(
        saved.history[saved.history.length - 2]!,
        saved.history[saved.history.length - 1]!,
      );
    }
    return null;
  });

  const [newGameDialog, setNewGameDialog] = useState(false);
  const audio = useRef<ReturnType<typeof createGameAudio> | null>(null);
  const isThinking = useRef(false);

  useEffect(() => {
    audio.current = createGameAudio();
    return () => {
      audio.current = null;
    };
  }, []);

  // Save on state change
  useEffect(() => {
    saveGame(gameId, {
      level: snapshot.level,
      requestedSide: snapshot.requestedSide,
      actualSide: snapshot.actualSide,
      position: snapshot.position,
      history: snapshot.history,
      version: snapshot.version,
      undoRemaining,
      status: snapshot.status,
      outcome: snapshot.outcome,
      lastMove,
    });
  }, [gameId, snapshot, undoRemaining, lastMove]);

  // Execute AI move when it's AI's turn
  const triggerAiTurn = useCallback((currentSnapshot: AiGameSnapshot) => {
    if (currentSnapshot.status !== "ACTIVE" || isThinking.current) return;

    const pos = parsePosition(currentSnapshot.position);
    if (pos.turn === currentSnapshot.actualSide) return; // Player's turn

    isThinking.current = true;
    setSnapshot((prev) => ({
      ...prev,
      engineState: "THINKING",
      engineError: null,
    }));

    // Tốc độ suy nghĩ tự nhiên của máy cờ (700ms - 1300ms) để người chơi kịp quan sát
    const delay =
      currentSnapshot.level === "easy"
        ? 700 + Math.random() * 200
        : currentSnapshot.level === "medium"
          ? 900 + Math.random() * 250
          : 1200 + Math.random() * 300;

    window.setTimeout(() => {
      try {
        const result = searchPosition({
          position: currentSnapshot.position,
          side: pos.turn,
          level: currentSnapshot.level,
          history: currentSnapshot.history,
        });

        if (result.move) {
          setLastMove(result.move);
          const nextPos = playMove(pos, result.move);
          const nextFen = serializePosition(nextPos);
          const nextHistory = [...currentSnapshot.history, nextFen];
          const gameEnding = ending(nextHistory.map(parsePosition));

          setSnapshot((prev) => ({
            ...prev,
            position: nextFen,
            history: nextHistory,
            version: prev.version + 1,
            engineState: "IDLE",
            engineError: null,
            status: gameEnding ? "FINISHED" : "ACTIVE",
            outcome: gameEnding ?? null,
          }));
          void audio.current?.unlock();
        } else if (result.terminal) {
          setSnapshot((prev) => ({
            ...prev,
            engineState: "IDLE",
            status: "FINISHED",
            outcome: result.terminal,
          }));
        } else {
          setSnapshot((prev) => ({
            ...prev,
            engineState: "IDLE",
          }));
        }
      } catch {
        setSnapshot((prev) => ({
          ...prev,
          engineState: "RETRY",
          engineError: "ENGINE_TIMEOUT",
        }));
      } finally {
        isThinking.current = false;
      }
    }, delay);
  }, []);

  // If player chose Black, AI (Red) moves first!
  useEffect(() => {
    if (
      snapshot.status === "ACTIVE" &&
      snapshot.actualSide === "black" &&
      snapshot.history.length === 1 &&
      snapshot.engineState === "IDLE" &&
      !isThinking.current
    ) {
      triggerAiTurn(snapshot);
    }
  }, [snapshot, triggerAiTurn]);

  // Human player move
  const handleMove = async (move: Move) => {
    if (snapshot.status !== "ACTIVE" || snapshot.engineState !== "IDLE") return;
    const pos = parsePosition(snapshot.position);
    if (pos.turn !== snapshot.actualSide) return;

    let nextPos;
    try {
      nextPos = playMove(pos, move);
    } catch {
      return;
    }

    const nextFen = serializePosition(nextPos);
    const nextHistory = [...snapshot.history, nextFen];
    const gameEnding = ending(nextHistory.map(parsePosition));

    setLastMove(move);

    const nextSnapshot: AiGameSnapshot = {
      ...snapshot,
      position: nextFen,
      history: nextHistory,
      version: snapshot.version + 1,
      engineState: gameEnding ? "IDLE" : "THINKING",
      status: gameEnding ? "FINISHED" : "ACTIVE",
      outcome: gameEnding ?? null,
    };

    setSnapshot(nextSnapshot);
    void audio.current?.unlock();

    if (!gameEnding) {
      triggerAiTurn(nextSnapshot);
    }
  };

  const handleResign = async () => {
    if (snapshot.status !== "ACTIVE") return;
    const aiSide: Side = snapshot.actualSide === "red" ? "black" : "red";
    setSnapshot((prev) => ({
      ...prev,
      status: "FINISHED",
      engineState: "IDLE",
      outcome: { reason: "RESIGN", winner: aiSide },
    }));
  };

  const handleRetry = async () => {
    if (snapshot.status !== "ACTIVE" || snapshot.engineState !== "RETRY")
      return;
    triggerAiTurn(snapshot);
  };

  const handleUndo = async () => {
    if (
      undoRemaining <= 0 ||
      snapshot.status !== "ACTIVE" ||
      snapshot.engineState !== "IDLE"
    )
      return;

    const hist = [...snapshot.history];
    let stepsToRevert = 0;

    if (snapshot.actualSide === "red") {
      // Red: initial(0), red(1), black(2) -> revert 2 steps back to red's turn
      if (hist.length >= 3) {
        stepsToRevert = 2;
      } else if (hist.length === 2) {
        stepsToRevert = 1;
      }
    } else {
      // Black: initial(0), red(1), black(2), red(3) -> revert 2 steps back to black's turn
      if (hist.length >= 4) {
        stepsToRevert = 2;
      } else if (hist.length === 3) {
        stepsToRevert = 1;
      }
    }

    if (stepsToRevert === 0) return;

    const newHistory = hist.slice(0, hist.length - stepsToRevert);
    const restoredFen = newHistory[newHistory.length - 1]!;

    if (newHistory.length >= 2) {
      setLastMove(
        findMoveBetween(newHistory[newHistory.length - 2]!, restoredFen),
      );
    } else {
      setLastMove(null);
    }

    setUndoRemaining((r) => Math.max(0, r - 1));
    setSnapshot((prev) => ({
      ...prev,
      position: restoredFen,
      history: newHistory,
      version: prev.version + 1,
      engineState: "IDLE",
      status: "ACTIVE",
      outcome: null,
    }));
  };

  return (
    <>
      <AiGame
        snapshot={snapshot}
        connected={true}
        canControl={true}
        undoRemaining={undoRemaining}
        lastMove={lastMove}
        onMove={handleMove}
        onResign={handleResign}
        onRetry={handleRetry}
        onUndo={handleUndo}
        onNewGame={() => setNewGameDialog(true)}
        onLobby={() => navigate("/lobby")}
      />
      {newGameDialog && (
        <AiSetupDialog
          open={newGameDialog}
          initial={{
            level: snapshot.level,
            requestedSide: snapshot.requestedSide,
          }}
          onClose={() => setNewGameDialog(false)}
          onStart={async (selection: AiSetupSelection) => {
            setNewGameDialog(false);
            const newId = crypto.randomUUID();
            saveGame(newId, {
              level: selection.level,
              requestedSide: selection.requestedSide,
              actualSide:
                selection.requestedSide === "random"
                  ? Math.random() < 0.5
                    ? "red"
                    : "black"
                  : selection.requestedSide,
              position: serializePosition(initialPosition()),
              history: [serializePosition(initialPosition())],
              version: 0,
              undoRemaining: 3,
              status: "ACTIVE",
              outcome: null,
            });
            navigate(`/ai/${newId}`);
          }}
        />
      )}
    </>
  );
}
