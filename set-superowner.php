<?php
require_once __DIR__ . '/config/database.php';
$pdo = get_pdo();

$email    = 'superowner@dihs.edu.ph';
$password = 'superowner';
$hash     = password_hash($password, PASSWORD_DEFAULT);

// Check if account exists — update or insert
$check = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
$check->execute([$email]);
$existing = $check->fetch();

if ($existing) {
    $pdo->prepare('UPDATE users SET password_hash = ?, role = ?, status = ? WHERE email = ?')
        ->execute([$hash, 'super_admin', 'active', $email]);
    echo "Updated existing account.";
} else {
    $pdo->prepare("INSERT INTO users (full_name, email, password_hash, role, status) VALUES (?,?,?,?,?)")
        ->execute(['Super Owner', $email, $hash, 'super_admin', 'active']);
    echo "Created new account.";
}

echo "<br>Email: $email";
echo "<br>Password: $password";
echo "<br>Role: super_admin";
echo "<br><br><a href='login.php'>→ Go to Login</a>";
?>