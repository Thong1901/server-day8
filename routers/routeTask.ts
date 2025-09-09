import { Router } from "express";
import { getLatestTasks, getTaskById, getTasksByStatus, getTasksByUser, postTask } from '../controllers/controllerTask';

const router = Router();

router.get('/tasks/latest', getLatestTasks);
router.get('/tasks/:id', getTaskById);
router.get('/tasks/status/:status', getTasksByStatus);
router.get('/tasks/user/:userId', getTasksByUser);
router.post('/tasks', postTask);

export default router;
