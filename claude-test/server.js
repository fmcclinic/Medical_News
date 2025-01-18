const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/claude', async (req, res) => {
    console.log('Received request:', req.body);
    try {
        const response = await axios.post('https://api.anthropic.com/v1/messages', req.body, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': req.headers['x-api-key'],
                'anthropic-version': '2023-06-01'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});