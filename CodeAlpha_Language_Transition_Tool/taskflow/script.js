/* ============================================================
   TaskFlow — script.js
   Full Vanilla JS To-Do app with localStorage, filters, search,
   dark/light mode, due dates, and delete confirmation.
   ============================================================ */

/* ─── STATE ──────────────────────────────────────────────────── */
/**
 * tasks   — array of task objects: { id, text, completed, dueDate, createdAt }
 * filter  — 'all' | 'active' | 'completed'
 * search  — current search string (lowercase)
 * pendingDeleteId — id of task awaiting modal confirmation
 */
let tasks             = [];
let filter            = 'all';
let search            = '';
let pendingDeleteId   = null;

/* ─── DOM REFS ───────────────────────────────────────────────── */
const taskInput       = document.getElementById('taskInput');
const dueDateInput    = document.getElementById('dueDateInput');
const addTaskBtn      = document.getElementById('addTaskBtn');
const searchInput     = document.getElementById('searchInput');
const taskList        = document.getElementById('taskList');
const emptyState      = document.getElementById('emptyState');
const emptyTitle      = document.getElementById('emptyTitle');
const emptySub        = document.getElementById('emptySub');
const cardFooter      = document.getElementById('cardFooter');
const footerCount     = document.getElementById('footerCount');
const clearBtn        = document.getElementById('clearCompletedBtn');
const filterTabs      = document.querySelectorAll('.filter-tab');
const themeToggle     = document.getElementById('themeToggle');
const statTotal       = document.getElementById('statTotal');
const statCompleted   = document.getElementById('statCompleted');
const statPending     = document.getElementById('statPending');
// Modal
const modalBackdrop   = document.getElementById('modalBackdrop');
const modalConfirmBtn = document.getElementById('modalConfirmBtn');
const modalCancelBtn  = document.getElementById('modalCancelBtn');
// Toast
const toast           = document.getElementById('toast');

let toastTimer = null;

/* ─── HELPERS ────────────────────────────────────────────────── */

/** Generate a simple unique ID */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/** Format ISO date string (YYYY-MM-DD) to "Jun 21" style */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  // Use UTC to avoid timezone shifts
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

/** Return true if a due date is in the past (and not today) */
function isOverdue(dateStr) {
  if (!dateStr) return false;
  const today = new Date().toISOString().slice(0, 10);
  return dateStr < today;
}

/** Show a brief toast message */
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

/** Bump-animate a stat element */
function bumpStat(el) {
  el.classList.remove('bump');
  // Force reflow so the animation re-triggers
  void el.offsetWidth;
  el.classList.add('bump');
  setTimeout(() => el.classList.remove('bump'), 200);
}

/* ─── LOCAL STORAGE ──────────────────────────────────────────── */

/** Save tasks array to localStorage */
function saveToLocalStorage() {
  localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
}

/** Load tasks array from localStorage */
function loadFromLocalStorage() {
  const raw = localStorage.getItem('taskflow_tasks');
  if (raw) {
    try {
      tasks = JSON.parse(raw);
    } catch {
      tasks = []; // guard against corrupt data
    }
  }
}

/* ─── CORE TASK OPERATIONS ───────────────────────────────────── */

/**
 * addTask()
 * Creates a new task object and pushes it to the tasks array.
 */
function addTask() {
  const text = taskInput.value.trim();
  if (!text) {
    // Shake the input to signal it's empty
    taskInput.style.animation = 'none';
    void taskInput.offsetWidth;
    taskInput.style.borderColor = 'var(--danger)';
    taskInput.style.boxShadow = '0 0 0 3px rgba(255,92,122,0.25)';
    setTimeout(() => {
      taskInput.style.borderColor = '';
      taskInput.style.boxShadow = '';
    }, 800);
    return;
  }

  const task = {
    id: uid(),
    text,
    completed: false,
    dueDate: dueDateInput.value || '',
    createdAt: new Date().toISOString()
  };

  tasks.unshift(task); // Add to beginning of array
  taskInput.value    = '';
  dueDateInput.value = '';
  taskInput.focus();

  saveToLocalStorage();
  renderTasks();
  showToast('Task added ✓');
}

/**
 * deleteTask(id)
 * Removes a task by id from the array.
 */
function deleteTask(id) {
  // Array.filter() — returns tasks excluding the one with matching id
  tasks = tasks.filter(task => task.id !== id);
  saveToLocalStorage();
  renderTasks();
  showToast('Task deleted');
}

/**
 * toggleComplete(id)
 * Flips the completed flag of a task.
 */
