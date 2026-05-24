let vantaEffect = VANTA.GLOBE({
    el: "#vanta-canvas",
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.00,
    minWidth: 200.00,
    scale: 1.00,
    scaleMobile: 1.00,
    color: 0x7c3aed,
    color2: 0x6d28d9,
    backgroundColor: 0xf8f9fa
});


function getCurrentUser() {
    return localStorage.getItem('currentUser') || 'Admin User';
}

function setCurrentUser(userName) {
    localStorage.setItem('currentUser', userName);
}

function updateUserDisplay() {
    const currentUser = getCurrentUser();
    const userNameElement = document.querySelector('.fw-bold.small');
    if (userNameElement) {
        userNameElement.textContent = currentUser;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    updateUserDisplay();
    if (document.getElementById('allTasks')) {
        loadTasksFromStorage();
    }
});

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

function loadTasksFromStorage() {
    const tasks = getAllTasks();
    const currentUser = getCurrentUser();
    const allTasksTable = document.querySelector('#allTasks tbody');
    const myTasksTable = document.querySelector('#myTasks tbody');
    const highPriorityTable = document.querySelector('#highPriority tbody');
    const completedTable = document.querySelector('#completed tbody');

    if (!allTasksTable || !myTasksTable || !highPriorityTable) {
        return; 
    }

    allTasksTable.innerHTML = '';
    myTasksTable.innerHTML = '';
    highPriorityTable.innerHTML = '';
    if (completedTable) completedTable.innerHTML = '';

    tasks.forEach(task => {
        addTaskToTable(task, currentUser);
    });

    updateMyTasksAlert();
}


function addTaskToTable(task, currentUser) {
    const priorityColor = getPriorityColor(task.priority);
    const statusColor = getStatusColor(task.status);
    const allTasksBody = document.querySelector('#allTasks tbody');
    if (allTasksBody) {
        const allTaskRow = `
            <tr data-task-id="${task.id}">
                <td><strong>${task.taskName}</strong></td>
                <td>${task.projectName}</td>
                <td>
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignedTo.toLowerCase()}"
                         alt="${task.assignedTo}"
                         class="rounded-circle"
                         width="32"
                         height="32">
                    ${task.assignedTo}
                </td>
                <td><span class="badge bg-${priorityColor}">${task.priority}</span></td>
                <td>${task.dueDate}</td>
                <td><span class="badge bg-${statusColor}">${task.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-btn" title="View"><i class="bi bi-eye"></i></button>
                    <button class="btn btn-sm btn-outline-danger delete-btn" title="Delete"><i class="bi bi-trash"></i></button>
                </td>
            </tr>
        `;
        allTasksBody.innerHTML += allTaskRow;
    }

    if (task.assignedTo.toLowerCase() === currentUser.toLowerCase()) {
        const myTasksBody = document.querySelector('#myTasks tbody');
        if (myTasksBody) {
            const myTaskRow = `
                <tr data-task-id="${task.id}">
                    <td><strong>${task.taskName}</strong></td>
                    <td>${task.projectName}</td>
                    <td><span class="badge bg-${priorityColor}">${task.priority}</span></td>
                    <td>${task.dueDate}</td>
                    <td><span class="badge bg-${statusColor}">${task.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary view-btn" title="View"><i class="bi bi-eye"></i></button>
                        <button class="btn btn-sm btn-outline-danger delete-btn" title="Delete"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>
            `;
            myTasksBody.innerHTML += myTaskRow;
        }
    }

    if (task.priority === 'High') {
        const highPriorityBody = document.querySelector('#highPriority tbody');
        if (highPriorityBody) {
            const highPriorityRow = `
                <tr data-task-id="${task.id}">
                    <td><strong>${task.taskName}</strong></td>
                    <td>${task.projectName}</td>
                    <td>
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignedTo.toLowerCase()}"
                             alt="${task.assignedTo}"
                             class="rounded-circle"
                             width="32"
                             height="32">
                        ${task.assignedTo}
                    </td>
                    <td>${task.dueDate}</td>
                    <td><span class="badge bg-${statusColor}">${task.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary view-btn" title="View"><i class="bi bi-eye"></i></button>
                        <button class="btn btn-sm btn-outline-danger delete-btn" title="Delete"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>
            `;
            highPriorityBody.innerHTML += highPriorityRow;
        }
    }

    if (task.status === 'Completed') {
        const completedBody = document.querySelector('#completed tbody');
        if (completedBody) {
            const completedRow = `
                <tr data-task-id="${task.id}">
                    <td><strong>${task.taskName}</strong></td>
                    <td>${task.projectName}</td>
                    <td>
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignedTo.toLowerCase()}"
                             alt="${task.assignedTo}"
                             class="rounded-circle"
                             width="32"
                             height="32">
                        ${task.assignedTo}
                    </td>
                    <td><span class="badge bg-${priorityColor}">${task.priority}</span></td>
                    <td>${task.dueDate}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary view-btn" title="View"><i class="bi bi-eye"></i></button>
                        <button class="btn btn-sm btn-outline-danger delete-btn" title="Delete"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>
            `;
            completedBody.innerHTML += completedRow;
        }
    }

    attachViewButtonListeners();
    attachDeleteButtonListeners();
}

