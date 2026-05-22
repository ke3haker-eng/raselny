// ========== State ==========
let currentUser = null;
let currentChatId = null;
let currentChatUser = null;
let messagesSubscription = null;
let chatsSubscription = null;
let chats = [];
let isTemporaryMessage = localStorage.getItem('tempDefault') === 'true';
let deferredPrompt = null;
let currentLang = localStorage.getItem('lang') || 'ar';
let isDarkMode = localStorage.getItem('darkMode') === 'true';

// ========== Translations ==========
const translations = {
  ar: {
    appTitle: 'raselny - محادثات آمنة',
    sidebarTitle: 'المحادثات',
    newChat: 'محادثة جديدة',
    welcomeTitle: 'ابدأ محادثة جديدة',
    welcomeDesc: 'اختر جهة تواصل من القائمة أو ابدأ محادثة جديدة',
    messageInput: 'اكتب رسالة...',
    loginTitle: 'تسجيل الدخول',
    loginDesc: 'أهلاً بعودتك! سجل دخولك للمتابعة',
    signupTitle: 'إنشاء حساب جديد',
    signupDesc: 'انضم إلى المحادثات الآمنة',
    emailPlaceholder: 'البريد الإلكتروني',
    passwordPlaceholder: 'كلمة المرور',
    namePlaceholder: 'الاسم الكامل',
    loginBtn: 'تسجيل الدخول',
    signupBtn: 'إنشاء حساب',
    noAccount: 'ليس لديك حساب؟',
    haveAccount: 'لديك حساب بالفعل؟',
    createAccount: 'إنشاء حساب جديد',
    searchChat: 'البحث عن محادثة...',
    settings: 'الإعدادات',
    darkMode: 'الوضع الداكن',
    tempDefault: 'الرسائل المؤقتة افتراضيًا',
    language: 'اللغة',
    logout: 'تسجيل الخروج',
    installApp: 'ثبت التطبيق لتجربة أفضل',
    install: 'تثبيت',
    noChats: 'لا توجد محادثات بعد',
    temporary: 'مؤقتة',
    expired: 'منتهية',
    now: 'الآن',
    minutes: 'د',
    hours: 'س',
    days: 'ي',
    fileAttached: 'ملف مرفق',
    imageAttached: 'صورة',
    voiceAttached: 'تسجيل صوتي',
    videoAttached: 'فيديو',
    searchUser: 'ابحث عن مستخدم...',
    searchUserTitle: 'بدء محادثة جديدة',
    searchUserDesc: 'ابحث عن مستخدم لبدء محادثة معه',
    noUsers: 'لا يوجد مستخدمين',
    online: 'متصل',
    offline: 'غير متصل',
    featureComing: 'هذه الميزة قيد التطوير',
    messageSent: 'تم إرسال الرسالة',
  },
  en: {
    appTitle: 'raselny - Secure Chat',
    sidebarTitle: 'Chats',
    newChat: 'New Chat',
    welcomeTitle: 'Start a New Chat',
    welcomeDesc: 'Select a contact from the list or start a new conversation',
    messageInput: 'Type a message...',
    loginTitle: 'Login',
    loginDesc: 'Welcome back! Sign in to continue',
    signupTitle: 'Create Account',
    signupDesc: 'Join secure conversations',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Password',
    namePlaceholder: 'Full Name',
    loginBtn: 'Login',
    signupBtn: 'Sign Up',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    createAccount: 'Create New Account',
    searchChat: 'Search chats...',
    settings: 'Settings',
    darkMode: 'Dark Mode',
    tempDefault: 'Temporary messages by default',
    language: 'Language',
    logout: 'Logout',
    installApp: 'Install the app for a better experience',
    install: 'Install',
    noChats: 'No chats yet',
    temporary: 'Temporary',
    expired: 'Expired',
    now: 'now',
    minutes: 'm',
    hours: 'h',
    days: 'd',
    fileAttached: 'File attached',
    imageAttached: 'Image',
    voiceAttached: 'Voice recording',
    videoAttached: 'Video',
    searchUser: 'Search users...',
    searchUserTitle: 'Start New Chat',
    searchUserDesc: 'Search for a user to start chatting',
    noUsers: 'No users found',
    online: 'Online',
    offline: 'Offline',
    featureComing: 'This feature is under development',
    messageSent: 'Message sent',
  }
};

