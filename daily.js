const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const dateTime = document.getElementById("dateTime");
const hintText = document.getElementById("hintText");
const toast = document.getElementById("toast");

// Clock
setInterval(() => {
    const now = new Date();
    dateTime.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}, 1000);

// Dark Mode Toggle
function toggleDark() {
    document.body.classList.toggle("dark");
}

// Toast Function (Now localized inside the card)
function showToast(message) {
    toast.innerText = message;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
}

// Add Task
function addTask() {
    const value = taskInput.value.trim();
    if (!value) {
        showToast("⚠️ Please enter a task");
        return;
    }

    hintText.style.display = "none";
    const li = document.createElement("li");
    li.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
            <input type="checkbox" class="track" onchange="updateProgress()">
            <span>${value}</span>
        </div>
        <span class="material-icons delete-icon" style="color:#e74c3c; cursor:pointer; font-size:20px;">delete_outline</span>
    `;

    li.querySelector(".delete-icon").onclick = () => {
        li.remove();
        updateProgress();
        if (taskList.children.length === 0) hintText.style.display = "block";
    };

    taskList.appendChild(li);
    taskInput.value = "";
    updateProgress();
    showToast("✅ Task Added!");
}

function updateProgress() {
    const all = document.querySelectorAll(".track");
    const done = document.querySelectorAll(".track:checked");
    const percent = all.length ? Math.round((done.length / all.length) * 100) : 0;

    progressFill.style.width = percent + "%";
    progressText.innerText = percent + "% Completed";
}