/* ============================================================
   Mastery — Practice Calculator (Simple Language)
   ============================================================ */
(function () {
  'use strict';

  const CONFIG = {
    dataUrl: './data/subjects.json',
    rootId: 'mastery-root'
  };

  let data = null;
  let currentSubject = null;
  let ratings = {};

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    const root = document.getElementById(CONFIG.rootId);
    if (!root) return;
    try {
      data = await fetchJson(CONFIG.dataUrl);
      renderApp(root);
    } catch (err) {
      root.innerHTML = '<div class="m-error">⚠️ خطا در بارگذاری: ' + escapeHtml(err.message) + '</div>';
    }
  }

  async function fetchJson(url) {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status + ' — ' + url);
    return res.json();
  }

  /* ---------- رندر اصلی ---------- */
  function renderApp(root) {
    root.innerHTML = ''
      + '<header class="m-header">'
      +   '<h1>' + escapeHtml(data.meta.title) + '</h1>'
      +   '<p>' + escapeHtml(data.meta.subtitle) + '</p>'
      + '</header>'

      + '<div class="m-intro">'
      +   '<h3>🎯 این ابزار چه کار می‌کند؟</h3>'
      +   '<p>بهت می‌گوید برای تسلط بر یک درس، <strong>چقدر و چه نوع تمرینی</strong> لازم داری.</p>'
      +   '<ol>'
      +     '<li>درس را انتخاب کن</li>'
      +     '<li>برای هر مهارت، بگو الان چقدر بلدی (صادق باش!)</li>'
      +     '<li>ساعت مطالعه هفتگی‌ات را وارد کن</li>'
      +     '<li>ببین چقدر تمرین و چقدر زمان لازم داری</li>'
      +   '</ol>'
      + '</div>'

      + '<section class="m-section">'
      +   '<h2><span class="m-icon">۱</span> کدام درس؟</h2>'
      +   '<div class="m-subjects" id="m-subjects"></div>'
      + '</section>'

      + '<section class="m-section" id="m-edges-section" style="display:none;">'
      +   '<h2><span class="m-icon">۲</span> الان چقدر بلدی؟</h2>'
      +   '<p style="color:var(--m-text-light);font-size:0.88rem;margin-bottom:16px;">'
      +     'برای هر مهارت، یکی از چهار گزینه را انتخاب کن. اگر صادق باشی، نتیجه دقیق‌تر است.'
      +   '</p>'
      +   '<div class="m-edges" id="m-edges"></div>'
      +   '<h2 style="margin-top:24px;"><span class="m-icon">۳</span> چقدر وقت داری؟</h2>'
      +   '<div class="m-inputs">'
      +     '<div class="m-input-group">'
      +       '<label for="m-hours">هفته‌ای چند ساعت برای این درس وقت می‌گذاری؟</label>'
      +       '<input type="number" id="m-hours" min="1" max="40" value="4">'
      +     '</div>'
      +     '<div class="m-input-group">'
      +       '<label for="m-weeks">تا امتحان چند هفته وقت داری؟</label>'
      +       '<input type="number" id="m-weeks" min="1" max="52" value="4">'
      +     '</div>'
      +     '<div class="m-input-group">'
      +       '<label for="m-minutes">هر تمرین حدوداً چند دقیقه؟</label>'
      +       '<input type="number" id="m-minutes" min="1" max="20" value="3">'
      +     '</div>'
      +   '</div>'
      +   '<button class="m-btn" id="m-calc">ببین چقدر تمرین لازم داری</button>'
      + '</section>'

      + '<div id="m-result"></div>'

      + '<footer class="m-footer">'
      +   'ابزار تخمین تمرین · مستر پلنر'
      + '</footer>';

    renderSubjects(root);
  }

  function renderSubjects(root) {
    const wrap = root.querySelector('#m-subjects');
    wrap.innerHTML = data.subjects.map(function (s) {
      return ''
        + '<div class="m-subject-card" data-id="' + escapeHtml(s.id) + '">'
        +   '<div class="m-icon-lg">' + escapeHtml(s.icon) + '</div>'
        +   '<div class="m-name">' + escapeHtml(s.name) + '</div>'
        +   '<div class="m-cat">' + escapeHtml(s.category) + '</div>'
        +   '<div class="m-summary">' + escapeHtml(s.summary) + '</div>'
        + '</div>';
    }).join('');

    wrap.querySelectorAll('.m-subject-card').forEach(function (card) {
      card.addEventListener('click', function () {
        wrap.querySelectorAll('.m-subject-card').forEach(function (c) {
          c.classList.remove('is-active');
        });
        card.classList.add('is-active');
        selectSubject(root, card.getAttribute('data-id'));
      });
    });
  }

  function selectSubject(root, subjectId) {
    currentSubject = data.subjects.find(function (s) { return s.id === subjectId; });
    if (!currentSubject) return;
    ratings = {};
    currentSubject.edges.forEach(function (e) { ratings[e.id] = 'unknown'; });
    const section = root.querySelector('#m-edges-section');
    section.style.display = 'block';
    renderEdges(root);
    root.querySelector('#m-result').innerHTML = '';
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderEdges(root) {
    const wrap = root.querySelector('#m-edges');
    const keys = ['strong', 'medium', 'weak', 'unknown'];
    wrap.innerHTML = currentSubject.edges.map(function (e) {
      const layerMeta = data.layer_meta[e.D];
      const labelHtml = keys.map(function (k) {
        return ''
          + '<label class="is-' + k + '">'
          +   '<input type="radio" name="rate_' + escapeHtml(e.id) + '" value="' + k + '"'
          +     (k === 'unknown' ? ' checked' : '') + '>'
          +   '<span>' + escapeHtml(data.rating_labels[k]) + '</span>'
          + '</label>';
      }).join('');
      return ''
        + '<div class="m-edge" data-edge-id="' + escapeHtml(e.id) + '">'
        +   '<div class="m-edge-label">'
        +     '<div>' + escapeHtml(e.label) + '</div>'
        +     '<div class="m-edge-meta">'
        +       '<span class="m-layer-tag m-layer-' + e.D + '">'
        +         escapeHtml(layerMeta.label)
        +       '</span>'
        +     '</div>'
        +   '</div>'
        +   '<div class="m-ratings">' + labelHtml + '</div>'
        + '</div>';
    }).join('');

    wrap.querySelectorAll('.m-ratings').forEach(function (group) {
      group.addEventListener('change', function (ev) {
        const edgeId = group.closest('.m-edge').getAttribute('data-edge-id');
        ratings[edgeId] = ev.target.value;
      });
    });
  }

  /* ---------- محاسبه ---------- */
  function calculate(hoursPerWeek, weeks, minutesPerItem) {
    const rw = data.rating_weights;
    const lm = data.layer_meta;
    const debt = data.calc.debt_multiplier;

    let totalRaw = 0;
    const perLayer = { basic: 0, medium: 0, advanced: 0 };
    const priority = [];

    currentSubject.edges.forEach(function (e) {
      const rating = ratings[e.id] || 'unknown';
      const w = rw[rating] || 1;
      const mult = lm[e.D].multiplier || 1;
      const items = w * mult;
      totalRaw += items;
      perLayer[e.D] += items;
      priority.push({ edge: e, rating: rating, items: items });
    });

    const totalItems = Math.max(data.calc.min_items, Math.round(totalRaw * debt));

    const rawSum = perLayer.basic + perLayer.medium + perLayer.advanced || 1;
    const distribution = {
      basic:    Math.max(1, Math.round((perLayer.basic    / rawSum) * totalItems)),
      medium:   Math.max(1, Math.round((perLayer.medium   / rawSum) * totalItems)),
      advanced: Math.max(1, Math.round((perLayer.advanced / rawSum) * totalItems))
    };
    const sumDist = distribution.basic + distribution.medium + distribution.advanced;
    if (sumDist !== totalItems) distribution.medium += (totalItems - sumDist);

    const minutes = totalItems * minutesPerItem;
    const hours = minutes / 60;
    const weeksNeeded = hoursPerWeek > 0 ? hours / hoursPerWeek : Infinity;

    let feasibility;
    if (weeksNeeded <= weeks) {
      feasibility = {
        status: 'ok',
        title: '✅ برنامه‌ات جواب می‌دهد',
        text: 'حدود ' + round1(weeksNeeded) + ' هفته وقت می‌برد، و تو ' + weeks + ' هفته وقت داری. جای نفس کشیدن هم هست.'
      };
    } else if (weeksNeeded <= weeks * 1.3) {
      feasibility = {
        status: 'tight',
        title: '⚠️ برنامه‌ات فشرده است',
        text: 'حدود ' + round1(weeksNeeded) + ' هفته لازم داری ولی ' + weeks + ' هفته داری. اگر منظم بمانی، شدنی است — ولی جا برای عقب افتادن نیست.'
      };
    } else {
      feasibility = {
        status: 'risky',
        title: '❌ با این وقت، سخت است',
        text: 'حدود ' + round1(weeksNeeded) + ' هفته لازم داری ولی فقط ' + weeks + ' هفته داری. یا هفته‌ای چند ساعت بیشتر وقت بگذار، یا فقط روی تمرین‌های پایه و متوسط تمرکز کن.'
      };
    }

    const ratingOrder = { weak: 0, unknown: 1, medium: 2, strong: 3 };
    const layerOrder = { basic: 0, medium: 1, advanced: 2 };
    const prioritySorted = priority
      .filter(function (p) { return p.rating !== 'strong'; })
      .sort(function (a, b) {
        const ra = ratingOrder[a.rating] - ratingOrder[b.rating];
        if (ra !== 0) return ra;
        return layerOrder[a.edge.D] - layerOrder[b.edge.D];
      });

    return {
      totalItems: totalItems,
      distribution: distribution,
      hours: hours,
      minutes: minutes,
      weeksNeeded: weeksNeeded,
      feasibility: feasibility,
      prioritySorted: prioritySorted
    };
  }

  function round1(n) {
    if (!isFinite(n)) return '∞';
    return Math.round(n * 10) / 10;
  }

  /* ---------- رندر نتیجه ---------- */
  function renderResult(root, r) {
    const wrap = root.querySelector('#m-result');
    const lm = data.layer_meta;

    const priorityList = r.prioritySorted.slice(0, 6).map(function (p) {
      const badge = ratingBadge(p.rating);
      return ''
        + '<li>'
        +   '<span class="p-badge ' + badge.cls + '">' + badge.text + '</span>'
        +   escapeHtml(p.edge.label)
        +   '<span class="m-layer-tag m-layer-' + p.edge.D + '" style="margin-right:6px;">'
        +     escapeHtml(lm[p.edge.D].label)
        +   '</span>'
        + '</li>';
    }).join('');

    let priorityBlock;
    if (priorityList) {
      priorityBlock = ''
        + '<div class="m-priority">'
        +   '<h3>🔢 از کجا شروع کنی؟</h3>'
        +   '<ol>' + priorityList + '</ol>'
        + '</div>';
    } else {
      priorityBlock = ''
        + '<div class="m-priority">'
        +   '<h3>✅ عالی!</h3>'
        +   '<p style="color:var(--m-text-light);font-size:0.88rem;margin:0;">'
        +     'گفتی همه‌چیز را بلدی. برای اطمینان، چند تمرین سخت هم بزن.'
        +   '</p>'
        + '</div>';
    }

    wrap.innerHTML = ''
      + '<section class="m-result">'
      +   '<h2 style="color:var(--m-primary);font-size:1.3rem;margin:0 0 16px;">📊 تخمین تمرین مورد نیاز</h2>'

      +   '<div class="m-stat-grid">'
      +     '<div class="m-stat"><div class="num">' + r.totalItems + '</div><div class="lbl">تمرین لازم داری</div></div>'
      +     '<div class="m-stat"><div class="num">' + round1(r.hours) + '</div><div class="lbl">ساعت وقت</div></div>'
      +     '<div class="m-stat"><div class="num">' + round1(r.weeksNeeded) + '</div><div class="lbl">هفته</div></div>'
      +     '<div class="m-stat"><div class="num">' + Math.round(r.minutes) + '</div><div class="lbl">دقیقه</div></div>'
      +   '</div>'

      +   '<div class="m-feasibility ' + r.feasibility.status + '">'
      +     '<strong>' + escapeHtml(r.feasibility.title) + '</strong>'
      +     escapeHtml(r.feasibility.text)
      +   '</div>'

      +   '<h3 style="color:var(--m-primary);font-size:1rem;margin:20px 0 12px;">🎯 تمرین‌ها را چطور تقسیم کنی؟</h3>'
      +   '<div class="m-layer-breakdown">'
      +     ['basic', 'medium', 'advanced'].map(function (k) {
            return ''
              + '<div class="m-layer-card" style="border-right-color:' + lm[k].color + ';">'
              +   '<div class="l-name" style="color:' + lm[k].color + ';">' + escapeHtml(lm[k].label) + '</div>'
              +   '<div class="l-count">' + r.distribution[k] + '</div>'
              +   '<div class="l-desc">' + escapeHtml(lm[k].description) + '</div>'
              + '</div>';
          }).join('')
      +   '</div>'

      +   priorityBlock

      +   '<details>'
      +     '<summary>این عددها از کجا آمد؟</summary>'
      +     '<div style="margin-top:10px;line-height:1.9;">'
      +       '<p style="margin:0 0 8px;">هر مهارت را بر اساس اینکه چقدر بلدی، وزن‌دهی کردیم:</p>'
      +       '<ul style="margin:0 0 8px;padding-right:20px;">'
      +         '<li>«کاملاً بلدم» → فقط ۱ بار مرور</li>'
      +         '<li>«تا حدی بلدم» → ۲ بار تمرین</li>'
      +         '<li>«نمی‌دانم یعنی چی» → ۳ بار (اول یادگیری، بعد تمرین)</li>'
      +         '<li>«ضعیفم» → ۴ بار (باید از پایه بسازی)</li>'
      +       '</ul>'
      +       '<p style="margin:0 0 8px;">تمرین‌های سخت‌تر، وزن بیشتری گرفتند:</p>'
      +       '<ul style="margin:0 0 8px;padding-right:20px;">'
      +         '<li>پایه → ضریب ۱</li>'
      +         '<li>متوسط → ضریب ۱٫۵</li>'
      +         '<li>پیشرفته → ضریب ۲</li>'
      +       '</ul>'
      +       '<p style="margin:0;">در پایان، ۱٫۵ برابر شد تا برای تلاش‌های ناموفق هم جا باشد.</p>'
      +     '</div>'
      +   '</details>'

      + '</section>';
  }

  function ratingBadge(rating) {
    const map = {
      strong:  { cls: 'is-strong',  text: 'بلدم' },
      medium:  { cls: 'is-medium',  text: 'تا حدی' },
      weak:    { cls: 'is-weak',    text: 'ضعیف' },
      unknown: { cls: 'is-unknown', text: 'نمی‌دانم' }
    };
    return map[rating] || { cls: '', text: '—' };
  }

  document.addEventListener('click', function (ev) {
    if (!ev.target || ev.target.id !== 'm-calc') return;
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
  });

  function escapeHtml(s) {
    return s == null ? '' : String(s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
    });
  }
})();
