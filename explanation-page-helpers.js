// explanation-page-helpers.js

/**
 * Parses markdown text into HTML. Requires marked.js to be loaded.
 * @param {string} markdownText
 * @returns {Promise<string>}
 */
export async function parseMarkdownToHtml(markdownText) {
    if (typeof marked === 'undefined') {
        console.error("Marked.js library not loaded. Please include <script src='https://cdn.jsdelivr.net/npm/marked/marked.min.js'></script> in your HTML.");
        return markdownText; // Return original text if marked.js is not available
    }
    return marked.parse(markdownText);
}

/**
 * Adds a new "slide" (text and optional image) to the explanation output.
 * @param {string} textContent - The text content for the slide (can be markdown).
 * @param {HTMLImageElement|null} [imageElement=null] - An optional image element to include.
 */
export async function addSlide(textContent, imageElement = null) {
    const slideContainer = document.getElementById('ai-explanation-output');
    if (!slideContainer) {
        console.error("Slide container not found.");
        return;
    }

    const slideDiv = document.createElement('div');
    slideDiv.className = 'explanation-slide';

    // Parse text as Markdown
    const textHtml = await parseMarkdownToHtml(textContent);
    const textDiv = document.createElement('div');
    textDiv.innerHTML = textHtml;
    slideDiv.appendChild(textDiv);

    if (imageElement) {
        imageElement.className = 'explanation-image';
        slideDiv.appendChild(imageElement);
    }

    slideContainer.appendChild(slideDiv);
}

/**
 * Parses an error object into a user-friendly string.
 * @param {any} error - The error object.
 * @returns {string} - The parsed error message.
 */
export function parseError(error) {
    if (typeof error === 'object' && error !== null) {
        if (error.details) return error.details;
        if (error.error) return error.error;
        if (error.message) return error.message;
    }
    return String(error);
}