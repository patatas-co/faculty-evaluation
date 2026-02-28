<?php
declare(strict_types=1);
session_start();

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/auth.php';

require_login();
$pdo = get_pdo();
$currentUser = current_user($pdo);

if (!$currentUser || $currentUser['role'] !== 'faculty') {
    header('Location: login.php');
    exit;
}

// ── JSON: section students ──
if (isset($_GET['json']) && $_GET['json'] === 'section_students') {
    header('Content-Type: application/json');
    $sectionId = (int)($_GET['section_id'] ?? 0);
    // Verify teacher is assigned to this section (via course_offerings bridge)
    $check = $pdo->prepare(
        "SELECT 1 FROM faculty_assignments fa
         JOIN course_offerings co ON co.id = fa.course_offering_id
         WHERE fa.faculty_user_id = ? AND co.class_section_id = ? LIMIT 1"
    );
    $check->execute([$currentUser['id'], $sectionId]);
    if (!$check->fetchColumn()) {
        echo json_encode(['students' => []]);
        exit;
    }
    $stmt = $pdo->prepare(
        "SELECT u.full_name, u.email, sp.student_number
         FROM student_profiles sp
         JOIN users u ON u.id = sp.user_id
         WHERE sp.class_section_id = ?
         ORDER BY u.full_name"
    );
    $stmt->execute([$sectionId]);
    echo json_encode(['students' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    exit;
}

$displayName = $currentUser['full_name'];
$userId      = (int)$currentUser['id'];

// ── Faculty Profile ──
$profile = $pdo->prepare(
    "SELECT fp.employee_id, fp.academic_rank,
            d.name AS department
     FROM faculty_profiles fp
     LEFT JOIN departments d ON d.id = fp.department_id
     WHERE fp.user_id = ? LIMIT 1"
);
$profile->execute([$userId]);
$facultyProfile = $profile->fetch(PDO::FETCH_ASSOC) ?: [];

// ── Assigned Sections ──
$sectionsStmt = $pdo->prepare(
    "SELECT cs.id, cs.code, cs.program, cs.year_level, cs.adviser_name,
            COUNT(DISTINCT sp.user_id) AS student_count
     FROM faculty_assignments fa
     JOIN course_offerings co ON co.id = fa.course_offering_id
     JOIN class_sections cs ON cs.id = co.class_section_id
     LEFT JOIN student_profiles sp ON sp.class_section_id = cs.id
     WHERE fa.faculty_user_id = ? AND co.is_active = 1
     GROUP BY cs.id
     ORDER BY cs.year_level, cs.code"
);
$sectionsStmt->execute([$userId]);
$assignedSections = $sectionsStmt->fetchAll(PDO::FETCH_ASSOC);

// ── Assigned Courses ──
$coursesStmt = $pdo->prepare(
    "SELECT DISTINCT c.id, c.name, c.code, c.description
     FROM faculty_assignments fa
     JOIN course_offerings co ON co.id = fa.course_offering_id
     JOIN courses c ON c.id = co.course_id
     WHERE fa.faculty_user_id = ? AND co.is_active = 1
     ORDER BY c.name"
);
$coursesStmt->execute([$userId]);
$assignedCourses = $coursesStmt->fetchAll(PDO::FETCH_ASSOC);

// ── Evaluation Results (summary per course/section) ──
$evalStmt = $pdo->prepare(
    "SELECT c.name  AS course_name,
            c.code  AS course_code,
            cs.code AS section_code,
            COUNT(e.id) AS total_responses,
            ROUND(AVG(
                (e.rating_clarity + e.rating_feedback + e.rating_engagement + e.rating_support) / 4
            ), 2) AS avg_rating
     FROM evaluations e
     JOIN faculty_assignments fa ON fa.id = e.faculty_assignment_id
     JOIN course_offerings co    ON co.id = fa.course_offering_id
     JOIN courses c              ON c.id  = co.course_id
     JOIN class_sections cs      ON cs.id = co.class_section_id
     WHERE fa.faculty_user_id = ?
     GROUP BY fa.id
     ORDER BY c.name"
);
$evalStmt->execute([$userId]);
$evalResults = $evalStmt->fetchAll(PDO::FETCH_ASSOC);

// ── Stats ──
$totalSections  = count($assignedSections);
$totalCourses   = count($assignedCourses);
$totalResponses = array_sum(array_column($evalResults, 'total_responses'));
$overallAvg     = count($evalResults)
    ? round(array_sum(array_column($evalResults, 'avg_rating')) / count($evalResults), 2)
    : 0;

// ── Flash message (from POST redirects) ──
$flash = [];
if (isset($_SESSION['teacher_flash'])) {
    $flash = $_SESSION['teacher_flash'];
    unset($_SESSION['teacher_flash']);
}

// ── Handle Profile Update ──
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'update_profile') {
    $newFullName    = trim($_POST['full_name']    ?? '');
    $newEmail       = trim($_POST['email']        ?? '');
    $newEmployeeId  = trim($_POST['employee_id']  ?? '');
    $newRank        = trim($_POST['academic_rank'] ?? '');
    $newDept        = trim($_POST['department']   ?? '');

    if ($newFullName && $newEmail) {
        $pdo->prepare("UPDATE users SET full_name=?, email=? WHERE id=?")->execute([$newFullName, $newEmail, $userId]);
        $pdo->prepare("UPDATE faculty_profiles SET employee_id=?, academic_rank=? WHERE user_id=?")->execute([$newEmployeeId, $newRank, $userId]);
        $_SESSION['teacher_flash'] = ['type' => 'success', 'msg' => 'Profile updated successfully.'];
    } else {
        $_SESSION['teacher_flash'] = ['type' => 'danger', 'msg' => 'Full name and email are required.'];
    }
    header('Location: faculty-dashboard.php?tab=profile');
    exit;
}

// ── Handle Change Password ──
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'change_password') {
    $current = $_POST['current_password'] ?? '';
    $new     = $_POST['new_password']     ?? '';
    $confirm = $_POST['confirm_password'] ?? '';

    $userRow = $pdo->prepare("SELECT password_hash FROM users WHERE id = ? LIMIT 1");
    $userRow->execute([$userId]);
    $hash = $userRow->fetchColumn();

    if (!password_verify($current, $hash)) {
        $_SESSION['teacher_flash'] = ['type' => 'danger', 'msg' => 'Current password is incorrect.'];
    } elseif (strlen($new) < 8) {
        $_SESSION['teacher_flash'] = ['type' => 'danger', 'msg' => 'New password must be at least 8 characters.'];
    } elseif ($new !== $confirm) {
        $_SESSION['teacher_flash'] = ['type' => 'danger', 'msg' => 'New passwords do not match.'];
    } else {
        $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?")
            ->execute([password_hash($new, PASSWORD_DEFAULT), $userId]);
        $_SESSION['teacher_flash'] = ['type' => 'success', 'msg' => 'Password updated successfully.'];
    }
    header('Location: faculty-dashboard.php?tab=profile');
    exit;
}

