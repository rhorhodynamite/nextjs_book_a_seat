import { conn, cors, runMiddleware } from '../../lib/db';

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  if (req.method === 'OPTIONS') {
    res.status(200);
  }

  if (req.method === 'GET') {
    const { svgType } = req.query;
    const seatRslt = await conn.query('SELECT * FROM book_a_seat.seat_objs WHERE svgType = $1', [svgType]);
    const tableRslt = await conn.query('SELECT * FROM book_a_seat.table_objs WHERE svgType = $1', [svgType]);

    res.status(200).json({
      seats: seatRslt.rows,
      tables: tableRslt.rows
    });
  } else if (req.method === 'POST') {
    let successful = false;
    try {
      const reqObjs = req.body;
      const { svgType } = req.query;

      if (reqObjs) {
        await conn.query('DELETE FROM book_a_seat.seat_objs WHERE svgType = $1', [svgType]);
        for (const seat of reqObjs.seats) {
          await conn.query(
            'INSERT INTO book_a_seat.seat_objs (id, name, x, y, svgType) VALUES ($1, $2, $3, $4, $5)',
            [seat.id, seat.name, seat.x, seat.y, svgType]
          );
        }

        await conn.query('DELETE FROM book_a_seat.table_objs WHERE svgType = $1', [svgType]);
        for (const table of reqObjs.tables) {
          await conn.query(
            'INSERT INTO book_a_seat.table_objs (id, name, x, y, width, height, svgType) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [table.id, table.name, table.x, table.y, table.width, table.height, svgType]
          );
        }
        successful = true;
      }
    } catch (error) {
      console.error(error);
    }
    res.status(200).json({
      successful: successful
    });
  }
}
