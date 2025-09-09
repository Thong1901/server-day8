import { Router } from "express";
import { getCategories, getTopCategories, getCategoryById, postCategory } from '../controllers/controllerCategory';

const router = Router();

router.get('/category', getCategories);
router.get('/category/top', getTopCategories);
router.get('/category/:id', getCategoryById);
router.post('/category', postCategory);

export default router;
