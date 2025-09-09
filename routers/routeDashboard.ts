import { Router } from "express";
const router = Router();
import { getDashboardSummary } from '../controllers/controllerDashboard';

router.get('/dashboard', getDashboardSummary);

export default router;