import fs from 'fs';
import path from 'path';
import multer from 'multer';
import mime from 'mime-types';
import dotenv from 'dotenv';   // this must be here
import { query } from '../config/db.js';
import { events } from '../lib/events.js';

dotenv.config();  //  this line only works if the import is present
dotenv.config();


const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const ALLOWED_EXTS = (process.env.ALLOWED_EXTENSIONS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
const MAX_FILE_BYTES = Number(process.env.MAX_FILE_BYTES || 10 * 1024 * 1024);


if (!fs.existsSync(UPLOAD_DIR)) {
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}


const storage = multer.diskStorage({
destination: (req, file, cb) => cb(null, UPLOAD_DIR),
filename: (req, file, cb) => {
const ext = path.extname(file.originalname).toLowerCase();
const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]+/g, '-').slice(0, 64) || 'file';
const stamp = Date.now();
cb(null, `${base}-${stamp}${ext}`);
}
});


function fileFilter(req, file, cb) {
const ext = (path.extname(file.originalname) || '').slice(1).toLowerCase();
if (ALLOWED_EXTS.length && !ALLOWED_EXTS.includes(ext)) {
return cb(new Error(`Extension .${ext} is not allowed`));
}
cb(null, true);
}


export const uploadMw = multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_BYTES } });


export async function saveFileRecord({ postId = null, originalName, storedName, sizeBytes, mimeType }) {
const ext = (path.extname(storedName) || '').slice(1).toLowerCase();
const url = `/${UPLOAD_DIR}/${storedName}`;
const result = await query(
`INSERT INTO files (post_id, original_name, stored_name, ext, mime_type, size_bytes, url)
VALUES (:post_id, :original_name, :stored_name, :ext, :mime_type, :size_bytes, :url)`,
{ post_id: postId, original_name: originalName, stored_name: storedName, ext, mime_type: mimeType, size_bytes: sizeBytes, url }
);
return { id: result.insertId, post_id: postId, original_name: originalName, stored_name: storedName, ext, mime_type: mimeType, size_bytes: sizeBytes, url };
}


export async function apiUpload(req, res) {
// multer has placed file at req.file
const f = req.file;
if (!f) return res.status(400).json({ error: 'No file uploaded' });
const record = await saveFileRecord({
originalName: f.originalname,
storedName: f.filename,
sizeBytes: f.size,
mimeType: mime.lookup(f.filename) || 'application/octet-stream'
});
events.emit('file.uploaded', record);
res.status(201).json(record);
}