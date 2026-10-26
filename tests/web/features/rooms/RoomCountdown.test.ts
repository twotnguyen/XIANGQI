// @vitest-environment jsdom
import { createElement } from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Countdown } from "@web/features/rooms/RoomCountdown.js";

const serverNow = "2026-10-26T10:00:00.000Z";
const after = (ms: number) =>
  new Date(Date.parse(serverNow) + ms).toISOString();

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function countdown(dueAt: string, sound = vi.fn()) {
  render(createElement(Countdown, { dueAt, serverNow, sound }));
  return sound;
}

describe("room countdown", () => {
  it("starts at the server-derived second and sounds once for it", () => {
    const sound = countdown(after(3000));
    const status = screen.getByRole("status", {
      name: "Đếm ngược bắt đầu ván",
    });
    expect(status.textContent).toContain("Hai bên đã sẵn sàng");
    expect(status.querySelector("strong")?.textContent).toBe("3");
    expect(sound).toHaveBeenCalledTimes(1);
  });

  it("counts down and sounds once per distinct second, then waits for the server", () => {
    const sound = countdown(after(3000));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(
      screen.getByRole("status").querySelector("strong")?.textContent,
    ).toBe("2");
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(
      screen.getByRole("status").querySelector("strong")?.textContent,
    ).toBe("1");
    expect(sound).toHaveBeenCalledTimes(3);
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.getByRole("status").textContent).toBe(
      "Đang chờ máy chủ xác nhận bắt đầu…",
    );
    expect(sound).toHaveBeenCalledTimes(3);
  });

  it("caps the display at three seconds and never goes negative", () => {
    countdown(after(10000));
    expect(
      screen.getByRole("status").querySelector("strong")?.textContent,
    ).toBe("3");
    cleanup();
    const sound = countdown(after(-5000));
    expect(screen.getByRole("status").textContent).toBe(
      "Đang chờ máy chủ xác nhận bắt đầu…",
    );
    expect(sound).not.toHaveBeenCalled();
  });
});
