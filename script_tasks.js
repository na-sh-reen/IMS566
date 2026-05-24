
function getAllTasks() {
    const tasks = localStorage.getItem('allTasks');
    return tasks ? JSON.parse(tasks) : [];
}

function saveTasksToStorage(tasks) {
    localStorage.setItem('allTasks', JSON.stringify(tasks));
}

function addTaskToStorage(task) {
    const tasks = getAllTasks();
    task.id = Date.now(); 
    tasks.push(task);
    saveTasksToStorage(tasks);
}

function deleteTaskFromStorage(taskId) {
    let tasks = getAllTasks();
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasksToStorage(tasks);
}

function updateTaskInStorage(taskId, updatedTask) {
    let tasks = getAllTasks();
    tasks = tasks.map(task =>
        task.id === taskId ? { ...task, ...updatedTask } : task
    );
    saveTasksToStorage(tasks);
}

function getTaskPriorityColor(priority) {
    return priority === 'High'
        ? 'danger'
        : priority === 'Medium'
        ? 'warning'
        : 'success';
}

function getTaskStatusColor(status) {
    return status === 'Completed'
        ? 'success'
        : status === 'In Progress'
        ? 'primary'
        : status === 'Testing'
        ? 'info'
        : 'secondary';
}

function loadTasksFromStorage() {
    const tasks = getAllTasks();
    const allTasksBody = document.getElementById('allTasksBody');
    const myTasksBody = document.getElementById('myTasksBody');
    const highPriorityBody = document.getElementById('highPriorityBody');
    const completedBody = document.getElementById('completedBody');

    if (allTasksBody) allTasksBody.innerHTML = '';
    if (myTasksBody) myTasksBody.innerHTML = '';
    if (highPriorityBody) highPriorityBody.innerHTML = '';
    if (completedBody) completedBody.innerHTML = '';

    if (tasks.length === 0) {
        if (allTasksBody) allTasksBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No tasks yet. Create your first task!</td></tr>';
        if (myTasksBody) myTasksBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No tasks assigned to you.</td></tr>';
        if (highPriorityBody) highPriorityBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No high priority tasks.</td></tr>';
        if (completedBody) completedBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No completed tasks.</td></tr>';
        return;
    }

    tasks.forEach(task => {
        // All Tasks Tab
        if (allTasksBody) {
            const row = createTaskRow(task, 'all');
            allTasksBody.appendChild(row);
        }

        if (myTasksBody) {
            const row = createTaskRow(task, 'my');
            myTasksBody.appendChild(row);
        }

        if (task.priority === 'High' && highPriorityBody) {
            const row = createTaskRow(task, 'high');
            highPriorityBody.appendChild(row);
        }

        if (task.status === 'Completed' && completedBody) {
            const row = createTaskRow(task, 'completed');
            completedBody.appendChild(row);
        }
    });

    attachTaskEventListeners();
    applyDashboardFilter();
}

function createTaskRow(task, type = 'all') {
    const row = document.createElement('tr');

    const priorityColor = getTaskPriorityColor(task.priority);
    const statusColor = getTaskStatusColor(task.status);

    let rowHTML = `
        <td><strong>${task.taskName}</strong></td>
        <td>${task.projectName || 'No Project'}</td>
    `;

    if (type !== 'my' && type !== 'completed') {
        rowHTML += `<td>${task.assignedTo}</td>`;
    }

    if (type !== 'completed') {
        rowHTML += `<td><span class="badge bg-${priorityColor}">${task.priority}</span></td>`;
    }

    rowHTML += `
        <td>${task.dueDate}</td>
        <td><span class="badge bg-${statusColor}">${task.status}</span></td>
        <td>
            <button class="btn btn-sm btn-outline-primary view-task-btn" data-task-id="${task.id}">
                <i class="bi bi-eye"></i> View
            </button>
        </td>
    `;

    row.innerHTML = rowHTML;
    return row;
}

function applyDashboardFilter() {
    const filter = sessionStorage.getItem('taskFilter');
    
    if (!filter) return;

    const allTasksTab = document.querySelector('button[data-bs-target="#allTasks"]');
    const myTasksTab = document.querySelector('button[data-bs-target="#myTasks"]');
    const highPriorityTab = document.querySelector('button[data-bs-target="#highPriority"]');
    const completedTab = document.querySelector('button[data-bs-target="#completed"]');

    if (filter === 'pending') {
        if (allTasksTab) allTasksTab.click();
        showToast('Showing pending tasks', 'info');
    } else if (filter === 'completed') {
        if (completedTab) completedTab.click();
        showToast('Showing completed tasks', 'info');
    } else if (filter === 'high') {
        if (highPriorityTab) highPriorityTab.click();
        showToast('Showing high priority tasks', 'info');
    }
    sessionStorage.setItem('taskFilter', 'all');
window.location.href = 'tasks.html';
}

