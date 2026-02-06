// Liste des 20 pilotes F1 (Saison 2024)
const F1_DRIVERS = [
  { id: 1, name: 'Sunny', number: 1, team: 'NS Mansory' },
  { id: 2, name: 'NRT', number: 81, team: 'NS Mansory' },
  { id: 3, name: 'Carlos Sainz', number: 55, team: 'Ferrari' },
  { id: 4, name: 'Charles Leclerc', number: 16, team: 'Ferrari' },
  { id: 5, name: 'Lewis Hamilton', number: 44, team: 'Mercedes' },
  { id: 6, name: 'George Russell', number: 63, team: 'Mercedes' },
  { id: 7, name: 'Fernando Alonso', number: 14, team: 'Aston Martin' },
  { id: 8, name: 'Lance Stroll', number: 18, team: 'Aston Martin' },
  { id: 9, name: 'Nico Hulkenberg', number: 27, team: 'Haas' },
  { id: 10, name: 'Kevin Magnussen', number: 20, team: 'Haas' },
  { id: 11, name: 'Yuki Tsunoda', number: 22, team: 'AlphaTauri' },
  { id: 12, name: 'Daniel Ricciardo', number: 3, team: 'AlphaTauri' },
  { id: 13, name: 'Pierre Gasly', number: 10, team: 'Alpine' },
  { id: 14, name: 'Esteban Ocon', number: 31, team: 'Alpine' },
  { id: 15, name: 'Oscar Piastri', number: 81, team: 'McLaren' },
  { id: 16, name: 'Sergio Pérez', number: 11, team: 'Red Bull' },
  { id: 17, name: 'Zhou Guanyu', number: 24, team: 'Alfa Romeo' },
  { id: 18, name: 'Valtteri Bottas', number: 77, team: 'Alfa Romeo' },
  { id: 19, name: 'Logan Sargeant', number: 2, team: 'Williams' },
  { id: 20, name: 'Alexander Albon', number: 23, team: 'Williams' }
];

let currentAction = null;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupEventListeners();
  loadAlertHistory();
  checkOBSStatus();
  
  // Vérifier le statut OBS toutes les 5 secondes
  setInterval(checkOBSStatus, 5000);
});

function checkAuth() {
  fetch('/api/auth/check')
    .then(res => res.json())
    .then(data => {
      if (!data.authenticated) {
        window.location.href = '/';
      } else {
        document.getElementById('username').textContent = data.username;
      }
    });
}

function setupEventListeners() {
  // Boutons d'action
  document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectAction(btn.dataset.action);
    });
  });

  // Bouton déconnexion
  document.getElementById('btn-logout').addEventListener('click', logout);
}

function selectAction(action) {
  currentAction = action;
  
  // Mettre à jour l'UI
  document.querySelectorAll('.action-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-action="${action}"]`).classList.add('active');

  // Afficher les pilotes
  showDriverSelection();
}

function showDriverSelection() {
  const section = document.getElementById('driver-section');
  const buttonContainer = document.getElementById('driver-buttons');
  
  buttonContainer.innerHTML = '';
  
  F1_DRIVERS.forEach(driver => {
    const btn = document.createElement('button');
    btn.className = 'driver-btn';
    btn.innerHTML = `
      <div class="driver-number">${driver.number}</div>
      <div class="driver-name">${driver.name}</div>
      <div class="driver-team">${driver.team}</div>
    `;
    btn.addEventListener('click', () => sendAlert(driver));
    buttonContainer.appendChild(btn);
  });

  section.style.display = 'block';
  section.scrollIntoView({ behavior: 'smooth' });
}

async function sendAlert(driver) {
  if (!currentAction) return;

  try {
    const response = await fetch('/api/alerts/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: currentAction,
        driver: driver.name
      })
    });

    const data = await response.json();

    if (response.ok) {
      // Afficher un message de succès
      showNotification(`Alerte envoyée pour ${driver.name}!`, 'success');
      
      // Réinitialiser
      currentAction = null;
      document.getElementById('driver-section').style.display = 'none';
      document.querySelectorAll('.action-btn').forEach(btn => {
        btn.classList.remove('active');
      });

      // Recharger l'historique
      loadAlertHistory();
    } else {
      showNotification('Erreur lors de l\'envoi de l\'alerte', 'error');
    }
  } catch (error) {
    console.error('Erreur:', error);
    showNotification('Erreur serveur', 'error');
  }
}

function loadAlertHistory() {
  fetch('/api/alerts/history')
    .then(res => res.json())
    .then(data => {
      const historyDiv = document.getElementById('alerts-history');
      
      if (!data.alerts || data.alerts.length === 0) {
        historyDiv.innerHTML = '<p class="empty-state">Aucune alerte envoyée</p>';
        return;
      }

      historyDiv.innerHTML = data.alerts.map(alert => `
        <div class="history-item">
          <span class="history-driver">${alert.driver}</span>
          <span class="history-action">${alert.action}</span>
          <span class="history-time">${new Date(alert.timestamp).toLocaleTimeString('fr-FR')}</span>
        </div>
      `).join('');
    })
    .catch(err => console.error('Erreur:', err));
}

function checkOBSStatus() {
  fetch('/api/alerts/obs-status')
    .then(res => res.json())
    .then(data => {
      const indicator = document.getElementById('obs-indicator');
      const text = document.getElementById('obs-text');
      
      if (data.connected) {
        indicator.className = 'indicator connected';
        text.textContent = '✅ OBS: Connecté';
      } else {
        indicator.className = 'indicator disconnected';
        text.textContent = '⚠️ OBS: Déconnecté';
      }
    })
    .catch(err => console.error('Erreur OBS:', err));
}

function logout() {
  fetch('/api/auth/logout', { method: 'POST' })
    .then(() => {
      window.location.href = '/';
    });
}

function showNotification(message, type) {
  // Simple notification (vous pouvez améliorer ça)
  alert(message);
}
