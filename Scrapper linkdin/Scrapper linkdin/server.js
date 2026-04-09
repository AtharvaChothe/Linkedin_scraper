import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { body, validationResult } from 'express-validator';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

import { loginToLinkedIn, hasValidSession } from './scraper/login.js';
import { runCrawler } from './scraper/crawler.js';
import { getAllProfiles, exportToCsv, exportToJson } from './storage_lib/storage.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// API Routes
app.post('/api/login', [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
], async (req, res) => {
    const { email, password } = req.body;
    try {
        await loginToLinkedIn(email, password);
        res.json({ message: 'Login successful.' });
    } catch (error) {
        res.status(500).json({ error: 'Login failed.' });
    }
});

app.post('/api/scrape', async (req, res) => {
    if (!hasValidSession()) return res.status(401).json({ error: 'Login required.' });
    const { urls } = req.body;
    try {
        const results = await runCrawler(urls);
        res.json({ data: results });
    } catch (error) {
        res.status(500).json({ error: 'Scrape failed.' });
    }
});

app.post('/api/batch-csv', async (req, res) => {
    if (!hasValidSession()) return res.status(401).json({ error: 'Login required.' });
    const inputPath = "C:\\Users\\Shwet\\OneDrive\\Documents\\Copy of ABM_ Existing .csv";
    const outputPath = path.resolve(__dirname, 'data.csv');
    try {
        const fileContent = fs.readFileSync(inputPath, 'utf8');
        const records = parse(fileContent, { columns: true, skip_empty_lines: true });
        const urls = records.map(r => r.LinkedIn_URL).filter(u => u && u.includes('linkedin.com/in/')).slice(0, 10);
        const results = await runCrawler(urls);
        const outputData = results.map(p => ({ FullName: p.fullName, Headline: p.headline, About: p.about, ProfileURL: p.profileUrl }));
        fs.writeFileSync(outputPath, stringify(outputData, { header: true }));
        res.json({ message: 'Batch complete.', count: results.length });
    } catch (error) {
        res.status(500).json({ error: 'Batch CSV processing failed.' });
    }
});

app.get('/api/profiles', async (req, res) => {
    try {
        const profiles = await getAllProfiles();
        res.json(profiles);
    } catch (error) {
        res.status(500).json({ error: 'Fetch failed.' });
    }
});

app.get('/api/export/:format', async (req, res) => {
    const { format } = req.params;
    try {
        const profiles = await getAllProfiles();
        const file = format === 'csv' ? await exportToCsv(profiles) : await exportToJson(profiles);
        res.download(file);
    } catch (error) {
        res.status(500).json({ error: 'Export failed.' });
    }
});

// Use a middleware for SPA routing instead of app.get('*') to avoid originalPath error
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
        if (err) {
            res.status(500).send('Frontend build missing or error.');
        }
    });
});

app.listen(port, () => {
    console.log(`Unified server active at http://localhost:${port}`);
});
