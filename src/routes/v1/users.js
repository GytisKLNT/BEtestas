const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');

const { registrationSchema, loginSchema, changePassSchema } = require('../../middleware/valSchemas');
const { mysqlConfig, jwtSecret } = require('../../config');
const validation = require('../../middleware/validation');
const isLoggedIn = require('../../middleware/auth');

const router = express.Router();

router.post('/register', validation(registrationSchema), async (req, res) => {
  try {
    const hash = bcrypt.hashSync(req.body.password, 10);
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`
      INSERT INTO Users (name, email, password)
      VALUES (${mysql.escape(req.body.name)}, ${mysql.escape(req.body.email)}, '${hash}')
      `);
    await con.end();

    if (!data.insertId || data.affectedRows !== 1) {
      return res.status(500).send({ msg: 'An issue was found. Please try again later.' });
    }

    return res.send({
      msg: 'Succesfully created account',
      userId: data.insertId,
    });
  } catch (err) {
    return res.status(500).send({ msg: 'An issue was found. Please try again later.' });
  }
});

router.post('/login', validation(loginSchema), async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`
      SELECT * FROM Users WHERE email = ${mysql.escape(req.body.email)} LIMIT 1
      `);
    await con.end();

    if (!data.length === 0) {
      return res.status(400).send({ msg: 'Incorrect email or password' });
    }

    if (!bcrypt.compareSync(req.body.password, data[0].password)) {
      return res.status(400).send({ msg: 'Incorrect email or password' });
    }

    const token = jsonwebtoken.sign({ accountId: data[0].id }, jwtSecret);

    return res.send({
      msg: 'Succesfully logged in',
      token,
    });
  } catch (err) {
    return res.status(500).send({ msg: 'An issue was found. Please try again later.' });
  }
});

router.post('/change-password', isLoggedIn, validation(changePassSchema), async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`
      SELECT password FROM Users WHERE id = ${mysql.escape(req.user.accountId)} LIMIT 1
      `);

    if (bcrypt.compareSync(req.body.oldPassword, data[0].password)) {
      const hash = bcrypt.hashSync(req.body.newPassword, 10);

      await con.execute(`
      UPDATE Users SET password = '${hash}' WHERE id = ${mysql.escape(req.user.accountId)}
      `);

      await con.end();

      return res.send({ msg: 'Password changed' });
    }

    await con.end();
    return res.status(400).send({ msg: 'Incorrect old password' });
  } catch (err) {
    return res.status(500).send({ msg: 'An issue was found. Please try again later.' });
  }
});

module.exports = router;
