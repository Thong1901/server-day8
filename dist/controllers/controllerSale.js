"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailySales = getDailySales;
exports.getSalesByDateRange = getSalesByDateRange;
exports.getTotalRevenue = getTotalRevenue;
exports.postSale = postSale;
const database_1 = __importDefault(require("../configs/database"));
// GET daily sales data
async function getDailySales(req, res) {
    try {
        const userId = req.params.userId ? parseInt(req.params.userId, 10) : null;
        const limit = parseInt(req.query.limit) || 10;
        let result;
        if (userId && !isNaN(userId)) {
            // Query for specific user
            result = await database_1.default.query(`
                SELECT ds.*, u.FullName, u.AvatarURL 
                FROM DailySales ds 
                JOIN Users u ON ds.UserID = u.UserID 
                WHERE ds.UserID = $1 
                ORDER BY ds.SaleDate DESC 
                LIMIT $2
            `, [userId, limit]);
        }
        else {
            // Query for all users
            result = await database_1.default.query(`
                SELECT ds.*, u.FullName, u.AvatarURL 
                FROM DailySales ds 
                JOIN Users u ON ds.UserID = u.UserID 
                ORDER BY ds.SaleDate DESC 
                LIMIT $1
            `, [limit]);
        }
        res.json(result.rows);
    }
    catch (err) {
        console.error('Error fetching daily sales:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// GET sales by date range
async function getSalesByDateRange(req, res) {
    try {
        const { startDate, endDate } = req.query;
        const userId = req.params.userId ? parseInt(req.params.userId, 10) : null;
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Start date and end date are required' });
        }
        let result;
        if (userId && !isNaN(userId)) {
            result = await database_1.default.query(`
                SELECT ds.*, u.FullName, u.AvatarURL 
                FROM DailySales ds 
                JOIN Users u ON ds.UserID = u.UserID 
                WHERE ds.UserID = $1 AND ds.SaleDate BETWEEN $2 AND $3
                ORDER BY ds.SaleDate DESC
            `, [userId, startDate, endDate]);
        }
        else {
            result = await database_1.default.query(`
                SELECT ds.*, u.FullName, u.AvatarURL 
                FROM DailySales ds 
                JOIN Users u ON ds.UserID = u.UserID 
                WHERE ds.SaleDate BETWEEN $1 AND $2
                ORDER BY ds.SaleDate DESC
            `, [startDate, endDate]);
        }
        res.json(result.rows);
    }
    catch (err) {
        console.error('Error fetching sales by date range:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// GET total revenue for user
async function getTotalRevenue(req, res) {
    try {
        const userId = parseInt(req.params.userId, 10);
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        const result = await database_1.default.query('SELECT SUM(Revenue) as total_revenue, COUNT(*) as total_sales FROM DailySales WHERE UserID = $1', [userId]);
        res.json({
            totalRevenue: parseFloat(result.rows[0].total_revenue) || 0,
            totalSales: parseInt(result.rows[0].total_sales) || 0
        });
    }
    catch (err) {
        console.error('Error fetching total revenue:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// POST new sale record
async function postSale(req, res) {
    try {
        const { userId, templateName, revenue, saleDate } = req.body;
        if (!userId || !templateName || revenue === undefined) {
            return res.status(400).json({ error: 'User ID, template name, and revenue are required' });
        }
        // Validate revenue
        if (revenue < 0) {
            return res.status(400).json({ error: 'Revenue must be positive' });
        }
        // Validate date format if provided
        if (saleDate && !isValidDate(saleDate)) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
        }
        const result = await database_1.default.query('INSERT INTO DailySales (UserID, TemplateName, Revenue, SaleDate) VALUES ($1, $2, $3, $4) RETURNING *', [userId, templateName, revenue, saleDate || new Date().toISOString().split('T')[0]]);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        console.error('Error creating sale record:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// Helper function to validate date format
function isValidDate(dateString) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString))
        return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
}
