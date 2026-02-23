// dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.querySelector('.sidebar-toggle');
    const links = document.querySelectorAll('.nav-link');
    const tooltipElements = document.querySelectorAll('.tooltip-enabled');
    const content = document.getElementById('module-content');
    const title = document.getElementById('module-title');
    const logoutLink = document.querySelector('.logout-btn');

    // ── Sidebar persistence (matches admin dashboard) ──
    const SIDEBAR_KEY = 'studentSidebarCollapsed';

    if (localStorage.getItem(SIDEBAR_KEY) === 'true') {
        sidebar.classList.add('collapsed');
    }

    // Toggle sidebar collapse/expand
    toggleBtn.addEventListener('click', () => {
        const isNowCollapsed = sidebar.classList.toggle('collapsed');
        localStorage.setItem(SIDEBAR_KEY, String(isNowCollapsed));
        updateTooltipState();
    });

    if (logoutLink) {
        logoutLink.addEventListener('click', event => {
            const shouldLogout = window.confirm('Are you sure you want to log out?');
            if (!shouldLogout) {
                event.preventDefault();
                event.stopPropagation();
            }
        });
    }

    const seedData = window.__APP_DATA__ || {};

    const studentProfile = {
        name: seedData.studentProfile?.name || 'Student',
        studentNumber: seedData.studentProfile?.studentNumber || '',
        courseNumber: seedData.studentProfile?.courseNumber || '',
        email: seedData.studentProfile?.email || '',
        courseProgram: seedData.studentProfile?.courseProgram || '',
        yearLevel: seedData.studentProfile?.yearLevel || null,
        classSection: seedData.studentProfile?.classSection || null
    };

    const modules = {
        profile: renderProfileModule,
        evaluate: renderEvaluateModuleShell,
        settings: renderSettingsModule
    };

    const evaluationCourses = Array.isArray(seedData.evaluationCourses) && seedData.evaluationCourses.length
        ? seedData.evaluationCourses
        : [];

    const defaultSettings = {
        receiveEmailReminders: true,
        notifyPeriodClose: true,
        profileVisibleToFaculty: true,
        submitAnonymously: true,
        themePreference: 'light',
        languagePreference: 'en'
    };

    const userSettings = {
        ...defaultSettings,
        ...(seedData.userSettings || {})
    };

    const likertOptions = [
        { value: '1', label: '1 - Very Dissatisfied' },
        { value: '2', label: '2 - Dissatisfied' },
        { value: '3', label: '3 - Good' },
        { value: '4', label: '4 - Satisfied' },
        { value: '5', label: '5 - Very Satisfied' }
    ];

    const likertStatements = [
        { id: 'clarity', text: 'Communicates course objectives clearly.' },
        { id: 'feedback', text: 'Provides timely and constructive feedback.' },
        { id: 'engagement', text: 'Encourages student participation and engagement.' },
        { id: 'support', text: 'Offers support and guidance when needed.' }
    ];
    

    let evaluationState = null;
    let evaluationUI = null;

    links.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const module = link.dataset.module;

            // Update active state
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Update title
            title.textContent = link.querySelector('span').textContent;

            // Render module
            const moduleRenderer = modules[module];
            if (typeof moduleRenderer === 'function') {
                moduleRenderer();
            } else if (typeof moduleRenderer === 'string') {
                content.innerHTML = moduleRenderer;
                if (module === 'evaluate') {
                    evaluationState = createInitialEvaluationState();
                    initEvaluateModule();
                }
            } else {
                content.innerHTML = '<p>Module coming soon...</p>';
            }

            if (module !== 'evaluate') {
                evaluationState = null;
                evaluationUI = null;
            }
        });
    });

    // Load default module
    document.querySelector('[data-module="profile"]').click();
    updateTooltipState();

    function renderProfileModule() {
    evaluationState = null;
    evaluationUI = null;

    const studentNumberDisplay = formatProfileValue(studentProfile.studentNumber);
    const courseNumberDisplay = formatProfileValue(studentProfile.courseNumber);
    const emailDisplay = formatProfileValue(studentProfile.email);
    const courseProgramDisplay = formatProfileValue(studentProfile.courseProgram);
    const yearLevelDisplay = typeof studentProfile.yearLevel === 'number'
        ? `Year ${studentProfile.yearLevel}`
        : formatProfileValue('');
    const classSectionDisplay = studentProfile.classSection?.code
        ? `${studentProfile.classSection.code}`
        : formatProfileValue('');

    // Hide Course Number for Grade 7-10 (Junior High School)
    const showCourseNumber = !(studentProfile.yearLevel >= 7 && studentProfile.yearLevel <= 10);
    
    // Show Program field for Grade 9-12 only
    const showProgram = studentProfile.yearLevel >= 9 && studentProfile.yearLevel <= 12;

    content.innerHTML = `
        <section class="profile-summary">
            <article class="module-card profile-card profile-card--highlight">
                <div class="profile-card-header">
                    <h2>${studentProfile.name}</h2>
                    <p class="profile-helper">Information is read-only. Contact the registrar to request updates.</p>
                </div>
                <div class="profile-identifiers">
                    <div class="profile-stat">
                        <span class="profile-label">Student Number</span>
                        <span class="profile-value" aria-live="polite">${studentNumberDisplay}</span>
                    </div>
                    ${showCourseNumber ? `
                    <div class="profile-stat">
                        <span class="profile-label">Course Number</span>
                        <span class="profile-value" aria-live="polite">${courseNumberDisplay}</span>
                    </div>
                    ` : ''}
                </div>
            </article>

            <article class="module-card profile-card">
                <h3>Contact Details</h3>
                <div class="profile-info-grid">
                    <div class="profile-info-item">
                        <span class="profile-label">Email</span>
                        <span class="profile-value">${emailDisplay}</span>
                    </div>
                    ${showProgram ? `
                    <div class="profile-info-item">
                        <span class="profile-label">Program</span>
                        <span class="profile-value">${courseProgramDisplay}</span>
                    </div>
                    ` : ''}
                    <div class="profile-info-item">
                        <span class="profile-label">Year Level</span>
                        <span class="profile-value">${yearLevelDisplay}</span>
                    </div>
                    <div class="profile-info-item">
                        <span class="profile-label">Class Section</span>
                        <span class="profile-value">${classSectionDisplay}</span>
                    </div>
                    <div class="profile-info-item">
                        <span class="profile-label">Course Access</span>
                        <span class="profile-badge">Evaluate professors assigned to ${courseNumberDisplay}</span>
                    </div>
                </div>
            </article>
        </section>
    `;
}

    function renderSettingsModule() {
        evaluationState = null;
        evaluationUI = null;

        content.innerHTML = `
            <section class="settings-summary">
                <article class="module-card settings-card">
                    <h2>Account Settings</h2>
                    <p class="settings-helper">Customize your account preferences and settings.</p>
                    
                    <!-- New settings content will go here -->
                    
                </article>
            </section>
        `;

        // Add event listeners for settings
        const saveBtn = content.querySelector('#settings-save');
        const resetBtn = content.querySelector('#settings-reset');
        const feedback = content.querySelector('.form-feedback');

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const updatedSettings = {
                    receiveEmailReminders: Boolean(content.querySelector('#email-notifications')?.checked),
                    notifyPeriodClose: Boolean(content.querySelector('#evaluation-complete')?.checked),
                    profileVisibleToFaculty: Boolean(content.querySelector('#profile-visibility')?.checked),
                    submitAnonymously: Boolean(content.querySelector('#anonymous-evaluations')?.checked),
                    themePreference: content.querySelector('#theme')?.value || defaultSettings.themePreference,
                    languagePreference: content.querySelector('#language')?.value || defaultSettings.languagePreference
                };

                Object.assign(userSettings, updatedSettings);

                feedback.textContent = 'Settings saved successfully!';
                feedback.classList.remove('form-feedback--error');
                
                setTimeout(() => {
                    feedback.textContent = '';
                }, 3000);
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all settings to defaults?')) {
                    // Reset all form elements
                    const checkboxes = content.querySelectorAll('input[type="checkbox"]');
                    const selects = content.querySelectorAll('select');
                    
                    checkboxes.forEach(checkbox => {
                        switch (checkbox.id) {
                            case 'email-notifications':
                                checkbox.checked = defaultSettings.receiveEmailReminders;
                                break;
                            case 'evaluation-complete':
                                checkbox.checked = defaultSettings.notifyPeriodClose;
                                break;
                            case 'profile-visibility':
                                checkbox.checked = defaultSettings.profileVisibleToFaculty;
                                break;
                            case 'anonymous-evaluations':
                                checkbox.checked = defaultSettings.submitAnonymously;
                                break;
                            default:
                                checkbox.checked = false;
                        }
                    });
                    
                    selects.forEach(select => {
                        if (select.id === 'theme') select.value = defaultSettings.themePreference;
                        if (select.id === 'language') select.value = defaultSettings.languagePreference;
                    });
                    
                    Object.assign(userSettings, defaultSettings);

                    feedback.textContent = 'Settings reset to defaults';
                    feedback.classList.remove('form-feedback--error');
                    
                    setTimeout(() => {
                        feedback.textContent = '';
                    }, 3000);
                }
            });
        }

        // Security button handlers
        const changePasswordBtn = content.querySelector('#change-password');
        const twoFactorBtn = content.querySelector('#two-factor');

        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => {
                feedback.textContent = 'Password change feature coming soon...';
                feedback.classList.remove('form-feedback--error');
            });
        }

        if (twoFactorBtn) {
            twoFactorBtn.addEventListener('click', () => {
                feedback.textContent = 'Two-factor authentication feature coming soon...';
                feedback.classList.remove('form-feedback--error');
            });
        }
    }

    function renderEvaluateModuleShell() {
        evaluationState = createInitialEvaluationState();

        content.innerHTML = `
            <div class="evaluation-flow">
                <div class="evaluation-header">
                    <div class="evaluation-breadcrumb" id="evaluation-breadcrumb" aria-label="Evaluation navigation trail"></div>
                    <button type="button" class="btn btn-outline back-button" id="evaluation-back" hidden>Back</button>
                </div>
                <p class="evaluation-helper" id="evaluation-helper-text"></p>
                <div id="evaluation-content" class="evaluation-content"></div>
            </div>`;

        initEvaluateModule();
    }

    function getEvaluableProfessors(course, studentCourseNumber) {
    if (!course || !Array.isArray(course.professors)) {
        return [];
    }
    
    return course.professors.filter(professor => {
        return professor.accessible === true;
    });
}

