import type { ReactNode } from "react";
import "../../shared/styles/tokens.css";
import "../../shared/ui/ui.css";
import "./auth-shell.css";

export interface AuthFeature {
  icon: string;
  title: string;
  text: string;
}

/** Khung xác thực chung, giữ biểu mẫu riêng biệt với phần giới thiệu kỳ đài. */
export function AuthShell({
  slogan,
  features,
  children,
  spread = false,
}: {
  slogan: string;
  features: readonly AuthFeature[];
  children: ReactNode;
  spread?: boolean;
}) {
  return (
    <main className="auth-shell xq-ui">
      <div className="master-modal">
        <div className="wing-brand">
          <div className="brand-hero">
            <div className="token-3d" aria-hidden="true">
              <span className="token-char">帥</span>
            </div>
            <div className="brand-title-wrap">
              <p className="hero-title">CỜ TƯỚNG ONLINE</p>
              <span className="brand-subtitle-mini">KỲ ĐÀI CỔ PHONG</span>
            </div>
          </div>
          <div className="brand-story">
            <span className="brand-eyebrow">NƠI NHỮNG KỲ THỦ GẶP NHAU</span>
            <p>
              Một bàn cờ.
              <br />
              <em>Vạn cuộc đấu trí.</em>
            </p>
            <span className="brand-description">
              Tìm bạn tâm giao, rèn từng nước cờ và viết tiếp kỳ phổ của riêng
              bạn.
            </span>
          </div>
          <div className="auth-board-art" aria-hidden="true">
            <svg viewBox="0 0 280 310" fill="none">
              <rect x="5" y="5" width="270" height="300" rx="10" />
              <path d="M20 20H260V290H20ZM20 50H260M20 80H260M20 110H260M20 140H260M20 170H260M20 200H260M20 230H260M20 260H260M50 20V140M80 20V140M110 20V140M140 20V140M170 20V140M200 20V140M230 20V140M50 170V290M80 170V290M110 170V290M140 170V290M170 170V290M200 170V290M230 170V290M110 20L170 80M170 20L110 80M110 230L170 290M170 230L110 290" />
              <text x="140" y="159" textAnchor="middle" className="auth-river">
                楚 河 · 漢 界
              </text>
              <g className="auth-art-piece auth-art-piece-red">
                <circle cx="80" cy="80" r="22" />
                <circle cx="80" cy="80" r="17" />
                <text x="80" y="89" textAnchor="middle">
                  帥
                </text>
              </g>
              <g className="auth-art-piece">
                <circle cx="200" cy="200" r="22" />
                <circle cx="200" cy="200" r="17" />
                <text x="200" y="209" textAnchor="middle">
                  馬
                </text>
              </g>
              <g className="auth-art-piece auth-art-piece-red">
                <circle cx="110" cy="260" r="22" />
                <circle cx="110" cy="260" r="17" />
                <text x="110" y="269" textAnchor="middle">
                  炮
                </text>
              </g>
            </svg>
          </div>
          <p className="hero-slogan">{slogan}</p>
          {features.length > 0 && (
            <div className="feat-grid">
              {features.map((feature) => (
                <div className="feat-box" key={feature.title}>
                  <div className="feat-ico" aria-hidden="true">
                    {feature.icon}
                  </div>
                  <div className="feat-desc">
                    <strong>{feature.title}</strong>
                    <p>{feature.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="brand-foot">
            <span>Đồ án 2026 · HUTECH</span>
            <span>Cờ hay, bạn hữu</span>
          </div>
        </div>
        <div className={`wing-form${spread ? " wing-form-spread" : ""}`}>
          {children}
        </div>
      </div>
    </main>
  );
}
/**
 * Biểu tượng logo màu SVG 4 màu của Google.
 */
export function GoogleMark() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}
