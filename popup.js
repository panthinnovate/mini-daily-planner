const dateEl = document.getElementById("date");
const taskListEl = document.getElementById("taskList");
const newTaskInput = document.getElementById("newTask");
const addTaskBtn = document.getElementById("addTask");

const todayKey = new Date().toISOString().split('T')[0];
const timerDisplay = document.getElementById("timer");
const startTimerBtn = document.getElementById("startTimer");
const resetTimerBtn = document.getElementById("resetTimer");

let timer;
let secondsLeft = 1500;

const today = new Date().toLocaleDateString(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric"
});
dateEl.innerText = today;

function renderTasks(tasks) {
  taskListEl.innerHTML = "";
  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = "task";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.addEventListener("change", () => {
      tasks[index].done = checkbox.checked;
      saveTasks(tasks);
    });

    const label = document.createElement("span");
    label.textContent = task.text;
    if (task.done) label.classList.add("done");

    const delBtn = document.createElement("button");
    delBtn.innerHTML = "❌";
    delBtn.className = "delete-btn";
    delBtn.addEventListener("click", () => {
      tasks.splice(index, 1);
      saveTasks(tasks);
    });

    li.appendChild(checkbox);
    li.appendChild(label);
    li.appendChild(delBtn);
    taskListEl.appendChild(li);
  });
}

function saveTasks(tasks) {
  const data = {};
  data[todayKey] = tasks;
  chrome.storage.sync.set(data, () => renderTasks(tasks));
}

function loadTasks() {
  chrome.storage.sync.get(todayKey, (data) => {
    const tasks = data[todayKey] || [];
    renderTasks(tasks);
  });
}

addTaskBtn.addEventListener("click", () => {
  const text = newTaskInput.value.trim();
  if (!text) return;
  chrome.storage.sync.get(todayKey, (data) => {
    const tasks = data[todayKey] || [];
    tasks.push({ text, done: false });
    saveTasks(tasks);
    newTaskInput.value = "";
  });
});

function updateTimerDisplay() {
  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');
  timerDisplay.textContent = `${minutes}:${seconds}`;
}

startTimerBtn.addEventListener("click", () => {
  clearInterval(timer);
  timer = setInterval(() => {
    secondsLeft--;
    updateTimerDisplay();
    if (secondsLeft <= 0) {
      clearInterval(timer);
      chrome.runtime.sendMessage({ notify: "Pomodoro Complete! Take a break." });
    }
  }, 1000);
});

resetTimerBtn.addEventListener("click", () => {
  clearInterval(timer);
  secondsLeft = 1500;
  updateTimerDisplay();
});

updateTimerDisplay();
loadTasks();