import { Router } from 'express';
import basicAuth from 'express-basic-auth';
import { apiCreatePost, apiUpdatePost, apiDeletePost } from '../controllers/postsController.js';
import { uploadMw, apiUpload } from '../controllers/uploadsController.js';


const router = Router();


// Basic Auth guard (replace later with your preferred auth)
router.use(basicAuth({ users: { [process.env.ADMIN_USER]: process.env.ADMIN_PASS }, challenge: true }));


// Posts CRUD
router.post('/api/admin/posts', apiCreatePost);
router.put('/api/admin/posts/:id', apiUpdatePost);
router.delete('/api/admin/posts/:id', apiDeletePost);


// Uploads
router.post('/api/admin/uploads', uploadMw.single('file'), apiUpload);


export default router;