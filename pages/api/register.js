// pages/api/register.js
import {conn, cors, runMiddleware } from '../../lib/db';
import { randomBytes, scryptSync } from 'crypto';

export default async function handler(req, res) {
    try {
        if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Origin', 'https://book-a-seat-eta.vercel.app');
            res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            return res.status(204).end();
        }

        if (req.method !== 'POST') {
            res.setHeader('Allow', ['POST', 'OPTIONS']);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
        }

        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Generate a random salt
        const salt = randomBytes(16).toString('hex');
        // Hash the password using scrypt
        const hashedPassword = scryptSync(password, salt, 64).toString('hex');
        // Insert the user into the database with a default role of 'user'
        const queryResult = await conn.query(
            'INSERT INTO book_a_seat.users(username, hashed_password, salt, role) VALUES($1, $2, $3, $4) RETURNING *',
            [username, hashedPassword, salt, 'user']  // Explicitly setting the role to 'user'
        );

        const newUser = queryResult.rows[0];
        res.status(201).json({ message: 'User created', user: { username: newUser.username } });
    } catch (error) {
        console.error('Registration error:', error);
        res.setHeader('Access-Control-Allow-Origin', 'https://book-a-seat-eta.vercel.app');  // Ensure CORS headers are also sent on errors
        res.status(500).json({ error: 'Internal server error' });
    }
}
