<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

function ensure_session_started(): void
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }
}

function is_logged_in(): bool
{
    ensure_session_started();
    return isset($_SESSION['user_id'], $_SESSION['user_role']);
}

function require_login(string $redirectTo = 'login.php'): void
{
    if (!is_logged_in()) {
        header('Location: ' . $redirectTo);
        exit;
    }
}

function current_user(PDO $pdo): ?array
{
    ensure_session_started();
    if (!isset($_SESSION['user_id'])) {
        return null;
    }

    static $cache = null;
    if ($cache !== null) {
        return $cache;
    }

    $stmt = $pdo->prepare('SELECT id, role, email, full_name, status FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$_SESSION['user_id']]);
    $cache = $stmt->fetch(PDO::FETCH_ASSOC) ?: null;

    return $cache;
}

function redirect(string $location): void
{
    header('Location: ' . $location);
    exit;
}

function logout_user(): void
{
    ensure_session_started();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }
    session_destroy();
}
