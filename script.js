// --- CFA Level Specific Data ---
const CFA_LEVEL_DATA = {
    "I": {    
        RECOMMENDED_TIME_HOURS: 300,
        TOPICS: ["Ethical & Professional Standards", "Quantitative Methods", "Economics", "Financial Statement Analysis", "Corporate Issuers", "Equity Investments", "Fixed Income", "Derivatives", "Alternative Investments", "Portfolio Management"],
        // Add any other Level I specific variables
    },
    "II": {
        RECOMMENDED_TIME_HOURS: 320,
        TOPICS: ["Ethical & Professional Standards", "Quantitative Methods", "Economics", "Financial Statement Analysis", "Corporate Issuers", "Equity Investments", "Fixed Income", "Derivatives", "Alternative Investments", "Portfolio Management & Wealth Management"],
        // Add any other Level II specific variables
    },
    "III": {
        RECOMMENDED_TIME_HOURS: 350,
        TOPICS: ["Ethical & Professional Standards", "Behavioral Finance", "Private Wealth Management", "Institutional Investors", "Asset Allocation", "Fixed Income", "Equity Investments", "Alternative Investments", "Derivatives", "Portfolio Management"],
        // Add any other Level III specific variables
    }
};

// --- DOM Elements ---
const cfaLevelSelect = document.getElementById('cfaLevel');
const recommendedHoursSpan = document.getElementById('recommendedHours');
const mockScoreInput = document.getElementById('mockScore');
const addMockScoreButton = document.getElementById('addMockScore');
const mockExamChartCanvas = document.getElementById('mockExamChart');

let currentCfaLevel = cfaLevelSelect.value; // Initialize with default selected level
let mockExamScores = []; // To store mock exam scores

// Chart.js instance
let mockChart;

// --- Functions ---

function updateCfaLevelData() {
    currentCfaLevel = cfaLevelSelect.value;
    const levelData = CFA_LEVEL_DATA[currentCfaLevel];

    if (levelData) {
        recommendedHoursSpan.textContent = levelData.RECOMMENDED_TIME_HOURS;
        // You would also update other UI elements that depend on the level,
        // e.g., topic lists, specific study recommendations, etc.
        console.log(`CFA Level set to: ${currentCfaLevel}, Recommended Hours: ${levelData.RECOMMENDED_TIME_HOURS}`);
        // Trigger a re-render of any other level-dependent parts of your tool
    }
}

function renderMockExamChart() {
    const ctx = mockExamChartCanvas.getContext('2d');

    // Destroy previous chart instance if it exists
    if (mockChart) {
        mockChart.destroy();
    }

    mockChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: mockExamScores.map((_, index) => `Mock ${index + 1}`), // Labels for each score
            datasets: [{
                label: 'Mock Exam Score',
                data: mockExamScores,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100 // Scores are 0-100
                }
            }
        }
    });
}

function addMockScore() {
    const score = parseInt(mockScoreInput.value);
    if (!isNaN(score) && score >= 0 && score <= 100) {
        mockExamScores.push(score);
        // Keep only the last 5 scores for the chart
        if (mockExamScores.length > 5) {
            mockExamScores.shift(); // Remove the oldest score
        }
        mockScoreInput.value = ''; // Clear input field
        renderMockExamChart(); // Update the chart
    } else {
        alert('Please enter a valid mock exam score between 0 and 100.');
    }
}

// --- Event Listeners ---
cfaLevelSelect.addEventListener('change', updateCfaLevelData);
addMockScoreButton.addEventListener('click', addMockScore);

// --- Initial Setup ---
// Initialize the displayed data based on the default selected level
updateCfaLevelData();
// Render the chart initially (it will be empty if no scores are added)
renderMockExamChart();

// You would integrate your existing study hour calculation and display logic here.
// For example:
// const dailyHoursInput = document.getElementById('dailyHours');
// const calculateButton = document.getElementById('calculateButton');
// ... your existing study hour logic ...