function populateProjectDropdown() {
    const projects = getAllProjects();
    const projectSelect = document.getElementById('projectName');
    const editProjectSelect = document.getElementById('editProjectName');

    const clearOptions = (selectElement) => {
        while (selectElement.options.length > 1) {
            selectElement.remove(1);
        }
    };

    if (projectSelect) clearOptions(projectSelect);
    if (editProjectSelect) clearOptions(editProjectSelect);

    projects.forEach(project => {
        if (projectSelect) {
            const option1 = document.createElement('option');
            option1.value = project.projectName;
            option1.textContent = project.projectName;
            projectSelect.appendChild(option1);
        }

        if (editProjectSelect) {
            const option2 = document.createElement('option');
            option2.value = project.projectName;
            option2.textContent = project.projectName;
            editProjectSelect.appendChild(option2);
        }
    });

    if (projects.length === 0) {
        if (projectSelect) {
            const noProjectsOption1 = document.createElement('option');
            noProjectsOption1.value = '';
            noProjectsOption1.textContent = 'No projects available';
            noProjectsOption1.disabled = true;
            projectSelect.appendChild(noProjectsOption1);
        }

        if (editProjectSelect) {
            const noProjectsOption2 = document.createElement('option');
            noProjectsOption2.value = '';
            noProjectsOption2.textContent = 'No projects available';
            noProjectsOption2.disabled = true;
            editProjectSelect.appendChild(noProjectsOption2);
        }
    }
}

function populateTeamMemberDropdown() {
    const teamMembers = JSON.parse(localStorage.getItem('teamMembers')) || [];
    const assignedToSelect = document.getElementById('assignedTo');
    const editAssignedToSelect = document.getElementById('editAssignedTo');
    const clearOptions = (selectElement) => {
        while (selectElement.options.length > 1) {
            selectElement.remove(1);
        }
    };

    if (assignedToSelect) clearOptions(assignedToSelect);
    if (editAssignedToSelect) clearOptions(editAssignedToSelect);

    teamMembers.forEach(member => {
        if (assignedToSelect) {
            const option1 = document.createElement('option');
            option1.value = member.name;
            option1.textContent = `${member.name} (${member.role})`;
            assignedToSelect.appendChild(option1);
        }

        if (editAssignedToSelect) {
            const option2 = document.createElement('option');
            option2.value = member.name;
            option2.textContent = `${member.name} (${member.role})`;
            editAssignedToSelect.appendChild(option2);
        }
    });

    if (teamMembers.length === 0) {
        if (assignedToSelect) {
            const noMembersOption1 = document.createElement('option');
            noMembersOption1.value = '';
            noMembersOption1.textContent = 'No team members available';
            noMembersOption1.disabled = true;
            assignedToSelect.appendChild(noMembersOption1);
        }

        if (editAssignedToSelect) {
            const noMembersOption2 = document.createElement('option');
            noMembersOption2.value = '';
            noMembersOption2.textContent = 'No team members available';
            noMembersOption2.disabled = true;
            editAssignedToSelect.appendChild(noMembersOption2);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    populateProjectDropdown();
    populateTeamMemberDropdown();
    loadTasksFromStorage();
});

const createTaskBtn = document.getElementById('createTaskBtn');

if (createTaskBtn) {
    createTaskBtn.addEventListener('click', function () {
        const taskName = document.getElementById('taskName').value.trim();
        const projectName = document.getElementById('projectName').value.trim();
        const assignedTo = document.getElementById('assignedTo').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const priority = document.getElementById('taskPriority').value;
        const dueDate = document.getElementById('taskDate').value;
        const status = document.getElementById('taskStatus').value;

        if (!taskName || !projectName || !assignedTo || !dueDate) {
            showToast('Please fill all required fields', 'danger');
            return;
        }

        const newTask = {
            taskName: taskName,
            projectName: projectName,
            assignedTo: assignedTo,
            description: description,
            priority: priority,
            dueDate: dueDate,
            status: status,
            createdAt: new Date().toLocaleDateString()
        };

        addTaskToStorage(newTask);

        loadTasksFromStorage();

        showToast('Task created successfully!', 'success');

        const modal = bootstrap.Modal.getInstance(document.getElementById('newTaskModal'));
        if (modal) modal.hide();
        document.getElementById('taskForm').reset();
    });
}

function attachTaskEventListeners() {
    document.querySelectorAll('.view-task-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const taskId = parseInt(this.getAttribute('data-task-id'));
            viewTask(taskId);
        });
    });
}

