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

describe('calculateScore', () => {
    const mockQuestions = [
        { correct: 2 },
        { correct: 1 },
        { correct: 0 },
        { correct: 3 }
    ];

    test('should calculate correct score with all correct answers', () => {
        const userAnswers = [2, 1, 0, 3];
        expect(calculateScore(userAnswers, mockQuestions)).toBe(4);
    });

    test('should calculate correct score with some correct answers', () => {
        const userAnswers = [2, 1, 1, 3];
        expect(calculateScore(userAnswers, mockQuestions)).toBe(3);
    });

    test('should calculate correct score with no correct answers', () => {
        const userAnswers = [0, 0, 1, 0];
        expect(calculateScore(userAnswers, mockQuestions)).toBe(0);
    });

    test('should handle null answers (skipped)', () => {
        const userAnswers = [2, null, 0, null];
        expect(calculateScore(userAnswers, mockQuestions)).toBe(2);
    });
});

describe('getPerformanceGrade', () => {
    test('should return A+ for 90-100%', () => {
        expect(getPerformanceGrade(90)).toBe('A+');
        expect(getPerformanceGrade(95)).toBe('A+');
        expect(getPerformanceGrade(100)).toBe('A+');
    });

    test('should return A for 80-89%', () => {
        expect(getPerformanceGrade(80)).toBe('A');
        expect(getPerformanceGrade(85)).toBe('A');
        expect(getPerformanceGrade(89)).toBe('A');
    });

    test('should return B for 70-79%', () => {
        expect(getPerformanceGrade(70)).toBe('B');
        expect(getPerformanceGrade(75)).toBe('B');
        expect(getPerformanceGrade(79)).toBe('B');
    });

    test('should return C for 60-69%', () => {
        expect(getPerformanceGrade(60)).toBe('C');
        expect(getPerformanceGrade(65)).toBe('C');
    });

    test('should return D for 50-59%', () => {
        expect(getPerformanceGrade(50)).toBe('D');
        expect(getPerformanceGrade(55)).toBe('D');
    });

    test('should return F for below 50%', () => {
        expect(getPerformanceGrade(49)).toBe('F');
        expect(getPerformanceGrade(0)).toBe('F');
    });
});

describe('getPerformanceMessage', () => {
    test('should return excellent message for 90+%', () => {
        const message = getPerformanceMessage(90);
        expect(message).toContain('Outstanding performance');
    });

    test('should return good message for 70-89%', () => {
        const message = getPerformanceMessage(75);
        expect(message).toContain('Good work');
    });

    test('should return fair message for 50-69%', () => {
        const message = getPerformanceMessage(55);
        expect(message).toContain('Fair attempt');
    });

    test('should return poor message for below 50%', () => {
        const message = getPerformanceMessage(40);
        expect(message).toContain('thorough review');
    });
});

describe('getStrengthWeakness', () => {
    test('should return excellent analysis for 90+%', () => {
        const result = getStrengthWeakness(90);
        expect(result.strengths).toHaveLength(2);
        expect(result.weaknesses).toHaveLength(0);
        expect(result.strengths).toContain('Exceptional knowledge retention');
    });

    test('should return good analysis for 70-89%', () => {
        const result = getStrengthWeakness(75);
        expect(result.strengths).toHaveLength(1);
        expect(result.weaknesses).toHaveLength(1);
    });

    test('should return fair analysis for 50-69%', () => {
        const result = getStrengthWeakness(55);
        expect(result.strengths).toHaveLength(1);
        expect(result.weaknesses).toHaveLength(1);
    });

    test('should return poor analysis for below 50%', () => {
        const result = getStrengthWeakness(40);
        expect(result.strengths).toHaveLength(0);
        expect(result.weaknesses).toHaveLength(2);
    });
});

describe('calculatePercentage', () => {
    test('should calculate correct percentage', () => {
        expect(calculatePercentage(8, 10)).toBe(80);
        expect(calculatePercentage(5, 10)).toBe(50);
        expect(calculatePercentage(10, 10)).toBe(100);
        expect(calculatePercentage(0, 10)).toBe(0);
    });

    test('should round to nearest integer', () => {
        expect(calculatePercentage(7, 10)).toBe(70);
        expect(calculatePercentage(3, 10)).toBe(30);
    });
});

describe('formatTime', () => {
    test('should format time in seconds', () => {
        expect(formatTime(45)).toBe('45s');
        expect(formatTime(60)).toBe('60s');
        expect(formatTime(0)).toBe('0s');
    });
});

describe('countAnswerTypes', () => {
    const mockQuestions = [
        { correct: 2 },
        { correct: 1 },
        { correct: 0 },
        { correct: 3 },
        { correct: 1 }
    ];

    test('should count all answer types correctly', () => {
        const userAnswers = [2, 1, 1, null, null];
        const result = countAnswerTypes(userAnswers, mockQuestions);
        
        expect(result.correct).toBe(2);
        expect(result.wrong).toBe(1);
        expect(result.skipped).toBe(2);
    });

    test('should handle all correct answers', () => {
        const userAnswers = [2, 1, 0, 3, 1];
        const result = countAnswerTypes(userAnswers, mockQuestions);
        
        expect(result.correct).toBe(5);
        expect(result.wrong).toBe(0);
        expect(result.skipped).toBe(0);
    });

    test('should handle all skipped answers', () => {
        const userAnswers = [null, null, null, null, null];
        const result = countAnswerTypes(userAnswers, mockQuestions);
        
        expect(result.correct).toBe(0);
        expect(result.wrong).toBe(0);
        expect(result.skipped).toBe(5);
    });
});

describe('generateOptionLabel', () => {
    test('should generate correct labels', () => {
        expect(generateOptionLabel(0)).toBe('A');
        expect(generateOptionLabel(1)).toBe('B');
        expect(generateOptionLabel(2)).toBe('C');
        expect(generateOptionLabel(3)).toBe('D');
    });
});

describe('createReviewHTML', () => {
    const mockData = {
        question: 'What is 2+2?',
        options: ['2', '3', '4', '5'],
        userAnswer: 2,
        correctAnswer: 2,
        explanation: 'Basic math',
        index: 0
    };

    test('should create HTML for correct answer', () => {
        const html = createReviewHTML(mockData);
        expect(html).toContain('Question 1');
        expect(html).toContain('What is 2+2?');
        expect(html).toContain('review-status correct');
        expect(html).toContain('Basic math');
    });

    test('should create HTML for incorrect answer', () => {
        const data = { ...mockData, userAnswer: 1 };
        const html = createReviewHTML(data);
        expect(html).toContain('review-status incorrect');
        expect(html).toContain('✗ Your Answer');
        expect(html).toContain('✓ Correct Answer');
    });

    test('should create HTML for skipped question', () => {
        const data = { ...mockData, userAnswer: null };
        const html = createReviewHTML(data);
        expect(html).toContain('review-status skipped');
    });

    test('should not include explanation if not provided', () => {
        const data = { ...mockData, explanation: null };
        const html = createReviewHTML(data);
        expect(html).not.toContain('explanation-box');
    });
});