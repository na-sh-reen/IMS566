let teamMembers = JSON.parse(localStorage.getItem('teamMembers')) || [];
let currentEditingMemberId = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeTeamPage();
    setupEventListeners();
});

function initializeTeamPage() {
    renderTeamMembers();
}

function setupEventListeners() {
    const addTeamMemberBtn = document.getElementById('addTeamMemberBtn');
    if (addTeamMemberBtn) {
        addTeamMemberBtn.addEventListener('click', addTeamMember);
    }

    const editMemberBtn = document.getElementById('editMemberBtn');
    if (editMemberBtn) {
        editMemberBtn.addEventListener('click', openEditModal);
    }

    const deleteMemberBtn = document.getElementById('deleteMemberBtn');
    if (deleteMemberBtn) {
        deleteMemberBtn.addEventListener('click', deleteTeamMember);
    }

    const saveTeamMemberBtn = document.getElementById('saveTeamMemberBtn');
    if (saveTeamMemberBtn) {
        saveTeamMemberBtn.addEventListener('click', saveTeamMemberChanges);
    }

    const teamMemberForm = document.getElementById('teamMemberForm');
    if (teamMemberForm) {
        const addModal = document.getElementById('newTeamMemberModal');
        if (addModal) {
            addModal.addEventListener('hidden.bs.modal', function() {
                teamMemberForm.reset();
            });
        }
    }
}

