export class QuizState {
    constructor(totalQuestions) {
        this.currentQuestion = 0;
        this.score = 0;
        this.timeLeft = 60;
        this.timerInterval = null;
        this.userAnswers = new Array(totalQuestions).fill(null);
        this.bookmarkedQuestions = new Array(totalQuestions).fill(false);
        this.questionTimes = new Array(totalQuestions).fill(0);
        this.questionStartTime = null;
        this.startTime = null;
        this.currentFilter = 'all';
    }

    reset(totalQuestions) {
        this.currentQuestion = 0;
        this.score = 0;
        this.timeLeft = 60;
        this.timerInterval = null;
        this.userAnswers = new Array(totalQuestions).fill(null);
        this.bookmarkedQuestions = new Array(totalQuestions).fill(false);
        this.questionTimes = new Array(totalQuestions).fill(0);
        this.questionStartTime = null;
        this.startTime = null;
        this.currentFilter = 'all';
    }

    startQuiz() {
        this.startTime = Date.now();
        this.questionStartTime = Date.now();
    }

    selectAnswer(index) {
        this.userAnswers[this.currentQuestion] = index;
    }

    clearCurrentAnswer() {
        this.userAnswers[this.currentQuestion] = null;
    }

    toggleBookmark() {
        this.bookmarkedQuestions[this.currentQuestion] = !this.bookmarkedQuestions[this.currentQuestion];
        return this.bookmarkedQuestions[this.currentQuestion];
    }

    nextQuestion() {
        if (this.currentQuestion < this.userAnswers.length - 1) {
            this.recordQuestionTime();
            this.currentQuestion++;
            this.questionStartTime = Date.now();
            return true;
        }
        return false;
    }

    previousQuestion() {
        if (this.currentQuestion > 0) {
            this.recordQuestionTime();
            this.currentQuestion--;
            this.questionStartTime = Date.now();
            return true;
        }
        return false;
    }

    navigateToQuestion(index) {
        if (index >= 0 && index < this.userAnswers.length) {
            this.recordQuestionTime();
            this.currentQuestion = index;
            this.questionStartTime = Date.now();
            return true;
        }
        return false;
    }

    recordQuestionTime() {
        if (this.questionStartTime) {
            this.questionTimes[this.currentQuestion] += Math.floor((Date.now() - this.questionStartTime) / 1000);
        }
    }

    getAnsweredCount() {
        return this.userAnswers.filter(a => a !== null).length;
    }

    getRemainingCount() {
        return this.userAnswers.length - this.getAnsweredCount();
    }

    getBookmarkedCount() {
        return this.bookmarkedQuestions.filter(b => b).length;
    }

    getUnansweredCount() {
        return this.userAnswers.filter(a => a === null).length;
    }

    getCurrentAnswer() {
        return this.userAnswers[this.currentQuestion];
    }

    isCurrentBookmarked() {
        return this.bookmarkedQuestions[this.currentQuestion];
    }

    isLastQuestion() {
        return this.currentQuestion === this.userAnswers.length - 1;
    }

    isFirstQuestion() {
        return this.currentQuestion === 0;
    }

    getTotalTime() {
        return Math.floor((Date.now() - this.startTime) / 1000);
    }

    setFilter(filter) {
        this.currentFilter = filter;
    }
}