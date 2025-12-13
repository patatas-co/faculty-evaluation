<?php
declare(strict_types=1);

session_start();

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/auth.php';

if (is_logged_in()) {
    redirect('student-dashboard.php');
}

$pdo = get_pdo();
$errors = [];
$formData = [];
$successMessage = '';

if (!empty($_SESSION['flash_success'])) {
    $successMessage = (string)$_SESSION['flash_success'];
    unset($_SESSION['flash_success']);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = strtolower(trim((string)($_POST['email'] ?? '')));
    $password = (string)($_POST['password'] ?? '');
    $formData['email'] = $email;

    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Please enter a valid email address.';
    }

    if ($password === '') {
        $errors[] = 'Please enter your password.';
    }

    if (!$errors) {
        $stmt = $pdo->prepare('SELECT id, role, password_hash, status FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user || !password_verify($password, $user['password_hash'])) {
            $errors[] = 'Invalid email or password.';
        } elseif ($user['status'] !== 'active') {
            $errors[] = 'Your account is not active. Please contact the administrator.';
        } else {
            $_SESSION['user_id'] = (int)$user['id'];
            $_SESSION['user_role'] = $user['role'];

            $updateStmt = $pdo->prepare('UPDATE users SET last_login_at = NOW() WHERE id = ?');
            $updateStmt->execute([$user['id']]);

            redirect('student-dashboard.php');
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href="favicon/favicon.ico" type="image/x-icon">
    <link rel="icon" href="favicon/favicon-16x16.png" sizes="16x16" type="image/png">
    <link rel="icon" href="favicon/favicon-32x32.png" sizes="32x32" type="image/png">
    <link rel="apple-touch-icon" href="favicon/apple-touch-icon.png" sizes="180x180">
    <link rel="icon" href="favicon/android-chrome-192x192.png" sizes="192x192" type="image/png">
    <link rel="icon" href="favicon/android-chrome-512x512.png" sizes="512x512" type="image/png">
    <link rel="manifest" href="favicon/site.webmanifest">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <title>Dasmarinas Interated High School Faculty Evaluation</title>
    <style>
        :root {
            --primary-100: #e8f5e8;
            --primary-500: #4caf50;
            --primary-600: #388e3c;
            --accent-500: #ffeb3b;
            --neutral-50: #ffffff;
            --neutral-100: #f9fbff;
            --neutral-200: #e9eef6;
            --neutral-500: #5c6675;
            --neutral-900: #111826;
            --shadow: 0 18px 45px rgba(56, 142, 60, 0.15);
            --radius-lg: 32px;
            --radius-md: 20px;
            --radius-sm: 12px;
            --max-width: 1180px;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            font-family: 'Poppins', sans-serif;
            color: var(--neutral-900);
            background: var(--neutral-50);
        }

        a {
            color: inherit;
        }

        .page-wrapper {
            width: min(92%, var(--max-width));
            margin: 0 auto;
        }

        header {
            position: sticky;
            top: 0;
            background-color: rgba(255, 255, 255, 0.92);
            backdrop-filter: blur(12px);
            z-index: 10;
            border-bottom: 1px solid rgba(56, 142, 60, 0.08);
        }

        .top-bar {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 18px 0;
        }

        .brand {
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 700;
            color: var(--primary-600);
            letter-spacing: 0.4px;
            text-decoration: none;
        }

        .brand img {
            width: 52px;
            height: 52px;
        }

        .nav {
            display: flex;
            align-items: center;
            gap: 24px;
        }

        .nav-list {
            list-style: none;
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            gap: 26px;
        }

        .nav-list a {
            text-decoration: none;
            color: var(--neutral-900);
            font-weight: 500;
            font-size: 0.95rem;
            transition: color 0.2s ease, transform 0.2s ease;
        }

        .nav-list a:hover,
        .nav-list a:focus {
            color: var(--primary-600);
            transform: translateY(-2px);
        }

        .login-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 10px 20px;
            border-radius: 999px;
            background: rgba(76, 175, 80, 0.1);
            color: var(--primary-600);
            font-weight: 600;
            text-decoration: none;
            border: 1px solid transparent;
            transition: background 0.2s ease, color 0.2s ease, border 0.2s ease;
        }

        .login-btn:hover,
        .login-btn:focus {
            background: rgba(76, 175, 80, 0.16);
            border-color: rgba(76, 175, 80, 0.36);
        }

        .nav-toggle {
            display: none;
            flex-direction: column;
            gap: 6px;
            background: transparent;
            border: none;
            padding: 8px;
            cursor: pointer;
        }

        .nav-toggle span {
            width: 24px;
            height: 2px;
            background-color: var(--neutral-900);
            transition: transform 0.3s ease, opacity 0.3s ease;
        }

        .nav-toggle:focus-visible {
            outline: 2px solid var(--primary-500);
            outline-offset: 4px;
        }

        .auth-page {
            position: relative;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            background:
                radial-gradient(140% 140% at 0% 0%, rgba(76, 175, 80, 0.12), transparent 55%),
                radial-gradient(110% 110% at 100% 0%, rgba(255, 235, 59, 0.14), transparent 55%),
                linear-gradient(170deg, rgba(233, 238, 246, 0.7), #ffffff 40%, rgba(232, 245, 232, 0.85));
        }

        .auth-main {
            flex: 1;
            display: flex;
            align-items: center;
            padding: 96px 0 72px;
        }

        .auth-wrapper {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 56px;
            align-items: center;
        }

        .eyebrow {
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 2.5px;
            color: var(--accent-500);
            margin: 0;
        }

        .auth-hero {
            display: grid;
            gap: 20px;
            color: var(--neutral-900);
        }

        .auth-hero h1 {
            font-size: clamp(2.2rem, 3.4vw, 3.2rem);
            line-height: 1.22;
            margin: 0;
        }

        .auth-hero h1 span {
            color: var(--primary-600);
        }

        .muted-text {
            color: var(--neutral-500);
            line-height: 1.6;
            font-size: 1.05rem;
            margin: 0;
            max-width: 520px;
        }

        .auth-checklist {
            list-style: none;
            margin: 12px 0 0;
            padding: 0;
            display: grid;
            gap: 12px;
            color: var(--neutral-500);
        }

        .auth-checklist li {
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 500;
            line-height: 1.45;
        }

        .auth-checklist li::before {
            content: "";
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
            box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.12);
            flex-shrink: 0;
        }

        .auth-card {
            background: rgba(255, 255, 255, 0.92);
            border-radius: var(--radius-lg);
            padding: 42px;
            box-shadow: 0 24px 64px rgba(17, 24, 38, 0.14);
            border: 1px solid rgba(76, 175, 80, 0.12);
            display: grid;
            gap: 24px;
            position: relative;
            overflow: hidden;
        }

        .auth-card::after {
            content: "";
            position: absolute;
            inset: -20% 50% auto -20%;
            height: 340px;
            background: radial-gradient(circle at top, rgba(255, 235, 59, 0.18), transparent 70%);
            opacity: 0.6;
            pointer-events: none;
        }

        .auth-card h2 {
            margin: 0;
            font-size: 1.5rem;
            color: var(--neutral-900);
            position: relative;
            z-index: 1;
        }

        .auth-form {
            display: grid;
            gap: 18px;
            position: relative;
            z-index: 1;
        }

        .form-field {
            display: grid;
            gap: 10px;
        }

        .form-field label {
            font-weight: 600;
            color: var(--neutral-900);
            font-size: 0.98rem;
        }

        .form-field input,
        .form-field select,
        .form-field textarea {
            width: 100%;
            padding: 0.85rem 1rem;
            border-radius: var(--radius-sm);
            border: 1px solid rgba(17, 24, 38, 0.12);
            background: var(--neutral-50);
            font: inherit;
            color: var(--neutral-900);
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .form-field input:focus,
        .form-field select:focus,
        .form-field textarea:focus {
            outline: none;
            border-color: var(--primary-500);
            box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.16);
        }

        .form-field select {
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 0.85rem center;
            background-size: 1.05rem;
            padding-right: 2.8rem;
        }

        .input-hint {
            font-size: 0.82rem;
            color: var(--neutral-500);
            margin: -6px 0 0;
        }

        .primary-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
            color: var(--neutral-50);
            padding: 0.9rem 1.5rem;
            border-radius: var(--radius-sm);
            border: none;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            box-shadow: var(--shadow);
            text-decoration: none;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .primary-btn:hover,
        .primary-btn:focus {
            transform: translateY(-1px);
            box-shadow: 0 26px 65px rgba(56, 142, 60, 0.19);
        }

        .auth-actions {
            display: grid;
            gap: 12px;
            text-align: center;
            position: relative;
            z-index: 1;
        }

        .auth-link {
            color: var(--primary-600);
            font-weight: 600;
            text-decoration: none;
            transition: opacity 0.2s ease;
        }

        .auth-link:hover,
        .auth-link:focus {
            opacity: 0.75;
        }

        .auth-meta {
            color: var(--neutral-500);
            font-size: 0.92rem;
            margin: 0;
        }

        .form-feedback {
            padding: 1rem 1.25rem;
            border-radius: var(--radius-sm);
            border: 1px solid transparent;
            font-weight: 600;
            text-align: left;
            position: relative;
            z-index: 1;
        }

        .form-feedback ul {
            list-style: none;
            padding: 0;
            margin: 0;
            display: grid;
            gap: 8px;
        }

        .form-feedback--error {
            background: rgba(239, 68, 68, 0.08);
            border-color: rgba(239, 68, 68, 0.35);
            color: #b91c1c;
        }

        .form-feedback--success {
            background: rgba(34, 197, 94, 0.09);
            border-color: rgba(34, 197, 94, 0.32);
            color: #166534;
        }

        .auth-select-inline {
            display: grid;
            gap: 18px;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        }

        footer {
            padding: 36px 0 48px;
            text-align: center;
            color: var(--neutral-500);
            font-size: 0.9rem;
        }

        footer a {
            color: var(--primary-600);
            font-weight: 500;
            text-decoration: none;
        }

        footer a:hover,
        footer a:focus {
            opacity: 0.8;
        }

        .footer-links {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 16px;
            flex-wrap: wrap;
        }

        body.modal-open {
            overflow: hidden;
        }

        .modal {
            position: fixed;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 32px 20px;
            background: rgba(17, 24, 38, 0.65);
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
            transition: opacity 0.25s ease, visibility 0.25s ease;
            z-index: 50;
        }

        .modal.is-open {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
        }

        .modal__dialog {
            position: relative;
            background: var(--neutral-50);
            border-radius: var(--radius-lg);
            width: min(640px, 100%);
            padding: 40px;
            box-shadow: var(--shadow);
            color: var(--neutral-900);
            max-height: calc(100vh - 120px);
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: rgba(0, 0, 0, 0.15) rgba(0, 0, 0, 0.05);
        }

        .modal__dialog::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }

        .modal__dialog::-webkit-scrollbar-track {
            background: transparent;
            border-radius: 3px;
            margin: 8px 0;
        }

        .modal__dialog::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.15);
            border-radius: 3px;
            transition: background 0.2s ease;
            min-height: 20px;
        }

        .modal__dialog::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 0, 0, 0.25);
        }

        .modal__dialog h2 {
            margin: 0 0 18px;
            font-size: 1.6rem;
        }

        .modal__content h3 {
            margin: 24px 0 12px;
            font-size: 1.1rem;
            color: var(--neutral-900);
            font-weight: 600;
        }

        .modal__content h3:first-of-type {
            margin-top: 8px;
        }

        .modal__content ul {
            margin: 0;
            padding-left: 20px;
            display: grid;
            gap: 10px;
        }

        .modal__content li strong {
            color: var(--neutral-900);
        }

        .modal__close {
            position: absolute;
            top: 18px;
            right: 18px;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: rgba(233, 238, 246, 0.6);
            border: none;
            color: var(--neutral-500);
            font-size: 1.5rem;
            line-height: 1;
            cursor: pointer;
            display: grid;
            place-items: center;
            transition: background 0.2s ease, color 0.2s ease;
        }

        .modal__close:hover,
        .modal__close:focus {
            background: rgba(56, 142, 60, 0.1);
            color: var(--primary-600);
        }

        .modal__content {
            margin-top: 1rem;
        }

        .modal p {
            margin-bottom: 1rem;
            line-height: 1.6;
        }

        .modal ul,
        .modal ol {
            margin: 1rem 0 1rem 1.5rem;
            padding: 0;
        }

        .modal li {
            margin-bottom: 0.5rem;
            line-height: 1.5;
        }

        .modal strong {
            color: var(--neutral-900);
        }

        @media (max-width: 1024px) {
            .auth-main {
                padding: 88px 0 64px;
            }

            .auth-wrapper {
                gap: 44px;
            }
        }

        @media (max-width: 900px) {
            .nav-toggle {
                display: flex;
            }

            .nav {
                position: absolute;
                top: calc(100% + 16px);
                right: 0;
                left: 0;
                padding: 0;
                background: transparent;
                flex-direction: column;
                align-items: stretch;
                gap: 0;
                opacity: 0;
                pointer-events: none;
                transform: translateY(-8px);
                transition: opacity 0.2s ease, transform 0.2s ease;
            }

            .nav::before {
                content: "";
                position: absolute;
                inset: 0;
                background: var(--neutral-50);
                border-radius: var(--radius-sm);
                box-shadow: var(--shadow);
                z-index: -1;
            }

            .nav-list {
                flex-direction: column;
                gap: 18px;
                padding: 24px;
            }

            .nav .login-btn {
                margin: 0 24px 24px;
            }

            .nav.is-open {
                opacity: 1;
                pointer-events: auto;
                transform: translateY(0);
            }
        }

        @media (max-width: 780px) {
            .auth-wrapper {
                grid-template-columns: 1fr;
            }

            .auth-hero {
                text-align: center;
            }

            .muted-text {
                margin: 0 auto;
            }

            .auth-checklist li {
                justify-content: center;
            }
        }

        @media (max-width: 560px) {
            .auth-card {
                padding: 32px 28px;
            }

            .auth-main {
                padding: 72px 0 48px;
            }

            .nav::before {
                border-radius: var(--radius-sm);
            }

            .nav-list {
                padding: 20px;
            }
        }
    </style>
