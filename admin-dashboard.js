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
    function filterSubjectsBySelectedSections() {
        const sectionCheckboxes = modal.querySelectorAll('input[name="section_ids[]"]');
        const courseItems       = modal.querySelectorAll('.course-checkbox-item');
        const hint              = modal.querySelector('#subjects-filter-hint');
        const noMsg             = modal.querySelector('#no-subjects-msg');
        const grid              = modal.querySelector('#add-courses-grid');

        if (!courseItems.length) return;

        // Collect grades + strands from checked sections
        const checkedGrades  = new Set();
        const checkedStrands = new Set();

        sectionCheckboxes.forEach(cb => {
            if (!cb.checked) return;
            const label = cb.closest('label');
            if (!label) return;
            const text  = (label.querySelector('span')?.textContent || '').toUpperCase();

            // Detect grade from section code e.g. GRADE7-*, GRADE11-*
            const gradeMatch = text.match(/GRADE(\d+)/);
            if (gradeMatch) checkedGrades.add(parseInt(gradeMatch[1]));

            // Detect strand: STEM, ABM, TVL, HUMSS in code or program
            ['STEM','ABM','TVL','HUMSS'].forEach(s => {
                if (text.includes(s)) checkedStrands.add(s);
            });
        });

        const noneChecked = checkedGrades.size === 0;

        // Show hint when nothing selected
        if (hint) hint.style.display = noneChecked ? '' : 'none';

        let visibleCount = 0;
        courseItems.forEach(item => {
            if (noneChecked) {
                // No section selected → hide all subjects, uncheck them
                item.classList.add('subject-hidden');
                item.querySelector('input').checked = false;
                return;
            }

            const itemGrade  = parseInt(item.dataset.grade || '0');
            const itemStrand = (item.dataset.strand || '').toUpperCase();

            let show = false;

            if (checkedGrades.has(itemGrade)) {
                // For SHS grades 11/12: show only if strand matches (or subject has no strand = general)
                if (itemGrade === 11 || itemGrade === 12) {
                    if (!itemStrand || checkedStrands.has(itemStrand)) {
                        show = true;
                    }
                } else {
                    show = true;
                }
            }

            if (show) {
                item.classList.remove('subject-hidden');
                visibleCount++;
            } else {
                item.classList.add('subject-hidden');
                item.querySelector('input').checked = false;
            }
        });

        if (noMsg) noMsg.style.display = (!noneChecked && visibleCount === 0) ? '' : 'none';
        if (grid)  grid.style.display  = (noneChecked || visibleCount === 0) ? 'none' : '';
    }

    function filterEditSections() {
    const searchInput  = document.getElementById('edit-sections-search');
    const gradeFilter  = document.getElementById('edit-sections-grade-filter');
    const strandFilter = document.getElementById('edit-sections-strand-filter');
    const grid         = document.getElementById('edit-sections-grid');
    if (!searchInput || !grid) return;

    const searchTerm     = searchInput.value.toLowerCase().trim();
    const selectedGrade  = gradeFilter.value;
    const selectedStrand = strandFilter.value;
    let anyVisible = false;

    grid.querySelectorAll('.section-grade-group').forEach(gradeGroup => {
        const gradeText  = gradeGroup.querySelector('.section-grade-label')?.textContent || '';
        const gradeMatch = gradeText.match(/Grade (\d+)/);
        const grade      = gradeMatch ? gradeMatch[1] : '';
        let groupVisible = false;

        const strandGroups = gradeGroup.querySelectorAll('.section-strand-group');
        if (strandGroups.length > 0) {
            strandGroups.forEach(sg => {
                const strand = sg.querySelector('.section-strand-label')?.textContent.trim() || '';
                const gradeOk  = !selectedGrade  || grade  === selectedGrade;
                const strandOk = !selectedStrand || strand === selectedStrand;
                if (!gradeOk || !strandOk) { sg.style.display = 'none'; return; }
                sg.style.display = '';
                let sgVisible = false;
                sg.querySelectorAll('.checkbox-item').forEach(cb => {
                    const text = (cb.querySelector('span')?.textContent || '').toLowerCase();
                    const show = !searchTerm || text.includes(searchTerm) || strand.toLowerCase().includes(searchTerm);
                    cb.classList.toggle('filtered-out', !show);
                    if (show) { sgVisible = true; anyVisible = true; }
                });
                if (!sgVisible) sg.style.display = 'none';
                else groupVisible = true;
            });
        } else {
            const gradeOk = !selectedGrade || grade === selectedGrade;
            if (!gradeOk) { gradeGroup.classList.add('filtered-out-group'); return; }
            gradeGroup.classList.remove('filtered-out-group');
            gradeGroup.querySelectorAll('.checkbox-item').forEach(cb => {
                const text = (cb.querySelector('span')?.textContent || '').toLowerCase();
                const show = !searchTerm || text.includes(searchTerm);
                cb.classList.toggle('filtered-out', !show);
                if (show) { groupVisible = true; anyVisible = true; }
            });
        }
        gradeGroup.classList.toggle('filtered-out-group', !groupVisible);
    });

    // No results message
    let noMsg = document.getElementById('edit-sections-no-results');
    if (!anyVisible) {
        if (!noMsg) {
            noMsg = document.createElement('div');
            noMsg.id = 'edit-sections-no-results';
            noMsg.className = 'sections-no-results visible';
            noMsg.textContent = 'No sections match your search or filters.';
            grid.parentElement.insertBefore(noMsg, grid);
        } else { noMsg.classList.add('visible'); }
    } else if (noMsg) { noMsg.classList.remove('visible'); }
}

    function filterEditSubjectsBySelectedSections() {
    const editModal      = document.getElementById('edit-teacher-modal');
    if (!editModal) return;
    const sectionCbs     = editModal.querySelectorAll('input[name="section_ids[]"]');
    const courseItems    = editModal.querySelectorAll('.edit-course-checkbox-item');
    const hint           = editModal.querySelector('#edit-subjects-filter-hint');
    const noMsg          = editModal.querySelector('#edit-no-subjects-msg');
    const grid           = editModal.querySelector('#edit-courses-grid');

    if (!courseItems.length) return;

    const checkedGrades  = new Set();
    const checkedStrands = new Set();

    sectionCbs.forEach(cb => {
        if (!cb.checked) return;
        const label = cb.closest('label');
        if (!label) return;
        const text = (label.querySelector('span')?.textContent || '').toUpperCase();
        const gradeMatch = text.match(/GRADE(\d+)/);
        if (gradeMatch) checkedGrades.add(parseInt(gradeMatch[1]));
        ['STEM','ABM','TVL','HUMSS'].forEach(s => {
            if (text.includes(s)) checkedStrands.add(s);
        });
    });

    const noneChecked = checkedGrades.size === 0;
    if (hint) hint.style.display = noneChecked ? '' : 'none';

    let visibleCount = 0;
    courseItems.forEach(item => {
        if (noneChecked) {
            item.classList.add('subject-hidden');
            item.querySelector('input').checked = false;
            return;
        }
        const itemGrade  = parseInt(item.dataset.grade || '0');
        const itemStrand = (item.dataset.strand || '').toUpperCase().trim();
        let show = false;
        if (checkedGrades.has(itemGrade)) {
            if (itemGrade === 11 || itemGrade === 12) {
                if (!itemStrand || checkedStrands.has(itemStrand)) show = true;
            } else {
                show = true;
            }
        }
        if (show) {
            item.classList.remove('subject-hidden');
            visibleCount++;
        } else {
            item.classList.add('subject-hidden');
            item.querySelector('input').checked = false;
        }
    });

    if (noMsg) noMsg.style.display = (!noneChecked && visibleCount === 0) ? '' : 'none';
    if (grid)  grid.style.display  = (noneChecked || visibleCount === 0) ? 'none' : '';
}

    function openModal() {
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
        // Reset subject filter on open
        filterSubjectsBySelectedSections();
        // Wire section checkboxes to re-filter subjects on change
        modal.querySelectorAll('input[name="section_ids[]"]').forEach(cb => {
            cb.removeEventListener('change', filterSubjectsBySelectedSections);
            cb.addEventListener('change', filterSubjectsBySelectedSections);
        });
    }
    function closeModal() {
        modal.hidden = true;
        document.body.style.overflow = '';
        
        // Clear search and filters when modal closes
        if (sectionsSearchInput) sectionsSearchInput.value = '';
        if (sectionsGradeFilter) sectionsGradeFilter.value = '';
        if (sectionsStrandFilter) sectionsStrandFilter.value = '';
        // Uncheck all section and course checkboxes
        modal.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        // Re-run filter to reset subject visibility
        filterSubjectsBySelectedSections();
        filterSections();
    }
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
    function closeEditModal() {
    const m = document.getElementById('edit-teacher-modal');
    if (m) {
        m.hidden = true;
        document.body.style.overflow = '';
        m.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        filterEditSubjectsBySelectedSections();
    }
}

    const es = document.getElementById('edit-sections-search');
