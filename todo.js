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

// Helper function to trigger file download
function downloadFile(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 0);
}

// Export as JSON
document.getElementById('export-json').addEventListener('click', function(e) {
    e.preventDefault();
    const data = JSON.stringify(tasks, null, 2);
    downloadFile('tasks.json', data, 'application/json');
});

// Export as Plain Text
document.getElementById('export-txt').addEventListener('click', function(e) {
    e.preventDefault();
    const lines = tasks.map(t => `Task: ${t.text}\nDue: ${t.dueDate}\nCompleted: ${t.completed ? "Yes" : "No"}\n`);
    downloadFile('tasks.txt', lines.join('\n'), 'text/plain');
});

// Export as CSV
document.getElementById('export-csv').addEventListener('click', function(e) {
    e.preventDefault();
    const header = "Task,Due Date,Completed\n";
    const rows = tasks.map(t => 
        `"${t.text.replace(/"/g, '""')}",${t.dueDate},${t.completed ? "Yes" : "No"}`
    );
    downloadFile('tasks.csv', header + rows.join('\n'), 'text/csv');
});

// Export as SQL
document.getElementById('export-sql').addEventListener('click', function(e) {
    e.preventDefault();
    const sql = tasks.map(t => 
        `INSERT INTO tasks (text, due_date, completed) VALUES ('${t.text.replace(/'/g, "''")}', '${t.dueDate}', ${t.completed ? 1 : 0});`
    ).join('\n');
    downloadFile('tasks.sql', sql, 'text/sql');
});

document.getElementById('importFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();

    reader.onload = function(event) {
        let importedTasks = [];
        try {
            if (ext === 'json') {
                // Import from JSON
                importedTasks = JSON.parse(event.target.result);
            } else if (ext === 'csv') {
                // Import from CSV
                const lines = event.target.result.split('\n').filter(Boolean);
                // Skip header if present
                let start = 0;
                if (lines[0].toLowerCase().includes('task') && lines[0].toLowerCase().includes('due')) start = 1;
                for (let i = start; i < lines.length; i++) {
                    const [text, dueDate, completed] = lines[i].split(',');
                    if (text && dueDate) {
                        importedTasks.push({
                            text: text.replace(/^"|"$/g, '').replace(/""/g, '"').trim(),
                            dueDate: dueDate.trim(),
                            completed: completed && completed.trim().toLowerCase().startsWith('y')
                        });
                    }
                }
            } else if (ext === 'txt') {
                // Import from Plain Text (expects format: Task: ..., Due: ..., Completed: ...)
                const blocks = event.target.result.split(/\n\s*\n/);
                blocks.forEach(block => {
                    const lines = block.split('\n');
                    let text = '', dueDate = '', completed = false;
                    lines.forEach(line => {
                        if (line.startsWith('Task:')) text = line.replace('Task:', '').trim();
                        if (line.startsWith('Due:')) dueDate = line.replace('Due:', '').trim();
                        if (line.startsWith('Completed:')) completed = line.toLowerCase().includes('yes');
                    });
                    if (text && dueDate) importedTasks.push({ text, dueDate, completed });
                });
            } else if (ext === 'sql') {
                // Import from SQL (expects INSERT INTO tasks ...)
                const regex = /INSERT INTO tasks.*VALUES\s*\('([^']*)',\s*'([^']*)',\s*(\d)\);/gi;
                let match;
                while ((match = regex.exec(event.target.result)) !== null) {
                    importedTasks.push({
                        text: match[1],
                        dueDate: match[2],
                        completed: match[3] === '1'
                    });
                }
            } else {
                showToast("Unsupported file type!", "danger");
                return;
            }

            // Merge imported tasks with existing tasks
            if (importedTasks.length > 0) {
                tasks = tasks.concat(importedTasks);
                saveTasks();
                renderTasks();
                showToast("Tasks imported successfully!", "success");
            } else {
                showToast("No tasks found in file.", "warning");
            }
        } catch (err) {
            showToast("Import failed: Invalid file format.", "danger");
        }
        e.target.value = ''; // Reset file input
    };

    reader.readAsText(file);
});