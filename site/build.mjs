#!/usr/bin/env node
/**
 * BUILD — gom toàn bộ tài liệu .md thành file dữ liệu JS.
 *
 * Vì sao phải làm thế này: trình duyệt CHẶN fetch() khi mở bằng file://
 * nên không thể tải .md lúc chạy. Nhúng sẵn vào .js là cách duy nhất
 * để trang mở được bằng double-click, không cần server.
 *
 * Chạy:  node site/build.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT  = join(ROOT, 'site', 'data');

/* ---------- Nhãn tiếng Việt cho từng thư mục ---------- */
const GROUPS = [
  { id: '_root',              label: 'Cổng vào',            icon: '🏠', desc: 'Điểm bắt đầu cho người mới và cho agent' },
  { id: '00-overview',        label: 'Tổng quan',            icon: '📖', desc: 'Sản phẩm · thuật ngữ · vai trò · phạm vi' },
  { id: '01-requirements',    label: 'Yêu cầu chức năng',    icon: '📋', desc: 'R01–R19 và các module yêu cầu' },
  { id: '02-flows',           label: 'Luồng người dùng',     icon: '🔀', desc: 'Từng bước, kể cả nhánh lỗi' },
  { id: '03-screens',         label: 'Màn hình',             icon: '🖼️', desc: 'Màn hình · trạng thái · bộ biến thiết kế' },
  { id: '04-business-rules',  label: 'Luật',                 icon: '⚖️', desc: 'Luật cờ · luật nghiệp vụ · ma trận quyền' },
  { id: '05-data-and-realtime', label: 'Dữ liệu & realtime', icon: '🗄️', desc: 'Mô hình · luồng · máy trạng thái' },
  { id: '06-acceptance',      label: 'Nghiệm thu',           icon: '✅', desc: 'Tiêu chí · kịch bản · truy vết hiện hành' },
  { id: '07-decisions',       label: 'Quyết định',           icon: '🧭', desc: 'Nhật ký quyết định và phần đã thay thế' },
  { id: '08-ba-review',       label: 'Kiểm định BA',         icon: '🔍', desc: 'Audit · truy vết · câu hỏi' },
  { id: '09-technical',       label: 'Kỹ thuật',             icon: '🛠️', desc: 'Kiến trúc · công nghệ · triển khai' },
  { id: '10-issues',          label: 'Đầu việc',             icon: '🧱', desc: '138 issue triển khai' },
];
const GROUP_ORDER = Object.fromEntries(GROUPS.map((g, i) => [g.id, i]));

/* ---------- Tiện ích ---------- */
const walk = (dir, acc = []) => {
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.')) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (name.endsWith('.md')) acc.push(p);
  }
  return acc;
};

const titleOf = (md, fallback) => {
  const m = md.match(/^#\s+(.+)$/m);
  if (!m) return fallback;
  return m[1]
    .replace(/[⛔⭐⚠️⚠🏠📖📋🔀🖼️⚖️🗄️✅🧭🔍🛠️🧱🎨⚙️🧪🚀🤖🎮📐📊📁📌📜❓🔨]/g, '')
    .replace(/`([^`]*)`/g, '$1')      // bỏ dấu mã nghiêng
    .replace(/\*\*?([^*]*)\*\*?/g, '$1') // bỏ dấu đậm/nghiêng
    .replace(/\s+/g, ' ')
    .trim();
};

/** Mô tả ngắn: lấy dòng chữ thường đầu tiên sau phần metadata */
const blurbOf = (md) => {
  const lines = md.split('\n');
  for (let i = 1; i < Math.min(lines.length, 40); i++) {
    let l = lines[i].trim();
    if (!l || l.startsWith('#') || l.startsWith('|') || l.startsWith('---')) continue;
    if (l.startsWith('>')) l = l.replace(/^>\s*/, '');
    if (/^\*\*(ID|Nhóm|Trạng thái|Cập nhật|Căn cứ|Dành cho|Áp dụng)/.test(l)) continue;
    l = l.replace(/[*`\[\]]/g, '').replace(/\(([^)]*)\)/g, '').trim();
    if (l.length > 25) return l.length > 180 ? l.slice(0, 177) + '…' : l;
  }
  return '';
};