function t(key) {
  return translations[currentLang][key] || key;
}

// ========== DOM References ==========
const authModal = document.getElementById('auth-modal');
const settingsModal = document.getElementById('settings-modal');
const userSearchModal = document.getElementById('user-search-modal');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginView = document.getElementById('login-view');
const signupView = document.getElementById('signup-view');
const chatList = document.getElementById('chat-list');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messagesContainer = document.getElementById('messages');
const chatWelcome = document.getElementById('chat-welcome');
const chatContainer = document.getElementById('chat-container');
const chatTitle = document.getElementById('chat-title');
const chatHeaderAvatar = document.getElementById('chat-header-avatar');
const langToggle = document.getElementById('lang-toggle');
const menuToggle = document.getElementById('menu-toggle');
const newChatBtn = document.getElementById('new-chat-btn');
const tempToggle = document.getElementById('temp-toggle');
const fileInput = document.getElementById('file-input');
const attachmentBtn = document.getElementById('attachment-btn');
const videoCallBtn = document.getElementById('video-call-btn');
const voiceCallBtn = document.getElementById('voice-call-btn');
const installBanner = document.getElementById('install-banner');
const installBtn = document.getElementById('install-btn');
const closeBanner = document.getElementById('close-banner');
const darkModeCheckbox = document.getElementById('dark-mode');
const tempDefaultCheckbox = document.getElementById('temp-msgs');
const languageSelect = document.getElementById('language-select');
const logoutBtn = document.getElementById('logout-btn');
const toast = document.getElementById('toast');
const sidebarToggle = document.getElementById('sidebar-toggle');
const chatSearch = document.getElementById('chat-search');

// ========== Toast ==========
let toastTimeout;

