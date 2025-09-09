import { Router } from "express";
import { getLatestSalesGrowth, getSalesGrowth, getSalesGrowthByDateRange, postSalesGrowth } from '../controllers/controllerSalesGrowth';
const router = Router();

router.get('/sales-growth/latest', getLatestSalesGrowth);
router.get('/sales-growth/:id', getSalesGrowth);
router.get('/sales-growth/date-range', getSalesGrowthByDateRange);
router.post('/sales-growth', postSalesGrowth);

export default router;
