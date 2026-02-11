import { quizQuestions } from './questions.js';
import { QuizState } from './quizState.js';
import { 
    calculateScore, 
    getPerformanceGrade, 
    getPerformanceMessage,
    getStrengthWeakness,
    calculatePercentage,
    formatTime,
    countAnswerTypes,
    generateOptionLabel,
    createReviewHTML
} from './utils.js';
import { $, $$, hide, show, setText, setHTML, addClass, removeClass, createElement, scrollToTop } from './dom.js';

class QuizApp {
    constructor(questions) {
        this.questions = questions;
        this.state = new QuizState(questions.length);
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        window.startQuiz = () => this.startQuiz();
        window.nextQuestion = () => this.nextQuestion();
        window.previousQuestion = () => this.previousQuestion();
        window.clearAnswer = () => this.clearAnswer();
        window.toggleBookmark = () => this.toggleBookmark();
        window.confirmSubmit = () => this.confirmSubmit();
        window.reviewAnswers = () => this.reviewAnswers();
        window.backToResults = () => this.backToResults();
        window.restartQuiz = () => this.restartQuiz();
        window.filterReview = (filter) => this.filterReview(filter);
        window.navigateToQuestion = (idx) => this.navigateToQuestion(idx);
        window.selectOption = (idx) => this.selectOption(idx);
    }

    startQuiz() {
        hide('#startScreen');
        show('#quizScreen');
        this.state.reset(this.questions.length);
        this.state.startQuiz();
        this.createQuestionNavigator();
        this.loadQuestion();
        this.startTimer();
        this.updateSidebar();
    }

    createQuestionNavigator() {
        const nav = $('#questionNavigator');
        setHTML(nav, '');
        
        this.questions.forEach((_, i) => {
            const dot = createElement('div', 'nav-dot', i + 1);
            dot.onclick = () => this.navigateToQuestion(i);
            nav.appendChild(dot);
        });
    }

    updateQuestionNavigator() {
        $$('.nav-dot').forEach((dot, idx) => {
            dot.className = 'nav-dot';
            if (this.state.userAnswers[idx] !== null) addClass(dot, 'answered');
            if (idx === this.state.currentQuestion) addClass(dot, 'current');
            if (this.state.bookmarkedQuestions[idx]) addClass(dot, 'bookmarked');
        });
    }

    navigateToQuestion(idx) {
        if (this.state.navigateToQuestion(idx)) {
            this.loadQuestion();
        }
    }

    startTimer() {
        this.state.timeLeft = 60;
        const timerBox = $('#timerBox');
        const timeLeftEl = $('#timeLeft');
        
        this.state.timerInterval = setInterval(() => {
            this.state.timeLeft--;
            setText(timeLeftEl, this.state.timeLeft);
            
            if (this.state.timeLeft <= 10) addClass(timerBox, 'warning');
            if (this.state.timeLeft <= 0) {
                clearInterval(this.state.timerInterval);
                this.autoSubmitQuiz();
            }
        }, 1000);
    }

    loadQuestion() {
        const question = this.questions[this.state.currentQuestion];
        const { currentQuestion } = this.state;
        
        setText('#questionNumber', `Question ${currentQuestion + 1}`);
        setText('#questionText', question.question);
        setText('#progressText', `Question ${currentQuestion + 1} of ${this.questions.length}`);
        
        const answered = this.state.getAnsweredCount();
        setText('#answeredCount', `${answered} answered`);
        
        const pct = ((currentQuestion + 1) / this.questions.length) * 100;
        $('#progressFill').style.width = `${pct}%`;
        
        this.updateBookmarkButton();
        this.renderOptions(question);
        this.updateButtons();
        this.updateQuestionNavigator();
        this.updateSidebar();
    }

    updateBookmarkButton() {
        const btn = $('#bookmarkBtn');
        const isBookmarked = this.state.isCurrentBookmarked();
        setText(btn, isBookmarked ? '★' : '☆');
        btn.className = `bookmark-btn${isBookmarked ? ' bookmarked' : ''}`;
    }

    renderOptions(question) {
        const container = $('#optionsContainer');
        setHTML(container, '');
        
        question.options.forEach((opt, idx) => {
            const div = createElement('div', 'option');
            if (this.state.getCurrentAnswer() === idx) addClass(div, 'selected');
            
            setHTML(div, `
                <div class="option-radio"></div>
                <span class="option-label">${generateOptionLabel(idx)}.</span>
                <span class="option-text">${opt}</span>
            `);
            div.onclick = () => this.selectOption(idx);
            container.appendChild(div);
        });
    }

    selectOption(idx) {
        this.state.selectAnswer(idx);
        
        $$('.option').forEach((opt, i) => {
            removeClass(opt, 'selected');
            if (i === idx) addClass(opt, 'selected');
        });
        
        this.updateButtons();
        this.updateQuestionNavigator();
        this.updateSidebar();
    }

    toggleBookmark() {
        this.state.toggleBookmark();
        this.updateBookmarkButton();
        this.updateQuestionNavigator();
        this.updateSidebar();
    }