function updateMyTasksAlert() {
    const myTasksAlert = document.querySelector('#myTasks .alert-info');
    const myTasksBody = document.querySelector('#myTasks tbody');
    if (myTasksAlert && myTasksBody) {
        const taskCount = myTasksBody.querySelectorAll('tr').length;
        myTasksAlert.innerHTML = `<i class="bi bi-info-circle"></i> You have ${taskCount} task${taskCount !== 1 ? 's' : ''} assigned to you.`;
    }
}

function getPriorityColor(priority) {
    return priority === 'High'
        ? 'danger'
        : priority === 'Medium'
        ? 'warning text-dark'
        : 'success';
}

function getStatusColor(status) {
    return status === 'Completed'
        ? 'success'
        : status === 'In Progress'
        ? 'warning text-dark'
        : status === 'Testing'
        ? 'info'
        : 'secondary';
}

const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    let isDarkMode = localStorage.getItem('theme') === 'dark';

    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="bi bi-sun-fill"></i>';
        if (vantaEffect) {
            vantaEffect.setOptions({ backgroundColor: 0x1a1d29 });
        }
    } else {
        themeToggle.innerHTML = '<i class="bi bi-moon-fill"></i>';
    }

    themeToggle.addEventListener('click', function() {
        isDarkMode = !isDarkMode;
        document.body.classList.toggle('dark-mode');
        
        if (isDarkMode) {
            themeToggle.innerHTML = '<i class="bi bi-sun-fill"></i>';
            localStorage.setItem('theme', 'dark');
            if (vantaEffect) {
                vantaEffect.setOptions({ backgroundColor: 0x1a1d29 });
            }
        } else {
            themeToggle.innerHTML = '<i class="bi bi-moon-fill"></i>';
            localStorage.setItem('theme', 'light');
            if (vantaEffect) {
                vantaEffect.setOptions({ backgroundColor: 0xf8f9fa });
            }
        }
    });
}

const signoutBtn = document.getElementById('signoutBtn');
if (signoutBtn) {
    signoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to sign out?')) {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        }
    });
}

const navbarToggler = document.querySelector('.navbar-toggler');
if (navbarToggler) {
    navbarToggler.addEventListener('click', function() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.toggle('show');
    });
}

document.querySelectorAll('.sidebar .nav-link').forEach(link => {
    link.addEventListener('click', function() {
        if (window.innerWidth < 768) {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) sidebar.classList.remove('show');
        }
    });
});

window.addEventListener('resize', () => {
    if (vantaEffect) {
        vantaEffect.resize();
    }
    if (window.innerWidth >= 768) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.remove('show');
    }
});

const chartColors = {
    primary: '#7c3aed',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6'
};

let isDarkMode = localStorage.getItem('theme') === 'dark';

// Weekly Task Progress Chart
const weeklyCtx = document.getElementById('weeklyChart')?.getContext('2d');
if (weeklyCtx) {
    new Chart(weeklyCtx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Completed',
                    data: [12, 19, 15, 25, 22, 30, 28],
                    borderColor: chartColors.success,
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointBackgroundColor: chartColors.success,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                },
                {
                    label: 'Pending',
                    data: [8, 12, 10, 15, 18, 12, 14],
                    borderColor: chartColors.warning,
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointBackgroundColor: chartColors.warning,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12,
                            weight: '600'
                        }
                    }
                },
                filler: {
                    propagate: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false,
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: isDarkMode ? '#a0aec0' : '#6b7280'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: isDarkMode ? '#a0aec0' : '#6b7280'
                    }
                }
            }
        }
    });
}

const statusCtx = document.getElementById('statusChart')?.getContext('2d');
if (statusCtx) {
    new Chart(statusCtx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'In Progress', 'Pending', 'On Hold'],
            datasets: [{
                data: [156, 98, 28, 15],
                backgroundColor: [
                    chartColors.success,
                    chartColors.primary,
                    chartColors.warning,
                    chartColors.info
                ],
                borderColor: isDarkMode ? '#1f2937' : '#fff',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 12,
                            weight: '600'
                        },
                        color: isDarkMode ? '#a0aec0' : '#6b7280'
                    }
                }
            }
        }
    });
}

const projectCtx = document.getElementById('projectChart')?.getContext('2d');
if (projectCtx) {
    new Chart(projectCtx, {
        type: 'bar',
        data: {
            labels: ['Website', 'Mobile App', 'Backend', 'Frontend', 'DevOps'],
            datasets: [{
                label: 'Tasks',
                data: [32, 28, 25, 35, 18],
                backgroundColor: chartColors.primary,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: isDarkMode ? '#a0aec0' : '#6b7280'
                    }
                },
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: isDarkMode ? '#a0aec0' : '#6b7280'
                    }
                }
            }
        }
    });
}

