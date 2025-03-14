// Global variables
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let currentUser = '';

// Initialize the quiz
window.onload = function() {
    // Check if the user is logged in
    checkLoginStatus();
    
    // Load questions
    loadQuestions().then(() => {
        // Update the UI with the total number of questions
        updateTotalQuestions();
    });
};

// Check if the user is logged in
function checkLoginStatus() {
    currentUser = localStorage.getItem('currentUser');
    
    // Add login/register buttons if not on the login page and not logged in
    if (!window.location.href.includes('login.html') && !currentUser) {
        const container = document.querySelector('.container');
        if (container) {
            const loginPrompt = document.createElement('div');
            loginPrompt.className = 'text-center mt-3';
            loginPrompt.innerHTML = `
                <p>Please log in or register to track your scores.</p>
                <a href="login.html" class="btn btn-primary">Login / Register</a>
            `;
            container.appendChild(loginPrompt);
        }
    }
    
    // Add logout button if logged in
    if (currentUser) {
        const container = document.querySelector('.container');
        if (container) {
            const userInfo = document.createElement('div');
            userInfo.className = 'text-center mt-3';
            userInfo.innerHTML = `
                <p>Logged in as <strong>${currentUser}</strong></p>
                <button id="logout-btn" class="btn btn-outline-danger btn-sm">Logout</button>
            `;
            container.appendChild(userInfo);
            
            // Add logout event listener
            document.getElementById('logout-btn').addEventListener('click', logout);
        }
    }
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Load questions from localStorage or questions.json
async function loadQuestions() {
    const savedQuestions = localStorage.getItem('quizQuestions');
    
    if (savedQuestions) {
        questions = JSON.parse(savedQuestions);
        return;
    }
    
    try {
        const response = await fetch('questions.json');
        const data = await response.json();
        questions = data;
        localStorage.setItem('quizQuestions', JSON.stringify(questions));
    } catch (error) {
        console.error('Error loading questions:', error);
        // Use default questions if JSON fetch fails
        questions = [
            {
                question: "What does HTML stand for?",
                options: [
                    "Hyper Text Markup Language",
                    "High Tech Modern Language",
                    "Hyper Transfer Markup Language",
                    "Hyperlink and Text Management Language"
                ],
                correct: "Hyper Text Markup Language"
            }
        ];
        localStorage.setItem('quizQuestions', JSON.stringify(questions));
    }
}

function updateTotalQuestions() {
    document.getElementById("question-number").innerText = `1 of ${questions.length}`;
    loadQuestion();
}

function loadQuestion() {
    if (questions.length === 0) {
        document.getElementById("quiz-container").innerHTML = "No questions available. Please add questions first.";
        return;
    }
    
    const questionData = questions[currentQuestionIndex];
    document.getElementById("question-text").innerText = questionData.question;
    document.getElementById("question-number").innerText = `${currentQuestionIndex + 1} of ${questions.length}`;
    
    const optionsContainer = document.getElementById("options-container");
    optionsContainer.innerHTML = "";
    
    questionData.options.forEach((option, index) => {
        const optionElement = document.createElement("div");
        optionElement.classList.add("form-check");
        optionElement.innerHTML = `
            <input class="form-check-input" type="radio" name="answer" id="option${index}" value="${option}">
            <label class="form-check-label" for="option${index}">${option}</label>
        `;
        optionsContainer.appendChild(optionElement);
    });
    
    updateProgressBar();
}

function nextQuestion() {
    const selectedOption = document.querySelector('input[name="answer"]:checked');
    if (!selectedOption) {
        alert("Please select an answer!");
        return;
    }
    
    if (selectedOption.value === questions[currentQuestionIndex].correct) {
        score += 5;
    }
    
    currentQuestionIndex++;
    
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        showResult();
    }
}

function updateProgressBar() {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    document.getElementById("progress-bar").style.width = `${progress}%`;
}

function showResult() {
    document.getElementById("quiz-container").classList.add("d-none");
    document.getElementById("result-container").classList.remove("d-none");
    document.getElementById("score").innerText = score;
    
    // Save score if user is logged in
    if (currentUser) {
        saveScore(currentUser, score);
        
        // Show scoreboard
        const resultContainer = document.getElementById("result-container");
        resultContainer.innerHTML += `
            <div class="mt-3">
                <h4>Scoreboard</h4>
                <div id="scoreboard" class="mt-2"></div>
                <button id="view-scoreboard-btn" class="btn btn-info mt-2">View Full Scoreboard</button>
            </div>
        `;
        
        // Display top 5 scores
        displayTopScores(5);
        
        // Add event listener for scoreboard button
        document.getElementById("view-scoreboard-btn").addEventListener("click", function() {
            window.location.href = "scoreboard.html";
        });
    } else {
        // Prompt user to login/register to save score
        document.getElementById("result-container").innerHTML += `
            <div class="alert alert-info mt-3">
                <p>Log in or register to save your score and view the scoreboard!</p>
                <a href="login.html" class="btn btn-primary">Login / Register</a>
            </div>
        `;
    }
}

// Save score to localStorage
function saveScore(username, score) {
    // Get existing scores
    let scores = JSON.parse(localStorage.getItem('quizScores')) || [];
    
    // Add new score
    scores.push({
        username: username,
        score: score,
        date: new Date().toISOString()
    });
    
    // Save back to localStorage
    localStorage.setItem('quizScores', JSON.stringify(scores));
}

// Display top scores
function displayTopScores(limit) {
    const scoreboard = document.getElementById("scoreboard");
    if (!scoreboard) return;
    
    // Get scores from localStorage
    const scores = JSON.parse(localStorage.getItem('quizScores')) || [];
    
    // Sort scores by score (descending) and then by date (most recent first)
    scores.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        return new Date(b.date) - new Date(a.date);
    });
    
    // Create scoreboard HTML
    let scoreboardHTML = '<table class="table table-striped"><thead><tr><th>Rank</th><th>Username</th><th>Score</th></tr></thead><tbody>';
    
    // Add top scores
    const topScores = scores.slice(0, limit);
    topScores.forEach((score, index) => {
        scoreboardHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${score.username}</td>
                <td>${score.score}</td>
            </tr>
        `;
    });
    
    scoreboardHTML += '</tbody></table>';
    scoreboard.innerHTML = scoreboardHTML;
}

// Reset the quiz
function resetQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    loadQuestion();
    document.getElementById("quiz-container").classList.remove("d-none");
    document.getElementById("result-container").classList.add("d-none");
}