import { useEffect, useRef, useState } from "react";
import { generateUuid } from "../../shared/uuid.js";
import {
  RoomRequestError,
  type RoomClient,
  type RoomEntry,
} from "./room-client.js";
import type { CreateRoomInput } from "./RoomForms.js";

/** Keep an uncertain creation command until the server receipt resolves it. */
export function useRoomCreation(
  client: RoomClient,
  onCreated: (entry: RoomEntry) => void,
) {
  const attempt = useRef<{ input: CreateRoomInput; commandId: string } | null>(
    null,
  );
  const pending = useRef(false);
  const generation = useRef(0);
  const [creating, setCreating] = useState(false);
  const [recoveryInput, setRecoveryInput] = useState<CreateRoomInput | null>(
    null,
  );

  useEffect(() => {
    generation.current++;
    attempt.current = null;
    pending.current = false;
    setCreating(false);
    setRecoveryInput(null);
    return () => {
      generation.current++;
    };
  }, [client]);

  async function create(input: CreateRoomInput) {
    if (pending.current) return;
    const epoch = generation.current;
    const replaying = attempt.current !== null;
    const command = attempt.current ?? {
      input: { ...input },
      commandId: generateUuid(),
    };
    attempt.current = command;
    pending.current = true;
    setCreating(true);
    try {
      const entry = await client.create(command.input, command.commandId);
      if (epoch !== generation.current) return;
      attempt.current = null;
      setRecoveryInput(null);
      onCreated(entry);
    } catch (error) {
      if (epoch !== generation.current) return;
      // A definitive rejection did not create a room. Network/5xx/408 failures
      // may follow a committed creation, so replay the same input and command.
      // Once uncertain, even an auth/rate-limit rejection can precede receipt lookup.
      if (
        !replaying &&
        error instanceof RoomRequestError &&
        error.status >= 400 &&
        error.status < 500 &&
        error.status !== 408
      ) {
        attempt.current = null;
        setRecoveryInput(null);
      } else {
        setRecoveryInput(command.input);
      }
      throw error;
    } finally {
      if (epoch === generation.current) {
        pending.current = false;
        setCreating(false);
      }
    }
  }

  return { create, creating, recoveryInput };
}
