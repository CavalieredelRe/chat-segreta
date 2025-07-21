const socket = io();

const USERS = { 'cavaliere': 'SasaMaty', 'princesse': 'MatySasa' };
let currentUser = null;

const loginSection = document.getElementById('login');
const chatSection = document.getElementById('chat');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

const messagesDiv = document.getElementById('messages');
const msgInput = document.getElementById('msg-input');
const sendBtn = document.getElementById('send-btn');
const logoutBtn = document.getElementById('logout-btn');

// 👤 Elemento "sta scrivendo"
const typingIndicator = document.createElement('p');
typingIndicator.style.fontStyle = 'italic';
typingIndicator.style.color = '#555';
typingIndicator.textContent = '';
messagesDiv.appendChild(typingIndicator);

const SECRET_KEY = 123;

function encrypt(text) {
  return Array.from(text).map(c => String.fromCharCode(c.charCodeAt(0) ^ SECRET_KEY)).join('');
}
function decrypt(text) {
  return encrypt(text);
}

function addMessage(user, msg) {
  const p = document.createElement('p');
  p.innerHTML = `<strong>${user}:</strong> ${msg}`;
  messagesDiv.insertBefore(p, typingIndicator);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// 🔔 Richiesta permesso notifiche desktop
if ('Notification' in window && Notification.permission !== 'granted') {
  Notification.requestPermission().then(permission => {
    console.log('🔔 Notifiche desktop:', permission);
  });
}

function showNotification(title, body) {
  if (document.visibilityState === 'visible') return;
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: 'icon-192.png' // assicurati che esista in /public
    });
  }
}

// ➕ Login
loginForm.addEventListener('submit', e => {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!USERS[username]) {
    loginError.textContent = 'Utente non trovato';
    return;
  }
  if (USERS[username] !== password) {
    loginError.textContent = 'Password errata';
    return;
  }

  currentUser = username;
  loginError.textContent = '';
  loginSection.style.display = 'none';
  chatSection.style.display = 'flex';
  addMessage('Sistema', `Benvenuto ${currentUser}!`);
  msgInput.focus();

  socket.emit('userConnected', currentUser);
});

// ➤ Invia messaggio
function sendMessage() {
  const rawMsg = msgInput.value.trim();
  if (!rawMsg) return;

  const encrypted = encrypt(rawMsg);
  socket.emit('chatMessage', { user: currentUser, message: encrypted });
  addMessage(currentUser, rawMsg);

  msgInput.value = '';
  msgInput.focus();

  socket.emit('typing', false);
}

// ➤ Eventi invio
sendBtn.addEventListener('click', sendMessage);
msgInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    sendMessage();
  } else {
    socket.emit('typing', true);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => socket.emit('typing', false), 1000);
  }
});

// ⏳ Timeout per "sta scrivendo"
let typingTimeout;

// ⬅️ Ricezione messaggi
socket.on('chatMessage', data => {
  if (data.user !== currentUser) {
    const decrypted = decrypt(data.message);
    addMessage(data.user, decrypted);
    showNotification(`💬 Messaggio da ${data.user}`, decrypted);
  }
});

// ✍️ Indicatore "sta scrivendo"
socket.on('typing', ({ user, isTyping }) => {
  if (user !== currentUser) {
    typingIndicator.textContent = isTyping ? `${user} sta scrivendo...` : '';
  }
});

// ➖ Logout
logoutBtn.addEventListener('click', () => {
  if (currentUser) {
    socket.emit('userDisconnected', currentUser);
  }
  currentUser = null;
  messagesDiv.innerHTML = '';
  messagesDiv.appendChild(typingIndicator);
  chatSection.style.display = 'none';
  loginSection.style.display = 'block';
  usernameInput.value = '';
  passwordInput.value = '';
  loginError.textContent = '';
  usernameInput.focus();
});
