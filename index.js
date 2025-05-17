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
app.use(express.static('public'));
const allowedOrigins = [
  'https://vite-template-delta.vercel.app',
  'http://localhost:5000',
  'http://nozworld.zapto.org:5000',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
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
app.use('/api/v1/dishs', express.json({ limit: '10mb' }), dishRouter);
app.use('/api/v1/categories', express.json(), categoryRouter);
app.use('/api/v1/orders', express.json({ limit: '10mb' }), orderRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/assistances', express.json(), assistanceRouter);

app.all('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

module.exports = app;
