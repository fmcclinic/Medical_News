const express = require('express');
const cors = require('cors');
const axios = require('axios');

// Add Claude API key
const CLAUDE_API_KEY = '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';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/claude', async (req, res) => {
    console.log('Received request to Claude API');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    try {
        const response = await axios.post('https://api.anthropic.com/v1/messages', req.body, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            }
        });
        console.log('Claude API response received:', {
            status: response.status,
            data: response.data
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error calling Claude API:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            details: error.response?.config
        });
        res.status(500).json({ 
            error: error.message,
            details: error.response?.data 
        });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});