<?php
require_once __DIR__ . '/config/database.php';

$pdo = get_pdo();

echo "<h2>Admin Login Debug</h2>";

// Check if admin user exists
$stmt = $pdo->prepare('SELECT id, email, password_hash, role, status FROM users WHERE email = ? LIMIT 1');
$stmt->execute(['admin@dihs.edu.ph']);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    echo "<p><strong>✓ Admin user found in database</strong></p>";
    echo "<pre>";
    echo "ID: " . $user['id'] . "\n";
    echo "Email: " . $user['email'] . "\n";
    echo "Role: " . $user['role'] . "\n";
    echo "Status: " . $user['status'] . "\n";
    echo "Password Hash: " . substr($user['password_hash'], 0, 20) . "...\n";
    echo "</pre>";
    
    // Test current password
    $password = 'admin123';
    if (password_verify($password, $user['password_hash'])) {
        echo "<p style='color: green; font-size: 18px;'><strong>✓ PASSWORD WORKS! Login should succeed.</strong></p>";
    } else {
        echo "<p style='color: red; font-size: 18px;'><strong>✗ PASSWORD FAILED! Hash doesn't match 'admin123'</strong></p>";
        
        // Generate new hash and provide SQL
        $newHash = password_hash($password, PASSWORD_DEFAULT);
        echo "<h3>Fix - Run this SQL in phpMyAdmin:</h3>";
        echo "<textarea style='width: 100%; height: 80px; font-family: monospace;'>";
        echo "UPDATE users SET password_hash = '$newHash' WHERE email = 'admin@dihs.edu.ph';";
        echo "</textarea>";
        echo "<p><strong>Then try logging in again with:</strong></p>";
        echo "<p>Email: admin@dihs.edu.ph<br>Password: admin123</p>";
    }
} else {
    echo "<p style='color: red; font-size: 18px;'><strong>✗ Admin user NOT found!</strong></p>";
    
    // Show all admin users
    $adminUsers = $pdo->prepare('SELECT id, email, role, status FROM users WHERE role = ?');
    $adminUsers->execute(['admin']);
    $admins = $adminUsers->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<h3>All admin users:</h3>";
    if ($admins) {
        echo "<pre>";
        foreach ($admins as $admin) {
            echo "ID: {$admin['id']}, Email: {$admin['email']}, Status: {$admin['status']}\n";
        }
        echo "</pre>";
    } else {
        echo "<p>No admin users found!</p>";
    }
}
?>
