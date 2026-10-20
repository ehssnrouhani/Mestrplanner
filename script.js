/* ================= داده‌های سایت ================= */

// 1. دانلودهای رایگان
const downloadsData = [
  { 
    icon: "fa-calendar-check", 
    title: "برنامه ریزی", 
    desc: "چطور یک برنامه‌ریزی واقع‌بینانه و قابل اجرا بنویسیم؟ اصول اولیه و فرم‌های کاربردی را دانلود کنید.", 
    link: "assets/files/plan.pdf" // <--- لینک فایل PDF خود را اینجا بگذارید
  },
  { 
    icon: "fa-book-open-reader", 
    title: "روش مطالعه", 
    desc: "مطالعه با کیفیت مهم‌تر از مطالعه با کمیت است. تکنیک‌های علمی و نوین مطالعه را دریافت کنید.", 
    link: "#" 
  },
  { 
    icon: "fa-file-signature", 
    title: "درباره آزمون‌ها", 
    desc: "شناخت فضای آزمون، استراتژی‌های تست‌زنی و نحوه مدیریت استرس در جلسه آزمون.", 
    link: "#" 
  }
];

// 2. نکات آموزشی (با محتوای کامل مقاله)
const tipsData = [
  { 
    icon: "fa-puzzle-piece", 
    title: "معمای هر درس", 
    desc: "هر درس منطق خاص خودش را دارد. با کشف معمای هر درس، یادگیری آن برای شما آسان و لذت‌بخش می‌شود.", 
    content: `
      <p>هر درس در مدرسه، مثل یک پازل است که قوانین خاص خودش را دارد. درس ریاضی نیازمند تفکر منطقی و حل مسئله است، در حالی که درس ادبیات نیازمند درک مفهوم و احساس است. گیر اصلی بسیاری از دانش‌آموزان این است که برای همه درس‌ها از یک روش ثابت استفاده می‌کنند.</p>
      <h3>چطور معمای هر درس را کشف کنیم؟</h3>
      <ul>
        <li>نوع سوالات آن درس را در امتحانات سال‌های گذشته بررسی کنید.</li>
        <li>از معلم خود بپرسید که مهم‌ترین و کلیدی‌ترین بخش درس چیست.</li>
        <li>با حل تست‌های متنوع، ذهن خود را با ساختار و زبان آن درس هماهنگ کنید.</li>
        <li>برای دروس تحلیلی زمان بیشتری برای فهمیدن اختصاص دهید و برای دروس حفظی از تکنیک‌های تکرار و مرور استفاده کنید.</li>
      </ul>
      <p>وقتی زبانِ هر درس را یاد بگیرید، مطالعه برای شما بسیار شیرین‌تر خواهد شد و دیگر از خواندن آن درس فرار نمی‌کنید.</p>
    `
  },
  { 
    icon: "fa-school", 
    title: "با مدرسه چه کنیم؟", 
    desc: "راهکارهای عملی برای استفاده حداکثری از کلاس‌های درس، ارتباط موثر با دبیران و مدیریت تکالیف.", 
    content: `
      <p>مدرسه فقط محل گذراندن وقت نیست، بلکه یک فرصت طلایی برای یادگیری تعاملی است. کلاس درس بهترین جا برای رفع اشکال و یادگیری عمیق است، اگر بدانید چطور از آن استفاده کنید.</p>
      <h3>نکات کلیدی برای بهره‌وری در مدرسه:</h3>
      <p>همیشه قبل از کلاس، یک مرور سریع روی درس جلسه قبل داشته باشید. این کار باعث می‌شود ذهن شما آماده دریافت اطلاعات جدید باشد. سوالات خود را در حین مطالعه یادداشت کنید و در کلاس بپرسید. فرار از سوال پرسیدن بزرگ‌ترین دشمن یادگیری است.</p>
      <p>ارتباط خوب و محترمانه با دبیر می‌تواند مسیر یادگیری شما را هموارتر کند. همچنین تکالیف مدرسه را به عنوان یک فرصت برای مرور (و نه یک دردسر) ببینید و آن‌ها را در همان روز انجام دهید.</p>
    `
  },
  { 
    icon: "fa-clock", 
    title: "به وقت مطالعه", 
    desc: "مدیریت زمان و استفاده از تکنیک‌هایی مانند پومودورو برای جلوگیری از خستگی ذهنی و افزایش بازدهی.", 
    content: `
      <p>مغز انسان برای تمرکز طولانی‌مدت (مثلاً ۳ ساعت پشت سر هم) طراحی نشده است. روش پومودورو (Pomodoro) یکی از بهترین و علمی‌ترین تکنیک‌ها برای مدیریت زمان و جلوگیری از خستگی ذهنی است.</p>
      <h3>روش پومودورو چطور کار می‌کند؟</h3>
      <p>۱. یک تایمر برای ۲۵ دقیقه تنظیم کنید و با تمرکز کامل روی یک موضوع درس بخوانید.</p>
      <p>۲. بعد از ۲۵ دقیقه، تایمر را متوقف کرده و ۵ دقیقه کامل استراحت کنید (دور از گوشی و صفحه نمایش).</p>
      <p>۳. این چرخه را ۴ بار تکرار کنید و بعد از آن یک استراحت طولانی‌تر (مثلاً ۳۰ دقیقه) داشته باشید.</p>
      <p>این روش به ذهن شما یادآوری می‌کند که قرار است زمان کوتاهی تلاش کند، بنابراین تمرکز بالاتری خواهید داشت. زمان را با کیفیت بسنجید، نه فقط با کمیت.</p>
    `
  }
];

