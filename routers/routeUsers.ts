import { Router } from "express";

import { getUserById, getUserProfile, getUsers, postUser, RegisterUser, loginUser } from '../controllers/controllerUsers';

const router = Router();

router.get('/users', getUsers);
router.get('/users/profile', getUserProfile);
router.get('/users/:id', getUserById);

router.post('/users', postUser);
router.post('/users/password', RegisterUser);
router.post('/users/login', loginUser);
export default router;