function toggleComplete(id) {
  // Array.find() — locate the task by id
  const task = tasks.find(task => task.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveToLocalStorage();
  renderTasks();
}

/**
 * editTask(id)
 * Switches a task's displayed text into an inline edit <input>.
 */
function editTask(id) {
  const li = taskList.querySelector(`[data-id="${id}"]`);
  if (!li) return;

  const task       = tasks.find(t => t.id === id);
  const contentDiv = li.querySelector('.task-content');
  const textEl     = li.querySelector('.task-text');
  const actionsEl  = li.querySelector('.task-actions');

  // Build the edit input
  const input = document.createElement('input');
  input.type        = 'text';
  input.className   = 'task-edit-input';
  input.value       = task.text;
  input.maxLength   = 150;
  input.setAttribute('aria-label', 'Edit task');

  // Replace text span with input
  textEl.replaceWith(input);
  input.focus();
  input.select();

  // Swap Edit btn to Save btn
  const editBtn = actionsEl.querySelector('.edit-btn');
  if (editBtn) {
    editBtn.textContent = '✓';
    editBtn.setAttribute('aria-label', 'Save task');
    editBtn.classList.add('save-btn');
    editBtn.classList.remove('edit-btn');
  }

  /** Save inline edit */
  function saveEdit() {
    const newText = input.value.trim();
    if (newText) {
      task.text = newText;
      saveToLocalStorage();
      showToast('Task updated');
    }
    renderTasks(); // Re-render to exit edit mode cleanly
  }

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter')  saveEdit();
    if (e.key === 'Escape') renderTasks(); // Cancel — just re-render
  });
  input.addEventListener('blur', saveEdit);

  // Save btn click
  const saveBtn = actionsEl.querySelector('.save-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      saveEdit();
    });
  }
}

/* ─── DELETE CONFIRMATION MODAL ──────────────────────────────── */

function openDeleteModal(id) {
  pendingDeleteId = id;
  modalBackdrop.classList.add('open');
  modalBackdrop.setAttribute('aria-hidden', 'false');
  modalConfirmBtn.focus();
}

function closeDeleteModal() {
  pendingDeleteId = null;
  modalBackdrop.classList.remove('open');
  modalBackdrop.setAttribute('aria-hidden', 'true');
}

modalConfirmBtn.addEventListener('click', () => {
  if (pendingDeleteId !== null) deleteTask(pendingDeleteId);
  closeDeleteModal();
});

modalCancelBtn.addEventListener('click', closeDeleteModal);

// Close on backdrop click
modalBackdrop.addEventListener('click', (e) => {
  if (e.target === modalBackdrop) closeDeleteModal();
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) closeDeleteModal();
});

/* ─── RENDER ─────────────────────────────────────────────────── */

/**
 * renderTasks()
 * The single source of truth for the UI.
 * Filters + searches tasks, then builds and injects the HTML.
 */
function renderTasks() {
  /* 1. Apply filter using Array.filter() */
  let visible = tasks.filter(task => {
    if (filter === 'active')    return !task.completed;
    if (filter === 'completed') return  task.completed;
    return true; // 'all'
  });

  /* 2. Apply search using Array.filter() */
  if (search) {
    visible = visible.filter(task =>
      task.text.toLowerCase().includes(search)
    );
  }

  /* 3. Build HTML using Array.map() */
  const html = visible.map(task => buildTaskHTML(task)).join('');
  taskList.innerHTML = html;

  /* 4. Update stats */
  updateStats();

  /* 5. Empty state */
  updateEmptyState(visible.length);

  /* 6. Footer */
  updateFooter();
}

/**
 * buildTaskHTML(task)
 * Returns the <li> HTML string for a single task.
 */
function buildTaskHTML(task) {
  const overdue = !task.completed && isOverdue(task.dueDate);
  const dueDateHTML = task.dueDate
    ? `<span class="task-due ${overdue ? 'overdue' : ''}">
         ${overdue ? '⚠️' : '📅'} ${formatDate(task.dueDate)}${overdue ? ' · Overdue' : ''}
       </span>`
    : '';

  return `
    <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
      <!-- Completion checkbox -->
      <input
        type="checkbox"
        class="task-checkbox"
        ${task.completed ? 'checked' : ''}
        aria-label="Mark task as ${task.completed ? 'incomplete' : 'complete'}"
        data-action="toggle"
      />

      <!-- Task content area -->
      <div class="task-content">
        <span class="task-text">${escapeHTML(task.text)}</span>
        <div class="task-meta">${dueDateHTML}</div>
      </div>

      <!-- Action buttons -->
      <div class="task-actions">
        <button class="action-btn edit-btn" data-action="edit" aria-label="Edit task" title="Edit">
          ✏️
        </button>
        <button class="action-btn delete-btn" data-action="delete" aria-label="Delete task" title="Delete">
          🗑️
        </button>
      </div>
    </li>
  `;
}