const eg = document.getElementById('edit-sections-grade-filter');
const est = document.getElementById('edit-sections-strand-filter');
if (es) es.value = '';
if (eg) eg.value = '';
if (est) est.value = '';
filterEditSections();

    document.getElementById('edit-modal-close')?.addEventListener('click', closeEditModal);
    document.getElementById('edit-modal-cancel')?.addEventListener('click', closeEditModal);
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

    // Class Sections Search & Filter
    
    const sectionsSearchInput  = document.getElementById('sections-search-input');
    const sectionsGradeFilter  = document.getElementById('sections-grade-filter');
    const sectionsStrandFilter = document.getElementById('sections-strand-filter');
    const sectionsGrid         = document.querySelector('.sections-grid');
    const sectionCheckboxes    = document.querySelectorAll('.sections-grid .checkbox-item');
    const sectionGradeGroups   = document.querySelectorAll('.section-grade-group');

    function filterSections() {
        const searchTerm = sectionsSearchInput.value.toLowerCase().trim();
        const selectedGrade = sectionsGradeFilter.value;
        const selectedStrand = sectionsStrandFilter.value;

        let anyVisible = false;

        // Loop through each grade group
        sectionGradeGroups.forEach(gradeGroup => {
            const gradeLabel = gradeGroup.querySelector('.section-grade-label');
            const gradeText = gradeLabel ? gradeLabel.textContent : '';
            const gradeMatch = gradeText.match(/Grade (\d+)/);
            const grade = gradeMatch ? gradeMatch[1] : '';

            let groupHasVisibleItems = false;

            // Handle Grade 11-12 with strands
            const strandGroups = gradeGroup.querySelectorAll('.section-strand-group');
            if (strandGroups.length > 0) {
                // This is a Grade 11-12 group with strands
                strandGroups.forEach(strandGroup => {
                    const strandLabel = strandGroup.querySelector('.section-strand-label');
                    const strand = strandLabel ? strandLabel.textContent.trim() : '';

                    // Check if grade and strand match filters
                    const gradeMatchesFilter = !selectedGrade || grade === selectedGrade;
                    const strandMatchesFilter = !selectedStrand || strand === selectedStrand;

                    if (!gradeMatchesFilter || !strandMatchesFilter) {
                        strandGroup.style.display = 'none';
                        return;
                    }

                    strandGroup.style.display = '';
                    const checkboxes = strandGroup.querySelectorAll('.checkbox-item');
                    let strandHasVisibleItems = false;

                    checkboxes.forEach(checkbox => {
                        const label = checkbox.querySelector('span');
                        const text = label ? label.textContent.toLowerCase() : '';
                        const code = checkbox.querySelector('input').value;

                        // Check if text matches search term
                        const matchesSearch = !searchTerm || 
                                            text.includes(searchTerm) || 
                                            code.toLowerCase().includes(searchTerm) ||
                                            strand.toLowerCase().includes(searchTerm);

                        if (matchesSearch) {
                            checkbox.classList.remove('filtered-out');
                            strandHasVisibleItems = true;
                            anyVisible = true;
                        } else {
                            checkbox.classList.add('filtered-out');
                        }
                    });

                    if (!strandHasVisibleItems) {
                        strandGroup.style.display = 'none';
                    } else {
                        groupHasVisibleItems = true;
                    }
                });
            } else {
                // This is Grade 7-10 (no strands)
                const gradeMatchesFilter = !selectedGrade || grade === selectedGrade;
                
                if (!gradeMatchesFilter) {
                    gradeGroup.classList.add('filtered-out-group');
                    return;
                }

                gradeGroup.classList.remove('filtered-out-group');
                const checkboxes = gradeGroup.querySelectorAll('.checkbox-item');

                checkboxes.forEach(checkbox => {
                    const label = checkbox.querySelector('span');
                    const text = label ? label.textContent.toLowerCase() : '';
                    const code = checkbox.querySelector('input').value;

                    const matchesSearch = !searchTerm || 
                                        text.includes(searchTerm) || 
                                        code.toLowerCase().includes(searchTerm);

                    if (matchesSearch) {
                        checkbox.classList.remove('filtered-out');
                        groupHasVisibleItems = true;
                        anyVisible = true;
                    } else {
                        checkbox.classList.add('filtered-out');
                    }
                });
            }

            if (!groupHasVisibleItems) {
                gradeGroup.classList.add('filtered-out-group');
            } else {
                gradeGroup.classList.remove('filtered-out-group');
            }
        });

        // Show/hide "no results" message
        let noResultsMsg = document.getElementById('sections-no-results-msg');
        if (!anyVisible) {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('div');
                noResultsMsg.id = 'sections-no-results-msg';
                noResultsMsg.className = 'sections-no-results visible';
                noResultsMsg.textContent = 'No sections match your search or filters.';
                sectionsGrid.parentElement.insertBefore(noResultsMsg, sectionsGrid);
            } else {
                noResultsMsg.classList.add('visible');
            }
        } else {
            if (noResultsMsg) {
                noResultsMsg.classList.remove('visible');
            }
        }
    }

    // Attach event listeners
    if (sectionsSearchInput) {
        sectionsSearchInput.addEventListener('input', filterSections);
        sectionsGradeFilter.addEventListener('change', filterSections);
        sectionsStrandFilter.addEventListener('change', filterSections);
    }

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
    const modules = { overview: renderOverview, teachers: renderTeachers, sections: renderSections, subjects: renderSubjects }
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
                    <button type="button" class="action-btn action-btn-edit edit-btn"
                        data-id="${t.id}"
                        data-name="${t.full_name}"
                        data-rank="${t.academic_rank || ''}">
                        Edit
                    </button>
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
    tbody.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById('edit-teacher-id').value    = btn.dataset.id;
        document.getElementById('edit-teacher-name').value  = btn.dataset.name;
        document.getElementById('edit-academic-rank').value = btn.dataset.rank;
        document.getElementById('edit-password').value      = '';
        // Uncheck all boxes and reset subject filter
        const editModal = document.getElementById('edit-teacher-modal');
        editModal.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        filterEditSubjectsBySelectedSections();
        // Wire section checkboxes to re-filter subjects on change
        editModal.querySelectorAll('input[name="section_ids[]"]').forEach(cb => {
            cb.removeEventListener('change', filterEditSubjectsBySelectedSections);
            cb.addEventListener('change', filterEditSubjectsBySelectedSections);
        });
        // Wire search/filter for edit sections
