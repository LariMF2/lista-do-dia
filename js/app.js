// Chaves do localStorage
const STORAGE_KEYS = {
    USER: 'lista_do_dia_user',
    SESSION: 'lista_do_dia_session'
};

// Elementos da Interface
const authWrapper = document.getElementById('auth-wrapper');
const appWrapper = document.getElementById('app-wrapper');
const authHeading = document.getElementById('auth-heading');
const authSubheading = document.getElementById('auth-subheading');
const authAlert = document.getElementById('auth-alert');
const authAlertIcon = document.getElementById('auth-alert-icon');
const authAlertText = document.getElementById('auth-alert-text');

const formLogin = document.getElementById('form-login');
const formRegister = document.getElementById('form-register');
const formRecover = document.getElementById('form-recover');
const registerPrompt = document.getElementById('register-prompt');

// Função para encriptar texto com SHA-256 (nunca guarda passwords em texto simples)
async function hashText(text) {
    const normalized = text.trim().toLowerCase();
    const encoder = new TextEncoder();
    const data = encoder.encode(normalized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Para a palavra-passe não normalizamos maiúsculas/minúsculas
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function showAlert(message, type = 'danger') {
    authAlert.classList.remove('d-none', 'alert-danger', 'alert-success');
    authAlert.classList.add('d-flex', type === 'success' ? 'alert-success' : 'alert-danger');
    authAlertIcon.textContent = type === 'success' ? 'check_circle' : 'error';
    authAlertText.textContent = message;
}

function hideAlert() {
    authAlert.classList.add('d-none');
    authAlert.classList.remove('d-flex');
}

// Alternar entre ecrãs de Login, Registo e Recuperação
function switchAuthView(view) {
    hideAlert();
    formLogin.classList.add('d-none');
    formRegister.classList.add('d-none');
    formRecover.classList.add('d-none');

    const existingUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));
    // Se já existe conta única, esconde o botão de criar nova conta
    if (existingUser) {
        registerPrompt.classList.add('d-none');
    } else {
        registerPrompt.classList.remove('d-none');
    }

    if (view === 'register') {
        authHeading.textContent = 'Criar conta pessoal';
        authSubheading.textContent = 'Configura o teu acesso local e perguntas de segurança.';
        formRegister.classList.remove('d-none');
        formRegister.classList.add('d-flex');
    } else if (view === 'recover') {
        authHeading.textContent = 'Recuperar palavra-passe';
        authSubheading.textContent = 'Valida a tua identidade localmente.';
        formRecover.classList.remove('d-none');
        formRecover.classList.add('d-flex');
    } else {
        authHeading.textContent = 'Iniciar sessão';
        authSubheading.textContent = 'A tua aplicação pessoal de tarefas para o dia a dia.';
        formLogin.classList.remove('d-none');
        formLogin.classList.add('d-flex');
    }
}

function enterApp(user) {
    authWrapper.classList.add('d-none');
    appWrapper.classList.remove('d-none');
    appWrapper.classList.add('d-flex');
    document.getElementById('header-user-greeting').textContent = `Olá, ${user.name}`;
}

function logoutApp() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    appWrapper.classList.add('d-none');
    appWrapper.classList.remove('d-flex');
    authWrapper.classList.remove('d-none');
    formLogin.reset();
    switchAuthView('login');
}

// Eventos de Navegação na Autenticação
document.getElementById('btn-go-register').addEventListener('click', () => switchAuthView('register'));
document.getElementById('btn-go-recover').addEventListener('click', () => {
    const existingUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));
    if (!existingUser) {
        showAlert('Ainda não existe nenhuma conta criada neste navegador.');
        return;
    }
    switchAuthView('recover');
});

document.querySelectorAll('.btn-back-login').forEach(btn => {
    btn.addEventListener('click', () => switchAuthView('login'));
});

// Mostrar/Ocultar Palavra-passe
document.querySelectorAll('.toggle-pass-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.target);
        const icon = btn.querySelector('.material-symbols-outlined');
        if (input.type === 'password') {
            input.type = 'text';
            icon.textContent = 'visibility_off';
        } else {
            input.type = 'password';
            icon.textContent = 'visibility';
        }
    });
});

// Submissão: Criar Conta Única
formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (localStorage.getItem(STORAGE_KEYS.USER)) {
        showAlert('Já existe uma conta registada neste navegador.');
        return;
    }

    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;
    const q1 = document.getElementById('reg-q1').value;
    const q2 = document.getElementById('reg-q2').value;

    if (password.length < 8) {
        showAlert('A palavra-passe deve ter pelo menos 8 caracteres.');
        return;
    }
    if (password !== confirm) {
        showAlert('As palavras-passe não coincidem.');
        return;
    }

    const newUser = {
        name,
        email,
        passwordHash: await hashPassword(password),
        q1Hash: await hashText(q1),
        q2Hash: await hashText(q2)
    };

    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    localStorage.setItem(STORAGE_KEYS.SESSION, 'active');
    enterApp(newUser);
});

// Submissão: Iniciar Sessão
formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const existingUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));
    if (!existingUser) {
        showAlert('Nenhuma conta encontrada. Cria primeiro a tua conta local.');
        return;
    }

    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;
    const inputHash = await hashPassword(password);

    if (email === existingUser.email && inputHash === existingUser.passwordHash) {
        localStorage.setItem(STORAGE_KEYS.SESSION, 'active');
        enterApp(existingUser);
    } else {
        showAlert('O email ou a palavra-passe estão incorretos.');
    }
});

// Submissão: Recuperar Palavra-passe
formRecover.addEventListener('submit', async (e) => {
    e.preventDefault();
    const existingUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));
    if (!existingUser) return;

    const q1 = document.getElementById('rec-q1').value;
    const q2 = document.getElementById('rec-q2').value;
    const newPass = document.getElementById('rec-new-pass').value;

    const q1Hash = await hashText(q1);
    const q2Hash = await hashText(q2);

    if (q1Hash === existingUser.q1Hash && q2Hash === existingUser.q2Hash) {
        existingUser.passwordHash = await hashPassword(newPass);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(existingUser));
        formRecover.reset();
        switchAuthView('login');
        showAlert('Palavra-passe atualizada com sucesso! Já podes entrar.', 'success');
    } else {
        showAlert('As respostas de segurança não coincidem.');
    }
});

// Terminar Sessão
document.getElementById('btn-logout').addEventListener('click', logoutApp);

// Inicialização ao abrir a página
(function init() {
    const existingUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));
    const isSessionActive = localStorage.getItem(STORAGE_KEYS.SESSION) === 'active';

    if (existingUser && isSessionActive) {
        enterApp(existingUser);
    } else if (!existingUser) {
        switchAuthView('register');
    } else {
        switchAuthView('login');
    }
})();