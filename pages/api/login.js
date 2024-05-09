import crypto from 'crypto';
import { cors, runMiddleware } from '../../lib/db';

const fakeLogin = [
  { user: "admin0", pwd: "admin0", role: "admin" },
  { user: "user1", pwd: "user1", role: "user" },
  { user: "user2", pwd: "user2", role: "user" },
  { user: "user3", pwd: "user3", role: "user" },
];

// pages/api/login.js
export default function handler(req, res) {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', 'https://book-a-seat-eta.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control, Expires, Pragma');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle OPTIONS method for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // Handle POST method for login
  if (req.method === 'POST') {
    const foundItem = {
      user: req.body.user,
      pwd: "user1", // This appears to be static and might be a placeholder?
      role: "user"
    };

    // Adjust role if the user is "admin0"
    if (req.body.user === "admin0") {
      foundItem.role = 'admin';
    }

    // Simulating a user found scenario; adjust according to actual authentication logic
    if (foundItem) {
      const buffer = randomBytes(48);
      res.status(200).json({
        token: buffer.toString('hex'),
        role: foundItem.role,
        user: foundItem.user
      });
    } else {
      // Handle case where no user is found
      res.status(200).json({
        token: null,
        role: 'user',
        user: null
      });
    }
  } else {
    // Return 405 Method Not Allowed for other methods
    res.setHeader('Allow', 'POST, OPTIONS');
    res.status(405).end();
  }
}

