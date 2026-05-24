
function getAllProjects() {
    const projects = localStorage.getItem('allProjects');
    return projects ? JSON.parse(projects) : [];
}

function saveProjectsToStorage(projects) {
    localStorage.setItem('allProjects', JSON.stringify(projects));
}

function addProjectToStorage(project) {
    const projects = getAllProjects();
    project.id = Date.now(); 
    projects.push(project);
    saveProjectsToStorage(projects);
}

function deleteProjectFromStorage(projectId) {
    let projects = getAllProjects();
    projects = projects.filter(project => project.id !== projectId);
    saveProjectsToStorage(projects);
}

function updateProjectInStorage(projectId, updatedProject) {
    let projects = getAllProjects();
    projects = projects.map(project =>
        project.id === projectId ? { ...project, ...updatedProject } : project
    );
    saveProjectsToStorage(projects);
}

function getProjectPriorityColor(priority) {
    return priority === 'High'
        ? 'danger'
        : priority === 'Medium'
        ? 'warning'
        : 'success';
}

function getProjectStatusColor(status) {
    return status === 'Completed'
        ? 'success'
        : status === 'In Progress'
        ? 'primary'
        : status === 'On Hold'
        ? 'warning'
        : 'secondary';
}

function calculateProjectProgress(projectName) {
    const tasks = getAllTasks();
    const linkedTasks = tasks.filter(task => 
        task.projectName.toLowerCase() === projectName.toLowerCase()
    );
    
    if (linkedTasks.length === 0) return 0;
    
    const completedTasks = linkedTasks.filter(task => task.status === 'Completed').length;
    return Math.round((completedTasks / linkedTasks.length) * 100);
}

function getProgressColor(progress) {
    if (progress < 33) return 'danger';   
    if (progress < 66) return 'warning';  
    return 'success';                        
}

function getLinkedTasks(projectName) {
    const tasks = getAllTasks();
    return tasks.filter(task =>
        task.projectName.toLowerCase() === projectName.toLowerCase()
    );
}

function loadProjectsFromStorage() {
    const projects = getAllProjects();
    const container = document.querySelector('.projects-container');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    if (projects.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info text-center py-5">
                    <i class="bi bi-inbox"></i>
                    <p class="mt-2">No projects yet. Create your first project to get started!</p>
                </div>
            </div>
        `;
        return;
    }
    
    projects.forEach(project => {
        const progress = calculateProjectProgress(project.projectName);
        const linkedTasks = getLinkedTasks(project.projectName);
        const priorityColor = getProjectPriorityColor(project.priority);
        const progressColor = getProgressColor(progress);
        
        const projectCard = `
            <div class="col-md-6 col-lg-4">
                <div class="card project-card h-100 shadow-sm border-0 rounded-3">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h5 class="card-title fw-bold">${project.projectName}</h5>
                                <p class="card-text text-muted small">${project.description || 'No description'}</p>
                            </div>
                            <span class="badge bg-${priorityColor}">${project.priority}</span>
                        </div>
                        
                        <div class="mb-3">
                            <div class="d-flex justify-content-between mb-2">
                                <small class="text-muted">Progress</small>
                                <small class="fw-bold">${progress}%</small>
                            </div>
                            <div class="progress" style="height: 8px;">
                                <div class="progress-bar bg-${progressColor}" style="width: ${progress}%"></div>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <div class="d-flex gap-2 flex-wrap">
                                <span class="badge bg-info text-dark">${linkedTasks.length} Tasks</span>
                                <span class="badge bg-light text-dark">${progress}% Done</span>
                            </div>
                        </div>
                        
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <small class="text-muted">
                                <i class="bi bi-calendar"></i> Due: ${project.dueDate}
                            </small>
                        </div>
                        
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-outline-primary view-project-btn w-100" data-project-id="${project.id}">
                                <i class="bi bi-eye"></i> View
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML += projectCard;
    });
    
    attachProjectEventListeners();
    applyDashboardFilter();
}

function applyDashboardFilter() {
    const filter = sessionStorage.getItem('projectFilter');
    
    if (!filter) return;

    showToast('Filter applied: ' + filter, 'info');
    sessionStorage.removeItem('projectFilter');
}

document.addEventListener('DOMContentLoaded', function() {
    loadProjectsFromStorage();
});

const createProjectBtn = document.getElementById('createProjectBtn');

if (createProjectBtn) {
    createProjectBtn.addEventListener('click', function () {
        const projectName = document.getElementById('projectName').value.trim();
        const projectDesc = document.getElementById('projectDesc').value.trim();
        const projectPriority = document.getElementById('projectPriority').value;
        const projectStartDate = document.getElementById('projectStartDate').value;
        const projectDueDate = document.getElementById('projectDueDate').value;

        if (!projectName || !projectStartDate || !projectDueDate) {
            showToast('Please fill all required fields (Project Name, Start Date, Due Date).', 'danger');
            return;
        }

        if (new Date(projectStartDate) > new Date(projectDueDate)) {
            showToast('Start Date must be before Due Date.', 'danger');
            return;
        }

        const newProject = {
            projectName: projectName,
            description: projectDesc,
            priority: projectPriority,
            status: 'Not Started',
            startDate: projectStartDate,
            dueDate: projectDueDate,
            createdAt: new Date().toLocaleDateString()
        };

        addProjectToStorage(newProject);
        loadProjectsFromStorage();
        showToast('Project created successfully!', 'success');
        const modal = bootstrap.Modal.getInstance(document.getElementById('newProjectModal'));
        if (modal) modal.hide();
        document.getElementById('projectForm').reset();
    });
}

