import { conn, cors, runMiddleware } from '../../lib/db';

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);
  if (req.method === 'OPTIONS') {
    res.status(200);
  } else if (req.method === 'GET') {
    const selSeat = req.query.selSeat;
    let rslt = null;
    if (selSeat) {
      rslt = await conn.query(`SELECT r.id, r.seat_id as seatId, r.username, 
                                      to_char(r.start_date, 'YYYY-MM-DD HH24:MI:SS') as startDate, 
                                      to_char(r.end_date, 'YYYY-MM-DD HH24:MI:SS') as endDate
                               FROM book_a_seat.reservation r
                               WHERE r.seat_id = ${selSeat}
                               ORDER BY r.start_date`);
    }
    res.status(200).json({
      rslt: rslt?.rows
    });
  } else if (req.method === 'POST') {
    let successfull = false;
    try {
      const interval = req.body.interval;

      // check if the user has in the same period already booked, excluding seat_id 16 and 17
      const rslt = await conn.query(`SELECT DISTINCT(seat_id) 
                                      FROM book_a_seat.reservation 
                                      WHERE username = '${req.body.user}' 
                                      AND seat_id NOT IN (16, 17) 
                                      AND ((start_date BETWEEN '${interval[0]}' AND '${interval[1]}')
                                      OR (end_date BETWEEN '${interval[0]}' AND '${interval[1]}')
                                      OR (start_date < '${interval[0]}' AND end_date > '${interval[1]}'))`);
      const rows = rslt?.rows;
      if (rows.length > 0) {
        return res.status(200).json({
          successfull: false,
          rows: rows.map((item) => item.seat_id)
        });
      }

      await conn.query(`INSERT INTO book_a_seat.reservation (seat_id, username, start_date, end_date)
                        VALUES (${req.body.seatId}, '${req.body.user}', '${interval[0]}', '${interval[1]}')`);
      successfull = true;

    } catch (error) {
      console.error(error);
    }
    res.status(200).json({
      successfull: successfull
    });
  } else if (req.method === 'PUT') {
    let successfull = false;
    try {
      const interval = req.body.interval;
      await conn.query(`UPDATE book_a_seat.reservation 
                        SET start_date = '${interval[0]}', end_date = '${interval[1]}' 
                        WHERE id = ${req.body.id}`);
      successfull = true;

    } catch (error) {
      console.error(error);
    }

    res.status(200).json({
      successfull: successfull
    });
  } else if (req.method === 'DELETE') {
    let successfull = false;
    try {
      await conn.query(`DELETE FROM book_a_seat.reservation WHERE id = ${req.query.id}`);
      successfull = true;

    } catch (error) {
      console.error(error);
    }

    res.status(200).json({
      successfull: successfull
    });
  }
}
