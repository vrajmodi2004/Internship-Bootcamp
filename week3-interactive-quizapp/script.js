const quizQuestions = [
    {
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correct: 2,
        explanation: "Paris has been the capital of France since 508 AD and is one of the most influential cities in Europe."
    },
    {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correct: 1,
        explanation: "Mars appears reddish due to iron oxide (rust) on its surface, which is why it's called the Red Planet."
    },
    {
        question: "What is the largest ocean on Earth?",
        options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
        correct: 3,
        explanation: "The Pacific Ocean covers approximately 63 million square miles, making it the largest ocean on Earth."
    },
    {
        question: "Who painted the Mona Lisa?",
        options: ["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso", "Michelangelo"],
        correct: 1,
        explanation: "Leonardo da Vinci painted the Mona Lisa between 1503 and 1519. It's one of the most famous paintings in the world."
    },
    {
        question: "What is the smallest prime number?",
        options: ["0", "1", "2", "3"],
        correct: 2,
        explanation: "2 is the smallest prime number and the only even prime number. A prime number must be greater than 1 and divisible only by 1 and itself."
    },
    {
        question: "In which year did World War II end?",
        options: ["1943", "1944", "1945", "1946"],
        correct: 2,
        explanation: "World War II ended in 1945 with Germany's surrender in May and Japan's surrender in September after the atomic bombings."
    },
    {
        question: "What is the chemical symbol for gold?",
        options: ["Go", "Gd", "Au", "Ag"],
        correct: 2,
        explanation: "The symbol Au comes from the Latin word 'aurum' meaning gold. Ag is silver, which comes from 'argentum'."
    },
    {
        question: "Which programming language is known as the 'language of the web'?",
        options: ["Python", "Java", "JavaScript", "C++"],
        correct: 2,
        explanation: "JavaScript is called the language of the web because it runs in all web browsers and is essential for interactive websites."
    },
    {
        question: "What is the largest mammal in the world?",
        options: ["African Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
        correct: 1,
        explanation: "The blue whale can grow up to 100 feet long and weigh as much as 200 tons, making it the largest animal ever known."
    },
    {
        question: "How many continents are there on Earth?",
        options: ["5", "6", "7", "8"],
        correct: 2,
        explanation: "There are 7 continents: Africa, Antarctica, Asia, Australia, Europe, North America, and South America."
    }
];

let currentQuestion = 0;
let score = 0;
let timeLeft = 60;
let timerInterval;
let userAnswers = [];
let bookmarkedQuestions = [];
let confidenceLevels = [];
let questionTimes = [];
let questionStartTime;
let startTime;
let currentFilter = 'all';

function startQuiz() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('quizScreen').style.display = 'block';
    currentQuestion = 0;
    score = 0;
    userAnswers = new Array(quizQuestions.length).fill(null);
    bookmarkedQuestions = new Array(quizQuestions.length).fill(false);
    confidenceLevels = new Array(quizQuestions.length).fill(null);
    questionTimes = new Array(quizQuestions.length).fill(0);
    startTime = Date.now();
    questionStartTime = Date.now();
    createQuestionNavigator();
    loadQuestion();
    startTimer();
    updateSidebar();
}

function createQuestionNavigator() {
    const nav = document.getElementById('questionNavigator');
    nav.innerHTML = '';
    for (let i = 0; i < quizQuestions.length; i++) {
        const dot = document.createElement('div');
        dot.className = 'nav-dot';
        dot.textContent = i + 1;
        dot.onclick = () => navigateToQuestion(i);
        nav.appendChild(dot);
    }
}

function updateQuestionNavigator() {
    const dots = document.querySelectorAll('.nav-dot');
    dots.forEach((dot, idx) => {
        dot.className = 'nav-dot';
        if (userAnswers[idx] !== null) dot.classList.add('answered');
        if (idx === currentQuestion) dot.classList.add('current');
        if (bookmarkedQuestions[idx]) dot.classList.add('bookmarked');
    });
}

function navigateToQuestion(idx) {
    if (questionStartTime) questionTimes[currentQuestion] += Math.floor((Date.now() - questionStartTime) / 1000);
    currentQuestion = idx;
    questionStartTime = Date.now();
    loadQuestion();
}

function startTimer() {
    timeLeft = 60;
    const box = document.getElementById('timerBox');
    const leftEl = document.getElementById('timeLeft');
    timerInterval = setInterval(() => {
        timeLeft--;
        leftEl.textContent = timeLeft;
        if (timeLeft <= 10) box.classList.add('warning');
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            autoSubmitQuiz();
        }
    }, 1000);
}

