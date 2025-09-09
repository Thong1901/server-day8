"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopCategories = getTopCategories;
exports.getCategories = getCategories;
exports.getCategoryById = getCategoryById;
exports.postCategory = postCategory;
const database_1 = __importDefault(require("../configs/database"));
// GET top categories with view counts and growth
async function getTopCategories(req, res) {
    try {
        const result = await database_1.default.query('SELECT CategoryName, TechStack, ViewCount, Growth FROM Categories ORDER BY ViewCount DESC LIMIT 10');
        res.json(result.rows);
    }
    catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// GET all categories
async function getCategories(req, res) {
    try {
        const result = await database_1.default.query('SELECT * FROM Categories ORDER BY CategoryName');
        res.json(result.rows);
    }
    catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// GET category by ID
async function getCategoryById(req, res) {
    try {
        const categoryId = parseInt(req.params.id, 10);
        if (isNaN(categoryId)) {
            return res.status(400).json({ error: 'Invalid category ID' });
        }
        const result = await database_1.default.query('SELECT * FROM Categories WHERE CategoryID = $1', [categoryId]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Category not found' });
        }
        else {
            res.json(result.rows[0]);
        }
    }
    catch (err) {
        console.error('Error fetching category:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// POST new category
async function postCategory(req, res) {
    try {
        const { categoryName, techStack, viewCount = 0, growth = 0 } = req.body;
        if (!categoryName) {
            return res.status(400).json({ error: 'Category name is required' });
        }
        const result = await database_1.default.query('INSERT INTO Categories (CategoryName, TechStack, ViewCount, Growth) VALUES ($1, $2, $3, $4) RETURNING *', [categoryName, techStack, viewCount, growth]);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        console.error('Error creating category:', err);
        // Handle unique constraint violation (duplicate category name)
        if (err.code === '23505') {
            res.status(409).json({ error: 'Category name already exists' });
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
