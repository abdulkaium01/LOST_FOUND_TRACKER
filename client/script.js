const API_URL = 'http://localhost:3000/api/items';
const AUTH_URL = 'http://localhost:3000/api/auth';

let listings = [];
let currentUser = null;
let currentFilter = 'all';

// --- DOM Elements ---
const loginScreen = document.getElementById('login-screen');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const userTypeButtons = document.querySelectorAll('.user-type-btn');
const registerToggle = document.getElementById('register-toggle');

const userInterface = document.getElementById('user-interface');
const adminPanel = document.getElementById('admin-panel');
const switchToUserBtn = document.getElementById('switch-to-user');

const lostModal = document.getElementById('lost-modal');
const foundModal = document.getElementById('found-modal');
const lostForm = document.getElementById('lost-form');
const foundForm = document.getElementById('found-form');
const reportLostBtn = document.getElementById('report-lost-btn');
const reportFoundBtn = document.getElementById('report-found-btn');
const browseBtn = document.getElementById('browse-btn');
const searchBtn = document.getElementById('search-btn');
const logoutBtn = document.getElementById('logout-btn');

const listingsContainer = document.getElementById('listings-container');
const noListingsMessage = document.getElementById('no-listings');
const filterOptions = document.getElementById('filter-options');
const searchContainer = document.getElementById('search-container');
const searchForm = document.getElementById('search-form');

const registerScreen = document.getElementById('register-screen');
const registerForm = document.getElementById('register-form');
const loginToggle = document.getElementById('login-toggle');
const adminLoginBtn = document.getElementById('admin-login-btn');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
  checkLoginStatus();
});

// Auth & UI Toggles
if (loginForm) {
  loginForm.addEventListener('submit', handleLogin);
}

if (registerForm) {
  registerForm.addEventListener('submit', handleRegister);
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', handleLogout);
}

if (registerToggle) {
  registerToggle.addEventListener('click', () => {
    loginScreen.style.display = 'none';
    registerScreen.style.display = 'flex';
  });
}

if (loginToggle) {
  loginToggle.addEventListener('click', () => {
    registerScreen.style.display = 'none';
    loginScreen.style.display = 'flex';
  });
}

userTypeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    userTypeButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// Modals
if (reportLostBtn) {
  reportLostBtn.addEventListener('click', () => lostModal.style.display = 'flex');
}

if (reportFoundBtn) {
  reportFoundBtn.addEventListener('click', () => foundModal.style.display = 'flex');
}

document.querySelectorAll('.modal .close').forEach(closeBtn => {
  closeBtn.addEventListener('click', (e) => e.target.closest('.modal').style.display = 'none');
});

window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.style.display = 'none';
  }
});

// Item Reports
if (lostForm) {
  lostForm.addEventListener('submit', handleReportLost);
}

if (foundForm) {
  foundForm.addEventListener('submit', handleReportFound);
}

// Dashboard Navigation
if (browseBtn) {
  browseBtn.addEventListener('click', () => {
    showUserInterface();
    searchContainer.style.display = 'none';
    filterOptions.style.display = 'flex';
    fetchListings();
  });
}

if (searchBtn) {
  searchBtn.addEventListener('click', () => {
    showUserInterface();
    searchContainer.style.display = 'block';
    filterOptions.style.display = 'none';
    listingsContainer.innerHTML = '';
  });
}

if (searchForm) {
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchTerm = document.getElementById('search-input').value;
    fetchListings({ search: searchTerm });
  });
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    displayListings();
  });
});

// --- Functions ---
async function checkLoginStatus() {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const res = await fetch(`${AUTH_URL}/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        currentUser = data.data;
        showApp();
        updateUserProfile();
        fetchListings();
      } else {
        handleAuthError();
      }
    } catch (error) {
      console.error('Login check failed:', error);
      handleAuthError();
    }
  } else {
    showLogin();
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const userType = document.querySelector('.user-type-btn.active').dataset.type;

  try {
    const res = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('token', data.token);
      currentUser = data.user;
      showApp();
      updateUserProfile();
      fetchListings();
    } else {
      const error = await res.json();
      showAlert(error.message || 'Login failed.', 'danger');
    }
  } catch (error) {
    console.error('Login error:', error);
    showAlert('An error occurred. Please try again.', 'danger');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('register-confirm-password').value;

  if (password !== confirmPassword) {
    showAlert('Passwords do not match.', 'danger');
    return;
  }

  try {
    const res = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('token', data.token);
      currentUser = data.user;
      showApp();
      updateUserProfile();
      fetchListings();
    } else {
      const error = await res.json();
      showAlert(error.message || 'Registration failed.', 'danger');
    }
  } catch (error) {
    console.error('Registration error:', error);
    showAlert('An error occurred. Please try again.', 'danger');
  }
}

function handleLogout() {
  localStorage.removeItem('token');
  currentUser = null;
  showLogin();
  showAlert('You have been logged out.', 'success');
}

function handleAuthError() {
  localStorage.removeItem('token');
  currentUser = null;
  showLogin();
}

async function fetchListings(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}?${query}`);
    if (!res.ok) throw new Error('Failed to fetch listings');
    listings = await res.json();
    displayListings();
  } catch (error) {
    console.error('Error fetching listings:', error);
    listings = { data: [] };
    displayListings();
    showAlert('Failed to load items. Please try again.', 'danger');
  }
}