function renderTeamMembers() {
    const tableBody = document.getElementById('teamTableBody');
    const emptyState = document.getElementById('emptyTeamState');

    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (teamMembers.length === 0) {
        tableBody.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    tableBody.style.display = 'table-body';
    emptyState.style.display = 'none';

    teamMembers.forEach(member => {
        const row = createTeamMemberRow(member);
        tableBody.appendChild(row);
    });
}

function createTeamMemberRow(member) {
    const row = document.createElement('tr');

    let statusBadgeClass = 'bg-success';
    if (member.status === 'Inactive') statusBadgeClass = 'bg-danger';
    if (member.status === 'On Leave') statusBadgeClass = 'bg-warning';

    row.innerHTML = `
        <td>
            <div class="d-flex align-items-center gap-2">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${member.email}" alt="${member.name}" class="rounded-circle" width="36" height="36">
                <div>
                    <div class="fw-bold">${escapeHtml(member.name)}</div>
                    <div class="text-muted small">${escapeHtml(member.email)}</div>
                </div>
            </div>
        </td>
        <td>${escapeHtml(member.role)}</td>
        <td>${escapeHtml(member.department)}</td>
        <td>
            <span class="badge bg-light text-dark">${member.tasksAssigned || 0}</span>
        </td>
        <td>
            <span class="badge ${statusBadgeClass}">${member.status}</span>
        </td>
        <td>
            <button class="btn btn-sm btn-outline-primary" onclick="viewTeamMember('${member.id}')">
                <i class="bi bi-eye"></i> View
            </button>
        </td>
    `;

    return row;
}

function addTeamMember() {
    const name = document.getElementById('memberName').value.trim();
    const email = document.getElementById('memberEmail').value.trim();
    const role = document.getElementById('memberRole').value.trim();
    const department = document.getElementById('memberDepartment').value;
    const status = document.getElementById('memberStatus').value;

    if (!name || !email || !role || !department || !status) {
        alert('Please fill in all required fields');
        return;
    }

    if (teamMembers.some(member => member.email === email)) {
        alert('This email address is already in use');
        return;
    }

    if (!isValidEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }

    const newMember = {
        id: generateUniqueId(),
        name: name,
        email: email,
        role: role,
        department: department,
        status: status,
        tasksAssigned: 0,
        joinDate: new Date().toISOString().split('T')[0]
    };

    teamMembers.push(newMember);
    saveTeamMembersToLocalStorage();

    document.getElementById('teamMemberForm').reset();

    const modal = bootstrap.Modal.getInstance(document.getElementById('newTeamMemberModal'));
    if (modal) modal.hide();

    renderTeamMembers();

    showNotification('Team member added successfully!', 'success');
}

function viewTeamMember(memberId) {
    const member = teamMembers.find(m => m.id === memberId);

    if (!member) {
        alert('Team member not found');
        return;
    }

    document.getElementById('viewMemberAvatar').src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.email}`;
    document.getElementById('viewMemberName').textContent = member.name;
    document.getElementById('viewMemberEmail').textContent = member.email;
    document.getElementById('viewMemberRole').textContent = member.role;
    document.getElementById('viewMemberDept').textContent = member.department;

    const statusSpan = document.getElementById('viewMemberStatus');
    statusSpan.textContent = member.status;
    statusSpan.className = 'badge';
    if (member.status === 'Active') statusSpan.classList.add('bg-success');
    if (member.status === 'Inactive') statusSpan.classList.add('bg-danger');
    if (member.status === 'On Leave') statusSpan.classList.add('bg-warning');

    populateMemberTasks(memberId);

    currentEditingMemberId = memberId;

    const modal = new bootstrap.Modal(document.getElementById('viewTeamMemberModal'));
    modal.show();
}

function populateMemberTasks(memberId) {
    const tasksContainer = document.getElementById('viewMemberTasks');
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const memberTasks = tasks.filter(task => task.assignedTo === memberId);

    if (memberTasks.length === 0) {
        tasksContainer.innerHTML = '<p class="text-muted">No tasks assigned</p>';
        return;
    }

    let tasksHTML = '<div class="list-group">';
    memberTasks.forEach(task => {
        tasksHTML += `
            <div class="list-group-item">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h6>${escapeHtml(task.title)}</h6>
                        <p class="text-muted small mb-0">${escapeHtml(task.description || 'No description')}</p>
                    </div>
                    <span class="badge bg-primary">${task.priority || 'Medium'}</span>
                </div>
            </div>
        `;
    });
    tasksHTML += '</div>';

    tasksContainer.innerHTML = tasksHTML;
}

function openEditModal() {
    const member = teamMembers.find(m => m.id === currentEditingMemberId);

    if (!member) {
        alert('Team member not found');
        return;
    }

    document.getElementById('editMemberName').value = member.name;
    document.getElementById('editMemberEmail').value = member.email;
    document.getElementById('editMemberRole').value = member.role;
    document.getElementById('editMemberDepartment').value = member.department;
    document.getElementById('editMemberStatus').value = member.status;

    const viewModal = bootstrap.Modal.getInstance(document.getElementById('viewTeamMemberModal'));
    if (viewModal) viewModal.hide();

    const editModal = new bootstrap.Modal(document.getElementById('editTeamMemberModal'));
    editModal.show();
}

function saveTeamMemberChanges() {
    const name = document.getElementById('editMemberName').value.trim();
    const email = document.getElementById('editMemberEmail').value.trim();
    const role = document.getElementById('editMemberRole').value.trim();
    const department = document.getElementById('editMemberDepartment').value;
    const status = document.getElementById('editMemberStatus').value;

    if (!name || !email || !role || !department || !status) {
        alert('Please fill in all required fields');
        return;
    }

    if (!isValidEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }

    const member = teamMembers.find(m => m.id === currentEditingMemberId);

    if (!member) {
        alert('Team member not found');
        return;
    }

    if (email !== member.email && teamMembers.some(m => m.email === email && m.id !== currentEditingMemberId)) {
        alert('This email address is already in use by another member');
        return;
    }

    member.name = name;
    member.email = email;
    member.role = role;
    member.department = department;
    member.status = status;

    saveTeamMembersToLocalStorage();

    const editModal = bootstrap.Modal.getInstance(document.getElementById('editTeamMemberModal'));
    if (editModal) editModal.hide();

    renderTeamMembers();

    showNotification('Team member updated successfully!', 'success');
}

function deleteTeamMember() {
    if (!confirm('Are you sure you want to delete this team member? This action cannot be undone.')) {
        return;
    }

    const memberIndex = teamMembers.findIndex(m => m.id === currentEditingMemberId);

    if (memberIndex === -1) {
        alert('Team member not found');
        return;
    }

    const memberName = teamMembers[memberIndex].name;
    teamMembers.splice(memberIndex, 1);
    saveTeamMembersToLocalStorage();

    const viewModal = bootstrap.Modal.getInstance(document.getElementById('viewTeamMemberModal'));
    if (viewModal) viewModal.hide();

    renderTeamMembers();

    showNotification(`${memberName} has been removed from the team.`, 'info');
}

function saveTeamMembersToLocalStorage() {
    localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function generateUniqueId() {
    return 'member_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'success' ? 'success' : type === 'danger' ? 'danger' : 'info'} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);

    setTimeout(() => {
        const bsAlert = new bootstrap.Alert(alertDiv);
        bsAlert.close();
    }, 4000);
}
