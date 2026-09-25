/* ============================================================
   Trang tài liệu Cờ Tướng Online — logic ứng dụng
   Không framework. Định tuyến bằng hash để chạy được trên file://
   ============================================================ */
(function () {
'use strict';

const DB = window.__DOCS__;
const $  = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

/* ---------- Bỏ dấu tiếng Việt để tìm kiếm dễ hơn ---------- */
const deaccent = (s) => s
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/đ/g, 'd').replace(/Đ/g, 'D')
  .toLowerCase();

/* ---------- Lưu tiến độ đọc ---------- */
const STORE = 'xq.docs.progress';
let progress = {};
try { progress = JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (e) { progress = {}; }
const saveProgress = () => { try { localStorage.setItem(STORE, JSON.stringify(progress)); } catch (e) {} };

/* ---------- Nền sáng / tối ---------- */
const THEME = 'xq.docs.theme';
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  const b = $('#btnTheme');
  if (b) { b.textContent = t === 'dark' ? '☀️' : '🌙'; }
  try { localStorage.setItem(THEME, t); } catch (e) {}
}
(function initTheme() {
  let t = null;
  try { t = localStorage.getItem(THEME); } catch (e) {}
  if (!t) t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(t);
})();

/* ============================================================
   LỘ TRÌNH ĐỌC THEO VAI TRÒ  (nguồn: docs/ONBOARDING.md)
   ============================================================ */
const CORE = [
  { p: 'docs/00-overview/product-overview.md', w: 'Sản phẩm là gì, giải quyết vấn đề gì cho ai' },
  { p: 'docs/00-overview/glossary.md',         w: 'Thuật ngữ thống nhất toàn dự án', star: true },
  { p: 'docs/00-overview/actors.md',           w: 'Ai làm được gì' },
  { p: 'docs/00-overview/scope.md',            w: 'Cái gì làm, cái gì cố ý không làm' },
  { p: 'docs/04-business-rules/game-rules.md', w: 'Hệ toạ độ — nền của mọi luật cờ', sec: '§1', star: true },
];

const ROLES = [
  {
    id: 'frontend', icon: '🎨', name: 'Lập trình viên giao diện', time: '~3 giờ',
    desc: 'Dựng màn hình theo inventory hiện hành, bàn cờ SVG, và các luồng người dùng.',
    steps: [
      { p: 'docs/03-screens/screen-inventory.md',        w: 'Danh mục màn hình và năm trạng thái cụ thể' },
      { p: 'docs/03-screens/design-tokens.md',           w: 'Màu · khoảng cách · chữ — mục tiêu trợ năng cần kiểm trên UI thật' },
      { p: 'docs/02-flows/README.md',                    w: 'Người dùng đi qua những bước nào, kể cả nhánh lỗi' },
      { p: 'docs/04-business-rules/permissions.md',      w: 'Cái gì được hiện cho ai' },
      { p: 'docs/05-data-and-realtime/session-state.md', w: 'Nhiều tab · mất mạng · khôi phục' },
    ],
    warn: {
      t: 'Ba điều dễ làm sai nhất',
      rows: [
        ['⛔', 'Không lọc dữ liệu ở giao diện. Không có quyền ⇒ <b>máy chủ không gửi</b>, không phải nhận rồi ẩn'],
        ['⭐', '<code>DT-21</code> — hai màu quân tương phản chỉ <b>2.17:1</b>, bắt buộc có dấu hiệu ngoài màu sắc'],
        ['⭐', 'Lật bàn <b>chỉ là hiển thị</b>. Toạ độ gửi lên máy chủ không đổi theo góc nhìn'],
      ],
    },
    next: { t: 'Bắt tay làm', d: 'Nhóm E10 — issue 078–083, bàn cờ SVG', p: 'docs/10-issues/INDEX.md' },
  },
  {
    id: 'backend', icon: '⚙️', name: 'Lập trình viên máy chủ', time: '~4 giờ',
    desc: 'Máy chủ quyết định mọi thứ. Khoá dòng, thứ tự khoá, và ranh giới Prisma / SQL thuần.',
    steps: [
      { p: 'docs/09-technical/tech-stack.md',              w: 'Ranh giới Prisma / SQL thuần — đọc trước mọi thứ khác', sec: '§3', star: true },
      { p: 'docs/09-technical/architecture.md',            w: '16 bất biến ARCH-01..16' },
      { p: 'docs/05-data-and-realtime/data-model.md',      w: 'Bảng · khoá · ràng buộc' },
      { p: 'docs/05-data-and-realtime/data-flows.md',      w: 'Luồng xử lý lệnh · thứ tự khoá' },
      { p: 'docs/05-data-and-realtime/state-machines.md',  w: 'Máy trạng thái phòng · ván · kết nối' },
      { p: 'docs/04-business-rules/business-rules.md',     w: 'Chỉ mục luật và nguồn định nghĩa' },
      { p: 'docs/04-business-rules/permissions.md',        w: 'Ma trận quyền + 10 điều không ai được làm' },
      { p: 'docs/04-business-rules/game-rules.md',         w: 'Đọc hết, không chỉ §1' },
    ],
    warn: {
      t: 'Năm điều phải thuộc',
      pre: '① Máy chủ quyết định. Client chỉ gửi Ý ĐỊNH\n② Cần KHOÁ DÒNG / THỨ TỰ KHOÁ / ĐẾM-RỒI-GHI  ⇒  SQL THUẦN\n③ Thứ tự khoá LUÔN là: phòng → người → ván\n④ ⛔ KHÔNG giữ khoá khi đang gọi ra ngoài\n⑤ ⛔ KHÔNG BAO GIỜ chạy prisma migrate',
    },
    next: { t: 'Bắt tay làm', d: 'Nhóm E04 — issue 034–045, cơ sở dữ liệu', p: 'docs/10-issues/INDEX.md' },
  },
  {
    id: 'qa', icon: '🧪', name: 'Kiểm thử / QA', time: '~3 giờ',
    desc: 'Tiêu chí và kịch bản nghiệm thu hiện hành, chưa có kết quả test ứng dụng.',
    steps: [
      { p: 'docs/06-acceptance/acceptance-criteria.md',   w: 'Tiêu chí theo registry + quy tắc báo cáo trung thực' },
      { p: 'docs/06-acceptance/test-scenarios.md',        w: 'Kịch bản quyền, thời hạn, tranh chấp và hành trình người dùng' },
      { p: 'docs/04-business-rules/game-rules.md',        w: 'Đọc hết — QA phải biết luật hơn cả dev' },
      { p: 'docs/04-business-rules/permissions.md',       w: 'Mọi ô ❌ đều phải có test' },
      { p: 'docs/06-acceptance/traceability-matrix.md',    w: 'Yêu cầu → luồng → màn hình → luật → test' },
      { p: 'docs/10-issues/WORKFLOW.md',                  w: '7 luật viết test + mẫu báo cáo bằng chứng', sec: '§4, §5' },
    ],
    warn: {
      t: 'Luật quan trọng nhất',
      rows: [
        ['⭐', '<b>Test phải BẮT được lỗi.</b> Viết xong, cố tình phá mã — test phải đỏ. Test luôn xanh dù mã sai là test vô dụng'],
        ['⛔', 'Cấm <code>.only</code>. Cột <code>Skip</code> trong báo cáo phải là <b>0</b>'],
        ['⛔', 'Test quyền phải <b>giả mạo dữ liệu gửi thẳng lên máy chủ</b> — kiểm nút bị mờ là CHƯA ĐỦ'],
      ],
    },
    next: { t: 'Đích đến cuối cùng của QA', d: 'ISSUE-136 — nghiệm thu R01–R19', p: 'docs/10-issues/ISSUE-136.md' },
  },
  {
    id: 'pm', icon: '📋', name: 'Quản lý / chủ nhiệm / người chấm', time: '~2 giờ',
    desc: 'Nắm phạm vi, quyết định kèm lý do và tiến độ 138 đầu việc.',
    steps: [
      { p: 'docs/01-requirements/README.md',      w: 'Mục lục 19 yêu cầu R01–R19 + sơ đồ liên quan' },
      { p: 'docs/07-decisions/decision-log.md',   w: 'Quyết định kèm lý do và phần đã thay thế', star: true },
      { p: 'docs/08-ba-review/final-audit-2026-09-22.md',    w: 'Kết quả kiểm chất lượng tài liệu' },
      { p: 'docs/10-issues/README.md',            w: 'Bản đồ 138 đầu việc, 21 nhóm' },
      { p: 'docs/10-issues/INDEX.md',             w: 'Trạng thái từng việc' },
    ],
    warn: {
      t: 'Ba yêu cầu mới phát sinh từ đợt audit — tài liệu cũ không có',
      rows: [
        ['R17', 'Chống treo ván — ván không giới hạn giờ ⇒ người online nhưng không đi ⇒ <b>ván treo vô hạn</b>'],
        ['R18', 'Đuổi người xem — tài liệu cũ nhắc "kick viewer" 2 lần nhưng <b>không có chức năng</b>'],
        ['R19', 'Hộp thư lời mời — lời mời hết hạn 10 phút ⇒ bạn không online thì <b>không bao giờ biết</b>'],
      ],
    },
    next: { t: 'Hai cổng chặn', d: 'ISSUE-032 (máy cờ) và ISSUE-112 (media) — chưa đo thì chưa biết có làm được không', p: 'docs/10-issues/ISSUE-032.md' },
  },
  {
    id: 'devops', icon: '🚀', name: 'Triển khai / vận hành', time: '~1,5 giờ',
    desc: 'Đưa hệ thống lên Render + Vercel + Supabase + LiveKit, và xin tài nguyên bên ngoài.',
    steps: [
      { p: 'docs/09-technical/deployment.md',     w: 'Bản đồ triển khai' },
      { p: 'docs/09-technical/tech-stack.md',     w: 'Công nghệ đã chốt' },
      { p: 'docs/10-issues/EXTERNAL-SETUP.md',    w: 'Cách xin từng tài nguyên bên ngoài', star: true },
      { p: 'docs/10-issues/ISSUE-137.md',         w: 'Checklist triển khai thật' },
    ],
    warn: {
      t: 'Ba cạm bẫy đắt nhất',
      pre: '⚠ Demo cho phép hosting ngủ; restart kết thúc ván cũ ở trạng thái gián đoạn\n⛔ Máy cờ chạy chung tiến trình máy chủ → treo MỌI người chơi 3 giây\n⛔ Khoá bí mật đặt vào biến VITE_* → LỘ RA GIAO DIỆN, ai cũng đọc được',
    },
    next: { t: 'Trước khi triển khai', d: 'Danh sách kiểm 10 mục trong EXTERNAL-SETUP §8', p: 'docs/10-issues/EXTERNAL-SETUP.md' },
  },
  {
    id: 'agent', icon: '🤖', name: 'Agent viết mã', time: '~1 giờ',
    desc: 'Thay thế cả Bộ lõi — AGENTS.md đã gói sẵn phần cần thiết.',
    skipCore: true,
    steps: [
      { p: 'AGENTS.md',                            w: 'Đọc HẾT trước khi chạm file nào', star: true },
      { p: 'docs/10-issues/AGENT-START-HERE.md', w: 'Cách nhận việc, triển khai và bàn giao', star: true },
      { p: 'docs/10-issues/TEST-CONVENTIONS.md', w: 'Fixture, clock, race và lệnh kiểm thử' },
      { p: 'docs/10-issues/AC-COVERAGE.md', w: '333 tiêu chí và issue chịu trách nhiệm' },
      { p: 'docs/00-overview/glossary.md',         w: 'Thuật ngữ — SPECTATOR ≠ WATCH' },
      { p: 'docs/04-business-rules/game-rules.md', w: 'Hệ toạ độ', sec: '§1' },
      { p: 'docs/09-technical/tech-stack.md',      w: 'Ranh giới Prisma / SQL thuần', sec: '§3' },
      { p: 'docs/10-issues/WORKFLOW.md',           w: 'Quy trình Git, bằng chứng, định nghĩa xong' },
      { p: 'docs/10-issues/README.md',             w: 'Bản đồ 21 nhóm việc + 2 cổng chặn' },
    ],
    warn: {
      t: 'Bảy luật tuyệt đối — vi phạm là PR bị từ chối',
      pre: '① Máy chủ quyết định, không tin dữ liệu client\n② Không có quyền ⇒ không nhận dữ liệu\n③ Đường xử lý lệnh ván dùng SQL thuần\n④ Máy cờ chạy tiến trình riêng\n⑤ Test thời gian dùng đồng hồ giả tiêm vào\n⑥ Test dữ liệu chạy trên PostgreSQL thật, 0 test bỏ qua\n⑦ Không tự hạ tiêu chí',
    },
    next: { t: 'Bắt tay làm', d: 'Chọn issue TODO đầu tiên có mọi phụ thuộc đã DONE', p: 'docs/10-issues/INDEX.md' },
  },
];

const QUIZ = [
  ['Phòng tối đa bao nhiêu người? Chia thế nào?', '<b>7 người</b> — 2 người chơi + tối đa 5 người xem'],
  ['SPECTATOR khác WATCH ở chỗ nào?', '<code>SPECTATOR</code> là <b>vai trò</b> trong phòng · <code>WATCH</code> là <b>loại quyền</b> của tấm vé vào phòng'],
  ['Quân đỏ ở phía trên hay phía dưới bàn cờ?', 'Quân <b>đỏ ở phía dưới</b> (<code>y = 9</code>)'],
  ['Tốt đỏ "đã qua sông" nghĩa là y lớn hơn hay nhỏ hơn 5?', 'Tốt đỏ qua sông khi <b>y ≤ 4</b> — đỏ đi từ dưới lên, y giảm dần'],
  ['Hệ thống có hỗ trợ chơi khi chưa đăng nhập không?', '<b>Không.</b> Không hỗ trợ khách (<code>DEC-006</code>) — phải đăng ký'],
  ['Hết nước đi thì hoà hay thua?', '<b>THUA</b> (<code>DEC-019</code>) — khác cờ vua'],
];

/* ============================================================
   XỬ LÝ ĐƯỜNG DẪN
   ============================================================ */
function resolvePath(from, href) {
  const base = from.split('/').slice(0, -1);
  const parts = href.split('/');
  for (const seg of parts) {
    if (seg === '.' || seg === '') continue;
    if (seg === '..') base.pop();
    else base.push(seg);
  }
  return base.join('/');
}

const fileOf  = (p) => DB.files[p] || (window.__ARCHIVE__ && window.__ARCHIVE__.files[p]) || null;

/** Liệt kê tài liệu nằm trong một thư mục (kể cả thư mục con) */
function dirFiles(dir) {
  const pre = dir.replace(/\/$/, '') + '/';
  const main = DB.order.filter((p) => p.startsWith(pre));
  if (main.length) return { list: main, src: DB };
  if (window.__ARCHIVE__) {
    const arch = window.__ARCHIVE__.order.filter((p) => p.startsWith(pre));
    if (arch.length) return { list: arch, src: window.__ARCHIVE__ };
  }
  return { list: [], src: DB };
}
const dirHasFiles = (dir) => dir.startsWith('docs/99-archive') || dirFiles(dir).list.length > 0;
const groupOf = (id) => DB.groups.find((g) => g.id === id) || { label: id, icon: '📄' };

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ============================================================
   RENDER MARKDOWN
   Dùng marked để dựng HTML, rồi CHỈNH LẠI TRÊN DOM.
   Làm trên DOM an toàn hơn là ghi đè renderer của marked.
   ============================================================ */
marked.setOptions({ gfm: true, breaks: false, headerIds: false, mangle: false });

function renderDoc(md, curPath) {
  const host = document.createElement('div');
  host.className = 'doc';
  host.innerHTML = marked.parse(md);

  /* 1. Liên kết — .md thì chuyển thành điều hướng trong trang */
  $$('a[href]', host).forEach((a) => {
    const href = a.getAttribute('href');
    if (!href) return;
    if (/^(https?:|mailto:)/i.test(href)) {
      a.target = '_blank'; a.rel = 'noopener noreferrer';
      return;
    }
    if (href.startsWith('#')) return;

    const clean = href.split('#')[0];
    if (!clean) return;

    let target = resolvePath(curPath, clean);
    if (/\.md$/i.test(target)) {
      if (fileOf(target)) {
        a.setAttribute('href', '#/doc/' + target);
      } else {
        a.classList.add('is-dead');
        a.title = 'Không tìm thấy: ' + target;
      }
      return;
    }
    /* trỏ tới thư mục → README của thư mục, nếu không có thì trang liệt kê */
    const dir = target.replace(/\/$/, '');
    const idx = dir + '/README.md';
    if (fileOf(idx)) a.setAttribute('href', '#/doc/' + idx);
    else if (dirHasFiles(dir)) a.setAttribute('href', '#/dir/' + dir);
    else a.classList.add('is-dead');
  });

  /* 2. Bảng — bọc lại để cuộn ngang được trên điện thoại */
  $$('table', host).forEach((t) => {
    const w = document.createElement('div');
    w.className = 'tablewrap';
    t.parentNode.insertBefore(w, t);
    w.appendChild(t);
  });

  /* 3. Tiêu đề — gắn mã neo cho mục lục
        Vài tài liệu có NHIỀU H1 (open-questions.md có 8). Khi đó H1 cũng
        là một mục thật sự, phải đưa vào mục lục, nếu không sẽ thiếu. */
  const toc = [];
  const manyH1 = host.querySelectorAll('h1').length > 1;
  const sel = manyH1 ? 'h1, h2, h3' : 'h2, h3';
  $$(sel, host).forEach((h, i) => {
    const id = 'h-' + i;
    h.id = id;
    const lvl = h.tagName === 'H1' ? 1 : (h.tagName === 'H2' ? 2 : 3);
    toc.push({ id, lvl, text: h.textContent.trim() });
    const a = document.createElement('a');
    a.className = 'anchor'; a.href = '#' + id; a.textContent = '#';
    a.setAttribute('aria-label', 'Liên kết tới mục này');
    h.appendChild(a);
  });

  /* 4. Khối trích dẫn — tô màu theo ký hiệu mở đầu */
  $$('blockquote', host).forEach((q) => {
    const t = q.textContent.trim();
    if (t.startsWith('⛔')) q.classList.add('is-stop');
    else if (t.startsWith('✅') || t.startsWith('⭐')) q.classList.add('is-ok');
    else if (t.startsWith('👉') || t.startsWith('📌')) q.classList.add('is-info');
  });

  /* 5. Sơ đồ ASCII: ký tự khoanh tròn ① ② ③ rộng gấp ~1,66 lần chữ thường
        trong font đơn cách. Nếu để nguyên, viền phải của khung sẽ bị đẩy lệch
        (thấy rõ ở data-flows.md). Ép mỗi ký tự vào đúng MỘT ô ký tự. */
  $$('pre code', host).forEach((code) => {
    if (!/[\u2460-\u2473]/.test(code.textContent)) return;
    const walker = document.createTreeWalker(code, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((n) => {
      if (!/[\u2460-\u2473]/.test(n.nodeValue)) return;
      const frag = document.createDocumentFragment();
      n.nodeValue.split(/([\u2460-\u2473])/).forEach((part) => {
        if (!part) return;
        if (/^[\u2460-\u2473]$/.test(part)) {
          const sp = document.createElement('span');
          sp.className = 'cell1';
          const inner = document.createElement('i');
          inner.textContent = part;
          sp.appendChild(inner);
          frag.appendChild(sp);
        } else {
          frag.appendChild(document.createTextNode(part));
        }
      });
      n.parentNode.replaceChild(frag, n);
    });
  });

  /* 6. Checkbox trong danh sách — để đọc, không cho sửa */
  $$('input[type="checkbox"]', host).forEach((c) => { c.disabled = true; });

  return { host, toc };
}

/* ============================================================
   THANH BÊN
   ============================================================ */
function buildNav() {
  const tree = $('#navTree');
  tree.innerHTML = '';
  const openState = {};
  try { Object.assign(openState, JSON.parse(localStorage.getItem('xq.docs.nav') || '{}')); } catch (e) {}

  DB.groups.forEach((g) => {
    const paths = DB.order.filter((p) => DB.files[p].group === g.id);
    if (!paths.length) return;

    const box = document.createElement('div');
    box.className = 'navgrp';
    box.dataset.group = g.id;
    box.dataset.open = openState[g.id] === false ? 'false' : 'true';

    const hd = document.createElement('button');
    hd.className = 'navgrp__hd';
    hd.type = 'button';
    hd.innerHTML = `<span aria-hidden="true">${g.icon}</span><span>${esc(g.label)}</span>
      <span class="navgrp__count">${paths.length}</span><span class="navgrp__caret">▼</span>`;
    hd.setAttribute('aria-expanded', box.dataset.open);
    hd.addEventListener('click', () => {
      const now = box.dataset.open === 'true' ? 'false' : 'true';
      box.dataset.open = now;
      hd.setAttribute('aria-expanded', now);
      openState[g.id] = now === 'true';
      try { localStorage.setItem('xq.docs.nav', JSON.stringify(openState)); } catch (e) {}
    });

    const ul = document.createElement('ul');
    ul.className = 'navgrp__list';
    paths.forEach((p) => {
      const f = DB.files[p];
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'navlink';
      a.href = '#/doc/' + p;
      a.textContent = f.title;
      a.dataset.path = p;
      li.appendChild(a);
      ul.appendChild(li);
    });

    box.appendChild(hd);
    box.appendChild(ul);
    tree.appendChild(box);
  });

  /* lọc nhanh */
  $('#navFilter').addEventListener('input', (e) => {
    const q = deaccent(e.target.value.trim());
    $$('.navgrp', tree).forEach((box) => {
      let shown = 0;
      $$('.navlink', box).forEach((a) => {
        const hit = !q || deaccent(a.textContent).includes(q) || deaccent(a.dataset.path).includes(q);
        a.parentElement.style.display = hit ? '' : 'none';
        if (hit) shown++;
      });
      box.style.display = shown ? '' : 'none';
      if (q) box.dataset.open = 'true';
    });
  });
}

function markNav(path) {
  $$('.navlink').forEach((a) => {
    if (a.dataset.path === path) {
      a.setAttribute('aria-current', 'page');
      const grp = a.closest('.navgrp');
      if (grp) grp.dataset.open = 'true';
    } else a.removeAttribute('aria-current');
  });
}

/* ============================================================
   MỤC LỤC BÊN PHẢI + theo dõi vị trí cuộn
   ============================================================ */
let spyObserver = null;
function buildToc(items) {
  const el = $('#toc');
  if (spyObserver) { spyObserver.disconnect(); spyObserver = null; }
  if (!items || items.length < 3) { el.innerHTML = ''; return; }

  el.innerHTML = '<div class="toc__hd">Trong trang này</div><ul class="toc__list">' +
    items.map((i) => `<li><a class="toc__link" data-lvl="${i.lvl}" href="#${i.id}">${esc(i.text)}</a></li>`).join('') +
    '</ul>';

  const links = {};
  $$('.toc__link', el).forEach((a) => { links[a.getAttribute('href').slice(1)] = a; });

  spyObserver = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      $$('.toc__link', el).forEach((a) => a.classList.remove('is-active'));
      const a = links[en.target.id];
      if (a) a.classList.add('is-active');
    });
  }, { rootMargin: '-70px 0px -72% 0px', threshold: 0 });

  items.forEach((i) => {
    const h = document.getElementById(i.id);
    if (h) spyObserver.observe(h);
  });
}

