"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("./db");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
const port = process.env.PORT || 3000;
// Test endpoint: query current timestamp
app.get('/api/db-time', async (_req, res) => {
    try {
        const { rows } = await db_1.pool.query('SELECT NOW() as now');
        res.json({ now: rows[0].now });
    }
    catch (err) {
        console.error('DB error:', err);
        res.status(500).json({ error: 'Database error' });
    }
});
app.get('/api/hello', (_req, res) => {
    res.json({ message: '👋 Hello again!' });
});
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
