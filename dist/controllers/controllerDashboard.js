"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardSummary = getDashboardSummary;
const database_1 = __importDefault(require("../configs/database"));
/**
 * GET: Lấy toàn bộ dữ liệu dashboard của 1 user
 */
async function getDashboardSummary(req, res) {
    try {
        const userId = parseInt(req.params.userId, 10);
        if (isNaN(userId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }
        // Lấy thông tin user
        const userResult = await database_1.default.query("SELECT * FROM Users WHERE UserID = $1", [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        // Lấy dữ liệu dashboard song song
        const [categories, workProgress, tasks, dailySales, salesGrowth] = await Promise.all([
            database_1.default.query("SELECT * FROM Categories ORDER BY ViewCount DESC LIMIT 5"),
            database_1.default.query("SELECT * FROM WorkProgress WHERE UserID = $1", [userId]),
            database_1.default.query("SELECT * FROM Tasks WHERE UserID = $1 ORDER BY CreatedAt DESC LIMIT 5", [userId]),
            database_1.default.query("SELECT * FROM DailySales WHERE UserID = $1 ORDER BY SaleDate DESC LIMIT 5", [userId]),
            database_1.default.query("SELECT * FROM SalesGrowth WHERE UserID = $1 ORDER BY Timeline DESC LIMIT 5", [userId]),
        ]);
        res.json({
            user: userResult.rows[0],
            topCategories: categories.rows,
            workProgress: workProgress.rows,
            latestTasks: tasks.rows,
            dailySales: dailySales.rows,
            salesGrowth: salesGrowth.rows,
        });
    }
    catch (err) {
        console.error("Error fetching dashboard summary:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}
