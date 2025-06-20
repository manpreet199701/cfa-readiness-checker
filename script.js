// --- Configuration (Dynamic based on CFA Level) ---
const CFA_LEVEL_DATA = {
    "I": {
        RECOMMENDED_TIME_HOURS: 300,
        RECOMMENDED_PRACTICE_QUESTIONS: 2000,
        TARGET_PROFICIENCY_SCORE: 70, // Minimum for "Good"
        PROFICIENCY_MODERATE_THRESHOLD: 60,
        TARGET_PROGRESS_PERCENT: 100, // Ideal
        READY_PROGRESS_THRESHOLD: 90, // Minimum for "Ready" status
        TARGET_SUBJECT_COMPLETION_PERCENT: 90 // Target percentage of subjects with both F/Q completed
    },
    "II": {
        RECOMMENDED_TIME_HOURS: 320,
        RECOMMENDED_PRACTICE_QUESTIONS: 2500,
        TARGET_PROFICIENCY_SCORE: 70,
        PROFICIENCY_MODERATE_THRESHOLD: 60,
        TARGET_PROGRESS_PERCENT: 100,
        READY_PROGRESS_THRESHOLD: 90,
        TARGET_SUBJECT_COMPLETION_PERCENT: 90
    },
    "III": {
        RECOMMENDED_TIME_HOURS: 350,
        RECOMMENDED_PRACTICE_QUESTIONS: 3000,
        TARGET_PROFICIENCY_SCORE: 75, // Often higher for Level III
        PROFICIENCY_MODERATE_THRESHOLD: 65,
        TARGET_PROGRESS_PERCENT: 100,
        READY_PROGRESS_THRESHOLD: 90,
        TARGET_SUBJECT_COMPLETION_PERCENT: 95 // Higher for Level III
    }
};

const CFA_LEVEL_SUBJECTS_MASTER = {
    "I": [
        { name: "Ethical and Professional Standards", flashcards: false, quizzes: false },
        { name: "Quantitative Methods", flashcards: false, quizzes: false },
        { name: "Economics", flashcards: false, quizzes: false },
        { name: "Financial Statement Analysis", flashcards: false, quizzes: false },
        { name: "Corporate Issuers", flashcards: false, quizzes: false },
        { name: "Equity Investments", flashcards: false, quizzes: false },
        { name: "Fixed Income", flashcards: false, quizzes: false },
        { name: "Derivatives", flashcards: false, quizzes: false },
        { name: "Alternative Investments", flashcards: false, quizzes: false },
        { name: "Portfolio Management and Wealth Management", flashcards: false, quizzes: false },
    ],
    "II": [
        { name: "Ethical and Professional Standards", flashcards: false, quizzes: false },
        { name: "Quantitative Methods for Valuations", flashcards: false, quizzes: false },
        { name: "Economics for Valuation", flashcards: false, quizzes: false },
        { name: "Financial Statement Analysis for Valuation", flashcards: false, quizzes: false },
        { name: "Corporate Issuers for Valuation", flashcards: false, quizzes: false },
        { name: "Equity Valuation", flashcards: false, quizzes: false },
        { name: "Fixed Income Valuation", flashcards: false, quizzes: false },
        { name: "Derivatives and Risk Management", flashcards: false, quizzes: false },
        { name: "Alternative Investments", flashcards: false, quizzes: false },
        { name: "Portfolio Management", flashcards: false, quizzes: false },
    ],
    "III": [
        { name: "Ethical and Professional Standards", flashcards: false, quizzes: false },
        { name: "Behavioral Finance", flashcards: false, quizzes: false },
        { name: "Private Wealth Management", flashcards: false, quizzes: false },
        { name: "Institutional Investors", flashcards: false, quizzes: false },
        { name: "Risk Management", flashcards: false, quizzes: false },
        { name: "Asset Allocation", flashcards: false, quizzes: false },
        { name: "Fixed Income and Derivatives Strategies", flashcards: false, quizzes: false },
        { name: "Equity Strategies", flashcards: false, quizzes: false },
        { name: "Alternative Investments Strategies", flashcards: false, quizzes: false },
        { name: "Portfolio Management and Performance Evaluation", flashcards: false, quizzes: false },
    ]
};

// --- DOM Elements ---
const cfaLevelSelect = document.getElementById('cfaLevel');