function showToast(msg) {
  clearTimeout(toastTimeout);
  toast.textContent = msg;
  toast.style.display = 'block';
  toastTimeout = setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

// ========== Feature Coming Soon ==========
function featureComing() {
  showToast(t('featureComing'));
}

videoCallBtn?.addEventListener('click', featureComing);
voiceCallBtn?.addEventListener('click', featureComing);

// ========== Language ==========
function applyLanguage() {
  document.documentElement.lang = currentLang === 'ar' ? 'ar' : 'en';
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  document.title = t('appTitle');
  document.getElementById('lang-toggle').textContent = currentLang === 'ar' ? 'EN' : 'عربي';

  document.getElementById('sidebar-title').textContent = t('sidebarTitle');
  document.getElementById('new-chat-text').textContent = t('newChat');
  document.getElementById('welcome-title').textContent = t('welcomeTitle');
  document.getElementById('welcome-desc').textContent = t('welcomeDesc');
  messageInput.placeholder = t('messageInput');
  document.getElementById('chat-search').placeholder = t('searchChat');

  document.getElementById('login-title').textContent = t('loginTitle');
  document.getElementById('login-desc').textContent = t('loginDesc');
  document.getElementById('login-email').placeholder = t('emailPlaceholder');
  document.getElementById('login-password').placeholder = t('passwordPlaceholder');
  document.getElementById('login-btn').textContent = t('loginBtn');

  document.getElementById('signup-title').textContent = t('signupTitle');
  document.getElementById('signup-desc').textContent = t('signupDesc');
  document.getElementById('signup-name').placeholder = t('namePlaceholder');
  document.getElementById('signup-email').placeholder = t('emailPlaceholder');
  document.getElementById('signup-password').placeholder = t('passwordPlaceholder');
  document.getElementById('signup-btn').textContent = t('signupBtn');

  document.querySelector('#login-view .modal-footer p').innerHTML =
    `${t('noAccount')} <a href="#" id="show-signup">${t('createAccount')}</a>`;
  document.querySelector('#signup-view .modal-footer p').innerHTML =
    `${t('haveAccount')} <a href="#" id="show-login">${t('loginBtn')}</a>`;

  document.getElementById('settings-title').textContent = t('settings');
  document.getElementById('dark-mode-label').textContent = t('darkMode');
  document.getElementById('temp-default-label').textContent = t('tempDefault');
  document.getElementById('lang-label').textContent = t('language');
  document.getElementById('logout-btn').textContent = t('logout');

  document.getElementById('install-text').textContent = t('installApp');
  document.getElementById('install-btn').textContent = t('install');

  document.getElementById('search-user-title').textContent = t('searchUserTitle');
  document.getElementById('search-user-desc').textContent = t('searchUserDesc');
  document.getElementById('user-search-input').placeholder = t('searchUser');

  updateTempToggle();
}

// ========== Temp Toggle ==========
function updateTempToggle() {
  if (!tempToggle) return;
  const svg = tempToggle.querySelector('svg');
  if (svg) {
    svg.style.stroke = isTemporaryMessage ? '#ff9800' : '';
  }
  tempToggle.title = isTemporaryMessage ? t('temporary') : '';

  // Add a small indicator dot
  let dot = tempToggle.querySelector('.temp-dot');
  if (isTemporaryMessage) {
    if (!dot) {
      dot = document.createElement('span');
      dot.className = 'temp-dot';
      dot.style.cssText = 'position:absolute;top:4px;right:4px;width:6px;height:6px;border-radius:50%;background:#ff9800;';
      tempToggle.style.position = 'relative';
      tempToggle.appendChild(dot);
    }
  } else {
    dot?.remove();
  }
}

tempToggle?.addEventListener('click', () => {
  isTemporaryMessage = !isTemporaryMessage;
  updateTempToggle();
});

// ========== Auth ==========
async function checkSession() {
  const { data: { session }, error } = await window.supabase.auth.getSession();
  if (error) return console.error(error);
  if (session) {
    currentUser = session.user;
    hideAuthModal();
    await initApp();
  } else {
    showAuthModal();
  }
}

function showAuthModal() {
  authModal.style.display = 'flex';
  loginView.classList.remove('hidden');
  signupView.classList.add('hidden');
}

function hideAuthModal() {
  authModal.style.display = 'none';
}

document.addEventListener('click', (e) => {
  if (e.target.id === 'show-signup') {
    e.preventDefault();
    loginView.classList.add('hidden');
    signupView.classList.remove('hidden');
  }
  if (e.target.id === 'show-login') {
    e.preventDefault();
    signupView.classList.add('hidden');
    loginView.classList.remove('hidden');
  }
  if (e.target.closest('.close') && e.target.closest('.close').closest('#auth-modal')) {
    if (currentUser) hideAuthModal();
  }
  if (e.target.closest('.close-settings') || e.target === settingsModal) {
    settingsModal.style.display = 'none';
  }
  if (e.target.closest('#close-user-search') || e.target === userSearchModal) {
    userSearchModal.style.display = 'none';
  }
  if (e.target === authModal) hideAuthModal();
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  try {
    const data = await window.signIn(email, password);
    currentUser = data.user;
    hideAuthModal();
    await initApp();
  } catch (err) {
    showToast(err.message || 'فشل تسجيل الدخول');
  }
});

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  try {
    await window.signUp(email, password, name);
    showToast('تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني');
    loginView.classList.remove('hidden');
    signupView.classList.add('hidden');
  } catch (err) {
    showToast(err.message || 'فشل إنشاء الحساب');
  }
});

