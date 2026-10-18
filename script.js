/* ===== داده‌ها ===== */
const files = [
  { title: 'شیوه‌نامه مشاوره',  size: '۱.۲ مگابایت', url: '#' },
  { title: 'فرم ثبت‌نام',       size: '۴۵۰ کیلوبایت', url: '#' },
  { title: 'جزوه آموزشی',       size: '۲.۸ مگابایت', url: '#' },
];

const news = [
  { title: 'اطلاعیه مهم آموزشی', date: '۱۴۰۴/۰۵/۱۰', text: 'قابل توجه مشاوران محترم، جلسه هم‌اندیشی روز یکشنبه برگزار می‌شود.' },
  { title: 'بخشنامه شماره ۱۲۳',   date: '۱۴۰۴/۰۵/۰۲', text: 'ارسال گزارش عملکرد ماهانه الزامی است.' },
  { title: 'کارگاه آموزشی',       date: '۱۴۰۴/۰۴/۲۵', text: 'کارگاه آشنایی با ابزارهای مشاوره آنلاین برگزار می‌شود.' },
];

/* ===== نمایش صفحه‌ها ===== */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.page === id);
  });

  document.getElementById('nav').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    showPage(link.dataset.page);
  });
});

document.getElementById('menuToggle').addEventListener('click', () => {
  document.getElementById('nav').classList.toggle('open');
});

/* ===== اسلایدر ===== */
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const dotsContainer = document.getElementById('dots');

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

setInterval(() => changeSlide(1), 5000);

/* ===== رندر فایل‌ها ===== */
const fileList = document.getElementById('fileList');
files.forEach(f => {
  const el = document.createElement('div');
  el.className = 'file-item';
  el.innerHTML = `
    <div class="info">
      <i class="fa-solid fa-file-pdf"></i>
      <div>
        <h4>${f.title}</h4>
        <span>${f.size}</span>
      </div>
    </div>
    <a href="${f.url}" download class="btn-download">
      <i class="fa-solid fa-download"></i> دانلود
    </a>
  `;
  fileList.appendChild(el);
});

/* ===== رندر اخبار ===== */
const newsList = document.getElementById('newsList');
news.forEach(n => {
  const el = document.createElement('div');
  el.className = 'news-item';
  el.innerHTML = `
    <h4>${n.title}</h4>
    <div class="date"><i class="fa-regular fa-calendar"></i> ${n.date}</div>
    <p>${n.text}</p>
  `;
  newsList.appendChild(el);
});

/* ===== فرم تماس ===== */
function sendMessage(e) {
  e.preventDefault();
  alert('پیام شما ارسال شد. با تشکر!');
  e.target.reset();
}

/* ===== دکمه بازگشت به بالا ===== */
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  backToTop.classList.toggle('show', window.scrollY > 300);
});