const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
const yearEl = document.getElementById('year');

// Set current year
if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}

// Mobile navigation toggle
if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('is-open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    nav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('is-open')) {
                nav.classList.remove('is-open');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });
}

// New: Scroll-based animations
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.feature-card, .process-step, .matrix-card, .hero-copy, .hero-card, .achievements-copy, .achievements-visual, .highlight-card, .pillar-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');

                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, {
        threshold: 0.2, // Trigger when 20% of element is visible
        rootMargin: '0px 0px -50px 0px' // Slight offset for smoother reveal
    });

    animatedElements.forEach((el) => observer.observe(el));

    const navLinks = document.querySelectorAll('.nav-list a[href^="#"]');
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            const activeId = entry.target.id;

            if (activeId === 'hero') {
                navLinks.forEach((link) => link.classList.remove('active'));
                return;
            }

            navLinks.forEach((link) => {
                const linkTarget = link.getAttribute('href').slice(1);
                if (linkTarget === activeId) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        });
    }, {
        threshold: 0.5,
        rootMargin: '0px 0px -10% 0px',
    });

    navLinks.forEach((link) => {
        const targetId = link.getAttribute('href').slice(1);
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            sectionObserver.observe(targetSection);
        }
    });

    const heroSection = document.getElementById('hero');
    if (heroSection) {
        sectionObserver.observe(heroSection);
    }

    const modals = document.querySelectorAll('.modal');
    const modalTriggers = document.querySelectorAll('[data-modal-target]');

    const openModal = (event) => {
        event.preventDefault();
        const targetId = event.currentTarget.getAttribute('data-modal-target');
        const modal = document.getElementById(targetId);
        if (!modal) return;
        modal.classList.add('is-open');
        document.body.classList.add('modal-open');
        const focusable = modal.querySelector('button, a, input, textarea, select, [tabindex]:not([tabindex="-1"])');
        if (focusable) focusable.focus();
    };

    const closeModal = (modal) => {
        if (!modal) return;
        modal.classList.remove('is-open');
        document.body.classList.remove('modal-open');
    };

    modalTriggers.forEach((trigger) => {
        trigger.addEventListener('click', openModal);
    });

    modals.forEach((modal) => {
        const closeButtons = modal.querySelectorAll('[data-modal-close]');
        closeButtons.forEach((button) => {
            button.addEventListener('click', () => closeModal(modal));
        });
    });

    // Add click outside to close for each modal
    modals.forEach((modal) => {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal(modal);
            }
        });
    });

    // Add escape key to close any open modal
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const openModal = document.querySelector('.modal.is-open');
            if (openModal) {
                closeModal(openModal);
            }
        }
    });

    const sectionFilterInput = document.getElementById('sectionFilter');
    const classSectionSelect = document.getElementById('classSection');
    const classSectionGradeFilter = document.getElementById('classSectionGradeFilter');

    if (sectionFilterInput && classSectionSelect) {
        const placeholderOption = classSectionSelect.querySelector('option[value=""]');
        const groupData = Array.from(classSectionSelect.querySelectorAll('optgroup')).map((optgroup) => {
            const options = Array.from(optgroup.querySelectorAll('option')).map((option) => ({
                value: option.value,
                label: option.textContent ?? '',
                grade: (option.dataset.grade ?? '').toLowerCase(),
                code: (option.dataset.code ?? '').toLowerCase(),
                program: (option.dataset.program ?? '').toLowerCase(),
            }));

            return {
                label: optgroup.label,
                labelKey: optgroup.label.toLowerCase(),
                options,
            };
        });

        const rebuildOptions = (query) => {
            const normalizedQuery = query.trim().toLowerCase();
            const currentValue = classSectionSelect.value;

            Array.from(classSectionSelect.querySelectorAll('optgroup, option[data-filter-placeholder]')).forEach((node) => node.remove());

            let hasMatches = false;

            groupData.forEach((group) => {
                const matchingOptions = group.options.filter((option) => {
                    if (!normalizedQuery) {
                        return true;
                    }

                    const combined = [
                        group.labelKey,
                        option.label.toLowerCase(),
                        option.grade,
                        option.code,
                        option.program,
                    ].join(' ');

                    return combined.includes(normalizedQuery);
                });

                if (matchingOptions.length > 0) {
                    hasMatches = true;
                    const optgroup = document.createElement('optgroup');
                    optgroup.label = group.label;

                    matchingOptions.forEach((option) => {
                        const optionElement = document.createElement('option');
                        optionElement.value = option.value;
                        optionElement.textContent = option.label;
                        optionElement.dataset.grade = group.label;
                        optionElement.dataset.code = option.code;
                        optionElement.dataset.program = option.program;
                        optgroup.appendChild(optionElement);
                    });

                    classSectionSelect.appendChild(optgroup);
                }
            });

            if (!hasMatches) {
                const emptyOption = document.createElement('option');
                emptyOption.value = '';
                emptyOption.disabled = true;
                emptyOption.dataset.filterPlaceholder = 'true';
                emptyOption.textContent = 'No sections match your search';
                classSectionSelect.appendChild(emptyOption);
            }

            if (placeholderOption) {
                classSectionSelect.value = placeholderOption.value;
            } else if (hasMatches && currentValue) {
                classSectionSelect.value = currentValue;
            }
        };

        sectionFilterInput.addEventListener('input', (event) => {
            rebuildOptions(event.target.value);
        });

        sectionFilterInput.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                sectionFilterInput.value = '';
                rebuildOptions('');
                sectionFilterInput.blur();
            }
        });
    }

    if (classSectionSelect && classSectionGradeFilter) {
        const normalize = (value) => value.trim().toLowerCase();
        const initialSelection = classSectionSelect.dataset.selected ?? classSectionSelect.value ?? '';
        const placeholderOption = classSectionSelect.querySelector('option[value=""]');

        const originalGroups = Array.from(classSectionSelect.querySelectorAll('optgroup')).map((optgroup) => ({
            label: optgroup.label,
            labelKey: normalize(optgroup.label),
            options: Array.from(optgroup.querySelectorAll('option')).map((option) => ({
                value: option.value,
                text: option.textContent ?? '',
                grade: option.dataset.grade ?? optgroup.label,
                gradeKey: normalize(option.dataset.grade ?? optgroup.label),
                code: option.dataset.code ?? '',
                program: option.dataset.program ?? '',
            })),
        }));

        const rebuildClassSectionOptions = (gradeFilterKey) => {
            const normalizedFilter = normalize(gradeFilterKey ?? '');
            const shouldFilter = normalizedFilter !== '' && normalizedFilter !== 'all';
            const previousValue = classSectionSelect.value;

            Array.from(classSectionSelect.querySelectorAll('optgroup')).forEach((optgroup) => optgroup.remove());

            const fragment = document.createDocumentFragment();

            originalGroups.forEach((group) => {
                const matchingOptions = group.options.filter((option) => {
                    if (!shouldFilter) {
                        return true;
                    }
                    return option.gradeKey === normalizedFilter;
                });

                if (matchingOptions.length === 0) {
                    return;
                }

                const optgroupElement = document.createElement('optgroup');
                optgroupElement.label = group.label;

                matchingOptions.forEach((option) => {
                    const optionElement = document.createElement('option');
                    optionElement.value = option.value;
                    optionElement.textContent = option.text;
                    optionElement.dataset.grade = option.grade;
                    optionElement.dataset.code = option.code;
                    optionElement.dataset.program = option.program;
                    optgroupElement.appendChild(optionElement);
                });

                fragment.appendChild(optgroupElement);
            });

            classSectionSelect.appendChild(fragment);

            if (placeholderOption) {
                placeholderOption.selected = true;
            }

            if (previousValue) {
                const hasPrevious = Array.from(classSectionSelect.querySelectorAll('option')).some((option) => option.value === previousValue);
                classSectionSelect.value = hasPrevious ? previousValue : '';
            } else if (initialSelection) {
                const hasInitial = Array.from(classSectionSelect.querySelectorAll('option')).some((option) => option.value === initialSelection);
                classSectionSelect.value = hasInitial ? initialSelection : '';
            }
        };

        classSectionGradeFilter.addEventListener('change', (event) => {
            rebuildClassSectionOptions(event.target.value ?? '');
        });

        const preselectedGrade = normalize(classSectionGradeFilter.value ?? '');
        if (preselectedGrade) {
            rebuildClassSectionOptions(preselectedGrade);
        }
    }
});