/* ============================================================
   TÌM KIẾM
   ============================================================ */
let searchIndex = null;
function ensureIndex() {
  if (searchIndex) return searchIndex;
  searchIndex = DB.order.map((p) => {
    const f = DB.files[p];
    return { path: p, title: f.title, group: f.group, raw: f.md, hay: deaccent(f.md), hayTitle: deaccent(f.title + ' ' + p) };
  });
  return searchIndex;
}

function snippet(raw, hay, q) {
  const at = hay.indexOf(q);
  if (at < 0) return '';
  const from = Math.max(0, at - 60);
  let s = raw.slice(from, at + q.length + 90).replace(/\n+/g, ' ').replace(/[#*`|>]/g, '').trim();
  const local = deaccent(s).indexOf(q);
  if (local >= 0) {
    s = esc(s.slice(0, local)) + '<mark>' + esc(s.slice(local, local + q.length)) + '</mark>' + esc(s.slice(local + q.length));
  } else s = esc(s);
  return (from > 0 ? '…' : '') + s + '…';
}

function runSearch(term) {
  const res = $('#srchRes');
  const q = deaccent(term.trim());
  if (q.length < 2) {
    res.innerHTML = '<div class="srch__empty">Gõ ít nhất 2 ký tự. Tìm được cả mã định danh như <b>DEC-025</b>, <b>R17</b>, <b>ISSUE-032</b>.</div>';
    return;
  }
  const idx = ensureIndex();
  const hits = [];
  for (const it of idx) {
    const inTitle = it.hayTitle.includes(q);
    const at = it.hay.indexOf(q);
    if (!inTitle && at < 0) continue;
    let count = 0, from = 0;
    while (count < 40) { const k = it.hay.indexOf(q, from); if (k < 0) break; count++; from = k + q.length; }
    hits.push({ it, score: (inTitle ? 1000 : 0) + count, snip: at >= 0 ? snippet(it.raw, it.hay, q) : '' });
  }
  hits.sort((a, b) => b.score - a.score);

  if (!hits.length) {
    res.innerHTML = '<div class="srch__empty">Không tìm thấy <b>' + esc(term) + '</b> trong ' + DB.order.length + ' tài liệu.</div>';
    return;
  }
  res.innerHTML = hits.slice(0, 40).map((h, i) => `
    <a class="hit${i === 0 ? ' is-sel' : ''}" href="#/doc/${h.it.path}">
      <div class="hit__ttl">${groupOf(h.it.group).icon} ${esc(h.it.title)}</div>
      <div class="hit__path">${esc(h.it.path)}</div>
      ${h.snip ? '<div class="hit__snip">' + h.snip + '</div>' : ''}
    </a>`).join('');
}

function openSearch() {
  $('#ovlSearch').dataset.open = 'true';
  const i = $('#srchIn');
  i.value = ''; runSearch(''); i.focus();
}
function closeSearch() { $('#ovlSearch').dataset.open = 'false'; }

/* ============================================================
   CÁC MÀN HÌNH
   ============================================================ */
function progressOf(paths) {
  const done = paths.filter((p) => progress[p]).length;
  return { done, total: paths.length, pct: paths.length ? Math.round((done / paths.length) * 100) : 0 };
}

function viewHome() {
  const s = DB.stats;
  const roleCards = ROLES.map((r) => {
    const paths = (r.skipCore ? [] : CORE.map((c) => c.p)).concat(r.steps.map((x) => x.p));
    const pr = progressOf(Array.from(new Set(paths)));
    return `<a class="rolecard" href="#/path/${r.id}">
      <div class="rolecard__top">
        <span class="rolecard__ico" aria-hidden="true">${r.icon}</span>
        <span class="rolecard__ttl">${esc(r.name)}</span>
        <span class="rolecard__meta">${r.time}</span>
      </div>
      <div class="rolecard__desc">${esc(r.desc)}</div>
      <div class="rolecard__bar"><div class="rolecard__fill" style="width:${pr.pct}%"></div></div>
      <div class="rolecard__pct">${pr.done}/${pr.total} tài liệu · ${pr.pct}%</div>
    </a>`;
  }).join('');

  const grpCards = DB.groups.filter((g) => g.id !== '_root').map((g) => {
    const n = DB.order.filter((p) => DB.files[p].group === g.id).length;
    const first = DB.order.find((p) => DB.files[p].group === g.id);
    return `<a class="grpcard" href="#/doc/${first}">
      <div class="grpcard__ttl"><span aria-hidden="true">${g.icon}</span>${esc(g.label)}<span class="grpcard__n">${n}</span></div>
      <div class="grpcard__desc">${esc(g.desc)}</div>
    </a>`;
  }).join('');

  return `<div class="wrap wrap--wide">
    <div class="hero">
      <div class="hero__badge">● Đã rà soát đặc tả — chưa nghiệm thu ứng dụng</div>
      <h1>Tài liệu dự án Cờ Tướng Online</h1>
      <p class="hero__lead">Toàn bộ đặc tả để <b>xây lại dự án từ đầu</b>: từng chức năng, từng màn hình, từng luồng dữ liệu.
      Chọn vai trò của bạn để có lộ trình đọc riêng — thay vì mở lần lượt ${s.docs} file.</p>
    </div>

    <div class="stats">
      <div class="stat"><span class="stat__n">${s.docs}</span><span class="stat__l">tài liệu</span></div>
      <div class="stat"><span class="stat__n">19</span><span class="stat__l">yêu cầu</span></div>
      <div class="stat"><span class="stat__n">${s.screens}</span><span class="stat__l">màn hình</span></div>
      <div class="stat"><span class="stat__n">${s.businessRules}</span><span class="stat__l">luật nghiệp vụ BR</span></div>
      <div class="stat"><span class="stat__n">${s.acceptance}</span><span class="stat__l">tiêu chí nghiệm thu</span></div>
      <div class="stat"><span class="stat__n">${s.decisions}</span><span class="stat__l">quyết định</span></div>
      <div class="stat"><span class="stat__n">138</span><span class="stat__l">đầu việc</span></div>
    </div>

    <div class="sechd"><h2>Bạn là ai?</h2><p>Mỗi vai trò có lộ trình riêng. Tiến độ được ghi nhớ trên máy bạn.</p></div>
    <div class="rolegrid">${roleCards}</div>

    <div class="callout">
      <span class="callout__ico" aria-hidden="true">⛔</span>
      <div>
        <div class="callout__ttl">Hai cổng chặn — hai câu hỏi chưa có đáp án</div>
        <div class="callout__bd">
          <b><a href="#/doc/docs/10-issues/ISSUE-032.md">ISSUE-032</a></b> — TypeScript có tính nổi độ sâu 6 trong 3 giây không? ·
          <b><a href="#/doc/docs/10-issues/ISSUE-112.md">ISSUE-112</a></b> — LiveKit có truyền được gói tin thật không?<br>
          Chưa đo thì chưa biết. Không đạt thì <b>không được đi tiếp</b> — và không được hạ ngưỡng.
        </div>
      </div>
    </div>

    <div class="sechd"><h2>Duyệt theo chủ đề</h2><p>Hoặc mở thẳng phần bạn cần.</p></div>
    <div class="grpgrid">${grpCards}</div>

    <div class="sechd"><h2>Vì sao tài liệu nhiều đến vậy</h2></div>
    <p style="color:var(--text-soft)">Dự án đã từng được xây một lần và <b>thất bại ở 30 chỗ cụ thể</b>. Cả 30 lỗi đó được gắn vào đúng đầu việc sẽ gặp chúng,
    ở mục <b>⚠ CẠM BẪY</b> cuối mỗi issue. Hồ sơ gốc nằm trong <a href="#/archive">kho lưu trữ (${s.archive} file)</a> —
    là lịch sử, <b>không</b> dùng làm căn cứ triển khai.</p>
  </div>`;
}

function stepHtml(st, i) {
  const f = fileOf(st.p);
  const done = !!progress[st.p];
  const title = f ? f.title : st.p;
  const meta = f ? `${f.lines} dòng · ${groupOf(f.group).label}` : 'không tìm thấy file';
  return `<div class="step${done ? ' is-done' : ''}" data-path="${esc(st.p)}">
    <input class="step__chk" type="checkbox" ${done ? 'checked' : ''} data-path="${esc(st.p)}"
           aria-label="Đánh dấu đã đọc ${esc(title)}">
    <div class="step__bd">
      <a class="step__ttl" href="#/doc/${esc(st.p)}">${i}. ${esc(title)}${st.star ? ' ⭐' : ''}${st.sec ? `<span class="step__tag">${esc(st.sec)}</span>` : ''}</a>
      <div class="step__why">${esc(st.w)}</div>
      <div class="step__meta">${esc(meta)}</div>
    </div>
  </div>`;
}

function viewPath(id) {
  const r = ROLES.find((x) => x.id === id);
  if (!r) return viewHome();

  const all = Array.from(new Set((r.skipCore ? [] : CORE.map((c) => c.p)).concat(r.steps.map((s) => s.p))));
  const pr = progressOf(all);

  let n = 0;
  const coreHtml = r.skipCore ? '' : `
    <div class="sechd"><h2>Bộ lõi — mọi thành viên đều đọc</h2>
      <p>Khoảng 1 giờ. Đọc đúng thứ tự này, không đảo.</p></div>
    <div class="path">${CORE.map((c) => stepHtml(c, ++n)).join('')}</div>

    <div class="callout" style="background:var(--gold-soft);border-color:color-mix(in srgb,var(--gold) 30%,transparent)">
      <span class="callout__ico" aria-hidden="true">⭐</span>
      <div><div class="callout__ttl">Hai file ⭐ không được bỏ</div>
      <div class="callout__bd"><b>Glossary</b> tránh cả đội gọi một thứ bằng ba tên khác nhau —
      <code>SPECTATOR</code> là <b>vai trò</b>, <code>WATCH</code> là <b>loại quyền</b> của tấm vé.<br>
      <b>Hệ toạ độ</b>: ĐEN ở trên (y=0), ĐỎ ở dưới (y=9), y tăng từ trên xuống.
      Mã nguồn lần trước đã <b>đảo ngược</b> đúng chỗ này.</div></div>
    </div>`;

  const warn = r.warn ? `
    <div class="callout">
      <span class="callout__ico" aria-hidden="true">⚠️</span>
      <div><div class="callout__ttl">${esc(r.warn.t)}</div>
        <div class="callout__bd">${
          r.warn.pre
            ? '<pre style="margin:6px 0 0;padding:11px 13px;background:var(--surface);border:1px solid var(--border);border-radius:8px;overflow-x:auto;font-size:12.6px;line-height:1.6">' + esc(r.warn.pre) + '</pre>'
            : '<table style="width:100%;border-collapse:collapse;font-size:13.6px">' +
              r.warn.rows.map((w) => `<tr><td style="padding:4px 9px 4px 0;white-space:nowrap;font-weight:700">${w[0]}</td><td style="padding:4px 0">${w[1]}</td></tr>`).join('') +
              '</table>'
        }</div></div>
    </div>` : '';

  const quiz = r.skipCore ? '' : `
    <div class="sechd"><h2>Tự kiểm tra sau Bộ lõi</h2><p>Trả lời được hết thì đi tiếp. Không thì đọc lại.</p></div>
    ${QUIZ.map((q, i) => `<details class="doc" style="margin:0 0 8px"><summary>${i + 1}. ${esc(q[0])}</summary><div style="padding-top:4px">${q[1]}</div></details>`).join('')}`;

  return `<div class="wrap">
    <div class="crumb"><a href="#/">Trang chủ</a> › Lộ trình đọc</div>
    <h1 style="font-size:30px;margin:0 0 6px;letter-spacing:-.02em">${r.icon} ${esc(r.name)}</h1>
    <p style="color:var(--text-soft);font-size:16px;margin:0 0 20px">${esc(r.desc)} <b>${r.time}</b></p>

    <div class="progbox">
      <div class="progbox__top">
        <span class="progbox__n">${pr.pct}%</span>
        <span class="progbox__l">đã đọc ${pr.done}/${pr.total} tài liệu${pr.pct === 100 ? ' — xong rồi, bắt tay làm thôi 🎉' : ''}</span>
      </div>
      <div class="progbox__bar"><div class="progbox__fill" style="width:${pr.pct}%"></div></div>
    </div>

    ${coreHtml}

    <div class="sechd"><h2>Phần riêng cho vai trò này</h2></div>
    <div class="path">${r.steps.map((s) => stepHtml(s, ++n)).join('')}</div>

    ${warn}
    ${quiz}

    ${r.next ? `<div class="callout" style="background:var(--green-soft);border-color:color-mix(in srgb,var(--green) 30%,transparent)">
      <span class="callout__ico" aria-hidden="true">🚀</span>
      <div><div class="callout__ttl">${esc(r.next.t)}</div>
      <div class="callout__bd">${esc(r.next.d)} → <a href="#/doc/${esc(r.next.p)}">mở tài liệu</a></div></div>
    </div>` : ''}

    <div class="pager">
      <a class="pager__item" href="#/"><span class="pager__lbl">Quay lại</span><span class="pager__ttl">Chọn vai trò khác</span></a>
      <a class="pager__item pager__item--next" href="#/doc/docs/ONBOARDING.md"><span class="pager__lbl">Bản đầy đủ</span><span class="pager__ttl">ONBOARDING.md</span></a>
    </div>
  </div>`;
}

function viewDoc(path) {
  const f = fileOf(path);
  if (!f) {
    return { html: `<div class="wrap"><h1>Không tìm thấy tài liệu</h1>
      <p style="color:var(--text-soft)"><code>${esc(path)}</code> không có trong bộ dữ liệu.</p>
      <p><a href="#/">← Về trang chủ</a></p></div>`, toc: [] };
  }

  const { host, toc } = renderDoc(f.md, path);
  const g = groupOf(f.group);

  /* tìm trang trước / sau trong cùng danh sách */
  const list = (DB.files[path] ? DB.order : (window.__ARCHIVE__ ? window.__ARCHIVE__.order : []));
  const i = list.indexOf(path);
  const prev = i > 0 ? list[i - 1] : null;
  const next = i >= 0 && i < list.length - 1 ? list[i + 1] : null;
  const pg = (p, kind) => {
    if (!p) return '<span class="pager__item" style="visibility:hidden"></span>';
    const ff = fileOf(p);
    return `<a class="pager__item${kind === 'next' ? ' pager__item--next' : ''}" href="#/doc/${p}">
      <span class="pager__lbl">${kind === 'next' ? 'Tiếp theo' : 'Trước đó'}</span>
      <span class="pager__ttl">${esc(ff ? ff.title : p)}</span></a>`;
  };

  const done = !!progress[path];
  const head = `<div class="crumb">
      <a href="#/">Trang chủ</a> › <span>${g.icon} ${esc(g.label)}</span> › <code style="font-size:11.5px">${esc(f.name)}</code>
      <span style="flex:1"></span>
      <button class="btn" id="btnDone" style="height:28px;font-size:12px">${done ? '✓ Đã đọc' : 'Đánh dấu đã đọc'}</button>
    </div>`;

  const historical = path.startsWith('docs/99-archive/') ||
    (path.startsWith('docs/08-ba-review/') && !['README.md', 'question-backlog-2026-09-22.md', 'final-audit-2026-09-22.md'].includes(f.name));
  const historyNote = historical ? '<div class="callout"><div><div class="callout__ttl">Tài liệu lịch sử</div><div class="callout__bd">Nội dung giữ nguyên để truy vết. Số liệu và trạng thái trong tài liệu này không đại diện đặc tả hiện hành. Xem <a href="#/doc/docs/08-ba-review/final-audit-2026-09-22.md">báo cáo hiện hành</a>.</div></div></div>' : '';
  return { html: head + historyNote + '<div id="docBody"></div>' +
      `<div class="pager">${pg(prev, 'prev')}${pg(next, 'next')}</div>`,
    node: host, toc, path };
}

function viewDir(dir) {
  const { list } = dirFiles(dir);
  const label = dir.split('/').pop();
  if (!list.length) {
    return `<div class="wrap"><div class="crumb"><a href="#/">Trang chủ</a> › Thư mục</div>
      <h1>Thư mục trống</h1><p style="color:var(--text-soft)">Không có tài liệu nào trong <code>${esc(dir)}</code>.</p></div>`;
  }
  const rows = list.map((p) => {
    const f = fileOf(p);
    return `<tr>
      <td><a href="#/doc/${p}">${esc(f.title)}</a>${f.blurb ? `<div style="color:var(--text-mute);font-size:12.5px;margin-top:2px">${esc(f.blurb)}</div>` : ''}</td>
      <td style="color:var(--text-mute);font-family:var(--mono);font-size:11.5px;white-space:nowrap">${esc(p.slice(dir.length + 1))}</td>
      <td style="text-align:right;color:var(--text-mute);white-space:nowrap">${f.lines} dòng</td></tr>`;
  }).join('');
  return `<div class="wrap wrap--wide">
    <div class="crumb"><a href="#/">Trang chủ</a> › <code style="font-size:11.5px">${esc(dir)}</code></div>
    <h1 style="margin:0 0 6px">📁 ${esc(label)}</h1>
    <p style="color:var(--text-soft);margin:0 0 18px">${list.length} tài liệu trong thư mục này.</p>
    <div class="doc"><div class="tablewrap"><table>
      <thead><tr><th>Tài liệu</th><th>Tên file</th><th style="text-align:right">Độ dài</th></tr></thead>
      <tbody>${rows}</tbody></table></div></div>
  </div>`;
}

function viewArchive() {
  if (!window.__ARCHIVE__) {
    return `<div class="wrap"><h1>Kho lưu trữ</h1>
      <p style="color:var(--text-soft)">Đang tải ${DB.stats.archive} tài liệu lần xây dựng trước…</p></div>`;
  }
  const A = window.__ARCHIVE__;
  const rows = A.order.map((p) => {
    const f = A.files[p];
    return `<tr><td><a href="#/doc/${p}">${esc(f.title)}</a></td>
      <td style="color:var(--text-mute);font-family:var(--mono);font-size:11.5px">${esc(p.replace('docs/99-archive/', ''))}</td>
      <td style="text-align:right;color:var(--text-mute);white-space:nowrap">${f.lines} dòng</td></tr>`;
  }).join('');

  return `<div class="wrap wrap--wide">
    <div class="crumb"><a href="#/">Trang chủ</a> › Kho lưu trữ</div>
    <h1 style="margin:0 0 8px">📦 Kho lưu trữ — ${A.order.length} tài liệu</h1>
    <div class="callout">
      <span class="callout__ico" aria-hidden="true">⛔</span>
      <div><div class="callout__ttl">Đây là lịch sử, không phải yêu cầu</div>
      <div class="callout__bd">Tài liệu của lần xây dựng trước. <b>Không</b> dùng làm căn cứ triển khai và <b>không xoá</b>.<br>
      Ngoại lệ đáng đọc: thư mục <b>reviews-v1</b> — 30 lỗi thật đã xảy ra, là lý do bộ tài liệu mới khắt khe đến vậy.</div></div>
    </div>
    <div class="doc"><div class="tablewrap"><table>
      <thead><tr><th>Tài liệu</th><th>Đường dẫn</th><th style="text-align:right">Độ dài</th></tr></thead>
      <tbody>${rows}</tbody></table></div></div>
  </div>`;
}

/* ============================================================
   ĐỊNH TUYẾN
   ============================================================ */
function loadArchive(cb) {
  if (window.__ARCHIVE__) return cb();
  const s = document.createElement('script');
  s.src = 'data/archive.js';
  s.onload = cb;
  s.onerror = () => cb(new Error('Không tải được kho lưu trữ'));
  document.head.appendChild(s);
}

function render() {
  const view = $('#view');
  const hash = location.hash.replace(/^#/, '') || '/';
  const parts = hash.split('/').filter(Boolean);

  closeSearch();
  $('#side').dataset.open = 'false';
  $('#scrim').dataset.open = 'false';
  $('#btnMenu').setAttribute('aria-expanded', 'false');

  if (parts[0] === 'doc') {
    const path = parts.slice(1).join('/');
    if (path.startsWith('docs/99-archive/') && !window.__ARCHIVE__) {
      view.innerHTML = '<div class="wrap"><p style="color:var(--text-mute)">Đang tải kho lưu trữ…</p></div>';
      loadArchive(() => render());
      return;
    }
    const r = viewDoc(path);
    view.innerHTML = r.html;
    if (r.node) $('#docBody').appendChild(r.node);
    buildToc(r.toc);
    markNav(path);
    document.title = (fileOf(path) ? fileOf(path).title + ' — ' : '') + 'Tài liệu Cờ Tướng Online';

    const b = $('#btnDone');
    if (b) b.addEventListener('click', () => {
      if (progress[path]) delete progress[path]; else progress[path] = true;
      saveProgress();
      b.textContent = progress[path] ? '✓ Đã đọc' : 'Đánh dấu đã đọc';
    });
  } else if (parts[0] === 'path') {
    view.innerHTML = viewPath(parts[1]);
    buildToc([]); markNav(null);
    document.title = 'Lộ trình đọc — Tài liệu Cờ Tướng Online';
    $$('.step__chk').forEach((c) => c.addEventListener('change', () => {
      const p = c.dataset.path;
      if (c.checked) progress[p] = true; else delete progress[p];
      saveProgress();
      render();
    }));
  } else if (parts[0] === 'dir') {
    const dir = parts.slice(1).join('/');
    if (dir.startsWith('docs/99-archive') && !window.__ARCHIVE__) {
      view.innerHTML = '<div class="wrap"><p style="color:var(--text-mute)">Đang tải kho lưu trữ…</p></div>';
      loadArchive(() => render());
      return;
    }
    view.innerHTML = viewDir(dir);
    buildToc([]); markNav(null);
    document.title = dir + ' — Tài liệu Cờ Tướng Online';
  } else if (parts[0] === 'archive') {
    if (!window.__ARCHIVE__) {
      view.innerHTML = viewArchive();
      loadArchive(() => render());
      return;
    }
    view.innerHTML = viewArchive();
    buildToc([]); markNav(null);
    document.title = 'Kho lưu trữ — Tài liệu Cờ Tướng Online';
  } else {
    view.innerHTML = viewHome();
    buildToc([]); markNav(null);
    document.title = 'Tài liệu dự án — Cờ Tướng Online';
  }

  /* cuộn lên đầu, trừ khi đang nhảy tới một mục trong trang */
  if (!/#h-\d+$/.test(location.hash)) window.scrollTo(0, 0);
}

/* ============================================================
   KHỞI ĐỘNG
   ============================================================ */
function init() {
  buildNav();
  render();
  addEventListener('hashchange', render);

  $('#btnTheme').addEventListener('click', () => {
    applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  $('#btnMenu').addEventListener('click', () => {
    const s = $('#side');
    const now = s.dataset.open === 'true' ? 'false' : 'true';
    s.dataset.open = now;
    $('#scrim').dataset.open = now;
    $('#btnMenu').setAttribute('aria-expanded', now);
  });
  $('#scrim').addEventListener('click', () => {
    $('#side').dataset.open = 'false';
    $('#scrim').dataset.open = 'false';
    $('#btnMenu').setAttribute('aria-expanded', 'false');
  });

  $('#btnSearch').addEventListener('click', openSearch);
  $('#ovlSearch').addEventListener('click', (e) => { if (e.target.id === 'ovlSearch') closeSearch(); });

  let t = null;
  $('#srchIn').addEventListener('input', (e) => {
    clearTimeout(t);
    const v = e.target.value;
    t = setTimeout(() => runSearch(v), 110);
  });

  $('#srchIn').addEventListener('keydown', (e) => {
    const hits = $$('.hit');
    if (!hits.length) return;
    let i = hits.findIndex((h) => h.classList.contains('is-sel'));
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (i >= 0) hits[i].classList.remove('is-sel');
      i = e.key === 'ArrowDown' ? (i + 1) % hits.length : (i - 1 + hits.length) % hits.length;
      hits[i].classList.add('is-sel');
      hits[i].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (i >= 0) { location.hash = hits[i].getAttribute('href').slice(1); closeSearch(); }
    }
  });

  addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); }
    else if (e.key === 'Escape') closeSearch();
    else if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
      e.preventDefault(); openSearch();
    }
  });
}

if (document.readyState === 'loading') addEventListener('DOMContentLoaded', init);
else init();

})();
