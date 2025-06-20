document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const level = params.get('level');
    const subject = params.get('subject');

    const subjectTitleElement = document.getElementById('subject-title');
    const cfaLevelDisplayElement = document.getElementById('cfa-level-display');
    const explanationLink = document.getElementById('explanation-link');
    const flashcardsLink = document.getElementById('flashcards-link');
    const quizzesLink = document.getElementById('quizzes-link');

    if (level && subject) {
        subjectTitleElement.textContent = `${decodeURIComponent(subject)}`;
        cfaLevelDisplayElement.textContent = level;

        // Set up links for the action buttons
        explanationLink.href = `explanation.html?level=${level}&subject=${encodeURIComponent(subject)}`;
        flashcardsLink.href = `flashcards.html?level=${level}&subject=${encodeURIComponent(subject)}`;
        quizzesLink.href = `quizzes.html?level=${level}&subject=${encodeURIComponent(subject)}`;

        document.title = `CFA Level ${level} - ${decodeURIComponent(subject)}`;

    } else {
        subjectTitleElement.textContent = "Subject Not Found";
        cfaLevelDisplayElement.textContent = "N/A";
        // Optionally hide or disable buttons if no subject is found
        explanationLink.style.display = 'none';
        flashcardsLink.style.display = 'none';
        quizzesLink.style.display = 'none';
    }
});