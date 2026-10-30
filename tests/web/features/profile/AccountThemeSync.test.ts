// @vitest-environment jsdom
import { createElement } from "react";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AccountThemeSync } from "@web/features/profile/AccountThemeSync.js";
import {
  currentAppliedTheme,
  setAppliedTheme,
} from "@web/shared/theme/useTheme.js";

const mocks = vi.hoisted(() => ({ read: vi.fn() }));
vi.mock("@web/features/profile/theme-client.js", () => ({
  createThemeClient: () => ({ read: mocks.read, save: vi.fn() }),
}));

function mount(userId: string | null = "u1") {
  return render(
    createElement(AccountThemeSync, { userId, authorizedFetch: vi.fn() }),
  );
}

async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  mocks.read.mockReset();
  mocks.read.mockResolvedValue("co-phong");
  setAppliedTheme("co-phong");
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("AccountThemeSync polling", () => {
  it("applies a change made on another device at the next poll", async () => {
    mount();
    await advance(0);
    expect(currentAppliedTheme()).toBe("co-phong");

    mocks.read.mockResolvedValue("paper-light");
    await advance(5000);
    expect(currentAppliedTheme()).toBe("paper-light");
  });

  it("refreshes immediately when the window regains focus", async () => {
    mount();
    await advance(0);

    mocks.read.mockResolvedValue("system");
    await act(async () => {
      window.dispatchEvent(new Event("focus"));
    });
    await advance(0);
    expect(currentAppliedTheme()).toBe("system");
  });

  it("skips polls while hidden and stops after unmount", async () => {
    const view = mount();
    await advance(0);
    expect(mocks.read).toHaveBeenCalledTimes(1);

    const visibility = vi
      .spyOn(document, "visibilityState", "get")
      .mockReturnValue("hidden");
    await advance(5000);
    expect(mocks.read).toHaveBeenCalledTimes(1);
    visibility.mockRestore();

    view.unmount();
    await advance(20000);
    expect(mocks.read).toHaveBeenCalledTimes(1);
  });

  it("never overlaps reads while one is still in flight", async () => {
    const pending = Promise.withResolvers<string>();
    mount();
    await advance(0);
    mocks.read.mockReturnValueOnce(pending.promise);

    await advance(5000);
    await advance(5000);
    await advance(5000);
    expect(mocks.read).toHaveBeenCalledTimes(2);

    await act(async () => {
      pending.resolve("co-phong");
      await pending.promise;
    });
  });

  it("does not roll back a local save that landed while a read was in flight", async () => {
    const pending = Promise.withResolvers<string>();
    mount();
    await advance(0);
    mocks.read.mockReturnValueOnce(pending.promise);
    await advance(5000);

    // Lưu cục bộ đã được server xác nhận trong lúc GET cũ còn chờ.
    act(() => setAppliedTheme("system"));
    await act(async () => {
      pending.resolve("co-phong");
      await pending.promise;
    });
    expect(currentAppliedTheme()).toBe("system");
  });
});
