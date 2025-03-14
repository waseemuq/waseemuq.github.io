// Initialize the login page
window.onload = function() {
    // Set up event listeners for forms
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    
    // Set up tab switching
    document.getElementById('login-tab').addEventListener('click', function(e) {
        e.preventDefault();
        showTab('login');
    });
    
    document.getElementById('register-tab').addEventListener('click', function(e) {
        e.preventDefault();
        showTab('register');
    });
};

// Show the selected tab
function showTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.tab-pane').forEach(tab => {
        tab.classList.remove('show', 'active');
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show the selected tab
    document.getElementById(tabId).classList.add('show', 'active');
    document.getElementById(`${tabId}-tab`).classList.add('active');
}

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!username || !password) {
        alert('Please enter both username and password');
        return;
    }
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('quizUsers')) || [];
    
    // Find the user
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Set current user
        localStorage.setItem('currentUser', username);
        
        // Redirect to quiz page
        window.location.href = 'quiz.html';
    } else {
        alert('Invalid username or password');
    }
}

// Handle register form submission
function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    // Validate inputs
    if (!username || !password) {
        alert('Please enter both username and password');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    // Get existing users
    const users = JSON.parse(localStorage.getItem('quizUsers')) || [];
    
    // Check if username already exists
    if (users.some(u => u.username === username)) {
        alert('Username already exists');
        return;
    }
    
    // Add new user
    users.push({
        username: username,
        password: password,
        dateRegistered: new Date().toISOString()
    });
    
    // Save to localStorage
    localStorage.setItem('quizUsers', JSON.stringify(users));
    
    // Set current user
    localStorage.setItem('currentUser', username);
    
    // Show success message
    alert('Registration successful! You are now logged in.');
    
    // Redirect to quiz page
    window.location.href = 'quiz.html';
}

// Handle password reset (optional feature)
function resetPassword() {
    const username = prompt('Enter your username to reset your password:');
    if (!username) return;
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('quizUsers')) || [];
    
    // Find the user
    const userIndex = users.findIndex(u => u.username === username);
    
    if (userIndex !== -1) {
        const newPassword = prompt('Enter new password:');
        if (!newPassword) return;
        
        // Update user's password
        users[userIndex].password = newPassword;
        
        // Save to localStorage
        localStorage.setItem('quizUsers', JSON.stringify(users));
        
        alert('Password updated successfully!');
    } else {
        alert('Username not found.');
    }
}