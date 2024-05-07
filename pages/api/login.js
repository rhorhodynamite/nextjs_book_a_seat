import crypto from 'crypto';
import { cors, runMiddleware } from '../../lib/db';

const fakeLogin = [
  { user: "admin0", pwd: "admin0", role: "admin" },
  { user: "user1", pwd: "user1", role: "user" },
  { user: "user2", pwd: "user2", role: "user" },
  { user: "user3", pwd: "user3", role: "user" },
];

export default async function handler(req, res) {
  try {
    // Apply CORS middleware
    await runMiddleware(req, res, cors);

    // Temporary login solution
    const { user, pwd } = req.body;  // Destructure user and pwd from request body
    const foundItem = fakeLogin.find(item => item.user === user && item.pwd === pwd);

    // Check if user exists and password matches
    if (foundItem) {
      const buffer = crypto.randomBytes(48);
      res.status(200).json({
        token: buffer.toString('hex'),
        role: foundItem.role,
        user: foundItem.user
      });
    } else {
      // If no user is found, or password doesn't match
      res.status(401).json({ error: 'Unauthorized' });
    }
  } catch (error) {
    // Handle errors that occurred during middleware execution or if any other error occurs
    console.error('Error in login API:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
}

