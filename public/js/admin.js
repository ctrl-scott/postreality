// public/js/admin.js

// --- tiny helpers ---
async function fetchJSON(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    // Surface server-side errors to help debugging
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} on ${url}${text ? ` — ${text}` : ""}`);
  }
  return res.json();
}
function $(sel) { return document.querySelector(sel); }

// Global state for the editor
let currentPostId = null;

// Read status filter from URL (?status=all|draft|published). Default: all
function getStatusFilterFromURL() {
  const p = new URLSearchParams(location.search);
  const v = (p.get("status") || "all").toLowerCase();
  return ["all", "draft", "published"].includes(v) ? v : "all";
}

// ----------------- UI wiring -----------------

async function refreshPostList() {
  const status = getStatusFilterFromURL(); // all | draft | published
  const list = await fetchJSON(`/api/posts?status=${encodeURIComponent(status)}&limit=100&offset=0`);
  const box = $('#postList');
  box.innerHTML = '';
  for (const p of list) {
    const btn = document.createElement('button');
    btn.textContent = `#${p.id} • ${p.title} (${p.status})`;
    btn.onclick = () => loadPost(p.id);
    btn.style.margin = '0.25rem';
    box.appendChild(btn);
  }
}

async function loadPost(id) {
  const p = await fetchJSON(`/api/posts/${id}`);
  currentPostId = p.id;
  $('#title').value   = p.title;
  $('#slug').value    = p.slug;
  $('#content').value = p.content_src || p.content_html || '';
  const radio = document.querySelector(`input[name="status"][value="${p.status}"]`);
  if (radio) radio.checked = true;

  $('#createBtn').disabled = true;
  $('#updateBtn').disabled = false;
  $('#deleteBtn').disabled = false;
}

async function createPost(e) {
  e.preventDefault();
  const body = {
    title: $('#title').value.trim(),
    slug:  $('#slug').value.trim() || undefined,
    content: $('#content').value,
    status: document.querySelector('input[name="status"]:checked').value,
    sourceType: $('#sourceType').value
  };
  const p = await fetchJSON('/api/admin/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  currentPostId = p.id;
  $('#createBtn').disabled = true;
  $('#updateBtn').disabled = false;
  $('#deleteBtn').disabled = false;
  await refreshPostList();
  alert('Post created');
}

async function updatePost() {
  if (!currentPostId) return alert('Load or create a post first');
  const body = {
    title: $('#title').value.trim(),
    slug:  $('#slug').value.trim() || undefined,
    content: $('#content').value,
    status: document.querySelector('input[name="status"]:checked').value,
    sourceType: $('#sourceType').value
  };
  await fetchJSON(`/api/admin/posts/${currentPostId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  await refreshPostList();
  alert('Post updated');
}

async function deletePost() {
  if (!currentPostId) return alert('Nothing to delete');
  if (!confirm('Delete this post?')) return;
  await fetchJSON(`/api/admin/posts/${currentPostId}`, { method: 'DELETE' });
  currentPostId = null;
  document.getElementById('postForm').reset();
  $('#createBtn').disabled = false;
  $('#updateBtn').disabled = true;
  $('#deleteBtn').disabled = true;
  await refreshPostList();
  alert('Post deleted');
}

// ----------------- uploads (unchanged API) -----------------

async function uploadFile() {
  const f = document.getElementById('fileInput').files[0];
  if (!f) return alert('Choose a file first');
  const fd = new FormData();
  fd.append('file', f);
  const rec = await fetchJSON('/api/admin/uploads', { method: 'POST', body: fd });
  $('#uploadStatus').textContent = `Uploaded ${rec.original_name} → ${rec.url}`;
  addFileCard(rec);
}

function addFileCard(rec) {
  const box = document.getElementById('files');
  const el = document.createElement('div');
  el.className = 'file';
  el.innerHTML = `
    <div class="name">${rec.original_name}</div>
    <div class="url">${location.origin}${rec.url}</div>
    <div class="actions">
      <button type="button" data-action="insert-link">Insert Link</button>
      <button type="button" data-action="insert-embed">Insert Embed</button>
      <a href="${rec.url}" target="_blank" rel="noopener">Open</a>
    </div>
  `;
  el.querySelector('[data-action="insert-link"]').onclick  = () => insertAtCursor(`[${rec.original_name}](${rec.url})\n`);
  el.querySelector('[data-action="insert-embed"]').onclick = () => insertEmbed(rec);
  box.prepend(el);
}

function insertAtCursor(text) {
  const ta = document.getElementById('content');
  const start = ta.selectionStart, end = ta.selectionEnd;
  const before = ta.value.slice(0, start), after = ta.value.slice(end);
  ta.value = before + text + after;
  ta.selectionStart = ta.selectionEnd = start + text.length;
  ta.focus();
}

function insertEmbed(rec) {
  const url = rec.url.toLowerCase();
  let code = '';
  if (url.match(/\.(png|jpe?g|gif|webp|svg)$/)) {
    code = `![](${rec.url})\n`;
  } else if (url.match(/\.(mp3|wav|ogg)$/)) {
    code = `<audio controls src="${rec.url}"></audio>\n`;
  } else if (url.match(/\.(mp4|webm)$/)) {
    code = `<video controls width="640" src="${rec.url}"></video>\n`;
  } else {
    code = `[Download ${rec.original_name}](${rec.url})\n`;
  }
  insertAtCursor(code);
}

// ----------------- init -----------------

function init() {
  document.getElementById('postForm').addEventListener('submit', createPost);
  document.getElementById('updateBtn').addEventListener('click', updatePost);
  document.getElementById('deleteBtn').addEventListener('click', deletePost);
  document.getElementById('uploadBtn').addEventListener('click', uploadFile);
  refreshPostList().catch(err => {
    console.error(err);
    const box = $('#postList');
    if (box) box.innerHTML = `<div class="muted">Failed to load posts: ${err.message}</div>`;
  });
}

document.addEventListener('DOMContentLoaded', init);