// Junior High School allowed courses (Grades 7-10)
const JUNIOR_HIGH_COURSES = [
    'Filipino',
    'English',
    'Mathematics',
    'Science',
    'Araling Panlipunan',
    'MAPEH',
    'Music, Art, Physical Education, and Health',
    'Technology and Livelihood Education',
    'TLE',
    'Values Education'
];

function getFilteredCoursesByYearLevel(courses, yearLevel) {
    if (!yearLevel) {
        return courses;
    }
    
    // For Junior High School (Grades 7-10), filter to allowed subjects only
    if (yearLevel >= 7 && yearLevel <= 10) {
        return courses.filter(course => {
            return JUNIOR_HIGH_COURSES.some(allowedCourse => {
                return course.name.toLowerCase().includes(allowedCourse.toLowerCase()) ||
                       allowedCourse.toLowerCase().includes(course.name.toLowerCase());
            });
        });
    }
    
    // For Senior High School (Grades 11-12), show all courses
    return courses;
}

    function initEvaluateModule() {
        evaluationUI = {
            breadcrumb: document.getElementById('evaluation-breadcrumb'),
            helperText: document.getElementById('evaluation-helper-text'),
            contentContainer: document.getElementById('evaluation-content'),
            backButton: document.getElementById('evaluation-back')
        };

        if (!evaluationUI.breadcrumb || !evaluationUI.contentContainer || !evaluationUI.backButton) return;

        evaluationUI.backButton.onclick = handleEvaluationBack;
        renderEvaluationStep();
    }

    function createInitialEvaluationState() {
        return {
            level: 'courses',
            selectedCourseId: null,
            selectedProfessorId: null
        };
    }

    function handleEvaluationBack() {
        if (!evaluationState) return;

        if (evaluationState.level === 'form') {
            evaluationState.level = 'professors';
            evaluationState.selectedProfessorId = null;
        } else if (evaluationState.level === 'professors') {
            evaluationState.level = 'courses';
            evaluationState.selectedCourseId = null;
        }

        renderEvaluationStep();
    }

    function renderEvaluationStep() {
        if (!evaluationUI || !evaluationState) return;

        switch (evaluationState.level) {
            case 'courses':
                renderCourseSelection();
                break;
            case 'professors':
                renderProfessorSelection();
                break;
            case 'form':
                renderEvaluationForm();
                break;
            default:
                evaluationState = createInitialEvaluationState();
                renderCourseSelection();
        }
    }

    // Add this debug code to the beginning of renderCourseSelection function
