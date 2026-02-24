<?php
declare(strict_types=1);
session_start();
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/auth.php';

require_login();
$pdo         = get_pdo();
$currentUser = current_user($pdo);

if (!$currentUser || $currentUser['role'] !== 'super_admin') {
    header('Location: login.php');
    exit;
}

// ── Ensure audit log table exists ──────────────────────────────────────────
$pdo->exec("
    CREATE TABLE IF NOT EXISTS admin_action_logs (
        id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        actor_name   VARCHAR(191) NOT NULL DEFAULT 'System',
        action       VARCHAR(60)  NOT NULL,
        target_name  VARCHAR(191) NOT NULL DEFAULT '',
        target_email VARCHAR(191) NOT NULL DEFAULT '',
        created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

// ── Log helper ─────────────────────────────────────────────────────────────
function log_action(PDO $pdo, string $actorName, string $action, string $targetName, string $targetEmail): void {
    $pdo->prepare(
        "INSERT INTO admin_action_logs (actor_name, action, target_name, target_email)
         VALUES (?, ?, ?, ?)"
    )->execute([$actorName, $action, $targetName, $targetEmail]);
}

// ── JSON endpoints ─────────────────────────────────────────────────────────
if (isset($_GET['json'])) {
    header('Content-Type: application/json');
    if ($_GET['json'] === 'admins') {
        $admins = $pdo->query(
            "SELECT id, full_name, email, role, status,
                    DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at
             FROM users
             WHERE role IN ('admin','super_admin')
             ORDER BY created_at ASC"
        )->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['admins' => $admins]);
    }

    if ($_GET['json'] === 'logs') {
    $page    = max(1, (int)($_GET['page'] ?? 1));
    $filter  = $_GET['filter'] ?? '';
    $perPage = 10;
    $offset  = ($page - 1) * $perPage;

    $allowed = ['Created admin','Deleted admin','Updated password','Deactivated admin','Reactivated admin'];
    $where   = '';
    $params  = [];

    if (in_array($filter, $allowed, true)) {
        $where    = 'WHERE action = ?';
        $params[] = $filter;
    }

    $total = (int)$pdo->prepare("SELECT COUNT(*) FROM admin_action_logs $where")
                      ->execute($params) ? $pdo->prepare("SELECT COUNT(*) FROM admin_action_logs $where") : 0;

    // cleaner count query
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM admin_action_logs $where");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $logStmt = $pdo->prepare(
        "SELECT actor_name, action, target_name, target_email,
                DATE_FORMAT(created_at, '%b %d, %Y %h:%i %p') AS created_at
         FROM admin_action_logs
         $where
         ORDER BY created_at DESC
         LIMIT $perPage OFFSET $offset"
    );
    $logStmt->execute($params);
    $logs = $logStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'logs'      => $logs,
        'total'     => $total,
        'page'      => $page,
        'per_page'  => $perPage,
        'pages'     => (int)ceil($total / $perPage),
    ]);
}

    exit;
}

