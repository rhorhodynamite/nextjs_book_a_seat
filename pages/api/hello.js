// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import Cors from 'cors'
const cors = Cors({
    methods: ['GET', 'POST', 'HEAD', 'OPTIONS'],  // Including OPTIONS is crucial
    origin: 'https://book-a-seat-eta.vercel.app',  // Specify the exact origin
    credentials: true,  // Allows cookies and headers to be included in cross-origin requests
    
})

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
export default async function handler(req, res) {
  await runMiddleware(req, res, cors)
  res.json({ name: 'John Doe' })
}
