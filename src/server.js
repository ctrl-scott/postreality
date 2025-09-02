import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';


dotenv.config();


const app = express();
const PORT = Number(process.env.PORT || 3000);
const __dirname = path.resolve();


app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));


// Static assets and uploads
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));


// Routes
app.use(publicRoutes);
app.use(adminRoutes);


// Fallback: serve index.html and admin.html
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));


app.listen(PORT, () => {
console.log(`PostReality listening on http://localhost:${PORT}`);
});