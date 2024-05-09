import crypto from 'crypto';
import {conn, cors, runMiddleware } from '../../lib/db';
import { sign } from 'jsonwebtoken';


const saltRounds = 10; // Define the number of salt rounds for bcrypt

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  const { username, password } = req.body;

  try {
    // Query the users table for the provided username
    const queryResult = await conn.query('SELECT * FROM book_a_seat.users WHERE username = $1', [username]);
    const user = queryResult.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Compare the provided password with the hashed password stored in the database
    const passwordMatch = await compare(password, user.hashed_password);

    if (!passwordMatch) {
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

// Hash the provided password before storing it in the database
//export async function hashPassword(password) {
//  return bcrypt.hash(password, saltRounds);
//}
