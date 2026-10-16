import "./shared/uuid.js";
import { StrictMode, Suspense, lazy, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import type { HealthStatus } from "@xiangqi/shared";
import "./shared/styles/global.css";
import "./shared/theme/theme.css";
import { SessionProvider } from "./features/auth/SessionProvider.js";
import { applyTheme, readStoredTheme } from "./shared/theme/theme.js";
import { getApiBaseUrl } from "./shared/api.js";
const AppRouter = lazy(() =>
  import("./app/AppRouter.js").then((module) => ({
    default: module.AppRouter,
  })),
);
import { BoardPreview } from "./shared/board/BoardPreview.js";
import {
  RegistrationPage,
  type RegistrationSession,
} from "./features/auth/RegistrationPage.js";

const ComponentGallery = lazy(() =>
  import("./app/dev/ComponentGallery.js").then((module) => ({
    default: module.ComponentGallery,
  })),
);
const LobbyPreview = lazy(() =>
  import("./app/dev/ComponentGallery.js").then((module) => ({
    default: module.LobbyPreview,
  })),
);
const LoginPage = lazy(() =>
  import("./features/auth/LoginPage.js").then((module) => ({
    default: module.LoginPage,
  })),
);
function LoginPreview() {
  const [received, setReceived] = useState(false);
  return (
    <>
      <LoginPage onLoggedIn={() => setReceived(true)} />
      {received && (
        <p className="registration-session-status" role="status">
          Phiên đăng nhập đã được nhận.
        </p>
      )}
    </>
  );
}

function RegistrationPreview() {
  const [session, setSession] = useState<RegistrationSession | null>(null);
  return (
    <>
      <RegistrationPage onRegistered={setSession} />
      {session && (
        <p className="registration-session-status" role="status">
          Phiên đăng nhập đã được nhận.
        </p>
      )}
    </>
  );
}

function HealthPreview() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const abort = new AbortController();
    fetch(`${getApiBaseUrl()}/health`, {
      signal: abort.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json() as Promise<HealthStatus>;
      })
      .then(setHealth)
      .catch(() => {
        if (!abort.signal.aborted) setFailed(true);
      });
    return () => abort.abort();
  }, []);
  return (
    <main>
      <p>XIANGQI · Môi trường phát triển</p>
      <h1>Nền tảng đã sẵn sàng</h1>
      <p>
        Bộ khung ứng dụng cho nhóm phát triển. Các tính năng chơi cờ đang được
        triển khai.
      </p>
      <section aria-labelledby="health-title" aria-live="polite">
        <h2 id="health-title">Trạng thái dịch vụ</h2>
        {health ? (
          <ul>
            <li>
              Máy chủ:{" "}
              {health.server === "ok" ? "Đang hoạt động" : "Chưa xác minh"}
            </li>
            <li>
              Cơ sở dữ liệu:{" "}
              {health.database === "ok"
                ? "Đang hoạt động"
                : health.database === "error"
                  ? "Chưa thể kết nối"
                  : "Chưa kết nối"}
            </li>
            <li>Máy cờ: Chưa tích hợp</li>
          </ul>
        ) : (
          <p>
            {failed ? "Chưa thể kết nối máy chủ." : "Đang kiểm tra máy chủ…"}
          </p>
        )}
      </section>
    </main>
  );
}

const previewHealth =
  import.meta.env.DEV && window.location.pathname === "/dev/health";
const previewBoard =
  import.meta.env.DEV && window.location.pathname === "/dev/board";
const previewRegistration =
  import.meta.env.DEV && window.location.pathname === "/dev/register";
const previewUi = import.meta.env.DEV && window.location.pathname === "/dev/ui";
const previewLobby =
  import.meta.env.DEV && window.location.pathname === "/dev/lobby";
const previewLogin =
  import.meta.env.DEV && window.location.pathname === "/dev/login";
if (previewBoard) document.title = "Cờ Tướng Online · Bàn cờ";
if (previewRegistration) document.title = "Cờ Tướng Online · Đăng ký";
if (previewLogin) document.title = "Cờ Tướng Online · Đăng nhập";

applyTheme(
  readStoredTheme(window.localStorage),
  document.documentElement.dataset,
  window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false,
);
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {previewBoard ? (
      <main className="board-preview-page">
        <BoardPreview />
      </main>
    ) : previewRegistration ? (
      <RegistrationPreview />
    ) : previewUi || previewLobby || previewLogin ? (
      <Suspense fallback={<p role="status">Đang tải giao diện…</p>}>
        {previewUi ? (
          <ComponentGallery />
        ) : previewLogin ? (
          <LoginPreview />
        ) : (
          <LobbyPreview />
        )}
      </Suspense>
    ) : previewHealth ? (
      <HealthPreview />
    ) : (
      <SessionProvider>
        <Suspense fallback={<p role="status">Đang tải giao diện…</p>}>
          <AppRouter />
        </Suspense>
      </SessionProvider>
    )}
  </StrictMode>,
);
