import { Pool } from "pg";
import NextCors from 'nextjs-cors';
import Cors from 'cors';

let conn;

if (!conn) {
  conn = new Pool({
    user: process.env.PGSQL_USER,
    password: process.env.PGSQL_PASSWORD,
    host: process.env.PGSQL_HOST,
    port: process.env.PGSQL_PORT,
    database: process.env.PGSQL_DATABASE,
  });
}

const cors = Cors({
    methods: ['GET', 'POST', 'HEAD', 'OPTIONS'],  // Including OPTIONS is crucial
    origin: 'https://book-a-seat-eta.vercel.app',  // Specify the exact origin
    credentials: true,  // Allows cookies and headers to be included in cross-origin requests
    allowedHeaders: ['Content-Type', 'Authorization'],
});


// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req,res,fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

export {conn, cors, runMiddleware}
