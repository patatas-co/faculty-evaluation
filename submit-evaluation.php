<?php
declare(strict_types=1);
ini_set('display_errors', '0');
error_reporting(E_ALL);
ini_set('log_errors', '1');

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/auth.php';

if (isset($_GET['debug'])) {
    ensure_session_started();
    echo json_encode([
        'session' => $_SESSION,
        'php_version' => PHP_VERSION,
        'file_exists_db' => file_exists(__DIR__ . '/config/database.php'),
        'file_exists_auth' => file_exists(__DIR__ . '/includes/auth.php'),
    ]);
    exit;
}
header('Content-Type: application/json');

// Don't use require_login() here — it redirects to HTML which breaks JSON
$pdo = get_pdo();
$currentUser = current_user($pdo);

if (!$currentUser) {
    echo json_encode(['success' => false, 'message' => 'Session expired. Please log in again.']);
    exit;
}

if ($currentUser['role'] !== 'student') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);

if (!is_array($body)) {
    echo json_encode(['success' => false, 'message' => 'Invalid request body.']);
    exit;
}

$submittedToken = $body['csrf_token'] ?? '';
if (!isset($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $submittedToken)) {
    echo json_encode(['success' => false, 'message' => 'Invalid or expired request. Please refresh the page.']);
    exit;
}

$facultyAssignmentId = (int)($body['faculty_assignment_id'] ?? 0);
$ratingClarity       = (int)($body['rating_clarity']        ?? 0);
$ratingFeedback      = (int)($body['rating_feedback']       ?? 0);
$ratingEngagement    = (int)($body['rating_engagement']     ?? 0);
$ratingSupport       = (int)($body['rating_support']        ?? 0);
$strengths           = trim($body['strengths']              ?? '');
$improvements        = trim($body['improvements']           ?? '');

if ($facultyAssignmentId === 0) {
    echo json_encode(['success' => false, 'message' => 'Missing teacher assignment ID.']);
    exit;
}

foreach ([$ratingClarity, $ratingFeedback, $ratingEngagement, $ratingSupport] as $r) {
    if ($r < 1 || $r > 5) {
        echo json_encode(['success' => false, 'message' => 'Invalid rating value. Each rating must be between 1 and 5.']);
        exit;
    }
}

try {
    $check = $pdo->prepare("
        SELECT fa.id FROM faculty_assignments fa
        JOIN course_offerings co ON co.id = fa.course_offering_id
        JOIN student_profiles sp ON sp.class_section_id = co.class_section_id
        WHERE fa.id = ? AND sp.user_id = ? AND co.is_active = 1
        LIMIT 1
    ");
    $check->execute([$facultyAssignmentId, $currentUser['id']]);
    if (!$check->fetchColumn()) {
        echo json_encode(['success' => false, 'message' => 'You are not allowed to evaluate this teacher.']);
        exit;
    }

    $dup = $pdo->prepare("
        SELECT id FROM evaluations
        WHERE faculty_assignment_id = ? AND student_user_id = ?
        LIMIT 1
    ");
    $dup->execute([$facultyAssignmentId, $currentUser['id']]);
    if ($dup->fetchColumn()) {
        echo json_encode(['success' => false, 'message' => 'You have already submitted an evaluation for this teacher.']);
        exit;
    }

    $insert = $pdo->prepare("
        INSERT INTO evaluations
            (faculty_assignment_id, student_user_id, rating_clarity, rating_feedback,
             rating_engagement, rating_support, strengths, improvements, submitted_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    $insert->execute([
        $facultyAssignmentId,
        $currentUser['id'],
        $ratingClarity,
        $ratingFeedback,
        $ratingEngagement,
        $ratingSupport,
        $strengths,
        $improvements
    ]);

    echo json_encode(['success' => true, 'message' => 'Evaluation submitted successfully.']);

} catch (\PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}