// ========== App Init ==========
async function initApp() {
  isTemporaryMessage = localStorage.getItem('tempDefault') === 'true';
  tempDefaultCheckbox.checked = isTemporaryMessage;
  await loadChats();
  applyLanguage();
  applyTheme();
  registerServiceWorker();
  setupRealtimeSubscriptions();
}

// ========== Chats ==========
async function loadChats() {
  try {
    chats = await window.getUserChats(currentUser.id);
    renderChatList();
  } catch (err) {
    console.error('Failed to load chats:', err);
  }
}

function renderChatList(filter) {
  chatList.innerHTML = '';
  let filtered = chats;
  if (filter) {
    const q = filter.toLowerCase();
    filtered = chats.filter(c => {
      const other = c.user1_id === currentUser.id ? c.user2 : c.user1;
      return other && (other.name || '').toLowerCase().includes(q) || (other.email || '').toLowerCase().includes(q);
    });
  }
  if (!filtered.length) {
    chatList.innerHTML = `<div class="chat-item" style="justify-content:center;color:var(--text-light);padding:2rem;font-size:0.9rem;">${t('noChats')}</div>`;
    return;
  }
  filtered.forEach(chat => {
    const other = chat.user1_id === currentUser.id ? chat.user2 : chat.user1;
    if (!other) return;
    const item = document.createElement('div');
    item.className = 'chat-item' + (chat.id === currentChatId ? ' active' : '');
    item.dataset.chatId = chat.id;
    item.dataset.userId = other.id;
    item.dataset.userName = other.name || other.email;
    item.innerHTML = `
      <div class="chat-item-avatar">${(other.name || other.email)[0].toUpperCase()}</div>
      <div class="chat-item-info">
        <div class="chat-item-name">${escapeHtml(other.name || other.email)}</div>
        <div class="chat-item-preview">${escapeHtml(other.email)}</div>
      </div>
    `;
    item.addEventListener('click', () => {
      selectChat(chat.id, other);
      if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('open');
    });
    chatList.appendChild(item);
  });
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

chatSearch?.addEventListener('input', (e) => {
  renderChatList(e.target.value.trim());
});

// ========== Chat Selection ==========
async function selectChat(chatId, otherUser) {
  currentChatId = chatId;
  currentChatUser = otherUser;
  document.querySelectorAll('.chat-item').forEach(el => el.classList.remove('active'));
  const item = document.querySelector(`.chat-item[data-chat-id="${chatId}"]`);
  if (item) item.classList.add('active');
  chatWelcome.classList.add('hidden');
  chatContainer.classList.remove('hidden');
  chatTitle.textContent = otherUser.name || otherUser.email;
  chatHeaderAvatar.textContent = (otherUser.name || otherUser.email)[0].toUpperCase();
  await loadMessages();
  setupMessageSubscription();
}

async function loadMessages() {
  try {
    const msgs = await window.getMessages(currentChatId);
    renderMessages(msgs);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  } catch (err) {
    console.error('Failed to load messages:', err);
  }
}

function setupMessageSubscription() {
  if (messagesSubscription) window.supabase.removeChannel(messagesSubscription);
  messagesSubscription = window.subscribeToMessages(currentChatId, async (newMsg) => {
    const { data: user } = await window.supabase.from('users').select('id, name').eq('id', newMsg.user_id).single();
    newMsg.user = user || { id: newMsg.user_id, name: 'Unknown' };
    if (newMsg.is_temporary && newMsg.expires_at && new Date(newMsg.expires_at) <= new Date()) return;
    appendMessage(newMsg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  });
}

function renderMessages(msgs) {
  messagesContainer.innerHTML = '';
  msgs.forEach(msg => {
    if (msg.is_temporary && msg.expires_at && new Date(msg.expires_at) <= new Date()) return;
    appendMessage(msg);
  });
}

function appendMessage(msg) {
  const sent = msg.user_id === currentUser.id;
  const div = document.createElement('div');
  div.className = `message ${sent ? 'sent' : 'received'}`;

  let contentHtml = '';
  const displayContent = msg.content;

  switch (msg.type) {
    case 'image':
      contentHtml = `<img src="${displayContent}" alt="${t('imageAttached')}" class="message-image" loading="lazy">`;
      break;
    case 'video':
      contentHtml = `<video src="${displayContent}" controls class="message-video"></video>`;
      break;
    case 'audio':
      contentHtml = `<audio src="${displayContent}" controls class="message-audio"></audio>`;
      break;
    case 'file':
      contentHtml = `<a href="${displayContent}" target="_blank" class="message-file">${t('fileAttached')}</a>`;
      break;
    default:
      contentHtml = escapeHtml(displayContent);
  }

  const time = formatTime(msg.created_at);
  let statusHtml = '';
  if (msg.is_temporary) {
    statusHtml = `<span class="message-status">
      <svg viewBox="0 0 24 24" fill="none" stroke="#ff9800" stroke-width="2" stroke-linecap="round" style="width:12px;height:12px;vertical-align:middle;">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg> ${t('temporary')}
    </span>`;
  }

  div.innerHTML = `
    <div class="message-content">${contentHtml}</div>
    <div class="message-meta">
      <span class="message-time">${time}</span>
      ${statusHtml}
    </div>`;
  messagesContainer.appendChild(div);
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return t('now');
  if (diff < 3600000) return Math.floor(diff / 60000) + t('minutes');
  if (diff < 86400000) return Math.floor(diff / 3600000) + t('hours');
  return Math.floor(diff / 86400000) + t('days');
}

// ========== Real-time ==========
function setupRealtimeSubscriptions() {
  if (chatsSubscription) window.supabase.removeChannel(chatsSubscription);
  chatsSubscription = window.subscribeToUserChats(currentUser.id, () => loadChats());
}

// ========== Send Message ==========
messageForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentChatId || !currentUser) return;
  const content = messageInput.value.trim();
  if (!content) return;
  let expiresAt = null;
  if (isTemporaryMessage) expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  try {
    await window.sendMessage(currentChatId, currentUser.id, content, 'text', isTemporaryMessage, expiresAt);
    messageInput.value = '';
    messageInput.style.height = 'auto';
  } catch (err) {
    showToast('فشل الإرسال');
  }
});

