<?php
declare(strict_types=1);

session_start();

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/auth.php';

require_login();

$pdo = get_pdo();
$currentUser = current_user($pdo);
$displayName = $currentUser ? $currentUser['full_name'] : 'Student';

$studentProfileData = [
    'name' => $displayName,
    'email' => $currentUser['email'] ?? '',
    'studentNumber' => null,
    'courseNumber' => null,
    'courseProgram' => null,
    'yearLevel' => null,
    'classSection' => null,
];

$userSettingsData = [
    'receiveEmailReminders' => true,
    'notifyPeriodClose' => true,
    'profileVisibleToFaculty' => true,
    'submitAnonymously' => true,
    'themePreference' => 'light',
    'languagePreference' => 'en',
];

$evaluationCourses = [];

if ($currentUser) {
    try {
        $studentStmt = $pdo->prepare('SELECT sp.student_number, sp.course_program, sp.year_level, sp.class_section_id, cs.code AS class_section_code, cs.program AS class_section_program, cs.year_level AS class_section_year, cs.adviser_name, cs.id AS cs_id FROM student_profiles sp LEFT JOIN class_sections cs ON cs.id = sp.class_section_id WHERE sp.user_id = ? LIMIT 1');
        $studentStmt->execute([$currentUser['id']]);
        $studentRow = $studentStmt->fetch(PDO::FETCH_ASSOC);

        $classSectionId = null;
        if ($studentRow) {
            $studentProfileData['studentNumber'] = $studentRow['student_number'] ?? null;
            $studentProfileData['courseProgram'] = $studentRow['course_program'] ?? null;
            $studentProfileData['yearLevel'] = $studentRow['year_level'] ?? null;
            $studentProfileData['courseNumber'] = $studentRow['class_section_code'] ?? null;
            if (!empty($studentRow['class_section_id'])) {
                $classSectionId = (int)$studentRow['class_section_id'];
                $studentProfileData['classSection'] = [
                    'id' => $classSectionId,
                    'code' => $studentRow['class_section_code'] ?? null,
                    'program' => $studentRow['class_section_program'] ?? null,
                    'yearLevel' => $studentRow['class_section_year'] ?? null,
                    'adviserName' => $studentRow['adviser_name'] ?? null,
                ];
            }
        }

        $settingsStmt = $pdo->prepare('SELECT receive_email_reminders, notify_period_close, profile_visible_to_faculty, submit_anonymously, theme_preference, language_preference FROM user_settings WHERE user_id = ? LIMIT 1');
        $settingsStmt->execute([$currentUser['id']]);
        if ($settingsRow = $settingsStmt->fetch(PDO::FETCH_ASSOC)) {
            $userSettingsData = [
                'receiveEmailReminders' => (bool)$settingsRow['receive_email_reminders'],
                'notifyPeriodClose' => (bool)$settingsRow['notify_period_close'],
                'profileVisibleToFaculty' => (bool)$settingsRow['profile_visible_to_faculty'],
                'submitAnonymously' => (bool)$settingsRow['submit_anonymously'],
                'themePreference' => $settingsRow['theme_preference'] ?? 'light',
                'languagePreference' => $settingsRow['language_preference'] ?? 'en',
            ];
        }

        if ($classSectionId) {
            $courseMap = [];

            $accessibleStmt = $pdo->prepare(
                'SELECT c.id AS course_id,
                        c.name AS course_name,
                        c.code AS course_code,
                        c.description AS course_description,
                        fa.id AS assignment_id,
                        fa.faculty_user_id,
                        co.id AS course_offering_id,
                        u.full_name AS faculty_name,
                        COALESCE(fp.office_email, u.email) AS faculty_email,
                        fp.academic_rank,
                        d.name AS department_name,
                        cs.id AS class_section_id,
                        cs.code AS section_code,
                        cs.program AS section_program,
                        cs.year_level AS section_year
                 FROM course_offerings co
                 JOIN courses c ON c.id = co.course_id
                 JOIN faculty_assignments fa ON fa.course_offering_id = co.id
                 JOIN faculty_profiles fp ON fp.user_id = fa.faculty_user_id
                 JOIN users u ON u.id = fp.user_id
                 LEFT JOIN departments d ON d.id = fp.department_id
                 JOIN class_sections cs ON cs.id = co.class_section_id
                 WHERE co.class_section_id = ? AND co.is_active = 1
                 ORDER BY c.name, u.full_name'
            );
            $accessibleStmt->execute([$classSectionId]);
            $accessibleRows = $accessibleStmt->fetchAll(PDO::FETCH_ASSOC);

            $courseIds = [];
            foreach ($accessibleRows as $row) {
                $courseId = (int)$row['course_id'];
                $courseIds[$courseId] = true;

                if (!isset($courseMap[$courseId])) {
                    $courseMap[$courseId] = [
                        'id' => $courseId,
                        'name' => $row['course_name'],
                        'code' => $row['course_code'],
                        'description' => $row['course_description'],
                        'professors' => [],
                    ];
                }

                $courseMap[$courseId]['professors'][] = [
                    'id' => (int)$row['assignment_id'],
                    'name' => $row['faculty_name'],
                    'department' => $row['department_name'],
                    'courses' => [$row['course_name']],
                    'photo' => null,
                    'assignedCourseNumbers' => [$row['section_code']],
                    'sectionCode' => $row['section_code'],
                    'sectionId' => (int)$row['class_section_id'],
                    'accessible' => true,
                    'courseOfferingId' => (int)$row['course_offering_id'],
                    'facultyUserId' => (int)$row['faculty_user_id'],
                    'academicRank' => $row['academic_rank'],
                    'email' => $row['faculty_email'],
                ];
            }

            if ($courseIds) {
                $placeholders = implode(',', array_fill(0, count($courseIds), '?'));
                $restrictedSql = sprintf(
                    'SELECT c.id AS course_id,
                            c.name AS course_name,
                            c.code AS course_code,
                            c.description AS course_description,
                            fa.id AS assignment_id,
                            fa.faculty_user_id,
                            co.id AS course_offering_id,
                            u.full_name AS faculty_name,
                            COALESCE(fp.office_email, u.email) AS faculty_email,
                            fp.academic_rank,
                            d.name AS department_name,
                            cs.id AS class_section_id,
                            cs.code AS section_code,
                            cs.program AS section_program,
                            cs.year_level AS section_year
                     FROM course_offerings co
                     JOIN courses c ON c.id = co.course_id
                     JOIN faculty_assignments fa ON fa.course_offering_id = co.id
                     JOIN faculty_profiles fp ON fp.user_id = fa.faculty_user_id
                     JOIN users u ON u.id = fp.user_id
                     LEFT JOIN departments d ON d.id = fp.department_id
                     JOIN class_sections cs ON cs.id = co.class_section_id
                     WHERE co.class_section_id <> ?
                       AND co.is_active = 1
                       AND c.id IN (%s)
                     ORDER BY c.name, cs.code, u.full_name',
                    $placeholders
                );

                $restrictedStmt = $pdo->prepare($restrictedSql);
                $params = array_merge([$classSectionId], array_map('intval', array_keys($courseIds)));
                $restrictedStmt->execute($params);

                $seenRestrictedFaculty = []; // ADD THIS

                while ($row = $restrictedStmt->fetch(PDO::FETCH_ASSOC)) {
                    $courseId = (int)$row['course_id'];
                    $facultyUserId = (int)$row['faculty_user_id'];          // ADD THIS
                    $dedupKey = $courseId . '_' . $facultyUserId;           // ADD THIS
                    if (isset($seenRestrictedFaculty[$dedupKey])) continue; // ADD THIS
                    $seenRestrictedFaculty[$dedupKey] = true;               // ADD THIS
                    if (!isset($courseMap[$courseId])) {
                        $courseMap[$courseId] = [
                            'id' => $courseId,
                            'name' => $row['course_name'],
                            'code' => $row['course_code'],
                            'description' => $row['course_description'],
                            'professors' => [],
                        ];
                    }
                    

                    $courseMap[$courseId]['professors'][] = [
                        'id' => (int)$row['assignment_id'],
                        'name' => $row['faculty_name'],
                        'department' => $row['department_name'],
                        'courses' => [$row['course_name']],
                        'photo' => null,
                        'assignedCourseNumbers' => [$row['section_code']],
                        'sectionCode' => $row['section_code'],
                        'sectionId' => (int)$row['class_section_id'],
                        'accessible' => false,
                        'courseOfferingId' => (int)$row['course_offering_id'],
                        'facultyUserId' => (int)$row['faculty_user_id'],
                        'academicRank' => $row['academic_rank'],
                        'email' => $row['faculty_email'],
                    ];
                }
            }

            $evaluationCourses = array_values($courseMap);
        }
    } catch (PDOException $exception) {
        // Silently fail for dashboard rendering; consider logging in production.
    }
}

