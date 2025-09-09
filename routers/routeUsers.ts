import { Router } from "express";
import express from "express";
import jwt from "../middleware/auth"

const app = express();

import { getUserById, getUserProfile, getUsers, postUser, RegisterUser, loginUser } from '../controllers/controllerUsers';

app.use(express.json());
const router = Router();
router.post('/users', postUser);
router.post('/users/password', RegisterUser);
router.post('/users/login', loginUser);

app.use(jwt);

router.get('/users', getUsers);
router.get('/users/profile', getUserProfile);
router.get('/users/:id', getUserById);


export default router;