const timeInput = document.getElementById('time-input');
const timeGaugeBar = document.getElementById('time-gauge-bar');
const timeFeedbackText = document.getElementById('time-feedback-text');
const checkpointTime = document.getElementById('checkpoint-time');

const progressInput = document.getElementById('progress-input');
const progressBarFill = document.getElementById('progress-bar-fill');
const progressFeedbackText = document.getElementById('progress-feedback-text');
const checkpointProgress = document.getElementById('checkpoint-progress');

const practiceInput = document.getElementById('practice-input');
const practiceFeedbackText = document.getElementById('practice-feedback-text');
const practiceMessage = document.getElementById('practice-message');
const checkpointPractice = document.getElementById('checkpoint-practice');

const proficiencyInput = document.getElementById('proficiency-input');
const proficiencyStatus = document.getElementById('proficiency-status');
const proficiencyScoreText = document.getElementById('proficiency-score-text');
const checkpointProficiency = document.getElementById('checkpoint-proficiency');

const subjectListContainer = document.getElementById('subject-list-container');
const subjectCompletionFeedback = document.getElementById('subject-completion-feedback');
const checkpointSubjects = document.getElementById('checkpoint-subjects');

const overallAssessment = document.getElementById('overall-assessment');
const assessmentStatus = document.getElementById('assessment-status');
const assessmentDetails = document.getElementById('assessment-details');

const resetButton = document.getElementById('reset-button');

// LLM Feature DOM Elements (Study Tip only on main page)
const generateTipButton = document.getElementById('generateTipButton');
const studyTipOutput = document.getElementById('studyTipOutput');


// --- Global State ---
let currentCfaLevel = 'I'; // Default to Level I
let currentCfaLevelData = CFA_LEVEL_DATA[currentCfaLevel];
let subjects = []; // This will hold the current level's subjects with their checked status

// --- Backend Proxy URL for Study Tips (IMPORTANT: REPLACE WITH YOUR DEPLOYED BACKEND URL) ---
const AI_BACKEND_URL_STUDY_TIP = 'YOUR_DEPLOYED_BACKEND_URL/api/generate-study-tip';


// --- Helper Functions ---

/**
 * Parses markdown text into HTML. Requires marked.js to be loaded.
 * @param {string} markdownText
 * @returns {Promise<string>}
 */
async function parseMarkdownToHtml(markdownText) {
    if (typeof marked === 'undefined') {
        console.error("Marked.js library not loaded. Please include <script src='https://cdn.jsdelivr.net/npm/marked/marked.min.js'></script> in your HTML.");
        return markdownText; // Return original text if marked.js is not available
    }
    return marked.parse(markdownText);
}

// Function for parsing errors (retained from previous version)
function parseError(error) {
    if (typeof error === 'object' && error !== null) {
        if (error.details) return error.details;
        if (error.error) return error.error;
        if (error.message) return error.message;
    }
    return String(error);
}


// --- Core Logic Functions (remain largely the same) ---

function updateTimeGauge() {
    const timeSpent = parseInt(timeInput.value) || 0;
    const recommendedTime = currentCfaLevelData.RECOMMENDED_TIME_HOURS;
    let percentage = (timeSpent / recommendedTime) * 100;
    percentage = Math.min(100, Math.max(0, percentage)); // Cap between 0 and 100

    timeGaugeBar.style.width = percentage + '%';
    if (percentage >= 100) {
        timeGaugeBar.style.backgroundColor = 'var(--success-color)'; // Green if met
        timeGaugeBar.style.background = 'var(--success-color)'; // Ensure gradient is overridden
        checkpointTime.classList.add('met');
    } else if (percentage >= 50) {
        timeGaugeBar.style.backgroundPosition = '0% 0'; // Move gradient to show more green/yellow
        timeGaugeBar.style.backgroundColor = ''; // Reset background-color for gradient
        checkpointTime.classList.remove('met');
    } else {
        timeGaugeBar.style.backgroundPosition = '100% 0'; // Keep gradient showing more red/yellow
        timeGaugeBar.style.backgroundColor = ''; // Reset background-color for gradient
        checkpointTime.classList.remove('met');
    }

    timeFeedbackText.textContent = `${timeSpent} / ${recommendedTime} hours recommended`;
}

