import "./shared/uuid.js";
import { StrictMode, Suspense, lazy, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import type { HealthStatus } from "@xiangqi/shared";
import "./shared/styles/global.css";
import "./shared/theme/theme.css";
import { SessionProvider } from "./features/auth/SessionProvider.js";
import { getApiBaseUrl } from "./shared/api.js";
import { LoadingScreen } from "./shared/ui/primitives.js";
import { getPieceStyle, setPieceStyle } from "./shared/preferences.js";
import { startBackgroundMusic } from "./shared/background-music.js";
const AppRouter = lazy(() =>
  import("./app/AppRouter.js").then((module) => ({
    default: module.AppRouter,
  })),
);
import type { RegistrationSession } from "./features/auth/RegistrationPage.js";

const BoardPreview = lazy(() =>
  import("./shared/board/BoardPreview.js").then((module) => ({
    default: module.BoardPreview,
  })),
);
const RegistrationPage = lazy(() =>
  import("./features/auth/RegistrationPage.js").then((module) => ({
    default: module.RegistrationPage,
  })),
);

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
/**
 * Component xem trước màn hình đăng nhập phục vụ phát triển (/dev/login).
 */
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

/**
 * Component xem trước màn hình đăng ký tài khoản phục vụ phát triển (/dev/register).
 */
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

/**
 * Component kiểm tra và hiển thị trạng thái hoạt động của server và database (/dev/health).
 */
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

function AudioRuntime() {
  useEffect(() => startBackgroundMusic(), []);
  return null;
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

setPieceStyle(getPieceStyle());
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {previewBoard ? (
      <Suspense fallback={<LoadingScreen />}>
        <main className="board-preview-page">
          <BoardPreview />
        </main>
      </Suspense>
    ) : previewRegistration ? (
      <Suspense fallback={<LoadingScreen />}>
        <RegistrationPreview />
      </Suspense>
    ) : previewUi || previewLobby || previewLogin ? (
      <Suspense fallback={<LoadingScreen />}>
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
        <AudioRuntime />
        <Suspense fallback={<LoadingScreen />}>
          <AppRouter />
        </Suspense>
      </SessionProvider>
    )}
  </StrictMode>,
);
