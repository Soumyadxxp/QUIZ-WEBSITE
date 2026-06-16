let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 15;
let selectedCategory = 9; // Default category
let userAnswers = [];

// Elements
const questionElement = document.getElementById("question");
const optionsContainer = document.getElementById("options");
const nextButton = document.getElementById("next-btn");
const scoreBox = document.getElementById("score-box");
const quizBox = document.getElementById("quiz-box");
const startBox = document.getElementById("start-box");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("high-score");
const timeDisplay = document.getElementById("time");
const answersContainer = document.createElement("div"); // For displaying correct answers

// Load High Score from Local Storage
let highScore = localStorage.getItem("highScore") || 0;
highScoreDisplay.innerText = highScore;

// Fetch Questions from API
async function fetchQuestions() {
    const API_URL = `https://opentdb.com/api.php?amount=5&category=${selectedCategory}&type=multiple`;
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        questions = data.results.map(q => ({
            question: q.question,
            options: [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5),
            answer: q.correct_answer
        }));
        loadQuestion();
    } catch (error) {
        console.error("Error fetching questions:", error);
    }
}

// Start Quiz
function startQuiz() {
    selectedCategory = document.getElementById("category").value;
    startBox.classList.add("hidden");
    quizBox.classList.remove("hidden");
    userAnswers = []; // Reset answers
    fetchQuestions();
}

// Load Question
function loadQuestion() {
    resetState();
    let currentQuestion = questions[currentQuestionIndex];
    questionElement.innerHTML = currentQuestion.question;
    
    currentQuestion.options.forEach(option => {
        const button = document.createElement("button");
        button.innerText = option;
        button.classList.add("option-btn");
        button.addEventListener("click", () => selectAnswer(option, button));
        optionsContainer.appendChild(button);
    });

    startTimer();
}

// Reset UI
function resetState() {
    optionsContainer.innerHTML = "";
    nextButton.style.display = "none";
    timeLeft = 15;
}

// Start Timer
function startTimer() {
    clearInterval(timer);
    timeDisplay.innerText = timeLeft;
    timer = setInterval(() => {
        timeLeft--;
        timeDisplay.innerText = timeLeft;
        if (timeLeft === 0) {
            clearInterval(timer);
            disableOptions();
            nextButton.style.display = "block";
        }
    }, 1000);
}

// Disable Options
function disableOptions() {
    document.querySelectorAll(".option-btn").forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = "0.5";
    });
}

// Select Answer
function selectAnswer(selected, button) {
    clearInterval(timer);
    let correct = questions[currentQuestionIndex].answer;
    userAnswers.push({ 
        question: questions[currentQuestionIndex].question,
        selected: selected,
        correct: correct
    });

    if (selected === correct) {
        score++;
        button.style.background = "#28a745"; // Green for correct answer
    } else {
        button.style.background = "#dc3545"; // Red for wrong answer
    }

    disableOptions();
    nextButton.style.display = "block";
}

// Next Question
nextButton.addEventListener("click", () => {
    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        showScore();
    }
});

// Show Score and Correct Answers
function showScore() {
    quizBox.classList.add("hidden");
    scoreBox.classList.remove("hidden");
    scoreDisplay.innerText = `${score} / ${questions.length}`;

    // Update High Score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
        highScoreDisplay.innerText = highScore;
    }

    // Show correct answers
    answersContainer.innerHTML = "<h3>Correct Answers:</h3>";
    userAnswers.forEach((entry, index) => {
        let questionHTML = `<p><strong>Q${index + 1}: ${entry.question}</strong></p>`;
        let selectedAnswer = `<p>Your Answer: <span style="color: ${entry.selected === entry.correct ? 'green' : 'red'}">${entry.selected}</span></p>`;
        let correctAnswer = `<p>Correct Answer: <span style="color: yellow">${entry.correct}</span></p>`;
        answersContainer.innerHTML += questionHTML + selectedAnswer + correctAnswer + "<hr>";
    });

    scoreBox.appendChild(answersContainer);
}

// Restart Quiz
function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    startBox.classList.remove("hidden");
    scoreBox.classList.add("hidden");
}
