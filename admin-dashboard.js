// admin-dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    const sidebar    = document.querySelector('.sidebar');
    const toggleBtn  = document.querySelector('.sidebar-toggle');
    const links      = document.querySelectorAll('.nav-link');
    const tooltipEls = document.querySelectorAll('.tooltip-enabled');
    const content    = document.getElementById('module-content');
    const titleEl    = document.getElementById('module-title');
    const logoutLink = document.querySelector('.logout-btn');

    const data        = window.__APP_DATA__ || {};
    const stats       = data.stats       || {};
    const teachers    = data.teachers    || [];
    let flash         = data.flash       || {};
    const activeTab   = data.activeTab   || 'overview';
    let urlMsg        = data.urlMsg      || '';

    // ── Sidebar persistence ──
    const SIDEBAR_KEY = 'adminSidebarCollapsed';

    // Apply collapsed class immediately so CSS transitions and main-content
    // margin are both correct from the start — not just the visual width
    if (localStorage.getItem(SIDEBAR_KEY) === 'true') {
        sidebar.classList.add('collapsed');
    }

    // Remove the pre-collapsed helper class now that .collapsed is set
    document.documentElement.classList.remove('sidebar-pre-collapsed');

    toggleBtn.addEventListener('click', () => {
        const isNowCollapsed = sidebar.classList.toggle('collapsed');
        localStorage.setItem(SIDEBAR_KEY, String(isNowCollapsed));
        updateTooltips();
    });

    if (logoutLink) {
        logoutLink.addEventListener('click', e => {
            if (!confirm('Are you sure you want to log out?')) {
                e.preventDefault(); e.stopPropagation();
            }
        });
    }

    // Add Teacher Modal
    const modal          = document.getElementById('add-teacher-modal');
    const modalCloseBtn  = document.getElementById('modal-close-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    function openModal()  { modal.hidden = false; document.body.style.overflow = 'hidden'; }
    function closeModal() { modal.hidden = true;  document.body.style.overflow = ''; }
    modalCloseBtn.addEventListener('click', closeModal);
    modalCancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

    // CSV Import Modal
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
    csvDropzone.addEventListener('dragleave', e => { if (!csvDropzone.contains(e.relatedTarget)) csvDropzone.classList.remove('csv-dropzone-drag'); });
    csvDropzone.addEventListener('drop', e => {
        e.preventDefault();
        csvDropzone.classList.remove('csv-dropzone-drag');
        const file = e.dataTransfer.files[0];
        if (file && file.name.toLowerCase().endsWith('.csv')) {
            try { const dt = new DataTransfer(); dt.items.add(file); csvFileInput.files = dt.files; } catch(err) {}
            csvFileNameEl.textContent = file.name;
            csvDropzone.classList.add('csv-dropzone-ready');
            csvSubmitBtn.disabled = false;
        }
    });

    // Confirm dialog
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
    confirmOverlay.querySelector('#confirm-cancel').addEventListener('click', () => { confirmOverlay.hidden = true; confirmCallback = null; });
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

    // Nav routing
    const modules = { overview: renderOverview, teachers: renderTeachers, sections: renderSections };
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

    const initialLink = document.querySelector(`[data-module="${activeTab}"]`) || document.querySelector('[data-module="overview"]');
    initialLink.click();
    updateTooltips();

    // Helpers
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
    if (urlMsg === 'deleted')         return `<div class="flash-msg success flash-auto-dismiss">Teacher deleted successfully.</div>`;
    if (urlMsg === 'status_updated')  return `<div class="flash-msg success flash-auto-dismiss">Teacher status updated.</div>`;
    if (urlMsg === 'section_deleted') return `<div class="flash-msg success flash-auto-dismiss">Section deleted successfully.</div>`;
    if (flash.success)                return `<div class="flash-msg success flash-auto-dismiss">${flash.success}</div>`;
    if (flash.error)                  return `<div class="flash-msg error flash-auto-dismiss">${flash.error}</div>`;
        return '';
    }

    function dismissFlash() {
        // Clear the variables so re-renders don't show it again
        urlMsg = '';
        flash  = {};

        // Remove msg param from URL silently
        const url = new URL(window.location);
        url.searchParams.delete('msg');
        window.history.replaceState({}, '', url);

        // Fade out and remove any visible flash messages
        document.querySelectorAll('.flash-auto-dismiss').forEach(el => {
            el.style.transition = 'opacity 0.3s ease';
            el.style.opacity = '0';
            setTimeout(() => el.remove(), 800);
        });
    }

    // Auto-dismiss after 500ms whenever a flash is present
    if (urlMsg || flash.success || flash.error) {
        setTimeout(dismissFlash, 500);
    }

    // Overview
    function renderOverview() {
        const recentTeachers = [...teachers].slice(0, 5);
        content.innerHTML = `
        ${flashHTML()}
        <div class="overview-grid">
            <div class="admin-stats-grid">
                <div class="admin-stat-card" style="--accent:var(--color-primary)">
    <div class="admin-stat-icon" style="background:var(--color-primary-light)">
        <svg style="stroke:var(--color-primary)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
    </div>
    <div class="admin-stat-value">${stats.teachers ?? 0}</div>
    <div class="admin-stat-label">Total Teachers</div>
</div>
                <div class="admin-stat-card" style="--accent:var(--color-info)">
    <div class="admin-stat-icon" style="background:var(--color-info-light)">
        <svg style="stroke:var(--color-info)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
        </svg>
    </div>
    <div class="admin-stat-value">${stats.students ?? 0}</div>
    <div class="admin-stat-label">Total Students</div>
</div>
                <div class="admin-stat-card" style="--accent:var(--color-warning)">
    <div class="admin-stat-icon" style="background:var(--color-warning-light)">
        <svg style="stroke:var(--color-warning)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
    </div>
    <div class="admin-stat-value">${stats.sections ?? 0}</div>
    <div class="admin-stat-label">Class Sections</div>
</div>
                <div class="admin-stat-card" style="--accent:var(--color-info)">
    <div class="admin-stat-icon" style="background:var(--color-info-light)">
        <svg style="stroke:var(--color-info)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
                        <span class="status-pill ${t.status}"><span class="status-dot"></span>${t.status}</span>
                    </div>`).join('')}
                </div>` : `<p class="empty-table-msg">No teachers yet. Click "Add Teacher" to get started.</p>`}
            </div>
        </div>`;
        document.getElementById('overview-add-btn')?.addEventListener('click', openModal);
    }

    // Teachers
    function buildTeacherRow(t) {
        const initials = t.full_name.trim().split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();
        return `
        <tr>
            <td>
                <div class="teacher-name-cell">
                    <div class="teacher-avatar-initials">${initials}</div>
                    <div>
                        <div class="teacher-name-text">${t.full_name}</div>
                        <div class="teacher-email-text">${t.email || '&mdash;'}</div>
                    </div>
                </div>
            </td>
            <td class="td-muted">${t.employee_id || '&mdash;'}</td>
            <td class="td-muted">${t.department || '&mdash;'}</td>
            <td class="td-muted">${t.academic_rank || '&mdash;'}</td>
            <td><span class="assign-count-badge">${t.assignment_count} assignments</span></td>
            <td><span class="status-pill ${t.status}"><span class="status-dot"></span>${t.status}</span></td>
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
        </tr>`;
    }

    function attachTeacherListeners(tbody) {
    tbody.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const form   = btn.closest('.toggle-form');
            const userId = form.querySelector('[name="user_id"]').value;
            const status = form.querySelector('[name="current_status"]').value;
            const action = status === 'active' ? 'deactivate' : 'activate';
            showConfirm(
                `${action.charAt(0).toUpperCase() + action.slice(1)} Teacher`,
                `Are you sure you want to ${action} this teacher?`,
                () => submitTeacherAction({ action: 'toggle_status', user_id: userId, current_status: status })
            );
        });
    });
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const form   = btn.closest('.delete-form');
            const userId = form.querySelector('[name="user_id"]').value;
            showConfirm(
                'Delete Teacher',
                'This will permanently delete the teacher and all their assignments. This cannot be undone.',
                () => submitTeacherAction({ action: 'delete_teacher', user_id: userId })
            );
        });
    });
}

