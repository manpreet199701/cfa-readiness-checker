// This import statement MUST be the FIRST THING in the file, at the top-level scope.
import { parseMarkdownToHtml, addSlide, parseError } from './explanation-page-helpers.js';

document.addEventListener('DOMContentLoaded', async () => {
    // --- DOM Elements ---
    const explanationTitleElement = document.getElementById('explanation-title');
    const cfaLevelDisplayElement = document.getElementById('cfa-level-display');
    const aiExplanationOutput = document.getElementById('ai-explanation-output');
    const aiError = document.getElementById('ai-error');
    const backToSubjectDetailButton = document.getElementById('back-to-subject-detail');

    // --- Initial setup of elements ---
    // These lines are now correctly placed AFTER the DOM elements have been found.
    if (aiError) aiError.setAttribute('hidden', true);
    if (aiExplanationOutput) {
        aiExplanationOutput.innerHTML = '';
        aiExplanationOutput.classList.remove('loading');
    }
    if (backToSubjectDetailButton) backToSubjectDetailButton.style.display = 'inline-block';
    if (explanationTitleElement) explanationTitleElement.textContent = "Loading Explanation...";
    document.title = "CFA Explanation Page";

    // --- Backend Proxy URL ---
    const AI_BACKEND_URL_EXPLAIN_TOPIC = 'http://localhost:3000/api/explain-cfa-topic';

    // --- fetchStaticExplanation Function ---
    async function fetchStaticExplanation(level, subject) {
        const encodedSubject = encodeURIComponent(subject);
        const filePath = `explanations/level-${level}/${encodedSubject}.md`;

        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("STATIC_FILE_NOT_FOUND");
                }
                throw new Error(`Failed to fetch static explanation: ${response.statusText}`);
            }
            const markdownContent = await response.text();
            return { type: 'static', content: markdownContent };
        } catch (error) {
            console.warn(`Could not load static explanation for ${subject}:`, error.message);
            throw error;
        }
    }

    // --- Main Logic for Explanation Page ---
    const params = new URLSearchParams(window.location.search);
    const level = params.get('level');
    const subject = params.get('subject');

    if (level && subject) {
        const decodedSubject = decodeURIComponent(subject);
        if (explanationTitleElement) explanationTitleElement.textContent = `Explanation: ${decodedSubject}`;
        if (cfaLevelDisplayElement) cfaLevelDisplayElement.textContent = level;
        document.title = `CFA Level ${level} - ${decodedSubject} Explanation`;

        if (backToSubjectDetailButton) {
            backToSubjectDetailButton.href = `subject-detail.html?level=${level}&subject=${encodeURIComponent(subject)}`;
        }

        await getExplanationContent(level, decodedSubject);

    } else {
        if (explanationTitleElement) explanationTitleElement.textContent = "Error: Subject or Level Missing";
        if (cfaLevelDisplayElement) cfaLevelDisplayElement.textContent = "N/A";
        if (aiExplanationOutput) aiExplanationOutput.innerHTML = '<p>Please navigate to this page from a specific subject in the dashboard.</p>';
        if (backToSubjectDetailButton) backToSubjectDetailButton.style.display = 'none';
        return;
    }

    // --- getExplanationContent Function ---
    async function getExplanationContent(level, topic) {
        if (aiExplanationOutput) {
            aiExplanationOutput.innerHTML = '<p class="loading">Loading explanation...</p>';
            aiExplanationOutput.classList.add('loading');
        }
        if (aiError) aiError.toggleAttribute('hidden', true);

        try {
            const staticResult = await fetchStaticExplanation(level, topic);
            if (aiExplanationOutput) {
                aiExplanationOutput.innerHTML = '';
                aiExplanationOutput.classList.remove('loading');
                aiExplanationOutput.innerHTML = await parseMarkdownToHtml(staticResult.content);
            }

        } catch (staticError) {
            if (staticError.message === "STATIC_FILE_NOT_FOUND" || !String(staticError).includes("Failed to fetch")) {
                console.info(`Static explanation not found for ${topic}. Falling back to AI generation.`);
                await explainCFA(topic);
            } else {
                const msg = parseError(staticError);
                if (aiError) {
                    aiError.innerHTML = `Error loading explanation: ${msg}`;
                    aiError.removeAttribute('hidden');
                }
                if (aiExplanationOutput) {
                    aiExplanationOutput.innerHTML = '<p class="loading" style="color: var(--danger-color);">Error loading static explanation.</p>';
                    aiExplanationOutput.classList.remove('loading');
                }
                console.error('Frontend error loading static explanation:', staticError);
            }
        }
    }

    // --- explainCFA Function ---
    async function explainCFA(topic) {
        if (AI_BACKEND_URL_EXPLAIN_TOPIC.includes('YOUR_DEPLOYED_BACKEND_URL')) {
            if (aiExplanationOutput) {
                aiExplanationOutput.innerHTML = '<p class="loading" style="color: var(--danger-color);">Please set up your AI_BACKEND_URL_EXPLAIN_TOPIC in explanation-page.js to your deployed backend for topic explanations.</p>';
            }
            return;
        }

        if (aiExplanationOutput) {
            aiExplanationOutput.innerHTML = '<p class="loading">Generating explanation with AI illustrations...</p>';
            aiExplanationOutput.classList.add('loading');
        }
        if (aiError) aiError.toggleAttribute('hidden', true);

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

            const data = await response.json();

            if (aiExplanationOutput) {
                aiExplanationOutput.innerHTML = '';
                aiExplanationOutput.classList.remove('loading');
            }

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

                    if ((currentText && currentImage) || (currentText && part === data.content[data.content.length - 1] && !currentImage)) {
                        await addSlide(currentText, currentImage);
                        currentText = '';
                        currentImage = null;
                    }
                }
            } else {
                if (aiExplanationOutput) aiExplanationOutput.innerHTML = 'No detailed explanation generated for this topic.';
            }

        } catch (e) {
            const msg = parseError(e);
            if (aiError) {
                aiError.innerHTML = `Something went wrong with AI generation: ${msg}`;
                aiError.removeAttribute('hidden');
            }
            if (aiExplanationOutput) {
                aiExplanationOutput.innerHTML = '';
                aiExplanationOutput.classList.remove('loading');
            }
            console.error('Frontend error during AI topic explanation:', e);
        }
    }
});
