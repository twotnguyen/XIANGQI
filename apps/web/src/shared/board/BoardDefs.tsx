/**
 * Định nghĩa các bộ lọc SVG (shadows, glows, gradients) tạo hiệu ứng gỗ và chiều sâu 3D cho bàn cờ và quân cờ.
 */
export function BoardDefs({
  clipId,
  pieceShadowId,
  pieceLiftedShadowId,
  selectedGlowId,
  boardFrameId,
  woodId,
  pieceWoodId,
  pieceRimId,
  pieceGrooveId,
}: {
  clipId: string;
  pieceShadowId: string;
  pieceLiftedShadowId: string;
  selectedGlowId: string;
  boardFrameId: string;
  woodId: string;
  pieceWoodId: string;
  pieceRimId: string;
  pieceGrooveId: string;
}) {
  return (
    <defs>
      <clipPath id={clipId}>
        <rect width="368" height="408" />
      </clipPath>

      {/* Bóng đổ chân thực dưới quân cờ */}
      <filter id={pieceShadowId} x="-35%" y="-30%" width="170%" height="175%">
        <feDropShadow
          dx="0"
          dy="1.0"
          stdDeviation="0.8"
          floodColor="#180b03"
          floodOpacity="0.35"
        />
        <feDropShadow
          dx="0"
          dy="3.2"
          stdDeviation="2.4"
          floodColor="#2b1405"
          floodOpacity="0.48"
        />
      </filter>

      {/* Bóng đổ khi nhấc nhẹ quân cờ đứng tại chỗ */}
      <filter
        id={pieceLiftedShadowId}
        x="-45%"
        y="-35%"
        width="190%"
        height="190%"
      >
        <feDropShadow
          dx="0"
          dy="1.5"
          stdDeviation="1.5"
          floodColor="#180b03"
          floodOpacity="0.3"
        />
        <feDropShadow
          dx="0"
          dy="4.5"
          stdDeviation="3.0"
          floodColor="#261204"
          floodOpacity="0.45"
        />
      </filter>

      {/* Vầng sáng mềm mại khi chọn quân */}
      <filter id={selectedGlowId} x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow
          dx="0"
          dy="0"
          stdDeviation="3.2"
          floodColor="#ffffff"
          floodOpacity="0.95"
        />
      </filter>

      {/* Khung viền gỗ bên ngoài bàn cờ */}
      <linearGradient id={boardFrameId} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#b4834b" />
        <stop offset="45%" stopColor="#8d5b27" />
        <stop offset="100%" stopColor="#5d3913" />
      </linearGradient>

      {/* Vân gỗ mặt bàn cờ tự nhiên ấm áp */}
      <linearGradient id={woodId} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#eed5af" />
        <stop offset="25%" stopColor="#e3c293" />
        <stop offset="50%" stopColor="#ecd5b1" />
        <stop offset="75%" stopColor="#dec08f" />
        <stop offset="100%" stopColor="#d5af77" />
      </linearGradient>

      {/* Thân gỗ tự nhiên của quân cờ tròn 3D */}
      <radialGradient id={pieceWoodId} cx="38%" cy="34%" r="66%">
        <stop offset="0%" stopColor="#fff8ea" />
        <stop offset="20%" stopColor="#fae7c4" />
        <stop offset="55%" stopColor="#ebd2a2" />
        <stop offset="85%" stopColor="#d9b178" />
        <stop offset="100%" stopColor="#bf9053" />
      </radialGradient>

      {/* Viền gờ tròn nổi 3D của quân cờ */}
      <linearGradient id={pieceRimId} x1="20%" y1="0%" x2="80%" y2="100%">
        <stop offset="0%" stopColor="#fffaf0" />
        <stop offset="35%" stopColor="#e2bc84" />
        <stop offset="70%" stopColor="#a9763c" />
        <stop offset="100%" stopColor="#754a1d" />
      </linearGradient>

      {/* Đường rãnh chìm tròn đồng tâm của quân cờ */}
      <linearGradient id={pieceGrooveId} x1="30%" y1="0%" x2="70%" y2="100%">
        <stop offset="0%" stopColor="#7c4e1f" stopOpacity="0.85" />
        <stop offset="50%" stopColor="#a57640" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#fff3db" stopOpacity="0.8" />
      </linearGradient>
    </defs>
  );
}
