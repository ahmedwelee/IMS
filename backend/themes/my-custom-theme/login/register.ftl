<div class="login-container">
    <div class="login-header">
        <div class="login-icon">
            <img src="${url.resourcesPath}/img/medlogo.png" alt="logo" style="width: 400px; height: 350px;">
        </div>
        <h2>Create Your Account</h2>
        <p>Please sign up to your account</p>
    </div>

    <div class="login-body">
        <form action="${url.registrationAction}" method="post" id="kc-form-register">
            <!-- First Name -->
            <div class="form-group">
                <label for="firstName">First Name</label>
                <div class="input-wrapper">
                    <svg class="input-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    <input type="text" id="firstName" name="firstName" placeholder="Enter your first name" required autofocus>
                </div>
            </div>

            <!-- Last Name -->
            <div class="form-group">
                <label for="lastName">Last Name</label>
                <div class="input-wrapper">
                    <svg class="input-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    <input type="text" id="lastName" name="lastName" placeholder="Enter your last name" required>
                </div>
            </div>

            <!-- Email -->
            <div class="form-group">
                <label for="email">Email</label>
                <div class="input-wrapper">
                    <svg class="input-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    <input type="email" id="email" name="email" placeholder="Enter your email" required>
                </div>
            </div>

            <!-- Password -->
            <div class="form-group">
                <label for="password">Password</label>
                <div class="input-wrapper">
                    <svg class="input-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
                    </svg>
                    <input type="password" id="password" name="password" placeholder="Enter your password" required>
                </div>
            </div>

            <!-- Confirm Password -->
            <div class="form-group">
                <label for="passwordConfirm">Confirm Password</label>
                <div class="input-wrapper">
                    <svg class="input-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
                    </svg>
                    <input type="password" id="passwordConfirm" name="password-confirm" placeholder="Confirm password" required>
                </div>
            </div>


            <input type="submit" value="Sign Up">

            <div class="signup-link">
                Already have an account? <a href="${url.loginUrl}">Login</a>
            </div>
        </form>
    </div>
</div>

<link rel="stylesheet" href="${url.resourcesPath}/css/style.css">
