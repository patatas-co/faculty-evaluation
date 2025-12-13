<?php

declare(strict_types=1);

session_start();

require_once __DIR__ . '/includes/auth.php';

logout_user();

header('Location: login.php');
exit;
