export const calculateScore = (userAnswers, questions) => {
    return userAnswers.reduce((score, answer, idx) => 
        answer === questions[idx].correct ? score + 1 : score, 0
    );
};

export const getPerformanceGrade = (percentage) => {
    const grades = [
        { min: 90, grade: 'A+' },
        { min: 80, grade: 'A' },
        { min: 70, grade: 'B' },
        { min: 60, grade: 'C' },
        { min: 50, grade: 'D' },
        { min: 0, grade: 'F' }
    ];
    
    return grades.find(({ min }) => percentage >= min)?.grade || 'F';
};

export const getPerformanceMessage = (percentage) => {
    const messages = {
        excellent: 'Outstanding performance! You have demonstrated excellent understanding of the subject matter.',
        good: 'Good work! You have a solid grasp of most concepts with room for minor improvements.',
        fair: 'Fair attempt. Consider reviewing the material to strengthen your understanding of key concepts.',
        poor: 'We recommend thorough review of the material. Practice and study will help improve your performance.'
    };

    if (percentage >= 90) return messages.excellent;
    if (percentage >= 70) return messages.good;
    if (percentage >= 50) return messages.fair;
    return messages.poor;
};

export const getStrengthWeakness = (percentage) => {
    const analysis = {
        excellent: {
            strengths: ['Exceptional knowledge retention', 'Strong analytical skills'],
            weaknesses: []
        },
        good: {
            strengths: ['Good overall understanding'],
            weaknesses: ['Review missed topics']
        },
        fair: {
            strengths: ['Basic comprehension'],
            weaknesses: ['Needs focused study']
        },
        poor: {
            strengths: [],
            weaknesses: ['Requires comprehensive review', 'Consider additional resources']
        }
    };

    if (percentage >= 90) return analysis.excellent;
    if (percentage >= 70) return analysis.good;
    if (percentage >= 50) return analysis.fair;
    return analysis.poor;
};

export const calculatePercentage = (score, total) => {
    return Math.round((score / total) * 100);
};

export const formatTime = (seconds) => {
    return `${seconds}s`;
};

export const countAnswerTypes = (userAnswers, questions) => {
    const stats = {
        correct: 0,
        wrong: 0,
        skipped: 0
    };

    userAnswers.forEach((answer, idx) => {
        if (answer === null) {
            stats.skipped++;
        } else if (answer === questions[idx].correct) {
            stats.correct++;
        } else {
            stats.wrong++;
        }
    });

    return stats;
};

export const generateOptionLabel = (index) => {
    return String.fromCharCode(65 + index);
};

export const createReviewHTML = ({ question, options, userAnswer, correctAnswer, explanation, index }) => {
    const isCorrect = userAnswer === correctAnswer;
    const isSkipped = userAnswer === null;
    
    const badge = isSkipped 
        ? '<span class="review-status skipped">Skipped</span>'
        : isCorrect 
            ? '<span class="review-status correct">Correct</span>'
            : '<span class="review-status incorrect">Incorrect</span>';

    const optionsHTML = options.map((opt, oidx) => {
        let cls = 'review-option';
        let lbl = '';

        if (oidx === correctAnswer) {
            cls += ' correct-answer';
            lbl = '<div class="answer-label correct">✓ Correct Answer</div>';
        }

        if (oidx === userAnswer && userAnswer !== correctAnswer) {
            cls += ' wrong-answer';
            lbl = '<div class="answer-label incorrect">✗ Your Answer</div>';
        } else if (oidx === userAnswer && userAnswer === correctAnswer) {
            lbl = '<div class="answer-label correct">✓ Your Answer</div>';
        }

        return `<div class="${cls}">${lbl}<div class="option-content"><strong>${generateOptionLabel(oidx)}.</strong> ${opt}</div></div>`;
    }).join('');

    const expHTML = explanation 
        ? `<div class="explanation-box"><div class="explanation-title">Explanation</div><div class="explanation-text">${explanation}</div></div>`
        : '';

    return `
        <div class="review-item-header">
            <div class="review-question-number">Question ${index + 1}</div>
            ${badge}
        </div>
        <div class="review-question">${question}</div>
        <div class="review-options">${optionsHTML}</div>
        ${expHTML}
    `;
};