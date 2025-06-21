// Select elements
const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');

let taskToDelete = null; // Store the <li> to delete

// Add task
addBtn.addEventListener('click', function() {
    const task = todoInput.value.trim();
    if (task) {
        addTask(task);
        todoInput.value = '';
    }
});

// Function to add task to the list
function addTask(task) {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
        <span class="task-text">${task}</span>
        <div>
            <button class="btn btn-warning btn-sm me-2 edit-btn" title="Edit">
                <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-success btn-sm me-2 complete-btn" title="Complete">✓</button>
            <button class="btn btn-danger btn-sm delete-btn" title="Delete">✗</button>
        </div>
    `;
    todoList.appendChild(li);
}

// Handle edit, complete, and delete actions
todoList.addEventListener('click', function(e) {
    const li = e.target.closest('li');
    if (!li) return;

    // Delete with modal
    if (e.target.closest('.delete-btn')) {
        taskToDelete = li;
        const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
        deleteModal.show();
        return;
    }

    // Complete
    if (e.target.closest('.complete-btn')) {
        li.classList.toggle('text-decoration-line-through');
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
        const span = document.createElement('span');
        span.className = 'task-text';
        span.textContent = newText;
        input.replaceWith(span);
        btn.innerHTML = '<i class="bi bi-pencil"></i>';
        btn.classList.remove('save-btn', 'btn-success');
        btn.classList.add('edit-btn', 'btn-warning');
    }
});

// Handle confirm delete button (make sure this button exists in your HTML)
document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
    if (taskToDelete) {
        taskToDelete.remove();
        taskToDelete = null;
    }
    // Hide the modal
    const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
    deleteModal.hide();
});