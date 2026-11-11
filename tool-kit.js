/* مستر پلنر — کیت مشترک ابزارها */
const Kit = (() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fa = (v, d = 0) => (v === null || v === undefined || !isFinite(v)) ? '—' : Number(v).toLocaleString('fa-IR', { maximumFractionDigits: d, minimumFractionDigits: 0 });
  const pct = (v, d = 0) => fa(v * 100, d) + '٪';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const store = {
    get(k, def) { try { const r = localStorage.getItem(k); return r == null ? def : JSON.parse(r); } catch (e) { return def; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };

  let tt;
  function toast(msg) {
    let t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2200);
  }

  function setTheme(t) { document.documentElement.dataset.theme = t; store.set('kit-theme', t); }
  function initTheme() { setTheme(store.get('kit-theme', 'dark')); }

  const TOOLS = [
    ['decision-maker.html', 'تسلط‌ساز'], ['exam-analysis.html', 'تحلیل آزمون'], ['daily-notebook.html', 'دفترچهٔ روزانه'],
    ['guidance-9.html', 'هدایت تحصیلی نهم'], ['study-strategies.html', 'راهبردهای مطالعه'], ['planner.html', 'برنامه‌ریز چندبعدی'],
    ['major-selection.html', 'انتخاب رشته'], ['concept-maker.html', 'مفهوم‌ساز'], ['relations-workbench.html', 'تحلیل ارتباطات']
  ];
  function header(title, extra = '') {
    const h = $('#kit-header'); if (!h) return;
    h.className = 'kit-header';
    h.innerHTML = `<div class="kit-bar">
      <a class="kit-brand" href="index.html"><b>م</b><span>مستر پلنر</span></a>
      <span class="kit-crumb">/ <strong>${esc(title)}</strong></span><span class="kit-spacer"></span>${extra}
      <details class="kit-menu no-print"><summary class="btn sm">ابزارهای دیگر ▾</summary><div class="drop">${TOOLS.map(t => `<a href="${t[0]}">${t[1]}</a>`).join('')}</div></details>
      <button class="btn sm no-print" id="kitTheme" title="تغییر تم">◐ تم</button>
      <button class="btn sm no-print" onclick="window.print()" title="چاپ یا PDF">⎙ چاپ</button></div>`;
    $('#kitTheme').onclick = () => { setTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'); document.dispatchEvent(new Event('kit-theme')); };
  }

  function tabs(root = document) {
    const btns = $$('.tab-btn', root);
    const go = n => { btns.forEach(b => b.classList.toggle('active', b.dataset.tab === n)); $$('.tab-panel', root).forEach(p => p.classList.toggle('active', p.id === 'tab-' + n)); store.set('kit-tab-' + location.pathname, n); document.dispatchEvent(new CustomEvent('kit-tab', { detail: n })); };
    btns.forEach(b => b.addEventListener('click', () => go(b.dataset.tab)));
    const saved = store.get('kit-tab-' + location.pathname, null);
    if (saved && btns.some(b => b.dataset.tab === saved)) go(saved);
    return go;
  }

  function download(name, text, mime = 'application/json') {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + text], { type: mime + ';charset=utf-8' }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  function pickFile(accept, cb) {
    const i = document.createElement('input'); i.type = 'file'; i.accept = accept;
    i.onchange = () => { const f = i.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => cb(String(r.result).replace(/^﻿/, ''), f); r.readAsText(f, 'utf-8'); };
    i.click();
  }

  /* تاریخ جلالی با Intl */
  const jal = (d, o = { year: 'numeric', month: 'long', day: 'numeric' }) => new Date(d).toLocaleDateString('fa-IR-u-ca-persian', o);
  const iso = d => { d = new Date(d); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

  /* آمار */
  const mean = a => a.length ? a.reduce((s, v) => s + v, 0) / a.length : NaN;
  function pearson(x, y) {
    const n = x.length; if (n < 3) return NaN;
    const mx = mean(x), my = mean(y); let sxy = 0, sxx = 0, syy = 0;
    for (let i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; }
    return sxx && syy ? sxy / Math.sqrt(sxx * syy) : NaN;
  }
  function wilson(k, n, z = 1.96) { // بازهٔ اطمینان ویلسون برای نسبت
    if (!n) return [0, 1]; const p = k / n, d = 1 + z * z / n;
    const c = (p + z * z / (2 * n)) / d, h = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d;
    return [Math.max(0, c - h), Math.min(1, c + h)];
  }

  /* نمودار خطی/ناحیه‌ای عمومی (SVG) */
  function chart(svg, c) {
    const W = c.w || 720, H = c.h || 320, P = Object.assign({ l: 52, r: 18, t: 18, b: 44 }, c.pad || {});
    const [x0, x1] = c.x, [y0, y1] = c.y;
    const X = v => P.l + (v - x0) / (x1 - x0) * (W - P.l - P.r), Y = v => H - P.b - (v - y0) / (y1 - y0) * (H - P.t - P.b);
    const o = [], xt = c.xTicks || 6, yt = c.yTicks || 5;
    for (let i = 0; i <= yt; i++) { const v = y0 + (y1 - y0) * i / yt, y = Y(v); o.push(`<line x1="${P.l}" x2="${W - P.r}" y1="${y}" y2="${y}" stroke="var(--line)" stroke-width=".7"/><text x="${P.l - 8}" y="${y + 4}" text-anchor="end">${(c.yFmt || fa)(v)}</text>`); }
    for (let i = 0; i <= xt; i++) { const v = x0 + (x1 - x0) * i / xt, x = X(v); o.push(`<line x1="${x}" x2="${x}" y1="${P.t}" y2="${H - P.b}" stroke="var(--line)" stroke-width=".5" opacity=".6"/><text x="${x}" y="${H - P.b + 16}" text-anchor="middle">${(c.xFmt || fa)(v)}</text>`); }
    if (c.xLabel) o.push(`<text x="${(P.l + W - P.r) / 2}" y="${H - 6}" text-anchor="middle">${c.xLabel}</text>`);
    if (c.yLabel) o.push(`<text transform="rotate(-90)" x="${-(P.t + H - P.b) / 2}" y="13" text-anchor="middle">${c.yLabel}</text>`);
    (c.bands || []).forEach(b => { const up = b.hi.map(p => `${X(p[0])},${Y(p[1])}`), lo = b.lo.slice().reverse().map(p => `${X(p[0])},${Y(p[1])}`); o.push(`<polygon points="${up.concat(lo).join(' ')}" fill="${b.color}" opacity=".18"/>`); });
    (c.hlines || []).forEach(h => { const y = Y(h.y); o.push(`<line x1="${P.l}" x2="${W - P.r}" y1="${y}" y2="${y}" stroke="${h.color}" stroke-width="1.5" stroke-dasharray="6 4"/><text x="${W - P.r - 4}" y="${y - 5}" text-anchor="end" style="fill:${h.color}">${h.label}</text>`); });
    (c.vlines || []).forEach(v => { const x = X(v.x); o.push(`<line x1="${x}" x2="${x}" y1="${P.t}" y2="${H - P.b}" stroke="${v.color}" stroke-width="1.5" stroke-dasharray="4 4"/><text x="${x + 4}" y="${P.t + 11}" style="fill:${v.color}">${v.label}</text>`); });
    (c.series || []).forEach(s => {
      const pts = s.pts.map(p => `${X(p[0])},${Y(p[1])}`).join(' ');
      if (s.area) o.push(`<polygon points="${X(s.pts[0][0])},${Y(y0)} ${pts} ${X(s.pts[s.pts.length - 1][0])},${Y(y0)}" fill="${s.color}" opacity=".12"/>`);
      if (s.bars) s.pts.forEach(p => { const bw = (W - P.l - P.r) / s.pts.length * .6; o.push(`<rect x="${X(p[0]) - bw / 2}" y="${Y(p[1])}" width="${bw}" height="${Math.max(0, Y(y0) - Y(p[1]))}" fill="${s.color}" rx="3" opacity=".85"/>`); });
      else o.push(`<polyline points="${pts}" fill="none" stroke="${s.color}" stroke-width="${s.w || 2.5}" ${s.dash ? `stroke-dasharray="${s.dash}"` : ''} stroke-linejoin="round" stroke-linecap="round"/>`);
      if (s.dots) s.pts.forEach(p => o.push(`<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="${s.r || 3.5}" fill="${s.color}" stroke="var(--panel)" stroke-width="1.5"/>`));
    });
    (c.marks || []).forEach(m => o.push(`<circle cx="${X(m.x)}" cy="${Y(m.y)}" r="6" fill="${m.color}" stroke="var(--panel)" stroke-width="2"/><text x="${X(m.x)}" y="${Y(m.y) - 11}" text-anchor="middle" style="fill:${m.color};font-weight:700">${m.label}</text>`));
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.classList.add('chart'); svg.innerHTML = o.join('');
  }

  return { $, $$, fa, pct, esc, clamp, store, toast, initTheme, setTheme, header, tabs, download, pickFile, jal, iso, addDays, mean, pearson, wilson, chart };
})();