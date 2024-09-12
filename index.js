const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const userRouter = require('./routes/userRoutes');
const dishRouter = require('./routes/dishRoutes');

const app = express();


const corsOptions = {
  origin: 'http://localhost:3000', // Allow only this origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allow these HTTP methods
  credentials: true, // Allow cookies to be sent
  optionsSuccessStatus: 204 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).send('Welcome to Node Base 2');
});

app.use((req, res, next) => {
  console.log('Hello from the middleware! 👋 ');
  console.log('Time:', new Date().toISOString());
  next();
});

app.use('/api/v1/users', userRouter);
app.use('/api/v1/dishs', dishRouter);

module.exports = app;
