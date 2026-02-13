let currentDay = 'Mon';
const weeklyInput = document.getElementById("weeklyInput");
const weeklyList = document.getElementById("weeklyList");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const statusIcon = document.getElementById("statusIcon");
const toast = document.getElementById("toast");

// Short Chime Sound (Base64)
const chime = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTdvT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19v");

function switchDay(day, element) {
    currentDay = day;
    document.getElementById("currentDayDisplay").innerText = day;
    document.querySelectorAll('.day-box').forEach(box => box.classList.remove('active'));
    element.classList.add('active');
    loadDayTasks();
    showToast(`Viewing ${day}`);
}

function addWeekly() {
    const val = weeklyInput.value.trim();
    if (!val) {
        showToast("⚠️ Fill first the task before clicking the add button");
        return;
    }
    createTaskUI(val, false);
    saveDayTasks();
    weeklyInput.value = "";
    showToast("✅ Successfully added");
}

function createTaskUI(text, isDone) {
    const li = document.createElement("li");
    li.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
            <input type="checkbox" class="task-check" ${isDone ? 'checked' : ''} onchange="handleTaskToggle()">
            <span class="task-text ${isDone ? 'completed' : ''}">${text}</span>
        </div>
        <span class="material-icons" style="cursor:pointer; font-size:18px; color:#ef4444" 
              onclick="removeTask(this)">delete_outline</span>
    `;
    weeklyList.appendChild(li);
    updateProgress();
}

function removeTask(element) {
    const li = element.parentElement;
    li.style.transform = "scale(0.8)";
    li.style.opacity = "0";
    setTimeout(() => {
        li.remove();
        saveDayTasks();
        updateProgress();
    }, 200);
}

function handleTaskToggle() {
    updateProgress();
    saveDayTasks();
}

function launchConfetti() {
    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
    for (let i = 0; i < 50; i++) {
        const c = document.createElement('div');
        c.className = 'confetti';
        c.style.left = Math.random() * 100 + 'vw';
        c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        const duration = Math.random() * 3 + 2;
        c.style.animation = `fall ${duration}s linear forwards`;
        document.body.appendChild(c);
        setTimeout(() => c.remove(), duration * 1000);
    }
}

function updateProgress() {
    const total = weeklyList.querySelectorAll(".task-check").length;
    const done = weeklyList.querySelectorAll(".task-check:checked").length;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;

    const fill = document.getElementById("progressFill");
    const track = document.querySelector(".progress-track");

    fill.style.width = percent + "%";
    progressText.innerText = `${percent}% Completed`;

    if (percent === 100 && total > 0) {
        track.classList.add("complete-pulse");
        fill.style.background = "var(--reward)";
        if (!track.dataset.celebrated) {
            launchConfetti();
            chime.play();
            showToast("🎊 100% COMPLETED! AMAZING!", true);
            track.dataset.celebrated = "true";
        }
    } else {
        track.classList.remove("complete-pulse");
        fill.style.background = "var(--primary)";
        delete track.dataset.celebrated;
    }
}

function saveDayTasks() {
    const tasks = [];
    weeklyList.querySelectorAll("li").forEach(li => {
        tasks.push({ text: li.querySelector(".task-text").textContent, done: li.querySelector(".task-check").checked });
    });
    localStorage.setItem(`weekly_${currentDay}`, JSON.stringify(tasks));
}

function loadDayTasks() {
    weeklyList.innerHTML = "";
    const tasks = JSON.parse(localStorage.getItem(`weekly_${currentDay}`) || "[]");
    tasks.forEach(t => createTaskUI(t.text, t.done));
    updateProgress();
}

function showToast(msg, isReward = false) {
    toast.innerText = msg;
    toast.className = isReward ? "card-toast show reward" : "card-toast show";
    setTimeout(() => toast.classList.remove("show"), 2500);
}

window.onload = loadDayTasks;