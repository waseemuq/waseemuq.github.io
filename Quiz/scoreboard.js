// Initialize the scoreboard page
window.onload = function() {
    // Check if user is logged in
    const currentUser = localStorage.getItem('currentUser');
    
    // Set up event listeners
    document.getElementById('my-scores-btn').addEventListener('click', function() {
        if (currentUser) {
            loadScores(currentUser);
        } else {
            alert('Please log in to view your scores.');
            window.location.href = 'login.html';
        }
    });
    
    document.getElementById('all-scores-btn').addEventListener('click', function() {
        loadScores();
    });
    
    // Load all scores by default
    loadScores();
};

// Load scores from localStorage
function loadScores(filterUser = null) {
    const scoreboardBody = document.getElementById('scoreboard-body');
    scoreboardBody.innerHTML = '';
    
    // Get scores from localStorage
    const scores = JSON.parse(localStorage.getItem('quizScores')) || [];
    
    if (scores.length === 0) {
        scoreboardBody.innerHTML = '<tr><td colspan="4" class="text-center">No scores available</td></tr>';
        return;
    }
    
    // Filter scores if a user is specified
    const filteredScores = filterUser ? scores.filter(s => s.username === filterUser) : scores;
    
    if (filteredScores.length === 0) {
        scoreboardBody.innerHTML = '<tr><td colspan="4" class="text-center">No scores available for this user</td></tr>';
        return;
    }
    
    // Sort scores by score (descending) and then by date (most recent first)
    filteredScores.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        return new Date(b.date) - new Date(a.date);
    });
    
    // Display scores
    filteredScores.forEach((score, index) => {
        const row = document.createElement('tr');
        
        // Highlight the current user's scores
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser && score.username === currentUser) {
            row.classList.add('table-primary');
        }
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${score.username}</td>
            <td>${score.score}</td>
            <td>${new Date(score.date).toLocaleString()}</td>
        `;
        
        scoreboardBody.appendChild(row);
    });
    
    // Update the title based on filter
    const title = document.querySelector('.card-header h4');
    if (filterUser) {
        title.innerText = `Scores for ${filterUser}`;
    } else {
        title.innerText = 'Top Scores';
    }
}