function updateProgressBar() {
    const progress = parseInt(progressInput.value) || 0;
    let displayProgress = Math.min(100, Math.max(0, progress)); // Cap between 0 and 100

    progressBarFill.style.width = displayProgress + '%';
    progressBarFill.textContent = `${displayProgress}%`;
    progressFeedbackText.textContent = `${displayProgress}% of curriculum completed`;

    if (displayProgress >= currentCfaLevelData.READY_PROGRESS_THRESHOLD) {
        checkpointProgress.classList.add('met');
    } else {
        checkpointProgress.classList.remove('met');
    }
}

function updatePracticeCounter() {
    const questionsAttempted = parseInt(practiceInput.value) || 0;
    const recommendedQuestions = currentCfaLevelData.RECOMMENDED_PRACTICE_QUESTIONS;

    practiceFeedbackText.textContent = `${questionsAttempted} / ${recommendedQuestions} questions recommended`;

    if (questionsAttempted >= recommendedQuestions) {
        practiceMessage.textContent = "Excellent! You've put in solid practice.";
        practiceMessage.style.color = 'var(--success-color)';
        checkpointPractice.classList.add('met');
    } else if (questionsAttempted >= recommendedQuestions * 0.75) {
        practiceMessage.textContent = "Good progress! Keep pushing for more questions.";
        practiceMessage.style.color = 'var(--warning-color)';
        checkpointPractice.classList.remove('met');
    } else {
        practiceMessage.textContent = "More practice will significantly boost your readiness.";
        practiceMessage.style.color = 'var(--danger-color)';
        checkpointPractice.classList.remove('met');
    }
}

function updateProficiencyStatus() {
    const score = parseInt(proficiencyInput.value) || 0;
    const targetScore = currentCfaLevelData.TARGET_PROFICIENCY_SCORE;
    const moderateThreshold = currentCfaLevelData.PROFICIENCY_MODERATE_THRESHOLD;

    proficiencyScoreText.textContent = `Average Score: ${score}%`;
    proficiencyStatus.textContent = "Enter score"; // Reset default text

    proficiencyStatus.classList.remove('proficiency-low', 'proficiency-moderate', 'proficiency-good');
    if (score >= targetScore) {
        proficiencyStatus.textContent = "Good Proficiency";
        proficiencyStatus.classList.add('proficiency-good');
        checkpointProficiency.classList.add('met');
    } else if (score >= moderateThreshold) {
        proficiencyStatus.textContent = "Moderate Proficiency";
        proficiencyStatus.classList.add('proficiency-moderate');
        checkpointProficiency.classList.remove('met');
    } else if (score > 0) {
        proficiencyStatus.textContent = "Low Proficiency";
        proficiencyStatus.classList.add('proficiency-low');
        checkpointProficiency.classList.remove('met');
    } else {
        proficiencyStatus.textContent = "Enter score";
        checkpointProficiency.classList.remove('met');
    }
}

function renderSubjects() {
    subjectListContainer.innerHTML = ''; // Clear previous subjects
    subjects.forEach((subject, index) => {
        const subjectItem = document.createElement('div');
        subjectItem.className = 'subject-item';

        const h3 = document.createElement('h3');
        // Make the subject name a link to the detail page
        const subjectLink = document.createElement('a');
        subjectLink.href = `subject-detail.html?level=${currentCfaLevel}&subject=${encodeURIComponent(subject.name)}`;
        subjectLink.textContent = subject.name;
        h3.append(subjectLink);
        subjectItem.append(h3);

        const checkboxesDiv = document.createElement('div');
        checkboxesDiv.className = 'subject-checkboxes';

        const flashcardsLabel = document.createElement('label');
        const flashcardsCheckbox = document.createElement('input');
        flashcardsCheckbox.type = 'checkbox';
        flashcardsCheckbox.checked = subject.flashcards;
        flashcardsCheckbox.dataset.index = index;
        flashcardsCheckbox.dataset.type = 'flashcards';
        flashcardsCheckbox.addEventListener('change', updateReadiness);
        flashcardsLabel.append(flashcardsCheckbox, ' Flashcards Done');
        checkboxesDiv.append(flashcardsLabel);

        const quizzesLabel = document.createElement('label');
        const quizzesCheckbox = document.createElement('input');
        quizzesCheckbox.type = 'checkbox';
        quizzesCheckbox.checked = subject.quizzes;
        quizzesCheckbox.dataset.index = index;
        quizzesCheckbox.dataset.type = 'quizzes';
        quizzesCheckbox.addEventListener('change', updateReadiness);
        quizzesLabel.append(quizzesCheckbox, ' Quizzes Done');
        checkboxesDiv.append(quizzesLabel);

        subjectItem.append(checkboxesDiv);

        const statusDiv = document.createElement('div');
        statusDiv.className = 'subject-status';
        updateSubjectStatusText(statusDiv, subject);
        subjectItem.append(statusDiv);

        subjectListContainer.append(subjectItem);
    });
    updateSubjectCompletion();
}

