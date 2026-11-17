/* ============================================================
   Masterplanner Gate v2 — دروازهٔ اشتراک با کد امضاشده (ECDSA P-256)
   • کدها را فقط پنل مدیریت (admin.html) با کلید خصوصیِ شما می‌سازد؛ بدون آن، کد جعل‌شدنی نیست.
   • این فایل فقط «کلید عمومی» دارد. رمز یا کد معتبری در آن ذخیره نمی‌شود.
   • حالت کتابخانه: قبل از بارگذاری  window.MP_GATE_MODE='lib'  بگذار (برای admin/reset/activate).
   ============================================================ */
(function () {
  'use strict';

  var BASE = (document.currentScript && document.currentScript.src) ? document.currentScript.src.replace(/[^\/]*$/, '') : '';
  var USER = window.MP_GATE_CONFIG || {};
  var LIB_MODE = window.MP_GATE_MODE === 'lib';

  var CONFIG = {
    // ── کلید عمومی: خروجی پنل مدیریت → «تنظیمات». یا فایل public-key.json را کنار gate.js بگذار.
    publicKey: null,
    publicKeyUrl: BASE + 'public-key.json',
    revokedUrl: BASE + 'revoked.json',
    storageKey: 'mp_license_v2',
    legacyKeys: ['mp_access_v1'],
    plans: {
      monthly: {
        name: 'اشتراک ماهانه', price: '۵۹,۰۰۰', period: 'ماه', validityDays: 30,
        link: 'https://rubika.ir/Alfanet2828', linkLabel: 'روبیکا: Alfanet2828',
        buttonText: 'خرید اشتراک ماهانه',
        features: ['دسترسی کامل به همه ابزارها', '۳۰ روز اعتبار', 'تمدید آسان'], featured: false
      },
      yearly: {
        name: 'اشتراک سالانه', price: '۴۹۰,۰۰۰', launchPrice: '۳۹۰,۰۰۰', period: 'سال', validityDays: 365,
        link: 'https://rubika.ir/mesterplanner', linkLabel: 'روبیکا: mesterplanner',
        phone: '09137583008', phoneFa: '۰۹۱۳۷۵۸۳۰۰۸',
        buttonText: 'خرید اشتراک سالانه',
        features: ['دسترسی کامل به همه ابزارها', '۳۶۵ روز اعتبار', 'به‌روزرسانی‌های رایگان', 'صرفه‌جویی ۳۱٪ نسبت به ماهانه'], featured: true
      }
    },
    contact: {
      rubikaSupport: 'https://rubika.ir/Alfanet2828',
      rubikaChannel: 'https://rubika.ir/mesterplanner',
      phone: '09137583008', phoneFa: '۰۹۱۳۷۵۸۳۰۰۸'
    }
  };
  for (var k in USER) if (Object.prototype.hasOwnProperty.call(USER, k)) CONFIG[k] = USER[k];
  var TEHRAN_MS = 12600000;           // +۳:۳۰
  var LAST_KEY = 'mp_last_seen_v2', REV_KEY = 'mp_revoked_cache_v2', FAIL_KEY = 'mp_gate_fail_v2';

  // ═══════════════════════════════════════════
  // ابزارهای پایه
  // ═══════════════════════════════════════════
  var enc = new TextEncoder(), dec = new TextDecoder();
  function b64uToBytes(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; var b = atob(s), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
  function readJSON(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function writeJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function fmtDay(d) { return new Date(d * 86400000).toLocaleDateString('fa-IR', { timeZone: 'UTC' }); }
  var PLAN_FA = { m: 'ماهانه', y: 'سالانه', c: 'ویژه' };
  function today() {                      // شمارهٔ روز (تهران)؛ برگرداندن ساعت دستگاه به عقب اثری ندارد
    var now = Date.now(), last = +localStorage.getItem(LAST_KEY) || 0, eff = Math.max(now, last);
    try { localStorage.setItem(LAST_KEY, String(eff)); } catch (e) {}
    return Math.floor((eff + TEHRAN_MS) / 86400000);
  }

  // ═══════════════════════════════════════════
  // تأیید کد
  // ═══════════════════════════════════════════
  var keyPromise = null;
  function getKey() {
    if (keyPromise) return keyPromise;
    keyPromise = (CONFIG.publicKey ? Promise.resolve(CONFIG.publicKey) :
      fetch(CONFIG.publicKeyUrl, { cache: 'no-store' }).then(function (r) { if (!r.ok) throw 0; return r.json(); }))
      .then(function (jwk) { return crypto.subtle.importKey('jwk', { kty: 'EC', crv: 'P-256', x: jwk.x, y: jwk.y, ext: true }, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']); });
    return keyPromise;
  }
  function parseCode(raw) {
    var s = String(raw || '').replace(/[\u200b-\u200f\u202a-\u202e\ufeff\s]+/g, '');
    var m = /(?:code=|mpcode=)?(MP1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)/.exec(s);
    if (!m) return null;
    var p = m[1].split('.');
    return { code: m[1], pl: p[1], sig: p[2] };
  }
  function getRevoked() {
    var cache = readJSON(REV_KEY) || { ids: [] };
    if (!CONFIG.revokedUrl) return Promise.resolve(cache.ids);
    var ctl = 'AbortController' in window ? new AbortController() : null, to = setTimeout(function () { if (ctl) ctl.abort(); }, 3000);
    return fetch(CONFIG.revokedUrl + '?t=' + Date.now(), { cache: 'no-store', signal: ctl ? ctl.signal : undefined })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (j) { var ids = Array.isArray(j.revoked) ? j.revoked.map(String) : []; writeJSON(REV_KEY, { ids: ids, t: Date.now() }); return ids; })
      .catch(function () { return cache.ids; })
      .then(function (ids) { clearTimeout(to); return ids; });
  }
  function verify(raw) {
    if (!(window.crypto && crypto.subtle)) return Promise.resolve({ ok: false, reason: 'nocrypto' });
    var p = parseCode(raw);
    if (!p) return Promise.resolve({ ok: false, reason: 'format' });
    return getKey().then(function (key) {
      return crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, b64uToBytes(p.sig), enc.encode('MP1.' + p.pl));
    }, function () { return 'nokey'; }).then(function (ok) {
      if (ok === 'nokey') return { ok: false, reason: 'nokey' };
      if (!ok) return { ok: false, reason: 'sig' };
      var pay; try { pay = JSON.parse(dec.decode(b64uToBytes(p.pl))); } catch (e) { return { ok: false, reason: 'payload' }; }
      if (!pay || pay.v !== 1 || !pay.i || !isFinite(pay.e) || !isFinite(pay.s)) return { ok: false, reason: 'payload' };
      var d = today();
      if (d < pay.s - 1) return { ok: false, reason: 'notyet', payload: pay };
      if (d > pay.e) return { ok: false, reason: 'expired', payload: pay };
      return getRevoked().then(function (ids) {
        if (ids.indexOf(String(pay.i)) > -1) return { ok: false, reason: 'revoked', payload: pay };
        if (pay.t && pay.t.length && window.MP_GATE_SCOPE && pay.t.indexOf(window.MP_GATE_SCOPE) < 0) return { ok: false, reason: 'scope', payload: pay };
        return { ok: true, payload: pay, code: p.code, daysLeft: pay.e - d + 1 };
      });
    }).catch(function () { return { ok: false, reason: 'format' }; });
  }
  var MSG = {
    format: 'کد معتبر نیست. کد باید با MP1. شروع شود؛ همهٔ آن را کامل کپی کن.',
    sig: 'کد معتبر نیست (امضا تأیید نشد). مطمئن شو کد را کامل و بدون تغییر چسبانده‌ای.',
    payload: 'محتوای کد آسیب دیده است. کد را دوباره از پشتیبانی بگیر.',
    nokey: 'سیستم هنوز پیکربندی نشده است (کلید عمومی تنظیم نشده). با پشتیبانی تماس بگیر.',
    nocrypto: 'این مرورگر یا این نوع آدرس (غیر از HTTPS) از تأیید امن کد پشتیبانی نمی‌کند.',
    scope: 'اشتراک تو شامل این ابزار نیست. برای ارتقا با پشتیبانی تماس بگیر.'
  };
  function reasonText(r) {
    var pay = r.payload;
    if (r.reason === 'expired') return '⏳ اشتراک تو در تاریخ ' + fmtDay(pay.e) + ' به پایان رسیده است. برای تمدید با پشتیبانی تماس بگیر.';
    if (r.reason === 'revoked') return '⛔ این کد توسط مدیر غیرفعال شده است. با پشتیبانی تماس بگیر.';
    if (r.reason === 'notyet') return 'این کد از تاریخ ' + fmtDay(pay.s) + ' فعال می‌شود.';
    return MSG[r.reason] || 'کد پذیرفته نشد.';
  }

  // ═══════════════════════════════════════════
  // وضعیت دسترسی
  // ═══════════════════════════════════════════
  function clearAll() {
    try { localStorage.removeItem(CONFIG.storageKey); localStorage.removeItem(REV_KEY); (CONFIG.legacyKeys || []).forEach(function (k) { localStorage.removeItem(k); }); } catch (e) {}
  }
  function checkAccess() {
    try { (CONFIG.legacyKeys || []).forEach(function (k) { localStorage.removeItem(k); }); } catch (e) {}
    var st = readJSON(CONFIG.storageKey);
    if (!st || !st.code) return Promise.resolve({ ok: false, reason: 'none' });
    return verify(st.code).then(function (r) { if (!r.ok && r.reason !== 'nokey' && r.reason !== 'nocrypto') { /* مجوز نامعتبر: پاک شود */ try { localStorage.removeItem(CONFIG.storageKey); } catch (e) {} } return r; });
  }
  function activate(raw) {
    var fail = readJSON(FAIL_KEY) || { n: 0, until: 0 };
    if (Date.now() < fail.until) return Promise.resolve({ ok: false, reason: 'locked', wait: Math.ceil((fail.until - Date.now()) / 1000) });
    return verify(raw).then(function (r) {
      if (r.ok) { writeJSON(CONFIG.storageKey, { code: r.code, at: Date.now() }); try { localStorage.removeItem(FAIL_KEY); } catch (e) {} return r; }
      if (r.reason === 'sig' || r.reason === 'format' || r.reason === 'payload') { fail.n++; if (fail.n >= 5) { fail.until = Date.now() + 30000; fail.n = 0; } writeJSON(FAIL_KEY, fail); }
      return r;
    });
  }
  function logout() { clearAll(); }
  function urlCode() {
    var m = /[#?&](?:code|mpcode)=([^&]+)/.exec(location.hash + location.search);
    if (!m) return null;
    try { return decodeURIComponent(m[1]); } catch (e) { return m[1]; }
  }
  function stripUrlCode() {
    try { var u = location.pathname + location.search.replace(/([?&])(?:code|mpcode)=[^&]*&?/, '$1').replace(/[?&]$/, ''); history.replaceState(null, '', u + (location.hash.replace(/[#&]?(?:code|mpcode)=[^&]*/, '') || '')); } catch (e) {}
  }

  // ═══════════════════════════════════════════
  // صفحهٔ ورود (طراحی اصلی شما)
  // ═══════════════════════════════════════════
  function buildLoginPage() {
    const c = CONFIG.contact;
    const m = CONFIG.plans.monthly;
    const y = CONFIG.plans.yearly;

    const container = document.createElement('div');
    container.className = 'mp-gate-overlay';

    // تابع ساخت کارت قیمت
    function priceCard(plan, key) {
      const featured = plan.featured ? ' mp-price-card-featured' : '';
      const badge = plan.featured 
        ? '<div class="mp-price-badge">⭐ پیشنهاد ویژه</div>' 
        : '';
      
      const priceHTML = plan.launchPrice
        ? `<div class="mp-price-amount">${plan.launchPrice}<span> تومان</span></div>
           <div class="mp-price-original"><s>${plan.price}</s> <span class="mp-price-save">قیمت راه‌اندازی</span></div>`
        : `<div class="mp-price-amount">${plan.price}<span> تومان</span></div>`;
      
      const phoneHTML = plan.phone
        ? `<p class="mp-price-note">یا تماس: <a href="tel:${plan.phone}" style="color:inherit;text-decoration:underline;">${plan.phoneFa}</a></p>`
        : '';

      const featuresHTML = plan.features
        .map(function (f) { return '<li>✓ ' + f + '</li>'; })
        .join('');

      return `
        <div class="mp-price-card${featured}">
          ${badge}
          <div class="mp-price-header">
            <h3>${plan.name}</h3>
            ${priceHTML}
            <div class="mp-price-period">/ ${plan.period}</div>
          </div>
          <ul class="mp-price-features">${featuresHTML}</ul>
          <a href="${plan.link}" target="_blank" rel="noopener" 
             class="mp-price-btn mp-price-btn-${key}">
            ${plan.buttonText} ←
          </a>
          <p class="mp-price-note">${plan.linkLabel}</p>
          ${phoneHTML}
        </div>
      `;
    }

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

          <!-- ویژگی‌ها -->
          <div class="mp-gate-section">
            <h2>✅ با اشتراک، به این‌ها دسترسی داری:</h2>
            <ul class="mp-gate-list">
              <li><strong>🗺️ اطلس مشاغل</strong> — تحلیل جامع ۱۰ مسیر شغلی + ۹ پرسش</li>
              <li><strong>🎯 ابزار تخمین تمرین</strong> — محاسبه دقیق تمرین هر درس</li>
              <li><strong>📐 ماشین حساب پیشرفته</strong> — مشتق، انتگرال، حد، رسم نمودار</li>
              <li><strong>🧠 آزمایشگاه شبکه عصبی</strong> — تجربه تعاملی یادگیری <span class="mp-badge-soon">به‌زودی</span></li>
              <li><strong>📚 به‌روزرسانی‌های آینده</strong> — همه ابزارهای جدید</li>
            </ul>
          </div>

          <!-- قیمت -->
          <div class="mp-gate-section mp-gate-pricing">
            <h2>💰 قیمت اشتراک</h2>
            <p class="mp-pricing-intro">
              یک بار پرداخت، دسترسی کامل به همه ابزارها. تفاوت فقط در مدت اعتبار.
            </p>
            <div class="mp-pricing-grid">
              ${priceCard(m, 'monthly')}
              ${priceCard(y, 'yearly')}
            </div>
            <div class="mp-pricing-launch">
              🎁 <strong>قیمت راه‌اندازی:</strong> 
              ۳۹۰,۰۰۰ تومان برای <strong>۱۰۰ کاربر اول</strong> — بعد از آن ۴۹۰,۰۰۰ تومان
            </div>
          </div>

          <!-- مراحل -->
          <div class="mp-gate-section">
            <h2>🔑 چطور رمز دسترسی بگیری؟</h2>
            <ol class="mp-gate-steps-list">
              <li>
                <span class="mp-step-num">۱</span>
                <div>
                  <strong>طرح دلخواهت را انتخاب کن</strong>
                  <p>ماهانه (۵۹,۰۰۰) یا سالانه (۳۹۰,۰۰۰ راه‌اندازی).</p>
                </div>
              </li>
              <li>
                <span class="mp-step-num">۲</span>
                <div>
                  <strong>روی دکمه خرید کلیک کن</strong>
                  <p>به روبیکای ادمین مربوطه منتقل می‌شوی.</p>
                </div>
              </li>
              <li>
                <span class="mp-step-num">۳</span>
                <div>
                  <strong>رسید پرداخت را بفرست</strong>
                  <p>همراه با نام و نام خانوادگی.</p>
                </div>
              </li>
              <li>
                <span class="mp-step-num">۴</span>
                <div>
                  <strong>کد یا لینک فعال‌سازی را دریافت کن</strong>
                  <p>حداکثر تا ۳۰ دقیقه (ساعت ۹ صبح تا ۱۱ شب).</p>
                </div>
              </li>
              <li>
                <span class="mp-step-num">۵</span>
                <div>
                  <strong>روی لینک بزن یا کد را در کادر پایین بچسبان</strong>
                  <p>تا پایان دوره، به همه ابزارها دسترسی داری.</p>
                </div>
              </li>
            </ol>
          </div>

          <!-- ضمانت -->
          <div class="mp-gate-guarantee">
            <div class="mp-guarantee-icon">🔒</div>
            <div>
              <strong>ضمانت بازگشت وجه</strong>
              <p>اگر تا ۷ روز بعد از دریافت رمز، راضی نبودی، بدون سؤال، مبلغ برمی‌گردد.</p>
            </div>
          </div>

          <!-- راه‌های ارتباط -->
          <div class="mp-gate-section">
            <h2>📞 راه‌های ارتباط</h2>
            <div class="mp-contact-grid">
              <a href="${c.rubikaSupport}" target="_blank" rel="noopener" class="mp-contact-card">
                <div class="mp-contact-icon">💬</div>
                <div class="mp-contact-info">
                  <strong>پشتیبانی (ماهانه)</strong>
                  <span>Alfanet2828</span>
                </div>
              </a>
              <a href="${c.rubikaChannel}" target="_blank" rel="noopener" class="mp-contact-card">
                <div class="mp-contact-icon">📢</div>
                <div class="mp-contact-info">
                  <strong>کانال (سالانه)</strong>
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
          </div>

          <!-- فرم ورود -->
          <div class="mp-gate-section mp-gate-login-section">
            <h2>🔓 اگر کد دسترسی داری، اینجا وارد کن:</h2>
            <div class="mp-gate-note" id="mp-gate-note" role="status"></div>
            <form class="mp-gate-form" autocomplete="off">
              <label for="mp-gate-input">کد دسترسی</label>
              <input id="mp-gate-input" type="text" 
                     placeholder="MP1.… (کد یا لینک فعال‌سازی را اینجا بچسبان)" dir="ltr" spellcheck="false" autocomplete="off" required>
              <div class="mp-gate-error" id="mp-gate-error"></div>
              <button type="submit" class="mp-gate-btn" id="mp-gate-submit">ورود به ابزارها</button>
            </form>
          </div>

        </div>

        <div class="mp-gate-footer">
          <a href="../sales/sales.html">مشاهده محصولات</a>
          <span>|</span>
          <a href="../">بازگشت به خانه</a>
        </div>
      </div>
    `;
    return container;
  }

  function injectStyles() {
    if (document.getElementById('mp-gate-styles')) return;

    const style = document.createElement('style');
    style.id = 'mp-gate-styles';
    style.textContent = `
      .mp-gate-overlay {
        position: fixed; inset: 0;
        background: 
          radial-gradient(circle at 20% 20%, rgba(232,151,31,0.15), transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(30,90,110,0.20), transparent 50%),
          linear-gradient(155deg, #06202b 0%, #0c3846 50%, #1e5a6e 100%);
        z-index: 999999;
        display: flex; align-items: flex-start; justify-content: center;
        padding: 20px; overflow-y: auto;
        font-family: 'Vazirmatn', Tahoma, sans-serif; direction: rtl;
        animation: mp-gate-fade 0.3s ease;
      }
      @keyframes mp-gate-fade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes mp-gate-shake {
        0%,100% { transform: translateX(0); }
        25% { transform: translateX(-8px); }
        75% { transform: translateX(8px); }
      }
      .mp-gate-box {
        background: #fff; border-radius: 16px; padding: 0;
        max-width: 720px; width: 100%;
        box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        margin: auto; overflow: hidden;
      }
      .mp-gate-header {
        background: linear-gradient(135deg, #0c3846, #1e5a6e);
        color: #fff; padding: 32px 24px; text-align: center;
        position: relative;
      }
      .mp-gate-header::after {
        content: ''; position: absolute; bottom: -1px; left: 0; right: 0;
        height: 4px;
        background: linear-gradient(90deg, transparent, #e8971f, transparent);
      }
      .mp-gate-icon { font-size: 3rem; line-height: 1; margin-bottom: 12px; }
      .mp-gate-header h1 { font-size: 1.3rem; font-weight: 800; margin: 0 0 8px; color: #fff; }
      .mp-gate-sub { font-size: 0.9rem; color: rgba(255,255,255,0.85); margin: 0; line-height: 1.7; }
      .mp-gate-sub strong { color: #f5b041; font-weight: 700; }

      .mp-gate-content { padding: 24px; }
      .mp-gate-section {
        margin-bottom: 24px; padding-bottom: 24px;
        border-bottom: 1px solid #e1e8ed;
      }
      .mp-gate-section:last-child {
        border-bottom: none; margin-bottom: 0; padding-bottom: 0;
      }
      .mp-gate-section h2 {
        font-size: 1rem; font-weight: 700; color: #0c3846;
        margin: 0 0 12px; line-height: 1.6;
      }

      .mp-gate-list { list-style: none; padding: 0; margin: 0; }
      .mp-gate-list li {
        padding: 8px 0 8px 24px; position: relative;
        font-size: 0.88rem; color: #2c3e50; line-height: 1.7;
        border-bottom: 1px dashed #f0f3f5;
      }
      .mp-gate-list li:last-child { border-bottom: none; }
      .mp-gate-list li::before {
        content: '✓'; position: absolute; right: 0; top: 8px;
        width: 18px; height: 18px; background: #27ae60; color: #fff;
        border-radius: 50%; display: flex; align-items: center; justify-content: center;
        font-size: 0.65rem; font-weight: 900;
      }
      .mp-gate-list li strong { color: #0c3846; display: block; margin-bottom: 2px; font-size: 0.9rem; }
      .mp-badge-soon {
        display: inline-block; background: #fff3e0; color: #e65100;
        padding: 1px 6px; border-radius: 10px; font-size: 0.7rem;
        font-weight: 700; margin-right: 4px;
      }

      /* Pricing */
      .mp-pricing-intro {
        font-size: 0.85rem; color: #5a6c7d;
        line-height: 1.8; margin: 0 0 16px;
      }
      .mp-pricing-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 14px; margin-bottom: 16px;
      }
      .mp-price-card {
        background: #fff; border: 2px solid #e1e8ed;
        border-radius: 14px; padding: 20px 18px;
        text-align: center; position: relative;
        transition: all 0.2s;
      }
      .mp-price-card:hover {
        border-color: #1e5a6e;
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.08);
      }
      .mp-price-card-featured {
        border-color: #e8971f;
        background: linear-gradient(180deg, #fffbf3 0%, #fff 100%);
        box-shadow: 0 4px 16px rgba(232,151,31,0.15);
      }
      .mp-price-badge {
        position: absolute; top: -12px; right: 50%; transform: translateX(50%);
        background: linear-gradient(135deg, #e8971f, #f5b041);
        color: #fff; padding: 4px 14px; border-radius: 20px;
        font-size: 0.72rem; font-weight: 700;
        box-shadow: 0 2px 8px rgba(232,151,31,0.4);
        white-space: nowrap;
      }
      .mp-price-header { margin-bottom: 16px; }
      .mp-price-header h3 {
        color: #0c3846; font-size: 1.05rem; font-weight: 800;
        margin: 0 0 10px;
      }
      .mp-price-amount {
        font-size: 1.9rem; font-weight: 900; color: #0c3846;
        line-height: 1.1;
      }
      .mp-price-amount span {
        font-size: 0.85rem; font-weight: 500; color: #6b7c93;
      }
      .mp-price-original {
        margin-top: 6px; font-size: 0.82rem; color: #8a9bad;
      }
      .mp-price-original s { color: #c0392b; }
      .mp-price-save {
        display: inline-block; background: #e8f5e9; color: #27ae60;
        padding: 1px 8px; border-radius: 10px;
        font-weight: 700; font-size: 0.7rem; margin-right: 4px;
      }
      .mp-price-period {
        font-size: 0.78rem; color: #6b7c93; margin-top: 4px;
      }
      .mp-price-features {
        list-style: none; padding: 12px 0; margin: 0 0 16px;
        border-top: 1px dashed #e1e8ed;
        border-bottom: 1px dashed #e1e8ed;
        text-align: right;
      }
      .mp-price-features li {
        font-size: 0.8rem; color: #4a5568;
        padding: 5px 0; line-height: 1.6;
      }
      .mp-price-btn {
        display: block; width: 100%;
        padding: 12px 16px; border-radius: 10px;
        text-align: center; text-decoration: none;
        font-weight: 700; font-size: 0.92rem;
        transition: all 0.2s; margin-bottom: 8px;
      }
      .mp-price-btn-monthly {
        background: #1e5a6e; color: #fff;
      }
      .mp-price-btn-monthly:hover {
        background: #0c3846; transform: translateY(-1px);
      }
      .mp-price-btn-yearly {
        background: linear-gradient(135deg, #e8971f, #f5b041);
        color: #fff;
        box-shadow: 0 3px 10px rgba(232,151,31,0.35);
      }
      .mp-price-btn-yearly:hover {
        transform: translateY(-1px);
        box-shadow: 0 5px 14px rgba(232,151,31,0.5);
      }
      .mp-price-note {
        font-size: 0.72rem; color: #8a9bad;
        line-height: 1.6; margin: 6px 0 0;
      }
      .mp-price-note a {
        color: #0c3846; font-weight: 600;
      }

      .mp-pricing-launch {
        background: #fff8e6; border: 1px solid #f5b041;
        border-radius: 10px; padding: 12px 16px;
        font-size: 0.85rem; color: #7d5806;
        text-align: center; line-height: 1.7;
      }
      .mp-pricing-launch strong { color: #e65100; }

      /* Steps */
      .mp-gate-steps-list {
        list-style: none; padding: 0; margin: 0;
      }
      .mp-gate-steps-list li {
        display: flex; gap: 12px;
        padding: 10px 0; align-items: flex-start;
      }
      .mp-step-num {
        flex-shrink: 0; width: 28px; height: 28px;
        background: linear-gradient(135deg, #0c3846, #1e5a6e);
        color: #fff; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-weight: 800; font-size: 0.85rem; margin-top: 2px;
      }
      .mp-gate-steps-list li strong {
        color: #0c3846; display: block;
        margin-bottom: 4px; font-size: 0.9rem;
      }
      .mp-gate-steps-list li p {
        margin: 0; font-size: 0.83rem;
        color: #5a6c7d; line-height: 1.75;
      }

      /* Contact */
      .mp-contact-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
        gap: 10px;
      }
      .mp-contact-card {
        display: flex; align-items: center; gap: 10px;
        padding: 12px 14px; background: #f8fafc;
        border: 1px solid #e1e8ed; border-radius: 10px;
        text-decoration: none; color: inherit;
        transition: all 0.2s; text-align: right;
      }
      .mp-contact-card:hover {
        border-color: #e8971f; background: #fffbf3;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(232,151,31,0.15);
      }
      .mp-contact-icon {
        flex-shrink: 0; width: 38px; height: 38px;
        background: linear-gradient(135deg, #0c3846, #1e5a6e);
        color: #fff; border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
        font-size: 1.2rem;
      }
      .mp-contact-info { display: flex; flex-direction: column; }
      .mp-contact-info strong {
        font-size: 0.82rem; color: #0c3846;
        font-weight: 700; margin-bottom: 2px;
      }
      .mp-contact-info span {
        font-size: 0.78rem; color: #6b7c93;
        direction: ltr; text-align: right;
      }

      /* Guarantee */
      .mp-gate-guarantee {
        display: flex; gap: 12px; align-items: flex-start;
        background: #eaf7ee; border-right: 4px solid #27ae60;
        padding: 14px 16px; border-radius: 0 10px 10px 0;
        margin-bottom: 24px;
      }
      .mp-guarantee-icon {
        font-size: 1.5rem; line-height: 1; flex-shrink: 0;
      }
      .mp-gate-guarantee strong {
        display: block; color: #1e5f30;
        font-size: 0.9rem; margin-bottom: 4px;
      }
      .mp-gate-guarantee p {
        margin: 0; font-size: 0.82rem;
        color: #2e7d32; line-height: 1.75;
      }

      /* Login form */
      .mp-gate-login-section {
        background: #f8fafc; padding: 20px !important;
        border-radius: 12px; border: 2px solid #e1e8ed !important;
        margin-bottom: 0 !important;
      }
      .mp-gate-form label {
        display: block; font-size: 0.85rem; font-weight: 700;
        color: #0c3846; margin-bottom: 8px;
      }
      .mp-gate-form input {
        width: 100%; padding: 14px 16px;
        border: 2px solid #e1e8ed; border-radius: 10px;
        font-family: inherit; font-size: 1rem;
        color: #1a2332; background: #fff;
        text-align: center;
        transition: border-color 0.2s;
      }
      .mp-gate-form input:focus { outline: none; border-color: #e8971f; }
      .mp-gate-error {
        color: #c0392b; font-size: 0.82rem;
        margin: 8px 0; min-height: 20px; text-align: center;
      }
      .mp-gate-btn {
        width: 100%; padding: 14px;
        background: #0c3846; color: #fff;
        border: none; border-radius: 10px;
        font-family: inherit; font-size: 1rem;
        font-weight: 700; cursor: pointer;
        transition: background 0.2s, transform 0.1s;
        margin-top: 8px;
      }
      .mp-gate-btn:hover { background: #1e5a6e; }
      .mp-gate-btn:active { transform: scale(0.98); }

      /* Footer */
      .mp-gate-footer {
        padding: 16px 24px; background: #f8fafc;
        border-top: 1px solid #e1e8ed;
        text-align: center; font-size: 0.82rem; color: #6b7c93;
      }
      .mp-gate-footer a {
        color: #0c3846; text-decoration: none; font-weight: 600;
      }
      .mp-gate-footer a:hover { text-decoration: underline; }
      .mp-gate-footer span { margin: 0 8px; color: #cbd5e1; }

      /* Mobile */
      @media (max-width: 520px) {
        .mp-gate-overlay { padding: 8px; }
        .mp-gate-header { padding: 24px 18px; }
        .mp-gate-header h1 { font-size: 1.1rem; }
        .mp-gate-content { padding: 18px; }
        .mp-gate-icon { font-size: 2.5rem; }
        .mp-pricing-grid { grid-template-columns: 1fr; }
        .mp-price-amount { font-size: 1.6rem; }
      }

      .mp-gate-note { font-size: 0.85rem; line-height: 1.8; margin: 0 0 12px; padding: 10px 14px; border-radius: 10px; display: none; }
      .mp-gate-note.show { display: block; background: #fff3e0; color: #8a4b00; border: 1px solid #f5b041; }
      .mp-gate-form input { direction: ltr; font-size: 0.85rem; }
      .mp-pill { position: fixed; bottom: 20px; left: 20px; z-index: 999998; display: flex; align-items: center; gap: 8px;
        background: rgba(12,56,70,.92); color: #fff; border-radius: 30px; padding: 8px 8px 8px 14px; font: 700 .82rem 'Vazirmatn',Tahoma,sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,.25); backdrop-filter: blur(4px); direction: rtl; }
      .mp-pill.warn { background: rgba(176,96,0,.95); }
      .mp-pill button { background: rgba(255,255,255,.16); color: #fff; border: 0; border-radius: 20px; padding: 6px 12px; cursor: pointer; font: inherit; }
      .mp-pill button:hover { background: rgba(192,57,43,.95); }
      .mp-pill a { color: #ffd88a; text-decoration: underline; }
    `;
    document.head.appendChild(style);
  }


  // ═══════════════════════════════════════════
  // نمایش
  // ═══════════════════════════════════════════
  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  var hideEl = null;
  function hidePage() { hideEl = document.createElement('style'); hideEl.id = 'mp-gate-hide'; hideEl.textContent = 'html{visibility:hidden!important}.mp-gate-overlay{visibility:visible!important}'; (document.head || document.documentElement).appendChild(hideEl); }
  function showPage() { if (hideEl && hideEl.parentNode) hideEl.parentNode.removeChild(hideEl); hideEl = null; }

  function showLogin(reasonObj) {
    injectStyles();
    document.documentElement.style.overflow = 'hidden';
    var page = buildLoginPage();
    document.body.appendChild(page);
    var input = page.querySelector('#mp-gate-input'), form = page.querySelector('.mp-gate-form'),
        error = page.querySelector('#mp-gate-error'), note = page.querySelector('#mp-gate-note'), btn = page.querySelector('#mp-gate-submit');
    if (reasonObj && reasonObj.reason && reasonObj.reason !== 'none') { note.textContent = reasonText(reasonObj); note.className = 'mp-gate-note show'; }
    setTimeout(function () { input.focus(); }, 100);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var entered = input.value.trim();
      if (!entered) { error.textContent = 'کد را وارد کن.'; return; }
      btn.disabled = true; error.textContent = '';
      activate(entered).then(function (r) {
        btn.disabled = false;
        if (r.ok) {
          page.style.animation = 'mp-gate-fade 0.2s reverse';
          setTimeout(function () { stripUrlCode(); window.location.reload(); }, 200);
        } else {
          error.textContent = r.reason === 'locked' ? '⏱️ تلاش‌های ناموفق زیاد بود؛ ' + r.wait + ' ثانیه صبر کن.' : '❌ ' + reasonText(r);
          input.value = ''; input.focus();
          var box = page.querySelector('.mp-gate-box'); box.style.animation = 'mp-gate-shake 0.3s'; setTimeout(function () { box.style.animation = ''; }, 300);
        }
      });
    });
  }

  function addPill(info) {
    if (document.getElementById('mp-pill')) return;
    injectStyles();
    var left = info.daysLeft, warn = left <= 7;
    var d = document.createElement('div');
    d.id = 'mp-pill'; d.className = 'mp-pill' + (warn ? ' warn' : '');
    d.innerHTML = '<span>' + (warn ? '⚠️ ' : '✅ ') + 'اشتراک ' + (PLAN_FA[info.payload.p] || '') + ': ' + left.toLocaleString('fa-IR') + ' روز مانده</span>' +
      (warn ? '<a href="' + CONFIG.contact.rubikaSupport + '" target="_blank" rel="noopener">تمدید</a>' : '') +
      '<button type="button" title="خروج از حساب (پاک شدن دسترسی این مرورگر)">🚪 خروج</button>';
    d.querySelector('button').addEventListener('click', function () {
      if (confirm('خروج از حساب؟\nبعد از خروج، برای ورود مجدد باید کد را دوباره وارد کنی.')) { logout(); location.reload(); }
    });
    document.body.appendChild(d);
  }

  // ═══════════════════════════════════════════
  // رابط عمومی و راه‌اندازی
  // ═══════════════════════════════════════════
  window.MPGate = {
    version: 2,
    verify: verify, activate: activate, checkAccess: checkAccess, logout: logout, clear: clearAll,
    reasonText: reasonText, fmtDay: fmtDay, planName: function (p) { return PLAN_FA[p] || ''; },
    config: CONFIG
  };

  function init() {
    if (/[?&]reset=1/.test(location.search)) { clearAll(); try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) {} }
    if (LIB_MODE) return;
    hidePage();
    var timer = setTimeout(function () { ready(function () { showLogin({ reason: 'nocrypto' }); }); }, 8000);
    var code = urlCode();
    (code ? activate(code).then(function (r) { if (r.ok) stripUrlCode(); }) : Promise.resolve())
      .then(checkAccess)
      .then(function (r) {
        clearTimeout(timer);
        if (r.ok) { showPage(); ready(function () { addPill(r); try { window.dispatchEvent(new CustomEvent('mp:access', { detail: r })); } catch (e) {} }); }
        else ready(function () { if (!document.querySelector('.mp-gate-overlay')) showLogin(r); });
      });
    window.addEventListener('storage', function (e) { if (e.key === CONFIG.storageKey) location.reload(); });
  }
  init();
})();