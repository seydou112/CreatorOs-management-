import { Router } from 'express';
import { createOrUpdateProfile, getUserProfile } from '../controllers/profileController.js';

const router = Router();

router.post('/', createOrUpdateProfile);
router.get('/:userId', getUserProfile);

export default router;
