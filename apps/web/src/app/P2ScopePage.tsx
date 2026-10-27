import { NavigationLink } from "../shared/navigation/NavigationLink.js";

export type P2RouteName = "forgot-password" | "reset-password" | "leaderboard";

const p2Scope: Record<
  P2RouteName,
  { title: string; feature: string; detail: string }
> = {
  "forgot-password": {
    title: "Quên mật khẩu",
    feature: "Khôi phục Username và đặt lại mật khẩu",
    detail:
      "Tính năng này thuộc giai đoạn P2 và chưa được mở trong bản MVP. Trang này chưa gửi mã OTP hay xác minh email; vui lòng đăng nhập bằng thông tin đã có.",
  },
  "reset-password": {
    title: "Đặt lại mật khẩu",
    feature: "Đặt lại mật khẩu bằng mã OTP gửi về email",
    detail:
      "Tính năng này thuộc giai đoạn P2 và chưa được mở trong bản MVP. Đường dẫn này chưa nhận hay xử lý mã khôi phục nào.",
  },
  leaderboard: {
    title: "Bảng xếp hạng",
    feature: "Đánh Hạng và bảng Elo",
    detail:
      "Đánh Hạng, ghép ngẫu nhiên và điểm Elo thuộc giai đoạn P2 và chưa được mở trong bản MVP. Trang này chưa hiển thị bảng xếp hạng hay điểm Elo.",
  },
};

/**
 * Trang phân định phạm vi cho các route thuộc P2: nói rõ tính năng chưa mở và đưa người dùng về đúng phiên.
 */
export function P2ScopePage({
  route,
  signedIn,
}: {
  route: P2RouteName;
  signedIn: boolean;
}) {
  const scope = p2Scope[route];
  return (
    <section className="xq-panel xq-stack" aria-labelledby="p2-scope-title">
      <h1 id="p2-scope-title">{scope.title}</h1>
      <p>
        <strong>{scope.feature}</strong> chưa khả dụng.
      </p>
      <p>{scope.detail}</p>
      <NavigationLink href={signedIn ? "/lobby" : "/login"}>
        {signedIn ? "Quay về Sảnh" : "Về trang đăng nhập"}
      </NavigationLink>
    </section>
  );
}
