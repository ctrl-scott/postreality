async function fetchJSON(url, opts) {


/*async function refreshPostList() {
const list = await fetchJSON('/api/posts?limit=100&offset=0'); // published only; change server if you want drafts here
const box = $('#postList');
box.innerHTML = '';
for (const p of list) {
const btn = document.createElement('button');
btn.textContent = `#${p.id} • ${p.title}`;
btn.onclick = () => loadPost(p.id);
btn.style.margin = '0.25rem';
box.appendChild(btn);
}
}*/
	async function refreshPostList() {
	  const list = await fetchJSON('/api/posts?status=all&limit=100&offset=0');
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
$('#title').value = p.title;
$('#slug').value = p.slug;
$('#content').value = p.content_src || p.content_html;
document.querySelector(`input[name="status"][value="${p.status}"]`).checked = true;
$('#createBtn').disabled = true;
$('#updateBtn').disabled = false;
$('#deleteBtn').disabled = false;
}


async function createPost(e) {
e.preventDefault();
const body = {
title: $('#title').value.trim(),
slug: $('#slug').value.trim() || undefined,
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
slug: $('#slug').value.trim() || undefined,
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
})();