</head>
<body class="auth-page">
    <header>
        <div class="page-wrapper top-bar">
            <a class="brand" href="landing-page.php">
                <img src="favicon/android-chrome-192x192.png" alt="Faculty Evaluation" />
                Faculty Evaluation
            </a>
        </div>
    </header>

    <main class="auth-main">
        <div class="page-wrapper auth-wrapper">
            <section class="auth-hero" aria-labelledby="login-heading">
                <p class="eyebrow">Secure Faculty Evaluation Access</p>
                <h1 id="login-heading">Faculty Evaluation<span> Login</span></h1>
                <p class="muted-text">Access evaluation schedules, submit feedback, and monitor faculty performance insights through your secure dashboard.</p>
                <ul class="auth-checklist">
                    <li>Streamlined evaluation workflows for every class</li>
                    <li>Anonymous feedback preserved at every step</li>
                    <li>Real-time updates guided by institutional policy</li>
                </ul>
            </section>

            <section class="auth-card" aria-label="Login form">
                <h2>Welcome back</h2>

                <?php if (!empty($errors)): ?>
                    <div class="form-feedback form-feedback--error" role="alert">
                        <ul>
                            <?php foreach ($errors as $message): ?>
                                <li><?= htmlspecialchars($message, ENT_QUOTES) ?></li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                <?php elseif ($successMessage !== ''): ?>
                    <div class="form-feedback form-feedback--success" role="status">
                        <?= htmlspecialchars($successMessage, ENT_QUOTES) ?>
                    </div>
                <?php endif; ?>

                <form class="auth-form" action="<?= htmlspecialchars($_SERVER['PHP_SELF'], ENT_QUOTES) ?>" method="post" novalidate>
                    <div class="form-field">
                        <label for="email">Institutional Email</label>
                        <input id="email" name="email" type="email" placeholder="name@dihs.edu.ph" value="<?= htmlspecialchars($formData['email'] ?? '', ENT_QUOTES) ?>" required />
                    </div>

                    <div class="form-field">
                        <label for="password">Password</label>
                        <input id="password" name="password" type="password" placeholder="Enter your password" required />
                    </div>

                    <button type="submit" class="primary-btn">Log In</button>
                </form>

                <div class="auth-actions">
                    <a class="auth-link" href="#">Forgot your password?</a>
                    <p class="auth-meta">Don't have an account? <a class="auth-link" href="registration.php">Create one</a></p>
                </div>
            </section>
        </div>
    </main>

    <footer>
        <div class="page-wrapper">
            <p>&copy; <span id="year"></span> Development of Web-based Faculty Evaluation for Dasmarinas Integrated High School. All rights reserved.</p>
            <div class="footer-links">
                <a href="#privacy" data-modal-target="privacy-modal">Privacy Policy</a>
                <a href="#terms" data-modal-target="terms-modal">Terms of Service</a>
                <a href="#cookies">Cookie Policy</a>
            </div>
        </div>
    </footer>

    <script src="app.js"></script>

    <div class="modal" id="privacy-modal" role="dialog" aria-modal="true" aria-labelledby="privacy-modal-title" aria-hidden="true">
        <div class="modal__dialog" role="document">
            <button type="button" class="modal__close" data-modal-close aria-label="Close privacy policy dialog">&times;</button>
            <h2 id="privacy-modal-title">Privacy Policy</h2>
            <div class="modal__content">
                <p>Welcome to the Intelligent Web-Based Faculty Evaluation and Feedback System of Kolehiyo ng Lungsod ng Dasmariñas. This Privacy Policy explains how your information is collected, used, and protected when you access and use this system. By continuing to use the system, you agree to the terms outlined below.</p>
