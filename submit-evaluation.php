<?php
declare(strict_types=1);
session_start();

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/auth.php';

header('Content-Type: application/json');

require_login();

$pdo = get_pdo();
$currentUser = current_user($pdo);

if (!$currentUser || $currentUser['role'] !== 'student') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$facultyAssignmentId = (int)($input['faculty_assignment_id'] ?? 0);
$ratingClarity      = (int)($input['rating_clarity'] ?? 0);
$ratingFeedback     = (int)($input['rating_feedback'] ?? 0);
$ratingEngagement   = (int)($input['rating_engagement'] ?? 0);
$ratingSupport      = (int)($input['rating_support'] ?? 0);
$strengths          = trim($input['strengths'] ?? '');
$opportunities      = trim($input['opportunities'] ?? '');
$isAnonymous        = !empty($input['is_anonymous']);

// Validate
if (!$facultyAssignmentId || $ratingClarity < 1 || $ratingClarity > 5 
    || $ratingFeedback < 1 || $ratingFeedback > 5
    || $ratingEngagement < 1 || $ratingEngagement > 5
    || $ratingSupport < 1 || $ratingSupport > 5) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input']);
    exit;
}

try {
    // Check if already submitted
    $checkStmt = $pdo->prepare('SELECT id FROM evaluations WHERE faculty_assignment_id = ? AND student_user_id = ? LIMIT 1');
    $checkStmt->execute([$facultyAssignmentId, $currentUser['id']]);
    if ($checkStmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'You have already evaluated this professor']);
        exit;
    }

    // Insert
    $stmt = $pdo->prepare(
        'INSERT INTO evaluations (faculty_assignment_id, student_user_id, rating_clarity, rating_feedback, rating_engagement, rating_support, strengths, opportunities, is_anonymous)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $facultyAssignmentId,
        $isAnonymous ? null : $currentUser['id'],
        $ratingClarity,
        $ratingFeedback,
        $ratingEngagement,
        $ratingSupport,
        $strengths ?: null,
        $opportunities ?: null,
        $isAnonymous ? 1 : 0
    ]);

    echo json_encode(['success' => true, 'message' => 'Evaluation submitted successfully']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}