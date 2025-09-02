import { query } from '../config/db.js';
WHERE status = :status
ORDER BY created_at DESC
LIMIT :limit OFFSET :offset`,
{ status, limit, offset }
);
}


export async function getPostById(id) {
const rows = await query(
`SELECT id, title, slug, content_html, status, created_at, updated_at
FROM posts WHERE id = :id`,
{ id }
);
return rows[0] || null;
}


export async function getPostBySlug(slug) {
const rows = await query(
`SELECT id, title, slug, content_html, status, created_at, updated_at
FROM posts WHERE slug = :slug`,
{ slug }
);
return rows[0] || null;
}


export async function createPost({ title, slug, content_html, content_src = null, status = 'draft' }) {
const result = await query(
`INSERT INTO posts (title, slug, content_html, content_src, status)
VALUES (:title, :slug, :content_html, :content_src, :status)`,
{ title, slug, content_html, content_src, status }
);
return { id: result.insertId, title, slug, content_html, content_src, status };
}


export async function updatePost(id, { title, slug, content_html, content_src = null, status }) {
await query(
`UPDATE posts
SET title=:title, slug=:slug, content_html=:content_html, content_src=:content_src, status=:status
WHERE id=:id`,
{ id, title, slug, content_html, content_src, status }
);
return getPostById(id);
}


export async function deletePost(id) {
await query(`DELETE FROM posts WHERE id=:id`, { id });
return true;
}