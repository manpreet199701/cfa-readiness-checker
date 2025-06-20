require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors'); // Import cors
const fetch = require('node-fetch'); // For making API calls from Node.js

const app = express();
const PORT = process.env.PORT || 3000; // Use port provided by hosting, or 3000 locally

// Middleware
app.use(express.json()); // To parse JSON request bodies
app.use(cors()); // Enable CORS for all origins (for development, restrict in production)

// Your AI Explanation Endpoint
app.post('/api/explain-cfa-topic', async (req, res) => {
    const { topic } = req.body;
    console.log(`Received request for topic: ${topic}`);

    if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
    }

    // Access API Key from environment variables (recommended for security)
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY is not set in environment variables.');
        return res.status(500).json({ error: 'Server configuration error: API key missing.' });
    }

    try {
        // This is where you would integrate with the actual Gemini API
        // For now, let's return a placeholder response
        // You'll replace this with actual Gemini API calls later
        const aiResponse = {
            content: [
                { type: 'text', value: `This is an AI-generated explanation for **${topic}**. \n\n(Note: This is a placeholder. Integrate your Gemini API call here!)` },
                // { type: 'image', value: 'YOUR_BASE64_IMAGE_HERE' } // Optional: if you generate images
            ]
        };

        res.json(aiResponse);

    } catch (error) {
        console.error('Error during AI explanation generation:', error);
        res.status(500).json({ error: 'Failed to generate AI explanation.', details: error.message });
    }
});

// Basic root route for testing if the server is running
app.get('/', (req, res) => {
    res.send('CFA AI Backend Proxy is running!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Backend server listening on http://localhost:${PORT}`);
    console.log('Access the backend at: ' + (process.env.NODE_ENV === 'production' ? 'Your Deployed URL' : `http://localhost:${PORT}`));
});