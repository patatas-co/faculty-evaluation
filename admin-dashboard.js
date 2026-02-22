// admin-dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    const sidebar    = document.querySelector('.sidebar');
    const toggleBtn  = document.querySelector('.sidebar-toggle');
    const links      = document.querySelectorAll('.nav-link');
    const tooltipEls = document.querySelectorAll('.tooltip-enabled');
    const content    = document.getElementById('module-content');
    const titleEl    = document.getElementById('module-title');
    const logoutLink = document.querySelector('.logout-btn');

    const data       = window.__APP_DATA__ || {};
    const stats      = data.stats      || {};
    const teachers   = data.teachers   || [];
    const departments= data.departments|| [];
    const flash      = data.flash      || {};
    const activeTab  = data.activeTab  || 'overview';
    const urlMsg     = data.urlMsg     || '';

    // ── Sidebar ──
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        updateTooltips();
    });

    if (logoutLink) {
        logoutLink.addEventListener('click', e => {
            if (!confirm('Are you sure you want to log out?')) {
                e.preventDefault(); e.stopPropagation();
            }
        });
    }

    // ── Modal ──
    const modal        = document.getElementById('add-teacher-modal');
    const modalCloseBtn= document.getElementById('modal-close-btn');
    const modalCancelBtn= document.getElementById('modal-cancel-btn');

    function openModal()  { modal.hidden = false; document.body.style.overflow = 'hidden'; }
    function closeModal() { modal.hidden = true;  document.body.style.overflow = ''; }

    modalCloseBtn.addEventListener('click', closeModal);
    modalCancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

    // ── CSV Import Modal ──
    const csvModal       = document.getElementById('csv-import-modal');
    const csvModalClose  = document.getElementById('csv-modal-close-btn');
    const csvModalCancel = document.getElementById('csv-modal-cancel-btn');
    const csvFileInput   = document.getElementById('csv_file');
    const csvSubmitBtn   = document.getElementById('csv-submit-btn');
    const csvFileNameEl  = document.getElementById('csv-file-name');
    const csvDropzone    = document.getElementById('csv-dropzone');

    function openCsvModal()  { csvModal.hidden = false; document.body.style.overflow = 'hidden'; }
    function closeCsvModal() { csvModal.hidden = true;  document.body.style.overflow = ''; }

    csvModalClose.addEventListener('click', closeCsvModal);
    csvModalCancel.addEventListener('click', closeCsvModal);
    csvModal.addEventListener('click', e => { if (e.target === csvModal) closeCsvModal(); });

    csvFileInput.addEventListener('change', () => {
        const file = csvFileInput.files[0];
        if (file) {
            csvFileNameEl.textContent = file.name;
            csvDropzone.classList.add('csv-dropzone-ready');
            csvSubmitBtn.disabled = false;
        } else {
            csvFileNameEl.textContent = 'Only .csv files accepted';
            csvDropzone.classList.remove('csv-dropzone-ready');
            csvSubmitBtn.disabled = true;
        }
    });

    csvDropzone.addEventListener('dragover', e => { e.preventDefault(); csvDropzone.classList.add('csv-dropzone-drag'); });
    csvDropzone.addEventListener('dragleave', () => csvDropzone.classList.remove('csv-dropzone-drag'));
    csvDropzone.addEventListener('drop', e => {
        e.preventDefault();
        csvDropzone.classList.remove('csv-dropzone-drag');
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.csv')) {
            const dt = new DataTransfer();
            dt.items.add(file);
            csvFileInput.files = dt.files;
            csvFileInput.dispatchEvent(new Event('change'));
        }
    });

    // ── Confirm dialog ──
    let confirmCallback = null;
    const confirmOverlay = document.createElement('div');
    confirmOverlay.className = 'confirm-overlay';
    confirmOverlay.hidden = true;
    confirmOverlay.innerHTML = `
        <div class="confirm-box">
            <h3 id="confirm-title">Are you sure?</h3>
            <p id="confirm-msg">This action cannot be undone.</p>
            <div class="confirm-actions">
                <button class="btn btn-outline" id="confirm-cancel">Cancel</button>
                <button class="btn btn-danger" id="confirm-ok">Confirm</button>
            </div>
        </div>`;
    document.body.appendChild(confirmOverlay);

    confirmOverlay.querySelector('#confirm-cancel').addEventListener('click', () => {
        confirmOverlay.hidden = true;
        confirmCallback = null;
    });
    confirmOverlay.querySelector('#confirm-ok').addEventListener('click', () => {
        confirmOverlay.hidden = true;
        if (typeof confirmCallback === 'function') confirmCallback();
        confirmCallback = null;
    });

    function showConfirm(title, msg, cb) {
        confirmOverlay.querySelector('#confirm-title').textContent = title;
        confirmOverlay.querySelector('#confirm-msg').textContent = msg;
        confirmCallback = cb;
        confirmOverlay.hidden = false;
    }

    // ── Nav routing ──
    const modules = { overview: renderOverview, teachers: renderTeachers };

    links.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            titleEl.textContent = link.querySelector('span').textContent;
            const fn = modules[link.dataset.module];
            if (typeof fn === 'function') fn();
        });
    });

    // Load initial tab
    const initialLink = document.querySelector(`[data-module="${activeTab}"]`) || document.querySelector('[data-module="overview"]');
    initialLink.click();
    updateTooltips();

    // ── Helpers ──
    function updateTooltips() {
        const collapsed = sidebar.classList.contains('collapsed');
        tooltipEls.forEach(el => {
            if (collapsed) { el.setAttribute('data-tooltip-enabled', 'true'); el.setAttribute('tabindex', '0'); }
            else           { el.removeAttribute('data-tooltip-enabled'); el.removeAttribute('tabindex'); }
        });
    }

    function avatarUrl(name) {
        return `https://ui-avatars.com/api/?background=4caf50&color=fff&name=${encodeURIComponent(name || 'T')}`;
    }

    function flashHTML() {
        if (urlMsg === 'deleted')        return `<div class="flash-msg success">✓ Teacher deleted successfully.</div>`;
        if (urlMsg === 'status_updated') return `<div class="flash-msg success">✓ Teacher status updated.</div>`;
        if (flash.success)               return `<div class="flash-msg success">✓ ${flash.success}</div>`;
        if (flash.error)                 return `<div class="flash-msg error">✗ ${flash.error}</div>`;
        return '';
    }

    // ── Overview ──
    function renderOverview() {
        const recentTeachers = [...teachers].slice(0, 5);

        content.innerHTML = `
        ${flashHTML()}
        <div class="overview-grid">

            <div class="admin-stats-grid">
                <div class="admin-stat-card" style="--accent:#4caf50">
                    <div class="admin-stat-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                    </div>
                    <div class="admin-stat-value">${stats.teachers ?? 0}</div>
                    <div class="admin-stat-label">Total Teachers</div>
                </div>
                <div class="admin-stat-card" style="--accent:#3b82f6">
                    <div class="admin-stat-icon" style="background:rgba(59,130,246,0.1)">
                        <svg style="stroke:#3b82f6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                    </div>
                    <div class="admin-stat-value">${stats.students ?? 0}</div>
                    <div class="admin-stat-label">Total Students</div>
                </div>
                <div class="admin-stat-card" style="--accent:#f59e0b">
                    <div class="admin-stat-icon" style="background:rgba(245,158,11,0.1)">
                        <svg style="stroke:#f59e0b" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                    </div>
                    <div class="admin-stat-value">${stats.sections ?? 0}</div>
                    <div class="admin-stat-label">Class Sections</div>
                </div>
                <div class="admin-stat-card" style="--accent:#8b5cf6">
                    <div class="admin-stat-icon" style="background:rgba(139,92,246,0.1)">
                        <svg style="stroke:#8b5cf6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                    </div>
                    <div class="admin-stat-value">${stats.evals ?? 0}</div>
                    <div class="admin-stat-label">Evaluations</div>
                </div>
            </div>

            <div class="module-card">
                <div class="admin-section-title">
                    Recent Teachers
                    <button class="btn btn-primary" id="overview-add-btn" style="font-size:0.82rem;padding:8px 16px">+ Add Teacher</button>
                </div>
                ${recentTeachers.length ? `
                <div class="recent-teachers">
                    ${recentTeachers.map(t => `
                    <div class="recent-teacher-row">
                        <div class="recent-teacher-info">
                            <img src="${avatarUrl(t.full_name)}" alt="${t.full_name}" class="teacher-avatar"/>
                            <div>
                                <div class="recent-teacher-name">${t.full_name}</div>
                                <div class="recent-teacher-dept">${t.department || 'No department'}</div>
                            </div>
                        </div>
                        <span class="status-pill ${t.status}">
                            <span class="status-dot"></span>${t.status}
                        </span>
                    </div>`).join('')}
                </div>` : `<p class="empty-table-msg">No teachers yet. Click "Add Teacher" to get started.</p>`}
            </div>

        </div>`;

        document.getElementById('overview-add-btn')?.addEventListener('click', openModal);
    }

    // ── Teachers ──
    function renderTeachers(filterText = '') {
        const filtered = filterText
            ? teachers.filter(t =>
                t.full_name.toLowerCase().includes(filterText.toLowerCase()) ||
                (t.email || '').toLowerCase().includes(filterText.toLowerCase()) ||
                (t.department || '').toLowerCase().includes(filterText.toLowerCase())
              )
            : teachers;

        const rows = filtered.length
            ? filtered.map(t => `
            <tr>
                <td>
                    <div class="teacher-name-cell">
                        <img src="${avatarUrl(t.full_name)}" alt="${t.full_name}" class="teacher-avatar"/>
                        <div>
                            <div class="teacher-name-text">${t.full_name}</div>
                            <div class="teacher-email-text">${t.email || '—'}</div>
                        </div>
                    </div>
                </td>
                <td>${t.employee_id || '—'}</td>
                <td>${t.department || '—'}</td>
                <td>${t.academic_rank || '—'}</td>
                <td><span class="assign-count-badge">${t.assignment_count} assignments</span></td>
                <td>
                    <span class="status-pill ${t.status}">
                        <span class="status-dot"></span>${t.status}
                    </span>
                </td>
                <td>
                    <div class="action-btns">
                        <form method="POST" class="toggle-form" style="display:inline">
                            <input type="hidden" name="action" value="toggle_status"/>
                            <input type="hidden" name="user_id" value="${t.id}"/>
                            <input type="hidden" name="current_status" value="${t.status}"/>
                            <button type="button" class="action-btn action-btn-toggle toggle-btn">
                                ${t.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                        </form>
                        <form method="POST" class="delete-form" style="display:inline">
                            <input type="hidden" name="action" value="delete_teacher"/>
                            <input type="hidden" name="user_id" value="${t.id}"/>
                            <button type="button" class="action-btn action-btn-delete delete-btn">Delete</button>
                        </form>
                    </div>
                </td>
            </tr>`).join('')
            : `<tr><td colspan="7" class="empty-table-msg">No teachers found.</td></tr>`;

        content.innerHTML = `
        ${flashHTML()}
        <div class="admin-toolbar">
            <input type="text" class="admin-search" id="teacher-search" placeholder="Search by name, email or department…" value="${filterText}"/>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
                <button class="btn btn-outline-green" id="import-csv-btn">↑ Import CSV</button>
                <button class="btn btn-primary" id="add-teacher-btn">+ Add Teacher</button>
            </div>
        </div>
        <div class="table-wrapper">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Teacher</th>
                        <th>Employee ID</th>
                        <th>Department</th>
                        <th>Rank</th>
                        <th>Assignments</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;

        // Search
        document.getElementById('teacher-search').addEventListener('input', e => {
            const filterText = e.target.value;
            const tbody = content.querySelector('.admin-table tbody');
            if (!tbody) return;

            const filtered = filterText
                ? teachers.filter(t =>
                    t.full_name.toLowerCase().includes(filterText.toLowerCase()) ||
                    (t.email || '').toLowerCase().includes(filterText.toLowerCase()) ||
                    (t.department || '').toLowerCase().includes(filterText.toLowerCase())
                  )
                : teachers;

            tbody.innerHTML = filtered.length
                ? filtered.map(t => `
                <tr>
                    <td>
                        <div class="teacher-name-cell">
                            <img src="${avatarUrl(t.full_name)}" alt="${t.full_name}" class="teacher-avatar"/>
                            <div>
                                <div class="teacher-name-text">${t.full_name}</div>
                                <div class="teacher-email-text">${t.email || '—'}</div>
                            </div>
                        </div>
                    </td>
                    <td>${t.employee_id || '—'}</td>
                    <td>${t.department || '—'}</td>
                    <td>${t.academic_rank || '—'}</td>
                    <td><span class="assign-count-badge">${t.assignment_count} assignments</span></td>
                    <td>
                        <span class="status-pill ${t.status}">
                            <span class="status-dot"></span>${t.status}
                        </span>
                    </td>
                    <td>
                        <div class="action-btns">
                            <form method="POST" class="toggle-form" style="display:inline">
                                <input type="hidden" name="action" value="toggle_status"/>
                                <input type="hidden" name="user_id" value="${t.id}"/>
                                <input type="hidden" name="current_status" value="${t.status}"/>
                                <button type="button" class="action-btn action-btn-toggle toggle-btn">
                                    ${t.status === 'active' ? 'Deactivate' : 'Activate'}
                                </button>
                            </form>
                            <form method="POST" class="delete-form" style="display:inline">
                                <input type="hidden" name="action" value="delete_teacher"/>
                                <input type="hidden" name="user_id" value="${t.id}"/>
                                <button type="button" class="action-btn action-btn-delete delete-btn">Delete</button>
                            </form>
                        </div>
                    </td>
                </tr>`).join('')
                : `<tr><td colspan="7" class="empty-table-msg">No teachers found.</td></tr>`;

            // Re-attach action button listeners
            tbody.querySelectorAll('.toggle-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const form   = btn.closest('.toggle-form');
                    const status = form.querySelector('[name="current_status"]').value;
                    const action = status === 'active' ? 'deactivate' : 'activate';
                    showConfirm(
                        `${action.charAt(0).toUpperCase() + action.slice(1)} Teacher`,
                        `Are you sure you want to ${action} this teacher?`,
                        () => form.submit()
                    );
                });
            });
            tbody.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const form = btn.closest('.delete-form');
                    showConfirm(
                        'Delete Teacher',
                        'This will permanently delete the teacher and all their assignments. This cannot be undone.',
                        () => form.submit()
                    );
                });
            });
        });

        // Add teacher
        document.getElementById('add-teacher-btn').addEventListener('click', openModal);

        document.getElementById('import-csv-btn').addEventListener('click', openCsvModal);

        // Toggle status with confirm
        content.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const form   = btn.closest('.toggle-form');
                const status = form.querySelector('[name="current_status"]').value;
                const action = status === 'active' ? 'deactivate' : 'activate';
                showConfirm(
                    `${action.charAt(0).toUpperCase() + action.slice(1)} Teacher`,
                    `Are you sure you want to ${action} this teacher?`,
                    () => form.submit()
                );
            });
        });

        // Delete with confirm
        content.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const form = btn.closest('.delete-form');
                showConfirm(
                    'Delete Teacher',
                    'This will permanently delete the teacher and all their assignments. This cannot be undone.',
                    () => form.submit()
                );
            });
        });
    }
});
