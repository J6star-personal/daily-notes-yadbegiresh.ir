import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

// In-memory data store for the AI Studio preview environment
interface TodoItem {
  id: string;
  text: string;
  createdAt: string;
}

const dbItems: TodoItem[] = [
  {
    id: "1718300000000",
    text: "بررسی کدهای کلودفلر ورکر و بازطراحی ظاهر آن با استفاده از فریم‌ورک تیلویند سی‌اس‌اس و فونت فارسی وزیرمتن.",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
  },
  {
    id: "1718290000000",
    text: "خرید نان سنگک تازه و پنیر تبریزی برای صبحانه فردا.",
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString() // 18 hours ago
  },
  {
    id: "1718280000000",
    text: "ارسال گزارش هفتگی فعالیت‌های پروژه و برنامه‌ریزی دمو برای کارفرما.",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString() // 2 days ago
  }
];

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API MOCKS matching Cloudflare Worker endpoints ---
  app.post("/api/add", (req, res) => {
    const text = (req.body.text || "").trim();
    if (!text) {
      return res.status(400).json({ error: "text required" });
    }
    if (text.length > 2000) {
      return res.status(400).json({ error: "max 2000 chars" });
    }

    const id = Date.now().toString();
    dbItems.push({
      id,
      text,
      createdAt: new Date().toISOString()
    });

    res.json({ success: true });
  });

  app.get("/api/list", (req, res) => {
    const sorted = [...dbItems].sort((a, b) => Number(b.id) - Number(a.id));
    res.json(sorted);
  });

  app.post("/api/login", (req, res) => {
    if (req.body.password === ADMIN_PASSWORD) {
      return res.json({ success: true });
    }
    res.status(401).json({ success: false });
  });

  app.post("/api/delete", (req, res) => {
    if (req.body.password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "unauthorized" });
    }
    const id = req.body.id;
    const index = dbItems.findIndex(item => item.id === id);
    if (index !== -1) {
      dbItems.splice(index, 1);
    }
    res.json({ success: true });
  });

  // --- Cloudflare Worker HTML Responses Redesigned ---
  app.get("/", (req, res) => {
    res.send(homeHtml());
  });

  app.get("/timeline", (req, res) => {
    res.send(timelineHtml());
  });

  // Vite middleware for development assets serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