function updateSubjectStatusText(statusDiv, subject) {
    if (subject.flashcards && subject.quizzes) {
        statusDiv.textContent = 'Completed!';
        statusDiv.classList.remove('incomplete');
        statusDiv.classList.add('completed');
    } else {
        statusDiv.textContent = 'Incomplete';
        statusDiv.classList.remove('completed');
        statusDiv.classList.add('incomplete');
    }
}

function updateSubjectCompletion() {
    const completedSubjectsCount = subjects.filter(s => s.flashcards && s.quizzes).length;
    const totalSubjects = subjects.length;
    const completionPercentage = totalSubjects > 0 ? (completedSubjectsCount / totalSubjects) * 100 : 0;

    subjectCompletionFeedback.textContent = `You've completed ${completedSubjectsCount} out of ${totalSubjects} subjects (${completionPercentage.toFixed(1)}%).`;

    if (completionPercentage >= currentCfaLevelData.TARGET_SUBJECT_COMPLETION_PERCENT) {
        subjectCompletionFeedback.style.color = 'var(--success-color)';
        checkpointSubjects.classList.add('met');
    } else if (completionPercentage >= currentCfaLevelData.TARGET_SUBJECT_COMPLETION_PERCENT * 0.7) {
        subjectCompletionFeedback.style.color = 'var(--warning-color)';
        checkpointSubjects.classList.remove('met');
    } else {
        subjectCompletionFeedback.style.color = 'var(--danger-color)';
        checkpointSubjects.classList.remove('met');
    }
}

function updateOverallAssessment() {
    const timeMet = checkpointTime.classList.contains('met');
    const progressMet = checkpointProgress.classList.contains('met');
    const practiceMet = checkpointPractice.classList.contains('met');
    const proficiencyMet = checkpointProficiency.classList.contains('met');
    const subjectsMet = checkpointSubjects.classList.contains('met');

    const totalCheckpoints = 5; // T, P, Q, S%, Sub
    let metCount = 0;
    if (timeMet) metCount++;
    if (progressMet) metCount++;
    if (practiceMet) metCount++;
    if (proficiencyMet) metCount++;
    if (subjectsMet) metCount++;

    overallAssessment.classList.remove('ready', 'not-ready');
    assessmentDetails.innerHTML = ''; // Clear previous details

    if (metCount === totalCheckpoints) {
        assessmentStatus.textContent = "🎉 Fully Ready! 🎉";
        overallAssessment.classList.add('ready');
        assessmentDetails.innerHTML = '<p>Congratulations! You\'ve aced all the readiness checkpoints. You\'re in excellent shape for the exam!</p>';
    } else if (metCount >= totalCheckpoints - 1) { // 4 out of 5
        assessmentStatus.textContent = "Almost There!";
        overallAssessment.classList.add('ready'); // Still leaning towards ready
        assessmentDetails.innerHTML = '<p>You\'re very close to peak readiness! Just a little more focus on the areas below:</p><ul></ul>';
        const ul = assessmentDetails.querySelector('ul');
        if (!timeMet) ul.innerHTML += '<li><strong>Time:</strong> Consider dedicating more hours.</li>';
        if (!progressMet) ul.innerHTML += '<li><strong>Progress:</strong> Aim to cover more curriculum.</li>';
        if (!practiceMet) ul.innerHTML += '<li><strong>Practice:</strong> Attempt more questions.</li>';
        if (!proficiencyMet) ul.innerHTML += '<li><strong>Proficiency:</strong> Work on improving your scores.</li>';
        if (!subjectsMet) ul.innerHTML += '<li><strong>Subjects:</strong> Complete more flashcards/quizzes per subject.</li>';
    }
    else if (metCount >= Math.floor(totalCheckpoints / 2)) { // 3 or more met
        assessmentStatus.textContent = "Making Progress!";
        overallAssessment.classList.add('not-ready'); // Still needs work
        assessmentDetails.innerHTML = '<p>You\'re on the right track, but there\'s room for improvement. Focus on these areas:</p><ul></ul>';
        const ul = assessmentDetails.querySelector('ul');
        if (!timeMet) ul.innerHTML += '<li><strong>Time:</strong> Dedicate more study hours.</li>';
        if (!progressMet) ul.innerHTML += '<li><strong>Progress:</strong> Complete more of the curriculum.</li>';
        if (!practiceMet) ul.innerHTML += '<li><strong>Practice:</strong> Increase your question count.</li>';
        if (!proficiencyMet) ul.innerHTML += '<li><strong>Proficiency:</strong> Improve your exam scores.</li>';
        if (!subjectsMet) ul.innerHTML += '<li><strong>Subjects:</strong> Finish subject-wise reviews.</li>';
    }
    else {
        assessmentStatus.textContent = "Needs More Work";
        overallAssessment.classList.add('not-ready');
        assessmentDetails.innerHTML = '<p>You have significant ground to cover. Prioritize these areas:</p><ul></ul>';
        const ul = assessmentDetails.querySelector('ul');
        if (!timeMet) ul.innerHTML += '<li><strong>Time:</strong> Start dedicating consistent study hours.</li>';
        if (!progressMet) ul.innerHTML += '<li><strong>Progress:</strong> Focus on covering the core curriculum.</li>';
        if (!practiceMet) ul.innerHTML += '<li><strong>Practice:</strong> Begin practicing questions regularly.</li>';
        if (!proficiencyMet) ul.innerHTML += '<li><strong>Proficiency:</strong> Understand fundamental concepts.</li>';
        if (!subjectsMet) ul.innerHTML += '<li><strong>Subjects:</strong> Systematically work through subjects.</li>';
    }
}