function viewTask(taskId) {
    const tasks = getAllTasks();
    const task = tasks.find(t => t.id === taskId);

    if (!task) return;

    const priorityBadge = `<span class="badge bg-${getTaskPriorityColor(task.priority)}">${task.priority}</span>`;
    const statusBadge = `<span class="badge bg-${getTaskStatusColor(task.status)}">${task.status}</span>`;

    const viewTaskName = document.getElementById('viewTaskName');
    const viewProject = document.getElementById('viewProject');
    const viewAssigned = document.getElementById('viewAssigned');
    const viewPriority = document.getElementById('viewPriority');
    const viewDate = document.getElementById('viewDate');
    const viewStatus = document.getElementById('viewStatus');
    const viewDescription = document.getElementById('viewDescription');

    if (viewTaskName) viewTaskName.textContent = task.taskName;
    if (viewProject) viewProject.textContent = task.projectName || 'No Project';
    if (viewAssigned) viewAssigned.textContent = task.assignedTo;
    if (viewPriority) viewPriority.innerHTML = priorityBadge;
    if (viewDate) viewDate.textContent = task.dueDate;
    if (viewStatus) viewStatus.innerHTML = statusBadge;
    if (viewDescription) viewDescription.textContent = task.description || 'No description';

    window.currentTaskId = taskId;

    const modal = new bootstrap.Modal(document.getElementById('viewTaskModal'));
    modal.show();

    const editBtn = document.getElementById('editTaskFromViewBtn');
    const deleteBtn = document.getElementById('deleteTaskFromViewBtn');

    if (editBtn) {
        editBtn.onclick = function() {
            editTask(taskId);
        };
    }

    if (deleteBtn) {
        deleteBtn.onclick = function() {
            deleteTask(taskId);
        };
    }
}

function editTask(taskId) {
    const tasks = getAllTasks();
    const task = tasks.find(t => t.id === taskId);

    if (!task) return;

    document.getElementById('editTaskId').value = taskId;
    document.getElementById('editTaskName').value = task.taskName;
    document.getElementById('editProjectName').value = task.projectName;
    document.getElementById('editAssignedTo').value = task.assignedTo;
    document.getElementById('editTaskDescription').value = task.description || '';
    document.getElementById('editTaskPriority').value = task.priority;
    document.getElementById('editTaskDate').value = task.dueDate;
    document.getElementById('editTaskStatus').value = task.status;

    const viewModal = bootstrap.Modal.getInstance(document.getElementById('viewTaskModal'));
    if (viewModal) viewModal.hide();

    const modal = new bootstrap.Modal(document.getElementById('editTaskModal'));
    modal.show();
}

const editTaskBtn = document.getElementById('editTaskBtn');

if (editTaskBtn) {
    editTaskBtn.addEventListener('click', function () {
        const taskId = parseInt(document.getElementById('editTaskId').value);
        const taskName = document.getElementById('editTaskName').value.trim();
        const projectName = document.getElementById('editProjectName').value.trim();
        const assignedTo = document.getElementById('editAssignedTo').value.trim();
        const description = document.getElementById('editTaskDescription').value.trim();
        const priority = document.getElementById('editTaskPriority').value;
        const dueDate = document.getElementById('editTaskDate').value;
        const status = document.getElementById('editTaskStatus').value;

        if (!taskName || !projectName || !assignedTo || !dueDate) {
            showToast('Please fill all required fields', 'danger');
            return;
        }

        const updatedTask = {
            taskName: taskName,
            projectName: projectName,
            assignedTo: assignedTo,
            description: description,
            priority: priority,
            dueDate: dueDate,
            status: status
        };

        updateTaskInStorage(taskId, updatedTask);
        loadTasksFromStorage();

        showToast('Task updated successfully!', 'success');

        const modal = bootstrap.Modal.getInstance(document.getElementById('editTaskModal'));
        if (modal) modal.hide();
    });
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        deleteTaskFromStorage(taskId);
        loadTasksFromStorage();
        showToast('Task deleted successfully!', 'danger');

        const viewModal = bootstrap.Modal.getInstance(document.getElementById('viewTaskModal'));
        if (viewModal) viewModal.hide();
    }
}

function showToast(message, type) {
    const toastHTML = `
        <div class="alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3" style="z-index: 9999; width: auto; max-width: 400px;" role="alert">
            <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'danger' ? 'trash' : 'info-circle'}"></i> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', toastHTML);
    
    setTimeout(() => {
        const alerts = document.querySelectorAll('.alert');
        if (alerts.length > 0) {
            alerts[0].remove();
        }
    }, 4000);
}