messageInput?.addEventListener('input', () => {
  messageInput.style.height = 'auto';
  messageInput.style.height = messageInput.scrollHeight + 'px';
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) messageForm?.dispatchEvent(new Event('submit'));
});

// ========== New Chat / User Search ==========
newChatBtn?.addEventListener('click', async () => {
  await openUserSearch();
});

async function openUserSearch() {
  userSearchModal.style.display = 'flex';
  const input = document.getElementById('user-search-input');
  const results = document.getElementById('user-search-results');
  input.value = '';
  results.innerHTML = '';

  // Load all users
  try {
    const users = await window.getAllUsers();
    const others = users.filter(u => u.id !== currentUser.id);
    renderUserResults(others);
  } catch (err) {
    showToast('فشل تحميل المستخدمين');
  }

  input.oninput = async (e) => {
    const q = e.target.value.trim();
    if (!q) {
      try {
        const users = await window.getAllUsers();
        renderUserResults(users.filter(u => u.id !== currentUser.id));
      } catch (_) {}
      return;
    }
    try {
      const users = await window.searchUsers(q);
      renderUserResults(users.filter(u => u.id !== currentUser.id));
    } catch (_) {}
  };
}

function renderUserResults(users) {
  const results = document.getElementById('user-search-results');
  results.innerHTML = '';
  if (!users.length) {
    results.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--text-light);">${t('noUsers')}</div>`;
    return;
  }
  users.forEach(u => {
    const div = document.createElement('div');
    div.className = 'user-search-item';
    div.innerHTML = `
      <div class="user-search-avatar">${(u.name || u.email)[0].toUpperCase()}</div>
      <div class="user-search-info">
        <h4>${escapeHtml(u.name || u.email)}</h4>
        <span>${escapeHtml(u.email)}</span>
      </div>
    `;
    div.addEventListener('click', async () => {
      userSearchModal.style.display = 'none';
      try {
        const chat = await window.getOrCreateChat(currentUser.id, u.id);
        await loadChats();
        selectChat(chat.id, u);
      } catch (err) {
        showToast('فشل بدء المحادثة');
      }
    });
    results.appendChild(div);
  });
}