// 3. محصولات (با محتوای کامل مقاله)
const productsData = [
  { 
    icon: "fa-chess-knight", 
    title: "پلن درسی: ویژه راهبرد گزینی", 
    desc: "آموزش انتخاب هوشمندانه منابع و استراتژی‌های برخورد با سوالات دشوار.", 
    content: `
      <p>انتخاب منابع مناسب، نیمی از مسیر موفقیت است. در این پلن، به شما یاد می‌دهیم چطور از میان انبوه کتاب‌ها و جزوات، بهترین‌ها را برای سطح خود انتخاب کنید و از سردرگمی خارج شوید.</p>
      <p>همچنین استراتژی‌های مواجهه با سوالات دشوار در آزمون‌ها (مانند تست‌زنی هوشمندانه، زمان‌بندی مناسب و مدیریت استرس در جلسه آزمون) به صورت تخصصی آموزش داده می‌شود.</p>
      <p><strong>برای تهیه این محصول، از طریق بخش "ارتباط با ما" در روبیکا پیام دهید.</strong></p>
    `
  },
  { 
    icon: "fa-gem", 
    title: "پلن درسی: ویژه عادت‌های طلایی", 
    desc: "ساخت و تثبیت عادت‌هایی که شما را به طور خودکار به سمت موفقیت هدایت می‌کنند.", 
    content: `
      <p>موفقیت یک اتفاق نیست، نتیجه عادت‌های روزانه است. در این پلن، عادت‌های مطالعاتی دانش‌آموزان موفق را بررسی و راهکارهای عملی برای نهادینه کردن آن‌ها ارائه می‌دهیم.</p>
      <p>یاد می‌گیرید چطور از تکنیک‌های علمی مانند "تغییر تدریجی رفتار" و "پاداش‌دهی به خود" استفاده کنید تا مطالعه به یک عادت خودکار و بدون دردسر تبدیل شود.</p>
      <p><strong>برای تهیه این محصول، از طریق بخش "ارتباط با ما" در روبیکا پیام دهید.</strong></p>
    `
  },
  { 
    icon: "fa-layer-group", 
    title: "پلن درسی: ویژه انواع مباحث", 
    desc: "برنامه‌ریزی اختصاصی برای مباحث حفظی، محاسباتی و تحلیلی.", 
    content: `
      <p>مباحث حفظی (مثل تاریخ) با مباحث محاسباتی (مثل ریاضی) روش مطالعه کاملاً متفاوتی دارند. نمی‌توان برای همه آن‌ها از یک استراتژی استفاده کرد.</p>
      <p>این پلن به شما می‌آموزد چطور برای هر نوع مبحث، بهترین روش مطالعه، مرور و تست‌زنی را انتخاب کنید تا زمان شما با بالاترین بازدهی سپری شود.</p>
      <p><strong>برای تهیه این محصول، از طریق بخش "ارتباط با ما" در روبیکا پیام دهید.</strong></p>
    `
  },
  { 
    icon: "fa-crown", 
    title: "ترفندهای مطالعه: ویژه حرفه‌ای‌ها", 
    desc: "تکنیک‌های پیشرفته برای کسانی که می‌خواهند رتبه‌های برتر را هدف بگیرند.", 
    content: `
      <p>این محصول شامل تکنیک‌های سطح بالا مانند یادآوری فعال (Active Recall) و مرور فاصله‌دار (Spaced Repetition) است که برای رتبه‌های برتر ضروری است.</p>
      <p>در این پلن، یاد می‌گیرید چطور از حافظه خود به بهترین شکل استفاده کنید و اطلاعات را برای مدت طولانی در ذهن نگه دارید.</p>
      <p><strong>برای تهیه این محصول، از طریق بخش "ارتباط با ما" در روبیکا پیام دهید.</strong></p>
    `
  },
  { 
    icon: "fa-trophy", 
    title: "ترفندهای مطالعه: ویژه افراد موفق", 
    desc: "بررسی روش‌های مطالعه دانش‌آموزان موفق و نحوه پیاده‌سازی آن‌ها.", 
    content: `
      <p>الگوبرداری از موفق‌ترین‌ها، میانبری برای رسیدن به موفقیت است. ما روش‌های دانش‌آموزان موفق را تحلیل کرده‌ایم تا شما هم بتوانید آن‌ها را در زندگی خود اجرا کنید.</p>
      <p>این پلن بر روی نظم، پیوستگی و باورهای ذهنی افراد موفق تمرکز دارد و به شما نشان می‌دهد موفقیت چقدر به برنامه‌ریزی و ذهنیت شما وابسته است.</p>
      <p><strong>برای تهیه این محصول، از طریق بخش "ارتباط با ما" در روبیکا پیام دهید.</strong></p>
    `
  },
  { 
    icon: "fa-fire", 
    title: "ترفندهای مطالعه: ویژه افراد پرتلاش", 
    desc: "چگونه تلاش زیاد را با هوشمندی ترکیب کنیم تا نتیجه چند برابر شود.", 
    content: `
      <p>اگر سخت تلاش می‌کنید اما نتیجه نمی‌گیرید، احتمالاً روشتان اشتباه است یا تلاش خود را جای اشتباهی خرج می‌کنید. این محصول به شما یاد می‌دهد چطور «هوشمندانه تلاش کنید».</p>
      <p>یاد می‌گیرید چطور نقاط ضعف خود را پیدا کنید و بیشترین تمرکز را روی آن‌ها بگذارید تا بازدهی تلاش شما چند برابر شود.</p>
      <p><strong>برای تهیه این محصول، از طریق بخش "ارتباط با ما" در روبیکا پیام دهید.</strong></p>
    `
  },
  { 
    icon: "fa-brain", 
    title: "جعبه ابزار: ویژه فرا شناختی", 
    desc: "ابزارهایی برای شناخت فرآیندهای ذهنی خود و کنترل یادگیری.", 
    content: `
      <p>فرا شناخت (Metacognition) یعنی «فکر کردن به نحوه تفکر». با این ابزارها یاد می‌گیرید چطور فرآیند یادگیری خود را کنترل کنید.</p>
      <p>سوالاتی مانند "من چقدر این مطلب را فهمیدم؟"، "کجا اشتباه می‌کنم؟" و "بهترین روش یادگیری برای من چیست؟" را به خود بپرسید و آگاهانه مسیر مطالعه خود را تنظیم کنید.</p>
      <p><strong>برای تهیه این محصول، از طریق بخش "ارتباط با ما" در روبیکا پیام دهید.</strong></p>
    `
  },
  { 
    icon: "fa-tools", 
    title: "جعبه ابزار: ویژه ساخت یادگیری", 
    desc: "ابزارهای عملی برای ساخت دانش پایدار و انتقال آن به حافظه بلندمدت.", 
    content: `
      <p>یادگیری زمانی اتفاق می‌افتد که اطلاعات را در ذهن خود «بسازید» (رویکرد ساخت‌شناختی). این ابزارها به شما کمک می‌کنند اطلاعات را طوری پردازش کنید که در حافظه بلندمدت شما ماندگار شوند.</p>
      <p>استفاده از نقشه‌های ذهنی، خلاصه‌نویسی هوشمند و ارتباط دادن مطالب جدید به دانسته‌های قبلی، از جمله ابزارهای این جعبه هستند.</p>
      <p><strong>برای تهیه این محصول، از طریق بخش "ارتباط با ما" در روبیکا پیام دهید.</strong></p>
    `
  }
];