$activeTab = $_GET['tab'] ?? 'overview';

$appData = [
    'activeTab'       => $activeTab,
    'flash'           => $flash,
    'stats'           => [
        'sections'  => $totalSections,
        'courses'   => $totalCourses,
        'responses' => $totalResponses,
        'avg'       => $overallAvg,
    ],
    'profile'         => [
        'full_name'    => $displayName,
        'email'        => $currentUser['email'] ?? '',
        'employee_id'  => $facultyProfile['employee_id']  ?? '',
        'academic_rank'=> $facultyProfile['academic_rank'] ?? '',
        'department'   => $facultyProfile['department']   ?? '',
    ],
    'sections'        => $assignedSections,
    'courses'         => $assignedCourses,
    'evalResults'     => $evalResults,
];
$encoded = json_encode($appData, JSON_HEX_TAG | JSON_HEX_AMP);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Teacher Dashboard | Professor Evaluation</title>
    <link rel="stylesheet" href="student-dashboard.css"/>
    <link rel="stylesheet" href="admin-dashboard.css"/>
    <link rel="stylesheet" href="faculty-dashboard.css"/>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet"/>
    <script>
    (function() {
        if (localStorage.getItem('teacherSidebarCollapsed') === 'true') {
            document.documentElement.classList.add('sidebar-pre-collapsed');
        }
    })();
    </script>
</head>
<body>

<aside class="sidebar">
    <button class="sidebar-toggle" aria-label="Toggle sidebar">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
    </button>
    <div class="logo">
        <img src="favicon/android-chrome-192x192.png" alt="Teacher"/>
        <span>Teacher Portal</span>
    </div>
    <nav class="nav-menu">
        <a href="#" class="nav-link tooltip-enabled" data-module="overview" data-tooltip="Overview" aria-label="Overview">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span>Overview</span>
        </a>
        <a href="#" class="nav-link tooltip-enabled" data-module="profile" data-tooltip="Profile" aria-label="Profile">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
            </svg>
            <span>Profile</span>
        </a>
        <a href="#" class="nav-link tooltip-enabled" data-module="evaluations" data-tooltip="Evaluation Results" aria-label="Evaluation Results">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            <span>Evaluations</span>
        </a>
        <a href="#" class="nav-link tooltip-enabled" data-module="sections" data-tooltip="My Sections" aria-label="My Sections">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>My Sections</span>
        </a>
    </nav>
    <div class="logout">
        <a href="logout.php" class="logout-btn tooltip-enabled" data-tooltip="Logout" aria-label="Logout">
            <svg class="logout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Logout</span>
        </a>
    </div>
</aside>

<main class="main-content">
    <header class="dashboard-header">
        <h1 id="module-title">Overview</h1>
        <p class="welcome">Welcome back, <strong><?= htmlspecialchars($displayName, ENT_QUOTES) ?></strong></p>
    </header>
    <section id="module-content">
        <div class="loading">Loading...</div>
    </section>
</main>

<!-- Section Students Modal -->
<div class="modal-overlay" id="section-students-modal" hidden>
    <div class="modal" style="max-width:600px">
        <div class="modal-header">
            <h3 class="modal-title" id="section-modal-title">Section Students</h3>
            <button class="modal-close" id="section-modal-close" aria-label="Close">&times;</button>
        </div>
        <div class="modal-body" id="section-modal-body">
            <div class="loading">Loading students…</div>
        </div>
    </div>
</div>

<script>window.__APP_DATA__ = <?= $encoded ?>;</script>
<script src="faculty-dashboard.js"></script>
</body>
</html>