// ── POST actions ───────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    $action = $_POST['action'] ?? '';

    // ── Create ──
    if ($action === 'create_admin') {
        $name     = trim($_POST['name']     ?? '');
        $email    = trim($_POST['email']    ?? '');
        $password = $_POST['password']      ?? '';
        $role     = ($_POST['role'] ?? '') === 'super_admin' ? 'super_admin' : 'admin';

        if (!$name || !$email || !$password) { echo json_encode(['ok'=>false,'error'=>'All fields are required.']); exit; }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { echo json_encode(['ok'=>false,'error'=>'Invalid email address.']); exit; }
        if (strlen($password) < 8) { echo json_encode(['ok'=>false,'error'=>'Password must be at least 8 characters.']); exit; }

        $check = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
        $check->execute([$email]);
        if ($check->fetch()) { echo json_encode(['ok'=>false,'error'=>'Email already exists.']); exit; }

        try {
            $hash = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("INSERT INTO users (full_name, email, password_hash, role, status) VALUES (?, ?, ?, ?, 'active')");
            $stmt->execute([$name, $email, $hash, $role]);
            $newId = (int)$pdo->lastInsertId();
            log_action($pdo, $currentUser['full_name'], 'Created admin', $name, $email);
            echo json_encode([
                'ok'    => true,
                'admin' => [
                    'id'         => $newId,
                    'full_name'  => $name,
                    'email'      => $email,
                    'role'       => $role,
                    'status'     => 'active',
                    'created_at' => date('Y-m-d'),
                ]
            ]);
        } catch (PDOException $e) {
            echo json_encode(['ok'=>false,'error'=>'Database error: '.$e->getMessage()]);
        }
        exit;
    }

    // ── Update password ──
    if ($action === 'update_admin_password') {
        $uid      = (int)($_POST['user_id']  ?? 0);
        $password = $_POST['password']       ?? '';
        $t = $pdo->prepare("SELECT full_name, email FROM users WHERE id = ? LIMIT 1");
        $t->execute([$uid]);
        $target = $t->fetch();
        if (strlen($password) < 8) { echo json_encode(['ok'=>false,'error'=>'Password must be at least 8 characters.']); exit; }
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ? AND role IN ('admin','super_admin')")->execute([$hash, $uid]);
        log_action($pdo, $currentUser['full_name'], 'Updated password', $target['full_name'] ?? '', $target['email'] ?? '');
        echo json_encode(['ok'=>true]);
        exit;
    }

    // ── Delete ──
    if ($action === 'delete_admin') {
        $uid = (int)($_POST['user_id'] ?? 0);
        if ($uid === (int)$currentUser['id']) { echo json_encode(['ok'=>false,'error'=>'You cannot delete your own account.']); exit; }
        $t = $pdo->prepare("SELECT full_name, email FROM users WHERE id = ? LIMIT 1");
        $t->execute([$uid]);
        $target = $t->fetch();
        $pdo->prepare("DELETE FROM users WHERE id = ? AND role IN ('admin','super_admin')")->execute([$uid]);
        log_action($pdo, $currentUser['full_name'], 'Deleted admin', $target['full_name'] ?? '', $target['email'] ?? '');
        echo json_encode(['ok'=>true]);
        exit;
    }

    // ── Deactivate ──
    if ($action === 'deactivate_admin') {
        $uid = (int)($_POST['user_id'] ?? 0);
        if ($uid === (int)$currentUser['id']) { echo json_encode(['ok'=>false,'error'=>'You cannot deactivate yourself.']); exit; }
        $t = $pdo->prepare("SELECT full_name, email FROM users WHERE id = ? LIMIT 1");
        $t->execute([$uid]);
        $target = $t->fetch();
        $pdo->prepare("UPDATE users SET status = 'inactive' WHERE id = ?")->execute([$uid]);
        log_action($pdo, $currentUser['full_name'], 'Deactivated admin', $target['full_name'] ?? '', $target['email'] ?? '');
        echo json_encode(['ok'=>true]);
        exit;
    }

    // ── Reactivate ──
    if ($action === 'reactivate_admin') {
        $uid = (int)($_POST['user_id'] ?? 0);
        $t = $pdo->prepare("SELECT full_name, email FROM users WHERE id = ? LIMIT 1");
        $t->execute([$uid]);
        $target = $t->fetch();
        $pdo->prepare("UPDATE users SET status = 'active' WHERE id = ?")->execute([$uid]);
        log_action($pdo, $currentUser['full_name'], 'Reactivated admin', $target['full_name'] ?? '', $target['email'] ?? '');
        echo json_encode(['ok'=>true]);
        exit;
    }

    echo json_encode(['ok'=>false,'error'=>'Unknown action.']);
    exit;
}

