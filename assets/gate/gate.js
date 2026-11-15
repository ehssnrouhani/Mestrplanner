/* ============================================================
   Masterplanner Gate — نسخه اشتراکی با دو سطح قیمت
   ماهانه → Alfanet2828
   سالانه → mesterplanner / ۰۹۱۳۷۵۸۳۰۰۸
   ============================================================ */
(function () {
  'use strict';

  const CONFIG = {
    // ═══════════════════════════════════════════
    // رمزهای معتبر — برای هر خریدار یک رمز
    // بعد از پرداخت، رمز اضافه کن
    // بعد از انقضا، رمز را حذف کن
    // ═══════════════════════════════════════════
    passwords: [
      // { code: 'MP-M-001', name: 'علی — ماهانه', type: 'monthly' },
      // { code: 'MP-Y-001', name: 'سارا — سالانه', type: 'yearly' },
    ],

    storageKey: 'mp_access_v1',
    defaultValidDays: 30,

    // ═══════════════════════════════════════════
    // طرح‌های اشتراک
    // ═══════════════════════════════════════════
    plans: {
      monthly: {
        name: 'اشتراک ماهانه',
        price: '۵۹,۰۰۰',
        period: 'ماه',
        validityDays: 30,
        link: 'https://rubika.ir/Alfanet2828',
        linkLabel: 'روبیکا: Alfanet2828',
        buttonText: 'خرید اشتراک ماهانه',
        features: [
          'دسترسی کامل به همه ابزارها',
          '۳۰ روز اعتبار',
          'تمدید آسان'
        ],
        featured: false
      },
      yearly: {
        name: 'اشتراک سالانه',
        price: '۴۹۰,۰۰۰',
        launchPrice: '۳۹۰,۰۰۰',
        period: 'سال',
        validityDays: 365,
        link: 'https://rubika.ir/mesterplanner',
        linkLabel: 'روبیکا: mesterplanner',
        phone: '09137583008',
        phoneFa: '۰۹۱۳۷۵۸۳۰۰۸',
        buttonText: 'خرید اشتراک سالانه',
        features: [
          'دسترسی کامل به همه ابزارها',
          '۳۶۵ روز اعتبار',
          'به‌روزرسانی‌های رایگان',
          'صرفه‌جویی ۳۱٪ نسبت به ماهانه'
        ],
        featured: true
      }
    },

    contact: {
      rubikaSupport: 'https://rubika.ir/Alfanet2828',
      rubikaChannel: 'https://rubika.ir/mesterplanner',
      phone: '09137583008',
      phoneFa: '۰۹۱۳۷۵۸۳۰۰۸'
    }
  };

  // ═══════════════════════════════════════════
  // بررسی دسترسی
  // ═══════════════════════════════════════════
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

  function grantAccess(passwordObj) {
    const days = (passwordObj && passwordObj.validityDays) || CONFIG.defaultValidDays;
    const expires = Date.now() + (days * 24 * 60 * 60 * 1000);
    localStorage.setItem(CONFIG.storageKey, JSON.stringify({
      code: passwordObj ? passwordObj.code : 'unknown',
      type: passwordObj ? passwordObj.type : 'unknown',
      granted: Date.now(),
      expires: expires
    }));
  }

  function checkPassword(entered) {
    if (!CONFIG.passwords || CONFIG.passwords.length === 0) return null;
    return CONFIG.passwords.find(function (p) {
      return p.code.toLowerCase() === entered.toLowerCase().trim();
    }) || null;
  }

  // ═══════════════════════════════════════════
  // ساخت صفحه ورود
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
                  <strong>رمز اختصاصی را دریافت کن</strong>
                  <p>حداکثر تا ۳۰ دقیقه (ساعت ۹ صبح تا ۱۱ شب).</p>
                </div>
              </li>
              <li>
                <span class="mp-step-num">۵</span>
                <div>
                  <strong>رمز را در کادر پایین وارد کن</strong>
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
            <h2>🔓 اگر رمز داری، اینجا وارد کن:</h2>
            <form class="mp-gate-form" autocomplete="off">
              <label for="mp-gate-input">رمز دسترسی</label>
              <input id="mp-gate-input" type="text" 
                     placeholder="مثلاً: MP-Y-001" autocomplete="off" required
                     style="letter-spacing: 0.08em;">
              <div class="mp-gate-error" id="mp-gate-error"></div>
              <button type="submit" class="mp-gate-btn">ورود به ابزارها</button>
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

  // ═══════════════════════════════════════════
  // استایل
  // ═══════════════════════════════════════════
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
    `;
    document.head.appendChild(style);
  }

  // ═══════════════════════════════════════════
  // نمایش
  // ═══════════════════════════════════════════
  function showLogin() {
    injectStyles();
    document.documentElement.style.overflow = 'hidden';

    const page = buildLoginPage();
    document.body.appendChild(page);

    const input = page.querySelector('#mp-gate-input');
    const form = page.querySelector('.mp-gate-form');
    const error = page.querySelector('#mp-gate-error');

    setTimeout(function () { input.focus(); }, 100);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const entered = input.value.trim();

      if (!entered) {
        error.textContent = 'رمز را وارد کن.';
        return;
      }

      const match = checkPassword(entered);
      if (match) {
        grantAccess(match);
        error.textContent = '';
        page.style.animation = 'mp-gate-fade 0.2s reverse';
        setTimeout(function () {
          page.remove();
          document.documentElement.style.overflow = '';
          window.location.reload();
        }, 200);
      } else {
        error.textContent = '❌ رمز نامعتبر است یا منقضی شده. برای دریافت رمز، روی دکمه‌های خرید کلیک کن.';
        input.value = '';
        input.focus();
        page.querySelector('.mp-gate-box').style.animation = 'mp-gate-shake 0.3s';
        setTimeout(function () {
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
    logout: function () {
      localStorage.removeItem(CONFIG.storageKey);
      window.location.reload();
    },
    hasAccess: hasAccess,
    info: function () {
      const raw = localStorage.getItem(CONFIG.storageKey);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return {
        code: data.code,
        type: data.type,
        expires: new Date(data.expires).toLocaleDateString('fa-IR'),
        daysLeft: Math.ceil((data.expires - Date.now()) / (1000 * 60 * 60 * 24))
      };
    }
  };

  init();
})();