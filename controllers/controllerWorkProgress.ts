import pool from "../configs/database";

// GET work progress for user
async function getWorkProgress(req, res) {
    try {
        const userId = parseInt(req.params.userId, 10);

        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const result = await pool.query(
            'SELECT * FROM WorkProgress WHERE UserID = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            // If no progress record exists, create one with default values
            const createResult = await pool.query(
                'INSERT INTO WorkProgress (UserID, PendingTasks, CompletedTasks, InProgressTasks, TotalTasks) VALUES ($1, 0, 0, 0, 0) RETURNING *',
                [userId]
            );
            res.json(createResult.rows[0]);
        } else {
            res.json(result.rows[0]);
        }
    } catch (err) {
        console.error('Error fetching work progress:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// GET work progress for all users
async function getAllWorkProgress(req, res) {
    try {
        const result = await pool.query(`
            SELECT wp.*, u.FullName, u.Role 
            FROM WorkProgress wp
            JOIN Users u ON wp.UserID = u.UserID
            ORDER BY u.FullName
        `);

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching all work progress:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// GET work progress statistics
async function getWorkProgressStats(req, res) {
    try {
        const userId = parseInt(req.params.userId, 10);

        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const result = await pool.query(
            'SELECT * FROM WorkProgress WHERE UserID = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.json({
                completionRate: 0,
                pendingRate: 0,
                inProgressRate: 0,
                totalTasks: 0
            });
        }

        const progress = result.rows[0];
        const total = progress.totaltasks || 1; // Avoid division by zero

        res.json({
            completionRate: Math.round((progress.completedtasks / total) * 100),
            pendingRate: Math.round((progress.pendingtasks / total) * 100),
            inProgressRate: Math.round((progress.inprogresstasks / total) * 100),
            totalTasks: progress.totaltasks
        });
    } catch (err) {
        console.error('Error fetching work progress stats:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// POST work progress record
async function postWorkProgress(req, res) {
    try {
        const { userId, pendingTasks = 0, completedTasks = 0, inProgressTasks = 0, totalTasks = 0 } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Validate that numbers are non-negative
        if (pendingTasks < 0 || completedTasks < 0 || inProgressTasks < 0 || totalTasks < 0) {
            return res.status(400).json({ error: 'Task counts must be non-negative' });
        }

        // Validate that the sum makes sense
        const calculatedTotal = pendingTasks + completedTasks + inProgressTasks;
        if (totalTasks !== calculatedTotal) {
            return res.status(400).json({
                error: `Total tasks (${totalTasks}) doesn't match sum of individual counts (${calculatedTotal})`
            });
        }

        const result = await pool.query(
            'INSERT INTO WorkProgress (UserID, PendingTasks, CompletedTasks, InProgressTasks, TotalTasks) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, pendingTasks, completedTasks, inProgressTasks, totalTasks]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating work progress record:', err);

        // Handle unique constraint violation
        if (err.code === '23505') {
            res.status(409).json({ error: 'Work progress record already exists for this user' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

export {
    getWorkProgress,
    getAllWorkProgress,
    getWorkProgressStats,
    postWorkProgress
};