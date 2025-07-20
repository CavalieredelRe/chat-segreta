
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
  messagesDiv.appendChild(p);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

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

function sendMessage() {
  const rawMsg = msgInput.value.trim();
  if (!rawMsg) return;
  const encrypted = encrypt(rawMsg);
  socket.emit('chatMessage', { user: currentUser, message: encrypted });
  addMessage(currentUser, rawMsg);
  msgInput.value = '';
}

sendBtn.addEventListener('click', sendMessage);
msgInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') sendMessage();
});

socket.on('chatMessage', data => {
  if (data.user !== currentUser) {
    const decrypted = decrypt(data.message);
    addMessage(data.user, decrypted);
  }
});

logoutBtn.addEventListener('click', () => {
  currentUser = null;
  messagesDiv.innerHTML = '';
  chatSection.style.display = 'none';
  loginSection.style.display = 'block';
  socket.emit('userDisconnected');
});
