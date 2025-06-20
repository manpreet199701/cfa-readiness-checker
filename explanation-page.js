document.addEventListener('DOMContentLoaded', async () => {
    // --- DOM Elements ---
    const explanationTitleElement = document.getElementById('explanation-title'); // <-- This line
    const cfaLevelDisplayElement = document.getElementById('cfa-level-display');
    const aiExplanationOutput = document.getElementById('ai-explanation-output');
    const aiError = document.getElementById('ai-error');
    const backToSubjectDetailButton = document.getElementById('back-to-subject-detail');

    // --- Ensure the AI error element is hidden initially ---
    aiError.setAttribute('hidden', true);
    // --- Ensure the AI explanation output is empty initially ---
    aiExplanationOutput.innerHTML = ''; // Clear any previous content
    aiExplanationOutput.classList.remove('loading'); // Remove loading class if it was set previously
    // --- Ensure the back button is visible ---
    backToSubjectDetailButton.style.display = 'inline-block'; // Show the back button
    // --- Ensure the explanation title is set correctly ---
    explanationTitleElement.textContent = "Loading Explanation..."; // Set initial title
    document.title = "CFA Explanation Page"; // Set initial page title                  
    // --- Import Helper Functions ---
    import { parseMarkdownToHtml, addSlide, parseError } from './explanation-page-helpers.js';
    // --- Import Helper Functions ---                                                                              
    // This file contains the parseMarkdownToHtml, addSlide, and parseError functions
    // which are used to handle Markdown parsing, slide creation, and error formatting.
    import { parseMarkdownToHtml, addSlide, parseError } from './explanation-page-helpers.js';
    // This file contains the parseMarkdownToHtml, addSlide, and parseError functions
    // which are used to handle Markdown parsing, slide creation, and error formatting.
    // --- Import Helper Functions ---
    // This file contains the parseMarkdownToHtml, addSlide, and parseError functions
    // which are used to handle Markdown parsing, slide creation, and error formatting.
    import { parseMarkdownToHtml, addSlide, parseError } from './explanation-page-helpers.js';
    // This file contains the parseMarkdownToHtml, addSlide, and parseError functions
    // which are used to handle Markdown parsing, slide creation, and error formatting.             
    // ... (existing DOM Elements and Helper Functions from explanation-page.js) ...

    // --- Backend Proxy URL (IMPORTANT: REPLACE WITH YOUR DEPLOYED BACKEND URL) ---
    // Example: 'https://your-backend-proxy.onrender.com/api/explain-cfa-topic'
    const AI_BACKEND_URL_EXPLAIN_TOPIC = 'YOUR_DEPLOYED_BACKEND_URL/api/explain-cfa-topic';

    // --- Helper Functions (keep existing parseMarkdownToHtml, addSlide, parseError) ---

    // NEW: Function to fetch static Markdown explanation
    async function fetchStaticExplanation(level, subject) {
        // Encode the subject name to handle spaces and special characters in filenames
        const encodedSubject = encodeURIComponent(subject);
        // Construct the path to your Markdown file
        const filePath = `explanations/level-${level}/${encodedSubject}.md`;

        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                // If file not found (404), throw a specific error to try AI
                if (response.status === 404) {
                    throw new Error("STATIC_FILE_NOT_FOUND");
                }
                throw new Error(`Failed to fetch static explanation: ${response.statusText}`);
            }
            const markdownContent = await response.text();
            return { type: 'static', content: markdownContent };
        } catch (error) {
            console.warn(`Could not load static explanation for ${subject}:`, error.message);
            // Re-throw or return an indication that static content failed
            throw error; // Let the caller decide what to do
        }
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

        // Call the explanation function, now prioritizing static content
        await getExplanationContent(level, decodedSubject);

    } else {
        explanationTitleElement.textContent = "Error: Subject or Level Missing";
        cfaLevelDisplayElement.textContent = "N/A";
        aiExplanationOutput.innerHTML = '<p>Please navigate to this page from a specific subject in the dashboard.</p>';
        backToSubjectDetailButton.style.display = 'none'; // Hide back button if context is missing
        return;
    }

    /**
     * Gets explanation content, prioritizing static Markdown files, then falling back to AI.
     * @param {string} level - The CFA level.
     * @param {string} topic - The CFA topic to explain.
     */
    async function getExplanationContent(level, topic) {
        aiExplanationOutput.innerHTML = '<p class="loading">Loading explanation...</p>';
        aiExplanationOutput.classList.add('loading');
        aiError.toggleAttribute('hidden', true);

        try {
            // First, try to load from a static Markdown file
            const staticResult = await fetchStaticExplanation(level, topic);
            aiExplanationOutput.innerHTML = ''; // Clear loading message
            aiExplanationOutput.classList.remove('loading');
            aiExplanationOutput.innerHTML = await parseMarkdownToHtml(staticResult.content);

        } catch (staticError) {
            // If static content failed (especially a 404), fall back to AI
            if (staticError.message === "STATIC_FILE_NOT_FOUND" || !staticError.message.includes("Failed to fetch")) {
                console.info(`Static explanation not found for ${topic}. Falling back to AI generation.`);
                await explainCFA(topic); // Call the AI function
            } else {
                // For other network/fetch errors with static content, report it
                const msg = parseError(staticError);
                aiError.innerHTML = `Error loading explanation: ${msg}`;
                aiError.removeAttribute('hidden');
                aiExplanationOutput.innerHTML = '<p class="loading" style="color: var(--danger-color);">Error loading static explanation.</p>';
                aiExplanationOutput.classList.remove('loading');
                console.error('Frontend error loading static explanation:', staticError);
            }
        }
    }


    /**
     * Calls the backend to generate a dynamic AI explanation for a specific CFA topic.
     * This function is now only called if a static file is not found.
     * @param {string} topic - The CFA topic to explain.
     */
    async function explainCFA(topic) {
        if (AI_BACKEND_URL_EXPLAIN_TOPIC.includes('YOUR_DEPLOYED_BACKEND_URL')) {
            aiExplanationOutput.innerHTML = '<p class="loading" style="color: var(--danger-color);">Please set up your AI_BACKEND_URL_EXPLAIN_TOPIC in explanation-page.js to your deployed backend for topic explanations.</p>';
            return;
        }

        // Show AI generation loading state
        aiExplanationOutput.innerHTML = '<p class="loading">Generating explanation with AI illustrations...</p>';
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
            aiError.innerHTML = `Something went wrong with AI generation: ${msg}`;
            aiError.removeAttribute('hidden');
            aiExplanationOutput.innerHTML = ''; // Clear output on error
            aiExplanationOutput.classList.remove('loading');
            console.error('Frontend error during AI topic explanation:', e);
        }
    }
});