async function handleReportLost(e) {
  e.preventDefault();
  const token = localStorage.getItem('token');
  const formData = new FormData(lostForm);

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: document.getElementById('lost-item-name').value,
        category: document.getElementById('lost-category').value,
        description: document.getElementById('lost-description').value,
        location: document.getElementById('lost-location').value,
        date: document.getElementById('lost-date').value,
        contact: document.getElementById('lost-contact').value,
        type: 'lost'
      })
    });

    if (!res.ok) throw new Error('Failed to save listing');
    
    const savedItem = await res.json();
    listings.data.unshift(savedItem.data);
    displayListings();
    showAlert(`Your lost item "${savedItem.data.name}" has been reported successfully!`, 'success');
    lostForm.reset();
    lostModal.style.display = 'none';
  } catch (error) {
    console.error('Error saving listing:', error);
    showAlert('Failed to save the item. Please try again.', 'danger');
  }
}

async function handleReportFound(e) {
  e.preventDefault();
  const token = localStorage.getItem('token');
  const formData = new FormData(foundForm);

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        name: document.getElementById('found-item-name').value,
        category: document.getElementById('found-category').value,
        description: document.getElementById('found-description').value,
        location: document.getElementById('found-location').value,
        date: document.getElementById('found-date').value,
        contact: document.getElementById('found-contact').value,
        type: 'found'
      })
    });

    if (!res.ok) throw new Error('Failed to save listing');

    const savedItem = await res.json();
    listings.data.unshift(savedItem.data);
    displayListings();
    showAlert(`Your found item "${savedItem.data.name}" has been reported successfully!`, 'success');
    foundForm.reset();
    foundModal.style.display = 'none';
  } catch (error) {
    console.error('Error saving listing:', error);
    showAlert('Failed to save the item. Please try again.', 'danger');
  }
}

function displayListings() {
  listingsContainer.innerHTML = '';
  const filteredListings = listings.data.filter(item => {
    if (currentFilter === 'all') return true;
    return item.type === currentFilter;
  });

  if (filteredListings.length === 0) {
    noListingsMessage.style.display = 'block';
    return;
  }
  noListingsMessage.style.display = 'none';

  filteredListings.forEach(item => {
    const card = document.createElement('div');
    card.className = 'listing-card';
    card.innerHTML = `
      <div class="card-header">
        <h4>${item.name}</h4>
        <span class="status-${item.type}">${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
      </div>
      <div class="card-body">
        <p>${item.description}</p>
        <p><strong>Location:</strong> ${item.location}</p>
        <p><strong>Date:</strong> ${new Date(item.date).toLocaleDateString()}</p>
      </div>
      <div class="card-footer">
        <span>Reported by: ${item.reportedBy ? item.reportedBy.name : 'N/A'}</span>
        <span class="status-resolved">${item.status}</span>
      </div>
    `;
    listingsContainer.appendChild(card);
  });
}

function showAlert(message, type) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  document.body.prepend(alertDiv);
  setTimeout(() => alertDiv.remove(), 5000);
}

function showLogin() {
  loginScreen.style.display = 'flex';
  appContainer.style.display = 'none';
  if (registerScreen) {
    registerScreen.style.display = 'none';
  }
}

function showApp() {
  loginScreen.style.display = 'none';
  if (registerScreen) {
    registerScreen.style.display = 'none';
  }
  appContainer.style.display = 'block';
}

function updateUserProfile() {
  if (currentUser) {
    userName.textContent = currentUser.name;
    userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
    if (currentUser.role === 'admin') {
      showAdminPanel();
    } else {
      showUserInterface();
    }
  }
}

function showAdminPanel() {
  adminPanel.style.display = 'block';
  userInterface.style.display = 'none';
}

function showUserInterface() {
  userInterface.style.display = 'block';
  adminPanel.style.display = 'none';
}