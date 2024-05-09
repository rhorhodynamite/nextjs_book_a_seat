// pages/api/register.js
import { conn } from '../../lib/db';
import { randomBytes, scryptSync } from 'crypto';

export default async function handler(req, res) {
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
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
