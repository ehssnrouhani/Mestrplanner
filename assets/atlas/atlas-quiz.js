/* ============================================================
   Atlas — Quiz Module (Phase 2)
   پرسش‌نامه و موتور امتیازدهی
   مستقل از atlas-app.js — خودش را به اطلس تزریق می‌کند.
   ============================================================ */
(function () {
  'use strict';

  const CONFIG = {
    questionsUrl: './data/questions.json',
    careersUrl:   './data/careers.json',
    weights: {
      scct_boost:   0.10,
      risk_penalty: 0.40,
      top_n:        3
    }
  };

  injectStyles();
  waitForAtlas(root => {
    const footer = root.querySelector('.atlas-footer');
    if (!footer) return;
    const quizSection = document.createElement('section');
    quizSection.id = 'atlas-quiz-section';
    quizSection.className = 'atlas-section atlas-quiz-section';
    footer.parentNode.insertBefore(quizSection, footer);
    initQuiz(quizSection);
  });

  /* ---------- Styles (injected, no atlas.css change) ---------- */
  function injectStyles() {
    const css = `
      .atlas-quiz-section { background: linear-gradient(135deg,#f0f4f8,#e8eef4); }
      .atlas-quiz-section .quiz-intro { color:#5a6c7d; margin-bottom:20px; font-size:.9rem; text-align:justify; }
      .atlas-quiz-section .quiz-q { background:#fff; padding:14px 18px; margin:10px 0; border-radius:10px; border-right:4px solid #c9a961; }
      .atlas-quiz-section .quiz-q label { display:block; font-weight:600; color:#1e3a5f; margin-bottom:8px; font-size:.9rem; }
      .atlas-quiz-section .quiz-q input[type=range] { width:100%; accent-color:#1e3a5f; }
      .atlas-quiz-section .quiz-q .quiz-val { float:left; color:#c9a961; font-weight:700; }
      .atlas-quiz-section .quiz-actions { text-align:center; margin-top:20px; }
      .atlas-quiz-section .quiz-btn { background:#1e3a5f; color:#fff; padding:12px 28px; border:none; border-radius:8px; font-family:inherit; font-size:1rem; cursor:pointer; }
      .atlas-quiz-section .quiz-btn:hover { background:#2d5a8c; }
      .atlas-quiz-section .quiz-btn.secondary { background:#fff; color:#1e3a5f; border:2px solid #1e3a5f; }
      .atlas-quiz-section .quiz-result-title { font-size:1.15rem; color:#1e3a5f; margin:24px 0 12px; }
      .atlas-quiz-section .quiz-rank { background:#fff; padding:14px 20px; margin:8px 0; border-radius:10px; border-right:5px solid #c9a961; display:flex; justify-content:space-between; align-items:center; gap:12px; }
      .atlas-quiz-section .quiz-rank .score { color:#c9a961; font-weight:700; white-space:nowrap; }
      .atlas-quiz-section .quiz-disclaimer { font-size:.82rem; color:#777; margin-top:16px; text-align:center; font-style:italic; line-height:1.7; }
      .atlas-quiz-section .quiz-error { padding:20px; text-align:center; color:#c0392b; }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  function waitForAtlas(cb) {
    const check = () => {
      const root = document.getElementById('atlas-root');
      if (root && root.querySelector('.atlas-footer')) cb(root);
      else setTimeout(check, 100);
    };
    check();
  }

  /* ---------- Load & Render ---------- */
  async function initQuiz(container) {
    try {
      const [qData, careersData] = await Promise.all([
        fetchJson(CONFIG.questionsUrl),
        fetchJson(CONFIG.careersUrl)
      ]);
      renderQuiz(container, qData, careersData);
    } catch (err) {
      container.innerHTML =
        `<div class="quiz-error">⚠️ خطا در بارگذاری پرسش‌نامه: ${escapeHtml(err.message)}</div>`;
    }
  }

  async function fetchJson(url) {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
    return res.json();
  }

  function renderQuiz(container, qData, careersData) {
    container.innerHTML = `
      <h2><span class="atlas-icon">۲</span> ${escapeHtml(qData.title)}</h2>
      <p class="quiz-intro">${escapeHtml(qData.intro)}</p>
      <div id="quiz-questions">
        ${qData.questions.map(q => `
          <div class="quiz-q">
            <label for="q_${q.id}">
              ${escapeHtml(q.text)}
              <span class="quiz-val" id="v_${q.id}">۳</span>
            </label>
            <input type="range" id="q_${q.id}" min="1" max="5" value="3"
              oninput="document.getElementById('v_${q.id}').textContent = ['۱','۲','۳','۴','۵'][this.value-1]">
          </div>
        `).join('')}
      </div>
      <div class="quiz-actions">
        <button class="quiz-btn" id="quiz-submit">محاسبه مسیرهای پیشنهادی</button>
      </div>
      <div id="quiz-result"></div>
    `;

    container.querySelector('#quiz-submit').addEventListener('click', () => {
      const answers = {};
      qData.questions.forEach(q => {
        const val = parseInt(container.querySelector(`#q_${q.id}`).value, 10);
        answers[q.dim] = (answers[q.dim] || 0) + (val - 1) / 4;
      });
      const ranking = scorePaths(answers, careersData);
      showResult(container, ranking, qData.disclaimer);
    });
  }

  /* ---------- Scoring (Cosine Similarity + Risk Penalty) ---------- */
  function scorePaths(answers, careersData) {
    const uVec = {
      R: answers.R || 0, I: answers.I || 0, A: answers.A || 0,
      S: answers.S || 0, E: answers.E || 0, C: answers.C || 0
    };
    const eff  = answers.eff  || 0;
    const out  = answers.out  || 0;
    const risk = answers.risk || 0;

    return careersData.paths.map(p => {
      const sim     = cosine(uVec, p.riasec);
      const riskPen = Math.abs(p.risk_profile - risk) * CONFIG.weights.risk_penalty;
      const scct    = (eff + out) / 2 * CONFIG.weights.scct_boost;
      return { id: p.id, name: p.name, score: sim - riskPen + scct };
    }).sort((a, b) => b.score - a.score);
  }

  function cosine(a, b) {
    const keys = Object.keys(a);
    const dot  = keys.reduce((s, k) => s + a[k] * (b[k] || 0), 0);
    const magA = Math.sqrt(keys.reduce((s, k) => s + a[k] * a[k], 0));
    const magB = Math.sqrt(keys.reduce((s, k) => s + (b[k] || 0) * (b[k] || 0), 0)) || 1;
    return dot / (magA * magB || 1);
  }

  function showResult(container, ranking, disclaimer) {
    const top = ranking.slice(0, CONFIG.weights.top_n);
    container.querySelector('#quiz-result').innerHTML = `
      <h3 class="quiz-result-title">سه مسیر برتر برای شما:</h3>
      ${top.map((r, i) => `
        <div class="quiz-rank">
          <span><strong>${toPersianDigit(i + 1)}.</strong> ${escapeHtml(r.name)}</span>
          <span class="score">${(r.score * 100).toFixed(1)}٪</span>
        </div>
      `).join('')}
      <p class="quiz-disclaimer">${escapeHtml(disclaimer)}</p>
      <div class="quiz-actions">
        <button class="quiz-btn secondary" id="quiz-restart">شروع دوباره</button>
      </div>
    `;
    container.querySelector('#quiz-restart').addEventListener('click', () => {
      container.querySelectorAll('input[type=range]').forEach(inp => {
        inp.value = 3;
        container.querySelector('#v_' + inp.id.slice(2)).textContent = '۳';
      });
      container.querySelector('#quiz-result').innerHTML = '';
      container.scrollIntoView({ behavior: 'smooth' });
    });
    container.querySelector('#quiz-result').scrollIntoView({ behavior: 'smooth' });
  }

  /* ---------- Helpers ---------- */
  function escapeHtml(s) {
    return s == null ? '' : String(s).replace(/[&<>"']/g, c =>
      ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  }
  function toPersianDigit(n) {
    return String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
  }
})();
