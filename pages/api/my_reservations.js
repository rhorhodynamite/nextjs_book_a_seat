import { conn, cors, runMiddleware } from '../../lib/db';

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);
  if (req.method === 'OPTIONS') {
    res.status(200);
  } else if (req.method === 'GET') {
    const id = req.query.id;
    let rslt = null;
    console.log('method get', id);
    if (id) {
      // Fetch bookings for a specific user with seat name
      rslt = await conn.query(`SELECT r.id, r.seat_id as seatId, r.username, 
                                      to_char(r.start_date, 'YYYY-MM-DD HH24:MI:SS') as startDate, 
                                      to_char(r.end_date, 'YYYY-MM-DD HH24:MI:SS') as endDate,
                                      s.name as seatName
                               FROM book_a_seat.reservation r
                               JOIN book_a_seat.seat_objs s ON r.seat_id = s.id
                               WHERE r.username = $1
                               ORDER BY r.start_date`, [id]);
    } else {
      // Fetch all bookings with seat name
      rslt = await conn.query(`SELECT r.id, r.seat_id as seatId, r.username, 
                                      to_char(r.start_date, 'YYYY-MM-DD HH24:MI:SS') as startDate, 
                                      to_char(r.end_date, 'YYYY-MM-DD HH24:MI:SS') as endDate,
                                      s.name as seatName
                               FROM book_a_seat.reservation r
                               JOIN book_a_seat.seat_objs s ON r.seat_id = s.id
                               ORDER BY r.start_date`);
    }
    res.status(200).json({
      rslt: rslt?.rows
    });
  }
}

