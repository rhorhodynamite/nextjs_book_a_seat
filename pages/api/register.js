// pages/api/register.js
import { conn } from '../../lib/db';
import bcrypt from 'bcrypt';
import { cors, runMiddleware } from '../../lib/corsMiddleware';

export default async function handler(req, res) {
  await runMiddleware(req, res, cors); // Apply CORS if needed

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert the new user into the database
    const queryResult = await conn.query(
      'INSERT INTO book_a_seat.users(username, hashed_password, role) VALUES($1, $2, $3) RETURNING *',
      [username, hashedPassword, 'user']
    );

    const newUser = queryResult.rows[0];
    res.status(201).json({ message: 'User created', user: { username: newUser.username, role: newUser.role } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
