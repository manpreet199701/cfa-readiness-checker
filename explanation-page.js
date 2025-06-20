document.addEventListener('DOMContentLoaded', async () => {
    // --- DOM Elements ---
    const explanationTitleElement = document.getElementById('explanation-title');
    const cfaLevelDisplayElement = document.getElementById('cfa-level-display');
    const aiExplanationOutput = document.getElementById('ai-explanation-output');
    const aiError = document.getElementById('ai-error');
    const backToSubjectDetailButton = document.getElementById('back-to-subject-detail');

    // --- Backend Proxy URL (IMPORTANT: REPLACE WITH YOUR DEPLOYED BACKEND URL) ---
    // Example: 'https://your-backend-proxy.onrender.com/api/explain-cfa-topic'
    const AI_BACKEND_URL_EXPLAIN_TOPIC = 'YOUR_DEPLOYED_BACKEND_URL/api/explain-cfa-topic';

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

    /**
     * Adds a slide (text and/or image) to the AI explanation output.
     * @param {string} text
     * @param {HTMLImageElement|null} image
     */
    async function addSlide(text, image) {
        const slide = document.createElement('div');
        slide.className = 'slide';

        if (text) {
            const caption = document.createElement('div');
            caption.innerHTML = await parseMarkdownToHtml(text);
            slide.append(caption);
        }

        if (image) {
            slide.prepend(image);
        }

        aiExplanationOutput.append(slide);
        aiExplanationOutput.scrollTop = aiExplanationOutput.scrollHeight; // Scroll to bottom
    }

    /**
     * Parses errors from the backend response.
     * @param {any} error
     * @returns {string}
     */
    function parseError(error) {
        if (typeof error === 'object' && error !== null) {
            if (error.details) return error.details;
            if (error.error) return error.error;
            if (error.message) return error.message;
        }
        return String(error);
    }

    // --- Main Logic for Explanation Page ---
    const params = new URLSearchParams(window.location.search);
    const level = params.get('level');
    const subject = params.get('subject');

    if (level && subject) {
        const decodedSubject = decodeURIComponent(subject);
        explanationTitleElement.textContent = `Explanation: ${decodedSubject}`;
        cfaLevelDisplayElement.textContent = level;
        document.title = `CFA Level ${level} - ${decodedSubject} Explanation`;

        // Set the back button link
        backToSubjectDetailButton.href = `subject-detail.html?level=${level}&subject=${encodeURIComponent(subject)}`;

        // Call the AI explanation function
        await explainCFA(decodedSubject);

    } else {
        explanationTitleElement.textContent = "Error: Subject or Level Missing";
        cfaLevelDisplayElement.textContent = "N/A";
        aiExplanationOutput.innerHTML = '<p>Please navigate to this page from a specific subject in the dashboard.</p>';
        backToSubjectDetailButton.style.display = 'none'; // Hide back button if context is missing
        return;
    }

    /**
     * Calls the backend to explain a specific CFA topic.
     * @param {string} topic - The CFA topic to explain.
     */
    async function explainCFA(topic) {
        if (AI_BACKEND_URL_EXPLAIN_TOPIC.includes('YOUR_DEPLOYED_BACKEND_URL')) {
            aiExplanationOutput.innerHTML = '<p class="loading" style="color: var(--danger-color);">Please set up your AI_BACKEND_URL_EXPLAIN_TOPIC in explanation-page.js to your deployed backend for topic explanations.</p>';
            return;
        }

        // Show loading state
        aiExplanationOutput.innerHTML = '<p class="loading">Generating explanation with illustrations...</p>';
        aiExplanationOutput.classList.add('loading');
        aiError.toggleAttribute('hidden', true);

        try {
            const response = await fetch(AI_BACKEND_URL_EXPLAIN_TOPIC, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ topic: topic }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Network response was not ok');
            }

            const data = await response.json(); // This contains { success: true, content: [] }

            aiExplanationOutput.innerHTML = ''; // Clear loading message
            aiExplanationOutput.classList.remove('loading');

            if (data.content && data.content.length > 0) {
                let currentText = '';
                let currentImage = null;

                for (const part of data.content) {
                    if (part.type === 'text') {
                        currentText += part.value;
                    } else if (part.type === 'image') {
                        currentImage = document.createElement('img');
                        currentImage.src = `data:image/png;base64,` + part.value;
                    }

                    // If we have both text and an image, or just text and it's the last part, add the slide
                    if ((currentText && currentImage) || (currentText && part === data.content[data.content.length - 1] && !currentImage)) {
                        await addSlide(currentText, currentImage);
                        currentText = '';
                        currentImage = null;
                    }
                }
            } else {
                aiExplanationOutput.innerHTML = 'No detailed explanation generated for this topic.';
            }

        } catch (e) {
            const msg = parseError(e);
            aiError.innerHTML = `Something went wrong: ${msg}`;
            aiError.removeAttribute('hidden');
            aiExplanationOutput.innerHTML = ''; // Clear output on error
            aiExplanationOutput.classList.remove('loading');
            console.error('Frontend error during AI topic explanation:', e);
        }
    }
});