function submitTeacherAction(payload) {
    payload._fetch = '1';
    fetch('admin-dashboard.php', {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        body: new URLSearchParams(payload)
    })
    .then(res => { if (!res.ok) throw new Error('failed'); return fetch('admin-dashboard.php?json=teachers'); })
    .then(res => res.json())
    .catch(() => null)
    .then(freshData => {
    if (freshData && freshData.teachers) {
        // Sync from server response
        teachers.length = 0;
        freshData.teachers.forEach(t => teachers.push(t));
        Object.assign(stats, freshData.stats || {});
    } else {
        // Fallback: update local array immediately if server response unavailable
        if (payload.action === 'delete_teacher') {
            const idx = teachers.findIndex(t => String(t.id) === String(payload.user_id));
            if (idx !== -1) teachers.splice(idx, 1);
        }
        if (payload.action === 'toggle_status') {
            const teacher = teachers.find(t => String(t.id) === String(payload.user_id));
            if (teacher) teacher.status = teacher.status === 'active' ? 'inactive' : 'active';
        }
    }
    flash = { success: payload.action === 'toggle_status' ? 'Teacher status updated.' : 'Teacher deleted successfully.' };
    renderTeachers();
    setTimeout(dismissFlash, 800);
});
}

    function renderTeachers(filterText = '') {
        const filtered = filterText
            ? teachers.filter(t =>
                t.full_name.toLowerCase().includes(filterText.toLowerCase()) ||
                (t.email || '').toLowerCase().includes(filterText.toLowerCase()) ||
                (t.department || '').toLowerCase().includes(filterText.toLowerCase()))
            : teachers;

        const rows = filtered.length
            ? filtered.map(buildTeacherRow).join('')
            : `<tr><td colspan="7" class="empty-table-msg">No teachers found.</td></tr>`;

        content.innerHTML = `
        ${flashHTML()}
        <div class="admin-toolbar">
            <input type="text" class="admin-search" id="teacher-search" placeholder="Search by name, email or department&hellip;" value="${filterText}"/>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
                <button class="btn btn-outline-green" id="import-csv-btn">&#8593; Import CSV</button>
                <button class="btn btn-primary" id="add-teacher-btn">+ Add Teacher</button>
            </div>
        </div>
        <div class="table-wrapper">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Teacher</th><th>Employee ID</th><th>Department</th>
                        <th>Rank</th><th>Assignments</th><th>Status</th><th>Actions</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;

        const tbody = content.querySelector('.admin-table tbody');
        attachTeacherListeners(tbody);

        document.getElementById('teacher-search').addEventListener('input', e => {
            const val = e.target.value;
            const tBody = content.querySelector('.admin-table tbody');
            if (!tBody) return;
            const f = val ? teachers.filter(t =>
                t.full_name.toLowerCase().includes(val.toLowerCase()) ||
                (t.email || '').toLowerCase().includes(val.toLowerCase()) ||
                (t.department || '').toLowerCase().includes(val.toLowerCase())) : teachers;
            tBody.innerHTML = f.length ? f.map(buildTeacherRow).join('') : `<tr><td colspan="7" class="empty-table-msg">No teachers found.</td></tr>`;
            attachTeacherListeners(tBody);
        });

        document.getElementById('add-teacher-btn').addEventListener('click', openModal);
        document.getElementById('import-csv-btn').addEventListener('click', openCsvModal);
    }

    // Sections
    function renderSections() {
        const sections = data.sections || [];
        const byGrade = {};
        sections.forEach(s => {
            if (!byGrade[s.year_level]) byGrade[s.year_level] = [];
            byGrade[s.year_level].push(s);
        });
        const grades = Object.keys(byGrade).sort((a, b) => a - b);

        content.innerHTML = `
        ${flashHTML()}
        <div class="admin-toolbar" style="margin-bottom:20px">
            <span style="font-size:0.9rem;color:#64748b">${sections.length} section(s) across ${grades.length} grade level(s)</span>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
                <button class="btn btn-outline-green" id="import-sections-csv-btn">&#8593; Import CSV</button>
                <button class="btn btn-primary" id="add-section-btn">+ Add Section</button>
            </div>
        </div>
        ${grades.length ? grades.map(grade => `
            <div class="module-card" style="margin-bottom:20px">
                <div class="admin-section-title">
                    Grade ${grade}
                    <span style="font-size:0.78rem;color:#94a3b8;font-weight:500">${byGrade[grade].length} section(s)</span>
                </div>
                <div class="table-wrapper">
                    <table class="admin-table">
                        <thead><tr><th>Section Code</th><th>Program / Description</th><th>Adviser</th><th>Actions</th></tr></thead>
                        <tbody>
                            ${byGrade[grade].map(s => `
                            <tr>
                                <td><strong style="color:#111826">${s.code}</strong></td>
                                <td style="color:#64748b">${s.program || '&mdash;'}</td>
                                <td style="color:#64748b">${s.adviser_name || '&mdash;'}</td>
                                <td>
                                    <div class="action-btns">
                                        <button class="action-btn action-btn-toggle edit-section-btn"
                                            data-id="${s.id}" data-code="${s.code}"
                                            data-program="${(s.program || '').replace(/"/g, '&quot;')}"
                                            data-adviser="${(s.adviser_name || '').replace(/"/g, '&quot;')}"
                                            data-grade="${s.year_level}">Edit</button>
                                        <form method="POST" class="delete-section-form" style="display:inline">
                                            <input type="hidden" name="action" value="delete_section"/>
                                            <input type="hidden" name="section_id" value="${s.id}"/>
                                            <button type="button" class="action-btn action-btn-delete delete-section-btn">Delete</button>
                                        </form>
                                    </div>
                                </td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`).join('')
        : `<div class="module-card"><p class="empty-table-msg">No sections yet. Click "+ Add Section" to create one.</p></div>`}

        <div class="modal-overlay" id="section-modal" hidden>
            <div class="modal" style="max-width:480px">
                <div class="modal-header">
                    <h2 id="section-modal-title">Add New Section</h2>
                    <button class="modal-close" id="section-modal-close">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
                <div class="modal-body">
                    <form method="POST" action="admin-dashboard.php" id="section-form">
                        <input type="hidden" name="action" id="section-action" value="add_section"/>
                        <input type="hidden" name="section_id" id="section-id-input" value=""/>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Year Level <span class="required">*</span></label>
                                <select name="year_level" id="section-year-level" required>
                                    <option value="">— Select —</option>
                                    ${[7,8,9,10,11,12].map(g => `<option value="${g}">Grade ${g}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Section Code <span class="required">*</span></label>
                                <input type="text" name="section_code" id="section-code-input" placeholder="e.g. GRADE7-SANTOS" required/>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Program / Description</label>
                            <input type="text" name="section_program" id="section-program-input" placeholder="e.g. Grade 7 - Santos"/>
                        </div>
                        <div class="form-group">
                            <label>Adviser Name</label>
                            <input type="text" name="adviser_name" id="section-adviser-input" placeholder="e.g. Ms. Maria Santos"/>
                        </div>
                        <div class="modal-actions">
                            <button type="button" class="btn btn-outline" id="section-modal-cancel">Cancel</button>
                            <button type="submit" class="btn btn-primary" id="section-submit-btn">Add Section</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>`;

        const secModal     = document.getElementById('section-modal');
        const secTitle     = document.getElementById('section-modal-title');
        const secAction    = document.getElementById('section-action');
        const secIdInput   = document.getElementById('section-id-input');
        const secCode      = document.getElementById('section-code-input');
        const secProgram   = document.getElementById('section-program-input');
        const secAdviser   = document.getElementById('section-adviser-input');
        const secYearLevel = document.getElementById('section-year-level');
        const secSubmitBtn = document.getElementById('section-submit-btn');

        function openSectionModal(mode, s = {}) {
            if (mode === 'edit') {
                secTitle.textContent     = 'Edit Section';
                secAction.value          = 'rename_section';
                secIdInput.value         = s.id;
                secCode.value            = s.code;
                secProgram.value         = s.program;
                secAdviser.value         = s.adviser;
                secYearLevel.value       = s.grade;
                secYearLevel.disabled    = true;
                secSubmitBtn.textContent = 'Save Changes';
            } else {
                secTitle.textContent     = 'Add New Section';
                secAction.value          = 'add_section';
                secIdInput.value         = '';
                secCode.value            = '';
                secProgram.value         = '';
                secAdviser.value         = '';
                secYearLevel.value       = '';
                secYearLevel.disabled    = false;
                secSubmitBtn.textContent = 'Add Section';
            }
            secModal.hidden = false;
            document.body.style.overflow = 'hidden';
        }

        function closeSectionModal() {
            secModal.hidden = true;
            document.body.style.overflow = '';
        }

        document.getElementById('section-modal-close').addEventListener('click', closeSectionModal);
        document.getElementById('section-modal-cancel').addEventListener('click', closeSectionModal);
        secModal.addEventListener('click', e => { if (e.target === secModal) closeSectionModal(); });
        document.getElementById('add-section-btn').addEventListener('click', () => openSectionModal('add'));
        // CSV Import Modal for Sections
        content.insertAdjacentHTML('beforeend', `
        <div class="modal-overlay" id="sections-csv-modal" hidden>
            <div class="modal" style="max-width:520px">
                <div class="modal-header">
                    <h2>Import / Update Sections via CSV</h2>
                    <button class="modal-close" id="sections-csv-close">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="csv-format-box">
                        <div class="csv-format-title">CSV Columns</div>
                        <div class="csv-cols-grid">
                            <div class="csv-col-item csv-col-required"><span class="csv-col-name">code</span><span class="csv-col-badge csv-badge-required">required</span></div>
                            <div class="csv-col-item csv-col-required"><span class="csv-col-name">year_level</span><span class="csv-col-badge csv-badge-required">required</span></div>
                            <div class="csv-col-item"><span class="csv-col-name">program</span><span class="csv-col-badge csv-badge-optional">optional</span></div>
                            <div class="csv-col-item"><span class="csv-col-name">adviser_name</span><span class="csv-col-badge csv-badge-optional">optional</span></div>
                        </div>
                        <p class="csv-hint">If a section code already exists it will be <strong>updated</strong>. New codes will be <strong>added</strong>. Year level must be 7–12.</p>
                        <a href="admin-dashboard.php?action=download_sections_template" class="csv-template-link">&#8595; Download Sample CSV Template</a>
                    </div>
                    <form method="POST" action="admin-dashboard.php" enctype="multipart/form-data" id="sections-csv-form">
                        <input type="hidden" name="action" value="import_sections_csv"/>
                        <div class="csv-dropzone" id="sections-csv-dropzone">
                            <p class="csv-drop-text">Drag &amp; drop your CSV here, or <label for="sections_csv_file" class="csv-browse-label">browse</label></p>
                            <p class="csv-drop-hint" id="sections-csv-file-name">Only .csv files accepted</p>
                            <input type="file" name="sections_csv_file" id="sections_csv_file" accept=".csv" class="csv-file-input"/>
                        </div>
                        <div class="modal-actions">
                            <button type="button" class="btn btn-outline" id="sections-csv-cancel">Cancel</button>
                            <button type="submit" class="btn btn-primary" id="sections-csv-submit" disabled>Import Sections</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>`);

        const secCsvModal    = document.getElementById('sections-csv-modal');
        const secCsvClose    = document.getElementById('sections-csv-close');
        const secCsvCancel   = document.getElementById('sections-csv-cancel');
        const secCsvInput    = document.getElementById('sections_csv_file');
        const secCsvSubmit   = document.getElementById('sections-csv-submit');
        const secCsvFileName = document.getElementById('sections-csv-file-name');
        const secCsvDropzone = document.getElementById('sections-csv-dropzone');

        function openSecCsvModal()  { secCsvModal.hidden = false; document.body.style.overflow = 'hidden'; }
        function closeSecCsvModal() { secCsvModal.hidden = true;  document.body.style.overflow = ''; }

        secCsvClose.addEventListener('click', closeSecCsvModal);
        secCsvCancel.addEventListener('click', closeSecCsvModal);
        secCsvModal.addEventListener('click', e => { if (e.target === secCsvModal) closeSecCsvModal(); });

        secCsvInput.addEventListener('change', () => {
            const file = secCsvInput.files[0];
            if (file) {
                secCsvFileName.textContent = file.name;
                secCsvDropzone.classList.add('csv-dropzone-ready');
                secCsvSubmit.disabled = false;
            } else {
                secCsvFileName.textContent = 'Only .csv files accepted';
                secCsvDropzone.classList.remove('csv-dropzone-ready');
                secCsvSubmit.disabled = true;
            }
        });

        secCsvDropzone.addEventListener('dragover', e => { e.preventDefault(); secCsvDropzone.classList.add('csv-dropzone-drag'); });
        secCsvDropzone.addEventListener('dragleave', e => { if (!secCsvDropzone.contains(e.relatedTarget)) secCsvDropzone.classList.remove('csv-dropzone-drag'); });
        secCsvDropzone.addEventListener('drop', e => {
            e.preventDefault();
            secCsvDropzone.classList.remove('csv-dropzone-drag');
            const file = e.dataTransfer.files[0];
            if (file && file.name.toLowerCase().endsWith('.csv')) {
                try { const dt = new DataTransfer(); dt.items.add(file); secCsvInput.files = dt.files; } catch(err) {}
                secCsvFileName.textContent = file.name;
                secCsvDropzone.classList.add('csv-dropzone-ready');
                secCsvSubmit.disabled = false;
            }
        });

        document.getElementById('import-sections-csv-btn').addEventListener('click', openSecCsvModal);
        content.querySelectorAll('.edit-section-btn').forEach(btn => {
            btn.addEventListener('click', () => openSectionModal('edit', {
                id: btn.dataset.id, code: btn.dataset.code,
                program: btn.dataset.program, adviser: btn.dataset.adviser, grade: btn.dataset.grade,
            }));
        });

        content.querySelectorAll('.delete-section-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const form = btn.closest('.delete-section-form');
                showConfirm('Delete Section', 'This will permanently delete the section. Students and assignments linked to it may be affected.', () => form.submit());
            });
        });

        secYearLevel.addEventListener('change', () => {
            if (secAction.value === 'add_section' && !secCode.value) {
                secCode.value = `GRADE${secYearLevel.value}-`;
                secCode.focus();
            }
        });
    }
});