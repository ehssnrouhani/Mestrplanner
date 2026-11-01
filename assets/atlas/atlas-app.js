/* ============================================================
   Atlas — App Loader & Renderer (Phase 1)
   وظیفه: بارگذاری JSON و رندر اطلس ایستا.
   منطق تصمیم در فازهای بعد به فایل‌های جداگانه منتقل می‌شود.
   ============================================================ */

(function () {
  'use strict';

  const CONFIG = {
    // مسیر نسبی — نسبت به محل همین فایل JS
    jsonUrl: './data/careers.json',
    rootId: 'atlas-root'
  };

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    const root = document.getElementById(CONFIG.rootId);
    if (!root) {
      console.error('[Atlas] #atlas-root یافت نشد.');
      return;
    }

    try {
      const data = await loadJson(CONFIG.jsonUrl);
      root.innerHTML = renderAtlas(data);
    } catch (err) {
      console.error('[Atlas]', err);
      root.innerHTML = renderError(err, CONFIG.jsonUrl);
    }
  }

  async function loadJson(url) {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`);
    return res.json();
  }

  /* --------------------- Render --------------------- */

  function renderAtlas({ meta, paths, analysis, methodology, footer_text }) {
    return `
      ${renderHeader(meta)}
      ${renderIntro(meta)}
      ${renderTable(paths)}
      ${renderAnalysis(analysis)}
      ${renderMethodology(methodology)}
      ${renderFooter(footer_text)}
    `;
  }

  function renderHeader(meta) {
    const badges = (meta.header_badges || [])
      .map(b => `<span>${escapeHtml(b.icon)} ${escapeHtml(b.text)}</span>`)
      .join('');
    return `
      <header class="atlas-header">
        <h1>${escapeHtml(meta.title)}</h1>
        <div class="atlas-subtitle">${escapeHtml(meta.subtitle)}</div>
        <div class="atlas-meta">${badges}</div>
      </header>
    `;
  }

  function renderIntro(meta) {
    const paragraphs = (meta.why_paragraphs || [])
      .map(p => `<p>${escapeHtml(p)}</p>`)
      .join('');
    const stats = (meta.stats || [])
      .map(s => `
        <div class="atlas-stat-card">
          <div class="num">${escapeHtml(s.num)}</div>
          <div class="label">${escapeHtml(s.label)}</div>
        </div>
      `)
      .join('');
    return `
      <section class="atlas-intro">
        <h2>${escapeHtml(meta.why_title)}</h2>
        ${paragraphs}
        <div class="atlas-stats-grid">${stats}</div>
      </section>
    `;
  }

  function renderTable(paths) {
    const rows = paths.map(p => `
      <tr>
        <td>
          <div class="atlas-cat-name">${escapeHtml(toPersianDigit(p.id))}. ${escapeHtml(p.name)}</div>
          <span class="atlas-cat-badge ${escapeHtml(p.badge_class)}">${escapeHtml(p.badge_label)}</span>
        </td>
        <td>${escapeHtml(p.income_logic)}</td>
        <td>
          <span class="atlas-skills-tag ${escapeHtml(p.skill_tag_class)}">${escapeHtml(p.skill_tag_label)}</span>
          ${escapeHtml(p.development)}
        </td>
        <td>
          <ul class="atlas-example-list">
            ${p.examples.map(ex => `<li>${escapeHtml(ex)}</li>`).join('')}
          </ul>
        </td>
      </tr>
    `).join('');

    return `
      <section class="atlas-section">
        <h2><span class="atlas-icon">۱</span> جدول اصلی: ده مسیر شغلی</h2>
        <table class="atlas-table">
          <thead>
            <tr>
              <th style="width:15%;">مسیر شغلی</th>
              <th style="width:25%;">منطق اصلی درآمد (توصیفی)</th>
              <th style="width:20%;">نسبت با مهارت، دانش و توسعه فردی</th>
              <th style="width:40%;">مثال‌های ملموس از شغل‌ها</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </section>
    `;
  }

  function renderAnalysis(analysis) {
    if (!analysis) return '';
    const cards = analysis.cards.map(card => {
      const variantClass = card.variant && card.variant !== 'default'
        ? `is-${card.variant}`
        : '';
      const body = card.type === 'list'
        ? `<ul class="atlas-key-points">
             ${card.items.map(i => `<li>${escapeHtml(i)}</li>`).join('')}
           </ul>`
        : `<p>${escapeHtml(card.content)}</p>`;
      return `
        <div class="atlas-analysis-card ${variantClass}">
          <h3>${escapeHtml(card.icon)} ${escapeHtml(card.title)}</h3>
          ${body}
        </div>
      `;
    }).join('');

    return `
      <section class="atlas-analysis">
        <h2>${escapeHtml(analysis.title)}</h2>
        <div class="atlas-analysis-grid">${cards}</div>
      </section>
    `;
  }

  function renderMethodology(methodology) {
    if (!methodology) return '';
    return `
      <div class="atlas-methodology">
        <h3>${escapeHtml(methodology.title)}</h3>
        ${methodology.paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('')}
      </div>
    `;
  }

  function renderFooter(text) {
    if (!text) return '';
    return `<footer class="atlas-footer">${escapeHtml(text)}</footer>`;
  }

  function renderError(err, url) {
    return `
      <div class="atlas-error">
        <h2>⚠️ خطا در بارگذاری داده‌ها</h2>
        <p>اطلس نتوانست فایل <code>${escapeHtml(url)}</code> را بخواند.</p>
        <p>مطمئن شوید که سایت را از طریق یک وب‌سرور (نه باز کردن مستقیم فایل) اجرا می‌کنید.</p>
        <pre>${escapeHtml(err.message)}</pre>
      </div>
    `;
  }

  /* --------------------- Helpers --------------------- */

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function toPersianDigit(n) {
    return String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
  }
})();
