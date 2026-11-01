/* ============================================================
   Atlas — Rules Engine (Phase 4)
   - قواعد اگر-آنگاه را روی پروفایل کاربر ارزیابی می‌کند
   - رتبه‌بندی را تغییر نمی‌دهد، فقط حاشیه‌نویسی می‌کند
   - با atlas-quiz.js و atlas-chart.js هیچ تداخلی ندارد
   ============================================================ */
(function () {
  'use strict';

  const CONFIG = {
    weightsUrl: './data/weights.json',
    rulesUrl:   './data/rules.json',
    careersUrl: './data/careers.json'
  };

  let weights = null;
  let rules = null;
  let careers = null;
  let lastHash = '';

  /* ---------- ۱) بارگذاری همه داده‌ها ---------- */
  Promise.all([
    fetchJson(CONFIG.weightsUrl),
    fetchJson(CONFIG.rulesUrl),
    fetchJson(CONFIG.careersUrl)
  ]).then(([w, r, c]) => {
    weights = w;
    rules = r;
    careers = c;
    startPolling();
  }).catch(err => {
    console.error('[Atlas Rules]', err);
  });

  async function fetchJson(url) {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
    return res.json();
  }

  /* ---------- ۲) Polling بر اساس تأخیر configurable ---------- */
  function startPolling() {
    const delay = (weights.ui && weights.ui.annotation_delay_ms) || 500;
    setInterval(poll, delay);
  }

  function poll() {
    const result = document.getElementById('quiz-result');
    if (!result) return;

    const ranks = result.querySelectorAll('.quiz-rank');
    if (!ranks.length) {
      lastHash = '';
      return;
    }

    const hash = Array.from(ranks).map(r => r.textContent.trim()).join('|');
    if (hash === lastHash) return;
    lastHash = hash;

    try {
      applyRules(result, Array.from(ranks));
    } catch (err) {
      console.error('[Atlas Rules]', err);
    }
  }

  /* ---------- ۳) موتور ارزیابی ---------- */
  function applyRules(result, rankEls) {
    const userVec = readUserVector();
    const pathMap = new Map();
    careers.paths.forEach(p => pathMap.set(p.name, p));

    // استخراج نام سه مسیر برتر از DOM
    const topPaths = rankEls.map(el => {
      const first = el.querySelector('span');
      if (!first) return null;
      const m = first.textContent.trim().match(/^[۰-۹\d]+\.\s*(.+)$/);
      return m ? m[1].trim() : null;
    }).filter(Boolean);

    const generalNotes = [];
    const pathWarnings = new Map();
    const pathHighlights = new Map();

    // ارزیابی هر قاعده
    rules.rules.forEach(rule => {
      if (!evaluate(rule, userVec)) return;
      const a = rule.apply || {};

      if (a.general_note && weights.ui.show_rule_notes) {
        generalNotes.push(a.general_note);
      }

      // هشدار بر اساس فاصله ریسک
      if (a.warn_paths_above_user_risk_by !== undefined) {
        const margin = a.warn_paths_above_user_risk_by;
        topPaths.forEach(name => {
          const p = pathMap.get(name);
          if (p && (p.risk_profile - userVec.risk) > margin) {
            pathWarnings.set(name, a.warn_message || '⚠️ ریسک این مسیر بالاتر از ترجیح شماست');
          }
        });
      }

      // هشدار بر اساس شناسه مسیر
      if (a.warn_path_ids && weights.ui.show_warnings) {
        topPaths.forEach(name => {
          const p = pathMap.get(name);
          if (p && a.warn_path_ids.includes(p.id)) {
            pathWarnings.set(name, a.warn_message || '⚠️ این مسیر ممکن است با پروفایل شما هم‌خوان نباشد');
          }
        });
      }

      // برجسته‌سازی
      if (a.highlight_path_ids && weights.ui.show_highlights) {
        topPaths.forEach(name => {
          const p = pathMap.get(name);
          if (p && a.highlight_path_ids.includes(p.id)) {
            pathHighlights.set(name, a.highlight_message || '✨ تناسب ویژه با پروفایل شما');
          }
        });
      }
    });

    // رندر
    renderNotes(result, generalNotes);
    renderBadges(rankEls, topPaths, pathWarnings, pathHighlights);
    renderDisclaimer(result, rules.global_disclaimer);
  }

  /* ---------- ۴) ارزیابی شرط ---------- */
  function evaluate(rule, userVec) {
    if (rule.if)     return check(rule.if, userVec);
    if (rule.if_all) return rule.if_all.every(c => check(c, userVec));
    if (rule.if_any) return rule.if_any.some(c => check(c, userVec));
    return false;
  }

  function check(cond, userVec) {
    const val = userVec[cond.dim];
    if (val === undefined) return false;

    let target = cond.value;
    if (cond.value_ref && weights.thresholds) {
      target = weights.thresholds[cond.value_ref];
    }
    if (target === undefined) return false;

    switch (cond.op) {
      case '<':  return val <  target;
      case '<=': return val <= target;
      case '>':  return val >  target;
      case '>=': return val >= target;
      case '==': return val === target;
      default:   return false;
    }
  }

  /* ---------- ۵) خواندن پاسخ‌های کاربر ---------- */
  function readUserVector() {
    const vec = {};
    ['R','I','A','S','E','C'].forEach(d => {
      const el = document.getElementById('q_q_' + d.toLowerCase());
      vec[d] = el ? (parseInt(el.value, 10) - 1) / 4 : 0;
    });
    const riskEl = document.getElementById('q_q_risk');
    vec.risk = riskEl ? (parseInt(riskEl.value, 10) - 1) / 4 : 0;
    return vec;
  }

  /* ---------- ۶) رندر نکات عمومی ---------- */
  function renderNotes(result, notes) {
    const old = result.querySelector('#atlas-rules-notes');
    if (old) old.remove();
    if (!notes.length) return;

    const div = document.createElement('div');
    div.id = 'atlas-rules-notes';
    div.style.cssText = 'background:#fff8e1;border-right:4px solid #f57f17;border-radius:10px;padding:14px 18px;margin:12px 0 16px;';
    div.innerHTML = `
      <div style="font-weight:700;color:#e65100;margin-bottom:8px;font-size:.9rem;">
        💡 نکات بر اساس پروفایل شما
      </div>
      ${notes.map(n =>
        `<p style="margin:8px 0;font-size:.85rem;color:#5a6c7d;line-height:1.8;text-align:justify;">${escapeHtml(n)}</p>`
      ).join('')}
    `;

    const heading = result.querySelector('.quiz-result-title');
    if (heading && heading.nextSibling) {
      result.insertBefore(div, heading.nextSibling);
    } else if (heading) {
      result.appendChild(div);
    } else {
      result.insertBefore(div, result.firstChild);
    }
  }

  /* ---------- ۷) رندر برچسب‌ها روی کارت‌ها ---------- */
  function renderBadges(rankEls, topPaths, warnings, highlights) {
    rankEls.forEach((el, i) => {
      const name = topPaths[i];
      if (!name) return;

      // حذف برچسب‌های قبلی
      el.querySelectorAll('.atlas-rule-badge').forEach(b => b.remove());
      el.style.flexWrap = '';
      el.style.borderRightColor = '';

      if (warnings.has(name)) {
        el.style.borderRightColor = '#c0392b';
        el.style.flexWrap = 'wrap';
        const badge = document.createElement('div');
        badge.className = 'atlas-rule-badge';
        badge.style.cssText = 'flex-basis:100%;font-size:.78rem;color:#c0392b;margin-top:8px;line-height:1.7;';
        badge.textContent = '⚠️ ' + warnings.get(name);
        el.appendChild(badge);
      } else if (highlights.has(name)) {
        el.style.flexWrap = 'wrap';
        const badge = document.createElement('div');
        badge.className = 'atlas-rule-badge';
        badge.style.cssText = 'flex-basis:100%;font-size:.78rem;color:#27ae60;margin-top:8px;line-height:1.7;';
        badge.textContent = highlights.get(name);
        el.appendChild(badge);
      }
    });
  }

  /* ---------- ۸) نمایش disclaimer ---------- */
  function renderDisclaimer(result, text) {
    if (!text) return;
    const old = result.querySelector('#atlas-rules-disclaimer');
    if (old) old.remove();
    if (!weights.ui.show_rule_notes) return;

    const p = document.createElement('p');
    p.id = 'atlas-rules-disclaimer';
    p.style.cssText = 'font-size:.78rem;color:#999;margin-top:12px;text-align:center;font-style:italic;line-height:1.7;';
    p.textContent = text;
    result.appendChild(p);
  }

  /* ---------- Helpers ---------- */
  function escapeHtml(s) {
    return s == null ? '' : String(s).replace(/[&<>"']/g, c =>
      ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  }
})();
