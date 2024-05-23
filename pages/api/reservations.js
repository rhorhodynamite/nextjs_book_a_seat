import { conn, cors, runMiddleware } from '../../lib/db';
import moment from 'moment';

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

      // Convert to UTC to ensure consistent timezone handling
      const startUTC = moment.utc(start).format('YYYY-MM-DD HH:mm:ss');
      const endUTC = moment.utc(end).format('YYYY-MM-DD HH:mm:ss');

      // Log the incoming data for debugging
      console.log('Received POST data:', { interval, user, seatId });

      const insertQuery = `
        INSERT INTO book_a_seat.reservation (seat_id, username, start_date, end_date)
        VALUES ($1, $2, $3, $4)
      `;
      console.log('Insert Query:', insertQuery, [seatId, user, startUTC, endUTC]);

      await conn.query(insertQuery, [seatId, user, startUTC, endUTC]);
      successfull = true;

    } catch (error) {
      console.error('Error during reservation creation:', error);
    }
    res.status(200).json({ successfull });
  } else if (req.method === 'PUT') {
    let successfull = false;
    try {
      const { interval, id } = req.body;
      const [start, end] = interval;

      // Convert to UTC to ensure consistent timezone handling
      const startUTC = moment.utc(start).format('YYYY-MM-DD HH:mm:ss');
      const endUTC = moment.utc(end).format('YYYY-MM-DD HH:mm:ss');

      const updateQuery = `
        UPDATE book_a_seat.reservation 
        SET start_date = $1, end_date = $2 
        WHERE id = $3
      `;

      console.log('Update Query:', updateQuery, [startUTC, endUTC, id]);

      await conn.query(updateQuery, [startUTC, endUTC, id]);
      successfull = true;
    } catch (error) {
      console.error('Error during reservation update:', error);
    }
    res.status(200).json({ successfull });
  } else if (req.method === 'DELETE') {
    let successfull = false;
    try {
      const { id } = req.query;

      const deleteQuery = `DELETE FROM book_a_seat.reservation WHERE id = $1`;

      console.log('Delete Query:', deleteQuery, [id]);

      await conn.query(deleteQuery, [id]);
      successfull = true;
    } catch (error) {
      console.error('Error during reservation deletion:', error);
    }
    res.status(200).json({ successfull });
  }
}
