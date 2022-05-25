const express = require('express');
const mysql = require('mysql2/promise');

const { addWineSchema } = require('../../middleware/valSchemas');
const { mysqlConfig } = require('../../config');
const validation = require('../../middleware/validation');
const isLoggedIn = require('../../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`
        SELECT * FROM Wines
        `);
    await con.end();

    const { page } = req.query;
    const { limit } = req.query;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};

    if (endIndex < data.length) {
      results.next = {
        page: Number(page) + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      results.previous = {
        page: Number(page) - 1,
        limit,
      };
    }

    results.wines = data.slice(startIndex, endIndex);

    if (!page && !limit) {
      return res.send(data);
    }

    return res.send(results);
  } catch (err) {
    return res.status(500).send({ msg: 'An issue was found. Please try again later.' });
  }
});

router.post('/', isLoggedIn, validation(addWineSchema), async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`
          INSERT INTO Wines (title, region, year)
          VALUES (${mysql.escape(req.body.title)}, ${mysql.escape(req.body.region)}, '${mysql.escape(req.body.year)}')
          `);
    await con.end();

    if (!data.insertId || data.affectedRows !== 1) {
      return res.status(500).send({ msg: 'An issue was found. Please try again later.' });
    }

    return res.send({
      msg: 'Succesfully added wine',
      wineId: data.insertId,
    });
  } catch (err) {
    return res.status(500).send({ msg: 'An issue was found. Please try again later.' });
  }
});

module.exports = router;
