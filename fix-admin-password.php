<?php
require_once __DIR__ . '/config/database.php';

$pdo = get_pdo();

// Generate fresh hash for admin123
$password = 'admin123';
$newHash = password_hash($password, PASSWORD_DEFAULT);

echo "<h2>Fixing Admin Password</h2>";

// Update the password directly
$stmt = $pdo->prepare('UPDATE users SET password_hash = ? WHERE email = ?');
$result = $stmt->execute([$newHash, 'admin@dihs.edu.ph']);

if ($result) {
    echo "<p style='color: green; font-size: 18px;'><strong>✓ Admin password updated successfully!</strong></p>";
    echo "<p><strong>New credentials:</strong></p>";
    echo "<p>Email: admin@dihs.edu.ph<br>Password: admin123</p>";
    
    // Test the new password
    $testStmt = $pdo->prepare('SELECT password_hash FROM users WHERE email = ? LIMIT 1');
    $testStmt->execute(['admin@dihs.edu.ph']);
    $user = $testStmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user && password_verify($password, $user['password_hash'])) {
        echo "<p style='color: blue;'><strong>✓ Password verification test PASSED!</strong></p>";
        echo "<p><a href='login.php' style='font-size: 16px; color: #4caf50;'>→ Go to Login Page</a></p>";
    } else {
        echo "<p style='color: red;'><strong>✗ Password verification test FAILED!</strong></p>";
    }
} else {
    echo "<p style='color: red; font-size: 18px;'><strong>✗ Failed to update password!</strong></p>";
    echo "<p>Error: " . print_r($stmt->errorInfo(), true) . "</p>";
}

echo "<hr>";
echo "<h3>Generated Hash:</h3>";
echo "<code style='background: #f0f0f0; padding: 10px; display: block;'>$newHash</code>";
?>
