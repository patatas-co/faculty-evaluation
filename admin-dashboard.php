<?php
declare(strict_types=1);
session_start();
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/auth.php';

require_login();
$pdo = get_pdo();
$currentUser = current_user($pdo);

if (!$currentUser || $currentUser['role'] !== 'admin') {
    header('Location: login.php');
    exit;
}

// JSON endpoint for fetch-based re-renders
if (isset($_GET['json']) && $_GET['json'] === 'teachers') {
    header('Content-Type: application/json');
    $teachers = $pdo->query(
        "SELECT u.id, u.full_name, u.email, u.status,
                p.employee_id, p.department, p.academic_rank,
                COUNT(fa.id) AS assignment_count
         FROM users u
         LEFT JOIN faculty_profiles p  ON p.user_id = u.id
         LEFT JOIN faculty_assignments fa ON fa.faculty_user_id = u.id
         WHERE u.role = 'faculty'
         GROUP BY u.id ORDER BY u.full_name"
    )->fetchAll(PDO::FETCH_ASSOC);
    $statsRow = $pdo->query(
        "SELECT
            (SELECT COUNT(*) FROM users WHERE role='faculty') AS teachers,
            (SELECT COUNT(*) FROM users WHERE role='student') AS students,
            (SELECT COUNT(*) FROM class_sections)             AS sections,
            (SELECT COUNT(*) FROM evaluations)                AS evals"
    )->fetch(PDO::FETCH_ASSOC);
    echo json_encode(['teachers' => $teachers, 'stats' => $statsRow]);
    exit;
}

// ── Sections CSV Template Download ──
if (isset($_GET['action']) && $_GET['action'] === 'download_sections_template') {
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="sections_import_template.csv"');
    header('Cache-Control: no-cache, no-store, must-revalidate');
    $out = fopen('php://output', 'w');
    fputcsv($out, ['code', 'year_level', 'program', 'adviser_name']);
    fputcsv($out, ['GRADE7-SANTOS', '7', 'Grade 7 - Santos', 'Ms. Maria Santos']);
    fputcsv($out, ['GRADE8-LUNA',   '8', 'Grade 8 - Luna',   'Mr. Jose Luna']);
    fputcsv($out, ['GRADE11-A',    '11', 'Grade 11',         '']);
    fclose($out);
    exit;
}

// ── CSV Template Download ──
if (isset($_GET['action']) && $_GET['action'] === 'download_csv_template') {
    $courses_list  = $pdo->query("SELECT name FROM courses ORDER BY name")->fetchAll(PDO::FETCH_COLUMN);
    $sections_list = $pdo->query("SELECT code FROM class_sections ORDER BY year_level, code")->fetchAll(PDO::FETCH_COLUMN);

    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="teachers_import_template.csv"');
    header('Cache-Control: no-cache, no-store, must-revalidate');

    $out = fopen('php://output', 'w');
    fputcsv($out, ['full_name','email','password','employee_id','academic_rank','department','course_codes','section_codes']);
    $sampleCourses  = implode('|', array_slice($courses_list, 0, 2));
    $sampleSections = implode('|', array_slice($sections_list, 0, 2));
    fputcsv($out, ['Maria Santos','msantos@dihs.edu.ph','changeme123','EMP-2024-001','Instructor I','Mathematics',$sampleCourses,$sampleSections]);
    fputcsv($out, ['Jose Reyes','jreyes@dihs.edu.ph','changeme123','EMP-2024-002','Teacher II','Science','','']);
    fclose($out);
    exit;
}

$displayName = $currentUser['full_name'];

// ── Stats ──
$totalTeachers  = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role='faculty'")->fetchColumn();
$totalStudents  = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role='student'")->fetchColumn();
$totalSections  = (int)$pdo->query("SELECT COUNT(*) FROM class_sections")->fetchColumn();
$totalEvals     = (int)$pdo->query("SELECT COUNT(*) FROM evaluations")->fetchColumn();