function attachProjectEventListeners() {
    document.querySelectorAll('.view-project-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const projectId = parseInt(this.getAttribute('data-project-id'));
            viewProject(projectId);
        });
    });
}

function viewProject(projectId) {
    const projects = getAllProjects();
    const project = projects.find(p => p.id === projectId);

    if (!project) return;

    const progress = calculateProjectProgress(project.projectName);
    const progressColor = getProgressColor(progress);
    const linkedTasks = getLinkedTasks(project.projectName);
    const priorityBadge = `<span class="badge bg-${getProjectPriorityColor(project.priority)}">${project.priority}</span>`;

    document.getElementById('viewProjectName').textContent = project.projectName;
    document.getElementById('viewProjectDesc').textContent = project.description || 'No description';
    document.getElementById('viewProjectPriority').innerHTML = priorityBadge;
    document.getElementById('viewProjectStartDate').textContent = project.startDate;
    document.getElementById('viewProjectDueDate').textContent = project.dueDate;
    document.getElementById('viewProjectProgress').innerHTML = `
        <div class="progress" style="height: 24px;">
            <div class="progress-bar bg-${progressColor}" style="width: ${progress}%">
                <small class="text-white fw-bold">${progress}%</small>
            </div>
        </div>
    `;
    document.getElementById('viewProjectTasksCount').textContent = linkedTasks.length;

    const tasksHtml = linkedTasks.length > 0
        ? linkedTasks.map(task => `
            <div class="badge bg-light text-dark me-2 mb-2 p-2">
                <i class="bi bi-check-circle"></i> ${task.taskName}
            </div>
        `).join('')
        : '<span class="text-muted">No tasks linked to this project yet.</span>';

    document.getElementById('viewProjectTasks').innerHTML = tasksHtml;

    window.currentProjectId = projectId;

    document.getElementById('editProjectFromViewBtn').onclick = function() {
        openEditModal(projectId);
    };

    document.getElementById('deleteProjectFromViewBtn').onclick = function() {
        deleteProject(projectId);
    };

    const modal = new bootstrap.Modal(document.getElementById('viewProjectModal'));
    modal.show();
}

function openEditModal(projectId) {
    const projects = getAllProjects();
    const project = projects.find(p => p.id === projectId);

    if (!project) return;

    document.getElementById('editProjectId').value = projectId;
    document.getElementById('editProjectName').value = project.projectName;
    document.getElementById('editProjectDesc').value = project.description || '';
    document.getElementById('editProjectPriority').value = project.priority;
    document.getElementById('editProjectStartDate').value = project.startDate;
    document.getElementById('editProjectDueDate').value = project.dueDate;

    const viewModal = bootstrap.Modal.getInstance(document.getElementById('viewProjectModal'));
    if (viewModal) viewModal.hide();

    const modal = new bootstrap.Modal(document.getElementById('editProjectModal'));
    modal.show();
}

const editProjectBtn = document.getElementById('editProjectBtn');

if (editProjectBtn) {
    editProjectBtn.addEventListener('click', function () {
        const projectId = parseInt(document.getElementById('editProjectId').value);
        const projectName = document.getElementById('editProjectName').value.trim();
        const projectDesc = document.getElementById('editProjectDesc').value.trim();
        const projectPriority = document.getElementById('editProjectPriority').value;
        const projectStartDate = document.getElementById('editProjectStartDate').value;
        const projectDueDate = document.getElementById('editProjectDueDate').value;

        // Validation
        if (!projectName || !projectStartDate || !projectDueDate) {
            showToast('Please fill all required fields.', 'danger');
            return;
        }

        if (new Date(projectStartDate) > new Date(projectDueDate)) {
            showToast('Start Date must be before Due Date.', 'danger');
            return;
        }

        const updatedProject = {
            projectName: projectName,
            description: projectDesc,
            priority: projectPriority,
            startDate: projectStartDate,
            dueDate: projectDueDate
        };

        updateProjectInStorage(projectId, updatedProject);
        loadProjectsFromStorage();

        showToast('Project updated successfully!', 'success');

        const modal = bootstrap.Modal.getInstance(document.getElementById('editProjectModal'));
        if (modal) modal.hide();
    });
}

function deleteProject(projectId) {
    if (confirm('Are you sure you want to delete this project?')) {
        deleteProjectFromStorage(projectId);
        loadProjectsFromStorage();
        showToast('Project deleted successfully!', 'danger');

        const viewModal = bootstrap.Modal.getInstance(document.getElementById('viewProjectModal'));
        if (viewModal) viewModal.hide();
    }
}
function showToast(message, type) {
    const toastHTML = `
        <div class="alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3" style="z-index: 9999; width: auto; max-width: 400px;" role="alert">
            <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'info-circle'}"></i> ${message}
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

