const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/api/search', async (req, res) => {
    const { q, key, cx } = req.query;
    if (!q || !key || !cx) {
        return res.status(400).json({ error: 'Missing query, API key, or search engine ID' });
    }

    try {
        const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
            params: {
                q,
                key,
                cx,
            },
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch search results' });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});