// Find this function in student-dashboard.js and add these logs at the start

// Replace your renderCourseSelection function with this corrected version

// Replace your renderCourseSelection function with this corrected version

function renderCourseSelection() {
    console.log('\n=== RENDER COURSE SELECTION ===');
    console.log('evaluationUI:', evaluationUI);
    console.log('evaluationCourses:', evaluationCourses);
    console.log('evaluationCourses.length:', evaluationCourses.length);
    console.log('studentProfile.courseNumber:', studentProfile.courseNumber);
    
    const { breadcrumb, helperText, contentContainer, backButton } = evaluationUI;
    updateBreadcrumb(['Courses']);
    backButton.hidden = true;

    // CHECK 1: Do we have any courses at all?
    if (!evaluationCourses.length) {
        console.log('NO COURSES - showing empty message');
        helperText.textContent = 'No courses have been configured yet.';
        contentContainer.innerHTML = `
            <div class="module-card evaluation-empty">
                <h3>No courses available</h3>
                <p>Once courses are assigned, they will appear here for evaluation.</p>
            </div>`;
        return;
    }

    // CHECK 2: Does student have a course number?
    if (!studentProfile.courseNumber) {
        console.log('NO COURSE NUMBER - showing error message');
        helperText.textContent = 'Your course number is missing. Please contact the registrar to update your profile before submitting evaluations.';
        contentContainer.innerHTML = `
            <div class="module-card evaluation-empty">
                <h3>Course number required</h3>
                <p>We cannot determine which professors you can evaluate without your course number.</p>
            </div>`;
        return;
    }

    // FILTER: Apply year level filter
    console.log('Student year level:', studentProfile.yearLevel);
    const filteredCourses = getFilteredCoursesByYearLevel(evaluationCourses, studentProfile.yearLevel);
    console.log('Filtered courses count:', filteredCourses.length);
    console.log('Filtered courses:', filteredCourses);
    
    // CHECK 3: Do we have courses after filtering?
    if (!filteredCourses.length) {
        console.log('NO FILTERED COURSES - showing grade level message');
        helperText.textContent = `No courses available for your grade level (Grade ${studentProfile.yearLevel}).`;
        contentContainer.innerHTML = `
            <div class="module-card evaluation-empty">
                <h3>No courses available</h3>
                <p>Courses for Grade ${studentProfile.yearLevel} will appear here once they are configured.</p>
            </div>`;
        return;
    }

    // RENDER: Display courses
    console.log('RENDERING COURSES - creating course cards');
    helperText.textContent = `Select a course to evaluate professors assigned to ${studentProfile.courseNumber}.`;

    const courseCards = filteredCourses.map((course, index) => {
        console.log(`\nProcessing course ${index}:`, course.name, 'ID:', course.id);
        const accessibleProfessors = getEvaluableProfessors(course, studentProfile.courseNumber);
        const accessibleCount = accessibleProfessors.length;
        const totalProfessors = course.professors.length;
        
        console.log(`  Total professors: ${totalProfessors}`);
        console.log(`  Accessible professors: ${accessibleCount}`);
        
        const badgeClass = accessibleCount ? 'evaluation-badge is-available' : 'evaluation-badge is-locked';
        const badgeLabel = accessibleCount ? `${accessibleCount} available to you` : 'No access';

        return `
            <article class="module-card evaluation-card" data-course-id="${course.id}">
                <div class="evaluation-card-body">
                    <div>
                        <h3>${course.name}</h3>
                        <p class="evaluation-meta">${formatProfessorCount(totalProfessors)}</p>
                    </div>
                    <span class="${badgeClass}">${badgeLabel}</span>
                    <button class="btn btn-primary select-course" data-course-id="${course.id}" type="button" ${accessibleCount ? '' : 'disabled'}>Select Course</button>
                </div>
            </article>
        `;
    }).join('');

    console.log('Total courseCards HTML length:', courseCards.length);
    console.log('Setting innerHTML...');
    contentContainer.innerHTML = `<div class="evaluation-grid">${courseCards}</div>`;
    console.log('HTML set. Now attaching click handlers...');

    // IMPORTANT: Attach click handlers AFTER the HTML is inserted
    const buttons = contentContainer.querySelectorAll('.select-course');
    console.log('Found buttons:', buttons.length);
    
    buttons.forEach((button, index) => {
        console.log(`Attaching handler to button ${index}, courseId:`, button.dataset.courseId);
        
        button.addEventListener('click', function(event) {
            console.log('Button clicked!', event);
            
            if (button.disabled) {
                console.log('Button is disabled, ignoring click');
                return;
            }
            
            const courseId = Number(button.dataset.courseId);
            console.log('Processing click for course ID:', courseId);
            
            evaluationState.level = 'professors';
            evaluationState.selectedCourseId = courseId;
            evaluationState.selectedProfessorId = null;
            
            console.log('Updated evaluationState:', evaluationState);
            console.log('Calling renderEvaluationStep...');
            
            renderEvaluationStep();
        });
    });
    
    console.log('Course selection render complete!');
}