function homeHtml() {
  return `<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ثبت کار جدید</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        fontFamily: {
          sans: ['Vazirmatn', 'tahoma', 'sans-serif'],
        }
      }
    }
  }
</script>
<style>
  body {
    font-family: 'Vazirmatn', 'tahoma', sans-serif;
  }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: #4338ca; }
</style>
</head>

<body class="bg-slate-950 text-slate-200 min-h-screen flex flex-col justify-between antialiased">

<header class="h-20 border-b border-slate-800 flex items-center justify-between px-6 md:px-8 bg-slate-900/50 backdrop-blur-md">
  <div class="flex items-center gap-4">
    <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
      </svg>
    </div>
    <div>
      <h1 class="text-base md:text-xl font-bold text-white tracking-tight">یادداشت کار جدید</h1>
      <p class="text-[10px] md:text-xs text-slate-400">تسک‌ها و یادداشت‌های روزانه خود را ثبت کنید</p>
    </div>
  </div>
  
  <div class="flex items-center gap-3">
    <a href="/timeline" class="inline-flex items-center gap-1.5 px-4 py-2 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600 hover:text-white text-xs md:text-sm transition-all rounded-xl font-semibold shadow-lg shadow-indigo-600/5 active:scale-95 duration-200">
      <span>تایملاین کارها</span>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </a>
  </div>
</header>

<main class="w-full max-w-xl mx-auto px-4 py-8 md:py-16 grow flex flex-col justify-center">

  <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col gap-5">
    
    <div>
      <h2 class="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">ثبت کار روزانه جدید</h2>
      <textarea id="txt" class="w-full h-56 bg-slate-950 border border-slate-800 rounded-xl p-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none text-right leading-relaxed" placeholder="چه کاری می‌خواهید انجام دهید؟ در اینجا تایپ کنید..."></textarea>
    </div>

    <div class="flex justify-between items-center pt-2">
      <div class="text-xs text-slate-500 font-mono">
        تعداد حروف: 
        <span id="counter" class="font-bold text-indigo-400 bg-indigo-950 border border-indigo-900/60 px-2 py-0.5 rounded-md inline-block min-w-[20px] text-center">0</span>
        <span class="text-slate-600">/</span>
        <span>۲۰۰۰</span>
      </div>

      <button onclick="save()" class="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 duration-200 cursor-pointer inline-flex items-center gap-2">
        <span>ثبت نهایی</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </button>
    </div>

  </div>

</main>

<footer class="h-14 border-t border-slate-800 px-6 flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-widest bg-slate-900/80">
  <div>© ۲۰۲۶ - سیستم ثبت و مدیریت یادداشت</div>
  <div class="flex gap-4">
    <span>Powered by Cloudflare Workers</span>
  </div>
</footer>

<script>
const txt = document.getElementById('txt');

txt.addEventListener('input', () => {
  document.getElementById('counter').innerText = txt.value.length;
});

const showToast = (message, type = 'success') => {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed bottom-6 left-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.dir = 'rtl';
  toast.className = \`p-4 rounded-xl shadow-2xl flex items-center gap-3 border transition-all duration-300 transform translate-y-10 opacity-0 pointer-events-auto \${
    type === 'success' 
      ? 'bg-slate-900 border-slate-800 text-slate-100' 
      : 'bg-rose-950 border-rose-900 text-rose-200 shadow-rose-950/20'
  }\`;
  
  const icon = type === 'success' 
    ? \`<div class="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg></div>\`
    : \`<div class="w-5 h-5 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 shrink-0"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg></div>\`;

  toast.innerHTML = \`
    \${icon}
    <p class="font-bold text-sm">\${message}</p>
  \`;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.remove('translate-y-10', 'opacity-0');
  }, 10);
  
  setTimeout(() => {
    toast.classList.add('translate-y-10', 'opacity-0');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
};

window.alert = function(msg) {
  const isErr = msg.includes('وارد نشده') || msg.includes('خطا') || msg.includes('unauthorized') || msg.includes('رمز اشتباه') || msg.includes('text required');
  showToast(msg, isErr ? 'error' : 'success');
};

async function save() {
  const text = txt.value.trim();

  if (!text) {
    alert('متن یادداشت وارد نشده است');
    return;
  }

  const res = await fetch('/api/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text })
  });

  if (res.ok) {
    txt.value = '';
    document.getElementById('counter').innerText = '0';
    alert('یادداشت شما با موفقیت ثبت شد');
  } else {
    const data = await res.json().catch(() => ({}));
    alert(data.error || 'خطایی در ثبت اطلاعات رخ داد');
  }
}
</script>

</body>
</html>`;
}

