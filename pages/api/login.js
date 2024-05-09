import crypto from 'crypto';
import { cors, runMiddleware } from '../../lib/db';

const fakeLogin = [
  { user: "admin0", pwd: "admin0", role: "admin" },
  { user: "user1", pwd: "user1", role: "user" },
  { user: "user2", pwd: "user2", role: "user" },
  { user: "user3", pwd: "user3", role: "user" },
];

export default async function handler(req, res) {
    await runMiddleware(req, res, cors);

    // Explicitly handle OPTIONS method for CORS preflight
    if (req.method === 'OPTIONS') {
        // Handle OPTIONS request for CORS preflight
        res.setHeader('Access-Control-Allow-Origin', 'https://book-a-seat-eta.vercel.app');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control, Expires, Pragma');
        res.status(204).end();
        return;

        // Proceed with POST method
    if (req.method === 'POST') {
        // Login logic
        res.json({ status: 'Success' });
        return;
    }

    // Handle any other HTTP methods
    res.status(405).end();
}
