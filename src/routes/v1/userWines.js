const express = require('express');
const mysql = require('mysql2/promise');

const { addUserWineSchema } = require('../../middleware/valSchemas');
const { mysqlConfig } = require('../../config');
const validation = require('../../middleware/validation');
const isLoggedIn = require('../../middleware/auth');

const router = express.Router();

router.get('/', isLoggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`
        SELECT title, region, year, SUM(quantity) FROM Wines LEFT JOIN Collections
        ON Wines.id = Collections.wine_id WHERE user_id = ${req.user.accountId} 
        GROUP BY Wines.id
        `);

    await con.end();
    return res.send(data);
  } catch (err) {
    return res.status(500).send({ msg: 'An issue was found. Please try again later.' });
  }
});

router.post('/', isLoggedIn, validation(addUserWineSchema), async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`
              INSERT INTO Collections (wine_id, user_id, quantity)
              VALUES (
                ${mysql.escape(req.body.wine_id)},
                ${mysql.escape(req.user.accountId)},
                ${mysql.escape(req.body.quantity)})
              `);
    await con.end();

    if (!data.insertId || data.affectedRows !== 1) {
      return res.status(400).send({ msg: 'An issue was found. Please try again later.' });
    }

    return res.send({
      msg: 'Succesfully added wine',
      id: data.insertId,
    });
  } catch (err) {
    return res.status(500).send({ msg: 'An issue was found. Please try again later.' });
  }
});

module.exports = router;
