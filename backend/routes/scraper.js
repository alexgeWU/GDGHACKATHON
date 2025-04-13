import express from 'express';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

// Initialize SQLite database
let db;
(async () => {
  db = await open({
    filename: join(__dirname, '../db/prices.db'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item TEXT NOT NULL,
      store TEXT NOT NULL,
      price REAL NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      UNIQUE(item, store)
    )
  `);
})();

// Search for item prices
router.get('/search', async (req, res) => {
  try {
    const { item } = req.query;
    if (!item) {
      return res.status(400).json({ error: 'Item parameter is required' });
    }

    // Check cache first
    const cachedResults = await db.all(
      'SELECT * FROM prices WHERE item = ? AND timestamp > ?',
      [item, Date.now() - 24 * 60 * 60 * 1000] // Cache for 24 hours
    );

    if (cachedResults.length > 0) {
      return res.json(cachedResults);
    }

    // If not in cache, scrape Google Shopping
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(item)}+price&tbm=shop`);

    const results = await page.evaluate(() => {
      const items = [];
      document.querySelectorAll('.sh-dgr__content').forEach(element => {
        const name = element.querySelector('.sh-dgr__content-title')?.textContent;
        const price = element.querySelector('.a8Pemb')?.textContent;
        const store = element.querySelector('.aULzUe')?.textContent;
        
        if (name && price && store) {
          items.push({
            name,
            price: parseFloat(price.replace(/[^0-9.]/g, '')),
            store
          });
        }
      });
      return items;
    });

    await browser.close();

    // Cache results
    for (const result of results) {
      await db.run(
        'INSERT OR REPLACE INTO prices (item, store, price, quantity, unit, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
        [item, result.store, result.price, 1, 'unit', Date.now()]
      );
    }

    res.json(results);
  } catch (error) {
    console.error('Error scraping prices:', error);
    res.status(500).json({ error: 'Failed to scrape prices' });
  }
});

export default router; 