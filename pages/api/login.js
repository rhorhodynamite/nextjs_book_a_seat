import {conn, cors, runMiddleware } from '../../lib/db';
import { sign } from 'jsonwebtoken';
import { scryptSync } from 'crypto';

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  const { user: username, pwd: password } = req.body;

  try {
    // Query the users table for the provided username
    const queryResult = await conn.query('SELECT * FROM book_a_seat.users WHERE username = $1', [username]);
    const user = queryResult.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Hash the provided password with the stored salt
    const hashedPassword = scryptSync(password, user.salt, 64).toString('hex');

    // Compare the provided password's hash with the stored hashed password
    if (hashedPassword !== user.hashed_password) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // If the credentials are valid, generate a JWT token
    const token = sign({ userId: user.id, username: user.username }, 'your-secret-key');

    res.status(200).json({ token, role: user.role, username: user.username });
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

