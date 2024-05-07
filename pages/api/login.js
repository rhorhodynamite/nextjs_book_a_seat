import crypto from 'crypto';
import {cors, runMiddleware} from '../../lib/db';


export default async function handler(req, res) {
    await Cors(req, res, {
        methods: ['POST', 'GET'],
        origin: 'https://book-a-seat-eta.vercel.app',
        // You can also use a wildcard '*' if you want to allow all domains
        // However, this is less secure
        optionsSuccessStatus: 200,
        credentials: true,
        allowedHeaders: 'Content-Type, Authorization',
    });

    // Your existing API logic here, for example:
    if (req.method === 'POST') {
        // Handle the login logic here
        res.status(200).json({ message: 'Login Successful' });
    } else {
        // Handle other methods or return an error if they're not allowed
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}

const fakeLogin = [
  {user: "admin0", pwd:"admin0", role:"admin"},
  {user: "user1", pwd:"user1", role:"user"},
  {user: "user2", pwd:"user2", role:"user"},
  {user: "user3", pwd:"user3", role:"user"},
]

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);
  // console.log('login', req.method);
  // const foundItem = fakeLogin.find(item => {
  //   if (item.user === req.body.user && item.pwd === req.body.pwd) {
  //     return item;
  //   }
  //   return null;
  // });

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
