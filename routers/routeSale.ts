import { Router } from "express";
import { getDailySales, getSalesByDateRange, getTotalRevenue, postSale } from '../controllers/controllerSale';
const route = Router();

route.get('/sales/daily', getDailySales);
route.get('/sales/date-range', getSalesByDateRange);
route.get('/sales/total-revenue', getTotalRevenue);
route.post('/sales', postSale);

export default route;