function updateReadiness(event) {
    // If called from a checkbox change, update the subject data
    if (event && event.target && event.target.dataset.index !== undefined) {
        const index = parseInt(event.target.dataset.index);
        const type = event.target.dataset.type;
        subjects[index][type] = event.target.checked;

        // Update the status text for the specific subject item
        const subjectItem = event.target.closest('.subject-item');
        if (subjectItem) {
            const statusDiv = subjectItem.querySelector('.subject-status');
            updateSubjectStatusText(statusDiv, subjects[index]);
        }
    }

    // Always update all readiness indicators
    updateTimeGauge();
    updateProgressBar();
    updatePracticeCounter();
    updateProficiencyStatus();
    updateSubjectCompletion(); // Re-calculate overall subject completion
    updateOverallAssessment();
    saveProgress();
}

function loadProgress() {
    const savedLevel = localStorage.getItem('cfaLevel');
    if (savedLevel) {
        cfaLevelSelect.value = savedLevel;
        currentCfaLevel = savedLevel;
        currentCfaLevelData = CFA_LEVEL_DATA[currentCfaLevel];
    } else {
        cfaLevelSelect.value = 'I'; // Default
        currentCfaLevel = 'I';
        currentCfaLevelData = CFA_LEVEL_DATA['I'];
    }

    const savedTime = localStorage.getItem('timeSpent');
    if (savedTime) timeInput.value = savedTime;

    const savedProgress = localStorage.getItem('curriculumProgress');
    if (savedProgress) progressInput.value = savedProgress;

    const savedPractice = localStorage.getItem('practiceQuestions');
    if (savedPractice) practiceInput.value = savedPractice;

    const savedProficiency = localStorage.getItem('proficiencyScore');
    if (savedProficiency) proficiencyInput.value = savedProficiency;

    const savedSubjects = localStorage.getItem('cfaSubjects');
    if (savedSubjects) {
        // Ensure subjects are re-mapped to the current level if the level changed
        const parsedSubjects = JSON.parse(savedSubjects);
        if (parsedSubjects.length === CFA_LEVEL_SUBJECTS_MASTER[currentCfaLevel].length &&
            parsedSubjects.every((s, i) => s.name === CFA_LEVEL_SUBJECTS_MASTER[currentCfaLevel][i].name)) {
            subjects = parsedSubjects;
        } else {
            // If saved subjects don't match the current level, initialize from master
            subjects = JSON.parse(JSON.stringify(CFA_LEVEL_SUBJECTS_MASTER[currentCfaLevel]));
        }
    } else {
        // Initialize subjects for the current level if no saved data
        subjects = JSON.parse(JSON.stringify(CFA_LEVEL_SUBJECTS_MASTER[currentCfaLevel]));
    }
    renderSubjects(); // Render subjects after loading or initializing

    updateReadiness(); // Initial calculation and display update
}

