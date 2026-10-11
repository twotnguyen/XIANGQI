import { StrictMode, Suspense, lazy, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import type { HealthStatus } from "@xiangqi/shared";
import "./style.css";
import { BoardPreview } from "./components/BoardPreview.js";
import {
  RegistrationPage,
  type RegistrationSession,
} from "./auth/RegistrationPage.js";

const ComponentGallery = lazy(() =>
  import("./ui/ComponentGallery.js").then((module) => ({
    default: module.ComponentGallery,
  })),
);
const LobbyPreview = lazy(() =>
  import("./ui/ComponentGallery.js").then((module) => ({
    default: module.LobbyPreview,
  })),
);
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

function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const abort = new AbortController();
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/health`, {
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

const previewBoard = window.location.pathname === "/dev/board";
const previewRegistration = window.location.pathname === "/dev/register";
const previewUi = window.location.pathname === "/dev/ui";
const previewLobby = window.location.pathname === "/dev/lobby";
if (previewBoard) document.title = "Cờ Tướng Online · Bàn cờ";
if (previewRegistration) document.title = "Cờ Tướng Online · Đăng ký";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {previewBoard ? (
      <main className="board-preview-page">
        <BoardPreview />
      </main>
    ) : previewRegistration ? (
      <RegistrationPreview />
    ) : previewUi || previewLobby ? (
      <Suspense fallback={<p role="status">Đang tải giao diện…</p>}>
        {previewUi ? <ComponentGallery /> : <LobbyPreview />}
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
);
