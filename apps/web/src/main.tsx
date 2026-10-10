import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import type { HealthStatus } from "@xiangqi/shared";
import "./style.css";

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
            <li>Cơ sở dữ liệu: Chưa kết nối</li>
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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