// ── Page load ──────────────────────────────────────────────────────────────
$admins     = $pdo->query("SELECT id, full_name, email, role, status, DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at FROM users WHERE role IN ('admin','super_admin') ORDER BY created_at ASC")->fetchAll(PDO::FETCH_ASSOC);
$adminsJson = json_encode($admins, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
$currentId  = (int)$currentUser['id'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" href="favicon/favicon.ico" type="image/x-icon">
<title>Manage Admins | Admin Panel</title>
<link rel="stylesheet" href="student-dashboard.css"/>
<link rel="stylesheet" href="admin-dashboard.css"/>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style>
.ma-wrap { max-width: 100%; }
.ma-card { background:#fff; border:1px solid #e9eef6; border-radius:16px;
           box-shadow:0 2px 8px rgba(15,23,42,.05); margin-bottom:24px; }
.ma-card-head { padding:18px 24px; border-bottom:1px solid #e9eef6;
                display:flex; align-items:center; justify-content:space-between;
                gap:12px; flex-wrap:wrap; }
.ma-card-title { font-size:.9rem; font-weight:700; color:#111826;
                 display:flex; align-items:center; gap:8px; }
.ma-dot { width:7px; height:7px; border-radius:50%; background:#4caf50; display:inline-block; }
.ma-dot.blue   { background:#3b82f6; }
.ma-dot.purple { background:#8b5cf6; }
.ma-card-body { padding:24px; }

.ma-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
@media(max-width:560px){ .ma-form-grid { grid-template-columns:1fr; } }
.ma-form-group { display:flex; flex-direction:column; gap:6px; }
.ma-form-group label { font-size:.78rem; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:.04em; }
.ma-form-group input,
.ma-form-group select {
    padding:10px 14px; border:1px solid #e2e8f0; border-radius:9px;
    font-family:inherit; font-size:.9rem; color:#111826;
    transition:border .15s, box-shadow .15s; outline:none;
    background:#fff; width:100%; box-sizing:border-box;
}
.ma-form-group input:focus,
.ma-form-group select:focus { border-color:#4caf50; box-shadow:0 0 0 3px rgba(76,175,80,.12); }
.ma-pw-wrap { position:relative; }
.ma-pw-wrap input { padding-right:40px; }
.ma-pw-toggle { position:absolute; right:10px; top:50%; transform:translateY(-50%);
                background:none; border:none; cursor:pointer; color:#94a3b8; padding:2px;
                display:flex; align-items:center; }
.ma-pw-toggle:hover { color:#64748b; }
.ma-form-actions { display:flex; justify-content:flex-end; gap:8px;
                   margin-top:20px; padding-top:16px; border-top:1px solid #e9eef6; }

.ma-table-wrap { overflow-x:auto; }
.ma-table { width:100%; border-collapse:collapse; font-size:.88rem; }
.ma-table thead tr { background:#f9fbff; border-bottom:2px solid #e9eef6; }
.ma-table th { padding:12px 16px; text-align:left; font-size:.72rem; font-weight:700;
               color:#64748b; text-transform:uppercase; letter-spacing:.05em; white-space:nowrap; }
.ma-table td { padding:14px 16px; border-bottom:1px solid #f1f5f9; color:#374151;
               vertical-align:middle; line-height:1.5; }
.ma-table tbody tr:last-child td { border-bottom:none; }
.ma-table tbody tr:hover td { background:#f9fbff; }

.ma-name-cell { display:flex; align-items:center; gap:10px; }
.ma-avatar { width:34px; height:34px; border-radius:50%; background:#4caf50; color:#fff;
             font-size:.78rem; font-weight:700; display:inline-flex; align-items:center;
             justify-content:center; flex-shrink:0; letter-spacing:.02em; }
.ma-avatar.you { background:#3b82f6; }
.ma-name-text { font-weight:600; color:#111826; font-size:.9rem; }
.ma-you-tag { font-size:.7rem; font-weight:600; color:#3b82f6;
              background:#eff6ff; padding:2px 7px; border-radius:999px; margin-left:4px; }
.ma-email { font-size:.82rem; color:#94a3b8; font-family:monospace; }

.ma-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 10px;
            border-radius:999px; font-size:.72rem; font-weight:700; }
.ma-badge-super    { background:#fef3c7; color:#92400e; }
.ma-badge-admin    { background:#eff6ff; color:#2563eb; }
.ma-badge-active   { background:#dcfce7; color:#166534; }
.ma-badge-inactive { background:#fee2e2; color:#991b1b; }

.ma-actions { display:flex; gap:6px; align-items:center; flex-wrap:wrap; }
.ma-btn { padding:5px 12px; border-radius:8px; border:none; font-size:.78rem;
          font-weight:600; cursor:pointer; font-family:inherit; transition:all .15s;
          display:inline-flex; align-items:center; gap:5px; }
.ma-btn-edit       { background:#f1f5f9; color:#475569; border:1px solid #e2e8f0; }
.ma-btn-edit:hover { background:#e2e8f0; }
.ma-btn-deactivate       { background:#f1f5f9; color:#475569; border:1px solid #e2e8f0; border-radius:999px; }
.ma-btn-deactivate:hover { background:#e2e8f0; }
.ma-btn-reactivate       { background:#f1f5f9; color:#475569; border:1px solid #e2e8f0; border-radius:999px; }
.ma-btn-reactivate:hover { background:#e2e8f0; }
.ma-btn-del       { background:transparent; color:#dc2626; border:2px solid #fca5a5; border-radius:999px; }
.ma-btn-del:hover { background:#fee2e2; }
.ma-protected { font-size:.75rem; color:#94a3b8; }

.ma-edit-row td { background:#f8fafc; padding-top:0; padding-bottom:0; }
.ma-edit-inline { padding:12px 0; display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.ma-edit-inline .ma-form-label { font-size:.78rem; font-weight:600; color:#64748b; white-space:nowrap; }
.ma-edit-inline input { padding:8px 12px; border:1px solid #e2e8f0; border-radius:8px;
                        font-family:inherit; font-size:.85rem; width:200px; outline:none; transition:border .15s; }
.ma-edit-inline input:focus { border-color:#4caf50; box-shadow:0 0 0 3px rgba(76,175,80,.12); }

.ma-empty { text-align:center; padding:40px 20px; color:#94a3b8; font-size:.9rem; }

.ma-search-wrap { position:relative; }
.ma-search-wrap svg { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:#94a3b8; pointer-events:none; }
.ma-search-wrap input { padding:8px 12px 8px 32px; border:1px solid #e2e8f0; border-radius:9px;
                        font-family:inherit; font-size:.85rem; width:220px; outline:none; transition:border .15s; }
.ma-search-wrap input:focus { border-color:#4caf50; box-shadow:0 0 0 3px rgba(76,175,80,.12); }

.ma-count { font-size:.78rem; color:#94a3b8; font-family:monospace; }

.ma-live { display:inline-flex; align-items:center; gap:5px; font-size:.72rem; font-weight:600; color:#16a34a; }
.ma-live-dot { width:7px; height:7px; border-radius:50%; background:#16a34a;
               animation:maPulse 1.8s ease-in-out infinite; }
.ma-live.purple     { color:#8b5cf6; }
.ma-live-dot.purple { background:#8b5cf6; }

.ma-page-btn { padding:5px 11px; border-radius:7px; border:1px solid #e2e8f0;
               background:#fff; font-family:inherit; font-size:.78rem; font-weight:600;
               color:#475569; cursor:pointer; transition:all .15s; }
.ma-page-btn:hover    { background:#f1f5f9; }
.ma-page-btn.active   { background:#8b5cf6; color:#fff; border-color:#8b5cf6; }
.ma-page-btn:disabled { opacity:.4; cursor:default; }
.ma-page-info { font-size:.78rem; color:#94a3b8; font-family:monospace; }

/* History log row highlight */
@keyframes maLogFadeIn {
    from { background:#f5f3ff; }
    to   { background:transparent; }
}
.ma-log-new td { animation:maLogFadeIn 1.8s ease forwards; }
@keyframes maPulse {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:.45; transform:scale(.75); }
}
@keyframes maRowFadeIn {
    from { background:#dcfce7; }
    to   { background:transparent; }
}
.ma-row-new td { animation:maRowFadeIn 1.8s ease forwards; }

.ma-overlay { position:fixed; inset:0; background:rgba(15,23,42,.5);
              display:flex; align-items:center; justify-content:center;
              z-index:300; backdrop-filter:blur(3px); padding:20px; }
.ma-overlay[hidden] { display:none; }
.ma-dialog { background:#fff; border-radius:16px; padding:28px; max-width:380px; width:100%;
             box-shadow:0 20px 50px rgba(15,23,42,.2); animation:maPopIn .2s ease; text-align:center; }
@keyframes maPopIn { from{opacity:0;transform:scale(.97)} to{opacity:1;transform:scale(1)} }
.ma-dialog h3 { font-size:1.05rem; font-weight:700; color:#111826; margin-bottom:8px; }
.ma-dialog p  { font-size:.88rem; color:#64748b; margin-bottom:22px; line-height:1.6; }
.ma-dialog-actions { display:flex; gap:10px; justify-content:center; }

.ma-toast-wrap { position:fixed; bottom:24px; right:24px; display:flex;
                 flex-direction:column; gap:8px; z-index:999; }
.ma-toast { padding:11px 16px; border-radius:9px; font-size:.85rem; font-weight:600;
            box-shadow:0 4px 16px rgba(0,0,0,.12); animation:maSlideIn .2s ease;
            display:flex; align-items:center; gap:8px; min-width:220px; font-family:inherit; }
.ma-toast-ok  { background:#111826; color:#fff; }
.ma-toast-err { background:#ef4444; color:#fff; }
@keyframes maSlideIn { from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:translateX(0)} }
</style>
</head>
<body>

<aside class="sidebar">
    <button class="sidebar-toggle" aria-label="Toggle sidebar">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor">
            <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
    </button>
    <div class="logo">
        <img src="favicon/android-chrome-192x192.png" alt="Admin"/>
        <span>Super Admin</span>
    </div>
    <nav class="nav-menu">
        <a href="#" id="nav-admins" class="nav-link active tooltip-enabled" data-tooltip="Manage Admins" aria-label="Manage Admins" onclick="maShowSection('admins');return false;">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>Admins</span>
        </a>
        <a href="#" id="nav-history" class="nav-link tooltip-enabled" data-tooltip="History" aria-label="History" onclick="maShowSection('history');return false;">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>History</span>
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
        <h1 id="module-title">Manage Admins</h1>
        <p class="welcome">Logged in as <strong><?= htmlspecialchars($currentUser['full_name'], ENT_QUOTES) ?></strong></p>
    </header>

    <div class="ma-wrap">

        <!-- Admins Section -->
        <div id="ma-section-admins">

        <!-- Create Admin Card -->
        <div class="ma-card">
            <div class="ma-card-head">
                <div class="ma-card-title">
                    <span class="ma-dot"></span>
                    Create New Admin
                </div>
                <button class="action-btn action-btn-toggle" id="ma-toggle-btn" onclick="maToggleForm()">Hide</button>
            </div>
            <div class="ma-card-body" id="ma-form-body">
                <div class="ma-form-grid">
                    <div class="ma-form-group">
                        <label for="ma-name">Full Name</label>
                        <input type="text" id="ma-name" placeholder="Enter Full Name" autocomplete="off">
                    </div>
                    <div class="ma-form-group">
                        <label for="ma-email">Email Address</label>
                        <input type="email" id="ma-email" placeholder="Enter Email" autocomplete="off">
                    </div>
                    <div class="ma-form-group">
                        <label for="ma-password">Password</label>
                        <div class="ma-pw-wrap">
                            <input type="password" id="ma-password" placeholder="Minimum 8 characters">
                            <button class="ma-pw-toggle" type="button" onclick="maPwToggle('ma-password',this)" tabindex="-1">
                                <?= maEyeIcon() ?>
                            </button>
                        </div>
                    </div>
                    <div class="ma-form-group">
                        <label for="ma-confirm">Confirm Password</label>
                        <div class="ma-pw-wrap">
                            <input type="password" id="ma-confirm" placeholder="Re-enter password">
                            <button class="ma-pw-toggle" type="button" onclick="maPwToggle('ma-confirm',this)" tabindex="-1">
                                <?= maEyeIcon() ?>
                            </button>
                        </div>
                    </div>
                    <div class="ma-form-group">
                        <label for="ma-role">Role</label>
                        <select id="ma-role">
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                        </select>
                    </div>
                </div>
                <div class="ma-form-actions">
                    <button class="action-btn action-btn-toggle" onclick="maClearForm()">Clear</button>
                    <button class="btn btn-primary" onclick="maCreateAdmin()">+ Create Admin</button>
                </div>
            </div>
        </div>

        <!-- Admin List Card -->
        <div class="ma-card">
            <div class="ma-card-head">
                <div class="ma-card-title">
                    <span class="ma-dot blue"></span>
                    Admin Accounts
                    <span class="ma-count" id="ma-count">(<?= count($admins) ?>)</span>
                    <span class="ma-live">
                        <span class="ma-live-dot"></span> Live
                    </span>
                </div>
                <div class="ma-search-wrap">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                    <input type="text" id="ma-search" placeholder="Search…" oninput="maRender()">
                </div>
            </div>
            <div class="ma-table-wrap">
                <table class="ma-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody id="ma-tbody"></tbody>
                </table>
            </div>
        </div>

        </div><!-- /#ma-section-admins -->

        <!-- History Section -->
        <div id="ma-section-history" style="display:none">
        <div class="ma-card" id="ma-history">
    <div class="ma-card-head">
        <div class="ma-card-title">
            <span class="ma-dot purple"></span>
            Action History
            <span class="ma-live purple">
                <span class="ma-live-dot purple"></span> Live
            </span>
        </div>
        <select id="ma-log-filter" onchange="maLogFilterChange()"
                style="padding:7px 12px;border:1px solid #e2e8f0;border-radius:9px;
                       font-family:inherit;font-size:.82rem;color:#475569;
                       outline:none;cursor:pointer;background:#fff;">
            <option value="">All Actions</option>
            <option value="Created admin">Created Admin</option>
            <option value="Deleted admin">Deleted Admin</option>
            <option value="Updated password">Updated Password</option>
            <option value="Deactivated admin">Deactivated</option>
            <option value="Reactivated admin">Reactivated</option>
        </select>
    </div>
            <div class="ma-table-wrap">
                <table class="ma-table">
                    <thead>
                        <tr>
                            <th>Action</th>
                            <th>Admin Affected</th>
                            <th>Performed By</th>
                            <th>Date &amp; Time</th>
                        </tr>
                    </thead>
                    <tbody id="ma-log-tbody">
                        <tr><td colspan="4"><div class="ma-empty">Loading history…</div></td></tr>
                    </tbody>
                </table>
                <!-- Pagination -->
                <div id="ma-log-pagination" style="display:flex;align-items:center;
                     justify-content:space-between;padding:14px 20px;
                     border-top:1px solid #f1f5f9;flex-wrap:wrap;gap:8px;"></div>
            </div>
        </div>
            </div>
        </div>

        </div><!-- /#ma-section-history -->

    </div>
</main>

<!-- Confirm Delete Dialog -->
<div class="ma-overlay" id="ma-overlay" hidden>
    <div class="ma-dialog">
        <h3>Delete Admin Account</h3>
        <p id="ma-confirm-msg">Are you sure?</p>
        <div class="ma-dialog-actions">
            <button class="action-btn action-btn-toggle" onclick="maCloseConfirm()">Cancel</button>
            <button class="action-btn action-btn-delete" id="ma-confirm-del-btn">Delete</button>
        </div>
    </div>
</div>

<div class="ma-toast-wrap" id="ma-toast-wrap"></div>

<script>
let maAdmins     = <?= $adminsJson ?>;
const meSelf     = <?= $currentId ?>;
let maEditing    = null;
let maDelTarget  = null;
let maFormOpen   = true;
let maKnownIds   = new Set(maAdmins.map(a => a.id));
let maPendingNew = new Set();

// ── Real-time polling ──────────────────────────────────────────────────────
async function maPoll() {
    try {
        const res  = await fetch('manage-admins.php?json=admins&_=' + Date.now());
        const data = await res.json();
        if (!data.admins) return;
        const incoming = data.admins;
        incoming.forEach(a => {
            if (!maKnownIds.has(a.id)) {
                maPendingNew.add(a.id);
                maKnownIds.add(a.id);
            }
        });
        const changed = incoming.length !== maAdmins.length ||
            incoming.some((a, i) => maAdmins[i]?.id !== a.id || maAdmins[i]?.status !== a.status);
        if (changed || maPendingNew.size) {
            maAdmins = incoming;
            maRender();
        }
    } catch (_) {}
}
setInterval(maPoll, 4000);

// ── Log polling ────────────────────────────────────────────────────────────
let maLogs       = [];
let maLogTopTs   = null;
let maLogPage    = 1;
let maLogPages   = 1;
let maLogTotal   = 0;
let maLogFilter  = '';

async function maLogPoll(forceHighlight = false) {
    try {
        const url  = `manage-admins.php?json=logs&page=${maLogPage}&filter=${encodeURIComponent(maLogFilter)}&_=${Date.now()}`;
        const res  = await fetch(url);
        const data = await res.json();
        if (!data.logs) return;

        const newTop    = data.logs[0]?.created_at ?? null;
        const isNew     = forceHighlight || newTop !== maLogTopTs;
        maLogs          = data.logs;
        maLogTopTs      = newTop;
        maLogPages      = data.pages  ?? 1;
        maLogTotal      = data.total  ?? 0;
        maRenderLogs(isNew && maLogPage === 1);
        maRenderLogPagination();
    } catch (_) {}
}

function maLogFilterChange() {
    maLogFilter = document.getElementById('ma-log-filter').value;
    maLogPage   = 1;
    maLogPoll(true);
}

function maLogGoTo(page) {
    maLogPage = page;
    maLogPoll();
}

function maRenderLogs(highlightFirst = false) {
    const tbody = document.getElementById('ma-log-tbody');
    if (!maLogs.length) {
        tbody.innerHTML = `<tr><td colspan="4"><div class="ma-empty">No actions recorded yet.</div></td></tr>`;
        return;
    }
    const colors = {
        'Created admin':     { bg:'#dcfce7', color:'#166534' },
        'Deleted admin':     { bg:'#fee2e2', color:'#991b1b' },
        'Updated password':  { bg:'#eff6ff', color:'#1d4ed8' },
        'Deactivated admin': { bg:'#fef3c7', color:'#92400e' },
        'Reactivated admin': { bg:'#f0fdf4', color:'#166534' },
    };
    tbody.innerHTML = maLogs.map((l, i) => {
        const c   = colors[l.action] || { bg:'#f1f5f9', color:'#475569' };
        const cls = (i === 0 && highlightFirst) ? 'ma-log-new' : '';
        return `
        <tr class="${cls}">
            <td><span class="ma-badge" style="background:${c.bg};color:${c.color}">${l.action}</span></td>
            <td>
                <div style="font-weight:600;font-size:.88rem;color:#111826">${l.target_name}</div>
                <div style="font-size:.78rem;color:#94a3b8;font-family:monospace">${l.target_email}</div>
            </td>
            <td style="font-size:.85rem;color:#475569;font-weight:500">${l.actor_name}</td>
            <td style="font-family:monospace;font-size:.78rem;color:#94a3b8;white-space:nowrap">${l.created_at}</td>
        </tr>`;
    }).join('');
}

function maRenderLogPagination() {
    const wrap = document.getElementById('ma-log-pagination');
    if (maLogPages <= 1) { wrap.innerHTML = ''; return; }

    const start = (maLogPage - 1) * 10 + 1;
    const end   = Math.min(maLogPage * 10, maLogTotal);

    let btns = '';
    for (let i = 1; i <= maLogPages; i++) {
        btns += `<button class="ma-page-btn${i === maLogPage ? ' active' : ''}"
                         onclick="maLogGoTo(${i})">${i}</button>`;
    }

    wrap.innerHTML = `
        <span class="ma-page-info">Showing ${start}–${end} of ${maLogTotal}</span>
        <div style="display:flex;gap:4px;align-items:center;">
            <button class="ma-page-btn" onclick="maLogGoTo(${maLogPage - 1})"
                    ${maLogPage <= 1 ? 'disabled' : ''}>‹ Prev</button>
            ${btns}
            <button class="ma-page-btn" onclick="maLogGoTo(${maLogPage + 1})"
                    ${maLogPage >= maLogPages ? 'disabled' : ''}>Next ›</button>
        </div>`;
}

setInterval(maLogPoll, 4000);
maLogPoll();

// ── Render ─────────────────────────────────────────────────────────────────
function maInitials(name) {
    return name.trim().split(' ').slice(0,2).map(w => w[0]||'').join('').toUpperCase();
}

// ── Section switching ──────────────────────────────────────────────────────
function maShowSection(section) {
    const isAdmins  = section === 'admins';
    document.getElementById('ma-section-admins').style.display  = isAdmins ? '' : 'none';
    document.getElementById('ma-section-history').style.display = isAdmins ? 'none' : '';
    document.getElementById('nav-admins').classList.toggle('active', isAdmins);
    document.getElementById('nav-history').classList.toggle('active', !isAdmins);
    document.getElementById('module-title').textContent = isAdmins ? 'Manage Admins' : 'Action History';
    if (!isAdmins) maLogPoll();
}

function maRender() {
    const q     = (document.getElementById('ma-search').value || '').toLowerCase();
    const tbody = document.getElementById('ma-tbody');
    const list  = maAdmins.filter(a =>
        a.full_name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)
    );

    document.getElementById('ma-count').textContent = `(${maAdmins.length})`;

    if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="5"><div class="ma-empty">${q ? 'No results for "'+q+'".' : 'No admin accounts found.'}</div></td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(a => {
        const isMe     = a.id === meSelf;
        const isSuper  = a.role === 'super_admin';
        const isActive = a.status === 'active';
        const canAct   = !isMe;
        const isNew    = maPendingNew.has(a.id);

        return `
        <tr id="ma-row-${a.id}" class="${isNew ? 'ma-row-new' : ''}">
            <td>
                <div class="ma-name-cell">
                    <div class="ma-avatar${isMe ? ' you' : ''}">${maInitials(a.full_name)}</div>
                    <div>
                        <div class="ma-name-text">
                            ${a.full_name}
                            ${isMe ? '<span class="ma-you-tag">You</span>' : ''}
                        </div>
                        <div class="ma-email">${a.email}</div>
                    </div>
                </div>
            </td>
            <td>
                <span class="ma-badge ${isSuper ? 'ma-badge-super' : 'ma-badge-admin'}">
                    ${isSuper ? 'Super Admin' : 'Admin'}
                </span>
            </td>
            <td>
                <span class="ma-badge ${isActive ? 'ma-badge-active' : 'ma-badge-inactive'}">
                    ● ${isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td style="font-family:monospace;font-size:.82rem;color:#94a3b8">${a.created_at}</td>
            <td>
                <div class="ma-actions">
                    <button class="ma-btn ma-btn-edit" onclick="maStartEdit(${a.id})">
                        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Password
                    </button>
                    ${canAct ? `
                    <button class="ma-btn ${isActive ? 'ma-btn-deactivate' : 'ma-btn-reactivate'}"
                            onclick="${isActive ? 'maDeactivate' : 'maReactivate'}(${a.id})">
                        ${isActive ? '⏸ Deactivate' : '▶ Reactivate'}
                    </button>
                    <button class="ma-btn ma-btn-del" onclick="maStartDelete(${a.id})">
                        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6M14 11v6"/>
                        </svg>
                        Delete
                    </button>` : '<span class="ma-protected">Protected</span>'}
                </div>
            </td>
        </tr>
        ${maEditing === a.id ? `
        <tr class="ma-edit-row">
            <td colspan="5">
                <div class="ma-edit-inline">
                    <span class="ma-form-label">New password for <strong>${a.full_name}</strong>:</span>
                    <div class="ma-pw-wrap" style="position:relative">
                        <input type="password" id="ma-edit-pw-${a.id}" placeholder="New password (min 8 chars)"
                               onkeydown="if(event.key==='Enter')maSavePassword(${a.id})">
                        <button class="ma-pw-toggle" type="button"
                                onclick="maPwToggle('ma-edit-pw-${a.id}',this)" tabindex="-1">
                            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        </button>
                    </div>
                    <button class="btn btn-primary" style="padding:7px 14px;font-size:.82rem"
                            onclick="maSavePassword(${a.id})">Save</button>
                    <button class="action-btn action-btn-toggle" onclick="maCancelEdit()">Cancel</button>
                </div>
            </td>
        </tr>` : ''}
        `;
    }).join('');

    if (maPendingNew.size) {
        setTimeout(() => {
            maPendingNew.clear();
            document.querySelectorAll('.ma-row-new').forEach(r => r.classList.remove('ma-row-new'));
        }, 2000);
    }
}

// ── Create ─────────────────────────────────────────────────────────────────
async function maCreateAdmin() {
    const name     = document.getElementById('ma-name').value.trim();
    const email    = document.getElementById('ma-email').value.trim();
    const password = document.getElementById('ma-password').value;
    const confirm  = document.getElementById('ma-confirm').value;
    const role     = document.getElementById('ma-role').value;

    if (!name || !email || !password) return maToast('All fields are required.', 'err');
    if (!email.includes('@'))         return maToast('Enter a valid email address.', 'err');
    if (password.length < 8)          return maToast('Password must be at least 8 characters.', 'err');
    if (password !== confirm)         return maToast('Passwords do not match.', 'err');

    const res = await maPost({ action:'create_admin', name, email, password, role });
    if (!res.ok) return maToast(res.error || 'Failed to create admin.', 'err');

    maPendingNew.add(res.admin.id);
    maKnownIds.add(res.admin.id);
    maAdmins.push(res.admin);
    maClearForm();
    maRender();
    maToast(`Admin "${name}" created successfully.`);
    maLogPoll();
}

function maClearForm() {
    document.getElementById('ma-name').value     = '';
    document.getElementById('ma-email').value    = '';
    document.getElementById('ma-password').value = '';
    document.getElementById('ma-confirm').value  = '';
    document.getElementById('ma-role').value     = 'admin';
}

// ── Edit password ──────────────────────────────────────────────────────────
function maStartEdit(id) {
    maEditing = (maEditing === id) ? null : id;
    maRender();
    if (maEditing) setTimeout(() => document.getElementById(`ma-edit-pw-${id}`)?.focus(), 50);
}

function maCancelEdit() { maEditing = null; maRender(); }

async function maSavePassword(id) {
    const pw = document.getElementById(`ma-edit-pw-${id}`)?.value || '';
    if (pw.length < 8) return maToast('Password must be at least 8 characters.', 'err');
    const res = await maPost({ action:'update_admin_password', user_id:id, password:pw });
    if (!res.ok) return maToast(res.error || 'Failed to update password.', 'err');
    maEditing = null;
    maRender();
    maToast('Password updated successfully.');
    maLogPoll();
}

// ── Deactivate / Reactivate ────────────────────────────────────────────────
async function maDeactivate(id) {
    const a = maAdmins.find(x => x.id === id);
    if (!a) return;
    const res = await maPost({ action:'deactivate_admin', user_id:id });
    if (!res.ok) return maToast(res.error || 'Failed to deactivate.', 'err');
    a.status = 'inactive';
    maRender();
    maToast(`"${a.full_name}" deactivated.`);
    maLogPoll();
}

async function maReactivate(id) {
    const a = maAdmins.find(x => x.id === id);
    if (!a) return;
    const res = await maPost({ action:'reactivate_admin', user_id:id });
    if (!res.ok) return maToast(res.error || 'Failed to reactivate.', 'err');
    a.status = 'active';
    maRender();
    maToast(`"${a.full_name}" reactivated.`);
    maLogPoll();
}

// ── Delete ─────────────────────────────────────────────────────────────────
function maStartDelete(id) {
    const a = maAdmins.find(x => x.id === id);
    if (!a) return;
    maDelTarget = id;
    document.getElementById('ma-confirm-msg').textContent =
        `Delete "${a.full_name}" (${a.email})? This cannot be undone.`;
    document.getElementById('ma-overlay').removeAttribute('hidden');
    document.getElementById('ma-confirm-del-btn').onclick = maConfirmDelete;
}

async function maConfirmDelete() {
    if (!maDelTarget) return;
    const res = await maPost({ action:'delete_admin', user_id:maDelTarget });
    if (!res.ok) return maToast(res.error || 'Failed to delete admin.', 'err');
    const name  = maAdmins.find(a => a.id === maDelTarget)?.full_name;
    maAdmins    = maAdmins.filter(a => a.id !== maDelTarget);
    maKnownIds.delete(maDelTarget);
    maDelTarget = null;
    maCloseConfirm();
    maRender();
    maToast(`Admin "${name}" deleted.`);
    maLogPoll();
}

function maCloseConfirm() {
    maDelTarget = null;
    document.getElementById('ma-overlay').setAttribute('hidden', '');
}

// ── Helpers ────────────────────────────────────────────────────────────────
function maToggleForm() {
    maFormOpen = !maFormOpen;
    document.getElementById('ma-form-body').style.display = maFormOpen ? '' : 'none';
    document.getElementById('ma-toggle-btn').textContent  = maFormOpen ? 'Hide' : 'Show';
}

function maPwToggle(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const hidden = input.type === 'password';
    input.type   = hidden ? 'text' : 'password';
    btn.innerHTML = hidden
        ? `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
        : `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
}

async function maPost(payload) {
    try {
        const res = await fetch('manage-admins.php', {
            method: 'POST',
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
            body: new URLSearchParams(payload)
        });
        return await res.json();
    } catch(e) {
        return { ok:false, error:'Network error.' };
    }
}

function maToast(msg, type = 'ok') {
    const wrap = document.getElementById('ma-toast-wrap');
    const el   = document.createElement('div');
    el.className = `ma-toast ma-toast-${type}`;
    el.innerHTML = (type === 'ok'
        ? `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`
        : `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`)
        + msg;
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 3500);
}

// ── Sidebar ────────────────────────────────────────────────────────────────
const SIDEBAR_KEY = 'adminSidebarCollapsed';
const sidebar     = document.querySelector('.sidebar');
const toggleBtn   = document.querySelector('.sidebar-toggle');

sidebar.classList.toggle('collapsed', localStorage.getItem(SIDEBAR_KEY) === 'true');

toggleBtn.addEventListener('click', () => {
    const isNowCollapsed = sidebar.classList.toggle('collapsed');
    localStorage.setItem(SIDEBAR_KEY, String(isNowCollapsed));
    updateTooltips();
});

function updateTooltips() {
    const collapsed = sidebar.classList.contains('collapsed');
    document.querySelectorAll('.tooltip-enabled').forEach(el => {
        el.setAttribute('data-tooltip-enabled', String(collapsed));
    });
}
updateTooltips();

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { maCloseConfirm(); maCancelEdit(); }
});

document.getElementById('ma-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) maCloseConfirm();
});

maRender();
</script>
</body>
</html>
<?php
function maEyeIcon(): string {
    return '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>';
}