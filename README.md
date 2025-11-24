# Mini URL Shortener

A small Bitly-like URL shortener built with **Node.js + Express** and a lightweight HTML/CSS frontend.  
You can shorten URLs, see click counts, and manage (list/delete) your links.

## Features

- Shorten any valid (http/https) URL
- Optional label for each link
- Optional custom short code (`/docs`, `/launch-2025`, etc.) with uniqueness checks
- Click tracking and last-click timestamp
- List all links in a simple dashboard
- Delete links you no longer need

## Prerequisites

- Node.js 18+ and npm installed on your machine

## Running locally

1. Open a terminal and go to the project folder:

   ```bash
   cd "C:\Users\SANGAMESH\Desktop\Aganitha Cognitive Solution\url-shortener"
   ```

2. Install dependencies (already done if you followed the setup):

   ```bash
   npm install
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

4. Open your browser at:

   ```text
   http://localhost:3000
   ```

## Project structure

- `server.js` – Express server, API routes, redirects, and click tracking
- `urls.json` – Simple JSON file used as a lightweight data store
- `public/index.html` – Main UI
- `public/styles.css` – Plain CSS styling
- `public/app.js` – Frontend logic (calls the API, updates the table)

## API overview

- `POST /api/shorten`  
  Body: `{ "originalUrl": "<url>", "label": "<optional label>", "customCode": "<optional code>" }`  
  Response: object including `id`, `shortUrl`, `clicks`, etc.

  - `customCode` must be 3-30 letters, numbers, hyphens, or underscores.
  - If omitted, a random code is generated.

- `GET /api/links`  
  Returns array of all links with stats.

- `GET /api/stats/:id`  
  Returns stats for a single short link.

- `DELETE /api/links/:id`  
  Deletes a short link.

- `GET /:id`  
  Redirects to the original URL and increments click count.

## Free hosting options

You can host this small app for free on services like:

- **Render (Free Web Service)**  
  - Create a new Web Service, connect your GitHub repo  
  - Environment: Node  
  - Build command: `npm install`  
  - Start command: `npm start`  
  - Add `PORT` environment variable if not provided automatically.

- **Railway**  
  - Create a new project from your GitHub repo  
  - It will auto-detect Node and run `npm start` by default

For either service:

1. Push this project to a GitHub repository.
2. Point Render/Railway at that repo.
3. After deploy, you’ll get a public base URL like `https://your-app.onrender.com` – all generated short links will use that domain.


