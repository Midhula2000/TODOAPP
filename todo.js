// Select elements

//functioality to handle the search by task name and  filer by status
const todoInput = document.getElementById('todo-input');
const dueDateInput = document.getElementById('due-date-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const searchInput = document.getElementById('search-input');
const statusFilter = document.getElementById('status-filter');

let taskToDelete = null; // Store the <li> to delete

let currentPage = 1;
const tasksPerPage = 5;

// ---- Load tasks from localStorage ----
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
renderTasks();

// ---- Save tasks to localStorage ----
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Add task
addBtn.addEventListener('click', function() {
    const task = todoInput.value.trim();
    const dueDate = dueDateInput.value;
    if (task && dueDate) {
        tasks.push({ text: task, dueDate, completed: false });
        todoInput.value = '';
        dueDateInput.value = '';
        saveTasks();
        renderTasks();
        showToast("Task created!", "success");
    }
});

// Function to render pagination controls
function renderPagination(totalTasks) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    pagination.innerHTML = '';
    const totalPages = Math.ceil(totalTasks / tasksPerPage);
    if (totalPages <= 1) return;

    // Prev button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item${currentPage === 1 ? ' disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#">Prev</a>`;
    prevLi.addEventListener('click', function(e) {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            renderTasks();
        }
    });
    pagination.appendChild(prevLi);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item${currentPage === i ? ' active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        li.addEventListener('click', function(e) {
            e.preventDefault();
            if (currentPage !== i) {
                currentPage = i;
                renderTasks();
            }
        });
        pagination.appendChild(li);
    }

    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item${currentPage === totalPages ? ' disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#">Next</a>`;
    nextLi.addEventListener('click', function(e) {
        e.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            renderTasks();
        }
    });
    pagination.appendChild(nextLi);
}

// Replace your renderTasks function with this:
function renderTasks() {
    // Get search and filter values
    const searchText = searchInput.value.trim().toLowerCase();
    const status = statusFilter.value;

    // Filter and sort, and keep original index for each task
    let filteredTasks = tasks
        .map((task, idx) => ({ ...task, originalIdx: idx }))
        .filter(task => {
            const matchesText = task.text.toLowerCase().includes(searchText);
            let matchesStatus = true;
            if (status === "pending") matchesStatus = !task.completed;
            else if (status === "completed") matchesStatus = task.completed;
            return matchesText && matchesStatus;
        })
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    // Pagination logic
    const totalTasks = filteredTasks.length;
    const totalPages = Math.max(1, Math.ceil(totalTasks / tasksPerPage));
    if (currentPage > totalPages) currentPage = totalPages;
    const startIdx = (currentPage - 1) * tasksPerPage;
    const endIdx = startIdx + tasksPerPage;
    const paginatedTasks = filteredTasks.slice(startIdx, endIdx);

    // Render tasks
    todoList.innerHTML = '';
    paginatedTasks.forEach((taskObj) => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center';
        if (taskObj.completed) li.classList.add('text-decoration-line-through');
        li.innerHTML = `
            <div class="flex-grow-1">
                <span class="task-text text-truncate d-block" style="max-width: 100%;">${taskObj.text}</span>
                <span class="due-date badge rounded-pill ms-2">${taskObj.dueDate}</span>
            </div>
            <div class="d-flex flex-wrap gap-2 mt-2 mt-md-0">
                <button class="btn btn-warning btn-sm edit-btn" title="Edit">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-success btn-sm complete-btn" title="Complete">✓</button>
                <button class="btn btn-danger btn-sm delete-btn" title="Delete">✗</button>
            </div>
        `;
        // Use the original index for actions
        li.dataset.idx = taskObj.originalIdx;
        todoList.appendChild(li);
    });

    // Render pagination controls
    renderPagination(totalTasks);
}

// Handle edit, complete, and delete actions
todoList.addEventListener('click', function(e) {
    const li = e.target.closest('li');
    if (!li) return;
    const idx = li.dataset.idx;

    // Delete with modal
    if (e.target.closest('.delete-btn')) {
        taskToDelete = idx;
        const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
        deleteModal.show();
        return;
    }

    // Complete
    if (e.target.closest('.complete-btn')) {
        tasks[idx].completed = !tasks[idx].completed;
        saveTasks();
        renderTasks();
        showToast(tasks[idx].completed ? "Task marked complete!" : "Task marked incomplete!", "secondary");
        return;
    }

    // Edit/Save
    if (e.target.closest('.edit-btn')) {
        const btn = e.target.closest('.edit-btn');
        const span = li.querySelector('.task-text');
        const currentText = span.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'form-control form-control-sm me-2';
        span.replaceWith(input);
        btn.innerHTML = '<i class="bi bi-check-lg"></i>';
        btn.classList.remove('edit-btn', 'btn-warning');
        btn.classList.add('save-btn', 'btn-success');
        input.focus();
    } else if (e.target.closest('.save-btn')) {
        const btn = e.target.closest('.save-btn');
        const input = li.querySelector('input[type="text"]');
        const newText = input.value.trim() || 'Untitled Task';
        tasks[idx].text = newText;
        btn.innerHTML = '<i class="bi bi-pencil"></i>';
        btn.classList.remove('save-btn', 'btn-success');
        btn.classList.add('edit-btn', 'btn-warning');
        saveTasks();
        renderTasks();
        showToast("Task updated!", "info");
    }
});

// Handle confirm delete button
document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
    if (taskToDelete !== null) {
        tasks.splice(taskToDelete, 1);
        taskToDelete = null;
        saveTasks();
        renderTasks();
        showToast("Task deleted!", "danger");
    }
    // Hide the modal
    const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
    deleteModal.hide();
});

function showToast(message, color = "primary") {
    const toastEl = document.getElementById('actionToast');
    const toastMsg = document.getElementById('toastMsg');
    toastMsg.textContent = message;
    toastEl.className = `toast align-items-center text-bg-${color} border-0`;
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}

// Listen for search and filter changes
searchInput.addEventListener('input', renderTasks);
statusFilter.addEventListener('change', renderTasks);