/** Heading cấp 2–3 để dựng mục lục bên phải */
const headingsOf = (md) => {
  const out = [];
  let inFence = false;
  for (const raw of md.split('\n')) {
    if (/^\s*```/.test(raw)) { inFence = !inFence; continue; }
    if (inFence) continue;
    const m = raw.match(/^(#{2,3})\s+(.+?)\s*$/);
    if (m) out.push({ lvl: m[1].length, text: m[2] });
  }
  return out;
};

/* ---------- Gom dữ liệu ---------- */
function collect(paths, { includeBody = true } = {}) {
  const files = {};
  for (const abs of paths) {
    const rel = relative(ROOT, abs).split(sep).join('/');
    const md = readFileSync(abs, 'utf8');
    const parts = rel.split('/');
    let group = '_root';
    if (parts[0] === 'docs' && parts.length > 2) group = parts[1];
    else if (parts[0] === 'docs') group = '_root';

    files[rel] = {
      path: rel,
      name: parts[parts.length - 1],
      group,
      title: titleOf(md, parts[parts.length - 1]),
      blurb: blurbOf(md),
      lines: md.split('\n').length,
      chars: md.length,
      headings: headingsOf(md),
      ...(includeBody ? { md } : {}),
    };
  }
  return files;
}

/* ---------- Thứ tự hiển thị trên thanh bên ---------- */
function sortPaths(files) {
  return Object.keys(files).sort((a, b) => {
    const ga = GROUP_ORDER[files[a].group] ?? 99;
    const gb = GROUP_ORDER[files[b].group] ?? 99;
    if (ga !== gb) return ga - gb;
    // README lên đầu nhóm
    const ra = /README\.md$/.test(a) ? 0 : 1;
    const rb = /README\.md$/.test(b) ? 0 : 1;
    if (ra !== rb) return ra - rb;
    return a.localeCompare(b, 'vi', { numeric: true });
  });
}

/* ---------- Chạy ---------- */
mkdirSync(OUT, { recursive: true });

const docsAll   = walk(join(ROOT, 'docs'));
const mainPaths = docsAll.filter(p => !p.includes(`${sep}99-archive${sep}`));
const archPaths = docsAll.filter(p =>  p.includes(`${sep}99-archive${sep}`));
for (const f of ['README.md', 'AGENTS.md']) {
  try { statSync(join(ROOT, f)); mainPaths.unshift(join(ROOT, f)); } catch {}
}

const files = collect(mainPaths);
const order = sortPaths(files);

const payload = {
  generatedAt: new Date().toISOString().slice(0, 10),
  groups: GROUPS.filter(g => order.some(p => files[p].group === g.id)),
  order,
  files,
  stats: {
    docs: order.length,
    chars: order.reduce((s, p) => s + files[p].chars, 0),
    lines: order.reduce((s, p) => s + files[p].lines, 0),
    archive: archPaths.length,
    screens: new Set(files['docs/03-screens/screen-inventory.md'].md.match(/^\| `SCR-(?!RULE)[A-Z-]+`/gm) || []).size,
    businessRules: (files['docs/06-acceptance/requirement-register.md'].md.match(/^\| `BR-[A-Z]+-\d+`/gm) || []).length,
    acceptance: (files['docs/06-acceptance/requirement-register.md'].md.match(/^\| `AC-[A-Z]+-\d+`/gm) || []).length,
    decisions: (files['docs/07-decisions/decision-log.md'].md.match(/^## DEC-\d+/gm) || []).length,
  },
};

writeFileSync(join(OUT, 'docs.js'),
  `/* Sinh tự động bởi site/build.mjs — ĐỪNG SỬA TAY */\nwindow.__DOCS__ = ${JSON.stringify(payload)};\n`);

const archFiles = collect(archPaths);
writeFileSync(join(OUT, 'archive.js'),
  `/* Sinh tự động — tải theo yêu cầu */\nwindow.__ARCHIVE__ = ${JSON.stringify({
    groups: [{ id: '99-archive', label: 'Lưu trữ', icon: '📦', desc: 'Tài liệu lần xây dựng trước — KHÔNG dùng làm căn cứ' }],
    order: sortPaths(archFiles),
    files: archFiles,
  })};\n`);

const kb = n => (n / 1024).toFixed(0) + ' KB';
console.log(`✓ docs.js     ${payload.stats.docs} file · ${kb(statSync(join(OUT,'docs.js')).size)}`);
console.log(`✓ archive.js  ${archPaths.length} file · ${kb(statSync(join(OUT,'archive.js')).size)}`);
