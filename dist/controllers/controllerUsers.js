"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfile = getUserProfile;
exports.getUsers = getUsers;
exports.getUserById = getUserById;
exports.postUser = postUser;
exports.RegisterUser = RegisterUser;
exports.loginUser = loginUser;
const database_1 = __importDefault(require("../configs/database"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// GET user profile with contact details and sales growth
async function getUserProfile(req, res) {
    try {
        const userId = parseInt(req.params.id, 10);
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        // Get user basic info
        const userResult = await database_1.default.query('SELECT * FROM Users WHERE UserID = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user = userResult.rows[0];
        // Get latest sales growth data
        const growthResult = await database_1.default.query('SELECT USP, STP, Timeline FROM SalesGrowth WHERE UserID = $1 ORDER BY Timeline DESC LIMIT 1', [userId]);
        const response = {
            profile: {
                userId: user.userid,
                LastName: user.lastname,
                FirstName: user.firstname,
                role: user.role,
                email: user.email,
                instagram: user.instagram,
                twitter: user.twitter,
                avatarURL: user.avatarurl
            },
            salesGrowth: growthResult.rows[0] || { usp: 0, stp: 0 }
        };
        res.json(response);
    }
    catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// GET all users
async function getUsers(req, res) {
    try {
        const result = await database_1.default.query('SELECT UserID, LastName, FirstName, Email, Role, Twitter, Instagram, AvatarURL FROM Users ORDER BY UserID');
        res.json(result.rows);
    }
    catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// GET user by ID
async function getUserById(req, res) {
    try {
        const userId = parseInt(req.params.id, 10);
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        const result = await database_1.default.query('SELECT * FROM Users WHERE UserID = $1', [userId]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'User not found' });
        }
        else {
            res.json(result.rows[0]);
        }
    }
    catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// POST create new user
async function postUser(req, res) {
    try {
        const { fullName, role, email, instagram, twitter, avatarURL } = req.body;
        if (!fullName) {
            return res.status(400).json({ error: 'Full name is required' });
        }
        // Validate email format if provided
        if (email && !isValidEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        const result = await database_1.default.query('INSERT INTO Users (FullName, Role, Email, Instagram, Twitter, AvatarURL) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [fullName, role, email, instagram, twitter, avatarURL]);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        console.error('Error creating user:', err);
        // Handle unique constraint violation (duplicate email)
        if (err.code === '23505' && err.constraint === 'users_email_key') {
            res.status(409).json({ error: 'Email already exists' });
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
async function RegisterUser(req, res) {
    try {
        const { firstName, lastName, email, password } = req.body;
        // Validate email format
        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        // Hash password
        const PasswordHash = await bcrypt_1.default.hash(password, 10);
        const result = await database_1.default.query(`INSERT INTO Users (FirstName, LastName, Email, PasswordHash) 
             VALUES ($1, $2, $3, $4) RETURNING *`, // Giữ PascalCase như các functions khác
        [firstName, lastName, email, PasswordHash]);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        console.error('Error creating user:', err);
        // Handle unique constraint violation (duplicate email)
        if (err.code === '23505' && err.constraint === 'users_email_key') {
            res.status(409).json({ error: 'Email already exists' });
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
async function loginUser(req, res) {
    try {
        const { email, password } = req.body;
        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        const result = await database_1.default.query('SELECT UserID, Email, PasswordHash FROM Users WHERE Email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const user = result.rows[0];
        // ✅ SỬA: Dùng lowercase như database trả về
        const isPasswordValid = await bcrypt_1.default.compare(password, user.passwordhash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        // ✅ SỬA: Dùng lowercase 
        const token = jsonwebtoken_1.default.sign({ userId: user.userid }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    }
    catch (err) {
        console.error('Error logging in user:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// Helper function to validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
