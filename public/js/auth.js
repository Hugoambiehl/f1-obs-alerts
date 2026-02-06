document.getElementById('btn-login').addEventListener('click', login);
document.getElementById('btn-register').addEventListener('click', register);
document.getElementById('password').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') login();
});

function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (!username || !password) {
    showMessage('Veuillez remplir tous les champs', 'error');
    return;
  }

  fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        window.location.href = '/dashboard';
      } else {
        showMessage(data.error || 'Erreur de connexion', 'error');
      }
    })
    .catch(err => {
      showMessage('Erreur serveur', 'error');
      console.error(err);
    });
}

function register() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (!username || !password) {
    showMessage('Veuillez remplir tous les champs', 'error');
    return;
  }

  if (password.length < 6) {
    showMessage('Le mot de passe doit contenir au moins 6 caractères', 'error');
    return;
  }

  fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showMessage('Inscription réussie! Redirection...', 'success');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        showMessage(data.error || 'Erreur lors de l\'inscription', 'error');
      }
    })
    .catch(err => {
      showMessage('Erreur serveur', 'error');
      console.error(err);
    });
}

function showMessage(text, type) {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = text;
  messageDiv.className = 'message ' + type;
  
  setTimeout(() => {
    messageDiv.className = 'message';
    messageDiv.textContent = '';
  }, 3000);
}
