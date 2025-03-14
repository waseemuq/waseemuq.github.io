// Admin credentials - hardcoded for frontend use only
const ADMIN_CREDENTIALS = {
    username: "admin",
    password: "quizmaster123"
};

// Global variables
let allQuestions = [];
let allScores = [];

// Initialize the admin page
window.onload = function() {
    loadQuestions();
    loadScores();
    setupEventListeners();
};

// Setup all event listeners
function setupEventListeners() {
    // Login button
    document.getElementById('login-btn').addEventListener('click', validateLogin);

    // Logout button
    document.getElementById('logout-btn').addEventListener('click', logout);

    // Add question button
    document.getElementById('add-question-btn').addEventListener('click', addNewQuestion);

    // Download questions button
    document.getElementById('download-btn').addEventListener('click', downloadQuestions);

    // Upload questions file
    document.getElementById('upload-json').addEventListener('change', uploadQuestions);

    // Clear scores button
    document.getElementById('clear-scores-btn').addEventListener('click', clearAllScores);
}

// Validate admin login
function validateLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        document.getElementById('login-panel').classList.add('d-none');
        document.getElementById('admin-panel').classList.remove('d-none');
        displayQuestions();
        displayScoreboard();
    } else {
        alert('Invalid username or password!');
    }
}

// Logout function
function logout() {
    document.getElementById('login-panel').classList.remove('d-none');
    document.getElementById('admin-panel').classList.add('d-none');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// Load questions from localStorage or use defaults
function loadQuestions() {
    const savedQuestions = localStorage.getItem('quizQuestions');
    if (savedQuestions) {
        allQuestions = JSON.parse(savedQuestions);
    } else {
        // Fetch from questions.json (this will only work on a server or using fetch API)
        fetch('questions.json')
            .then(response => response.json())
            .then(data => {
                allQuestions = data;
                localStorage.setItem('quizQuestions', JSON.stringify(allQuestions));
                displayQuestions();
            })
            .catch(error => {
                console.error('Error loading questions:', error);
                // Load default questions from script.js (as a fallback)
                loadDefaultQuestions();
            });
    }
}

// Load default questions if JSON fetch fails
function loadDefaultQuestions() {
    // This assumes the questions array structure from the original script.js
    if (typeof questions !== 'undefined') {
        allQuestions = questions;
        localStorage.setItem('quizQuestions', JSON.stringify(allQuestions));
    } else {
        // Create a minimal default set if nothing else is available
        allQuestions = [
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
        localStorage.setItem('quizQuestions', JSON.stringify(allQuestions));
    }
    displayQuestions();
}

// Display all questions in the admin panel
function displayQuestions() {
    const questionsList = document.getElementById('questions-list');
    questionsList.innerHTML = '';

    allQuestions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'card mb-3';
        
        let optionsHTML = '';
        q.options.forEach((option, optIdx) => {
            const isCorrect = option === q.correct;
            optionsHTML += `
                <li class="list-group-item ${isCorrect ? 'list-group-item-success' : ''}">
                    ${option} ${isCorrect ? '<span class="badge bg-success">Correct</span>' : ''}
                </li>
            `;
        });

        questionDiv.innerHTML = `
            <div class="card-header d-flex justify-content-between align-items-center">
                <strong>Question ${index + 1}</strong>
                <button class="btn btn-sm btn-danger delete-question" data-index="${index}">Delete</button>
            </div>
            <div class="card-body">
                <p>${q.question}</p>
                <ul class="list-group">
                    ${optionsHTML}
                </ul>
            </div>
        `;
        questionsList.appendChild(questionDiv);
    });

    // Add event listeners for delete buttons
    document.querySelectorAll('.delete-question').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            deleteQuestion(index);
        });
    });
}

// Add a new question
function addNewQuestion() {
    const questionText = document.getElementById('new-question').value.trim();
    if (!questionText) {
        alert('Please enter a question!');
        return;
    }

    const options = [];
    for (let i = 0; i < 4; i++) {
        const optionText = document.getElementById(`option${i}`).value.trim();
        if (!optionText) {
            alert(`Please enter text for option ${i + 1}!`);
            return;
        }
        options.push(optionText);
    }

    const correctOptionIndex = document.querySelector('input[name="correct-option"]:checked').value;
    const correctOption = options[correctOptionIndex];

    const newQuestion = {
        question: questionText,
        options: options,
        correct: correctOption
    };

    allQuestions.push(newQuestion);
    saveQuestions();
    displayQuestions();

    // Clear the form
    document.getElementById('new-question').value = '';
    for (let i = 0; i < 4; i++) {
        document.getElementById(`option${i}`).value = '';
    }
    document.querySelector('input[name="correct-option"][value="0"]').checked = true;
}

// Delete a question
function deleteQuestion(index) {
    if (confirm('Are you sure you want to delete this question?')) {
        allQuestions.splice(index, 1);
        saveQuestions();
        displayQuestions();
    }
}

// Save questions to localStorage
function saveQuestions() {
    localStorage.setItem('quizQuestions', JSON.stringify(allQuestions));
}

// Download questions as JSON file
function downloadQuestions() {
    const questionsJSON = JSON.stringify(allQuestions, null, 2);
    const blob = new Blob([questionsJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Upload questions from JSON file
function uploadQuestions(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const questions = JSON.parse(e.target.result);
            // Validate the structure of the JSON
            if (Array.isArray(questions) && questions.length > 0 && 
                questions[0].hasOwnProperty('question') && 
                questions[0].hasOwnProperty('options') && 
                questions[0].hasOwnProperty('correct')) {
                
                allQuestions = questions;
                saveQuestions();
                displayQuestions();
                alert('Questions uploaded successfully!');
            } else {
                alert('Invalid question format in the JSON file.');
            }
        } catch (err) {
            alert('Error parsing JSON file: ' + err.message);
        }
    };
    reader.readAsText(file);
    // Reset the file input so the same file can be selected again
    event.target.value = '';
}

// Load scores from localStorage
function loadScores() {
    const savedScores = localStorage.getItem('quizScores');
    if (savedScores) {
        allScores = JSON.parse(savedScores);
    }
}

// Display the scoreboard
function displayScoreboard() {
    const scoreboardBody = document.getElementById('scoreboard-body');
    scoreboardBody.innerHTML = '';

    if (allScores.length === 0) {
        scoreboardBody.innerHTML = '<tr><td colspan="4" class="text-center">No scores yet</td></tr>';
        return;
    }

    // Sort scores by score (descending) and then by date (most recent first)
    allScores.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        return new Date(b.date) - new Date(a.date);
    });

    allScores.forEach((score, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${score.username}</td>
            <td>${score.score}</td>
            <td>${new Date(score.date).toLocaleString()}</td>
            <td>
                <button class="btn btn-sm btn-danger delete-score" data-index="${index}">Delete</button>
            </td>
        `;
        scoreboardBody.appendChild(row);
    });

    // Add event listeners for delete buttons
    document.querySelectorAll('.delete-score').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            deleteScore(index);
        });
    });
}

// Delete a score
function deleteScore(index) {
    if (confirm('Are you sure you want to delete this score?')) {
        allScores.splice(index, 1);
        saveScores();
        displayScoreboard();
    }
}

// Save scores to localStorage
function saveScores() {
    localStorage.setItem('quizScores', JSON.stringify(allScores));
}

// Clear all scores
function clearAllScores() {
    if (confirm('Are you sure you want to clear all scores? This cannot be undone.')) {
        allScores = [];
        saveScores();
        displayScoreboard();
    }
}
