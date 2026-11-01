/* ============================================================
   Atlas — Radar Chart Module (Phase 3, v2)
   نسخه مقاوم‌تر: چند CDN جایگزین، خطای قابل مشاهده، Polling
   ============================================================ */
(function () {
  'use strict';

  const CONFIG = {
    chartCdns: [
      'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js',
      'https://unpkg.com/chart.js@4.4.1/dist/chart.umd.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js'
    ],
    careersUrl: './data/careers.json',
    colors: {
      user: '#c9a961',
      top: ['#1e3a5f', '#27ae60', '#e67e22'],
      fill: 'rgba(201,169,97,0.18)'
    },
    riasecLabels: {
      R: 'واقع‌گرا (R)', I: 'پژوهشی (I)', A: 'هنری (A)',
      S: 'اجتماعی (S)', E: 'متهور (E)', C: 'قراردادی (C)'
    }
  };

  let chartInstance = null;
  let careersCache = null;
  let currentHash = '';

  /* ---------- ۱) لود Chart.js با CDN جایگزین ---------- */
  function loadChartJs() {
    if (window.Chart) return Promise.resolve(window.Chart);
    return new Promise((resolve, reject) => {
      let idx = 0;
      const tryNext = () => {
        if (idx >= CONFIG.chartCdns.length) {
          return reject(new Error('هیچ‌کدام از CDNهای Chart.js بارگذاری نشد'));
        }
        const s = document.createElement('script');
        s.src = CONFIG.chartCdns[idx++];
        s.async = true;
        s.onload = () => window.Chart ? resolve(window.Chart) : tryNext();
        s.onerror = tryNext;
        document.head.appendChild(s);
      };
      tryNext();
    });
  }

  /* ---------- ۲) careers.json با کش ---------- */
  async function getCareers() {
    if (careersCache) return careersCache;
    const res = await fetch(CONFIG.careersUrl, { cache: 'no-cache' });
    if (!res.ok) throw new Error('careers.json در دسترس نیست (HTTP ' + res.status + ')');
    careersCache = await res.json();
    return careersCache;
  }

  /* ---------- ۳) خواندن پاسخ کاربر (رفع باگ q_q_r) ---------- */
  function readUserVector() {
    const vec = {};
    ['R','I','A','S','E','C'].forEach(d => {
      const el = document.getElementById('q_q_' + d.toLowerCase());
      vec[d] = el ? (parseInt(el.value, 10) - 1) / 4 : 0;
    });
    return vec;
  }

  /* ---------- ۴) نمایش خطای قابل مشاهده ---------- */
  function showError(result, msg) {
    const old = result.querySelector('#atlas-chart-error');
    if (old) old.remove();
    const div = document.createElement('div');
    div.id = 'atlas-chart-error';
    div.style.cssText = 'background:#ffebee;color:#c62828;padding:14px 18px;border-radius:10px;margin-top:16px;font-size:.85rem;border-right:4px solid #c62828;';
    div.textContent = '⚠️ نمودار بارگذاری نشد: ' + msg;
    const actions = result.querySelector('.quiz-actions');
    if (actions && actions.parentNode === result) {
      result.insertBefore(div, actions);
    } else {
      result.appendChild(div);
    }
  }

  /* ---------- ۵) ساخت کارت نمودار ---------- */
  function buildWrap() {
    const wrap = document.createElement('div');
    wrap.id = 'atlas-radar-wrap';
    wrap.style.cssText = 'background:#fff;border-radius:12px;padding:20px;margin-top:20px;box-shadow:0 2px 12px rgba(0,0,0,.05);';
    wrap.innerHTML = `
      <h4 style="color:#1e3a5f;margin:0 0 8px;font-size:1rem;">📊 پروفایل شما در برابر سه مسیر برتر</h4>
      <p style="color:#5a6c7d;font-size:.82rem;margin:0 0 12px;line-height:1.7;">
        هر چه چندضلعی شما به یک مسیر نزدیک‌تر باشد، تناسب بیشتری با آن دارید.
        شش ضلع، شش تیپ شغلی مدل RIASEC هستند.
      </p>
      <div id="atlas-radar-loading" style="text-align:center;padding:30px;color:#5a6c7d;font-size:.85rem;">
        در حال بارگذاری نمودار...
      </div>
      <div style="position:relative;max-width:520px;margin:0 auto;min-height:320px;">
        <canvas id="atlas-radar-canvas"></canvas>
      </div>
    `;
    return wrap;
  }

  /* ---------- ۶) رندر ---------- */
  async function renderChart(result) {
    const rankEls = Array.from(result.querySelectorAll('.quiz-rank'));
    if (!rankEls.length) return;

    const hash = rankEls.map(r => r.textContent.trim()).join('|');
    if (hash === currentHash && chartInstance) return;

    // پاک‌سازی نسخه قبلی
    const oldWrap = result.querySelector('#atlas-radar-wrap');
    if (oldWrap) oldWrap.remove();
    const oldErr = result.querySelector('#atlas-chart-error');
    if (oldErr) oldErr.remove();
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }

    // درج کارت با حالت loading
    const wrap = buildWrap();
    const actions = result.querySelector('.quiz-actions');
    if (actions && actions.parentNode === result) {
      result.insertBefore(wrap, actions);
    } else {
      result.appendChild(wrap);
    }

    try {
      // ۱) Chart.js
      const Chart = await loadChartJs();

      // ۲) داده‌ها
      const careers = await getCareers();
      const userVec = readUserVector();

      // ۳) استخراج سه مسیر برتر
      const topPaths = [];
      rankEls.slice(0, 3).forEach(el => {
        const firstSpan = el.querySelector('span');
        if (!firstSpan) return;
        const txt = firstSpan.textContent.trim();
        const m = txt.match(/^[۰-۹\d]+\.\s*(.+)$/);
        if (!m) return;
        const name = m[1].trim();
        const path = careers.paths.find(p => p.name === name);
        if (path) topPaths.push({ name: path.name, riasec: path.riasec });
      });

      if (!topPaths.length) {
        throw new Error('هیچ مسیری با نتایج مطابقت نداشت');
      }

      // ۴) حذف loading و ساخت نمودار
      const loading = wrap.querySelector('#atlas-radar-loading');
      if (loading) loading.remove();

      const canvas = wrap.querySelector('#atlas-radar-canvas');
      if (!canvas) throw new Error('Canvas پیدا نشد');

      chartInstance = new Chart(canvas.getContext('2d'),
        buildChartConfig(userVec, topPaths));
      currentHash = hash;

    } catch (err) {
      console.error('[Atlas Chart]', err);
      wrap.remove();
      showError(result, err.message || 'خطای ناشناخته');
    }
  }

  function buildChartConfig(userVec, topPaths) {
    const order = ['R','I','A','S','E','C'];
    const labels = order.map(k => CONFIG.riasecLabels[k]);
    const userData = order.map(k => userVec[k]);

    const datasets = [
      {
        label: 'پروفایل شما',
        data: userData,
        borderColor: CONFIG.colors.user,
        backgroundColor: CONFIG.colors.fill,
        borderWidth: 3,
        pointBackgroundColor: CONFIG.colors.user,
        pointRadius: 5
      },
      ...topPaths.map((p, i) => ({
        label: p.name,
        data: order.map(k => p.riasec[k] || 0),
        borderColor: CONFIG.colors.top[i],
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [6, 4],
        pointBackgroundColor: CONFIG.colors.top[i],
        pointRadius: 3
      }))
    ];

    return {
      type: 'radar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { family: 'Vazirmatn, Tahoma, sans-serif', size: 12 },
              padding: 12, usePointStyle: true, boxWidth: 8
            }
          },
          tooltip: {
            titleFont: { family: 'Vazirmatn, Tahoma, sans-serif' },
            bodyFont: { family: 'Vazirmatn, Tahoma, sans-serif' },
            callbacks: {
              label: c => `${c.dataset.label}: ${(c.parsed.r * 100).toFixed(0)}٪`
            }
          }
        },
        scales: {
          r: {
            min: 0, max: 1,
            ticks: { stepSize: 0.25, display: false },
            grid: { color: '#e1e8ed' },
            angleLines: { color: '#e1e8ed' },
            pointLabels: {
              font: { family: 'Vazirmatn, Tahoma, sans-serif', size: 11 },
              color: '#1e3a5f'
            }
          }
        }
      }
    };
  }

  /* ---------- ۷) Polling: هر ۶۰۰ms چک می‌کند ---------- */
  setInterval(() => {
    const result = document.getElementById('quiz-result');
    if (!result) return;
    const ranks = result.querySelectorAll('.quiz-rank');
    if (!ranks.length) {
      // اگر نتیجه پاک شد (شروع دوباره) → نمودار را هم پاک کن
      if (currentHash) {
        currentHash = '';
        const w = result.querySelector('#atlas-radar-wrap');
        if (w) w.remove();
        if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
      }
      return;
    }
    renderChart(result);
  }, 600);

})();
