/* ============================================================
   Mastery — Practice Calculator
   موضوع را کاربر وارد می‌کند؛ ۶ مؤلفه سنجش عمومی ارزیابی می‌شود.
   ============================================================ */
(function () {
  'use strict';

  var CONFIG = {
    dataUrl: './data/config.json',
    rootId: 'mastery-root'
  };

  var data = null;
  var ratings = {};
  var enteredTopic = '';

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    var root = document.getElementById(CONFIG.rootId);
    if (!root) return;
    try {
      data = await fetchJson(CONFIG.dataUrl);
      ratings = {};
      data.components.forEach(function (c) { ratings[c.id] = 'unknown'; });
      renderApp(root);
      bindEvents(root);
    } catch (err) {
      root.innerHTML = '<div class="m-error">⚠️ خطا در بارگذاری: ' + escapeHtml(err.message) + '</div>';
    }
  }

  async function fetchJson(url) {
    var res = await fetch(url, { cache: 'no-cache' });
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
      +   '<p>بهت می‌گوید برای تسلط بر <strong>هر موضوعی</strong>، چقدر و چه نوع تمرینی لازم داری.</p>'
      +   '<ol>'
      +     '<li>نام موضوع را وارد کن</li>'
      +     '<li>برای ۶ مؤلفه سنجش، بگو الان چقدر بلدی (صادق باش!)</li>'
      +     '<li>ساعت مطالعه هفتگی‌ات را وارد کن</li>'
      +     '<li>ببین چقدر تمرین و چقدر زمان لازم داری</li>'
      +   '</ol>'
      + '</div>'

      /* Step 1: Topic input */
      + '<section class="m-section">'
      +   '<h2><span class="m-icon">۱</span> چه چیزی می‌خواهی یاد بگیری؟</h2>'
      +   '<div class="m-topic-box">'
      +     '<label for="m-topic">نام موضوع را بنویس</label>'
      +     '<input type="text" id="m-topic" placeholder="مثلاً: مشتق، تاریخ مشروطه، Present Perfect" maxlength="80">'
      +   '</div>'
      +   '<button class="m-btn" id="m-continue" disabled>ادامه</button>'
      + '</section>'

      /* Step 2: Component ratings (hidden initially) */
      + '<section class="m-section" id="m-step-2" style="display:none;">'
      +   '<h2><span class="m-icon">۲</span> الان چقدر بلدی؟</h2>'
      +   '<p class="m-help">برای هر مورد، یکی از چهار گزینه را انتخاب کن. اگر صادق باشی، نتیجه دقیق‌تر است.</p>'
      +   '<div class="m-components" id="m-components"></div>'
      + '</section>'

      /* Step 3: Time inputs (hidden initially) */
      + '<section class="m-section" id="m-step-3" style="display:none;">'
      +   '<h2><span class="m-icon">۳</span> چقدر وقت داری؟</h2>'
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

    renderComponents(root);
  }

  /* ---------- رندر ۶ مؤلفه ---------- */
  function renderComponents(root) {
    var wrap = root.querySelector('#m-components');
    var keys = ['strong', 'medium', 'weak', 'unknown'];
    wrap.innerHTML = data.components.map(function (c) {
      var lm = data.level_meta[c.level];
      var labelHtml = keys.map(function (k) {
        return ''
          + '<label class="is-' + k + '">'
          +   '<input type="radio" name="rate_' + escapeHtml(c.id) + '" value="' + k + '"'
          +     (k === 'unknown' ? ' checked' : '') + '>'
          +   '<span>' + escapeHtml(data.rating_labels[k]) + '</span>'
          + '</label>';
      }).join('');
      return ''
        + '<div class="m-comp" data-comp-id="' + escapeHtml(c.id) + '">'
        +   '<div class="m-comp-label">'
        +     '<div>' + escapeHtml(c.label)
        +       ' <span class="m-layer-tag m-layer-' + c.level + '">' + escapeHtml(lm.label) + '</span>'
        +     '</div>'
        +     (c.hint ? '<div class="m-comp-hint">' + escapeHtml(c.hint) + '</div>' : '')
        +   '</div>'
        +   '<div class="m-ratings">' + labelHtml + '</div>'
        + '</div>';
    }).join('');

    wrap.querySelectorAll('.m-ratings').forEach(function (group) {
      group.addEventListener('change', function (ev) {
        var compId = group.closest('.m-comp').getAttribute('data-comp-id');
        ratings[compId] = ev.target.value;
      });
    });
  }

  /* ---------- اتصال دکمه‌ها ---------- */
  function bindEvents(root) {
    var topicInput = root.querySelector('#m-topic');
    var continueBtn = root.querySelector('#m-continue');

    topicInput.addEventListener('input', function () {
      continueBtn.disabled = topicInput.value.trim().length < 2;
    });

    continueBtn.addEventListener('click', function () {
      var v = topicInput.value.trim();
      if (v.length < 2) return;
      enteredTopic = v;
      root.querySelector('#m-step-2').style.display = 'block';
      root.querySelector('#m-step-3').style.display = 'block';
      root.querySelector('#m-step-2').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    root.querySelector('#m-calc').addEventListener('click', function () {
      var hours = parseFloat(root.querySelector('#m-hours').value) || 0;
      var weeks = parseFloat(root.querySelector('#m-weeks').value) || 1;
      var minutes = parseFloat(root.querySelector('#m-minutes').value) || data.calc.minutes_per_item;
      if (hours <= 0) {
        alert('لطفاً ساعت مطالعه هفتگی را وارد کن.');
        return;
      }
      var result = calculate(hours, weeks, minutes);
      renderResult(root, result);
      root.querySelector('#m-result').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ---------- محاسبه ---------- */
  function calculate(hoursPerWeek, weeks, minutesPerItem) {
    var rw = data.rating_weights;
    var lm = data.level_meta;
    var debt = data.calc.debt_multiplier;

    var totalRaw = 0;
    var perLevel = { basic: 0, medium: 0, advanced: 0 };
    var priority = [];

    data.components.forEach(function (c) {
      var rating = ratings[c.id] || 'unknown';
      var w = rw[rating] || 1;
      var mult = lm[c.level].multiplier || 1;
      var items = w * mult;
      totalRaw += items;
      perLevel[c.level] += items;
      priority.push({ comp: c, rating: rating, items: items });
    });

    var totalItems = Math.max(data.calc.min_items, Math.round(totalRaw * debt));

    var rawSum = perLevel.basic + perLevel.medium + perLevel.advanced || 1;
    var distribution = {
      basic:    Math.max(1, Math.round((perLevel.basic    / rawSum) * totalItems)),
      medium:   Math.max(1, Math.round((perLevel.medium   / rawSum) * totalItems)),
      advanced: Math.max(1, Math.round((perLevel.advanced / rawSum) * totalItems))
    };
    var sumDist = distribution.basic + distribution.medium + distribution.advanced;
    if (sumDist !== totalItems) distribution.medium += (totalItems - sumDist);

    var minutes = totalItems * minutesPerItem;
    var hours = minutes / 60;
    var weeksNeeded = hoursPerWeek > 0 ? hours / hoursPerWeek : Infinity;

    var feasibility;
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

    var ratingOrder = { weak: 0, unknown: 1, medium: 2, strong: 3 };
    var levelOrder = { basic: 0, medium: 1, advanced: 2 };
    var prioritySorted = priority
      .filter(function (p) { return p.rating !== 'strong'; })
      .sort(function (a, b) {
        var ra = ratingOrder[a.rating] - ratingOrder[b.rating];
        if (ra !== 0) return ra;
        return levelOrder[a.comp.level] - levelOrder[b.comp.level];
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
    var wrap = root.querySelector('#m-result');
    var lm = data.level_meta;

    var priorityList = r.prioritySorted.slice(0, 6).map(function (p) {
      var badge = ratingBadge(p.rating);
      return ''
        + '<li>'
        +   '<span class="p-badge ' + badge.cls + '">' + badge.text + '</span>'
        +   escapeHtml(p.comp.label)
        +   ' <span class="m-layer-tag m-layer-' + p.comp.level + '">' + escapeHtml(lm[p.comp.level].label) + '</span>'
        + '</li>';
    }).join('');

    var priorityBlock;
    if (priorityList) {
      priorityBlock = ''
        + '<div class="m-priority">'
        +   '<h3>🎯 روی این‌ها تمرکز کن</h3>'
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
      +   '<h2 class="m-result-title">📊 تخمین تمرین برای <span class="topic">«' + escapeHtml(enteredTopic) + '»</span></h2>'

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

      +   '<h3 style="color:var(--m-primary);font-size:1rem;margin:20px 0 12px;">🎯 تمرین‌هایت را چطور تقسیم کنی؟</h3>'
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
      +       '<p style="margin:0 0 8px;">هر کدام از ۶ سؤالی که جواب دادی، یک وزن گرفت:</p>'
      +       '<ul style="margin:0 0 8px;padding-right:20px;">'
      +         '<li>«کاملاً بلدم» → ۱ بار مرور</li>'
      +         '<li>«تا حدی بلدم» → ۲ بار تمرین</li>'
      +         '<li>«نمی‌دانم» → ۳ بار (اول یادگیری، بعد تمرین)</li>'
      +         '<li>«ضعیفم» → ۴ بار (باید از پایه بسازی)</li>'
      +       '</ul>'
      +       '<p style="margin:0 0 8px;">سؤالات سخت‌تر، وزن بیشتری گرفتند:</p>'
      +       '<ul style="margin:0 0 8px;padding-right:20px;">'
      +         '<li>سطح پایه → ضریب ۱</li>'
      +         '<li>سطح متوسط → ضریب ۱٫۵</li>'
      +         '<li>سطح پیشرفته → ضریب ۲</li>'
      +       '</ul>'
      +       '<p style="margin:0;">در پایان، ۱٫۵ برابر شد تا برای تلاش‌های ناموفق و مرور جا باشد.</p>'
      +     '</div>'
      +   '</details>'

      + '</section>';
  }

  function ratingBadge(rating) {
    var map = {
      strong:  { cls: 'is-strong',  text: 'بلدم' },
      medium:  { cls: 'is-medium',  text: 'تا حدی' },
      weak:    { cls: 'is-weak',    text: 'ضعیف' },
      unknown: { cls: 'is-unknown', text: 'نمی‌دانم' }
    };
    return map[rating] || { cls: '', text: '—' };
  }

  function escapeHtml(s) {
    return s == null ? '' : String(s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
    });
  }
})();