<br></br>
                <h3>1. Information We Collect</h3>
                <p>We only collect the minimum information necessary to verify your identity and allow you to access the system. This includes:</p>
                <p><strong>Student Information:</strong></p>
                <ul>
                    <li>Student ID number</li>
                    <li>Name (for verification only)</li>
                    <li>Course, year level, and enrolled subjects</li>
                    <li>Securely hashed login credentials</li>
                </ul>
                <p><strong>Faculty Information:</strong></p>
                <ul>
                    <li>Faculty ID number</li>
                    <li>Assigned courses and departments</li>
                    <li>Securely hashed login credentials</li>
                </ul>
                <p><strong>System-Generated Data:</strong></p>
                <ul>
                    <li>Evaluation responses (ratings and comments)</li>
                    <li>Sentiment analysis results</li>
                    <li>Login timestamps, submission timestamps, and basic system logs</li>
                </ul>
<br></br>
                <p><em>Important: Your identity is not attached to your evaluation. All evaluations are stored anonymously.</em></p>
<br></br>
                <h3>2. How We Use Your Data</h3>
                <p>Your information is used solely to:</p>
                <ul>
                    <li>Verify eligibility for submitting faculty evaluations</li>
                    <li>Generate anonymous evaluation reports</li>
                    <li>Run machine learning–based sentiment analysis on comments</li>
                    <li>Support faculty performance improvement and institutional decision-making</li>
                    <li>Provide secure access and maintain system functionality</li>
                </ul>
                <p>We do not use your data for advertising, selling, or sharing with external parties.</p>