// ========== File Attachment ==========
attachmentBtn?.addEventListener('click', () => fileInput?.click());

fileInput?.addEventListener('change', async (e) => {
  const files = e.target.files;
  if (!files.length || !currentChatId) return;
  for (const file of files) {
    try {
      const path = `${currentUser.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await window.supabase.storage.from('chat-media').upload(path, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = window.supabase.storage.from('chat-media').getPublicUrl(path);
      let type = 'file';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('video/')) type = 'video';
      else if (file.type.startsWith('audio/')) type = 'audio';
      let expiresAt = null;
      if (isTemporaryMessage) expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await window.sendMessage(currentChatId, currentUser.id, publicUrl, type, isTemporaryMessage, expiresAt);
      showToast(t('messageSent'));
    } catch (err) {
      showToast('فشل رفع الملف');
    }
  }
  fileInput.value = '';
});

// ========== Sidebar Toggle (Mobile) ==========
sidebarToggle?.addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// ========== Language Toggle ==========
langToggle?.addEventListener('click', () => {
  currentLang = currentLang === 'ar' ? 'en' : 'ar';
  localStorage.setItem('lang', currentLang);
  applyLanguage();
});

// ========== Settings ==========
menuToggle?.addEventListener('click', () => {
  settingsModal.style.display = 'flex';
  darkModeCheckbox.checked = isDarkMode;
  tempDefaultCheckbox.checked = localStorage.getItem('tempDefault') === 'true';
  languageSelect.value = currentLang;
});

darkModeCheckbox?.addEventListener('change', () => {
  isDarkMode = darkModeCheckbox.checked;
  localStorage.setItem('darkMode', isDarkMode);
  applyTheme();
});

tempDefaultCheckbox?.addEventListener('change', () => {
  localStorage.setItem('tempDefault', tempDefaultCheckbox.checked);
  isTemporaryMessage = tempDefaultCheckbox.checked;
  updateTempToggle();
});

languageSelect?.addEventListener('change', () => {
  currentLang = languageSelect.value;
  localStorage.setItem('lang', currentLang);
  applyLanguage();
});

logoutBtn?.addEventListener('click', async () => {
  await window.signOut();
  currentUser = null;
  currentChatId = null;
  currentChatUser = null;
  chats = [];
  chatList.innerHTML = '';
  messagesContainer.innerHTML = '';
  chatContainer.classList.add('hidden');
  chatWelcome.classList.remove('hidden');
  if (messagesSubscription) { window.supabase.removeChannel(messagesSubscription); messagesSubscription = null; }
  if (chatsSubscription) { window.supabase.removeChannel(chatsSubscription); chatsSubscription = null; }
  settingsModal.style.display = 'none';
  showAuthModal();
});

// ========== Theme ==========
function applyTheme() {
  document.body.classList.toggle('dark-mode', isDarkMode);
}

// ========== PWA Install ==========
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBanner.style.display = 'block';
});

installBtn?.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') installBanner.style.display = 'none';
    deferredPrompt = null;
  }
});

closeBanner?.addEventListener('click', () => { installBanner.style.display = 'none'; });

window.addEventListener('appinstalled', () => { installBanner.style.display = 'none'; });

// ========== Service Worker ==========
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  }
}

// ========== Init ==========
document.addEventListener('DOMContentLoaded', () => {
  applyLanguage();
  applyTheme();
  checkSession();
});