async function fetchJSON(url, opts) {
const res = await fetch(url, opts);
if (!res.ok) throw new Error(`HTTP ${res.status}`);
return res.json();
}


function renderPostList(posts) {
const root = document.getElementById('posts');
root.innerHTML = '';
for (const p of posts) {
const el = document.createElement('article');
el.className = 'post card';
el.innerHTML = `
<h2>${p.title}</h2>
<time datetime="${p.created_at}">${new Date(p.created_at).toLocaleString()}</time>
<div class="content">${p.content_html}</div>
`;
root.appendChild(el);
}
}


(async function init() {
try {
const posts = await fetchJSON('/api/posts?limit=20');
renderPostList(posts);
} catch (err) {
console.error(err);
document.getElementById('posts').textContent = 'Failed to load posts.';
}
})();