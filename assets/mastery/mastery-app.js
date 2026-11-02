/* ============================================================
   Mastery — Practice Amount Calculator
   محاسبه تعداد آیتم تمرین، توزیع لایه‌ای، بررسی واقع‌گرایی
   ============================================================ */
(function () {
  'use strict';

  const CONFIG = {
    dataUrl: './data/subjects.json',
    rootId: 'mastery-root'
  };

  let data = null;
  let currentSubject = null;
  let ratings = {}; // { edgeId: 'strong'|'medium'|'weak'|'unknown' }

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    const root = document.getElementById(CONFIG.rootId);
    if (!root) return;

    try {
      data = await fetchJson(CONFIG.dataUrl);
      renderApp(root);
    } catch (err) {
      root.innerHTML = `<div class="m-error">⚠️ خطا در بارگذاری داده‌ها: ${escapeHtml(err.message)}</div>`;
    }
  }

  async function fetchJson(url) {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
    return res.json();
  }

  /* ---------- رندر اصلی ---------- */
  function renderApp(root) {
    root.innerHTML = `
      <header class="m-header">
        <h1>${escapeHtml(data.meta.title)}</h1>
        <p>${escapeHtml(data.meta.subtitle)}</p>
      </header>

      <section class="m-section">
        <h2><span class="m-icon">۱</span> انتخاب درس</h2>
        <div class="m-subjects" id="m-subjects"></div>
      </section>

      <section class="m-section" id="m-edges-section" style="display:none;">
        <h2><span class="m-icon">۲</span> خودارزیابی یال‌های استنباطی</h2>
        <p style="color:var(--m-text-light);font-size:0.88rem;margin-bottom:16px;">
          برای هر یال، یکی از چهار سطح را انتخاب کن. پاسخ صادقانه، برآورد دقیق‌تری می‌دهد.
        </p>
        <div class="m-edges" id="m-edges"></div>

        <div class="m-inputs">
          <div class="m-input-group">
            <label for="m-hours">ساعت مطالعه در هفته</label>
            <input type="number" id="m-hours" min="1" max="60" value="5">
          </div>
          <div class="m-input-group">
            <label for="m-weeks">هفته‌های در دسترس</label>
            <input type="number" id="m-weeks" min="1" max="52" value="4">
          </div>
          <div class="m-input-group">
            <label for="m-minutes">دقیقه برای هر آیتم</label>
            <input type="number" id="m-minutes" min="1" max="30" value="${data.calc.minutes_per_item}">
          </div>
        </div>

        <button class="m-btn" id="m-calc">محاسبه میزان تمرین</button>
      </section>

      <div id="m-result"></div>

      <footer class="m-footer">
        ابزار تعیین میزان تمرین · بر پایه مدل یال استنباط (Inference Edge)
      </footer>
    `;

    renderSubjects(root);
  }

  function renderSubjects(root) {
    const wrap = root.querySelector('#m-subjects');
    wrap.innerHTML = data.subjects.map(s => `
      <div class="m-subject-card" data-id="${escapeHtml(s.id)}">
        <div class="m-icon-lg">${escapeHtml(s.icon)}</div>
        <div class="m-name">${escapeHtml(s.name)}</div>
        <div class="m-cat">${escapeHtml(s.category)}</div>
        <div class="m-summary">${escapeHtml(s.summary)}</div>
      </div>
    `).join('');

    wrap.querySelectorAll('.m-subject-card').forEach(card => {
      card.addEventListener('click', () => {
        wrap.querySelectorAll('.m-subject-card').forEach(c => c.classList.remove('is-active'));
        card.classList.add('is-active');
        const id = card.getAttribute('data-id');
        selectSubject(root, id);
      });
    });
  }

  function selectSubject(root, subjectId) {
    currentSubject = data.subjects.find(s => s.id === subjectId);
    if (!currentSubject) return;
    ratings = {};
    currentSubject.edges.forEach(e => { ratings[e.id] = 'unknown'; });

    const section = root.querySelector('#m-edges-section');
    section.style.display = 'block';
    renderEdges(root);
    root.querySelector('#m-result').innerHTML = '';
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderEdges(root) {
    const wrap = root.querySelector('#m-edges');
    wrap.innerHTML = currentSubject.edges.map(e => {
      const layerMeta = data.layer_meta[e.D];
      const layerClass = 'm-layer-' + e.D;
      return `
        <div class="m-edge" data-edge-id="${escapeHtml(e.id)}">
          <div class="m-edge-label">
            <div>${escapeHtml(e.id)}: ${escapeHtml(e.label)}</div>
            <div class="m-edge-meta">
              <span class="m-layer-tag ${layerClass}">${escapeHtml(layerMeta.label)}</span>
              · نوع: ${escapeHtml(e.R)}
            </div>
          </div>
          <div class="m-ratings">
            ${['strong','medium','weak','unknown'].map(k => `
              <label class="is-${k}" data-rating="${k}">
                <input type="radio" name="rate_${escapeHtml(e.id)}" value="${k}" ${k === 'unknown' ? 'checked' : ''}>
                <span>${escapeHtml(shortLabel(k))}</span>
              </label>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');

    // Event delegation
    wrap.querySelectorAll('.m-ratings').forEach(group => {
      group.addEventListener('change', (ev) => {
        const edgeEl = group.closest('.m-edge');
        const edgeId = edgeEl.getAttribute('data-edge-id');
        const val = ev.target.value;
        ratings[edgeId] = val;
        // visual feedback
        group.querySelectorAll('label').forEach(l => l.style.outline = '');
        const active = group.querySelector(`label[data-rating="${val}"]`);
        if (active) active.style.outline = '2px solid ' + layerColor(edgeId);
      });
    });
  }

  function shortLabel(k) {
    return { strong: 'قوی', medium: 'متوسط', weak: 'ضعیف', unknown: 'نمی‌دانم' }[k];
  }

  function layerColor(edgeId) {
    const e = currentSubject.edges.find(x => x.id === edgeId);
    return e ? data.layer_meta[e.D].color : '#1e3a5f';
  }

  /* ---------- محاسبه ---------- */
  function calculate(hoursPerWeek, weeks, minutesPerItem) {
    const ratingWeights = data.rating_weights;
    const layerMeta = data.layer_meta;
    const debt = data.calc.debt_multiplier;

    let totalRaw = 0;
    const perLayer = { near: 0, mid: 0, far: 0 };
    const priority = [];

    currentSubject.edges.forEach(e => {
      const rating = ratings[e.id] || 'unknown';
      const w = ratingWeights[rating] || 1;
      const mult = layerMeta[e.D].multiplier || 1;
      const items = w * mult;
      totalRaw += items;
      perLayer[e.D] += items;
      priority.push({ edge: e, rating, items });
    });

    const totalItems = Math.max(data.calc.min_items, Math.round(totalRaw * debt));

    // توزیع نهایی: نسبت‌های perLayer × totalItems
    const rawSum = perLayer.near + perLayer.mid + perLayer.far || 1;
    const distribution = {
      near: Math.max(1, Math.round((perLayer.near / rawSum) * totalItems)),
      mid:  Math.max(1, Math.round((perLayer.mid  / rawSum) * totalItems)),
      far:  Math.max(1, Math.round((perLayer.far  / rawSum) * totalItems))
    };
    // اصلاح گرد کردن
    const sumDist = distribution.near + distribution.mid + distribution.far;
    if (sumDist !== totalItems) {
      distribution.mid += (totalItems - sumDist);
    }

    const minutes = totalItems * minutesPerItem;
    const hours = minutes / 60;
    const weeksNeeded = hoursPerWeek > 0 ? hours / hoursPerWeek : Infinity;

    // فوریت / واقع‌گرایی
    let feasibility;
    if (weeksNeeded <= weeks) {
      feasibility = {
        status: 'ok',
        title: '✅ برنامه در بازه انتخابی، قابل تحقق است',
        text: `برای این مسیر، به حدود ${formatNum(weeksNeeded)} هفته نیاز داری؛ در حالی که ${weeks} هفته در دسترس داری. حاشیه امن داری — می‌توانی یک لایه D₃ اضافه کنی.`
      };
    } else if (weeksNeeded <= weeks * 1.3) {
      feasibility = {
        status: 'tight',
        title: '⚠️ برنامه فشرده است',
        text: `حدود ${formatNum(weeksNeeded)} هفته نیاز داری ولی ${weeks} هفته داری. با نظم دقیق شدنی است، ولی اگر جایی عقب بمانی، باید بازه را تمدید کنی.`
      };
    } else {
      feasibility = {
        status: 'risky',
        title: '❌ برنامه واقع‌گرایانه نیست',
        text: `حدود ${formatNum(weeksNeeded)} هفته نیاز داری ولی فقط ${weeks} هفته داری. پیشنهاد: یا بازه را تمدید کن، یا فعلاً روی D₁ و D₂ تمرکز کن و D₃ را به دور بعد موکول کن.`
      };
    }

    // اولویت‌بندی
    const prioritySorted = priority
      .filter(p => p.rating !== 'strong')
      .sort((a, b) => {
        const ratingOrder = { weak: 0, unknown: 1, medium: 2, strong: 3 };
        const layerOrder = { near: 0, mid: 1, far: 2 };
        const ra = ratingOrder[a.rating] - ratingOrder[b.rating];
        if (ra !== 0) return ra;
        return layerOrder[a.edge.D] - layerOrder[b.edge.D];
      });

    return {
      totalItems,
      distribution,
      minutes,
      hours,
      weeksNeeded,
      feasibility,
      prioritySorted,
      perLayer
    };
  }

  function formatNum(n) {
    if (n === Infinity || isNaN(n)) return '∞';
    return n < 10 ? n.toFixed(1) : Math.round(n).toString();
  }

  /* ---------- رندر نتیجه ---------- */
  function renderResult(root, r) {
    const wrap = root.querySelector('#m-result');
    const layerMeta = data.layer_meta;

    const priorityList = r.prioritySorted.slice(0, 8).map((p, i) => {
      const badge = ratingBadge(p.rating);
      const layerCls = 'm-layer-' + p.edge.D;
      return `<li>
        <span class="p-badge ${badge.cls}">${badge.text}</span>
        <strong>${escapeHtml(p.edge.id)}</strong>: ${escapeHtml(p.edge.label)}
        <span class="m-layer-tag ${layerCls}" style="margin-right:6px;">${escapeHtml(layerMeta[p.edge.D].label)}</span>
        <span style="color:var(--m-text-light);font-size:0.78rem;margin-right:6px;">(≈ ${Math.round(p.items * data.calc.debt_multiplier)} آیتم)</span>
      </li>`;
    }).join('');

    wrap.innerHTML = `
      <section class="m-result">
        <h2 style="color:var(--m-primary);font-size:1.3rem;margin:0 0 16px;">
          📊 برآورد شما
        </h2>

        <div class="m-stat-grid">
          <div class="m-stat">
            <div class="num">${r.totalItems}</div>
            <div class="lbl">کل آیتم تمرین</div>
          </div>
          <div class="m-stat">
            <div class="num">${formatNum(r.hours)}</div>
            <div class="lbl">ساعت تخمینی</div>
          </div>
          <div class="m-stat">
            <div class="num">${formatNum(r.weeksNeeded)}</div>
            <div class="lbl">هفته مورد نیاز</div>
          </div>
          <div class="m-stat">
            <div class="num">${Math.round(r.minutes)}</div>
            <div class="lbl">دقیقه مجموع</div>
          </div>
        </div>

        <div class="m-feasibility ${r.feasibility.status}">
          <strong>${escapeHtml(r.feasibility.title)}</strong>
          ${escapeHtml(r.feasibility.text)}
        </div>

        <h3 style="color:var(--m-primary);font-size:1rem;margin:20px 0 12px;">
          🎯 توزیع در سه لایه
        </h3>
        <div class="m-layer-breakdown">
          ${['near','mid','far'].map(k => `
            <div class="m-layer-card" style="border-right-color:${layerMeta[k].color};">
              <div class="l-name" style="color:${layerMeta[k].color};">${escapeHtml(layerMeta[k].label)}</div>
              <div class="l-count">${r.distribution[k]}</div>
              <div class="l-desc">${escapeHtml(layerMeta[k].description)}</div>
            </div>
          `).join('')}
        </div>

        ${priorityList ? `
          <div class="m-priority">
            <h3>🔢 اولویت تمرین (به ترتیب)</h3>
            <ol>${priorityList}</ol>
          </div>
        ` : `
          <div class="m-priority">
            <h3>✅ همه یال‌ها قوی‌اند</h3>
            <p style="color:var(--m-text-light);font-size:0.88rem;margin:0;">
              در خودارزیابی، همه یال‌ها را «قوی» زده‌ای. برای اطمینان، پیشنهاد می‌شود حداقل در لایه D₃ یک آزمون تأییدی بدهی.
            </p>
          </div>
        `}

        <div style="font-size:0.78rem;color:#8a9bad;margin-top:16px;text-align:center;font-style:italic;line-height:1.75;">
          این برآورد بر اساس وزن خودارزیابی (قوی=۱، متوسط=۲، ضعیف=۴، نمی‌دانم=۳)، ضریب لایه (D₁=۱٫۰، D₂=۱٫۵، D₃=۲٫۰) و ضریب بدهی (۱٫۵) محاسبه شده است.
          این اعداد تقریبی‌اند و با پیشرفت واقعی، بازنگری می‌شوند.
        </div>
      </section>
    `;
  }

  function ratingBadge(rating) {
    return {
      strong:  { cls: 'is-strong',  text: 'قوی' },
      medium:  { cls: 'is-medium',  text: 'متوسط' },
      weak:    { cls: 'is-weak',    text: 'ضعیف' },
      unknown: { cls: 'is-unknown', text: 'نمی‌دانم' }
    }[rating] || { cls: '', text: '—' };
  }

  /* ---------- اتصال دکمه ---------- */
  document.addEventListener('click', (ev) => {
    if (ev.target && ev.target.id === 'm-calc') {
      const root = document.getElementById(CONFIG.rootId);
      if (!root || !currentSubject) return;
      const hours = parseFloat(root.querySelector('#m-hours').value) || 0;
      const weeks = parseFloat(root.querySelector('#m-weeks').value) || 1;
      const minutes = parseFloat(root.querySelector('#m-minutes').value) || data.calc.minutes_per_item;

      if (hours <= 0) {
        alert('لطفاً ساعت مطالعه هفتگی را وارد کن.');
        return;
      }

      const result = calculate(hours, weeks, minutes);
      renderResult(root, result);
      root.querySelector('#m-result').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  /* ---------- Helpers ---------- */
  function escapeHtml(s) {
    return s == null ? '' : String(s).replace(/[&<>"']/g, c =>
      ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  }
})();
