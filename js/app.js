// Chaves do localStorage
const STORAGE_KEYS = {
    USER: 'lista_do_dia_user',
    SESSION: 'lista_do_dia_session',
    TASKS: 'lista_do_dia_tasks',
    PROJECTS: 'lista_do_dia_projects'
};

// Projetos iniciais por predefinição
const DEFAULT_PROJECTS = [
    { id: 'proj-pessoal', name: 'Pessoal', color: '#6A968E', default: true },
    { id: 'proj-trabalho', name: 'Trabalho', color: '#52647C', default: true },
    { id: 'proj-estudos', name: 'Estudos', color: '#D680A0', default: true }
];

// Estado da Aplicação
let tasks = [];
let projects = [];
let currentFilter = 'all';
let selectedProjectName = null;
let selectedNewProjectColor = '#6A968E';
let taskIdToDelete = null;

// Instâncias Bootstrap
let taskModalInstance = null;
let projectModalInstance = null;
let deleteModalInstance = null;
let toastInstance = null;

// ==========================================
// 1. UTILITÁRIOS DE SEGURANÇA, DATA E FEEDBACK
// ==========================================
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, match => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[match]));
}

function showToast(message, isRose = false) {
    const toastEl = document.getElementById('app-toast');
    const iconEl = document.getElementById('app-toast-icon');
    const bodyEl = document.getElementById('app-toast-body');
    if (!toastEl || !toastInstance) return;

    bodyEl.textContent = message;
    iconEl.textContent = isRose ? 'delete' : 'check_circle';
    iconEl.classList.toggle('text-rose', isRose);
    iconEl.classList.toggle('text-sage', !isRose);
    toastInstance.show();
}

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

function getTomorrowISO() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const offset = tomorrow.getTimezoneOffset() * 60000;
    return new Date(tomorrow - offset).toISOString().split('T')[0];
}

function formatDatePT(dateISO) {
    if (!dateISO) return '';
    const [year, month, day] = dateISO.split('-');
    return `${day}/${month}/${year}`;
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

function loadTasks() {
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
    tasks = saved ? JSON.parse(saved) : [];
}

function saveProjects() {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
}

function loadProjects() {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (saved) {
        projects = JSON.parse(saved);
    } else {
        projects = [...DEFAULT_PROJECTS];
        saveProjects();
    }
    populateProjectSelect();
}

function getProjectColor(projectName) {
    const found = projects.find(p => p.name === projectName);
    return found ? found.color : '#6A968E';
}

function populateProjectSelect() {
    const select = document.getElementById('task-project');
    if (!select) return;
    select.innerHTML = projects.map(p => `<option value="${escapeHTML(p.name)}">${escapeHTML(p.name)}</option>`).join('');
}

function refreshAllViews() {
    renderTodayView();
    renderPlanView();
    renderProjectsView();
    renderMetricsView();
}

// ==========================================
// 2. AUTENTICAÇÃO LOCAL
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
    registerPrompt.classList.toggle('d-none', Boolean(existingUser));

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
    loadProjects();
    loadTasks();
    refreshAllViews();
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

    if (!name || !q1.trim() || !q2.trim()) {
        showAlert('Preenche todos os campos obrigatórios.');
        return;
    }
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

    if (newPass.length < 8) {
        showAlert('A nova palavra-passe deve ter pelo menos 8 caracteres.');
        return;
    }

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
// 3. GESTÃO DE TAREFAS (CRUD PARTILHADO)
// ==========================================
function openTaskModal(taskToEdit = null, defaultDate = null) {
    populateProjectSelect();
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
        document.getElementById('task-project').value = taskToEdit.project || projects[0]?.name || 'Pessoal';
        document.getElementById('task-priority').value = taskToEdit.priority || 'normal';
    } else {
        modalTitle.textContent = 'Nova tarefa';
        saveBtn.textContent = 'Criar tarefa';
        editIdInput.value = '';
        document.getElementById('form-task').reset();
        document.getElementById('task-date').value = defaultDate || getTodayISO();
        if (selectedProjectName) {
            document.getElementById('task-project').value = selectedProjectName;
        }
    }

    taskModalInstance.show();
}

