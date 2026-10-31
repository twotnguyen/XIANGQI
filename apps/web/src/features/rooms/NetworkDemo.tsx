import { Button, Tooltip } from "../../shared/ui/primitives.js";

export function NetworkDemo({
  enabled,
  disconnected,
  onDisconnect,
  onReconnect,
}: {
  enabled: boolean;
  disconnected: boolean;
  onDisconnect: () => void;
  onReconnect: () => void;
}) {
  if (!enabled) return null;
  return (
    <Tooltip text="Demo chỉ ngắt kết nối tab này. Tab khác còn kết nối có thể khiến người chơi chưa mất mạng.">
      <Button
        variant="secondary"
        onClick={disconnected ? onReconnect : onDisconnect}
      >
        {disconnected ? "Nối lại" : "Giả lập mất mạng"}
      </Button>
    </Tooltip>
  );
}
