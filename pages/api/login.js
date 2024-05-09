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

    // Handle OPTIONS method for CORS preflight
    if (req.method === 'OPTIONS') {
        // Add specific headers for OPTIONS method
        res.status(204).end();
        return;
    }

    // Handle POST method
    if (req.method === 'POST') {
        // Process the POST request
        // Your login logic here
        res.status(200).json({ message: 'Login successful' });
    } else {
        // Return 405 Method Not Allowed for other methods
        res.setHeader('Allow', 'POST, OPTIONS');
        res.status(405).end();
    }
}