function loadQuestion() {
    const q = quizQuestions[currentQuestion];
    document.getElementById('questionNumber').textContent = `Question ${currentQuestion + 1}`;
    document.getElementById('questionText').textContent = q.question;
    document.getElementById('progressText').textContent = `Question ${currentQuestion + 1} of ${quizQuestions.length}`;
    const answered = userAnswers.filter(a => a !== null).length;
    document.getElementById('answeredCount').textContent = `${answered} answered`;
    const pct = ((currentQuestion + 1) / quizQuestions.length) * 100;
    document.getElementById('progressFill').style.width = pct + '%';
    const btn = document.getElementById('bookmarkBtn');
    btn.textContent = bookmarkedQuestions[currentQuestion] ? '★' : '☆';
    btn.className = 'bookmark-btn' + (bookmarkedQuestions[currentQuestion] ? ' bookmarked' : '');
    const cont = document.getElementById('optionsContainer');
    cont.innerHTML = '';
    q.options.forEach((opt, idx) => {
        const div = document.createElement('div');
        div.className = 'option';
        if (userAnswers[currentQuestion] === idx) div.classList.add('selected');
        div.innerHTML = `<div class="option-radio"></div><span class="option-label">${String.fromCharCode(65 + idx)}.</span><span class="option-text">${opt}</span>`;
        div.onclick = () => selectOption(idx);
        cont.appendChild(div);
    });
    updateButtons();
    updateQuestionNavigator();
    updateSidebar();
}

function selectOption(idx) {
    userAnswers[currentQuestion] = idx;
    const opts = document.querySelectorAll('.option');
    opts.forEach((o, i) => {
        o.classList.remove('selected');
        if (i === idx) o.classList.add('selected');
    });
    updateButtons();
    updateQuestionNavigator();
    updateSidebar();
}

function updateConfidenceSelector() {}

function setConfidence(lvl) {}

function toggleBookmark() {
    bookmarkedQuestions[currentQuestion] = !bookmarkedQuestions[currentQuestion];
    const btn = document.getElementById('bookmarkBtn');
    btn.textContent = bookmarkedQuestions[currentQuestion] ? '★' : '☆';
    btn.className = 'bookmark-btn' + (bookmarkedQuestions[currentQuestion] ? ' bookmarked' : '');
    updateQuestionNavigator();
    updateSidebar();
}

function clearAnswer() {
    userAnswers[currentQuestion] = null;
    confidenceLevels[currentQuestion] = null;
    loadQuestion();
}

function updateButtons() {
    const nxt = document.getElementById('nextBtn');
    const sub = document.getElementById('submitBtn');
    const prv = document.getElementById('prevBtn');
    prv.style.display = currentQuestion === 0 ? 'none' : 'inline-block';
    if (currentQuestion === quizQuestions.length - 1) {
        nxt.style.display = 'none';
        sub.style.display = 'inline-block';
    } else {
        nxt.style.display = 'inline-block';
        sub.style.display = 'none';
    }
}

function updateSidebar() {
    const answered = userAnswers.filter(a => a !== null).length;
    const bookmarked = bookmarkedQuestions.filter(b => b).length;
    document.getElementById('sidebarAnswered').textContent = answered;
    document.getElementById('sidebarRemaining').textContent = quizQuestions.length - answered;
    document.getElementById('sidebarBookmarked').textContent = bookmarked;
}

function nextQuestion() {
    if (currentQuestion < quizQuestions.length - 1) {
        questionTimes[currentQuestion] += Math.floor((Date.now() - questionStartTime) / 1000);
        currentQuestion++;
        questionStartTime = Date.now();
        loadQuestion();
    }
}

function previousQuestion() {
    if (currentQuestion > 0) {
        questionTimes[currentQuestion] += Math.floor((Date.now() - questionStartTime) / 1000);
        currentQuestion--;
        questionStartTime = Date.now();
        loadQuestion();
    }
}

function confirmSubmit() {
    const unanswered = userAnswers.filter(a => a === null).length;
    if (unanswered > 0 && !confirm(`You have ${unanswered} unanswered question(s). Are you sure you want to submit?`)) return;
    submitQuiz();
}

function submitQuiz() {
    questionTimes[currentQuestion] += Math.floor((Date.now() - questionStartTime) / 1000);
    clearInterval(timerInterval);
    calculateScore();
    showResults();
}

function autoSubmitQuiz() {
    questionTimes[currentQuestion] += Math.floor((Date.now() - questionStartTime) / 1000);
    calculateScore();
    showResults();
}

function calculateScore() {
    score = 0;
    userAnswers.forEach((ans, idx) => {
        if (ans === quizQuestions[idx].correct) score++;
    });
}

function getPerformanceGrade(pct) {
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 50) return 'D';
    return 'F';
}

