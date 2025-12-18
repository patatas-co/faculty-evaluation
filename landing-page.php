<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" href="favicon/favicon.ico" type="image/x-icon">
    <link rel="icon" href="favicon/favicon-16x16.png" sizes="16x16" type="image/png">
    <link rel="icon" href="favicon/favicon-32x32.png" sizes="32x32" type="image/png">
    <link rel="apple-touch-icon" href="favicon/apple-touch-icon.png" sizes="180x180">
    <link rel="icon" href="favicon/android-chrome-192x192.png" sizes="192x192" type="image/png">
    <link rel="icon" href="favicon/android-chrome-512x512.png" sizes="512x512" type="image/png">
    <link rel="manifest" href="favicon/site.webmanifest">
    <title>Dasmarinas Interated High School Faculty Evaluation</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="styles.css" />
</head>
<body>
    <header>
        <div class="page-wrapper top-bar">
            <a class="brand" href="#hero">
                <img src="favicon/android-chrome-192x192.png" alt="Faculty Evaluation" />
                Faculty Evaluation
            </a>
            <button class="nav-toggle" type="button" aria-label="Toggle navigation" aria-expanded="false">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <nav aria-label="Primary" class="nav">
                <ul class="nav-list">
                    <li><a href="#overview">Home</a></li>
                    <li><a href="#features">Features</a></li>
                    <li><a href="#vision-mission">About</a></li>
                </ul>
                <a class="login-btn" href="login.php">Login</a>
            </nav>
        </div>
    </header>

    <main>
        <section id="hero" class="page-wrapper hero">
            <div class="hero-copy">
                <p class="eyebrow">Evaluate in Modern Way With</p>
                <h1>
                    Dasmariñas Integrated High School<span> Faculty Evaluation</span>
                </h1>
                <p>
                    Where student feedback meets intelligent evaluation. A modern system designed to turn every response into meaningful, actionable insights.
                </p>
                <div class="button-group">
                    <a class="primary-btn" href="registration.php">Get Started</a>
                </div>
            </div>
            <aside class="hero-card institutional-card" aria-label="Institutional representation statement">
                <div class="institutional-card__seal" aria-hidden="true">
                    <img src="favicon/android-chrome-192x192.png" alt="Dasmariñas Integrated High School seal watermark" />
                </div>
                <h3>Institutional Representation</h3>
                <p>
                    This system is developed exclusively for Dasmariñas Integrated High School to support a modern, data-driven faculty evaluation process. It transforms student feedback into actionable insights that promote continuous teaching improvement and institutional excellence.
                </p>
            </aside>
        </section>

        <section id="overview" class="page-wrapper achievements">
            <div class="achievements-wrapper">
                <figure class="achievements-visual" aria-labelledby="overview-title">
                    <div class="achievements-visual__shape achievements-visual__shape--primary" aria-hidden="true"></div>
                    <div class="achievements-visual__shape achievements-visual__shape--secondary" aria-hidden="true"></div>
                    <img src="assets/Students-classroom.jpg" alt="Administrator celebrating a milestone" />
                </figure>
                <div class="achievements-copy">
                    <p class="achievements-eyebrow">Student and Faculty Problem Faces</p>
                    <h2 id="overview-title">Transforming Faculty Evaluation Challenges into Opportunities</h2>
                    <p class="muted-text">
                        Faculty evaluations should drive improvement, not create bottlenecks. Yet many institutions still rely on outdated processes that delay feedback, fragment data, and provide limited actionable insights—ultimately hindering both faculty development and institutional excellence.
                    </p>
                    <div class="problem-indicator__grid" role="list">
                        <article class="problem-card" role="listitem">
                            <span class="problem-card__badge">01</span>
                            <p>Manual Processing</p>
                        </article>
                        <article class="problem-card" role="listitem">
                            <span class="problem-card__badge">02</span>
                            <p>Delayed Feedback</p>
                        </article>
                        <article class="problem-card" role="listitem">
                            <span class="problem-card__badge">03</span>
                            <p>Scattered Data</p>
                        </article>
                        <article class="problem-card" role="listitem">
                            <span class="problem-card__badge">04</span>
                            <p>Limited Insight</p>
                        </article>
                    </div>
                </div>
            </div>
        </section>

        <section id="features" class="page-wrapper features">
            <div class="section-heading">
                <h2>What We Offer</h2>
                <p>Supporting institutional decision-making through standardized evaluation and actionable feedback.</p>
            </div>
            <div class="features-grid">
                <article class="feature-card">
                    <div class="feature-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 2H8a2 2 0 0 0-2 2v16l6-3 6 3V4a2 2 0 0 0-2-2Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M9 9h6M9 13h3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <h3>Faculty Evaluation</h3>
                    <p>A standardized, web-based evaluation process that allows students to provide clear, anonymous, and consistent feedback aligned with institutional criteria.</p>
                </article>
                <article class="feature-card">
                    <div class="feature-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 11a8 8 0 1 1-8-8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M21 11a8 8 0 0 1-8 8 7.94 7.94 0 0 1-3.54-.83L3 21l2.83-5.65A8 8 0 0 1 13 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M12 8h.01M16 11h.01M8 11h.01M12 14h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <h3>Feedback Insight</h3>
                    <p>Machine learning analyzes student responses to identify recurring themes and generates concise summaries that highlight key strengths and areas for improvement.</p>
                </article>
                <article class="feature-card">
                    <div class="feature-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3a7 7 0 0 0-4 12.75V18a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.25A7 7 0 0 0 12 3Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M9 21h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M12 7v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <h3>Teaching Improvement</h3>
                    <p>The system translates summarized feedback into practical teaching recommendations, supporting continuous faculty development and informed administrative decisions.</p>
                </article>
                <article class="feature-card">
                    <div class="feature-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2 3 6v6c0 5.25 3.5 10.25 9 11 5.5-.75 9-5.75 9-11V6Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M10.5 11.5 12 13l3-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <h3>Secure Access</h3>
                    <p>Controlled access ensures that students, faculty members, and administrators interact with the system according to defined institutional roles.</p>
                </article>
            </div>
        </section>

        <section id="vision-mission" class="page-wrapper vision-mission">
            <div class="section-heading">
            <div class="vision-mission__grid">
                <article class="pillar-card pillar-card--vision">
                    <span class="pillar-card__label">Vision</span>
                    <h3>Cultivate insight-driven teaching excellence.</h3>
                    <p>We envision educational institutions where faculty evaluations become powerful catalysts for growth. A future where every faculty member receives timely, actionable insights that inspire development, while administrators gain comprehensive data to support teaching excellence and elevate institutional academic quality.</p>
                </article>
                <article class="pillar-card pillar-card--mission">
                    <span class="pillar-card__label">Mission</span>
                    <h3>Turn evaluation into actionable growth.</h3>
                    <p>Our mission is to transform faculty evaluation by centralizing feedback, sentiment, and performance data into one secure platform. We deliver real-time insights and collaborative coaching pathways that turn raw data into clear action steps. By championing transparency, responsiveness, and continuous improvement across every academic unit, we help institutions move beyond measurement to meaningful development.</p>
                </article>
            </div>
        </section>

        

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
</body>
</html>
