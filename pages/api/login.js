import crypto from 'crypto';
import {cors, runMiddleware} from '../../lib/db';

const fakeLogin = [
  {user: "admin0", pwd:"admin0", role:"admin"},
  {user: "user1", pwd:"user1", role:"user"},
  {user: "user2", pwd:"user2", role:"user"},
  {user: "user3", pwd:"user3", role:"user"},
]

export default async function handler(req, res) {
  try {
    await runMiddleware(req, res, cors);  // Apply CORS middleware
    // Proceed with route handling
  } catch (error) {
    // Handle errors that occurred during middleware execution
    res.status(500).json({ error: 'An error occurred' });
  }
}


  // temporary solution
  const foundItem = {user: req.body.user, pwd:"user1", role:"user"}
  if (req.body.user == "admin0"){
    foundItem.role = 'admin';
  }
  // console.log('foundItem', foundItem);
  if (foundItem){
      const buffer = crypto.randomBytes(48);
      res.status(200).json({ 
        token: buffer.toString('hex'),
        role: foundItem.role,
        user: foundItem.user 
      });
  } else {
    res.status(200).json({ token: null, role: 'user', user: null});
  }
}