// ── Teachers list ──
$teachersStmt = $pdo->query(
    "SELECT u.id, u.full_name, u.email, u.status,
            fp.employee_id, fp.academic_rank,
            d.name AS department,
            COUNT(DISTINCT fa.id) AS assignment_count
     FROM users u
     LEFT JOIN faculty_profiles fp ON fp.user_id = u.id
     LEFT JOIN departments d ON d.id = fp.department_id
     LEFT JOIN faculty_assignments fa ON fa.faculty_user_id = u.id
     WHERE u.role = 'faculty'
     GROUP BY u.id
     ORDER BY u.full_name"
);
$teachers = $teachersStmt->fetchAll(PDO::FETCH_ASSOC);

// ── Departments & Courses & Sections for add form ──
$departments = $pdo->query("SELECT id, name FROM departments ORDER BY name")->fetchAll(PDO::FETCH_ASSOC);
$courses     = $pdo->query("SELECT id, name FROM courses ORDER BY name")->fetchAll(PDO::FETCH_ASSOC);
$sections    = $pdo->query("SELECT id, code, program, year_level, adviser_name FROM class_sections ORDER BY year_level, code")->fetchAll(PDO::FETCH_ASSOC);

// ── Handle POST actions ──
$actionError   = '';
$actionSuccess = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    // Add teacher
    if ($action === 'add_teacher') {
        $fullName     = trim($_POST['full_name'] ?? '');
        $email        = trim($_POST['email'] ?? '');
        $password     = $_POST['password'] ?? '';
        $employeeId   = trim($_POST['employee_id'] ?? '');
        $academicRank = trim($_POST['academic_rank'] ?? '');
        $deptId       = (int)($_POST['department_id'] ?? 0);
        $courseIds    = array_map('intval', $_POST['course_ids'] ?? []);
        $sectionIds   = array_map('intval', $_POST['section_ids'] ?? []);

        if (!$fullName || !$email || !$password || !$employeeId) {
            $actionError = 'Please fill in all required fields.';
        } else {
            try {
                $pdo->beginTransaction();

                // Insert user
                $hash = password_hash($password, PASSWORD_BCRYPT);
                $stmt = $pdo->prepare("INSERT INTO users (full_name, email, password_hash, role, status, email_verified) VALUES (?,?,?,'faculty','active',1)");
                $stmt->execute([$fullName, $email, $hash]);
                $newUserId = (int)$pdo->lastInsertId();

                // Insert faculty profile
                $stmt = $pdo->prepare("INSERT INTO faculty_profiles (user_id, department_id, employee_id, academic_rank, status) VALUES (?,?,?,?,'Active')");
                $stmt->execute([$newUserId, $deptId ?: null, $employeeId, $academicRank]);

                // Assign courses to sections
                if ($courseIds && $sectionIds) {
                    $coStmt  = $pdo->prepare("SELECT id FROM course_offerings WHERE course_id=? AND class_section_id=? AND is_active=1 LIMIT 1");
                    $faStmt  = $pdo->prepare("INSERT IGNORE INTO faculty_assignments (faculty_user_id, course_offering_id) VALUES (?,?)");
                    foreach ($courseIds as $cid) {
                        foreach ($sectionIds as $sid) {
                            $coStmt->execute([$cid, $sid]);
                            $co = $coStmt->fetchColumn();
                            if ($co) $faStmt->execute([$newUserId, $co]);
                        }
                    }
                }

                // Insert user_settings
                $pdo->prepare("INSERT INTO user_settings (user_id) VALUES (?)")->execute([$newUserId]);

                $pdo->commit();
                $actionSuccess = "Teacher \"{$fullName}\" added successfully!";

                // Refresh teachers list
                $teachers = $pdo->query(
                    "SELECT u.id, u.full_name, u.email, u.status,
                            fp.employee_id, fp.academic_rank,
                            d.name AS department,
                            COUNT(DISTINCT fa.id) AS assignment_count
                     FROM users u
                     LEFT JOIN faculty_profiles fp ON fp.user_id = u.id
                     LEFT JOIN departments d ON d.id = fp.department_id
                     LEFT JOIN faculty_assignments fa ON fa.faculty_user_id = u.id
                     WHERE u.role = 'faculty'
                     GROUP BY u.id
                     ORDER BY u.full_name"
                )->fetchAll(PDO::FETCH_ASSOC);
                $totalTeachers = count($teachers);
            } catch (PDOException $e) {
                $pdo->rollBack();
                $actionError = 'Error: ' . ($e->getCode() === '23000' ? 'Email already exists.' : $e->getMessage());
            }
        }
    }

    // Toggle teacher status
    if ($action === 'toggle_status') {
        $uid    = (int)($_POST['user_id'] ?? 0);
        $status = $_POST['current_status'] === 'active' ? 'inactive' : 'active';
        $pdo->prepare("UPDATE users SET status=? WHERE id=? AND role='faculty'")->execute([$status, $uid]);
        if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) || isset($_POST['_fetch'])) {
    header('Content-Type: application/json');
    echo json_encode(['ok' => true]);
    exit;
}
header('Location: admin-dashboard.php?tab=teachers&msg=status_updated');
exit;
    }

    // Delete teacher
    if ($action === 'delete_teacher') {
        $uid = (int)($_POST['user_id'] ?? 0);
        $pdo->prepare("DELETE FROM users WHERE id=? AND role='faculty'")->execute([$uid]);
        if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) || isset($_POST['_fetch'])) {
    header('Content-Type: application/json');
    echo json_encode(['ok' => true]);
    exit;
}
header('Location: admin-dashboard.php?tab=teachers&msg=deleted');
exit;
    }

    // ── CSV Import ──
    if ($action === 'import_csv') {
        $file = $_FILES['csv_file'] ?? null;
        if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
            $actionError = 'No file uploaded or upload error.';
        } elseif (strtolower(pathinfo($file['name'], PATHINFO_EXTENSION)) !== 'csv') {
            $actionError = 'Please upload a valid .csv file.';
        } else {
            $handle = fopen($file['tmp_name'], 'r');
            if (!$handle) {
                $actionError = 'Could not read the uploaded file.';
            } else {
                $deptMap = [];
                foreach ($departments as $d) $deptMap[strtolower(trim($d['name']))] = $d['id'];

                $courseMap = [];
                foreach ($pdo->query("SELECT id, name, code FROM courses")->fetchAll(PDO::FETCH_ASSOC) as $c) {
                    $courseMap[strtolower(trim($c['name']))] = $c['id'];
                    $courseMap[strtolower(trim($c['code']))] = $c['id'];
                }

                $sectionMap = [];
                foreach ($pdo->query("SELECT id, code FROM class_sections")->fetchAll(PDO::FETCH_ASSOC) as $s) {
                    $sectionMap[strtolower(trim($s['code']))] = $s['id'];
                }

                $header = array_map('strtolower', array_map('trim', fgetcsv($handle)));
                $requiredCols = ['full_name','email','password','employee_id'];
                $missingCols = array_diff($requiredCols, $header);

                if ($missingCols) {
                    $actionError = 'CSV missing required columns: ' . implode(', ', $missingCols);
                    fclose($handle);
                } else {
                    $imported = 0; $skipped = []; $rowNum = 1;
                    $coStmt = $pdo->prepare("SELECT id FROM course_offerings WHERE course_id=? AND class_section_id=? AND is_active=1 LIMIT 1");
                    $faStmt = $pdo->prepare("INSERT IGNORE INTO faculty_assignments (faculty_user_id, course_offering_id) VALUES (?,?)");

                    while (($row = fgetcsv($handle)) !== false) {
                        $rowNum++;
                        $data = [];
                        foreach ($header as $i => $col) $data[$col] = isset($row[$i]) ? trim($row[$i]) : '';

                        $fullName = $data['full_name'] ?? ''; $email = $data['email'] ?? '';
                        $password = $data['password'] ?? ''; $employeeId = $data['employee_id'] ?? '';

                        if (!$fullName || !$email || !$password || !$employeeId) {
                            $skipped[] = "Row $rowNum: missing required field(s)."; continue;
                        }
                        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                            $skipped[] = "Row $rowNum ($email): invalid email."; continue;
                        }

                        $deptId = !empty($data['department']) ? ($deptMap[strtolower($data['department'])] ?? null) : null;

                        $courseIds = [];
                        if (!empty($data['course_codes']))
                            foreach (explode('|', $data['course_codes']) as $t)
                                if (isset($courseMap[strtolower(trim($t))])) $courseIds[] = $courseMap[strtolower(trim($t))];

                        $sectionIds = [];
                        if (!empty($data['section_codes']))
                            foreach (explode('|', $data['section_codes']) as $t)
                                if (isset($sectionMap[strtolower(trim($t))])) $sectionIds[] = $sectionMap[strtolower(trim($t))];

                        try {
                            $pdo->beginTransaction();
                            $hash = password_hash($password, PASSWORD_BCRYPT);
                            $pdo->prepare("INSERT INTO users (full_name, email, password_hash, role, status, email_verified) VALUES (?,?,?,'faculty','active',1)")
                                ->execute([$fullName, $email, $hash]);
                            $newUserId = (int)$pdo->lastInsertId();
                            $pdo->prepare("INSERT INTO faculty_profiles (user_id, department_id, employee_id, academic_rank, status) VALUES (?,?,?,?,'Active')")
                                ->execute([$newUserId, $deptId, $employeeId, $data['academic_rank'] ?? '']);
                            if ($courseIds && $sectionIds) {
                                foreach ($courseIds as $cid) foreach ($sectionIds as $sid) {
                                    $coStmt->execute([$cid, $sid]);
                                    $co = $coStmt->fetchColumn();
                                    if ($co) $faStmt->execute([$newUserId, $co]);
                                }
                            }
                            $pdo->prepare("INSERT INTO user_settings (user_id) VALUES (?)")->execute([$newUserId]);
                            $pdo->commit();
                            $imported++;
                        } catch (PDOException $e) {
                            $pdo->rollBack();
                            $skipped[] = "Row $rowNum ($email): " . ($e->getCode() === '23000' ? 'email already exists' : $e->getMessage()) . '.';
                        }
                    }
                    fclose($handle);

                    $teachers = $pdo->query("SELECT u.id, u.full_name, u.email, u.status, fp.employee_id, fp.academic_rank, d.name AS department, COUNT(DISTINCT fa.id) AS assignment_count FROM users u LEFT JOIN faculty_profiles fp ON fp.user_id = u.id LEFT JOIN departments d ON d.id = fp.department_id LEFT JOIN faculty_assignments fa ON fa.faculty_user_id = u.id WHERE u.role = 'faculty' GROUP BY u.id ORDER BY u.full_name")->fetchAll(PDO::FETCH_ASSOC);
                    $totalTeachers = count($teachers);

                    if ($imported > 0) {
                        $actionSuccess = "Successfully imported $imported teacher(s)." . ($skipped ? ' Skipped: ' . implode(' | ', $skipped) : '');
                    } else {
                        $actionError = 'No teachers imported.' . ($skipped ? ' Issues: ' . implode(' | ', $skipped) : '');
                    }
                }
            }
        }
    }
    // ── Import Sections CSV ──
    if ($action === 'import_sections_csv') {
        $file = $_FILES['sections_csv_file'] ?? null;
        if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
            $actionError = 'No file uploaded or upload error.';
        } elseif (strtolower(pathinfo($file['name'], PATHINFO_EXTENSION)) !== 'csv') {
            $actionError = 'Please upload a valid .csv file.';
        } else {
            $handle = fopen($file['tmp_name'], 'r');
            if (!$handle) {
                $actionError = 'Could not read the uploaded file.';
            } else {
                $header = array_map('strtolower', array_map('trim', fgetcsv($handle)));
                $requiredCols = ['code', 'year_level'];
                $missingCols = array_diff($requiredCols, $header);

                if ($missingCols) {
                    $actionError = 'CSV missing required columns: ' . implode(', ', $missingCols);
                    fclose($handle);
                } else {
                    $imported = 0; $updated = 0; $skipped = []; $rowNum = 1;

                    // Build existing section map: code => id
                    $existingMap = [];
                    foreach ($pdo->query("SELECT id, code FROM class_sections")->fetchAll(PDO::FETCH_ASSOC) as $s) {
                        $existingMap[strtolower(trim($s['code']))] = $s['id'];
                    }

                    $insertStmt = $pdo->prepare("INSERT INTO class_sections (code, program, year_level, adviser_name) VALUES (?,?,?,?)");
                    $updateStmt = $pdo->prepare("UPDATE class_sections SET code=?, program=?, adviser_name=? WHERE id=?");

                    while (($row = fgetcsv($handle)) !== false) {
                        $rowNum++;
                        $data = [];
                        foreach ($header as $i => $col) $data[$col] = isset($row[$i]) ? trim($row[$i]) : '';

                        $code      = $data['code']       ?? '';
                        $yearLevel = (int)($data['year_level'] ?? 0);
                        $program   = $data['program']    ?? '';
                        $adviser   = $data['adviser_name'] ?? '';

                        if (!$code || !$yearLevel) {
                            $skipped[] = "Row $rowNum: code and year_level are required."; continue;
                        }
                        if ($yearLevel < 7 || $yearLevel > 12) {
                            $skipped[] = "Row $rowNum ($code): year_level must be 7–12."; continue;
                        }

                        $existingId = $existingMap[strtolower($code)] ?? null;

                        try {
                            if ($existingId) {
                                // Update existing section
                                $updateStmt->execute([$code, $program ?: $code, $adviser ?: null, $existingId]);
                                $updated++;
                            } else {
                                // Insert new section
                                $insertStmt->execute([$code, $program ?: $code, $yearLevel, $adviser ?: null]);
                                $existingMap[strtolower($code)] = (int)$pdo->lastInsertId();
                                $imported++;
                            }
                        } catch (PDOException $e) {
                            $skipped[] = "Row $rowNum ($code): " . $e->getMessage() . '.';
                        }
                    }
                    fclose($handle);

                    $sections = $pdo->query("SELECT id, code, program, year_level, adviser_name FROM class_sections ORDER BY year_level, code")->fetchAll(PDO::FETCH_ASSOC);
                    $totalSections = count($sections);

                    $parts = [];
                    if ($imported) $parts[] = "$imported section(s) added";
                    if ($updated)  $parts[] = "$updated section(s) updated";
                    if ($parts) {
                        $actionSuccess = implode(', ', $parts) . '.' . ($skipped ? ' Skipped: ' . implode(' | ', $skipped) : '');
                    } else {
                        $actionError = 'No sections imported.' . ($skipped ? ' Issues: ' . implode(' | ', $skipped) : '');
                    }
                }
            }
        }
    }

    // ── Add Section ──
    if ($action === 'add_section') {
        $code       = trim($_POST['section_code'] ?? '');
        $program    = trim($_POST['section_program'] ?? '');
        $yearLevel  = (int)($_POST['year_level'] ?? 0);
        $adviser    = trim($_POST['adviser_name'] ?? '');

        if (!$code || !$yearLevel) {
            $actionError = 'Section code and year level are required.';
        } else {
            try {
                $pdo->prepare("INSERT INTO class_sections (code, program, year_level, adviser_name) VALUES (?,?,?,?)")
                    ->execute([$code, $program ?: $code, $yearLevel, $adviser ?: null]);
                $actionSuccess = "Section \"{$code}\" added successfully!";
            } catch (PDOException $e) {
                $actionError = $e->getCode() === '23000' ? 'A section with that code already exists.' : $e->getMessage();
            }
        }
        $sections = $pdo->query("SELECT id, code, program, year_level, adviser_name FROM class_sections ORDER BY year_level, code")->fetchAll(PDO::FETCH_ASSOC);
        $totalSections = count($sections);
    }

    // ── Rename Section ──
    if ($action === 'rename_section') {
        $sid        = (int)($_POST['section_id'] ?? 0);
        $code       = trim($_POST['section_code'] ?? '');
        $program    = trim($_POST['section_program'] ?? '');
        $adviser    = trim($_POST['adviser_name'] ?? '');

        if (!$sid || !$code) {
            $actionError = 'Section ID and code are required.';
        } else {
            $pdo->prepare("UPDATE class_sections SET code=?, program=?, adviser_name=? WHERE id=?")
                ->execute([$code, $program ?: $code, $adviser ?: null, $sid]);
            $actionSuccess = "Section updated successfully!";
        }
        $sections = $pdo->query("SELECT id, code, program, year_level, adviser_name FROM class_sections ORDER BY year_level, code")->fetchAll(PDO::FETCH_ASSOC);
        $totalSections = count($sections);
    }

    // ── Delete Section ──
    if ($action === 'delete_section') {
        $sid = (int)($_POST['section_id'] ?? 0);
        try {
            $pdo->prepare("DELETE FROM class_sections WHERE id=?")->execute([$sid]);
            header('Location: admin-dashboard.php?tab=sections&msg=section_deleted');
            exit;
        } catch (PDOException $e) {
            $actionError = 'Cannot delete section — it may have students or assignments linked to it.';
            $sections = $pdo->query("SELECT id, code, program, year_level, adviser_name FROM class_sections ORDER BY year_level, code")->fetchAll(PDO::FETCH_ASSOC);
        }
    }
}

