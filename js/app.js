// Chaves do localStorage
const STORAGE_KEYS = {
    USER: 'lista_do_dia_user',
    SESSION: 'lista_do_dia_session',
    TASKS: 'lista_do_dia_tasks'
};

// Estado da Aplicação
let tasks = [];
let currentFilter = 'all';
let taskIdToDelete = null;

// Modais Bootstrap
let taskModalInstance = null;
let deleteModalInstance = null;

// ==========================================
// 1. UTILITÁRIOS DE SEGURANÇA E DATA
// ==========================================
async function hashText(text) {
    const normalized = text.trim().toLowerCase();
    const data = new TextEncoder().encode(normalized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password) {
    const data = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function getTodayISO() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now - offset).toISOString().split('T')[0];
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

function loadTasks() {
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
    tasks = saved ? JSON.parse(saved) : [];
}

// ==========================================
// 2. AUTENTICAÇÃO LOCAL (FASE 1)
// ==========================================
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

function switchAuthView(view) {
    hideAlert();
    formLogin.classList.add('d-none');
    formRegister.classList.add('d-none');
    formRecover.classList.add('d-none');

    const existingUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));
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
    loadTasks();
    renderTodayView();
}

function logoutApp() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    appWrapper.classList.add('d-none');
    appWrapper.classList.remove('d-flex');
    authWrapper.classList.remove('d-none');
    formLogin.reset();
    switchAuthView('login');
}

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

document.getElementById('btn-logout').addEventListener('click', logoutApp);

// ==========================================
// 3. VISTA HOJE E GESTÃO DE TAREFAS (FASE 2)
// ==========================================
function openTaskModal(taskToEdit = null) {
    const modalTitle = document.getElementById('taskModalLabel');
    const saveBtn = document.getElementById('btn-save-task');
    const editIdInput = document.getElementById('task-edit-id');

    if (taskToEdit) {
        modalTitle.textContent = 'Editar tarefa';
        saveBtn.textContent = 'Guardar alterações';
        editIdInput.value = taskToEdit.id;
        document.getElementById('task-title').value = taskToEdit.title;
        document.getElementById('task-note').value = taskToEdit.note || '';
        document.getElementById('task-date').value = taskToEdit.date;
        document.getElementById('task-time').value = taskToEdit.time || '';
        document.getElementById('task-project').value = taskToEdit.project || 'Pessoal';
        document.getElementById('task-priority').value = taskToEdit.priority || 'normal';
    } else {
        modalTitle.textContent = 'Nova tarefa';
        saveBtn.textContent = 'Criar tarefa';
        editIdInput.value = '';
        document.getElementById('form-task').reset();
        document.getElementById('task-date').value = getTodayISO();
    }

    taskModalInstance.show();
}

function toggleTaskStatus(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    saveTasks();
    renderTodayView();
}

function requestDeleteTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    taskIdToDelete = id;
    document.getElementById('delete-task-name').textContent = `Tens a certeza que pretendes eliminar "${task.title}"? Esta ação não pode ser desfeita.`;
    deleteModalInstance.show();
}

document.getElementById('btn-confirm-delete').addEventListener('click', () => {
    if (taskIdToDelete) {
        tasks = tasks.filter(t => t.id !== taskIdToDelete);
        saveTasks();
        renderTodayView();
        taskIdToDelete = null;
    }
    deleteModalInstance.hide();
});

document.getElementById('form-task').addEventListener('submit', (e) => {
    e.preventDefault();
    const editId = document.getElementById('task-edit-id').value;
    const title = document.getElementById('task-title').value.trim();
    const note = document.getElementById('task-note').value.trim();
    const date = document.getElementById('task-date').value || getTodayISO();
    const time = document.getElementById('task-time').value;
    const project = document.getElementById('task-project').value;
    const priority = document.getElementById('task-priority').value;

    if (!title) return;

    if (editId) {
        const index = tasks.findIndex(t => t.id === editId);
        if (index !== -1) {
            tasks[index] = { ...tasks[index], title, note, date, time, project, priority };
        }
    } else {
        tasks.unshift({
            id: Date.now().toString(),
            title,
            note,
            date,
            time,
            project,
            priority,
            completed: false
        });
    }

    saveTasks();
    renderTodayView();
    taskModalInstance.hide();
});

function createTaskCardElement(task) {
    const card = document.createElement('div');
    card.className = `task-card d-flex align-items-start gap-3 ${task.completed ? 'completed' : ''}`;

    const timeTag = task.time
        ? `<span class="task-tag tag-time">Hoje • ${task.time}</span>`
        : '';
    const urgentTag = task.priority === 'high'
        ? `<span class="task-tag tag-urgent">Urgente</span>`
        : '';
    const projectTag = `<span class="task-tag tag-project">${task.project}</span>`;

    card.innerHTML = `
        <button type="button" class="task-check-btn" aria-label="Alternar estado da tarefa">
            <span class="material-symbols-outlined fs-6">check</span>
        </button>
        <div class="flex-grow-1 min-w-0">
            <div class="d-flex align-items-center gap-2 flex-wrap mb-1">
                <span class="fw-semibold text-white ${task.completed ? 'text-decoration-line-through opacity-75' : ''}">${task.title}</span>
                ${urgentTag}
                ${timeTag}
                ${projectTag}
            </div>
            ${task.note ? `<p class="smaller text-secondary-custom mb-0">${task.note}</p>` : ''}
        </div>
        <div class="dropdown">
            <button class="btn btn-link text-secondary-custom p-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <span class="material-symbols-outlined fs-5">more_vert</span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end dropdown-menu-dark dropdown-menu-dark-custom shadow">
                <li>
                    <button type="button" class="dropdown-item small d-flex align-items-center gap-2 btn-edit-item">
                        <span class="material-symbols-outlined fs-6 text-sage">edit</span> Editar
                    </button>
                </li>
                <li>
                    <button type="button" class="dropdown-item small d-flex align-items-center gap-2 text-rose btn-delete-item">
                        <span class="material-symbols-outlined fs-6">delete</span> Eliminar
                    </button>
                </li>
            </ul>
        </div>
    `;

    card.querySelector('.task-check-btn').addEventListener('click', () => toggleTaskStatus(task.id));
    card.querySelector('.btn-edit-item').addEventListener('click', () => openTaskModal(task));
    card.querySelector('.btn-delete-item').addEventListener('click', () => requestDeleteTask(task.id));

    return card;
}

