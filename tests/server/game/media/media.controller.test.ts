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

describe("media share controller proof", () => {
  const control = { tabId: TAB, connectionId: "peer", generation: 2 };
  const valid = { roomId: "room-1", level: "ALL", control };
  it("forwards the physical connection and generation", async () => {
    const setShare = vi.fn().mockResolvedValue({ level: "ALL" });
    const controller = new MediaController({ setShare } as never);
    await controller.share(request, valid);
    expect(setShare).toHaveBeenCalledExactlyOnceWith(
      "user-1",
      "room-1",
      "ALL",
      control,
    );
  });
  it.each([
    undefined,
    null,
    {},
    { ...control, tabId: "tab" },
    { ...control, connectionId: "" },
    { ...control, connectionId: "x".repeat(129) },
    { ...control, generation: 0 },
    { ...control, generation: 1.5 },
    { ...control, generation: 2_147_483_648 },
    { ...control, generation: "2" },
  ])("rejects invalid or omitted proof: %j", (proof) => {
    const setShare = vi.fn();
    const controller = new MediaController({ setShare } as never);
    expect(
      rejectedResponse(() =>
        controller.share(request, { ...valid, control: proof }),
      ),
    ).toMatchObject({ code: "MEDIA_INPUT_INVALID" });
    expect(setShare).not.toHaveBeenCalled();
  });
});