function timelineHtml() {
  return `<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>تایملاین یادداشت‌ها</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        fontFamily: {
          sans: ['Vazirmatn', 'tahoma', 'sans-serif'],
        }
      }
    }
  }
</script>
<style>
  body {
    font-family: 'Vazirmatn', 'tahoma', sans-serif;
  }
  .delete {
    display: none !important;
  }
  .admin .delete {
    display: inline-flex !important;
  }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: #4338ca; }
</style>
</head>

<body class="bg-slate-950 text-slate-200 min-h-screen flex flex-col justify-between antialiased">

<header class="h-20 border-b border-slate-800 flex items-center justify-between px-6 md:px-8 bg-slate-900/50 backdrop-blur-md">
  <div class="flex items-center gap-4">
    <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <div>
      <h1 class="text-base md:text-xl font-bold text-white tracking-tight">تایملاین یادداشت‌ها</h1>
      <p class="text-[10px] md:text-xs text-slate-400">تایملاین و سوابق کارهای ثبت شده روزانه</p>
    </div>
  </div>
  
  <div class="flex items-center gap-3">
    <a href="/" class="inline-flex items-center gap-1.5 px-4 py-2 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600 hover:text-white text-xs md:text-sm transition-all rounded-xl font-semibold shadow-lg shadow-indigo-600/5 active:scale-95 duration-200">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      <span>افزودن یادداشت</span>
    </a>
  </div>
</header>

<main class="w-full max-w-2xl mx-auto px-4 py-8 md:py-12 grow flex flex-col">

  <div class="bg-indigo-900/10 border border-indigo-500/20 rounded-2xl p-6 shadow-xl mb-8 flex flex-col gap-4">
    
    <div class="flex items-center gap-3 text-indigo-400">
      <svg class="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
      <h3 class="text-sm font-bold uppercase tracking-widest">کنترل پنل مدیریت</h3>
    </div>

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      
      <div id="admin-login-box" class="flex items-center gap-2.5 w-full">
        <input 
          type="password" 
          id="password" 
          placeholder="رمز عبور مدیریت" 
          class="w-full sm:w-48 px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 rounded-xl transition-all duration-200 placeholder-slate-600">
        
        <button onclick="login()" class="px-5 py-2 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600 hover:text-white font-bold text-sm rounded-xl transition-all duration-200 active:scale-95 cursor-pointer shrink-0">
          ورود مدیریت
        </button>
      </div>

      <div id="admin-logged-box" class="hidden items-center justify-between sm:justify-start gap-4 w-full bg-emerald-950/40 border border-emerald-500/20 rounded-xl px-4 py-2.5 flex-wrap">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="text-xs font-bold text-emerald-400">پنل مدیریت فعال است</span>
        </div>
        <button onclick="logout()" class="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/30 text-rose-200 hover:text-rose-100 font-bold text-xs rounded-lg transition-all duration-200 cursor-pointer">
          خروج از مدیریت
        </button>
      </div>

    </div>

  </div>

  <div class="relative mb-6">
    <div class="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <input 
      class="search w-full pr-12 pl-4 py-4 bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 text-white rounded-2xl shadow-xl outline-none transition-all duration-300 text-base placeholder-slate-600 font-medium" 
      id="search" 
      placeholder="جستجو در تسک‌ها و یادداشت‌ها...">
  </div>

  <div class="flex justify-between items-center px-1 mb-4">
    <div class="flex items-center gap-2 text-sm text-slate-400 font-medium">
      <span>تعداد کل تسک‌ها:</span>
      <span id="count" class="font-extrabold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-xl border border-indigo-500/20 inline-block font-mono">0</span>
    </div>
  </div>

  <div id="items" class="flex flex-col gap-4"></div>

</main>

<footer class="h-14 border-t border-slate-800 px-6 flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-widest bg-slate-900/80 mt-12">
  <div>© ۲۰۲۶ - سیستم ثبت و مدیریت یادداشت</div>
  <div class="flex gap-4">
    <span>Powered by Cloudflare Workers</span>
  </div>
</footer>

<script>
let items = [];
let admin = false;

const adminPanelSync = () => {
  const loginBox = document.getElementById('admin-login-box');
  const loggedBox = document.getElementById('admin-logged-box');
  
  if (admin) {
    document.body.classList.add('admin');
    loginBox.classList.add('hidden');
    loggedBox.classList.remove('hidden');
    loggedBox.classList.add('flex');
  } else {
    document.body.classList.remove('admin');
    loginBox.classList.remove('hidden');
    loggedBox.classList.add('hidden');
    loggedBox.classList.remove('flex');
    const pwdInput = document.getElementById('password');
    if (pwdInput) pwdInput.value = '';
  }
};

if (sessionStorage.getItem('admin') === '1') {
  admin = true;
  adminPanelSync();
}

const showToast = (message, type = 'success') => {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed bottom-6 left-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.dir = 'rtl';
  toast.className = \`p-4 rounded-xl shadow-2xl flex items-center gap-3 border transition-all duration-300 transform translate-y-10 opacity-0 pointer-events-auto \${
    type === 'success' 
      ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-slate-950/40' 
      : 'bg-rose-950 border-rose-900 text-rose-200'
  }\`;
  
  const icon = type === 'success' 
    ? \`<div class="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg></div>\`
    : \`<div class="w-5 h-5 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 shrink-0"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg></div>\`;

  toast.innerHTML = \`
    \${icon}
    <p class="font-bold text-sm">\${message}</p>
  \`;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.remove('translate-y-10', 'opacity-0');
  }, 10);
  
  setTimeout(() => {
    toast.classList.add('translate-y-10', 'opacity-0');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
};

window.alert = function(msg) {
  const isErr = msg.includes('وارد نشده') || msg.includes('خطا') || msg.includes('unauthorized') || msg.includes('رمز اشتباه') || msg.includes('text required');
  showToast(msg, isErr ? 'error' : 'success');
};

async function login() {
  const password = document.getElementById('password').value;

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ password })
  });

  if (res.ok) {
    admin = true;
    sessionStorage.setItem('admin', '1');
    adminPanelSync();
    render();
    alert('ورود با موفقیت انجام شد');
  } else {
    alert('رمز عبور وارد شده اشتباه است');
  }
}

function logout() {
  admin = false;
  sessionStorage.removeItem('admin');
  adminPanelSync();
  render();
  alert('با موفقیت خارج شدید');
}

async function load() {
  const res = await fetch('/api/list');
  items = await res.json();
  render();
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function relativeTime(date) {
  const diff = Math.floor((new Date() - new Date(date)) / 1000);

  if (diff < 60) return 'همین الان';
  if (diff < 3600) return Math.floor(diff / 60) + ' دقیقه پیش';
  if (diff < 86400) return Math.floor(diff / 3600) + ' ساعت پیش';
  return Math.floor(diff / 86400) + ' روز پیش';
}

async function removeItem(id) {
  if (!admin) return;

  if (!confirm('آیا مایل به حذف این یادداشت هستید؟'))
    return;

  const password = document.getElementById('password').value || 'admin';

  const res = await fetch('/api/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id,
      password: sessionStorage.getItem('admin') === '1' ? password : ''
    })
  });

  if (res.ok) {
    alert('تسک با موفقیت حذف شد');
    load();
  } else {
    alert('خطا در حذف تسک رخ داد');
  }
}

function render() {
  const search = document.getElementById('search').value.toLowerCase();

  const filtered = items.filter(x =>
    x.text.toLowerCase().includes(search)
  );

  document.getElementById('count').innerText = filtered.length;

  const root = document.getElementById('items');
  root.innerHTML = '';

  if (filtered.length === 0) {
    root.innerHTML = \`
      <div class="flex flex-col items-center justify-center py-16 bg-slate-900 border border-slate-800 rounded-2xl shadow-inner px-4 text-center">
        <div class="w-16 h-16 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 mb-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h4 class="font-extrabold text-slate-350 text-base mb-1">هیچ یادداشتی یافت نشد</h4>
        <p class="text-xs text-slate-500 max-w-sm leading-relaxed">یادداشتی با معیار جستجوی شما مطابقت ندارد یا هنوز هیچ کار جدیدی ثبت نکرده‌اید.</p>
      </div>
    \`;
    return;
  }

  for (const item of filtered) {
    root.innerHTML += \`
      <div class="group bg-slate-900 border border-slate-800 p-5 rounded-2xl relative shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex flex-col gap-4">
        
        <div class="flex justify-between items-start gap-4">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-indigo-505/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <b class="text-xs font-bold text-slate-200 block">
                \${new Date(item.createdAt).toLocaleString('fa-IR')}
              </b>
              <span class="text-[10px] text-slate-500 block mt-0.5 font-medium">
                \${relativeTime(item.createdAt)}
              </span>
            </div>
          </div>

          <button 
            onclick="removeItem('\${item.id}')"
            class="delete flex md:opacity-0 group-hover:opacity-100 px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 hover:border-rose-700 text-rose-300 rounded-lg text-xs font-bold items-center gap-1 cursor-pointer transition-all duration-300 active:scale-95">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>حذف</span>
          </button>
        </div>

        <div class="h-px bg-slate-800/80 w-full mb-1"></div>

        <div class="text-slate-300 text-sm md:text-base leading-relaxed font-normal whitespace-pre-wrap">
          \${escapeHtml(item.text)}
        </div>

      </div>
    \`;
  }
}

document.getElementById('search').addEventListener('input', render);

load();
</script>

</body>
</html>`;
}

startServer();
