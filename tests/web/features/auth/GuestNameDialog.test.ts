// @vitest-environment jsdom
import { createElement, Fragment, useState } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { GuestNameDialog } from "@web/features/auth/GuestNameDialog.js";
import {
  SessionProvider,
  useSession,
} from "@web/features/auth/SessionProvider.js";

const capability = "guest-capability-synthetic-0123456789abcdefghijk";
const guestBody = {
  kind: "guest",
  userId: "guest-user-1",
  displayName: "Lữ khách",
  capability,
  expiresAt: "2030-01-01T12:00:00Z",
  deferred: false,
};
const invalidName = "Tên Khách cần 2–20 ký tự hợp lệ";
const unavailable = "Chưa thể vào chế độ Khách. Vui lòng thử lại.";

let guestPosts: string[] = [];
let guestResponse: () => Response | Promise<Response>;

function reply(body: unknown, status = 200) {
  return new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

// Controlled like the real caller: Huỷ/close flips open to false, which the dialog observes to abort.
function Harness({ onClose }: { onClose: () => void }) {
  const { state } = useSession();
  const [open, setOpen] = useState(true);
  return createElement(
    Fragment,
    null,
    createElement("output", { "aria-label": "state" }, state.status),
    createElement(GuestNameDialog, {
      open,
      onClose: () => {
        setOpen(false);
        onClose();
      },
    }),
  );
}

beforeEach(() => {
  guestPosts = [];
  guestResponse = () => reply({ code: "AUTH_REQUIRED" }, 401);
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
      const url = String(input);
      if (url.endsWith("/account/guest") && init.method === "POST") {
        guestPosts.push(JSON.parse(String(init.body)).displayName);
        return guestResponse();
      }
      // Real readiness document the mount-time refresh reads after a 401: Google off, guest on.
      if (url.endsWith("/auth/providers"))
        return reply({ google: false, guest: true });
      return reply({ code: "AUTH_REQUIRED" }, 401);
    }),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

async function flush() {
  await act(async () => {});
  await act(async () => {});
}

function renderDialog(onClose = vi.fn()) {
  render(
    createElement(SessionProvider, null, createElement(Harness, { onClose })),
  );
  return onClose;
}

async function typeName(value: string) {
  await act(async () => {
    fireEvent.change(screen.getByRole("textbox", { name: "Tên hiển thị" }), {
      target: { value },
    });
  });
}

async function confirm() {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Vào chơi" }));
  });
  await flush();
}

it("rejects a name the client already refuses, showing the rule without a server request", async () => {
  const onClose = renderDialog();
  await typeName("x");
  await confirm();
  expect(guestPosts).toEqual([]);
  await screen.findByText(invalidName);
  expect(onClose).not.toHaveBeenCalled();
  expect(screen.getByLabelText("state").textContent).toBe("anonymous");
});

it("shows the server name rule at the field when the server refuses a client-valid name", async () => {
  guestResponse = () => reply({ code: "GUEST_NAME_INVALID" }, 400);
  const onClose = renderDialog();
  await typeName("Lữ khách");
  await confirm();
  expect(guestPosts).toEqual(["Lữ khách"]);
  await screen.findByText(invalidName);
  expect(onClose).not.toHaveBeenCalled();
  expect(screen.getByLabelText("state").textContent).toBe("anonymous");
});

it("installs the guest and closes exactly once for a valid name", async () => {
  guestResponse = () => reply(guestBody, 201);
  const onClose = renderDialog();
  await typeName("Lữ khách");
  await confirm();
  expect(onClose).toHaveBeenCalledOnce();
  expect(screen.getByLabelText("state").textContent).toBe("guest");
});

it("submits the name when Enter is pressed in the field", async () => {
  guestResponse = () => reply(guestBody, 201);
  const onClose = renderDialog();
  await typeName("Lữ khách");
  await act(async () => {
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Tên hiển thị" }), {
      key: "Enter",
    });
  });
  await flush();
  expect(guestPosts).toEqual(["Lữ khách"]);
  expect(onClose).toHaveBeenCalledOnce();
});

it("sends one request while pending, disables the field, and closes once on success", async () => {
  const gate = deferred<Response>();
  guestResponse = () => gate.promise;
  const onClose = renderDialog();
  await typeName("Lữ khách");
  await confirm();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Đang vào…" }));
  });
  expect(guestPosts).toEqual(["Lữ khách"]);
  expect(
    (screen.getByRole("textbox", { name: "Tên hiển thị" }) as HTMLInputElement)
      .disabled,
  ).toBe(true);
  await act(async () => {
    gate.resolve(reply(guestBody, 201));
  });
  await flush();
  expect(onClose).toHaveBeenCalledOnce();
});

it("cancel while pending closes once and a late success does not install the guest", async () => {
  const gate = deferred<Response>();
  guestResponse = () => gate.promise;
  const onClose = renderDialog();
  await typeName("Lữ khách");
  await confirm();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Huỷ" }));
  });
  expect(onClose).toHaveBeenCalledOnce();
  await act(async () => {
    gate.resolve(reply(guestBody, 201));
  });
  await flush();
  expect(onClose).toHaveBeenCalledOnce();
  expect(screen.getByLabelText("state").textContent).toBe("anonymous");
});

it("shows the generic retry message for a non-validation failure and keeps the dialog open", async () => {
  guestResponse = () => reply({ code: "UNAVAILABLE" }, 503);
  const onClose = renderDialog();
  await typeName("Lữ khách");
  await confirm();
  await screen.findByText(unavailable);
  expect(screen.queryByText(invalidName)).toBeNull();
  expect(onClose).not.toHaveBeenCalled();
  expect(screen.getByLabelText("state").textContent).toBe("anonymous");
});