function renderProfessorSelection() {
    const { helperText, contentContainer, backButton } = evaluationUI;
    const course = getSelectedCourse();

    if (!course) {
        evaluationState = createInitialEvaluationState();
        renderCourseSelection();
        return;
    }

    const accessibleProfessors = getEvaluableProfessors(course, studentProfile.courseNumber);
    const restrictedProfessors = course.professors.filter(prof => !accessibleProfessors.includes(prof));

    const accessibleCount = accessibleProfessors.length;
    const totalProfessors = course.professors.length;

    updateBreadcrumb(['Courses', course.name, `Your Class (${studentProfile.courseNumber})`, 'Professors']);
    helperText.textContent = accessibleCount
        ? `Showing professors assigned to ${studentProfile.courseNumber} for ${course.name}.`
        : `No professors assigned to ${studentProfile.courseNumber} for ${course.name}.`;
    backButton.hidden = false;

    const summaryCard = `
        <div class="module-card evaluation-summary">
            <h3>${course.name}</h3>
            <p class="evaluation-meta">${accessibleCount} of ${totalProfessors} professors available to you</p>
        </div>`;

    const accessibleMarkup = accessibleProfessors.length
        ? `<div class="evaluation-grid">
                ${accessibleProfessors.map(professor => `
                    <article class="module-card evaluation-card" data-professor-id="${professor.id}">
                        <div class="evaluation-card-body">
                            <div class="evaluation-card-info">
                                <h3>${professor.name}</h3>
                                <p class="evaluation-meta">${formatProfessorDepartment(professor, course)}</p>
                                <p class="evaluation-meta">Teaches: ${formatProfessorCourses(professor, course)}</p>
                                <p class="evaluation-meta">Assigned to ${studentProfile.courseNumber}</p>
                            </div>
                            <span class="evaluation-badge is-available">Eligible</span>
                            <button class="btn btn-primary evaluate-professor" data-professor-id="${professor.id}" type="button">Evaluate Professor</button>
                        </div>
                    </article>
                `).join('')}
           </div>`
        : `<div class="module-card evaluation-empty">
                <p>No professors available for evaluation in this course.</p>
            </div>`;

    const restrictedMarkup = restrictedProfessors.length
        ? `<div class="module-card evaluation-restricted">
                <h4>Not accessible for ${studentProfile.courseNumber}</h4>
                <ul class="restricted-list">
                    ${restrictedProfessors.map(prof => `
                        <li>
                            <span class="restricted-name">${prof.name}</span>
                            <span class="restricted-reason">Not assigned to your class</span>
                        </li>
                    `).join('')}
                </ul>
            </div>`
        : '';

    contentContainer.innerHTML = summaryCard + accessibleMarkup + restrictedMarkup;

    contentContainer.querySelectorAll('.evaluate-professor').forEach(button => {
        button.addEventListener('click', () => {
            const professorId = Number(button.dataset.professorId);
            const professor = accessibleProfessors.find(prof => prof.id === professorId);
            if (!professor) return;
            evaluationState.level = 'form';
            evaluationState.selectedProfessorId = professorId;
            renderEvaluationStep();
        });
    });
}

    function renderEvaluationForm() {
        const { helperText, contentContainer, backButton } = evaluationUI;
        const course = getSelectedCourse();
        const professor = getSelectedProfessor(course);

        if (!course || !professor) {
            evaluationState.level = 'courses';
            evaluationState.selectedCourseId = null;
            evaluationState.selectedProfessorId = null;
            renderEvaluationStep();
            return;
        }

        updateBreadcrumb(['Courses', course.name, `Your Class (${studentProfile.courseNumber})`, professor.name]);
        helperText.textContent = `Complete the evaluation form for ${professor.name} (assigned to ${studentProfile.courseNumber}).`;
        backButton.hidden = false;

        const professorImage = getProfessorImage(professor);
        const professorDepartment = formatProfessorDepartment(professor, course);
        const professorCourses = formatProfessorCourses(professor, course);
        const likertScaleMarkup = renderLikertScale();

        contentContainer.innerHTML = `
            <div class="module-card evaluation-summary">
                <h3>${course.name}</h3>
                <p class="evaluation-meta">Evaluating ${professor.name} for ${studentProfile.courseNumber}</p>
            </div>
            <section class="evaluation-panel">
                <article class="module-card professor-identity" aria-labelledby="professor-identity-heading">
                    <p class="evaluating-label">You're evaluating</p>
                    <img src="${professorImage.src}" alt="${professorImage.alt}" class="professor-photo" loading="lazy" />
                    <h2 id="professor-identity-heading" class="professor-name">${professor.name}</h2>
                    <p class="professor-department">${professorDepartment}</p>
                    <p class="professor-courses">Teaches: ${professorCourses}</p>
                    <p class="professor-class">Assigned to your class: ${studentProfile.courseNumber}</p>
                </article>
                <form class="module-card evaluation-form" id="evaluation-form" aria-labelledby="professor-identity-heading">
                <div class="form-group likert-group" role="group" aria-labelledby="likert-heading">
                    <h3 id="likert-heading">Please rate the following statements</h3>
                    <div class="likert-legend" aria-hidden="true">
                        ${likertOptions.map(option => `<span>${option.label}</span>`).join('')}
                    </div>
                    <div class="likert-scale">
                        ${likertScaleMarkup}
                    </div>
                </div>
                <div class="form-group">
                    <label for="evaluation-strengths">Strengths</label>
                    <textarea id="evaluation-strengths" rows="3" placeholder="Highlight areas where the professor excels."></textarea>
                </div>
                <div class="form-group">
                    <label for="evaluation-opportunities">Area of Improvements</label>
                    <textarea id="evaluation-opportunities" rows="3" placeholder="Share constructive feedback on areas to improve."></textarea>
                </div>
                <div class="evaluation-actions">
                    <button class="btn btn-outline" type="button" id="evaluation-reset">Reset</button>
                    <button class="btn btn-primary" type="submit">Submit Evaluation</button>
                </div>
                <p class="form-feedback" aria-live="polite"></p>
            </form>
            </section>`;

        const form = contentContainer.querySelector('#evaluation-form');
        const resetBtn = contentContainer.querySelector('#evaluation-reset');

        const likertRadios = form.querySelectorAll('.likert-option input[type="radio"]');
        const likertGroupState = {};

        likertRadios.forEach(radio => {
            radio.addEventListener('click', () => {
                const currentSelection = likertGroupState[radio.name] || null;
                if (currentSelection === radio) {
                    radio.checked = false;
                    likertGroupState[radio.name] = null;
                } else {
                    likertGroupState[radio.name] = radio;
                }
            });
        });

        form.addEventListener('submit', event => handleEvaluationSubmit(event, likertGroupState, course, professor));

        resetBtn.addEventListener('click', () => {
            form.reset();
            const feedback = form.querySelector('.form-feedback');
            feedback.textContent = '';
            Object.keys(likertGroupState).forEach(key => {
                likertGroupState[key] = null;
            });
        });
    }

    function handleEvaluationSubmit(event, likertGroupState) {
        event.preventDefault();
        const form = event.currentTarget;
        const feedback = form.querySelector('.form-feedback');
        const incompleteStatements = likertStatements.filter(statement => {
            const groupName = `likert-${statement.id}`;
            return !form.querySelector(`input[name="${groupName}"]:checked`);
        });

        if (incompleteStatements.length) {
            feedback.textContent = 'Please complete all rating statements before submitting.';
            feedback.classList.add('form-feedback--error');
            const firstIncomplete = form.querySelector(`input[name="likert-${incompleteStatements[0].id}"]`);
            if (firstIncomplete) firstIncomplete.focus();
            return;
        }

        const selectedLikertValues = likertStatements.map(statement => {
            const groupName = `likert-${statement.id}`;
            const checkedInput = form.querySelector(`input[name="${groupName}"]:checked`);
            return checkedInput ? checkedInput.value : null;
        });

        const uniqueLikertValues = new Set(selectedLikertValues.filter(value => value !== null));
        if (uniqueLikertValues.size === 1) {
            feedback.textContent = 'Your ratings are uniform. Please review and provide varied responses where appropriate before submitting.';
            feedback.classList.add('form-feedback--error');
            return;
        }

        const course = getSelectedCourse();
        const professor = getSelectedProfessor(course);
        feedback.textContent = `Evaluation submitted for ${professor ? professor.name : 'selected professor'}. Thank you for your feedback.`;
        feedback.classList.remove('form-feedback--error');
        Object.keys(likertGroupState || {}).forEach(key => {
            likertGroupState[key] = form.querySelector(`input[name="${key}"]:checked`) || null;
        });
    }

    function getSelectedCourse() {
        return evaluationCourses.find(course => course.id === evaluationState.selectedCourseId) || null;
    }

    function getSelectedProfessor(course) {
        if (!course) return null;
        return course.professors.find(prof => prof.id === evaluationState.selectedProfessorId) || null;
    }

    function updateBreadcrumb(segments) {
        if (!evaluationUI || !evaluationUI.breadcrumb) return;
        evaluationUI.breadcrumb.innerHTML = segments.map((segment, index) => {
            const isActive = index === segments.length - 1;
            return `<span class="crumb${isActive ? ' is-active' : ''}">${segment}</span>`;
        }).join('');
    }

    function formatProfessorCount(count) {
        if (count === 0) return 'No professors yet';
        return `${count} professor${count > 1 ? 's' : ''} available`;
    }

    function getEvaluableProfessorsAlt(course, studentCourseNumber) {
    if (!course || !Array.isArray(course.professors)) return [];
    if (!studentCourseNumber) return [];
    
    return course.professors.filter(professor => {
        // Check if professor has assignedCourseNumbers and it includes student's course
        if (!Array.isArray(professor.assignedCourseNumbers)) {
            console.warn('Professor missing assignedCourseNumbers:', professor);
            return false;
        }
        
        const isAccessible = professor.assignedCourseNumbers.includes(studentCourseNumber);
        console.log(`Professor ${professor.name}: sections=${professor.assignedCourseNumbers}, student=${studentCourseNumber}, accessible=${isAccessible}`);
        
        return isAccessible;
    });
}

    function formatProfileValue(value) {
        return value ? value : '<span class="profile-missing">Not set</span>';
    }

    function updateTooltipState() {
        const isCollapsed = sidebar.classList.contains('collapsed');
        tooltipElements.forEach(el => {
            if (isCollapsed) {
                el.setAttribute('data-tooltip-enabled', 'true');
                el.setAttribute('tabindex', '0');
                el.setAttribute('aria-describedby', 'sidebar-tooltip');
            } else {
                el.removeAttribute('data-tooltip-enabled');
                el.removeAttribute('tabindex');
                el.removeAttribute('aria-describedby');
            }
        });
    }

    function getProfessorImage(professor) {
        const placeholderUrl = `https://ui-avatars.com/api/?background=4caf50&color=fff&name=${encodeURIComponent(professor.name)}`;
        const src = professor.photo ? professor.photo : placeholderUrl;
        return {
            src,
            alt: professor.photo ? `${professor.name}’s profile photo` : `${professor.name} placeholder profile photo`
        };
    }

    function formatProfessorDepartment(professor, course) {
        if (professor.department) return professor.department;
        return `${course.name} Department`;
    }

    function formatProfessorCourses(professor, course) {
        if (Array.isArray(professor.courses) && professor.courses.length) {
            return professor.courses.join(', ');
        }
        return course.name;
    }

    function renderLikertScale() {
        return likertStatements.map(statement => `
            <div class="likert-row">
                <span class="likert-label">${statement.text}</span>
                <div class="likert-options" role="radiogroup" aria-label="${statement.text}">
                    ${likertOptions.map(option => {
                        const inputId = `likert-${statement.id}-${option.value}`;
                        return `
                            <label class="likert-option" for="${inputId}">
                                <input type="radio" name="likert-${statement.id}" id="${inputId}" value="${option.value}" />
                                <span class="likert-value" aria-hidden="true">${option.value}</span>
                                <span class="sr-only">${option.label}</span>
                            </label>
                        `;
                    }).join('')}
                </div>
            </div>
        `).join('');
    }
});