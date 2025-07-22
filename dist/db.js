"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
// src/db.ts
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Use the DATABASE_URL from your environment
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('Missing DATABASE_URL in environment');
}
exports.pool = new pg_1.Pool({
    connectionString,
    // Optional: if your Railway DB requires SSL
    ssl: {
        rejectUnauthorized: false
    }
});