function showResults() {
    document.getElementById('quizScreen').style.display = 'none';
    document.getElementById('resultsScreen').style.display = 'block';
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    const pct = Math.round((score / quizQuestions.length) * 100);
    document.getElementById('scoreNumber').textContent = score;
    document.getElementById('performanceGrade').textContent = getPerformanceGrade(pct);
    let msg = '', sw = '';
    if (pct >= 90) {
        msg = 'Outstanding performance! You have demonstrated excellent understanding of the subject matter.';
        sw = '<div class="strength-item">Exceptional knowledge retention</div><div class="strength-item">Strong analytical skills</div>';
    } else if (pct >= 70) {
        msg = 'Good work! You have a solid grasp of most concepts with room for minor improvements.';
        sw = '<div class="strength-item">Good overall understanding</div><div class="weakness-item">Review missed topics</div>';
    } else if (pct >= 50) {
        msg = 'Fair attempt. Consider reviewing the material to strengthen your understanding of key concepts.';
        sw = '<div class="strength-item">Basic comprehension</div><div class="weakness-item">Needs focused study</div>';
    } else {
        msg = 'We recommend thorough review of the material. Practice and study will help improve your performance.';
        sw = '<div class="weakness-item">Requires comprehensive review</div><div class="weakness-item">Consider additional resources</div>';
    }
    document.getElementById('resultMessage').textContent = msg;
    document.getElementById('strengthWeakness').innerHTML = sw;
    const correct = score;
    const wrong = userAnswers.filter((ans, idx) => ans !== null && ans !== quizQuestions[idx].correct).length;
    const skipped = userAnswers.filter(ans => ans === null).length;
    document.getElementById('correctCount').textContent = correct;
    document.getElementById('wrongCount').textContent = wrong;
    document.getElementById('skippedCount').textContent = skipped;
    document.getElementById('timeTaken').textContent = totalTime + 's';
}

function reviewAnswers() {
    currentFilter = 'all';
    document.getElementById('resultsScreen').style.display = 'none';
    document.getElementById('reviewScreen').style.display = 'block';
    displayReviewItems();
}

function filterReview(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    displayReviewItems();
}

function displayReviewItems() {
    const cont = document.getElementById('reviewContainer');
    cont.innerHTML = '';
    quizQuestions.forEach((q, idx) => {
        const userAns = userAnswers[idx];
        const correctAns = q.correct;
        const isCorrect = userAns === correctAns;
        const isSkipped = userAns === null;
        const isBookmarked = bookmarkedQuestions[idx];
        if (currentFilter === 'correct' && !isCorrect) return;
        if (currentFilter === 'incorrect' && (isCorrect || isSkipped)) return;
        if (currentFilter === 'skipped' && !isSkipped) return;
        if (currentFilter === 'bookmarked' && !isBookmarked) return;
        const item = document.createElement('div');
        item.className = 'review-item';
        if (isSkipped) item.classList.add('skipped');
        else if (isCorrect) item.classList.add('correct-answer');
        else item.classList.add('wrong-answer');
        let badge = '';
        if (isSkipped) badge = '<span class="review-status skipped">Skipped</span>';
        else if (isCorrect) badge = '<span class="review-status correct">Correct</span>';
        else badge = '<span class="review-status incorrect">Incorrect</span>';
        let optsHTML = '';
        q.options.forEach((opt, oidx) => {
            let cls = 'review-option', lbl = '';
            if (oidx === correctAns) {
                cls += ' correct-answer';
                lbl = '<div class="answer-label correct">✓ Correct Answer</div>';
            }
            if (oidx === userAns && userAns !== correctAns) {
                cls += ' wrong-answer';
                lbl = '<div class="answer-label incorrect">✗ Your Answer</div>';
            } else if (oidx === userAns && userAns === correctAns) {
                lbl = '<div class="answer-label correct">✓ Your Answer</div>';
            }
            optsHTML += `<div class="${cls}">${lbl}<div class="option-content"><strong>${String.fromCharCode(65 + oidx)}.</strong> ${opt}</div></div>`;
        });
        let expHTML = '';
        if (q.explanation) expHTML = `<div class="explanation-box"><div class="explanation-title">Explanation</div><div class="explanation-text">${q.explanation}</div></div>`;
        item.innerHTML = `<div class="review-item-header"><div class="review-question-number">Question ${idx + 1}</div>${badge}</div><div class="review-question">${q.question}</div><div class="review-options">${optsHTML}</div>${expHTML}`;
        cont.appendChild(item);
    });
    if (cont.children.length === 0) cont.innerHTML = '<div style="text-align: center; padding: 40px; color: #5f6368;">No questions match the selected filter.</div>';
}

function backToResults() {
    document.getElementById('reviewScreen').style.display = 'none';
    document.getElementById('resultsScreen').style.display = 'block';
}

function restartQuiz() {
    document.getElementById('resultsScreen').style.display = 'none';
    document.getElementById('reviewScreen').style.display = 'none';
    document.getElementById('startScreen').style.display = 'block';
    currentQuestion = 0;
    score = 0;
    timeLeft = 60;
    userAnswers = [];
    bookmarkedQuestions = [];
    confidenceLevels = [];
    questionTimes = [];
    document.getElementById('timerBox').classList.remove('warning');
}