/* ================= داده‌های سایت ================= */
const downloadsData = [
  { icon: "fa-calendar-check", title: "برنامه ریزی", desc: "چطور یک برنامه‌ریزی واقع‌بینانه و قابل اجرا بنویسیم؟ اصول اولیه و فرم‌های کاربردی را دانلود کنید.", link: "#" },
  { icon: "fa-book-open-reader", title: "روش مطالعه", desc: "مطالعه با کیفیت مهم‌تر از مطالعه با کمیت است. تکنیک‌های علمی و نوین مطالعه را دریافت کنید.", link: "#" },
  { icon: "fa-file-signature", title: "درباره آزمون‌ها", desc: "شناخت فضای آزمون، استراتژی‌های تست‌زنی و نحوه مدیریت استرس در جلسه آزمون.", link: "#" }
];

const tipsData = [
  { icon: "fa-puzzle-piece", title: "معمای هر درس", desc: "هر درس منطق خاص خودش را دارد. با کشف معمای هر درس، یادگیری آن برای شما آسان و لذت‌بخش می‌شود.", link: "https://rubika.ir/mesterplanner" },
  { icon: "fa-school", title: "با مدرسه چه کنیم؟", desc: "راهکارهای عملی برای استفاده حداکثری از کلاس‌های درس، ارتباط موثر با دبیران و مدیریت تکالیف.", link: "https://rubika.ir/mesterplanner" },
  { icon: "fa-clock", title: "به وقت مطالعه", desc: "مدیریت زمان و استفاده از تکنیک‌هایی مانند پومودورو برای جلوگیری از خستگی ذهنی و افزایش بازدهی.", link: "https://rubika.ir/mesterplanner" }
];

const productsData = [
  { icon: "fa-chess-knight", title: "پلن درسی: ویژه راهبرد گزینی", desc: "آموزش انتخاب هوشمندانه منابع و استراتژی‌های برخورد با سوالات دشوار.", link: "https://rubika.ir/Alfanet2828" },
  { icon: "fa-gem", title: "پلن درسی: ویژه عادت‌های طلایی", desc: "ساخت و تثبیت عادت‌هایی که شما را به طور خودکار به سمت موفقیت هدایت می‌کنند.", link: "https://rubika.ir/Alfanet2828" },
  { icon: "fa-layer-group", title: "پلن درسی: ویژه انواع مباحث", desc: "برنامه‌ریزی اختصاصی برای مباحث حفظی، محاسباتی و تحلیلی.", link: "https://rubika.ir/Alfanet2828" },
  { icon: "fa-crown", title: "ترفندهای مطالعه: ویژه حرفه‌ای‌ها", desc: "تکنیک‌های پیشرفته برای کسانی که می‌خواهند رتبه‌های برتر را هدف بگیرند.", link: "https://rubika.ir/Alfanet2828" },
  { icon: "fa-trophy", title: "ترفندهای مطالعه: ویژه افراد موفق", desc: "بررسی روش‌های مطالعه دانش‌آموزان موفق و نحوه پیاده‌سازی آن‌ها.", link: "https://rubika.ir/Alfanet2828" },
  { icon: "fa-fire", title: "ترفندهای مطالعه: ویژه پرتلاش‌ها", desc: "چگونه تلاش زیاد را با هوشمندی ترکیب کنیم تا نتیجه چند برابر شود.", link: "https://rubika.ir/Alfanet2828" },
  { icon: "fa-brain", title: "جعبه ابزار: ویژه فرا شناختی", desc: "ابزارهایی برای شناخت فرآیندهای ذهنی خود و کنترل یادگیری.", link: "https://rubika.ir/Alfanet2828" },
  { icon: "fa-tools", title: "جعبه ابزار: ویژه ساخت یادگیری", desc: "ابزارهای عملی برای ساخت دانش پایدار و انتقال آن به حافظه بلندمدت.", link: "https://rubika.ir/Alfanet2828" }
];

/* ================= منطق سایت ================= */

// 1. رندر کارت‌ها
function renderCards(dataArray, containerId) {
  const container = document.getElementById(containerId);
  if(!container) return;
  container.innerHTML = ''; 

  dataArray.forEach(item => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <i class="fa-solid ${item.icon} item-icon"></i>
      <h3 class="item-title">${item.title}</h3>
      <p class="item-desc">${item.desc}</p>
      <a href="${item.link}" target="_blank" class="item-btn">مشاهده / دریافت <i class="fa-solid fa-arrow-left"></i></a>
    `;
    container.appendChild(card);
  });
}

renderCards(downloadsData, 'downloadsList');
renderCards(tipsData, 'tipsList');
renderCards(productsData, 'productsList');

// 2. جابه‌جایی صفحات
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.page === id);
  });

  document.getElementById('nav').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 3. کلیک روی منوها
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    showPage(link.dataset.page);
  });
});

// 4. منوی موبایل
document.getElementById('menuToggle').addEventListener('click', () => {
  document.getElementById('nav').classList.toggle('open');
});

// 5. اسلایدر
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const dotsContainer = document.getElementById('dots');

if (slides.length > 0) {
  slides.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });

  function goToSlide(i) {
    slides[currentSlide].classList.remove('active');
    dotsContainer.children[currentSlide].classList.remove('active');
    currentSlide = (i + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    dotsContainer.children[currentSlide].classList.add('active');
  }

  function changeSlide(dir) {
    goToSlide(currentSlide + dir);
  }
  
  // تغییر خودکار اسلاید
  setInterval(() => changeSlide(1), 5000);
}

// 6. دکمه بازگشت به بالا
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  if(backToTop) {
    backToTop.classList.toggle('show', window.scrollY > 300);
  }
});