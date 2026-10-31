// @vitest-environment jsdom
import { createElement } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { NetworkDemo } from "@web/features/rooms/NetworkDemo.js";

afterEach(cleanup);
it("hides the demo when the server does not grant the capability", () => {
  render(
    createElement(NetworkDemo, {
      enabled: false,
      disconnected: false,
      onDisconnect: vi.fn(),
      onReconnect: vi.fn(),
    }),
  );
  expect(screen.queryByRole("button", { name: /mất mạng/i })).toBeNull();
});
it("offers an explicit reconnect and warns that another tab may still be connected", () => {
  const reconnect = vi.fn();
  render(
    createElement(NetworkDemo, {
      enabled: true,
      disconnected: true,
      onDisconnect: vi.fn(),
      onReconnect: reconnect,
    }),
  );
  fireEvent.focus(screen.getByRole("button", { name: /nối lại/i }));
  expect(screen.getByText(/tab khác/i)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: /nối lại/i }));
  expect(reconnect).toHaveBeenCalledOnce();
});
