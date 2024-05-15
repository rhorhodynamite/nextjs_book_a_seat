import { conn, cors, runMiddleware } from '../../lib/db';

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  let query = '';
  const id = req.query.id;
  let rslt = null;
  console.log('method get', id);

  try {
    if (id) {
      // Fetch bookings for a specific user with seat name
      query = `SELECT r.id, r.seat_id as seatId, r.username, 
                      to_char(r.start_date, 'YYYY-MM-DD HH24:MI:SS') as startDate, 
                      to_char(r.end_date, 'YYYY-MM-DD HH24:MI:SS') as endDate,
                      s.name as seatName
               FROM book_a_seat.reservation r
               JOIN book_a_seat.seat_objs s ON r.seat_id = s.id
               WHERE r.username = $1
               ORDER BY r.start_date`;
      console.log('Executing query:', query, [id]);
      rslt = await conn.query(query, [id]);
    } else {
      // Fetch all bookings with seat name
      query = `SELECT r.id, r.seat_id as seatId, r.username, 
                      to_char(r.start_date, 'YYYY-MM-DD HH24:MI:SS') as startDate, 
                      to_char(r.end_date, 'YYYY-MM-DD HH24:MI:SS') as endDate,
                      s.name as seatName
               FROM book_a_seat.reservation r
               JOIN book_a_seat.seat_objs s ON r.seat_id = s.id
               ORDER BY r.start_date`;
      console.log('Executing query:', query);
      rslt = await conn.query(query);
    }
    console.log('Server result:', rslt.rows);
    res.status(200).json({ rslt: rslt.rows });
  } catch (error) {
    console.error('Error executing query:', query, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
