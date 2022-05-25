const express = require('express');
const cors = require('cors');

const { serverPort } = require('./config');

const UserRoutes = require('./routes/v1/users');
const WineRoutes = require('./routes/v1/wines');
const UserWineRoutes = require('./routes/v1/userWines');

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send({ msg: 'Server is running' });
});

app.use('/v1/users/', UserRoutes);
app.use('/v1/wines/', WineRoutes);
app.use('/v1/my-wines/', UserWineRoutes);

app.all('*', (req, res) => {
  res.status(404).send({ err: 'Page not found' });
});

app.listen(serverPort, () => console.log(`Server is running on port: ${serverPort}`));