$appData = [
    'studentProfile' => $studentProfileData,
    'evaluationCourses' => $evaluationCourses,
    'userSettings' => $userSettingsData,
];

$encodedAppData = json_encode(
    $appData,
    JSON_UNESCAPED_SLASHES |
    JSON_UNESCAPED_UNICODE |
    JSON_HEX_TAG |
    JSON_HEX_AMP |
    JSON_HEX_APOS |
    JSON_HEX_QUOT
);

if ($encodedAppData === false) {
    $encodedAppData = '{}';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <link rel="icon" href="favicon/favicon.ico" type="image/x-icon">
    <link rel="icon" href="favicon/favicon-16x16.png" sizes="16x16" type="image/png">
    <link rel="icon" href="favicon/favicon-32x32.png" sizes="32x32" type="image/png">
    <link rel="apple-touch-icon" href="favicon/apple-touch-icon.png" sizes="180x180">
    <link rel="icon" href="favicon/android-chrome-192x192.png" sizes="192x192" type="image/png">
    <link rel="icon" href="favicon/android-chrome-512x512.png" sizes="512x512" type="image/png">
    <link rel="manifest" href="favicon/site.webmanifest">
    <title>Student Dashboard | Professor Evaluation</title>
    <link rel="stylesheet" href="student-dashboard.css" />
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <!-- Sidebar -->
    <aside class="sidebar">
        <button class="sidebar-toggle" aria-label="Toggle sidebar">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
        </button>
        
        <div class="logo">
            <img src="favicon/android-chrome-192x192.png" alt="Professor Evaluation" />
            <span>Professor <br>Evaluation</br> </span>
        </div>
        
        <nav class="nav-menu">
            <a href="#" class="nav-link tooltip-enabled active" data-module="profile" data-tooltip="Profile" aria-label="Profile">
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Profile</span>
            </a>
            <a href="#" class="nav-link tooltip-enabled" data-module="evaluate" data-tooltip="Evaluate" aria-label="Evaluate">
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <span>Evaluate</span>
            </a>
            <a href="#" class="nav-link tooltip-enabled" data-module="settings" data-tooltip="Settings" aria-label="Settings">
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.28 0 .55.04.81.09H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                <span>Settings</span>
            </a>
        </nav>
        
        <div class="logout">
            <a href="logout.php" class="logout-btn tooltip-enabled" data-tooltip="Logout" aria-label="Logout">
                <svg class="logout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Logout</span>
            </a>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
        <header class="dashboard-header">
            <h1 id="module-title">User Profile</h1>
            <p class="welcome">Welcome back, <strong><?= htmlspecialchars($displayName, ENT_QUOTES) ?></strong></p>
        </header>

        <section id="module-content">
            <div class="loading">Loading module...</div>
        </section>
    </main>

    <!-- Load external JS at the end -->
    <script>
        window.__APP_DATA__ = <?= $encodedAppData ?>;
    </script>
    <script src="student-dashboard.js"></script>
</body>
</html>