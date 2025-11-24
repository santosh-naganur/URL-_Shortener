async function shortenUrl(event) {
  event.preventDefault();

  const form = document.getElementById('shorten-form');
  const originalUrl = form.originalUrl.value.trim();
  const label = form.label.value.trim();
  const customCode = form.customCode.value.trim();

  if (!originalUrl) return;

  try {
    const payload = { originalUrl, label };
    if (customCode) {
      payload.customCode = customCode;
    }

    const res = await fetch('/api/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      alert(errorData.error || 'Failed to create short URL');
      return;
    }

    const data = await res.json();
    const newLink = document.getElementById('new-link');
    const newShortUrl = document.getElementById('new-short-url');

    newShortUrl.textContent = data.shortUrl;
    newShortUrl.href = data.shortUrl;
    newLink.classList.remove('hidden');

    await fetchLinks();
  } catch (err) {
    alert('Network error while shortening URL');
  }
}

async function fetchLinks() {
  const tbody = document.getElementById('links-body');
  const table = document.getElementById('links-table');
  const empty = document.getElementById('links-empty');

  tbody.innerHTML = '';

  try {
    const res = await fetch('/api/links');
    const links = await res.json();

    if (!Array.isArray(links) || links.length === 0) {
      table.classList.add('hidden');
      empty.classList.remove('hidden');
      return;
    }

    for (const link of links) {
      const tr = document.createElement('tr');
      const code = link.code || link.id;

      const labelCell = document.createElement('td');
      labelCell.textContent = link.label || '—';

      const shortCell = document.createElement('td');
      const shortA = document.createElement('a');
      shortA.href = `${window.location.origin}/${code}`;
      shortA.target = '_blank';
      shortA.rel = 'noopener';
      shortA.textContent = `${window.location.origin}/${code}`;
      shortCell.appendChild(shortA);

      const originalCell = document.createElement('td');
      const originalA = document.createElement('a');
      originalA.href = link.originalUrl;
      originalA.target = '_blank';
      originalA.rel = 'noopener';
      originalA.textContent = link.originalUrl;
      originalCell.appendChild(originalA);

      const clicksCell = document.createElement('td');
      clicksCell.textContent = link.clicks;

      const lastClickCell = document.createElement('td');
      if (link.lastClickedAt) {
        const d = new Date(link.lastClickedAt);
        lastClickCell.textContent = d.toLocaleString();
      } else {
        lastClickCell.textContent = 'Never';
      }

      const actionsCell = document.createElement('td');
      const delBtn = document.createElement('button');
      delBtn.textContent = 'Delete';
      delBtn.className = 'secondary';
      delBtn.onclick = () => deleteLink(code);
      actionsCell.appendChild(delBtn);

      tr.appendChild(labelCell);
      tr.appendChild(shortCell);
      tr.appendChild(originalCell);
      tr.appendChild(clicksCell);
      tr.appendChild(lastClickCell);
      tr.appendChild(actionsCell);

      tbody.appendChild(tr);
    }

    table.classList.remove('hidden');
    empty.classList.add('hidden');
  } catch (err) {
    console.error(err);
  }
}

async function deleteLink(id) {
  if (!confirm('Delete this short link?')) return;

  try {
    const res = await fetch(`/api/links/${id}`, { method: 'DELETE' });
    if (!res.ok && res.status !== 204) {
      alert('Failed to delete link');
      return;
    }
    await fetchLinks();
  } catch (err) {
    alert('Network error while deleting link');
  }
}

function setupCopyButton() {
  const copyBtn = document.getElementById('copy-button');
  const newShortUrl = document.getElementById('new-short-url');

  copyBtn.addEventListener('click', async () => {
    const text = newShortUrl.textContent.trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => (copyBtn.textContent = 'Copy'), 1500);
    } catch (err) {
      alert('Could not copy to clipboard');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document
    .getElementById('shorten-form')
    .addEventListener('submit', shortenUrl);
  document
    .getElementById('refresh-button')
    .addEventListener('click', fetchLinks);

  setupCopyButton();
  fetchLinks();
});

