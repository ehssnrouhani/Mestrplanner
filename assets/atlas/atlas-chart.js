/* ============================================================
   Atlas — Radar Chart Module (Phase 3)
   نمودار راداری RIASEC: پروفایل کاربر vs سه مسیر برتر
   - Chart.js از CDN به صورت داینامیک لود می‌شود
   - به atlas-quiz.js دست نمی‌زند
   - با MutationObserver تشخیص می‌دهد نتیجه چه زمانی ظاهر شد
   ============================================================ */
(function () {
  'use strict';

  const CONFIG = {
    chartCdn:   'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js',
    careersUrl: './data/careers.json',
    colors: {
      user:   '#c9a961',
      top:    ['#1e3a5f', '#27ae60', '#e67e22'],
      fill:   'rgba(201,169,97,0.18)'
    },
    riasecLabels: {
      R: 'واقع‌گرا (R)',
      I: 'پژوهشی (I)',
      A: 'هنری (A)',
      S: 'اجتماعی (S)',
      E: 'متهور (E)',
      C: 'قراردادی (C)'
    }
  };

  let chartInstance = null;
  let careersCache = null;

  /* ---------- ۱) لود Chart.js از CDN ---------- */
  function loadChartJs() {
    return new Promise((resolve, reject) => {
      if (window.Chart) return resolve(window.Chart);
      const s = document.createElement('script');
      s.src = CONFIG.chartCdn;
      s.async = true;
      s.onload = () => resolve(window.Chart);
      s.onerror = () => reject(new Error('Chart.js بارگذاری نشد'));
      document.head.appendChild(s);
    });
  }

  /* ---------- ۲) کش کردن careers.json ---------- */
  async function getCareers() {
    if (careersCache) return careersCache;
    const res = await fetch(CONFIG.careersUrl, { cache: 'no-cache' });
    if (!res.ok) throw new Error('careers.json در دسترس نیست');
    careersCache = await res.json();
    return careersCache;
  }

  /* ---------- ۳) نظارت بر #quiz-result ---------- */
  function observeResults() {
    const check = setInterval(() => {
      const result = document.getElementById('quiz-result');
      if (!result) return;
      clearInterval(check);
      const observer = new MutationObserver(() => handleResultChange(result));
      observer.observe(result, { childList: true, subtree: false });
    }, 200);
  }

  function handleResultChange(result) {
    const ranks = result.querySelectorAll('.quiz-rank');
    if (!ranks.length) {
      if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
      return;
    }
    renderChart(result, Array.from(ranks));
  }

  /* ---------- ۴) استخراج داده و رندر ---------- */
  async function renderChart(result, rankEls) {
    try {
      const Chart = await loadChartJs();
      const careers = await getCareers();
      const userVec = readUserVector();
      const topPaths = rankEls.slice(0, 3).map(el => {
        const name = el.querySelector('span:first-child').textContent
          .replace(/^[۰-۹\d]+\.\s*/, '').trim();
        const path = careers.paths.find(p => p.name === name);
        return { name, riasec: path ? path.riasec : null };
      }).filter(x => x.riasec);

      if (!topPaths.length) return;

      // حذف نمودار قبلی اگر هست
      const oldCanvas = result.querySelector('#atlas-radar-wrap');
      if (oldCanvas) oldCanvas.remove();
      if (chartInstance) { chartInstance.destroy(); chartInstance = null; }

      // ساخت ظرف نمودار
      const wrap = document.createElement('div');
      wrap.id = 'atlas-radar-wrap';
      wrap.style.cssText = `
        background:#fff; border-radius:12px; padding:20px;
        margin-top:20px; box-shadow:0 2px 12px rgba(0,0,0,.05);
      `;
      wrap.innerHTML = `
        <h4 style="color:#1e3a5f;margin:0 0 8px;font-size:1rem;">
          📊 پروفایل شما در برابر سه مسیر برتر
        </h4>
        <p style="color:#5a6c7d;font-size:.82rem;margin:0 0 12px;line-height:1.7;">
          هر چه چندضلعی شما به یک مسیر نزدیک‌تر باشد، تناسب بیشتری با آن دارید.
          شش ضلع، شش تیپ شغلی مدل RIASEC هستند.
        </p>
        <div style="position:relative;max-width:520px;margin:0 auto;">
          <canvas id="atlas-radar-canvas"></canvas>
        </div>
      `;

      // درج قبل از دکمه «شروع دوباره» اگر هست، وگرنه append
      const restartBtn = result.querySelector('#quiz-restart');
      if (restartBtn && restartBtn.parentNode === result) {
        result.insertBefore(wrap, restartBtn.parentNode);
      } else {
        result.appendChild(wrap);
      }

      const ctx = document.getElementById('atlas-radar-canvas').getContext('2d');
      chartInstance = new Chart(ctx, buildChartConfig(userVec, topPaths));
    } catch (err) {
      console.error('[Atlas Chart]', err);
    }
  }

  /* ---------- ۵) خواندن پاسخ‌های کاربر از DOM ---------- */
  function readUserVector() {
    const map = { q_r: 'R', q_i: 'I', q_a: 'A', q_s: 'S', q_e: 'E', q_c: 'C' };
    const vec = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    Object.keys(map).forEach(id => {
      const el = document.getElementById(id);
      if (el) vec[map[id]] = (parseInt(el.value, 10) - 1) / 4;
    });
    return vec;
  }

  /* ---------- ۶) تنظیمات Chart.js ---------- */
  function buildChartConfig(userVec, topPaths) {
    const labels = ['R', 'I', 'A', 'S', 'E', 'C'].map(k => CONFIG.riasecLabels[k]);
    const userData = ['R', 'I', 'A', 'S', 'E', 'C'].map(k => userVec[k]);

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
        data: ['R', 'I', 'A', 'S', 'E', 'C'].map(k => p.riasec[k] || 0),
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
              padding: 12,
              usePointStyle: true,
              boxWidth: 8
            }
          },
          tooltip: {
            titleFont: { family: 'Vazirmatn, Tahoma, sans-serif' },
            bodyFont:  { family: 'Vazirmatn, Tahoma, sans-serif' },
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ${(ctx.parsed.r * 100).toFixed(0)}٪`
            }
          }
        },
        scales: {
          r: {
            min: 0,
            max: 1,
            ticks: {
              stepSize: 0.25,
              display: false
            },
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

  /* ---------- اجرا ---------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeResults);
  } else {
    observeResults();
  }
})();
