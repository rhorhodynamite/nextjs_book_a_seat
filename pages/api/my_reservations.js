import { conn, cors, runMiddleware } from '../../lib/db';

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    const id = req.query.id;
    try {
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

      console.log('query result', rslt.rows); // Add this line to debug the query result

      res.status(200).json({
        rslt: rslt.rows
      });

    } catch (error) {
      console.error('Error executing query:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else if (req.method === 'POST') {
    let successfull = false;
    try {
      const interval = req.body.interval;

      // Validate seat_id
      const seatCheck = await conn.query(`SELECT id FROM book_a_seat.seat_objs WHERE id = $1`, [req.body.seatId]);
      if (seatCheck.rows.length === 0) {
        return res.status(400).json({ successfull: false, message: 'Invalid seat_id' });
      }

      // check if the user has in the same period already booked
      const rslt = await conn.query(`SELECT distinct (seat_id) from book_a_seat.reservation 
        where username =  '${req.body.user}' and ((start_date between '${interval[0]}' and '${interval[1]}')
          or (end_date between '${interval[0]}' and '${interval[1]}')
          or (start_date < '${interval[0]}' and end_date > '${interval[1]}'))`);

      const rows = rslt?.rows;
      console.log(rows);
      if (rows.length > 0) {
        return res.status(200).json({
          successfull: false,
          rows: rows.map((item) => item.seat_id)
        });
      }

      await conn.query(`INSERT INTO book_a_seat.reservation (seat_id, username, start_date, end_date)
          values (${req.body.seatId}, '${req.body.user}', '${interval[0]}', '${interval[1]}') `);
      successfull = true;

    } catch (error) {
      console.error(error);
    }
    console.log('everything ok');
    res.status(200).json({
      successfull: successfull
    });
  } else if (req.method === 'PUT') {
    let successfull = false;
    try {
      const interval = req.body.interval;
      await conn.query(`UPDATE book_a_seat.reservation set start_date = '${interval[0]}', end_date = '${interval[1]}' where id = ${req.body.id}`);
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
