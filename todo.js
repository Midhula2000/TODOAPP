// Select elements
const todoInput = document.getElementById('todo-input');
const dueDateInput = document.getElementById('due-date-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');

let taskToDelete = null; // Store the <li> to delete
let tasks = []; // Store all tasks as objects

// Add task
addBtn.addEventListener('click', function() {
    const task = todoInput.value.trim();
    const dueDate = dueDateInput.value;
    if (task && dueDate) {
        tasks.push({ text: task, dueDate, completed: false });
        todoInput.value = '';
        dueDateInput.value = '';
        renderTasks();
    }
});

// Function to render tasks sorted by due date
function renderTasks() {
    // Sort tasks by due date ascending
    tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    todoList.innerHTML = '';
    tasks.forEach((taskObj, idx) => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        if (taskObj.completed) li.classList.add('text-decoration-line-through');
        li.innerHTML = `
    <span>
        <span class="task-text">${taskObj.text}</span>
        <span class="due-date badge rounded-pill ms-2">${taskObj.dueDate}</span>
    </span>
    <div>
        <button class="btn btn-warning btn-sm me-2 edit-btn" title="Edit">
            <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-success btn-sm me-2 complete-btn" title="Complete">✓</button>
        <button class="btn btn-danger btn-sm delete-btn" title="Delete">✗</button>
    </div>
`;
        li.dataset.idx = idx;
        todoList.appendChild(li);
    });
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
        renderTasks();
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
        renderTasks();
    }
});

// Handle confirm delete button
document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
    if (taskToDelete !== null) {
        tasks.splice(taskToDelete, 1);
        taskToDelete = null;
        renderTasks();
    }
    // Hide the modal
    const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
    deleteModal.hide();
});