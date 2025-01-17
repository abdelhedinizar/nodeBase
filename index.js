const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const userRouter = require('./routes/userRoutes');
const dishRouter = require('./routes/dishRoutes');
const categoryRouter = require('./routes/categoryRoutes');
const orderRouter = require('./routes/orderRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const assistanceRouter = require('./routes/assistanceRoutes');

const app = express();

const corsOptions = {
  origin: '*', // Allow only this origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allow these HTTP methods
  credentials: true, // Allow cookies to be sent
  optionsSuccessStatus: 204, // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.status(200).send('Welcome to Node Base');
});

app.use((req, res, next) => {
  console.log('Hello from the middleware! 👋 ');
  console.log('Time:', new Date().toISOString());
  next();
});

app.use('/api/v1/users', express.json(), userRouter);
app.use('/api/v1/dishs', express.json(), dishRouter);
app.use('/api/v1/categories', express.json(), categoryRouter);
app.use('/api/v1/orders', express.json(), orderRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/assistances', express.json(), assistanceRouter);

app.all('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

module.exports = app;
