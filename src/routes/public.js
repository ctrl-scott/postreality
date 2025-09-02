import { Router } from 'express';
import { apiListPosts, apiGetPost } from '../controllers/postsController.js';


const router = Router();


router.get('/api/posts', apiListPosts);
router.get('/api/posts/:idOrSlug', apiGetPost);


export default router;