<br></br>
                <h3>3. Anonymity of Evaluation Responses</h3>
                <p>To ensure privacy and fairness:</p>
                <ul>
                    <li>Your identity is detached once you begin the evaluation</li>
                    <li>No identifiable information is stored together with your submitted responses</li>
                    <li>Faculty will only see anonymous summaries, not individual submissions</li>
                    <li>Administrators cannot trace any evaluation back to a specific student</li>
                </ul>
                <p>This process follows ethical standards for academic evaluations.</p>
<br></br>
                <h3>4. Data Protection and Security</h3>
                <p>The system uses multiple security measures, including:</p>
                <ul>
                    <li>Encrypted passwords (bcrypt/Argon2)</li>
                    <li>Enforced HTTPS / SSL communication</li>
                    <li>Secure, access-restricted database</li>
                    <li>Role-based access controls (student, faculty, admin)</li>
                    <li>Daily backups and audit logs</li>
                    <li>Anonymized storage of evaluation responses</li>
                    <li>Server firewalls and security patches</li>
                </ul>
                <p>Only authorized administrators can access aggregate evaluation data.</p>
<br></br>
                <h3>5. Data Sharing</h3>
                <p>We do not share your personal information with:</p>
                <ul>
                    <li>Students</li>
                    <li>Faculty members (except anonymized summaries)</li>
                    <li>External companies</li>
                    <li>Third-party organizations</li>
                </ul>
                <p>Data is only disclosed if required by law or authorized by the institution.</p>
