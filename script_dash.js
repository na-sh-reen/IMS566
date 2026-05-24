let dashboardCharts = {};

document.addEventListener('DOMContentLoaded', function() {
    updateDashboardStats();
    updateDashboardCharts();
    
    window.addEventListener('storage', function(e) {
        if (e.key === 'allProjects' || e.key === 'allTasks' || e.key === 'teamMembers') {
            updateDashboardStats();
            updateDashboardCharts();
        }
    });
});

function updateDashboardStats() {
    const projects = getAllProjects();
    const tasks = getAllTasks();
    const teamMembers = JSON.parse(localStorage.getItem('teamMembers')) || [];

    const activeProjects = projects.filter(p => p.status !== 'Completed').length;
    document.getElementById('activeProjectsCount').textContent = activeProjects;

    const pendingTasks = tasks.filter(t => t.status !== 'Completed').length;
    document.getElementById('pendingTasksCount').textContent = pendingTasks;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdueTasks = tasks.filter(t => 
        t.status !== 'Completed' && 
        new Date(t.dueDate) < today
    ).length;
    document.getElementById('overdueInfo').textContent = `${overdueTasks} overdue`;

    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    document.getElementById('completedTasksCount').textContent = completedTasks;

    const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
    document.getElementById('completionRate').textContent = `${completionRate}% complete`;

    const activeMembers = teamMembers.filter(m => m.status === 'Active').length;
    document.getElementById('teamMembersCount').textContent = teamMembers.length;
    document.getElementById('activeTeamInfo').textContent = `${activeMembers} active`;
}

function updateDashboardCharts() {
    updateStatusChart();
    updatePriorityChart();
    updateProjectChart();
    updateTasksPerProjectChart();
}

function updateStatusChart() {
    const tasks = getAllTasks();
    
    const statusCounts = {
        'Not Started': tasks.filter(t => t.status === 'Not Started').length,
        'In Progress': tasks.filter(t => t.status === 'In Progress').length,
        'Testing': tasks.filter(t => t.status === 'Testing').length,
        'Completed': tasks.filter(t => t.status === 'Completed').length
    };

    const ctx = document.getElementById('statusChart');
    if (!ctx) return;
    
    const ctxContext = ctx.getContext('2d');
    
    if (dashboardCharts.statusChart) {
        dashboardCharts.statusChart.destroy();
    }

    dashboardCharts.statusChart = new Chart(ctxContext, {
        type: 'bar',
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{
                label: 'Number of Tasks',
                data: Object.values(statusCounts),
                backgroundColor: [
                    '#6c757d',
                    '#0dcaf0',
                    '#0d6efd',
                    '#198754'
                ],
                borderRadius: 5,
                borderSkipped: false
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
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function updatePriorityChart() {
    const tasks = getAllTasks();
    
    const statusCounts = {
        'Not Started': tasks.filter(t => t.status === 'Not Started').length,
        'In Progress': tasks.filter(t => t.status === 'In Progress').length,
        'Testing': tasks.filter(t => t.status === 'Testing').length,
        'Completed': tasks.filter(t => t.status === 'Completed').length
    };

    const ctx = document.getElementById('priorityChart');
    if (!ctx) return;
    
    const ctxContext = ctx.getContext('2d');
    
    if (dashboardCharts.priorityChart) {
        dashboardCharts.priorityChart.destroy();
    }

    dashboardCharts.priorityChart = new Chart(ctxContext, {
        type: 'doughnut',
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: [
                    '#6c757d',
                    '#0dcaf0',
                    '#0d6efd',
                    '#198754'
                ],
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

function updateProjectChart() {
    const projects = getAllProjects();
    
    const projectCounts = {
        'Not Started': projects.filter(p => p.status === 'Not Started').length,
        'In Progress': projects.filter(p => p.status === 'In Progress').length,
        'On Hold': projects.filter(p => p.status === 'On Hold').length,
        'Completed': projects.filter(p => p.status === 'Completed').length
    };

    const ctx = document.getElementById('projectChart');
    if (!ctx) return;
    
    const ctxContext = ctx.getContext('2d');
    
    if (dashboardCharts.projectChart) {
        dashboardCharts.projectChart.destroy();
    }

    dashboardCharts.projectChart = new Chart(ctxContext, {
        type: 'doughnut',
        data: {
            labels: Object.keys(projectCounts),
            datasets: [{
                data: Object.values(projectCounts),
                backgroundColor: [
                    '#6c757d',
                    '#0dcaf0',
                    '#ffc107',
                    '#198754'
                ],
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 11
                        },
                        padding: 10
                    }
                }
            }
        }
    });
}

function updateTasksPerProjectChart() {
    const projects = getAllProjects();
    const tasks = getAllTasks();

    const tasksPerProject = {};
    projects.forEach(project => {
        const projectTasks = tasks.filter(t => t.projectName === project.projectName);
        tasksPerProject[project.projectName] = projectTasks.length;
    });

    const sortedProjects = Object.entries(tasksPerProject)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const labels = sortedProjects.map(p => p[0].length > 15 ? p[0].substring(0, 15) + '...' : p[0]);
    const data = sortedProjects.map(p => p[1]);

    const ctx = document.getElementById('tasksPerProjectChart');
    if (!ctx) return;
    
    const ctxContext = ctx.getContext('2d');

    if (dashboardCharts.tasksPerProjectChart) {
        dashboardCharts.tasksPerProjectChart.destroy();
    }

    dashboardCharts.tasksPerProjectChart = new Chart(ctxContext, {
        type: 'bar',
        indexAxis: 'y',
        data: {
            labels: labels.length > 0 ? labels : ['No Projects'],
            datasets: [{
                label: 'Number of Tasks',
                data: data.length > 0 ? data : [0],
                backgroundColor: '#0d6efd',
                borderRadius: 5
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
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

window.addEventListener('focus', function() {
    updateDashboardStats();
    updateDashboardCharts();
});