/* ================= منطق سایت ================= */

let previousPage = 'home'; 

// تابع ساخت کارت‌ها
function renderCards(dataArray, containerId, pageType) {
  const container = document.getElementById(containerId);
  if(!container) return;
  container.innerHTML = ''; 

  dataArray.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    
    if (pageType === 'downloads') {
      card.innerHTML = `
        <i class="fa-solid ${item.icon} item-icon"></i>
        <h3 class="item-title">${item.title}</h3>
        <p class="item-desc">${item.desc}</p>
        <a href="${item.link}" download class="item-btn">دانلود فایل <i class="fa-solid fa-download"></i></a>
      `;
    } else {
      card.innerHTML = `
        <i class="fa-solid ${item.icon} item-icon"></i>
        <h3 class="item-title">${item.title}</h3>
        <p class="item-desc">${item.desc}</p>
        <button class="item-btn" onclick="openArticle(${index}, '${pageType}')">مشاهده توضیحات کامل <i class="fa-solid fa-arrow-left"></i></button>
      `;
    }
    container.appendChild(card);
  });
}

// رندر اولیه
renderCards(downloadsData, 'downloadsList', 'downloads');
renderCards(tipsData, 'tipsList', 'tips');
renderCards(productsData, 'productsList', 'products');

// باز کردن مقاله
function openArticle(index, type) {
  let dataList = type === 'tips' ? tipsData : productsData;
  let item = dataList[index];
  
  previousPage = type === 'tips' ? 'tips' : 'products';

  document.getElementById('articleTitle').innerText = item.title;
  document.getElementById('articleContent').innerHTML = item.content;

  showPage('article');
}

// بازگشت از مقاله
function goBack() {
  showPage(previousPage);
}

// جابجایی صفحات
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.page === id);
  });

  document.getElementById('nav').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// کلیک منوها
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    showPage(link.dataset.page);
  });
});

// منوی موبایل
document.getElementById('menuToggle').addEventListener('click', () => {
  document.getElementById('nav').classList.toggle('open');
});

// اسلایدر
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
  setInterval(() => changeSlide(1), 5000);
}

// دکمه بالا
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  if(backToTop) {
    backToTop.classList.toggle('show', window.scrollY > 300);
  }
});