function toggleTaskStatus(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    saveTasks();
    refreshAllViews();
    showToast(task.completed ? 'Tarefa concluída!' : 'Tarefa reaberta.');
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
        refreshAllViews();
        taskIdToDelete = null;
        showToast('Tarefa eliminada.', true);
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
        showToast('Tarefa atualizada!');
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
        showToast('Tarefa criada!');
    }

    saveTasks();
    refreshAllViews();
    taskModalInstance.hide();
});

function createTaskCardElement(task, showFullDate = false) {
    const card = document.createElement('div');
    card.className = `task-card d-flex align-items-start gap-3 ${task.completed ? 'completed' : ''}`;

    const dateLabel = showFullDate
        ? `${formatDatePT(task.date)}${task.time ? ' • ' + task.time : ''}`
        : (task.time ? `Hoje • ${task.time}` : '');

    const timeTag = dateLabel ? `<span class="task-tag tag-time">${escapeHTML(dateLabel)}</span>` : '';
    const urgentTag = task.priority === 'high' ? `<span class="task-tag tag-urgent">Urgente</span>` : '';
    const projColor = getProjectColor(task.project);
    const projectTag = `<span class="task-tag" style="background:${projColor}28; color:${projColor}; border:1px solid ${projColor}55;">${escapeHTML(task.project)}</span>`;

    card.innerHTML = `
        <button type="button" class="task-check-btn" aria-label="Alternar estado da tarefa">
            <span class="material-symbols-outlined fs-6">check</span>
        </button>
        <div class="flex-grow-1 min-w-0">
            <div class="d-flex align-items-center gap-2 flex-wrap mb-1">
                <span class="fw-semibold text-white ${task.completed ? 'text-decoration-line-through opacity-75' : ''}">${escapeHTML(task.title)}</span>
                ${urgentTag}
                ${timeTag}
                ${projectTag}
            </div>
            ${task.note ? `<p class="smaller text-secondary-custom mb-0">${escapeHTML(task.note)}</p>` : ''}
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

// ==========================================
// 4. VISTA HOJE
// ==========================================
function renderTodayView() {
    const todayISO = getTodayISO();
    const todayTasks = tasks.filter(t => t.date === todayISO);

    const pendingTasks = todayTasks.filter(t => !t.completed);
    const completedTasks = todayTasks.filter(t => t.completed);

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

    pendingTasks.forEach(t => pendingList.appendChild(createTaskCardElement(t, false)));
    completedTasks.forEach(t => completedList.appendChild(createTaskCardElement(t, false)));

    pendingGroup.classList.toggle('d-none', currentFilter === 'completed' || pendingTasks.length === 0);
    completedGroup.classList.toggle('d-none', currentFilter === 'pending' || completedTasks.length === 0);
}

// ==========================================
// 5. VISTA PLANO (CRONOGRAMA)
// ==========================================
function renderPlanView() {
    const container = document.getElementById('plan-groups-container');
    const emptyState = document.getElementById('plan-empty-state');

    if (tasks.length === 0) {
        emptyState.classList.remove('d-none');
        container.innerHTML = '';
        return;
    }

    emptyState.classList.add('d-none');
    container.innerHTML = '';

    const todayISO = getTodayISO();
    const tomorrowISO = getTomorrowISO();

    const groups = [
        {
            title: 'Em atraso',
            badgeClass: 'badge-overdue',
            items: tasks.filter(t => t.date < todayISO && !t.completed)
        },
        {
            title: 'Hoje',
            badgeClass: 'badge-today',
            items: tasks.filter(t => t.date === todayISO)
        },
        {
            title: 'Amanhã',
            badgeClass: 'badge-tomorrow',
            items: tasks.filter(t => t.date === tomorrowISO)
        },
        {
            title: 'Próximos dias',
            badgeClass: 'badge-upcoming',
            items: tasks.filter(t => t.date > tomorrowISO).sort((a, b) => a.date.localeCompare(b.date))
        }
    ];

    let hasVisibleGroups = false;

    groups.forEach(group => {
        if (group.items.length === 0) return;
        hasVisibleGroups = true;

        const section = document.createElement('div');
        section.innerHTML = `
            <div class="d-flex align-items-center justify-content-between mb-2 px-1">
                <span class="plan-group-badge ${group.badgeClass}">${group.title}</span>
                <span class="smaller text-secondary-custom">${group.items.length} ${group.items.length === 1 ? 'tarefa' : 'tarefas'}</span>
            </div>
            <div class="d-flex flex-column gap-2 group-list"></div>
        `;
        const listEl = section.querySelector('.group-list');
        group.items.forEach(t => listEl.appendChild(createTaskCardElement(t, true)));
        container.appendChild(section);
    });

    if (!hasVisibleGroups) {
        emptyState.classList.remove('d-none');
    }
}

// ==========================================
// 6. VISTA PROJETOS
// ==========================================
function deleteCustomProject(projectId, projectName) {
    projects = projects.filter(p => p.id !== projectId);
    tasks = tasks.map(t => t.project === projectName ? { ...t, project: 'Pessoal' } : t);
    if (selectedProjectName === projectName) {
        selectedProjectName = null;
    }
    saveProjects();
    saveTasks();
    populateProjectSelect();
    refreshAllViews();
    showToast(`Projeto "${projectName}" removido.`, true);
}

function renderProjectsView() {
    const grid = document.getElementById('projects-grid');
    grid.innerHTML = '';

    projects.forEach(proj => {
        const projTasks = tasks.filter(t => t.project === proj.name);
        const completedCount = projTasks.filter(t => t.completed).length;
        const isSelected = selectedProjectName === proj.name;

        const col = document.createElement('div');
        col.className = 'col-6';
        col.innerHTML = `
            <div class="project-card h-100 ${isSelected ? 'selected' : ''}">
                <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="project-dot" style="background:${proj.color}"></span>
                    <div class="d-flex align-items-center gap-2">
                        <span class="smaller text-secondary-custom">${completedCount}/${projTasks.length}</span>
                        ${!proj.default ? `<button type="button" class="btn-delete-project" title="Remover projeto"><span class="material-symbols-outlined fs-6">close</span></button>` : ''}
                    </div>
                </div>
                <div class="fw-bold text-white mb-1 text-truncate">${escapeHTML(proj.name)}</div>
                <div class="smaller text-secondary-custom">${projTasks.length} ${projTasks.length === 1 ? 'tarefa' : 'tarefas'}</div>
            </div>
        `;

        const deleteBtn = col.querySelector('.btn-delete-project');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteCustomProject(proj.id, proj.name);
            });
        }

        col.querySelector('.project-card').addEventListener('click', () => {
            selectedProjectName = isSelected ? null : proj.name;
            renderProjectsView();
        });

        grid.appendChild(col);
    });

    const detailSection = document.getElementById('selected-project-section');
    const detailList = document.getElementById('selected-project-tasks');

    if (!selectedProjectName) {
        detailSection.classList.add('d-none');
        return;
    }

    detailSection.classList.remove('d-none');
    document.getElementById('selected-project-title').textContent = `Tarefas em "${selectedProjectName}"`;
    detailList.innerHTML = '';

    const filtered = tasks.filter(t => t.project === selectedProjectName);
    if (filtered.length === 0) {
        detailList.innerHTML = `<p class="small text-secondary-custom text-center py-3">Ainda não existem tarefas neste projeto.</p>`;
    } else {
        filtered.forEach(t => detailList.appendChild(createTaskCardElement(t, true)));
    }
}

document.getElementById('btn-clear-project-filter').addEventListener('click', () => {
    selectedProjectName = null;
    renderProjectsView();
});

document.getElementById('btn-open-new-project').addEventListener('click', () => {
    document.getElementById('form-project').reset();
    projectModalInstance.show();
});

document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        selectedNewProjectColor = swatch.dataset.color;
    });
});

document.getElementById('form-project').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('project-name').value.trim();
    if (!name) return;

    const exists = projects.some(p => p.name.toLowerCase() === name.toLowerCase());
    if (!exists) {
        projects.push({
            id: 'proj-' + Date.now(),
            name,
            color: selectedNewProjectColor,
            default: false
        });
        saveProjects();
        populateProjectSelect();
        refreshAllViews();
        showToast(`Projeto "${name}" criado!`);
    }
    projectModalInstance.hide();
});

// ==========================================
// 7. VISTA MÉTRICAS
// ==========================================
function renderMetricsView() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    document.getElementById('metric-total').textContent = total;
    document.getElementById('metric-completed').textContent = completed;
    document.getElementById('metric-pending').textContent = pending;
    document.getElementById('metric-rate').textContent = `${rate}%`;

    const projContainer = document.getElementById('metrics-by-project');
    projContainer.innerHTML = '';

    projects.forEach(proj => {
        const projTasks = tasks.filter(t => t.project === proj.name);
        const projDone = projTasks.filter(t => t.completed).length;
        const pct = projTasks.length > 0 ? Math.round((projDone / projTasks.length) * 100) : 0;

        projContainer.innerHTML += `
            <div>
                <div class="d-flex justify-content-between smaller mb-1">
                    <span class="fw-semibold text-white d-flex align-items-center gap-2">
                        <span class="project-dot" style="background:${proj.color}"></span> ${escapeHTML(proj.name)}
                    </span>
                    <span class="text-secondary-custom">${projDone}/${projTasks.length} (${pct}%)</span>
                </div>
                <div class="metric-progress">
                    <div class="metric-progress-bar" style="width:${pct}%; background:${proj.color};"></div>
                </div>
            </div>
        `;
    });

    const urgentCount = tasks.filter(t => t.priority === 'high').length;
    const normalCount = total - urgentCount;
    const urgentPct = total > 0 ? Math.round((urgentCount / total) * 100) : 0;
    const normalPct = total > 0 ? Math.round((normalCount / total) * 100) : 0;

    document.getElementById('metrics-by-priority').innerHTML = `
        <div>
            <div class="d-flex justify-content-between smaller mb-1">
                <span class="text-white">Alta / Urgente</span>
                <span class="text-rose fw-semibold">${urgentCount} (${urgentPct}%)</span>
            </div>
            <div class="metric-progress">
                <div class="metric-progress-bar" style="width:${urgentPct}%; background:#D680A0;"></div>
            </div>
        </div>
        <div class="mt-2">
            <div class="d-flex justify-content-between smaller mb-1">
                <span class="text-white">Normal</span>
                <span class="text-sage fw-semibold">${normalCount} (${normalPct}%)</span>
            </div>
            <div class="metric-progress">
                <div class="metric-progress-bar" style="width:${normalPct}%; background:#6A968E;"></div>
            </div>
        </div>
    `;
}

// ==========================================
// 8. EVENTOS GERAIS E INICIALIZAÇÃO
// ==========================================
document.getElementById('btn-open-new-task').addEventListener('click', () => openTaskModal());
document.getElementById('btn-empty-add').addEventListener('click', () => openTaskModal());
document.getElementById('btn-plan-new-task').addEventListener('click', () => openTaskModal(null, getTomorrowISO()));
document.getElementById('btn-plan-empty-add').addEventListener('click', () => openTaskModal());

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
        refreshAllViews();
        showToast('Tarefa adicionada!');
    });
});

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTodayView();
    });
});

document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const viewName = btn.dataset.view;
        ['today', 'plan', 'projects', 'metrics'].forEach(v => {
            document.getElementById(`view-${v}`).classList.toggle('d-none', v !== viewName);
        });
        refreshAllViews();
    });
});

(function init() {
    taskModalInstance = new bootstrap.Modal(document.getElementById('taskModal'));
    projectModalInstance = new bootstrap.Modal(document.getElementById('projectModal'));
    deleteModalInstance = new bootstrap.Modal(document.getElementById('deleteModal'));
    toastInstance = new bootstrap.Toast(document.getElementById('app-toast'), { delay: 2200 });

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