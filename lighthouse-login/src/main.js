import './styles/main.css';

const form = document.querySelector('#loginForm');
const titleEl = document.querySelector('.auth-title');
const loginInput = document.querySelector('#login');
const passwordInput = document.querySelector('#password');
const togglePasswordBtn = document.querySelector('#togglePassword');
const rememberMeCheckbox = document.querySelector('#rememberMe');
const forgotLink = document.querySelector('#forgotLink');
const googleBtn = document.querySelector('#googleSignIn');
const signUpBtn = document.querySelector('#signUpBtn');
const messageEl = document.querySelector('#formMessage');

const submitBtn = form.querySelector('button[type="submit"]');
const signupHintEl = document.querySelector('.signup-hint');

const USERS_KEY = 'lighthouse_users_db';
const REMEMBER_KEY = 'lighthouse_remembered_login';

let mode = 'signin'; // 'signin' | 'signup' | 'forgot'

function getUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function setMessage(text, isOk = false) {
  messageEl.textContent = text;
  messageEl.classList.toggle('form-message--ok', isOk);
}

// Подставляем запомненный логин при загрузке
const rememberedLogin = localStorage.getItem(REMEMBER_KEY);
if (rememberedLogin) {
  loginInput.value = rememberedLogin;
  rememberMeCheckbox.checked = true;
}

function bindHintLinks() {
  const signUpLink = document.querySelector('#signUpLink');
  const signInLink = document.querySelector('#signInLink');

  if (signUpLink) {
    signUpLink.addEventListener('click', (e) => {
      e.preventDefault();
      setMode('signup');
    });
  }

  if (signInLink) {
    signInLink.addEventListener('click', (e) => {
      e.preventDefault();
      setMode('signin');
    });
  }
}

function setMode(nextMode) {
  mode = nextMode;
  setMessage('');
  passwordInput.value = '';

  const passwordField = passwordInput.closest('.field');
  const metaRow = document.querySelector('.form-meta');

  if (mode === 'signin') {
    titleEl.textContent = 'Nice to see you again';
    submitBtn.textContent = 'Sign in';
    passwordField.style.display = '';
    metaRow.style.display = '';
    googleBtn.style.display = '';
    signUpBtn.style.display = '';
    signupHintEl.innerHTML =
      'Dont have an account? <a href="#signup" id="signUpLink" class="link">Sign up now</a>';
  } else if (mode === 'signup') {
    titleEl.textContent = 'Create an account';
    submitBtn.textContent = 'Sign up';
    passwordField.style.display = '';
    metaRow.style.display = 'none';
    googleBtn.style.display = 'none';
    signUpBtn.style.display = 'none';
    signupHintEl.innerHTML =
      'Already have an account? <a href="#signin" id="signInLink" class="link">Sign in</a>';
  } else if (mode === 'forgot') {
    titleEl.textContent = 'Reset password';
    submitBtn.textContent = 'Send code';
    passwordField.style.display = 'none';
    metaRow.style.display = 'none';
    googleBtn.style.display = 'none';
    signUpBtn.style.display = 'none';
    signupHintEl.innerHTML =
      'Back to <a href="#signin" id="signInLink" class="link">Sign in</a>';
  }

  bindHintLinks();
}

bindHintLinks();

// Показ / скрытие пароля
togglePasswordBtn.addEventListener('click', () => {
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  togglePasswordBtn.setAttribute('aria-pressed', String(isPassword));
});

// Кнопка Sign up открывает режим регистрации
signUpBtn.addEventListener('click', () => {
  setMode('signup');
});

// Ссылка Forgot password? открывает восстановление пароля
forgotLink.addEventListener('click', (e) => {
  e.preventDefault();
  setMode('forgot');
});

// Кнопка входа через Google
googleBtn.addEventListener('click', () => {
  setMessage('Google login clicked (demo).', true);
});

// Отправка формы
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const login = loginInput.value.trim();
  const password = passwordInput.value;
  const users = getUsers();

  if (!login) {
    setMessage('Enter email or phone number.', false);
    loginInput.focus();
    return;
  }

  if (mode === 'forgot') {
    const exists = users.some((u) => u.login === login);
    if (!exists) {
      setMessage('Account with this login does not exist.', false);
      return;
    }
    setMessage(`Reset instructions sent to ${login}.`, true);
    return;
  }

  if (!password) {
    setMessage('Enter password.', false);
    passwordInput.focus();
    return;
  }

  if (mode === 'signup') {
    const alreadyExists = users.some((u) => u.login === login);
    if (alreadyExists) {
      setMessage('This account already exists. Try signing in.', false);
      return;
    }

    users.push({ login, password });
    saveUsers(users);
    setMessage(`Account "${login}" registered! Now you can sign in.`, true);
    return;
  }

  // Режим входа (signin)
  const foundUser = users.find((u) => u.login === login);
  if (!foundUser) {
    setMessage('Account does not exist. Please sign up first.', false);
    return;
  }

  if (foundUser.password !== password) {
    setMessage('Incorrect password.', false);
    passwordInput.focus();
    return;
  }

  if (rememberMeCheckbox.checked) {
    localStorage.setItem(REMEMBER_KEY, login);
  } else {
    localStorage.removeItem(REMEMBER_KEY);
  }

  setMessage(`Welcome back, ${login}!`, true);
});