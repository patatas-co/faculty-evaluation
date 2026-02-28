// teacher-dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    const sidebar   = document.querySelector('.sidebar');
    const toggleBtn = document.querySelector('.sidebar-toggle');
    const links     = document.querySelectorAll('.nav-link');
    const content   = document.getElementById('module-content');
    const titleEl   = document.getElementById('module-title');
    const logoutLink = document.querySelector('.logout-btn');

    const data        = window.__APP_DATA__ || {};
    const stats       = data.stats        || {};
    const profile     = data.profile      || {};
    const sections    = data.sections     || [];
    const courses     = data.courses      || [];
    const evalResults = data.evalResults  || [];
    let   flash       = data.flash        || {};
    const activeTab   = data.activeTab    || 'overview';

    // ── Sidebar ──
    const SIDEBAR_KEY = 'teacherSidebarCollapsed';

    if (localStorage.getItem(SIDEBAR_KEY) === 'true') {
        sidebar.classList.add('collapsed');
    }
    document.documentElement.classList.remove('sidebar-pre-collapsed');

    toggleBtn.addEventListener('click', () => {
        const now = sidebar.classList.toggle('collapsed');
        localStorage.setItem(SIDEBAR_KEY, String(now));
    });

    if (logoutLink) {
        logoutLink.addEventListener('click', e => {
            if (!confirm('Are you sure you want to log out?')) {
                e.preventDefault();
            }
        });
    }

    // ── Module routing ──
    const modules = {
        overview:    renderOverview,
        profile:     renderProfile,
        evaluations: renderEvaluations,
        sections:    renderSections,
    };

    const moduleTitles = {
        overview:    'Overview',
        profile:     'My Profile',
        evaluations: 'Evaluation Results',
        sections:    'My Sections & Classes',
    };

    function navigate(module) {
        links.forEach(l => l.classList.toggle('active', l.dataset.module === module));
        titleEl.textContent = moduleTitles[module] || module;
        (modules[module] || renderOverview)();
    }

    links.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            navigate(link.dataset.module);
        });
    });

    // ── Flash helper ──
    function flashHtml() {
        if (!flash || !flash.msg) return '';
        const cls = flash.type === 'success' ? 'flash-success' : 'flash-danger';
        const html = `<div class="flash-message ${cls}" style="margin-bottom:20px;">${esc(flash.msg)}</div>`;
        flash = {};
        return html;
    }

    function esc(s) {
        return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    // ── Rating helpers ──
    function starHtml(rating) {
        const r = parseFloat(rating) || 0;
        let html = '<span class="star-rating">';
        for (let i = 1; i <= 5; i++) {
            if (r >= i)          html += '<span class="star filled">★</span>';
            else if (r >= i-0.5) html += '<span class="star half">★</span>';
            else                 html += '<span class="star">★</span>';
        }
        html += '</span>';
        return html;
    }

    function ratingBadge(r) {
        r = parseFloat(r) || 0;
        if (r >= 4.5)      return `<span class="rating-badge excellent">Excellent ${r}</span>`;
        if (r >= 3.5)      return `<span class="rating-badge good">Good ${r}</span>`;
        if (r >= 2.5)      return `<span class="rating-badge average">Average ${r}</span>`;
        return             `<span class="rating-badge poor">Needs Improvement ${r}</span>`;
    }

    function initials(name) {
        return (name || '?').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
    }

    // ── Overview ──
    function renderOverview() {
        const statCards = [
            { label: 'My Sections',       value: stats.sections  || 0, icon: iconSections(),  cls: '' },
            { label: 'Assigned Courses',  value: stats.courses   || 0, icon: iconCourses(),   cls: 'teacher-stat-icon' },
            { label: 'Total Responses',   value: stats.responses || 0, icon: iconResponses(), cls: 'teacher-stat-icon' },
            { label: 'Overall Rating',    value: (stats.avg || 0) + ' / 5', icon: iconStar(), cls: 'teacher-stat-icon' },
        ];

        let html = flashHtml();
        html += `<div class="admin-stats-grid">`;
        statCards.forEach(s => {
            html += `
            <div class="admin-stat-card">
                <div class="admin-stat-icon ${s.cls}">${s.icon}</div>
                <div class="admin-stat-value">${esc(String(s.value))}</div>
                <div class="admin-stat-label">${esc(s.label)}</div>
            </div>`;
        });
        html += `</div>`;

        // Recent Eval Results preview
        html += `<div class="admin-section-title">Recent Evaluation Results</div>`;
        if (evalResults.length === 0) {
            html += emptyState('No evaluation data available yet.');
        } else {
            const recent = evalResults.slice(0, 5);
            html += `<div class="table-wrapper"><table class="admin-table">
                <thead><tr>
                    <th>Period</th><th>Course</th><th>Section</th><th>Responses</th><th>Rating</th>
                </tr></thead><tbody>`;
            recent.forEach(r => {
                html += `<tr>
                    <td><span class="eval-period-badge">${esc(r.period_title)}</span></td>
                    <td><strong>${esc(r.course_code)}</strong><br><small style="color:#64748b">${esc(r.course_name)}</small></td>
                    <td>${esc(r.section_code)}</td>
                    <td>${esc(String(r.total_responses))}</td>
                    <td>${starHtml(r.avg_rating)} ${ratingBadge(r.avg_rating)}</td>
                </tr>`;
            });
            html += `</tbody></table></div>`;
        }

        // Assigned Courses
        if (courses.length) {
            html += `<div class="admin-section-title" style="margin-top:28px;">Assigned Courses</div>`;
            html += `<div style="display:flex;flex-wrap:wrap;gap:8px;">`;
            courses.forEach(c => {
                html += `<span class="course-tag" title="${esc(c.description || '')}"><strong>${esc(c.code)}</strong> — ${esc(c.name)}</span>`;
            });
            html += `</div>`;
        }

        content.innerHTML = html;
    }

    // ── Profile ──
    function renderProfile() {
        let html = flashHtml();
        html += `
        <div style="background:#fff;border:1px solid #e9eef6;border-radius:16px;padding:28px;">
                <form method="POST" action="faculty-dashboard.php?tab=profile" id="profile-form">
                    <input type="hidden" name="action" value="update_profile"/>
                    <div class="profile-form-grid">
                        <div class="form-group">
                            <label for="full_name">Full Name</label>
                            <input type="text" id="full_name" name="full_name" value="${esc(profile.full_name)}" required/>
                        </div>
                        <div class="form-group">
                            <label for="email">Email Address</label>
                            <input type="email" id="email" name="email" value="${esc(profile.email)}" required/>
                        </div>
                        <div class="form-group">
                            <label for="employee_id">Employee ID</label>
                            <input type="text" id="employee_id" name="employee_id" value="${esc(profile.employee_id)}" readonly/>
                        </div>
                        <div class="form-group">
                            <label for="academic_rank">Academic Rank</label>
                            <input type="text" id="academic_rank" name="academic_rank" value="${esc(profile.academic_rank)}" readonly/>
                        </div>
                        <div class="form-group">
                            <label for="department">Department</label>
                            <input type="text" id="department" name="department" value="${esc(profile.department)}" readonly/>
                        </div>
                    </div>
                    <div style="margin-top:20px;display:flex;gap:12px;flex-wrap:wrap;">
                        <button type="submit" class="btn-primary" style="padding:10px 24px;border-radius:10px;background:var(--color-primary);color:#fff;border:none;font-family:inherit;font-size:0.9rem;font-weight:600;cursor:pointer;">
                            Save Changes
                        </button>
                        <button type="button" onclick="this.closest('form').reset()" class="btn-secondary" style="padding:10px 24px;border-radius:10px;background:#f1f5f9;color:#374151;border:1px solid #e2e8f0;font-family:inherit;font-size:0.9rem;font-weight:600;cursor:pointer;">
                            Reset
                        </button>
                    </div>
                </form>
        </div>`;

        html += `
        <div style="background:#fff;border:1px solid #e9eef6;border-radius:16px;padding:0;margin-top:20px;overflow:hidden;">
            <button type="button" id="toggle-password-section" onclick="
                const body = document.getElementById('password-form-body');
                const arrow = document.getElementById('password-arrow');
                const open = body.style.display !== 'none';
                body.style.display = open ? 'none' : 'block';
                arrow.style.transform = open ? 'rotate(0deg)' : 'rotate(180deg)';
            " style="width:100%;display:flex;align-items:center;justify-content:space-between;padding:20px 28px;background:none;border:none;font-family:inherit;cursor:pointer;font-size:1rem;font-weight:700;color:#111826;">
                Change Password
                <svg id="password-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18" style="transition:transform 0.2s;transform:rotate(0deg)">
                    <polyline points="6 9 12 15 18 9"/>
                </svg>
            </button>
            <div id="password-form-body" style="display:none;padding:0 28px 28px;border-top:1px solid #e9eef6;">
                <form method="POST" action="faculty-dashboard.php?tab=profile" id="password-form" style="margin-top:20px;">
                    <input type="hidden" name="action" value="change_password"/>
                    <div class="profile-form-grid">
                        <div class="form-group">
                            <label for="current_password">Current Password</label>
                            <input type="password" id="current_password" name="current_password" required/>
                        </div>
                        <div class="form-group">
                            <label for="new_password">New Password</label>
                            <input type="password" id="new_password" name="new_password" required/>
                        </div>
                        <div class="form-group">
                            <label for="confirm_password">Confirm New Password</label>
                            <input type="password" id="confirm_password" name="confirm_password" required/>
                        </div>
                    </div>
                    <div style="margin-top:20px;">
                        <button type="submit" style="padding:10px 24px;border-radius:10px;background:var(--color-primary);color:#fff;border:none;font-family:inherit;font-size:0.9rem;font-weight:600;cursor:pointer;">
                            Update Password
                        </button>
                    </div>
                </form>
            </div>
        </div>`;

        content.innerHTML = html;
    }

    // ── Evaluations ──
    function renderEvaluations() {
        let html = `
        <div class="admin-toolbar" style="margin-bottom:18px;">
            <input type="text" id="eval-search" class="admin-search" placeholder="Search by period, course, section…"/>
        </div>`;

        if (evalResults.length === 0) {
            html += emptyState('No evaluation results found for your account.');
            content.innerHTML = html;
            return;
        }

        html += `<div class="table-wrapper"><table class="admin-table" id="eval-table">
            <thead><tr>
                <th>Period</th>
                <th>Course</th>
                <th>Section</th>
                <th>Responses</th>
                <th>Avg Rating</th>
                <th>Progress</th>
            </tr></thead>
            <tbody id="eval-tbody">`;

        evalResults.forEach(r => {
            const pct = Math.min(100, Math.round((parseFloat(r.avg_rating) / 5) * 100));
            html += `<tr data-search="${esc((r.period_title + ' ' + r.course_name + ' ' + r.course_code + ' ' + r.section_code).toLowerCase())}">
                <td><span class="eval-period-badge">${esc(r.period_title)}</span></td>
                <td>
                    <strong>${esc(r.course_code)}</strong>
                    <div style="font-size:0.8rem;color:#64748b;margin-top:2px;">${esc(r.course_name)}</div>
                </td>
                <td>${esc(r.section_code)}</td>
                <td style="font-weight:600;">${esc(String(r.total_responses))}</td>
                <td>${starHtml(r.avg_rating)}&nbsp;${ratingBadge(r.avg_rating)}</td>
                <td style="min-width:140px;">
                    <div class="progress-bar-wrap">
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill" style="width:${pct}%"></div>
                        </div>
                        <span style="font-size:0.78rem;color:#64748b;white-space:nowrap;">${pct}%</span>
                    </div>
                </td>
            </tr>`;
        });

        html += `</tbody></table></div>`;
        content.innerHTML = html;

        // Search
        const searchInput = document.getElementById('eval-search');
        const tbody       = document.getElementById('eval-tbody');
        searchInput.addEventListener('input', () => {
            const q = searchInput.value.toLowerCase().trim();
            tbody.querySelectorAll('tr').forEach(row => {
                row.style.display = !q || row.dataset.search.includes(q) ? '' : 'none';
            });
        });
    }

    // ── Sections ──
    function renderSections() {
        let html = '';

        if (sections.length === 0) {
            html += emptyState('You have no assigned sections yet.');
            content.innerHTML = html;
            return;
        }

        html += `<div class="admin-section-title">${sections.length} Assigned Section${sections.length !== 1 ? 's' : ''}</div>`;
        html += `<div class="sections-grid">`;

        sections.forEach(s => {
            html += `
            <div class="section-card" data-section-id="${s.id}">
                <div class="section-card-code">${esc(s.code)}</div>
                <div class="section-card-program">${esc(s.program || '—')}</div>
                <div class="section-card-meta">
                    <span class="section-card-students">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        ${esc(String(s.student_count || 0))} Students
                    </span>
                    <span class="section-card-year">Year ${esc(String(s.year_level || '—'))}</span>
                </div>
                ${s.adviser_name ? `<div style="font-size:0.78rem;color:#94a3b8;margin-top:8px;">Adviser: ${esc(s.adviser_name)}</div>` : ''}
                <button class="section-card-view-btn" data-section-id="${s.id}" data-section-code="${esc(s.code)}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    View Students
                </button>
            </div>`;
        });

        html += `</div>`;

        // Courses assigned
        if (courses.length) {
            html += `<div class="admin-section-title" style="margin-top:32px;">Courses I Teach</div>`;
            html += `<div class="table-wrapper"><table class="admin-table">
                <thead><tr><th>Code</th><th>Course Name</th><th>Description</th></tr></thead>
                <tbody>`;
            courses.forEach(c => {
                html += `<tr>
                    <td><span class="course-tag">${esc(c.code)}</span></td>
                    <td style="font-weight:600;">${esc(c.name)}</td>
                    <td style="color:#64748b;">${esc(c.description || '—')}</td>
                </tr>`;
            });
            html += `</tbody></table></div>`;
        }

        content.innerHTML = html;

        // View students button
        content.querySelectorAll('.section-card-view-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                openSectionModal(btn.dataset.sectionId, btn.dataset.sectionCode);
            });
        });
    }

    // ── Section Students Modal ──
    const sectionModal     = document.getElementById('section-students-modal');
    const sectionModalClose = document.getElementById('section-modal-close');
    const sectionModalTitle = document.getElementById('section-modal-title');
    const sectionModalBody  = document.getElementById('section-modal-body');

    function openSectionModal(sectionId, sectionCode) {
        sectionModalTitle.textContent = `Students – ${sectionCode}`;
        sectionModalBody.innerHTML    = '<div class="loading">Loading students…</div>';
        sectionModal.hidden = false;
        document.body.style.overflow = 'hidden';

        fetch(`faculty-dashboard.php?json=section_students&section_id=${encodeURIComponent(sectionId)}`)
            .then(r => r.json())
            .then(data => {
                const students = data.students || [];
                if (students.length === 0) {
                    sectionModalBody.innerHTML = '<p style="color:#94a3b8;text-align:center;padding:24px 0;">No students in this section yet.</p>';
                    return;
                }
                let html = `<p style="font-size:0.82rem;color:#64748b;margin-bottom:12px;">${students.length} student${students.length !== 1 ? 's' : ''} enrolled</p>`;
                students.forEach(s => {
                    html += `
                    <div class="student-list-item">
                        <div class="student-list-avatar">${initials(s.full_name)}</div>
                        <div>
                            <div class="student-list-name">${esc(s.full_name)}</div>
                            <div class="student-list-email">${esc(s.email)}</div>
                        </div>
                    </div>`;
                });
                sectionModalBody.innerHTML = html;
            })
            .catch(() => {
                sectionModalBody.innerHTML = '<p style="color:#ef4444;text-align:center;padding:24px 0;">Failed to load students.</p>';
            });
    }

    function closeModal() {
        sectionModal.hidden = true;
        document.body.style.overflow = '';
    }

    sectionModalClose.addEventListener('click', closeModal);
    sectionModal.addEventListener('click', e => { if (e.target === sectionModal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !sectionModal.hidden) closeModal(); });

    // ── Icon helpers ──
    function iconSections()  { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`; }
    function iconCourses()   { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`; }
    function iconResponses() { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`; }
    function iconStar()      { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`; }

    function emptyState(msg) {
        return `<div class="teacher-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p>${esc(msg)}</p>
        </div>`;
    }

    // ── Initial render ──
    navigate(activeTab);
});