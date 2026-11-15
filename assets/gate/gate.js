/* ============================================================
   Masterplanner Gate — قفل ساده با رمز مشترک
   - بدون سرور، بدون ثبت‌نام
   - رمز در localStorage ذخیره می‌شود
   - ۹۵٪ کاربران عادی را متوقف می‌کند
   ============================================================ */
(function () {
  'use strict';

  // ═══════════════════════════════════════════════
  // ۱. تنظیمات — اینجا را تغییر بده
  // ═══════════════════════════════════════════════
  const CONFIG = {
    // رمز دسترسی — این را عوض کن
    password: 'masterplanner2026',
    
    // کلید ذخیره در localStorage
    storageKey: 'mp_access_v1',
    
    // مدت اعتبار (روز) — بعد از این مدت، کاربر باید دوباره رمز بزند
    validDays: 365,
    
    // بعد از ورود موفق، به کجا برگردد (null = همان صفحه)
    returnTo: null,
    
    // اگر true، صفحه ورود کامل جایگزین محتوا می‌شود
    // اگر false، یک overlay روی محتوا می‌گذارد
    fullPage: true
  };

  // ═══════════════════════════════════════════════
  // ۲. بررسی دسترسی
  // ═══════════════════════════════════════════════
  function hasAccess() {
    try {
      const raw = localStorage.getItem(CONFIG.storageKey);
      if (!raw) return false;
      
      const data = JSON.parse(raw);
      if (!data.expires) return false;
      
      // چک اعتبار
      if (Date.now() > data.expires) {
        localStorage.removeItem(CONFIG.storageKey);
        return false;
      }
      
      return true;
    } catch (e) {
      return false;
    }
  }

  function grantAccess() {
    const expires = Date.now() + (CONFIG.validDays * 24 * 60 * 60 * 1000);
    localStorage.setItem(CONFIG.storageKey, JSON.stringify({
      granted: Date.now(),
      expires: expires
    }));
  }

  function revokeAccess() {
    localStorage.removeItem(CONFIG.storageKey);
  }

  // ═══════════════════════════════════════════════
  // ۳. صفحه ورود
  // ═══════════════════════════════════════════════
  function buildLoginPage() {
    const container = document.createElement('div');
    container.className = 'mp-gate-overlay';
    container.innerHTML = `
      <div class="mp-gate-box">
        <div class="mp-gate-icon">🔒</div>
        <h1>دسترسی محدود</h1>
        <p class="mp-gate-sub">این ابزار مخصوص مشتریان مستر پلنر است.</p>
        <p class="mp-gate-help">
          برای دریافت رمز دسترسی،
          <a href="https://rubika.ir/Alfanet2828" target="_blank" rel="noopener">
            در روبیکا پیام بده
          </a>
          یا از صفحه فروش، اشتراک تهیه کن.
        </p>
        <form class="mp-gate-form" autocomplete="off">
          <label for="mp-gate-input">رمز دسترسی</label>
          <input 
            id="mp-gate-input" 
            type="password" 
            placeholder="رمز را وارد کن"
            autocomplete="current-password"
            required
          >
          <div class="mp-gate-error" id="mp-gate-error"></div>
          <button type="submit" class="mp-gate-btn">ورود</button>
        </form>
        <div class="mp-gate-footer">
          <a href="../sales/sales.html">خرید اشتراک ←</a>
          <span>|</span>
          <a href="../">بازگشت به خانه</a>
        </div>
      </div>
    `;
    return container;
  }

  // ═══════════════════════════════════════════════
  // ۴. استایل (inline — بدون فایل جدا)
  // ═══════════════════════════════════════════════
  function injectStyles() {
    if (document.getElementById('mp-gate-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'mp-gate-styles';
    style.textContent = `
      .mp-gate-overlay {
        position: fixed;
        inset: 0;
        background: 
          radial-gradient(circle at 20% 20%, rgba(232,151,31,0.15), transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(30,90,110,0.20), transparent 50%),
          linear-gradient(155deg, #06202b 0%, #0c3846 50%, #1e5a6e 100%);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        font-family: 'Vazirmatn', Tahoma, sans-serif;
        direction: rtl;
        animation: mp-gate-fade 0.3s ease;
      }
      @keyframes mp-gate-fade {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .mp-gate-box {
        background: #fff;
        border-radius: 16px;
        padding: 40px 32px;
        max-width: 420px;
        width: 100%;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0,0,0,0.4);
      }
      .mp-gate-icon {
        font-size: 3rem;
        line-height: 1;
        margin-bottom: 16px;
      }
      .mp-gate-box h1 {
        font-size: 1.5rem;
        font-weight: 800;
        color: #0c3846;
        margin: 0 0 8px;
      }
      .mp-gate-sub {
        color: #5a6c7d;
        font-size: 0.95rem;
        margin: 0 0 16px;
      }
      .mp-gate-help {
        color: #6b7c93;
        font-size: 0.85rem;
        line-height: 1.9;
        margin: 0 0 24px;
        padding: 12px;
        background: #f0f4f8;
        border-radius: 8px;
      }
      .mp-gate-help a {
        color: #e8971f;
        font-weight: 700;
        text-decoration: none;
      }
      .mp-gate-help a:hover {
        text-decoration: underline;
      }
      .mp-gate-form {
        text-align: right;
      }
      .mp-gate-form label {
        display: block;
        font-size: 0.85rem;
        font-weight: 700;
        color: #0c3846;
        margin-bottom: 8px;
      }
      .mp-gate-form input {
        width: 100%;
        padding: 14px 16px;
        border: 2px solid #e1e8ed;
        border-radius: 10px;
        font-family: inherit;
        font-size: 1rem;
        color: #1a2332;
        background: #fafbfc;
        text-align: center;
        letter-spacing: 0.1em;
        transition: border-color 0.2s;
      }
      .mp-gate-form input:focus {
        outline: none;
        border-color: #e8971f;
        background: #fff;
      }
      .mp-gate-error {
        color: #c0392b;
        font-size: 0.82rem;
        margin: 8px 0;
        min-height: 20px;
      }
      .mp-gate-btn {
        width: 100%;
        padding: 14px;
        background: #0c3846;
        color: #fff;
        border: none;
        border-radius: 10px;
        font-family: inherit;
        font-size: 1rem;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.2s, transform 0.1s;
        margin-top: 8px;
      }
      .mp-gate-btn:hover {
        background: #1e5a6e;
      }
      .mp-gate-btn:active {
        transform: scale(0.98);
      }
      .mp-gate-footer {
        margin-top: 24px;
        padding-top: 20px;
        border-top: 1px solid #e1e8ed;
        font-size: 0.85rem;
        color: #6b7c93;
      }
      .mp-gate-footer a {
        color: #0c3846;
        text-decoration: none;
        font-weight: 600;
      }
      .mp-gate-footer a:hover {
        text-decoration: underline;
      }
      .mp-gate-footer span {
        margin: 0 8px;
        color: #cbd5e1;
      }
    `;
    document.head.appendChild(style);
  }

  // ═══════════════════════════════════════════════
  // ۵. نمایش صفحه ورود
  // ═══════════════════════════════════════════════
  function showLogin() {
    injectStyles();
    
    // مخفی کردن محتوای اصلی
    if (CONFIG.fullPage) {
      document.documentElement.style.overflow = 'hidden';
    }
    
    const page = buildLoginPage();
    document.body.appendChild(page);
    
    const input = page.querySelector('#mp-gate-input');
    const form = page.querySelector('.mp-gate-form');
    const error = page.querySelector('#mp-gate-error');
    
    // فوکوس روی ورودی
    setTimeout(() => input.focus(), 100);
    
    // ارسال فرم
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const entered = input.value.trim();
      
      if (!entered) {
        error.textContent = 'رمز را وارد کن.';
        return;
      }
      
      // مقایسه ساده — case-sensitive
      if (entered === CONFIG.password) {
        grantAccess();
        error.textContent = '';
        
        // انیمیشن خروج
        page.style.animation = 'mp-gate-fade 0.2s reverse';
        setTimeout(() => {
          page.remove();
          document.documentElement.style.overflow = '';
          
          // اگر returnTo تنظیم شده، برو
          if (CONFIG.returnTo) {
            window.location.href = CONFIG.returnTo;
          } else {
            // reload تا ابزار لود شود
            window.location.reload();
          }
        }, 200);
      } else {
        error.textContent = 'رمز اشتباه است. دوباره تلاش کن.';
        input.value = '';
        input.focus();
        
        // لرزش
        page.querySelector('.mp-gate-box').style.animation = 'mp-gate-shake 0.3s';
        setTimeout(() => {
          page.querySelector('.mp-gate-box').style.animation = '';
        }, 300);
      }
    });
  }

  // ═══════════════════════════════════════════════
  // ۶. اجرا
  // ═══════════════════════════════════════════════
  function init() {
    if (hasAccess()) {
      // دسترسی دارد → هیچ کاری نکن
      // فقط یک دکمه خروج کوچک اضافه کن (اختیاری)
      return;
    }
    
    // دسترسی ندارد → صفحه ورود
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showLogin);
    } else {
      showLogin();
    }
  }

  // ═══════════════════════════════════════════════
  // ۷. API عمومی (برای استفاده در Console یا دکمه خروج)
  // ═══════════════════════════════════════════════
  window.MPGate = {
    login: function(password) {
      if (password === CONFIG.password) {
        grantAccess();
        window.location.reload();
      } else {
        return false;
      }
    },
    logout: function() {
      revokeAccess();
      window.location.reload();
    },
    hasAccess: hasAccess
  };

  init();
})();