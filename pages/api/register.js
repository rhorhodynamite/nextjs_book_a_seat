// pages/api/register.js
import { conn } from '../../lib/db';
import { randomBytes, scryptSync } from 'crypto';

export default async function handler(req, res) {
    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');  // Adjust according to your CORS policy
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.status(204).end();
        return;
    }

    // Ensure that this endpoint only processes POST requests
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST', 'OPTIONS']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        return;
    }

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        // Generate a random salt
        const salt = randomBytes(16).toString('hex');
        // Hash the password using scrypt
        const hashedPassword = scryptSync(password, salt, 64).toString('hex');
        // Store hash and salt in the database
        const queryResult = await conn.query(
            'INSERT INTO book_a_seat.users(username, hashed_password, salt) VALUES($1, $2, $3) RETURNING *',
            [username, hashedPassword, salt]
        );

        const newUser = queryResult.rows[0];
        res.status(201).json({ message: 'User created', user: { username: newUser.username } });
    } catch ( error ) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