    clearAnswer() {
        this.state.clearCurrentAnswer();
        this.loadQuestion();
    }

    updateButtons() {
        const nextBtn = $('#nextBtn');
        const submitBtn = $('#submitBtn');
        const prevBtn = $('#prevBtn');
        
        prevBtn.style.display = this.state.isFirstQuestion() ? 'none' : 'inline-block';
        
        if (this.state.isLastQuestion()) {
            hide(nextBtn);
            show(submitBtn, 'inline-block');
        } else {
            show(nextBtn, 'inline-block');
            hide(submitBtn);
        }
    }

    updateSidebar() {
        setText('#sidebarAnswered', this.state.getAnsweredCount());
        setText('#sidebarRemaining', this.state.getRemainingCount());
        setText('#sidebarBookmarked', this.state.getBookmarkedCount());
    }

    nextQuestion() {
        if (this.state.nextQuestion()) {
            this.loadQuestion();
        }
    }

    previousQuestion() {
        if (this.state.previousQuestion()) {
            this.loadQuestion();
        }
    }

    confirmSubmit() {
        const unanswered = this.state.getUnansweredCount();
        if (unanswered > 0 && !confirm(`You have ${unanswered} unanswered question(s). Are you sure you want to submit?`)) {
            return;
        }
        this.submitQuiz();
    }

    submitQuiz() {
        this.state.recordQuestionTime();
        clearInterval(this.state.timerInterval);
        this.state.score = calculateScore(this.state.userAnswers, this.questions);
        this.showResults();
    }

    autoSubmitQuiz() {
        this.state.recordQuestionTime();
        this.state.score = calculateScore(this.state.userAnswers, this.questions);
        this.showResults();
    }

    showResults() {
        hide('#quizScreen');
        show('#resultsScreen');
        
        const totalTime = this.state.getTotalTime();
        const percentage = calculatePercentage(this.state.score, this.questions.length);
        
        setText('#scoreNumber', this.state.score);
        setText('#performanceGrade', getPerformanceGrade(percentage));
        setText('#resultMessage', getPerformanceMessage(percentage));
        
        const { strengths, weaknesses } = getStrengthWeakness(percentage);
        const strengthHTML = strengths.map(s => `<div class="strength-item">${s}</div>`).join('');
        const weaknessHTML = weaknesses.map(w => `<div class="weakness-item">${w}</div>`).join('');
        setHTML('#strengthWeakness', strengthHTML + weaknessHTML);
        
        const stats = countAnswerTypes(this.state.userAnswers, this.questions);
        setText('#correctCount', stats.correct);
        setText('#wrongCount', stats.wrong);
        setText('#skippedCount', stats.skipped);
        setText('#timeTaken', formatTime(totalTime));
    }

    reviewAnswers() {
        this.state.setFilter('all');
        hide('#resultsScreen');
        show('#reviewScreen');
        this.displayReviewItems();
        scrollToTop();
    }

    filterReview(filter) {
        this.state.setFilter(filter);
        $$('.filter-btn').forEach(btn => removeClass(btn, 'active'));
        event.target.classList.add('active');
        this.displayReviewItems();
    }

    displayReviewItems() {
        const container = $('#reviewContainer');
        setHTML(container, '');
        
        const filteredQuestions = this.questions.filter((q, idx) => {
            const userAns = this.state.userAnswers[idx];
            const correctAns = q.correct;
            const isCorrect = userAns === correctAns;
            const isSkipped = userAns === null;
            const isBookmarked = this.state.bookmarkedQuestions[idx];
            
            const { currentFilter } = this.state;
            if (currentFilter === 'correct' && !isCorrect) return false;
            if (currentFilter === 'incorrect' && (isCorrect || isSkipped)) return false;
            if (currentFilter === 'skipped' && !isSkipped) return false;
            if (currentFilter === 'bookmarked' && !isBookmarked) return false;
            
            return true;
        });

        filteredQuestions.forEach((q) => {
            const idx = this.questions.indexOf(q);
            const userAns = this.state.userAnswers[idx];
            const isCorrect = userAns === q.correct;
            const isSkipped = userAns === null;
            
            const item = createElement('div', 'review-item');
            if (isSkipped) addClass(item, 'skipped');
            else if (isCorrect) addClass(item, 'correct-answer');
            else addClass(item, 'wrong-answer');
            
            const html = createReviewHTML({
                question: q.question,
                options: q.options,
                userAnswer: userAns,
                correctAnswer: q.correct,
                explanation: q.explanation,
                index: idx
            });
            
            setHTML(item, html);
            container.appendChild(item);
        });
        
        if (filteredQuestions.length === 0) {
            setHTML(container, '<div style="text-align: center; padding: 40px; color: #5f6368;">No questions match the selected filter.</div>');
        }
    }

    backToResults() {
        hide('#reviewScreen');
        show('#resultsScreen');
    }

    restartQuiz() {
        hide('#resultsScreen');
        hide('#reviewScreen');
        show('#startScreen');
        this.state.reset(this.questions.length);
        removeClass('#timerBox', 'warning');
    }
}
const app = new QuizApp(quizQuestions);