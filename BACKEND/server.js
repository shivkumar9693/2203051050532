const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const crypto = require('crypto');
const PORT = 3000;
const shortUrls = new Map();

app.use(bodyParser.json());
//post route
app.post('/shorturls', (req, res) => {
    const { url, validity = 30, shortcode } = req.body;
    try {
        new URL(url);
    } catch (err) {
        return res.status(400).json({ error: 'Invalid URL' });
    }
 
    let finalCode = shortcode || crypto.randomBytes(3).toString('hex');

    if (shortUrls.has(finalCode)) {
        return res.status(409).json({ error: 'You can use other url' });
    }

    const expiry = new Date(Date.now() + validity * 60000).toISOString();

    shortUrls.set(finalCode, {
        originalUrl: url,
        expiry
    });

    return res.status(201).json({
        shortLink: `http://localhost:${PORT}/${finalCode}`,
        expiry
    });
});
//get route
app.get('/:shortcode', (req, res) => {
    const { shortcode } = req.params;
    const record = shortUrls.get(shortcode);

    if (!record) {
        return res.status(404).send('Url Not Found');
    }

    const currentTime = new Date();
    const expiryTime = new Date(record.expiry);

    if (currentTime > expiryTime) {
        shortUrls.delete(shortcode);
        return res.status(410).send('Url has  expired');
    }

    res.redirect(record.originalUrl);
});
//server runing on port 3000
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