const performanceCtx = document.getElementById('performanceChart')?.getContext('2d');
if (performanceCtx) {
    new Chart(performanceCtx, {
        type: 'radar',
        data: {
            labels: ['Productivity', 'Quality', 'Communication', 'Teamwork', 'Innovation'],
            datasets: [{
                label: 'Team Performance',
                data: [85, 90, 75, 88, 80],
                borderColor: chartColors.primary,
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                pointBackgroundColor: chartColors.primary,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: isDarkMode ? '#a0aec0' : '#6b7280'
                    }
                }
            }
        }
    });
}

const monthlyCtx = document.getElementById('monthlyChart')?.getContext('2d');
if (monthlyCtx) {
    new Chart(monthlyCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Tasks Completed',
                data: [45, 52, 48, 65, 72, 68],
                borderColor: chartColors.success,
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 5,
                pointBackgroundColor: chartColors.success,
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: isDarkMode ? '#a0aec0' : '#6b7280',
                        font: {
                            weight: '600'
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: isDarkMode ? '#a0aec0' : '#6b7280'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: isDarkMode ? '#a0aec0' : '#6b7280'
                    }
                }
            }
        }
    });
}

const workloadCtx = document.getElementById('workloadChart')?.getContext('2d');
if (workloadCtx) {
    new Chart(workloadCtx, {
        type: 'bar',
        data: {
            labels: ['John', 'Sarah', 'Mike', 'Emma', 'Alex'],
            datasets: [
                {
                    label: 'Completed',
                    data: [45, 52, 38, 41, 35],
                    backgroundColor: chartColors.success,
                    borderRadius: 8,
                    borderSkipped: false
                },
                {
                    label: 'In Progress',
                    data: [20, 18, 25, 22, 28],
                    backgroundColor: chartColors.primary,
                    borderRadius: 8,
                    borderSkipped: false
                },
                {
                    label: 'Pending',
                    data: [8, 12, 10, 15, 18],
                    backgroundColor: chartColors.warning,
                    borderRadius: 8,
                    borderSkipped: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        color: isDarkMode ? '#a0aec0' : '#6b7280',
                        font: {
                            weight: '600'
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    stacked: false,
                    grid: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: isDarkMode ? '#a0aec0' : '#6b7280'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: isDarkMode ? '#a0aec0' : '#6b7280'
                    }
                }
            }
        }
    });
}

function attachViewButtonListeners() {
    document.querySelectorAll('.view-btn').forEach(button => {
        button.removeEventListener('click', handleViewClick);
        button.addEventListener('click', handleViewClick);
    });
}

function handleViewClick() {
    const row = this.closest('tr');
    const cells = row.querySelectorAll('td');

    const viewTaskName = document.getElementById('viewTaskName');
    const viewProject = document.getElementById('viewProject');
    const viewAssigned = document.getElementById('viewAssigned');
    const viewPriority = document.getElementById('viewPriority');
    const viewDate = document.getElementById('viewDate');
    const viewStatus = document.getElementById('viewStatus');

    if (viewTaskName) viewTaskName.textContent = cells[0].innerText;
    if (viewProject) viewProject.textContent = cells[1].innerText;
    if (viewAssigned) viewAssigned.textContent = cells[2].innerText;
    if (viewPriority) viewPriority.textContent = cells[3].innerText;
    if (viewDate) viewDate.textContent = cells[4].innerText;
    if (viewStatus) viewStatus.textContent = cells[5].innerText;

    const viewTaskModal = document.getElementById('viewTaskModal');
    if (viewTaskModal) {
        const modal = new bootstrap.Modal(viewTaskModal);
        modal.show();
    }
}

function attachDeleteButtonListeners() {
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.removeEventListener('click', handleDeleteClick);
        button.addEventListener('click', handleDeleteClick);
    });
}

function handleDeleteClick() {
    if (confirm('Are you sure you want to delete this task?')) {
        const row = this.closest('tr');
        const taskId = parseInt(row.getAttribute('data-task-id'));

        deleteTaskFromStorage(taskId);

        loadTasksFromStorage();

        alert('Task deleted successfully!');
    }
}


const createBtn = document.getElementById('createTaskBtn');

if (createBtn) {
    createBtn.addEventListener('click', function () {
        const taskName = document.getElementById('taskName').value.trim();
        const projectName = document.getElementById('projectName').value.trim();
        const assignedTo = document.getElementById('assignedTo').value.trim();
        const priority = document.getElementById('taskPriority').value;
        const dueDate = document.getElementById('taskDate').value;
        const status = document.getElementById('taskStatus').value;

        if (!taskName || !projectName || !assignedTo || !dueDate) {
            alert("Please fill all fields.");
            return;
        }

        const newTask = {
            taskName: taskName,
            projectName: projectName,
            assignedTo: assignedTo,
            priority: priority,
            dueDate: dueDate,
            status: status
        };

        addTaskToStorage(newTask);

        loadTasksFromStorage();

        alert("Task created successfully!");

        const modal = bootstrap.Modal.getInstance(document.getElementById('newTaskModal'));
        if (modal) modal.hide();
        document.getElementById('taskForm').reset();
    });
}