$appData = [
    'stats'      => ['teachers' => $totalTeachers, 'students' => $totalStudents, 'sections' => $totalSections, 'evals' => $totalEvals],
    'teachers'   => $teachers,
    'departments'=> $departments,
    'courses'    => $courses,
    'sections'   => $sections,
    'flash'      => ['error' => $actionError, 'success' => $actionSuccess],
    'activeTab'  => $_GET['tab'] ?? 'overview',
    'urlMsg'     => $_GET['msg'] ?? '',
];
$encoded = json_encode($appData, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE);
if (!$encoded) $encoded = '{}';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <link rel="icon" href="favicon/favicon.ico" type="image/x-icon">
    <link rel="icon" href="favicon/favicon-16x16.png" sizes="16x16" type="image/png">
    <link rel="icon" href="favicon/favicon-32x32.png" sizes="32x32" type="image/png">
    <link rel="apple-touch-icon" href="favicon/apple-touch-icon.png" sizes="180x180">
    <link rel="icon" href="favicon/android-chrome-192x192.png" sizes="192x192" type="image/png">
    <link rel="icon" href="favicon/android-chrome-512x512.png" sizes="512x512" type="image/png">
    <link rel="manifest" href="favicon/site.webmanifest">
    <title>Admin Dashboard | Professor Evaluation</title>
    <link rel="stylesheet" href="student-dashboard.css"/>
    <link rel="stylesheet" href="admin-dashboard.css"/>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet"/>
    <script>
    (function() {
        if (localStorage.getItem('adminSidebarCollapsed') === 'true') {
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
        <img src="favicon/android-chrome-192x192.png" alt="Admin"/>
        <span>Admin Panel</span>
    </div>
    <nav class="nav-menu">
        <a href="#" class="nav-link tooltip-enabled" data-module="overview" data-tooltip="Overview" aria-label="Overview">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span>Overview</span>
        </a>
        <a href="#" class="nav-link tooltip-enabled" data-module="teachers" data-tooltip="Teachers" aria-label="Teachers">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>Teachers</span>
        </a>
        <a href="#" class="nav-link tooltip-enabled" data-module="sections" data-tooltip="Sections" aria-label="Sections">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>Sections</span>
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

<!-- Add Teacher Modal -->
<div class="modal-overlay" id="add-teacher-modal" hidden>
    <div class="modal">
        <div class="modal-header">
            <h2>Add New Teacher</h2>
            <button class="modal-close" id="modal-close-btn" aria-label="Close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>
        <div class="modal-body">
            <form method="POST" action="admin-dashboard.php" id="add-teacher-form">
                <input type="hidden" name="action" value="add_teacher"/>

                <div class="form-section-title">Account Info</div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="full_name">Full Name <span class="required">*</span></label>
                        <input type="text" id="full_name" name="full_name" placeholder="e.g. Maria Santos" required/>
                    </div>
                    <div class="form-group">
                        <label for="email">Email <span class="required">*</span></label>
                        <input type="email" id="email" name="email" placeholder="e.g. msantos@dihs.edu.ph" required/>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="password">Password <span class="required">*</span></label>
                        <input type="password" id="password" name="password" placeholder="Set initial password" required/>
                    </div>
                    <div class="form-group">
                        <label for="employee_id">Employee ID <span class="required">*</span></label>
                        <input type="text" id="employee_id" name="employee_id" placeholder="e.g. EMP-2024-009" required/>
                    </div>
                </div>

                <div class="form-section-title">Professional Info</div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="academic_rank">Academic Rank</label>
                        <input type="text" id="academic_rank" name="academic_rank" placeholder="e.g. Instructor I"/>
                    </div>
                    <div class="form-group">
                        <label for="department_id">Department</label>
                        <select id="department_id" name="department_id">
                            <option value="">— Select Department —</option>
                            <?php foreach ($departments as $dept): ?>
                            <option value="<?= $dept['id'] ?>"><?= htmlspecialchars($dept['name'], ENT_QUOTES) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </div>

                <div class="form-section-title">Subject Assignments</div>
                <p class="form-hint">Select which subjects and sections this teacher will handle.</p>

                <div class="form-group">
                    <label>Subjects (Courses)</label>
                    <div class="checkbox-grid">
                        <?php foreach ($courses as $course): ?>
                        <label class="checkbox-item">
                            <input type="checkbox" name="course_ids[]" value="<?= $course['id'] ?>"/>
                            <span><?= htmlspecialchars($course['name'], ENT_QUOTES) ?></span>
                        </label>
                        <?php endforeach; ?>
                    </div>
                </div>

                <div class="form-group">
                    <label>Class Sections</label>
                    <div class="sections-grid">
                        <?php
                        $byGrade = [];
                        foreach ($sections as $sec) {
                            $byGrade[$sec['year_level']][] = $sec;
                        }
                        ksort($byGrade);
                        foreach ($byGrade as $grade => $secs):
                        ?>
                        <div class="section-grade-group">
                            <div class="section-grade-label">Grade <?= $grade ?></div>
                            <?php foreach ($secs as $sec): ?>
                            <label class="checkbox-item">
                                <input type="checkbox" name="section_ids[]" value="<?= $sec['id'] ?>"/>
                                <span><?= htmlspecialchars($sec['code'], ENT_QUOTES) ?></span>
                            </label>
                            <?php endforeach; ?>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn btn-outline" id="modal-cancel-btn">Cancel</button>
                    <button type="submit" class="btn btn-primary">Add Teacher</button>
                </div>
            </form>
        </div>
    </div>
</div>
<!-- CSV Import Modal -->
<div class="modal-overlay" id="csv-import-modal" hidden>
    <div class="modal" style="max-width:560px">
        <div class="modal-header">
            <h2>Import Teachers via CSV</h2>
            <button class="modal-close" id="csv-modal-close-btn" aria-label="Close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>
        <div class="modal-body">
            <div class="csv-format-box">
                <div class="csv-format-title">Required CSV Columns</div>
                <div class="csv-cols-grid">
                    <div class="csv-col-item csv-col-required"><span class="csv-col-name">full_name</span><span class="csv-col-badge csv-badge-required">required</span></div>
                    <div class="csv-col-item csv-col-required"><span class="csv-col-name">email</span><span class="csv-col-badge csv-badge-required">required</span></div>
                    <div class="csv-col-item csv-col-required"><span class="csv-col-name">password</span><span class="csv-col-badge csv-badge-required">required</span></div>
                    <div class="csv-col-item csv-col-required"><span class="csv-col-name">employee_id</span><span class="csv-col-badge csv-badge-required">required</span></div>
                    <div class="csv-col-item"><span class="csv-col-name">academic_rank</span><span class="csv-col-badge csv-badge-optional">optional</span></div>
                    <div class="csv-col-item"><span class="csv-col-name">department</span><span class="csv-col-badge csv-badge-optional">optional</span></div>
                    <div class="csv-col-item"><span class="csv-col-name">course_codes</span><span class="csv-col-badge csv-badge-optional">optional</span></div>
                    <div class="csv-col-item"><span class="csv-col-name">section_codes</span><span class="csv-col-badge csv-badge-optional">optional</span></div>
                </div>
                <p class="csv-hint">Separate multiple values with a pipe: <code>Mathematics|Science</code></p>
                <a href="admin-dashboard.php?action=download_csv_template" class="csv-template-link">
                    ↓ Download Sample CSV Template
                </a>
            </div>
            <form method="POST" action="admin-dashboard.php" enctype="multipart/form-data" id="csv-import-form">
                <input type="hidden" name="action" value="import_csv"/>
                <div class="csv-dropzone" id="csv-dropzone">
                    <p class="csv-drop-text">Drag &amp; drop your CSV here, or <label for="csv_file" class="csv-browse-label">browse</label></p>
                    <p class="csv-drop-hint" id="csv-file-name">Only .csv files accepted</p>
                    <input type="file" name="csv_file" id="csv_file" accept=".csv" class="csv-file-input"/>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-outline" id="csv-modal-cancel-btn">Cancel</button>
                    <button type="submit" class="btn btn-primary" id="csv-submit-btn" disabled>Import Teachers</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>window.__APP_DATA__ = <?= $encoded ?>;</script>
<script src="admin-dashboard.js"></script>
</body>
</html>