function renderTodayView() {
    const todayISO = getTodayISO();
    const todayTasks = tasks.filter(t => t.date === todayISO);

    const pendingTasks = todayTasks.filter(t => !t.completed);
    const completedTasks = todayTasks.filter(t => t.completed);

    // Atualizar contadores e progresso
    const total = todayTasks.length;
    const pct = total > 0 ? Math.round((completedTasks.length / total) * 100) : 0;

    document.getElementById('today-pending-badge').innerHTML = `
        <span class="dot-pulse"></span> ${pendingTasks.length} ${pendingTasks.length === 1 ? 'tarefa por concluir' : 'tarefas por concluir'}
    `;
    document.getElementById('count-all').textContent = total;
    document.getElementById('count-pending').textContent = pendingTasks.length;
    document.getElementById('count-completed').textContent = completedTasks.length;

    document.getElementById('progress-percent-text').textContent = `${pct}%`;
    const offset = 94.2 - (94.2 * pct) / 100;
    document.getElementById('progress-ring-circle').style.strokeDashoffset = offset;

    const focusTitle = document.getElementById('focus-title');
    const focusSubtitle = document.getElementById('focus-subtitle');
    if (total === 0) {
        focusTitle.textContent = 'Pronta para começar!';
        focusSubtitle.textContent = 'Adiciona tarefas para organizares o teu dia.';
    } else if (pct === 100) {
        focusTitle.textContent = 'Objetivo concluído!';
        focusSubtitle.textContent = `Completaste todas as ${total} tarefas planeadas para hoje.`;
    } else {
        focusTitle.textContent = 'Mantém o ritmo!';
        focusSubtitle.textContent = `Completaste ${completedTasks.length} de ${total} tarefas planeadas para hoje.`;
    }

    // Mostrar Estado Vazio ou Lista
    const emptyState = document.getElementById('today-empty-state');
    const tasksWrapper = document.getElementById('today-tasks-wrapper');

    if (total === 0) {
        emptyState.classList.remove('d-none');
        tasksWrapper.classList.add('d-none');
        return;
    }

    emptyState.classList.add('d-none');
    tasksWrapper.classList.remove('d-none');

    const pendingGroup = document.getElementById('pending-group');
    const completedGroup = document.getElementById('completed-group');
    const pendingList = document.getElementById('pending-tasks-list');
    const completedList = document.getElementById('completed-tasks-list');

    pendingList.innerHTML = '';
    completedList.innerHTML = '';

    document.getElementById('label-pending-items').textContent = `${pendingTasks.length} ${pendingTasks.length === 1 ? 'item' : 'itens'}`;
    document.getElementById('label-completed-items').textContent = `${completedTasks.length} ${completedTasks.length === 1 ? 'item' : 'itens'}`;

    pendingTasks.forEach(t => pendingList.appendChild(createTaskCardElement(t)));
    completedTasks.forEach(t => completedList.appendChild(createTaskCardElement(t)));

    // Aplicar filtro ativo
    pendingGroup.classList.toggle('d-none', currentFilter === 'completed' || pendingTasks.length === 0);
    completedGroup.classList.toggle('d-none', currentFilter === 'pending' || completedTasks.length === 0);
}

// Botões de abrir modal e sugestões rápidas
document.getElementById('btn-open-new-task').addEventListener('click', () => openTaskModal());
document.getElementById('btn-empty-add').addEventListener('click', () => openTaskModal());

document.querySelectorAll('.suggestion-card').forEach(btn => {
    btn.addEventListener('click', () => {
        tasks.unshift({
            id: Date.now().toString(),
            title: btn.dataset.title,
            note: btn.dataset.note,
            date: getTodayISO(),
            time: '',
            project: btn.dataset.project,
            priority: 'normal',
            completed: false
        });
        saveTasks();
        renderTodayView();
    });
});

// Filtros (Todas / Pendentes / Concluídas)
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTodayView();
    });
});

// Navegação entre os 4 separadores
document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const viewName = btn.dataset.view;
        ['today', 'plan', 'projects', 'metrics'].forEach(v => {
            document.getElementById(`view-${v}`).classList.toggle('d-none', v !== viewName);
        });
    });
});

// Inicialização
(function init() {
    taskModalInstance = new bootstrap.Modal(document.getElementById('taskModal'));
    deleteModalInstance = new bootstrap.Modal(document.getElementById('deleteModal'));

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