document.getElementById('edit-sections-search')?.addEventListener('input', filterEditSections);
document.getElementById('edit-sections-grade-filter')?.addEventListener('change', filterEditSections);
document.getElementById('edit-sections-strand-filter')?.addEventListener('change', filterEditSections);
        editModal.hidden = false;
        document.body.style.overflow = 'hidden';
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
    function renderSubjects() {
    const subjects = data.subjects || [];
    const urlMsg   = data.urlMsg   || '';

    // ── Helpers ──────────────────────────────────────────────────────────────

    function groupSubjects(list) {
        const grouped = {};
        list.forEach(s => {
            const g = s.grade_level;
            if (!grouped[g]) grouped[g] = { strands: {}, plain: [] };
            if (s.strand) {
                if (!grouped[g].strands[s.strand]) grouped[g].strands[s.strand] = [];
                grouped[g].strands[s.strand].push(s);
            } else {
                grouped[g].plain.push(s);
            }
        });
        return grouped;
    }

    function subjectChip(s) {
        return `<div class="subject-chip">
            <span class="subject-chip-name">${s.name}</span>
            ${s.description ? `<span class="subject-chip-desc">${s.description}</span>` : ''}
            <button class="subject-chip-delete" data-id="${s.id}" data-name="${s.name.replace(/"/g,'&quot;')}" title="Delete">&#10005;</button>
        </div>`;
    }

    function renderCards(list) {
        const grouped = groupSubjects(list);
        const grades  = Object.keys(grouped).sort((a, b) => a - b);
        if (!grades.length) return `<div class="module-card subjects-empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="subjects-empty-icon"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            <p class="empty-table-msg">No subjects found for this selection.</p>
        </div>`;

        return grades.map(g => {
            const hasStrands = Object.keys(grouped[g].strands).length > 0;
            const strandBlocks = Object.keys(grouped[g].strands).sort().map(strand => `
                <div class="subject-strand-block">
                    <div class="subject-strand-label">${strand}</div>
                    <div class="subjects-chip-list">
                        ${grouped[g].strands[strand].map(s => subjectChip(s)).join('')}
                    </div>
                </div>`).join('');
            const plainBlock = grouped[g].plain.length ? `
                <div class="subjects-chip-list">
                    ${grouped[g].plain.map(s => subjectChip(s)).join('')}
                </div>` : '';

            return `
            <div class="module-card subject-grade-card" style="margin-bottom:20px">
                <div class="admin-section-title">
                    Grade ${g}
                    <span style="font-size:0.78rem;color:#94a3b8;font-weight:500">
                        ${grouped[g].plain.length + Object.values(grouped[g].strands).flat().length} subject(s)
                    </span>
                </div>
                ${hasStrands ? strandBlocks : plainBlock}
            </div>`;
        }).join('');
    }

    // ── Shell HTML ────────────────────────────────────────────────────────────

    content.innerHTML = `
    ${urlMsg === 'subject_deleted' ? `<div class="flash-msg success flash-auto-dismiss">Subject deleted successfully.</div>` : ''}
    ${flashHTML()}

    <div class="subjects-filter-bar">

        <div class="subjects-filter-steps">

            <!-- Step 1: Grade -->
            <div class="subjects-filter-step">
                <label class="subjects-filter-label" for="subject-grade-filter">
                    <span class="subjects-step-badge">1</span> Grade Level
                </label>
                <select id="subject-grade-filter" class="subjects-filter-select-lg">
                    <option value="">— Select Grade —</option>
                    ${[7,8,9,10,11,12].map(g => `<option value="${g}">Grade ${g}</option>`).join('')}
                </select>
            </div>

            <!-- Step 2: Strand (hidden until Grade 11/12 selected) -->
            <div class="subjects-filter-step subjects-strand-step" id="strand-filter-step">
                <label class="subjects-filter-label" for="subject-strand-filter">
                    <span class="subjects-step-badge">2</span> Strand / Track
                </label>
                <select id="subject-strand-filter" class="subjects-filter-select-lg">
                    <option value="">— All Strands —</option>
                    ${['STEM','ABM','TVL','HUMSS'].map(s => `<option value="${s}">${s}</option>`).join('')}
                </select>
            </div>

            <!-- Search (always visible once grade selected) -->
            <div class="subjects-filter-step subjects-search-step" id="subject-search-step">
                <label class="subjects-filter-label" for="subject-search">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;margin-right:4px;vertical-align:middle"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    Search
                </label>
                <input type="text" id="subject-search" placeholder="Filter by subject name..." class="subjects-search-input-lg"/>
            </div>

        </div>

        <div style="display:flex;gap:8px;align-items:flex-end">
            <button class="btn btn-outline-green" id="import-subjects-csv-btn" style="align-self:flex-end">&#8593; Import CSV</button>
            <button class="btn btn-primary" id="add-subject-btn" style="align-self:flex-end">+ Add Subject</button>
        </div>
    </div>

    <!-- Prompt shown before any grade is selected -->
    <div id="subjects-no-grade-prompt" class="subjects-grade-prompt">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="subjects-empty-icon"><circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/></svg>
        <p>Select a <strong>Grade Level</strong> above to view its subjects.</p>
    </div>

    <div id="subjects-list-container" style="display:none">
        <!-- populated by applyFilters() -->
    </div>

    <!-- Add Subject Modal -->
    <div class="modal-overlay" id="subject-modal" hidden>
        <div class="modal" style="max-width:480px">
            <div class="modal-header">
                <h2>Add New Subject</h2>
                <button class="modal-close" id="subject-modal-close">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
            <div class="modal-body">
                <form method="POST" action="admin-dashboard.php" id="subject-form">
                    <input type="hidden" name="action" value="add_subject"/>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Grade Level <span class="required">*</span></label>
                            <select name="subject_grade" id="subject-grade-select" required>
                                <option value="">— Select —</option>
                                ${[7,8,9,10,11,12].map(g => `<option value="${g}">Grade ${g}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group subjects-modal-strand-group" id="strand-group">
                            <label>Strand / Course</label>
                            <select name="subject_strand" id="subject-strand-select">
                                <option value="">— General —</option>
                                ${['STEM','ABM','TVL','HUMSS'].map(s => `<option value="${s}">${s}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Subject Name <span class="required">*</span></label>
                        <input type="text" name="subject_name" placeholder="e.g. General Mathematics" required/>
                    </div>
                    <div class="form-group">
                        <label>Description <span style="color:#94a3b8;font-weight:400">(optional)</span></label>
                        <input type="text" name="subject_desc" placeholder="Short description"/>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-outline" id="subject-modal-cancel">Cancel</button>
                        <button type="submit" class="btn btn-primary">Add Subject</button>
                    </div>
                </form>
            </div>
        </div>
    </div>`;

    // ── Wire Add Modal ────────────────────────────────────────────────────────

    const modal       = document.getElementById('subject-modal');
    const gradeSelect = document.getElementById('subject-grade-select');
    const strandGroup = document.getElementById('strand-group');

    document.getElementById('add-subject-btn').addEventListener('click', () => modal.hidden = false);
    document.getElementById('subject-modal-close').addEventListener('click', () => modal.hidden = true);
    document.getElementById('subject-modal-cancel').addEventListener('click', () => modal.hidden = true);
    modal.addEventListener('click', e => { if (e.target === modal) modal.hidden = true; });

    // ── Wire Subjects CSV Import Modal ───────────────────────────────────────
    // Inject CSV modal into DOM (outside content to avoid re-render issues)
    if (!document.getElementById('subjects-csv-import-modal')) {
        const csvModalEl = document.createElement('div');
        csvModalEl.innerHTML = `
        <div class="modal-overlay" id="subjects-csv-import-modal" hidden>
            <div class="modal" style="max-width:540px">
                <div class="modal-header">
                    <h2>Import Subjects via CSV</h2>
                    <button class="modal-close" id="subjects-csv-modal-close">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="csv-format-box">
                        <div class="csv-format-title">CSV Columns</div>
                        <div class="csv-cols-grid">
                            <div class="csv-col-item csv-col-required"><span class="csv-col-name">name</span><span class="csv-col-badge csv-badge-required">required</span></div>
                            <div class="csv-col-item csv-col-required"><span class="csv-col-name">grade_level</span><span class="csv-col-badge csv-badge-required">required</span></div>
                            <div class="csv-col-item"><span class="csv-col-name">strand</span><span class="csv-col-badge csv-badge-optional">optional</span></div>
                            <div class="csv-col-item"><span class="csv-col-name">description</span><span class="csv-col-badge csv-badge-optional">optional</span></div>
                        </div>
                        <p class="csv-hint">
                            Leave <code>strand</code> blank for general subjects (Grades 7–10 or cross-strand SHS).<br>
                            Use <code>STEM</code>, <code>ABM</code>, <code>TVL</code>, or <code>HUMSS</code> for SHS strand-specific subjects.<br>
                            Existing subjects with the same name + grade + strand will be <strong>updated</strong>.
                        </p>
                        <a href="admin-dashboard.php?action=download_subjects_template" class="csv-template-link">&#8595; Download Sample CSV Template</a>
                    </div>
                    <form method="POST" action="admin-dashboard.php" enctype="multipart/form-data" id="subjects-csv-form">
                        <input type="hidden" name="action" value="import_subjects_csv"/>
                        <div class="csv-dropzone" id="subjects-csv-dropzone">
                            <p class="csv-drop-text">Drag &amp; drop your CSV here, or <label for="subjects_csv_file" class="csv-browse-label">browse</label></p>
                            <p class="csv-drop-hint" id="subjects-csv-file-name">Only .csv files accepted</p>
                            <input type="file" name="subjects_csv_file" id="subjects_csv_file" accept=".csv" class="csv-file-input"/>
                        </div>
                        <div class="modal-actions">
                            <button type="button" class="btn btn-outline" id="subjects-csv-modal-cancel">Cancel</button>
                            <button type="submit" class="btn btn-primary" id="subjects-csv-submit" disabled>Import Subjects</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>`;
        document.body.appendChild(csvModalEl.firstElementChild);
    }

    const subCsvModal    = document.getElementById('subjects-csv-import-modal');
    const subCsvClose    = document.getElementById('subjects-csv-modal-close');
    const subCsvCancel   = document.getElementById('subjects-csv-modal-cancel');
    const subCsvInput    = document.getElementById('subjects_csv_file');
    const subCsvSubmit   = document.getElementById('subjects-csv-submit');
    const subCsvFileName = document.getElementById('subjects-csv-file-name');
    const subCsvDropzone = document.getElementById('subjects-csv-dropzone');

    function openSubCsvModal()  { subCsvModal.hidden = false; document.body.style.overflow = 'hidden'; }
    function closeSubCsvModal() { subCsvModal.hidden = true;  document.body.style.overflow = ''; }

    subCsvClose.addEventListener('click', closeSubCsvModal);
    subCsvCancel.addEventListener('click', closeSubCsvModal);
    subCsvModal.addEventListener('click', e => { if (e.target === subCsvModal) closeSubCsvModal(); });

    subCsvInput.addEventListener('change', () => {
        const file = subCsvInput.files[0];
        if (file) {
            subCsvFileName.textContent = file.name;
            subCsvDropzone.classList.add('csv-dropzone-ready');
            subCsvSubmit.disabled = false;
        } else {
            subCsvFileName.textContent = 'Only .csv files accepted';
            subCsvDropzone.classList.remove('csv-dropzone-ready');
            subCsvSubmit.disabled = true;
        }
    });
    subCsvDropzone.addEventListener('dragover', e => { e.preventDefault(); subCsvDropzone.classList.add('csv-dropzone-drag'); });
    subCsvDropzone.addEventListener('dragleave', e => { if (!subCsvDropzone.contains(e.relatedTarget)) subCsvDropzone.classList.remove('csv-dropzone-drag'); });
    subCsvDropzone.addEventListener('drop', e => {
        e.preventDefault();
        subCsvDropzone.classList.remove('csv-dropzone-drag');
        const file = e.dataTransfer.files[0];
        if (file && file.name.toLowerCase().endsWith('.csv')) {
            try { const dt = new DataTransfer(); dt.items.add(file); subCsvInput.files = dt.files; } catch(err) {}
            subCsvFileName.textContent = file.name;
            subCsvDropzone.classList.add('csv-dropzone-ready');
            subCsvSubmit.disabled = false;
        }
    });

    document.getElementById('import-subjects-csv-btn').addEventListener('click', openSubCsvModal);

    gradeSelect.addEventListener('change', () => {
        const v = parseInt(gradeSelect.value);
        if (v === 11 || v === 12) {
            strandGroup.classList.add('visible');
        } else {
            strandGroup.classList.remove('visible');
            document.getElementById('subject-strand-select').value = '';
        }
    });

    // ── Filter Logic ──────────────────────────────────────────────────────────

    const gradeFilter      = document.getElementById('subject-grade-filter');
    const strandFilter     = document.getElementById('subject-strand-filter');
    const strandFilterStep = document.getElementById('strand-filter-step');
    const searchInputEl    = document.getElementById('subject-search');
    const searchStep       = document.getElementById('subject-search-step');
    const listContainer    = document.getElementById('subjects-list-container');
    const noGradePrompt    = document.getElementById('subjects-no-grade-prompt');

    function applyFilters() {
        const g = gradeFilter.value;
        const s = strandFilter.value;
        const q = searchInputEl.value.toLowerCase().trim();
        const isSHS = (g === '11' || g === '12');

        // Show/hide strand step with animation
        if (isSHS) {
            strandFilterStep.classList.add('visible');
        } else {
            strandFilterStep.classList.remove('visible');
            strandFilter.value = '';
        }

        // Show/hide search step
        if (g) {
            searchStep.classList.add('visible');
        } else {
            searchStep.classList.remove('visible');
            searchInputEl.value = '';
        }

        // Show prompt vs list
        if (!g) {
            noGradePrompt.style.display = '';
            listContainer.style.display = 'none';
            return;
        }

        noGradePrompt.style.display = 'none';
        listContainer.style.display = '';

        // Apply filters
        let filtered = subjects;
        filtered = filtered.filter(x => String(x.grade_level) === g);

        // For Grade 11/12: if a strand is selected, filter by it;
        // if none selected, show all strands for that grade
        if (isSHS && s) {
            filtered = filtered.filter(x => x.strand === s);
        }

        if (q) {
            filtered = filtered.filter(x =>
                x.name.toLowerCase().includes(q) ||
                (x.description || '').toLowerCase().includes(q)
            );
        }

        listContainer.innerHTML = renderCards(filtered);
        wireDeleteBtns();
    }

    gradeFilter.addEventListener('change', applyFilters);
    strandFilter.addEventListener('change', applyFilters);
    searchInputEl.addEventListener('input', applyFilters);

    // ── Delete ────────────────────────────────────────────────────────────────

    function wireDeleteBtns() {
        document.querySelectorAll('.subject-chip-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                showConfirm('Delete Subject', `Delete "${btn.dataset.name}"? This cannot be undone.`, () => {
                    const form = document.createElement('form');
                    form.method = 'POST'; form.action = 'admin-dashboard.php';
                    form.innerHTML = `<input type="hidden" name="action" value="delete_subject"/>
                                      <input type="hidden" name="subject_id" value="${btn.dataset.id}"/>`;
                    document.body.appendChild(form);
                    form.submit();
                });
            });
        });
    }
    wireDeleteBtns();

    // Flash auto-dismiss
    document.querySelectorAll('.flash-auto-dismiss').forEach(el => {
        setTimeout(() => el.style.display = 'none', 4000);
    });
}
    });
    function toggleSections() {
    const content = document.getElementById('sectionsCollapsible');
    const arrow = document.getElementById('sectionsArrow');
    const text = document.getElementById('sectionsToggleText');
    const isExpanded = content.classList.toggle('expanded');
    arrow.classList.toggle('expanded');
    text.textContent = isExpanded ? 'Show less' : 'Show more';
}