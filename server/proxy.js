// Requires Node.js to run
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(require('cors')());

// API Routes
app.post('/api/search/google', async (req, res) => {
    try {
        const { query } = req.body;
        const response = await axios.get(`https://www.googleapis.com/customsearch/v1`, {
            params: {
                q: query,
                key: process.env.GOOGLE_API_KEY,
                cx: process.env.GOOGLE_CX
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));