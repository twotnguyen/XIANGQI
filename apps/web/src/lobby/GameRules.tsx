/** Inline lobby disclosure; the server remains authoritative for every result. */
export function GameRules() {
  return (
    <details
      className="xq-ui"
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        background: "var(--color-surface)",
        padding: "var(--space-4)",
      }}
    >
      <summary
        style={{
          minHeight: 44,
          cursor: "pointer",
          fontWeight: 600,
          lineHeight: "44px",
        }}
      >
        Luật chơi
      </summary>
      <div className="xq-stack">
        <p>
          Đây là bộ luật rút gọn của ứng dụng, không phải toàn bộ luật thi đấu
          chính thức
        </p>
        <h2>Cách đi của bảy loại quân</h2>
        <ul>
          <li>
            <strong>Tướng</strong>: đi một giao điểm ngang hoặc dọc, luôn ở
            trong cung.
          </li>
          <li>
            <strong>Sĩ</strong>: đi một giao điểm chéo, luôn ở trong cung.
          </li>
          <li>
            <strong>Tượng</strong>: đi hai giao điểm chéo, không qua sông. Quân
            đứng ở điểm giữa chặn mắt Tượng, khiến nước đó không đi được.
          </li>
          <li>
            <strong>Xe</strong>: đi ngang hoặc dọc bao nhiêu giao điểm tùy ý,
            không nhảy qua quân.
          </li>
          <li>
            <strong>Mã</strong>: đi hai giao điểm theo một hướng ngang hoặc dọc
            rồi một giao điểm vuông góc. Quân ở giao điểm đầu tiên theo hướng
            dài chặn chân Mã.
          </li>
          <li>
            <strong>Pháo</strong>: khi không ăn quân, đi ngang hoặc dọc và không
            có quân chắn. Khi ăn quân, phải có đúng một quân làm ngòi giữa Pháo
            và quân bị ăn.
          </li>
          <li>
            <strong>Tốt/Binh</strong>: đi một giao điểm về phía trước. Sau khi
            qua sông được đi ngang một giao điểm; không bao giờ đi lùi.
          </li>
        </ul>
        <p>
          Không được để Tướng của bạn bị chiếu sau nước đi. Khi bị chiếu, bạn
          phải đi một nước hợp lệ để thoát chiếu.
        </p>
        <p>
          Hai Tướng không được đối mặt trên cùng một cột khi không có quân chắn
          giữa.
        </p>
        <h2>Thắng, thua và hòa</h2>
        <ul>
          <li>
            Chiếu hết: bên bị chiếu không còn nước hợp lệ để thoát chiếu sẽ
            thua.
          </li>
          <li>
            Hết nước đi: bên tới lượt không có nước đi hợp lệ sẽ thua, kể cả khi
            không bị chiếu.
          </li>
          <li>
            Lặp thế: vị trí của mọi quân giống hệt và cùng một bên tới lượt xuất
            hiện lần thứ ba thì hòa, trừ trường hợp chiếu liên tục dưới đây.
          </li>
          <li>
            Chu kỳ lặp tính từ lần xuất hiện thứ nhất đến lần thứ ba của thế đó.
            Nếu mọi nước của một bên trong chu kỳ đều là nước chiếu và bên kia
            không chiếu liên tục, bên đó thua; cả hai bên cùng chiếu liên tục
            thì hòa.
          </li>
          <li>
            Đuổi quân liên tục không xử riêng; nếu dẫn đến lặp thế ba lần thì
            hòa theo luật lặp thế.
          </li>
          <li>
            120 nửa nước liên tiếp (mỗi bên 60 nước) không ăn quân thì hòa tự
            động. Một nửa nước là một lượt đi của một bên.
          </li>
          <li>
            Chiếu hết được ưu tiên cao nhất. Kết quả thắng/thua do hết nước đi
            hoặc chiếu liên tục được ưu tiên trước hòa do đủ 120 nửa nước trên
            cùng nước đi.
          </li>
        </ul>
        <h2>Đồng hồ và thao tác trong ván online</h2>
        <ul>
          <li>
            Xin hòa: đối thủ có 30 giây để Đồng ý hoặc Từ chối. Nếu bị từ chối
            hoặc hết hạn, bạn phải chờ 5 nước tiếp theo của chính mình trước khi
            xin lại.
          </li>
          <li>
            Mỗi người có tối đa một đề nghị hòa đang chờ và có thể Rút đề nghị.
            X hoặc Esc chỉ thu gọn khung, không từ chối; có thể mở lại, hạn trả
            lời và đồng hồ vẫn chạy.
          </li>
          <li>
            Đầu hàng hoặc xác nhận Rời phòng khi ván đang diễn ra: bạn thua
            ngay.
          </li>
          <li>
            Hết giờ: bên hết thời gian sẽ thua. Máy chủ tính thời gian trước khi
            duyệt nước đi; đồng hồ không cộng giây.
          </li>
          <li>
            Mất kết nối: có 60 giây để kết nối lại; hết ân hạn sẽ thua. Đồng hồ
            vẫn tiếp tục chạy.
          </li>
          <li>
            Khi máy chủ gián đoạn toàn cục, ván bị gián đoạn: không có người
            thắng và không phải hòa.
          </li>
        </ul>
      </div>
    </details>
  );
}
