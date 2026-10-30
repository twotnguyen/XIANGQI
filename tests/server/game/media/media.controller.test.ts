import { HttpException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { MediaController } from "@server/game/media/media.controller.js";

const TAB = "3f2b8c1e-9a4d-4e7b-8c2a-1d5e6f7a8b9c";
const request = { userId: "user-1" } as never;

function controllerWith() {
  const tokenFor = vi.fn(async () => ({ token: "t" }));
  const controller = new MediaController({ tokenFor } as never);
  return { controller, tokenFor };
}

function rejectedResponse(run: () => unknown): unknown {
  try {
    run();
  } catch (error) {
    expect(error).toBeInstanceOf(HttpException);
    return (error as HttpException).getResponse();
  }
  throw new Error("expected the token request to be rejected");
}

describe("media token body", () => {
  const valid = { roomId: "room-1", camera: true, mic: false, tabId: TAB };

  it("passes roomId, device flags and the controlling tab id to the service", () => {
    const { controller, tokenFor } = controllerWith();
    controller.token(request, valid);
    expect(tokenFor).toHaveBeenCalledWith(
      "user-1",
      "room-1",
      { camera: true, mic: false },
      TAB,
    );
  });

  it.each([
    ["missing tabId", { ...valid, tabId: undefined }],
    ["non-UUID tabId", { ...valid, tabId: "tab-1" }],
    ["tabId as number", { ...valid, tabId: 7 }],
    ["camera as string", { ...valid, camera: "true" }],
    ["mic missing", { roomId: "room-1", camera: true, tabId: TAB }],
    ["roomId missing", { camera: true, mic: false, tabId: TAB }],
    ["empty body", undefined],
  ])("rejects %s before any token is minted", (_name, body) => {
    const { controller, tokenFor } = controllerWith();
    expect(() => controller.token(request, body)).toThrow(HttpException);
    expect(tokenFor).not.toHaveBeenCalled();
  });

  it("reports MEDIA_INPUT_INVALID for a bad tabId", () => {
    const { controller } = controllerWith();
    const response = rejectedResponse(() =>
      controller.token(request, { ...valid, tabId: "tab-1" }),
    );
    expect(response).toMatchObject({ code: "MEDIA_INPUT_INVALID" });
  });
});