/**
 * escapeHTML(str)
 * Prevents XSS by escaping HTML special characters.
 */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

/** updateStats() — refreshes total / completed / pending counters */
function updateStats() {
  const total     = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending   = total - completed;

  // Only bump if value actually changed
  if (statTotal.textContent     !== String(total))     { bumpStat(statTotal);     statTotal.textContent     = total;     }
  if (statCompleted.textContent !== String(completed)) { bumpStat(statCompleted); statCompleted.textContent = completed; }
  if (statPending.textContent   !== String(pending))   { bumpStat(statPending);   statPending.textContent   = pending;   }
}

/** updateEmptyState(count) — shows/hides empty state message */
function updateEmptyState(count) {
  if (count === 0) {
    emptyState.classList.add('visible');
    emptyState.setAttribute('aria-hidden', 'false');

    // Tailored messages per context
    if (tasks.length === 0) {
      emptyTitle.textContent = 'No tasks yet';
      emptySub.textContent   = 'Add your first task above to get started.';
    } else if (search) {
      emptyTitle.textContent = 'No matches found';
      emptySub.textContent   = `Try a different search term.`;
    } else if (filter === 'active') {
      emptyTitle.textContent = 'All caught up!';
      emptySub.textContent   = 'No active tasks remaining.';
    } else if (filter === 'completed') {
      emptyTitle.textContent = 'Nothing completed yet';
      emptySub.textContent   = 'Mark some tasks as done to see them here.';
    }
  } else {
    emptyState.classList.remove('visible');
    emptyState.setAttribute('aria-hidden', 'true');
  }
}

/** updateFooter() — shows item count and clear-completed button */
function updateFooter() {
  const active    = tasks.filter(t => !t.completed).length;
  const completed = tasks.filter(t =>  t.completed).length;

  if (tasks.length === 0) {
    cardFooter.classList.add('hidden');
    return;
  }
  cardFooter.classList.remove('hidden');
  footerCount.textContent = `${active} item${active !== 1 ? 's' : ''} left`;
  clearBtn.style.visibility = completed > 0 ? 'visible' : 'hidden';
}

/* ─── EVENT DELEGATION ───────────────────────────────────────── */
/**
 * Single listener on <ul> handles all task actions (toggle, edit, delete).
 * This is efficient — no per-item listeners needed.
 */
taskList.addEventListener('click', (e) => {
  const li = e.target.closest('.task-item');
  if (!li) return;
  const id = li.dataset.id;

  const action = e.target.closest('[data-action]')?.dataset.action;
  if (!action) return;

  if (action === 'toggle') toggleComplete(id);
  if (action === 'edit')   editTask(id);
  if (action === 'delete') openDeleteModal(id);
});

/* ─── ADD TASK EVENTS ────────────────────────────────────────── */

addTaskBtn.addEventListener('click', addTask);

// Allow Enter key to add a task from the text input
taskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTask();
});

/* ─── SEARCH ─────────────────────────────────────────────────── */

searchInput.addEventListener('input', () => {
  search = searchInput.value.trim().toLowerCase();
  renderTasks();
});

/* ─── FILTER TABS ────────────────────────────────────────────── */

filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    filter = tab.dataset.filter;
    // Update active styling
    filterTabs.forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    renderTasks();
  });
});

/* ─── CLEAR COMPLETED ────────────────────────────────────────── */

clearBtn.addEventListener('click', () => {
  const count = tasks.filter(t => t.completed).length;
  if (!count) return;
  // Array.filter() to keep only active tasks
  tasks = tasks.filter(t => !t.completed);
  saveToLocalStorage();
  renderTasks();
  showToast(`Cleared ${count} completed task${count > 1 ? 's' : ''}`);
});

/* ─── DARK / LIGHT TOGGLE ────────────────────────────────────── */

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('taskflow_theme', theme);
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

/* ─── INIT ───────────────────────────────────────────────────── */

function init() {
  // Restore saved theme
  const savedTheme = localStorage.getItem('taskflow_theme') || 'dark';
  applyTheme(savedTheme);

  // Load tasks from localStorage
  loadFromLocalStorage();

  // Render initial UI
  renderTasks();
}

// Kick everything off
init();
