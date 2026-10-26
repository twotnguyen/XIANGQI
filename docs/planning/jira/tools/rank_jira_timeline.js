// ============================================================================
// SCRIPT SẮP XẾP BẬC THANG TOÀN BỘ 71 TASK TRÊN JIRA TIMELINE
// Copy toàn bộ và dán vào Chrome Console (F12) để sắp xếp thứ hạng chuẩn tuyệt đối
// ============================================================================
async function rankAllStaircases() {
  console.log("🚀 Bắt đầu sắp xếp thứ tự bậc thang cho toàn bộ 71 Task...");
  // --- XIAN-1 (EP-00): Nền tảng kỹ thuật và chất lượng ---
  const tasks_EP_00 = ["XIAN-37", "XIAN-39", "XIAN-50", "XIAN-48", "XIAN-38", "XIAN-42", "XIAN-87", "XIAN-102", "XIAN-106", "XIAN-107"];
  for (let i = 1; i < tasks_EP_00.length; i++) {
    await fetch("/rest/agile/1.0/issue/rank", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issues: [tasks_EP_00[i]], rankAfterIssue: tasks_EP_00[i - 1] })
    });
  }
  console.log("✅ Đã xếp xong XIAN-1 (EP-00)");

  // --- XIAN-2 (EP-01): Đăng ký và đăng nhập ---
  const tasks_EP_01 = ["XIAN-40", "XIAN-44", "XIAN-49", "XIAN-45", "XIAN-51", "XIAN-53", "XIAN-71", "XIAN-80", "XIAN-84", "XIAN-92", "XIAN-101", "XIAN-105"];
  for (let i = 1; i < tasks_EP_01.length; i++) {
    await fetch("/rest/agile/1.0/issue/rank", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issues: [tasks_EP_01[i]], rankAfterIssue: tasks_EP_01[i - 1] })
    });
  }
  console.log("✅ Đã xếp xong XIAN-2 (EP-01)");

  // --- XIAN-3 (EP-02): Tạo phòng ---
  const tasks_EP_02 = ["XIAN-54", "XIAN-57", "XIAN-64", "XIAN-77", "XIAN-82", "XIAN-86"];
  for (let i = 1; i < tasks_EP_02.length; i++) {
    await fetch("/rest/agile/1.0/issue/rank", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issues: [tasks_EP_02[i]], rankAfterIssue: tasks_EP_02[i - 1] })
    });
  }
  console.log("✅ Đã xếp xong XIAN-3 (EP-02)");

  // --- XIAN-4 (EP-03): Mời vào phòng ---
  const tasks_EP_03 = ["XIAN-58", "XIAN-62", "XIAN-65", "XIAN-67", "XIAN-76", "XIAN-85"];
  for (let i = 1; i < tasks_EP_03.length; i++) {
    await fetch("/rest/agile/1.0/issue/rank", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issues: [tasks_EP_03[i]], rankAfterIssue: tasks_EP_03[i - 1] })
    });
  }
  console.log("✅ Đã xếp xong XIAN-4 (EP-03)");

  // --- XIAN-5 (EP-04): Khởi tạo bàn cờ ---
  const tasks_EP_04 = ["XIAN-41", "XIAN-43", "XIAN-46", "XIAN-47", "XIAN-52", "XIAN-55", "XIAN-63"];
  for (let i = 1; i < tasks_EP_04.length; i++) {
    await fetch("/rest/agile/1.0/issue/rank", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issues: [tasks_EP_04[i]], rankAfterIssue: tasks_EP_04[i - 1] })
    });
  }
  console.log("✅ Đã xếp xong XIAN-5 (EP-04)");

  // --- XIAN-6 (EP-05): Hai người đánh cờ online ---
  const tasks_EP_05 = ["XIAN-56", "XIAN-59", "XIAN-61", "XIAN-66", "XIAN-68", "XIAN-72", "XIAN-75", "XIAN-88", "XIAN-96"];
  for (let i = 1; i < tasks_EP_05.length; i++) {
    await fetch("/rest/agile/1.0/issue/rank", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issues: [tasks_EP_05[i]], rankAfterIssue: tasks_EP_05[i - 1] })
    });
  }
  console.log("✅ Đã xếp xong XIAN-6 (EP-05)");

  // --- XIAN-7 (EP-06): Chế độ phòng và người xem ---
  const tasks_EP_06 = ["XIAN-89", "XIAN-93", "XIAN-98", "XIAN-90", "XIAN-97", "XIAN-103", "XIAN-91", "XIAN-94", "XIAN-100"];
  for (let i = 1; i < tasks_EP_06.length; i++) {
    await fetch("/rest/agile/1.0/issue/rank", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issues: [tasks_EP_06[i]], rankAfterIssue: tasks_EP_06[i - 1] })
    });
  }
  console.log("✅ Đã xếp xong XIAN-7 (EP-06)");

  // --- XIAN-8 (EP-07): Chat, camera và mic ---
  const tasks_EP_07 = ["XIAN-73", "XIAN-78", "XIAN-83", "XIAN-69", "XIAN-81"];
  for (let i = 1; i < tasks_EP_07.length; i++) {
    await fetch("/rest/agile/1.0/issue/rank", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issues: [tasks_EP_07[i]], rankAfterIssue: tasks_EP_07[i - 1] })
    });
  }
  console.log("✅ Đã xếp xong XIAN-8 (EP-07)");

  // --- XIAN-9 (EP-08): Đánh với máy theo cấp độ ---
  const tasks_EP_08 = ["XIAN-70", "XIAN-74", "XIAN-79", "XIAN-60", "XIAN-95", "XIAN-99", "XIAN-104"];
  for (let i = 1; i < tasks_EP_08.length; i++) {
    await fetch("/rest/agile/1.0/issue/rank", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issues: [tasks_EP_08[i]], rankAfterIssue: tasks_EP_08[i - 1] })
    });
  }
  console.log("✅ Đã xếp xong XIAN-9 (EP-08)");

  console.log("🎉 HOÀN THÀNH TOÀN BỘ 71 TASKS! Tự động tải lại trang...");
  location.reload();
}
rankAllStaircases();