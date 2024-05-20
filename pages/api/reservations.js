import { conn, cors, runMiddleware } from '../../lib/db';

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
  } else if (req.method === 'GET') {
    const selSeat = req.query.selSeat;
    let rslt = null;
    if (selSeat) {
      rslt = await conn.query(`
        SELECT r.id, r.seat_id as "seatId", r.username, 
               to_char(r.start_date, 'YYYY-MM-DD HH24:MI:SS') as "startDate", 
               to_char(r.end_date, 'YYYY-MM-DD HH24:MI:SS') as "endDate"
        FROM book_a_seat.reservation r
        WHERE r.seat_id = $1
        ORDER BY r.start_date
      `, [selSeat]);
    }
    res.status(200).json({ rslt: rslt?.rows });
  } else if (req.method === 'POST') {
    let successfull = false;
    try {
      const { interval, user, seatId } = req.body;
      const [start, end] = interval;

      // Check if the user has already booked other seats during the same period, excluding seat_id 16 and 17
      const rslt = await conn.query(`
        SELECT DISTINCT(seat_id) 
        FROM book_a_seat.reservation 
        WHERE username = $1 
        AND seat_id NOT IN (16, 17) 
        AND (
          ($2::timestamp BETWEEN start_date AND end_date) OR 
          ($3::timestamp BETWEEN start_date AND end_date) OR 
          (start_date < $2::timestamp AND end_date > $3::timestamp)
        )
      `, [user, start, end]);
      
      const rows = rslt?.rows;
      if (rows.length > 0) {
        return res.status(200).json({
          successfull: false,
          rows: rows.map((item) => item.seat_id)
        });
      }

      await conn.query(`
        INSERT INTO book_a_seat.reservation (seat_id, username, start_date, end_date)
        VALUES ($1, $2, $3, $4)
      `, [seatId, user, start, end]);
      successfull = true;

    } catch (error) {
      console.error(error);
    }
    res.status(200).json({ successfull });
  } else if (req.method === 'PUT') {
    let successfull = false;
    try {
      const { interval, id } = req.body;
      const [start, end] = interval;
      await conn.query(`
        UPDATE book_a_seat.reservation 
        SET start_date = $1, end_date = $2 
        WHERE id = $3
      `, [start, end, id]);
      successfull = true;
    } catch (error) {
      console.error(error);
    }
    res.status(200).json({ successfull });
  } else if (req.method === 'DELETE') {
    let successfull = false;
    try {
      const { id } = req.query;
      await conn.query(`DELETE FROM book_a_seat.reservation WHERE id = $1`, [id]);
      successfull = true;
    } catch (error) {
      console.error(error);
    }
    res.status(200).json({ successfull });
  }
}
