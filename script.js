document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    renderDashboardTasks();
});

/* ====== WEEKLY TASKS ====== */
const pageId = window.location.pathname.split("/").pop() || "default";

function addNewTask() {
    const input = document.getElementById('taskInput');
    if (!input) return;

    const text = input.value.trim();
    if (!text) return;

    createTaskElement(text, false);
    input.value = "";

    saveTasks();
    calculateProgress();
}

function createTaskElement(text, isCompleted) {
    const li = document.createElement('li');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = isCompleted;
    checkbox.addEventListener('change', () => handleToggle(checkbox));

    const spanText = document.createElement('span');
    spanText.className = 'task-text';
    spanText.innerText = text;

    const deleteIcon = document.createElement('span');
    deleteIcon.className = 'material-symbols-rounded delete-icon';
    deleteIcon.innerText = 'delete';
    deleteIcon.onclick = () => deleteTask(li);

    li.append(checkbox, spanText, deleteIcon);

    if (isCompleted) li.classList.add('completed');

    document.getElementById('taskList')?.appendChild(li);
}

function handleToggle(cb) {
    cb.parentElement.classList.toggle('completed', cb.checked);
    saveTasks();
    calculateProgress();
}

function deleteTask(li) {
    li.remove();
    saveTasks();
    calculateProgress();
}

function calculateProgress() {
    const fill = document.getElementById('progress-fill');
    const text = document.getElementById('progress-percent');
    if (!fill || !text) return;

    const boxes = document.querySelectorAll('#taskList input[type="checkbox"]');
    const total = boxes.length;
    const done = [...boxes].filter(b => b.checked).length;

    const percent = total ? Math.round((done / total) * 100) : 0;
    fill.style.width = percent + "%";
    text.innerText = percent + "%";
}

function saveTasks() {
    const tasks = [];
    document.querySelectorAll('#taskList li').forEach(li => {
        tasks.push({
            text: li.querySelector('.task-text').innerText,
            completed: li.querySelector('input').checked
        });
    });
    localStorage.setItem('tasks-' + pageId, JSON.stringify(tasks));
}

function loadTasks() {
    const list = document.getElementById('taskList');
    if (!list) return;

    list.innerHTML = "";
    const saved = JSON.parse(localStorage.getItem('tasks-' + pageId)) || [];
    saved.forEach(t => createTaskElement(t.text, t.completed));
    calculateProgress();
}
// --- STATE MANAGEMENT ---
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDateKey = formatDateKey(new Date()); // YYYY-MM-DD

// Structure: { "2023-12-26": [ { id, text, completed } ] }
let allTasks = JSON.parse(localStorage.getItem('planner_tasks')) || {};

// --- CALENDAR LOGIC ---
function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const monthYearDisplay = document.getElementById('calendar-month-year');
    grid.innerHTML = '';

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(currentYear, currentMonth));

    monthYearDisplay.innerText = `${monthName} ${currentYear}`;

    // Padding for previous month
    for (let i = 0; i < firstDay; i++) {
        grid.innerHTML += `<div></div>`;
    }

    const today = new Date();
    const todayKey = formatDateKey(today);

    for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(currentYear, currentMonth, day);
        const dateKey = formatDateKey(dateObj);
        const hasTasks = allTasks[dateKey] && allTasks[dateKey].length > 0;

        const dayBtn = document.createElement('button');
        dayBtn.className = `calendar-day w-full aspect-square flex flex-col items-center justify-center rounded-xl transition-all hover:bg-indigo-50 text-sm relative 
                                   ${dateKey === selectedDateKey ? 'active' : ''} 
                                   ${dateKey === todayKey ? 'today' : ''}`;

        dayBtn.innerHTML = `
                    <span>${day}</span>
                    ${hasTasks ? '<span class="absolute bottom-1 w-1 h-1 bg-indigo-400 rounded-full"></span>' : ''}
                `;

        dayBtn.onclick = () => selectDate(dateKey);
        grid.appendChild(dayBtn);
    }
}

function changeMonth(delta) {
    currentMonth += delta;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    renderCalendar();
}

function selectDate(key) {
    selectedDateKey = key;
    renderCalendar();
    renderPlanner();
}

// --- PLANNER LOGIC ---
function renderPlanner() {
    const list = document.getElementById('task-list');
    const empty = document.getElementById('empty-state');
    const dateDisplay = document.getElementById('selected-date-display');

    // Format readable date
    const parts = selectedDateKey.split('-');
    const displayDate = new Date(parts[0], parts[1] - 1, parts[2]);
    dateDisplay.innerText = displayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    const tasks = allTasks[selectedDateKey] || [];
    list.innerHTML = '';

    if (tasks.length === 0) {
        empty.classList.remove('hidden');
    } else {
        empty.classList.add('hidden');
        tasks.forEach((task, index) => {
            const taskEl = document.createElement('div');
            taskEl.className = 'flex items-center gap-4 p-4 bg-slate-50 rounded-2xl group hover:bg-slate-100 transition-colors cursor-pointer';
            taskEl.innerHTML = `
                        <div onclick="toggleTask(${index})" class="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center transition-all ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'group-hover:border-indigo-400'}">
                            ${task.completed ? '<i data-lucide="check" class="w-4 h-4"></i>' : ''}
                        </div>
                        <span onclick="toggleTask(${index})" class="flex-1 font-medium text-slate-700 ${task.completed ? 'line-through opacity-40' : ''}">${task.text}</span>
                        <button onclick="deleteTask(${index})" class="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    `;
            list.appendChild(taskEl);
        });
    }

    updateStats();
    lucide.createIcons();
}

function toggleTask(index) {
    allTasks[selectedDateKey][index].completed = !allTasks[selectedDateKey][index].completed;
    saveAndRefresh();
}

function deleteTask(index) {
    allTasks[selectedDateKey].splice(index, 1);
    saveAndRefresh();
}

function openAddTaskModal() {
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('new-task-input').focus();
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
    document.getElementById('new-task-input').value = '';
}

function saveNewTask() {
    const input = document.getElementById('new-task-input');
    const text = input.value.trim();
    if (text) {
        if (!allTasks[selectedDateKey]) allTasks[selectedDateKey] = [];
        allTasks[selectedDateKey].push({ id: Date.now(), text: text, completed: false });
        saveAndRefresh();
        closeModal();
    }
}

function updateStats() {
    const tasks = allTasks[selectedDateKey] || [];
    const done = tasks.filter(t => t.completed).length;
    document.getElementById('stats-total').innerText = tasks.length;
    document.getElementById('stats-done').innerText = done;
}

// --- UTILS ---
function formatDateKey(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
}

function saveAndRefresh() {
    localStorage.setItem('planner_tasks', JSON.stringify(allTasks));
    renderPlanner();
    renderCalendar(); // Refresh dots
}

// Initialize
window.onload = () => {
    renderCalendar();
    renderPlanner();
    lucide.createIcons();
};

// Handle Enter key in modal
document.getElementById('new-task-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveNewTask();
});