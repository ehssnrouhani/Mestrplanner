/* ============================================================
   Masterplanner Gate — نسخه اشتراکی با رمزهای یکتا
   ============================================================ */
(function () {
  'use strict';

  const CONFIG = {
    // ═══════════════════════════════════════════
    // لیست رمزهای معتبر — برای هر خریدار، یک رمز
    // بعد از پرداخت، رمز اضافه کن
    // بعد از انقضای اشتراک، رمز را حذف کن
    // ═══════════════════════════════════════════
    passwords: [
      { code: 'MP-USER-AAA001', name: 'علی — ۱۴۰۴/۰۸/۱۵' },
      { code: 'MP-USER-AAA002', name: 'سارا — ۱۴۰۴/۰۸/۲۰' },
      { code: 'MP-USER-AAA003', name: 'رضا — ۱۴۰۴/۰۹/۰۱' },
      // رمز جدید را اینجا اضافه کن
    ],

    // کلید و مدت اعتبار
    storageKey: 'mp_access_v1',
    validDays: 30,  // ← اشتراک ماهانه

    // اطلاعات تماس
    contact: {
      rubikaSupport: 'https://rubika.ir/Alfanet2828',
      rubikaChannel: 'https://rubika.ir/mesterplanner',
      phone: '09137583008',
      phoneFa: '۰۹۱۳۷۵۸۳۰۰۸'
    }
  };

  function hasAccess() {
    try {
      const raw = localStorage.getItem(CONFIG.storageKey);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data.expires) return false;
      if (Date.now() > data.expires) {
        localStorage.removeItem(CONFIG.storageKey);
        return false;
      }
      return true;
    } catch (e) { return false; }
  }

  function grantAccess(code) {
    const expires = Date.now() + (CONFIG.validDays * 24 * 60 * 60 * 1000);
    localStorage.setItem(CONFIG.storageKey, JSON.stringify({
      code: code,
      granted: Date.now(),
      expires: expires
    }));
  }

  // بررسی رمز
  function checkPassword(entered) {
    return CONFIG.passwords.find(p => 
      p.code.toLowerCase() === entered.toLowerCase().trim()
    );
  }

  // ═══════════════════════════════════════════
  // صفحه ورود (همان قبلی، فقط پیام‌ها عوض شده)
  // ═══════════════════════════════════════════
  function buildLoginPage() {
    const c = CONFIG.contact;
    const container = document.createElement('div');
    container.className = 'mp-gate-overlay';
    container.innerHTML = `
      <div class="mp-gate-box">
        <div class="mp-gate-header">
          <div class="mp-gate-icon">🔐</div>
          <h1>دسترسی به ابزارهای مستر پلنر</h1>
          <p class="mp-gate-sub">
            این بخش، مخصوص مشتریان دارای <strong>اشتراک فعال</strong> است.
          </p>
        </div>

        <div class="mp-gate-content">

          <div class="mp-gate-section">
            <h2>✅ با اشتراک، به این‌ها دسترسی داری:</h2>
            <ul class="mp-gate-list">
              <li><strong>🗺️ اطلس مشاغل</strong> — تحلیل جامع ۱۰ مسیر شغلی</li>
              <li><strong>🎯 ابزار تخمین تمرین</strong> — محاسبه دقیق تمرین</li>
              <li><strong>📐 ماشین حساب پیشرفته</strong> — مشتق، انتگرال، حد</li>
              <li><strong>🧠 آزمایشگاه شبکه عصبی</strong> — به‌زودی</li>
            </ul>
          </div>

          <div class="mp-gate-section">
            <h2>🔑 چطور رمز دسترسی بگیری؟</h2>
            <ol class="mp-gate-steps-list">
              <li>
                <span class="mp-step-num">۱</span>
                <div>
                  <strong>مبلغ اشتراک را پرداخت کن</strong>
                  <p>اشتراک ماهانه. مبلغ را در گفتگو با ادمین هماهنگ می‌کنی.</p>
                </div>
              </li>
              <li>
                <span class="mp-step-num">۲</span>
                <div>
                  <strong>رسید پرداخت را برای ادمین بفرست</strong>
                  <p>از طریق راه‌های ارتباطی پایین، رسید و درخواستت را ارسال می‌کنی.</p>
                </div>
              </li>
              <li>
                <span class="mp-step-num">۳</span>
                <div>
                  <strong>رمز اختصاصی را دریافت می‌کنی</strong>
                  <p>تا ۳۰ دقیقه (ساعت ۹ صبح تا ۱۱ شب). رمز یکتاست — مخصوص خودت.</p>
                </div>
              </li>
              <li>
                <span class="mp-step-num">۴</span>
                <div>
                  <strong>رمز را وارد کن</strong>
                  <p>بعد از وارد کردن، تا <strong>۳۰ روز</strong> دسترسی داری. برای تمدید، دوباره با ادمین در ارتباط باش.</p>
                </div>
              </li>
            </ol>
          </div>

          <div class="mp-gate-section">
            <h2>📞 راه‌های ارتباط با ادمین</h2>
            <p class="mp-gate-contact-help">برای دریافت رمز، ابتدا با ادمین در ارتباط باش:</p>
            <div class="mp-contact-grid">
              <a href="${c.rubikaSupport}" target="_blank" rel="noopener" class="mp-contact-card">
                <div class="mp-contact-icon">💬</div>
                <div class="mp-contact-info">
                  <strong>پشتیبانی در روبیکا</strong>
                  <span>Alfanet2828</span>
                </div>
              </a>
              <a href="${c.rubikaChannel}" target="_blank" rel="noopener" class="mp-contact-card">
                <div class="mp-contact-icon">📢</div>
                <div class="mp-contact-info">
                  <strong>کانال مستر پلنر</strong>
                  <span>mesterplanner</span>
                </div>
              </a>
              <a href="tel:${c.phone}" class="mp-contact-card">
                <div class="mp-contact-icon">📱</div>
                <div class="mp-contact-info">
                  <strong>شماره تماس</strong>
                  <span>${c.phoneFa}</span>
                </div>
              </a>
            </div>
            <div class="mp-gate-note">
              <strong>💡 نکته:</strong>
              در روبیکا پیام بده و بنویس <strong>«درخواست رمز دسترسی»</strong> — تا مراحل پرداخت و دریافت رمز را برایت توضیح دهم.
            </div>
          </div>

          <div class="mp-gate-guarantee">
            <div class="mp-guarantee-icon">🔒</div>
            <div>
              <strong>ضمانت بازگشت وجه</strong>
              <p>اگر تا ۷ روز بعد از دریافت رمز، راضی نبودی، بدون سؤال، مبلغ برمی‌گردد.</p>
            </div>
          </div>

          <div class="mp-gate-section mp-gate-login-section">
            <h2>🔓 اگر رمز داری، اینجا وارد کن:</h2>
            <form class="mp-gate-form" autocomplete="off">
              <label for="mp-gate-input">رمز دسترسی</label>
              <input 
                id="mp-gate-input" 
                type="text" 
                placeholder="مثلاً: MP-USER-AAA001"
                autocomplete="off"
                required
                style="letter-spacing: 0.08em;"
              >
              <div class="mp-gate-error" id="mp-gate-error"></div>
              <button type="submit" class="mp-gate-btn">ورود به ابزارها</button>
            </form>
          </div>

        </div>

        <div class="mp-gate-footer">
          <a href="../sales/sales.html">مشاهده جزئیات اشتراک</a>
          <span>|</span>
          <a href="../">بازگشت به خانه</a>
        </div>
      </div>
    `;
    return container;
  }

  // (استایل، همان قبلی — حذف شده برای اختصار)
  function injectStyles() {
    if (document.getElementById('mp-gate-styles')) return;
    const style = document.createElement('style');
    style.id = 'mp-gate-styles';
    // ... همان استایل قبلی را اینجا بگذار
    document.head.appendChild(style);
  }

  function showLogin() {
    injectStyles();
    document.documentElement.style.overflow = 'hidden';
    const page = buildLoginPage();
    document.body.appendChild(page);

    const input = page.querySelector('#mp-gate-input');
    const form = page.querySelector('.mp-gate-form');
    const error = page.querySelector('#mp-gate-error');

    setTimeout(() => input.focus(), 100);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const entered = input.value.trim();

      if (!entered) {
        error.textContent = 'رمز را وارد کن.';
        return;
      }

      const match = checkPassword(entered);
      if (match) {
        grantAccess(match.code);
        error.textContent = '';
        page.style.animation = 'mp-gate-fade 0.2s reverse';
        setTimeout(() => {
          page.remove();
          document.documentElement.style.overflow = '';
          window.location.reload();
        }, 200);
      } else {
        error.textContent = '❌ رمز نامعتبر است یا منقضی شده. برای دریافت رمز جدید، از راه‌های بالا با ادمین در ارتباط باش.';
        input.value = '';
        input.focus();
        page.querySelector('.mp-gate-box').style.animation = 'mp-gate-shake 0.3s';
        setTimeout(() => {
          page.querySelector('.mp-gate-box').style.animation = '';
        }, 300);
      }
    });
  }

  function init() {
    if (hasAccess()) return;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showLogin);
    } else {
      showLogin();
    }
  }

  window.MPGate = {
    logout: function() {
      localStorage.removeItem(CONFIG.storageKey);
      window.location.reload();
    },
    hasAccess: hasAccess,
    // برای دیباگ: نمایش اطلاعات دسترسی فعلی
    info: function() {
      const raw = localStorage.getItem(CONFIG.storageKey);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return {
        code: data.code,
        expires: new Date(data.expires).toLocaleDateString('fa-IR'),
        daysLeft: Math.ceil((data.expires - Date.now()) / (1000 * 60 * 60 * 24))
      };
    }
  };

  init();
})();