function saveProgress() {
    localStorage.setItem('cfaLevel', cfaLevelSelect.value);
    localStorage.setItem('timeSpent', timeInput.value);
    localStorage.setItem('curriculumProgress', progressInput.value);
    localStorage.setItem('practiceQuestions', practiceInput.value);
    localStorage.setItem('proficiencyScore', proficiencyInput.value);
    localStorage.setItem('cfaSubjects', JSON.stringify(subjects));
}

function resetAll() {
    if (confirm('Are you sure you want to reset all your progress?')) {
        localStorage.clear();
        cfaLevelSelect.value = 'I';
        timeInput.value = '';
        progressInput.value = '';
        practiceInput.value = '';
        proficiencyInput.value = '';

        // Reset subjects to default for Level I
        currentCfaLevel = 'I';
        currentCfaLevelData = CFA_LEVEL_DATA['I'];
        subjects = JSON.parse(JSON.stringify(CFA_LEVEL_SUBJECTS_MASTER['I']));
        renderSubjects(); // Re-render default subjects

        updateReadiness(); // Update UI after reset
        alert('All progress has been reset!');
    }
}


// --- LLM Study Tip Function (remains on main page) ---

/**
 * Calls the backend to generate a personalized study tip.
 */
async function generateStudyTip() {
    if (AI_BACKEND_URL_STUDY_TIP.includes('YOUR_DEPLOYED_BACKEND_URL')) {
        alert("Please set up your AI_BACKEND_URL_STUDY_TIP in script.js to your deployed backend for study tips.");
        studyTipOutput.innerHTML = "Backend URL not set for study tips.";
        return;
    }

    studyTipOutput.innerHTML = 'Generating personalized tip...';
    studyTipOutput.classList.add('loading');
    generateTipButton.disabled = true;

    const currentLevel = cfaLevelSelect.value;
    const timeSpent = parseInt(timeInput.value) || 0;
    const progress = parseInt(progressInput.value) || 0;
    const questionsAttempted = parseInt(practiceInput.value) || 0;
    const proficiencyScore = parseInt(proficiencyInput.value) || 0;
    const completedSubjectsCount = subjects.filter(s => s.flashcards && s.quizzes).length;
    const totalSubjects = subjects.length;

    let prompt = `Provide a concise, personalized study tip for a CFA Level ${currentLevel} candidate. `;
    prompt += `Their current stats are: Time Dedicated = ${timeSpent} hours, Curriculum Progress = ${progress}%, Practice Questions = ${questionsAttempted}, Practice Exam Score = ${proficiencyScore}%, Subjects Completed = ${completedSubjectsCount}/${totalSubjects}. `;
    prompt += `Suggest ONE actionable tip based on their current progress and the typical recommendations for Level ${currentLevel}. Keep it direct and encouraging, like a quick thought. No elaborate intros/outros.`;


    try {
        const response = await fetch(AI_BACKEND_URL_STUDY_TIP, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: prompt }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Network response was not ok');
        }

        const data = await response.json(); // Expecting { success: true, tip: "..." }

        studyTipOutput.classList.remove('loading');
        studyTipOutput.innerHTML = await parseMarkdownToHtml(data.tip || "Could not generate tip. Please try again.");

    } catch (e) {
        studyTipOutput.classList.remove('loading');
        studyTipOutput.innerHTML = `Error generating tip: ${parseError(e)}`;
        console.error('Frontend error generating study tip:', e);
    } finally {
        generateTipButton.disabled = false;
    }
}


// --- Event Listeners ---

cfaLevelSelect.addEventListener('change', () => {
    currentCfaLevel = cfaLevelSelect.value;
    currentCfaLevelData = CFA_LEVEL_DATA[currentCfaLevel];
    // When level changes, reset subjects to default for that level
    subjects = JSON.parse(JSON.stringify(CFA_LEVEL_SUBJECTS_MASTER[currentCfaLevel]));
    renderSubjects(); // Re-render with new subjects
    updateReadiness(); // Recalculate based on new level data
});

timeInput.addEventListener('input', updateReadiness);
progressInput.addEventListener('input', updateReadiness);
practiceInput.addEventListener('input', updateReadiness);
proficiencyInput.addEventListener('input', updateReadiness);

resetButton.addEventListener('click', resetAll);

generateTipButton.addEventListener('click', generateStudyTip);


// Initial load
loadProgress();