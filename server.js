const express = require('express');
const path = require('path');
const fs = require('fs');
const { nanoid } = require('nanoid');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(__dirname, 'urls.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

function loadData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data || '{}');
  } catch (err) {
    return {};
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

app.post('/api/shorten', (req, res) => {
  const { originalUrl, label, customCode } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ error: 'Original URL is required.' });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(originalUrl);
  } catch (err) {
    return res.status(400).json({ error: 'Please provide a valid URL.' });
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return res
      .status(400)
      .json({ error: 'Only http and https links are supported.' });
  }

  const data = loadData();
  const trimmedCustomCode = (customCode || '').trim();
  let code = trimmedCustomCode;

  if (code) {
    if (!/^[a-zA-Z0-9-_]{3,30}$/.test(code)) {
      return res.status(400).json({
        error:
          'Custom code must be 3-30 characters and contain only letters, numbers, hyphens, or underscores.',
      });
    }
  } else {
    code = nanoid(7);
  }

  if (data[code]) {
    return res.status(409).json({ error: 'That custom code is already taken.' });
  }

  data[code] = {
    code,
    originalUrl: parsedUrl.toString(),
    label: label || '',
    createdAt: new Date().toISOString(),
    clicks: 0,
    lastClickedAt: null,
  };

  saveData(data);

  const baseUrl = `${req.protocol}://${req.get('host')}`;

  res.json({
    ...data[code],
    shortUrl: `${baseUrl}/${code}`,
  });
});

app.get('/api/links', (req, res) => {
  const data = loadData();
  const list = Object.entries(data)
    .map(([code, item]) => ({ ...item, code }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(list);
});

app.get('/api/stats/:code', (req, res) => {
  const { code } = req.params;
  const data = loadData();
  const item = data[code];
  if (!item) {
    return res.status(404).json({ error: 'Short URL not found.' });
  }
  res.json({ ...item, code });
});

app.delete('/api/links/:code', (req, res) => {
  const { code } = req.params;
  const data = loadData();

  if (!data[code]) {
    return res.status(404).json({ error: 'Short URL not found.' });
  }

  delete data[code];
  saveData(data);

  res.status(204).send();
});

app.get('/:code', (req, res) => {
  const { code } = req.params;
  const data = loadData();
  const item = data[code];

  if (!item) {
    return res.status(404).send('Short URL not found');
  }

  item.clicks += 1;
  item.lastClickedAt = new Date().toISOString();
  data[code] = item;
  saveData(data);

  res.redirect(item.originalUrl);
});

app.listen(PORT, () => {
  console.log(`URL shortener server running on port ${PORT}`);
});

