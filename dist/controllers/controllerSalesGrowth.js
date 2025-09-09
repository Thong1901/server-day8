"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSalesGrowth = getSalesGrowth;
exports.getLatestSalesGrowth = getLatestSalesGrowth;
exports.getSalesGrowthByDateRange = getSalesGrowthByDateRange;
exports.postSalesGrowth = postSalesGrowth;
const database_1 = __importDefault(require("../configs/database"));
// GET sales growth data
async function getSalesGrowth(req, res) {
    try {
        const userId = parseInt(req.params.userId, 10);
        const limit = parseInt(req.query.limit) || 5;
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        const result = await database_1.default.query('SELECT * FROM SalesGrowth WHERE UserID = $1 ORDER BY Timeline DESC LIMIT $2', [userId, limit]);
        res.json(result.rows);
    }
    catch (err) {
        console.error('Error fetching sales growth:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// GET latest sales growth for user
async function getLatestSalesGrowth(req, res) {
    try {
        const userId = parseInt(req.params.userId, 10);
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        const result = await database_1.default.query('SELECT * FROM SalesGrowth WHERE UserID = $1 ORDER BY Timeline DESC LIMIT 1', [userId]);
        if (result.rows.length === 0) {
            res.json({ usp: 0, stp: 0, timeline: null });
        }
        else {
            res.json(result.rows[0]);
        }
    }
    catch (err) {
        console.error('Error fetching latest sales growth:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// GET sales growth by date range
async function getSalesGrowthByDateRange(req, res) {
    try {
        const userId = parseInt(req.params.userId, 10);
        const { startDate, endDate } = req.query;
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Start date and end date are required' });
        }
        const result = await database_1.default.query('SELECT * FROM SalesGrowth WHERE UserID = $1 AND Timeline BETWEEN $2 AND $3 ORDER BY Timeline DESC', [userId, startDate, endDate]);
        res.json(result.rows);
    }
    catch (err) {
        console.error('Error fetching sales growth by date range:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// POST sales growth data
async function postSalesGrowth(req, res) {
    try {
        const { userId, usp, stp, timeline } = req.body;
        if (!userId || usp === undefined || stp === undefined) {
            return res.status(400).json({ error: 'User ID, USP, and STP are required' });
        }
        // Validate USP and STP range
        if (usp < -100 || usp > 100) {
            return res.status(400).json({ error: 'USP must be between -100 and 100' });
        }
        if (stp < -100 || stp > 100) {
            return res.status(400).json({ error: 'STP must be between -100 and 100' });
        }
        // Validate date format if provided
        if (timeline && !isValidDate(timeline)) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
        }
        const result = await database_1.default.query('INSERT INTO SalesGrowth (UserID, USP, STP, Timeline) VALUES ($1, $2, $3, $4) RETURNING *', [userId, usp, stp, timeline || new Date().toISOString().split('T')[0]]);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        console.error('Error creating sales growth record:', err);
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
