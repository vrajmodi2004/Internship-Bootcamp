import { QuizState } from './quizState.js';

describe('QuizState', () => {
    let state;

    beforeEach(() => {
        state = new QuizState(10);
    });

    test('should initialize with correct default values', () => {
        expect(state.currentQuestion).toBe(0);
        expect(state.score).toBe(0);
        expect(state.userAnswers).toHaveLength(10);
    });

    test('should select answer for current question', () => {
        state.selectAnswer(2);
        expect(state.userAnswers[0]).toBe(2);
    });

    test('should toggle bookmark status', () => {
        const result1 = state.toggleBookmark();
        expect(result1).toBe(true);
        const result2 = state.toggleBookmark();
        expect(result2).toBe(false);
    });

    test('should move to next question', () => {
        state.startQuiz();
        const result = state.nextQuestion();
        expect(result).toBe(true);
        expect(state.currentQuestion).toBe(1);
    });

    test('should return correct answered count', () => {
        state.userAnswers[0] = 2;
        state.userAnswers[1] = 1;
        expect(state.getAnsweredCount()).toBe(2);
    });

    test('should check if last question', () => {
        state.currentQuestion = 9;
        expect(state.isLastQuestion()).toBe(true);
    });
});