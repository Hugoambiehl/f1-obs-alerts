document.getElementById('btn-login').addEventListener('click', login);
document.getElementById('btn-register').addEventListener('click', register);
document.getElementById('password').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') login();
});

// Mot de passe oublié
document.getElementById('link-forgot').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('forgot-modal').style.display = 'flex';
  document.getElementById('forgot-step-1').style.display = 'block';
  document.getElementById('forgot-step-2').style.display = 'none';
  document.getElementById('forgot-username').value = '';
  document.getElementById('forgot-password').value = '';
  document.getElementById('forgot-password-confirm').value = '';
  document.getElementById('forgot-message').textContent = '';
});

document.getElementById('btn-close-forgot').addEventListener('click', () => {
  document.getElementById('forgot-modal').style.display = 'none';
});

// Fermer la modale au clic en dehors
document.getElementById('forgot-modal').addEventListener('click', (e) => {
  if (e.target.id === 'forgot-modal') {
    document.getElementById('forgot-modal').style.display = 'none';
  }
});

document.getElementById('btn-reset-request').addEventListener('click', requestReset);
document.getElementById('btn-reset-confirm').addEventListener('click', confirmReset);

let resetUsername = null;

function requestReset() {
  const username = document.getElementById('forgot-username').value;

  if (!username) {
    showForgotMessage('Veuillez entrer votre pseudo', 'error');
    return;
  }

  // Vérifier que l'utilisateur existe
  fetch('/api/auth/check-username', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  })
    .then(res => res.json())
    .then(data => {
      if (data.exists) {
        resetUsername = username;
        document.getElementById('forgot-step-1').style.display = 'none';
        document.getElementById('forgot-step-2').style.display = 'block';
        showForgotMessage('Entrez votre nouveau mot de passe', 'success');
      } else {
        showForgotMessage('Pseudo non trouvé', 'error');
      }
    })
    .catch(err => {
      showForgotMessage('Erreur serveur', 'error');
      console.error(err);
    });
}

function confirmReset() {
  const password = document.getElementById('forgot-password').value;
  const passwordConfirm = document.getElementById('forgot-password-confirm').value;

  if (!password || !passwordConfirm) {
    showForgotMessage('Veuillez remplir tous les champs', 'error');
    return;
  }

  if (password !== passwordConfirm) {
    showForgotMessage('Les mots de passe ne correspondent pas', 'error');
    return;
  }

  if (password.length < 6) {
    showForgotMessage('Le mot de passe doit contenir au moins 6 caractères', 'error');
    return;
  }

  fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: resetUsername, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showForgotMessage('Mot de passe réinitialisé ! Redirection...', 'success');
        setTimeout(() => {
          document.getElementById('forgot-modal').style.display = 'none';
          document.getElementById('username').value = resetUsername;
          document.getElementById('password').value = password;
        }, 1500);
      } else {
        showForgotMessage(data.error || 'Erreur lors de la réinitialisation', 'error');
      }
    })
    .catch(err => {
      showForgotMessage('Erreur serveur', 'error');
      console.error(err);
    });
}

function showForgotMessage(text, type) {
  const messageDiv = document.getElementById('forgot-message');
  messageDiv.textContent = text;
  messageDiv.className = 'message ' + type;
}

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
