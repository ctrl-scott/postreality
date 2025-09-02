import { query } from '../config/db.js';

export async function listPosts({ limit = 20, offset = 0, status = 'published' } = {}) {
  // Validate & clamp to safe integers, then inline (no placeholders for LIMIT/OFFSET)
  const lim = Number.isFinite(Number(limit)) ? Math.max(0, parseInt(limit, 10)) : 20;
  const off = Number.isFinite(Number(offset)) ? Math.max(0, parseInt(offset, 10)) : 0;

  const sql = `
    SELECT id, title, slug, content_html, created_at, updated_at
    FROM posts
    WHERE status = ?
    ORDER BY created_at DESC
    LIMIT ${lim} OFFSET ${off}
  `;

  return query(sql, [status]);
}

export async function getPostById(id) {
  const rows = await query(
    `SELECT id, title, slug, content_html, status, created_at, updated_at
     FROM posts WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function getPostBySlug(slug) {
  const rows = await query(
    `SELECT id, title, slug, content_html, status, created_at, updated_at
     FROM posts WHERE slug = ?`,
    [slug]
  );
  return rows[0] || null;
}

export async function createPost({ title, slug, content_html, content_src = null, status = 'draft' }) {
  const result = await query(
    `INSERT INTO posts (title, slug, content_html, content_src, status)
     VALUES (?, ?, ?, ?, ?)`,
    [title, slug, content_html, content_src, status]
  );
  return { id: result.insertId, title, slug, content_html, content_src, status };
}

export async function updatePost(id, { title, slug, content_html, content_src = null, status }) {
  await query(
    `UPDATE posts
     SET title=?, slug=?, content_html=?, content_src=?, status=?
     WHERE id=?`,
    [title, slug, content_html, content_src, status, id]
  );
  return getPostById(id);
}

export async function deletePost(id) {
  await query(`DELETE FROM posts WHERE id=?`, [id]);
  return true;
}
