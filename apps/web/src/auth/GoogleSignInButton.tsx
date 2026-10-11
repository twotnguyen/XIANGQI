import { useEffect, useRef, useState } from "react";
import { Button, Notice } from "../ui/primitives.js";
import {
  googleAvailable,
  googleRequest,
  GoogleRequestError,
  loadGoogleIdentity,
  parseGooglePending,
} from "./google-gis.js";
export function GoogleSignInButton({
  remember,
  onResult,
  onBusyChange,
  disabled = false,
  text = "signin_with",
}: {
  remember: boolean;
  onResult: (result: unknown) => void | Promise<void>;
  onBusyChange?: (busy: boolean) => void;
  disabled?: boolean;
  text?: "signin_with" | "signup_with" | "continue_with";
}) {
  const host = useRef<HTMLDivElement>(null),
    latest = useRef({ remember, onResult, onBusyChange });
  latest.current = { remember, onResult, onBusyChange };
  const [attempt, setAttempt] = useState(0),
    [state, setState] = useState<
      "loading" | "disabled" | "ready" | "sending" | "error"
    >("loading"),
    [error, setError] = useState("");
  useEffect(() => {
    const abort = new AbortController();
    let sent = false,
      expires = 0,
      clickedRemember = latest.current.remember;
    let timer: ReturnType<typeof setTimeout> | undefined;
    host.current?.replaceChildren();
    setError("");
    setState("loading");
    if (disabled) return () => abort.abort();
    queueMicrotask(
      () =>
        void (async () => {
          if (abort.signal.aborted) return;
          try {
            if (!(await googleAvailable(abort.signal))) {
              if (!abort.signal.aborted) setState("disabled");
              return;
            }
            const value = await googleRequest("challenge", {}, abort.signal);
            const challenge = value as {
              nonce?: unknown;
              clientId?: unknown;
              expiresAt?: unknown;
            };
            if (
              typeof challenge?.nonce !== "string" ||
              !/^[0-9a-f]{64}$/.test(challenge.nonce) ||
              typeof challenge.clientId !== "string" ||
              !/^[\w.-]+\.apps\.googleusercontent\.com$/.test(
                challenge.clientId,
              ) ||
              typeof challenge.expiresAt !== "string" ||
              !Number.isFinite(Date.parse(challenge.expiresAt)) ||
              Date.parse(challenge.expiresAt) <= Date.now()
            )
              throw new Error();
            expires = Date.parse(challenge.expiresAt);
            const identity = await loadGoogleIdentity();
            if (abort.signal.aborted || !host.current) return;
            identity.initialize({
              client_id: challenge.clientId,
              nonce: challenge.nonce,
              ux_mode: "popup",
              auto_select: false,
              callback: (response) => {
                if (abort.signal.aborted || sent) return;
                if (Date.now() >= expires) {
                  setError(
                    "Phiên xác thực Google đã hết hạn. Vui lòng thử lại.",
                  );
                  setState("error");
                  return;
                }
                if (
                  typeof response.credential !== "string" ||
                  !response.credential ||
                  response.credential.length > 16384
                ) {
                  setError("Chưa thể xác thực Google. Vui lòng thử lại.");
                  setState("error");
                  return;
                }
                sent = true;
                setState("sending");
                latest.current.onBusyChange?.(true);
                void (async () => {
                  try {
                    const result = await googleRequest(
                      "authenticate",
                      {
                        credential: response.credential,
                        remember: clickedRemember,
                      },
                      abort.signal,
                    );
                    if (abort.signal.aborted) return;
                    if ((result as { kind?: unknown })?.kind === "pending")
                      parseGooglePending(result);
                    else if ((result as { kind?: unknown })?.kind !== "member")
                      throw new Error();
                    await latest.current.onResult(result);
                  } catch (e) {
                    if (!abort.signal.aborted) {
                      setError(
                        e instanceof GoogleRequestError
                          ? e.message
                          : "Chưa thể xác thực Google. Vui lòng thử lại.",
                      );
                      setState("error");
                    }
                  } finally {
                    if (!abort.signal.aborted)
                      latest.current.onBusyChange?.(false);
                  }
                })();
              },
            });
            identity.renderButton(host.current, {
              type: "standard",
              theme: "outline",
              size: "large",
              text,
              locale: "vi",
              width: String(Math.min(320, host.current.clientWidth || 260)),
              click_listener: () => {
                clickedRemember = latest.current.remember;
              },
            });
            setState("ready");
            timer = setTimeout(
              () => {
                if (!abort.signal.aborted && !sent) {
                  setError(
                    "Phiên xác thực Google đã hết hạn. Vui lòng thử lại.",
                  );
                  setState("error");
                }
              },
              Math.max(0, expires - Date.now()),
            );
          } catch (e) {
            if (!abort.signal.aborted) {
              setError(
                e instanceof GoogleRequestError
                  ? e.message
                  : "Chưa thể xác thực Google. Vui lòng thử lại.",
              );
              setState("error");
            }
          }
        })(),
    );
    return () => {
      abort.abort();
      if (sent) latest.current.onBusyChange?.(false);
      if (timer) clearTimeout(timer);
      host.current?.replaceChildren();
    };
  }, [attempt, disabled, text]);
  return (
    <div
      className="xq-stack"
      aria-label="Xác thực Google"
      aria-busy={state === "sending"}
    >
      <div ref={host} hidden={state !== "ready" || disabled} />
      {state === "loading" && !disabled && (
        <p role="status" className="xq-help">
          Đang kiểm tra đăng nhập Google…
        </p>
      )}
      {state === "sending" && <p role="status">Đang xác thực Google…</p>}
      {state === "disabled" && (
        <Button
          variant="secondary"
          disabledReason="Đăng nhập Google chưa sẵn sàng."
        >
          Đăng nhập bằng Google
        </Button>
      )}
      {error && <Notice tone="error" message={error} />}
      {(state === "ready" || state === "error" || state === "disabled") && (
        <Button
          variant="ghost"
          disabled={disabled}
          onClick={() => setAttempt((n) => n + 1)}
        >
          {state === "ready" ? "Xác thực Google lại" : "Thử lại Google"}
        </Button>
      )}
    </div>
  );
}