<br></br>
                <h3>6. Data Retention</h3>
                <ul>
                    <li>User account information is retained while your account remains active.</li>
                    <li>Evaluation data is stored long-term but only in anonymous form.</li>
                    <li>Raw comments may be archived based on institutional data retention policies.</li>
                </ul>
<br></br>
                <h3>7. Your Rights</h3>
                <p>You have the right to:</p>
                <ul>
                    <li>Access and update your account information</li>
                    <li>Request correction of inaccurate personal data</li>
                    <li>Contact the administrator for system-related concerns</li>
                    <li>Request deletion of your account (subject to institutional guidelines)</li>
                </ul>
                <p>Because evaluation responses are anonymous, they cannot be traced or deleted individually.</p>
<br></br>
                <h3>8. Cookies</h3>
                <p>The system uses essential session cookies to maintain secure login and improve functionality. We do not use tracking, marketing, or advertising cookies.</p>
<br></br>
                <h3>9. Changes to This Policy</h3>
                <p>This Privacy Policy may be updated periodically. Any updates will be posted on this page with a revised "Last Updated" date.</p>
<br></br>
                <h3>10. Contact Us</h3>
                <p>For questions or concerns about this Privacy Policy, please contact:</p>
                <p>Office of the System Administrator<br>
                Kolehiyo ng Lungsod ng Dasmariñas<br>
                Email: <a href="mailto:privacy@dihs.edu.ph">privacy@dihs.edu.ph</a><br>
                Phone: [Insert contact number]</p>
            </div>
        </div>
    </div>

    <div class="modal" id="terms-modal" role="dialog" aria-modal="true" aria-labelledby="terms-modal-title" aria-hidden="true">
        <div class="modal__dialog" role="document">
            <button type="button" class="modal__close" data-modal-close aria-label="Close terms of service dialog">&times;</button>
            <h2 id="terms-modal-title">Terms of Service</h2>
            <div class="modal__content">
                <p>By accessing and using the Faculty Evaluation System, you agree to comply with and be bound by the following terms and conditions.</p>
                
                <h3>1. Acceptance of Terms</h3>
                <p>Your use of this system constitutes acceptance of these terms. If you do not agree, please discontinue use immediately.</p>
                
                <h3>2. User Responsibilities</h3>
                <ul>
                    <li><strong>Accurate Information:</strong> You agree to provide truthful and accurate information in all evaluations and submissions.</li>
                    <li><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your login credentials.</li>
                    <li><strong>Appropriate Use:</strong> The system must be used only for its intended educational and evaluation purposes.</li>
                </ul>
                
                <h3>3. Prohibited Activities</h3>
                <p>Users may not attempt to manipulate evaluation results, submit false information, access unauthorized areas of the system, or interfere with system operations.</p>
                
                <h3>4. Data Usage</h3>
                <p>Evaluation data may be used for institutional improvement, academic reporting, and compliance purposes as outlined in our Privacy Policy.</p>
                
                <h3>5. System Availability</h3>
                <p>While we strive for continuous availability, the system may be temporarily unavailable for maintenance or updates without prior notice.</p>
                
                <h3>6. Modifications</h3>
                <p>These terms may be updated periodically. Continued use of the system after changes constitutes acceptance of the revised terms.</p>
                
                <p>For questions about these terms, contact us at <a href="mailto:support@dihs.edu.ph">support@dihs.edu.ph</a>.</p>
            </div>
        </div>
    </div>
</body>
</html>
