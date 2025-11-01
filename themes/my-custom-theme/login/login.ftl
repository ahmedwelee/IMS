<div class="login-container">
    <div class="login-header">
        <div class="login-icon">
            <img src="${url.resourcesPath}/img/medlogo.png" alt="logo" style="width: 400px; height: 350px;">
        </div>
        <h2>Welcome Back</h2>
        <p>Please login to your account</p>
    </div>

    <div class="login-body">
        <form action="${url.loginAction}" method="post">
            <div class="form-group">
                <label for="username">Username</label>
                <div class="input-wrapper">
                    <svg class="input-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    <input type="text" id="username" name="username" placeholder="Enter your username" required />
                </div>
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <div class="input-wrapper">
                    <svg class="input-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
                    </svg>
                    <input type="password" id="password" name="password" placeholder="Enter your password" required />
                </div>
            </div>

            <div class="remember-me">
                <input type="checkbox" id="remember" name="remember">
                <label for="remember">Remember me</label>
            </div>

            <div class="forgot-password">
                <a href="#forgot">Forgot Password?</a>
            </div>

            <input type="submit" value="Login" />

            <div class="divider">
                <span>or continue with</span>
            </div>

            <div class="social-login">
                <button type="button" class="social-btn" onclick="location.href='${url.loginAction}?provider=google'">
                    <svg viewBox="0 0 24 24" fill="#4285F4">
                        <path d="M21.35 11.1h-9.3v2.7h5.4c-.23 1.27-1.43 3.72-5.4 3.72-3.25 0-5.9-2.68-5.9-5.98s2.65-5.98 5.9-5.98c1.86 0 3.11.79 3.82 1.47l2.6-2.5C18.47 1.9 16.05.65 12.05.65 5.78.65.7 5.73.7 12s5.08 11.35 11.35 11.35c6.55 0 10.83-4.6 10.83-11.12 0-.74-.08-1.31-.53-1.43z"/>
                    </svg>

                    Google
                </button>

                <button type="button" class="social-btn">
                    <svg viewBox="0 0 24 24" fill="#1877F2">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                </button>
            </div>

            <div class="signup-link">
                Don't have an account? <a href="${url.registrationUrl}">Sign up</a>
            </div>

        </form>
    </div>
</div>
<head>
    <link rel="stylesheet" href="${url.resourcesPath}/css/style.css">
</head>