// ==================== STATE ====================
let sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

// ==================== THEME ====================
function toggleTheme() {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
}

if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
}

// ==================== CHAT ====================
function showChat() {
  document.getElementById('welcome').classList.add('hidden');
  document.getElementById('chat').classList.add('active');
}

function addMsg(text, isUser) {
  const chat = document.getElementById('chat');
  const msg = document.createElement('div');
  msg.className = `msg ${isUser ? 'user' : 'bot'}`;
  
  msg.innerHTML = `
    <div class="msg-avatar">${isUser ? '👤' : '🧠'}</div>
    <div class="msg-bubble">${text.replace(/\n/g, '<br>')}</div>
  `;
  
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

function showTyping() {
  document.getElementById('typing').classList.add('active');
  document.getElementById('chat').scrollTop = document.getElementById('chat').scrollHeight;
}

function hideTyping() {
  document.getElementById('typing').classList.remove('active');
}

async function send() {
  const input = document.getElementById('input');
  const text = input.value.trim();
  
  if (!text) return;
  
  showChat();
  addMsg(text, true);
  input.value = '';
  input.style.height = 'auto';
  
  showTyping();
  
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, sessionId })
    });
    
    const data = await res.json();
    hideTyping();
    
    if (data.success) {
      addMsg(data.response, false);
      
      if (data.crisisDetected) {
        setTimeout(() => showModal(), 1000);
      }
    } else {
      addMsg('Sorry, I had trouble processing that. Try again?', false);
    }
  } catch (err) {
    hideTyping();
    addMsg('Connection error. Please check your internet.', false);
  }
}

function sendQuick(text) {
  document.getElementById('input').value = text;
  send();
}

// Auto-resize textarea
document.getElementById('input').addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 120) + 'px';
});

// Send on Enter
document.getElementById('input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});

// ==================== MODAL ====================
function showModal() {
  document.getElementById('modal').classList.add('active');
}

function closeModal() {
  document.getElementById('modal').classList.remove('active');
}
