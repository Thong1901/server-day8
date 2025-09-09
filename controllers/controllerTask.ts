import pool from "../configs/database";

// GET latest tasks for user
async function getLatestTasks(req, res) {
    try {
        const userId = parseInt(req.params.userId, 10);
        const limit = parseInt(req.query.limit) || 10;

        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const result = await pool.query(
            'SELECT TaskID, TaskTitle, TaskTime, Status, CreatedAt FROM Tasks WHERE UserID = $1 ORDER BY CreatedAt DESC LIMIT $2',
            [userId, limit]
        );

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching latest tasks:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// GET all tasks for user
async function getTasksByUser(req, res) {
    try {
        const userId = parseInt(req.params.userId, 10);

        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const result = await pool.query(
            'SELECT * FROM Tasks WHERE UserID = $1 ORDER BY CreatedAt DESC',
            [userId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching user tasks:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// GET task by ID
async function getTaskById(req, res) {
    try {
        const taskId = parseInt(req.params.id, 10);

        if (isNaN(taskId)) {
            return res.status(400).json({ error: 'Invalid task ID' });
        }

        const result = await pool.query('SELECT * FROM Tasks WHERE TaskID = $1', [taskId]);

        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Task not found' });
        } else {
            res.json(result.rows[0]);
        }
    } catch (err) {
        console.error('Error fetching task:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// GET tasks by status
async function getTasksByStatus(req, res) {
    try {
        const { status } = req.params;
        const userId = req.query.userId ? parseInt(req.query.userId, 10) : null;

        if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        let result;

        if (userId && !isNaN(userId)) {
            result = await pool.query(
                'SELECT * FROM Tasks WHERE Status = $1 AND UserID = $2 ORDER BY CreatedAt DESC',
                [status, userId]
            );
        } else {
            result = await pool.query(
                'SELECT * FROM Tasks WHERE Status = $1 ORDER BY CreatedAt DESC',
                [status]
            );
        }

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching tasks by status:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// POST new task
async function postTask(req, res) {
    try {
        const { userId, taskTitle, taskTime, status = 'Pending' } = req.body;

        if (!userId || !taskTitle) {
            return res.status(400).json({ error: 'User ID and task title are required' });
        }

        // Validate status
        if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        // Validate taskTime format if provided
        if (taskTime && !isValidTime(taskTime)) {
            return res.status(400).json({ error: 'Invalid time format. Use HH:MM:SS' });
        }

        const result = await pool.query(
            'INSERT INTO Tasks (UserID, TaskTitle, TaskTime, Status) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, taskTitle, taskTime, status]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating task:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Helper function to validate time format
function isValidTime(time) {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    return timeRegex.test(time);
}

export {
    getLatestTasks,
    getTasksByUser,
    getTaskById,
    getTasksByStatus,
    postTask
};