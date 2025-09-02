// src/controllers/postsController.js
import sanitizeHtml from 'sanitize-html';
import { marked } from 'marked';
import { slugify } from '../lib/slug.js';
import { events } from '../lib/events.js';
import {
  listPosts,
  getPostById,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost
} from '../models/posts.js';

// Restrictive render policy; extend as needed
const SANITIZE_OPTS = {
  allowedTags: [
    'p','blockquote','pre','code','h1','h2','h3','h4','h5','h6',
    'ul','ol','li','a','strong','em','img','hr','br','span',
    'figure','figcaption','table','thead','tbody','tr','th','td',
    'audio','video','source'
  ],
  allowedAttributes: {
    a: ['href','name','target','rel'],
    img: ['src','alt','title','width','height','loading'],
    audio: ['controls','src'],
    video: ['controls','src','width','height','poster'],
    source: ['src','type'],
    '*': ['class']
  },
  allowedSchemes: ['http','https','data','mailto']
};

export async function apiListPosts(req, res) {
  const rows = await listPosts({
    limit: Number(req.query.limit || 20),
    offset: Number(req.query.offset || 0)
  });
  res.json(rows);
}

export async function apiGetPost(req, res) {
  const idOrSlug = req.params.idOrSlug;
  const post = /^[0-9]+$/.test(idOrSlug)
    ? await getPostById(Number(idOrSlug))
    : await getPostBySlug(idOrSlug);
  if (!post) return res.status(404).json({ error: 'Not found' });
  res.json(post);
}

export async function apiCreatePost(req, res) {
  const { title, content, status = 'draft', sourceType = 'markdown' } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content are required' });

  const slug = slugify(req.body.slug || title);
  const html = sourceType === 'markdown' ? marked.parse(content) : content;
  const safeHtml = sanitizeHtml(html, SANITIZE_OPTS);

  const created = await createPost({
    title,
    slug,
    content_html: safeHtml,
    content_src: content,
    status
  });
  events.emit('post.created', created);
  res.status(201).json(created);
}

export async function apiUpdatePost(req, res) {
  const id = Number(req.params.id);
  const existing = await getPostById(id);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  const {
    title,
    content,
    status = existing.status,
    sourceType = 'markdown'
  } = req.body;

  const slug = slugify(req.body.slug || title || existing.title);
  const html =
    sourceType === 'markdown'
      ? marked.parse(content ?? existing.content_src ?? '')
      : (content ?? existing.content_html);
  const safeHtml = sanitizeHtml(html, SANITIZE_OPTS);

  const updated = await updatePost(id, {
    title: title ?? existing.title,
    slug,
    content_html: safeHtml,
    content_src: content ?? existing.content_src,
    status
  });
  events.emit('post.updated', updated);
  res.json(updated);
}

export async function apiDeletePost(req, res) {
  const id = Number(req.params.id);
  const existing = await getPostById(id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  await deletePost(id);
  events.emit('post.deleted', existing);
  res.json({ ok: true });
}
