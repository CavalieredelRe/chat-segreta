// Connessione Socket.IO (assicurati che socket.io.js sia caricato in index.html)
const socket = io();

// Utenti validi con password (esempio hardcoded)
const USERS = { 'cavaliere': 'SasaMaty', 'princesse': 'MatySasa' };
let currentUser = null;

// Elementi DOM
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

// Chiave semplice per XOR encrypt/decrypt
const SECRET_KEY = 123;

// Funzione XOR encrypt/decrypt (stessa funzione per entrambe)
function encrypt(text) {
  return Array.from(text)
    .map(c => String.fromCharCode(c.charCodeAt(0) ^ SECRET_KEY))
    .join('');
}
function decrypt(text) {
  return encrypt(text);
}

// Aggiunge un messaggio al div messaggi (con scroll automatico)
function addMessage(user, msg) {
  const p = document.createElement('p');
  p.innerHTML = `<strong>${user}:</strong> ${msg}`;
  messagesDiv.appendChild(p);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Gestione login
loginForm.addEventListener('submit', e => {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  // Controlli utente e password
  if (!USERS[username]) {
    loginError.textContent = 'Utente non trovato';
    return;
  }
  if (USERS[username] !== password) {
    loginError.textContent = 'Password errata';
    return;
  }

  // Login riuscito
  currentUser = username;
  loginError.textContent = '';
  loginSection.style.display = 'none';
  chatSection.style.display = 'flex';

  addMessage('Sistema', `Benvenuto ${currentUser}!`);
  msgInput.focus();

  // Notifica server che utente si è connesso
  socket.emit('userConnected', currentUser);
});

// Invio messaggio criptato
function sendMessage() {
  const rawMsg = msgInput.value.trim();
  if (!rawMsg) return;

  const encrypted = encrypt(rawMsg);
  socket.emit('chatMessage', { user: currentUser, message: encrypted });
  addMessage(currentUser, rawMsg);

  msgInput.value = '';
  msgInput.focus();
}

// Eventi invio messaggio
sendBtn.addEventListener('click', sendMessage);
msgInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') sendMessage();
});

// Ricezione messaggi da server
socket.on('chatMessage', data => {
  // Mostra solo messaggi di altri utenti
  if (data.user !== currentUser) {
    const decrypted = decrypt(data.message);
    addMessage(data.user, decrypted);
  }
});

// Logout
logoutBtn.addEventListener('click', () => {
  if (currentUser) {
    socket.emit('userDisconnected', currentUser);
  }
  currentUser = null;
  messagesDiv.innerHTML = '';
  chatSection.style.display = 'none';
  loginSection.style.display = 'block';

  // Pulizia campi input
  usernameInput.value = '';
  passwordInput.value = '';
  loginError.textContent = '';
  usernameInput.focus();
});

