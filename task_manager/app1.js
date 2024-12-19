class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.state = {
            filter: 'all',
            darkMode: false,
            editingTaskId: null
        };
        this.initEventListeners();
        this.render();
    }

    // Reactive State Management
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.render();
        this.saveToLocalStorage();
    }

    // Task CRUD Operations
    addTask(task) {
        const newTask = {
            id: Date.now(),
            ...task,
            createdAt: new Date(),
            status: 'pending'
        };
        this.tasks.push(newTask);
        this.setState({ tasks: this.tasks, editingTaskId: null });
        this.closeModal();
    }

    updateTask(id, updatedTask) {
        this.tasks = this.tasks.map(task => 
            task.id === id ? { ...task, ...updatedTask } : task
        );
        this.setState({ 
            tasks: this.tasks, 
            editingTaskId: null 
        });
        this.closeModal();
    }

    deleteTask(id) {
        // Confirmation before deletion
        if (!confirm('Are you sure you want to delete this task?')) return;

        this.tasks = this.tasks.filter(task => task.id !== id);
        this.setState({ tasks: this.tasks });
        
        // Optional: Toast or notification
        this.showNotification('Task deleted successfully', 'success');
    }

    // Edit Task Method
    editTask(id) {
        // Find the task to edit
        const taskToEdit = this.tasks.find(task => task.id === id);
        
        if (!taskToEdit) return;

        // Populate modal with task details
        this.setState({ editingTaskId: id });
        
        // Fill form with existing task data
        document.getElementById('task-title').value = taskToEdit.title;
        document.getElementById('task-description').value = taskToEdit.description;
        document.getElementById('task-priority').value = taskToEdit.priority;
        document.getElementById('task-due-date').value = taskToEdit.dueDate;

        // Change modal title and submit button text
        document.getElementById('modal-title').textContent = 'Edit Task';
        document.getElementById('task-submit-btn').textContent = 'Update Task';

        // Show modal
        document.getElementById('task-modal').style.display = 'block';
    }

    // Filtering and Search
    filterTasks() {
        return this.tasks.filter(task => {
            const matchesStatus = this.state.filter === 'all' || task.status === this.state.filter;
            const searchTerm = document.getElementById('search-tasks').value.toLowerCase();
            const matchesSearch = task.title.toLowerCase().includes(searchTerm);
            return matchesStatus && matchesSearch;
        });
    }

    // Render Tasks
    render() {
        const taskList = document.getElementById('task-list');
        const filteredTasks = this.filterTasks();

        if (filteredTasks.length === 0) {
            taskList.innerHTML = `
                <div class="no-tasks">
                    <p>No tasks found. Create your first task!</p>
                </div>
            `;
            return;
        }

        taskList.innerHTML = filteredTasks.map(task => `
            <div class="task-card" data-id="${task.id}">
                <div class="task-header">
                    <h3>${task.title}</h3>
                    <span class="priority" data-priority="${task.priority}">
                        ${task.priority.toUpperCase()}
                    </span>
                </div>
                <div class="task-body">
                    <p>${task.description}</p>
                    <div class="task-meta">
                        <span>Due: ${task.dueDate || 'No due date'}</span>
                        <span>Status: ${task.status}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="edit-task" data-id="${task.id}">
                        <i class="edit-icon">✏️</i> Edit
                    </button>
                    <button class="delete-task" data-id="${task.id}">
                        <i class="delete-icon">🗑️</i> Delete
                    </button>
                </div>
            </div>
        `).join('');

        this.attachTaskEventListeners();
    }

    // Attach Event Listeners to Dynamic Elements
    attachTaskEventListeners() {
        // Edit Task Listeners
        document.querySelectorAll('.edit-task').forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = parseInt(e.currentTarget.dataset.id);
                this.editTask(taskId);
            });
        });

        // Delete Task Listeners
        document.querySelectorAll('.delete-task').forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = parseInt(e.currentTarget.dataset.id);
                this.deleteTask(taskId);
            });
        });
    }

    // Event Listeners Initialization
    initEventListeners() {
        // Add/Edit Task Form Submission
        document.getElementById('task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const taskData = {
                title: document.getElementById('task-title').value,
                description: document.getElementById('task-description').value,
                priority: document.getElementById('task-priority').value,
                dueDate: document.getElementById('task-due-date').value
            };

            // Check if we're editing or adding
            const editingTaskId = this.state.editingTaskId;
            if (editingTaskId) {
                this.updateTask(editingTaskId, taskData);
            } else {
                this.addTask(taskData);
            }
        });

        // Add Task Button
        document.getElementById('add-task-btn').addEventListener('click', () => {
            // Reset form and modal for new task
            document.getElementById('task-form').reset();
            document.getElementById('modal-title').textContent = 'Create New Task';
            document.getElementById('task-submit-btn').textContent = 'Create Task';
            this.setState({ editingTaskId: null });
            document.getElementById('task-modal').style.display = 'block';
        });

        // Close Modal
        document.querySelector('.close').addEventListener('click', this.closeModal.bind(this));

        // Filter and Search Listeners
        document.getElementById('status-filter').addEventListener('change', (e) => {
            this.setState({ filter: e.target.value });
        });

        document.getElementById('search-tasks').addEventListener('input', () => {
            this.render();
        });

        // Theme Toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            this.setState({ 
                darkMode: document.body.classList.contains('dark-mode') 
            });
        });
    }

    // Close Modal Method
    closeModal() {
        document.getElementById('task-modal').style.display = 'none';
        document.getElementById('task-form').reset();
    }

    // Notification Method
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }

    // Local Storage Management
    saveToLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
        localStorage.setItem('appState', JSON.stringify(this.state));
    }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});