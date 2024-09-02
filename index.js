const express = require('express');
const morgan = require('morgan');

const userRouter = require('./routes/userRoutes');
const dishRouter = require('./routes/dishRoutes');

const app = express();

app.use(morgan('dev'));
app.use(express.json());

const port = 8080;

app.get('/', (req, res) => {
  res.status(200).send('Welcome to Node Base');
});

app.use((req, res, next) => {
  console.log('Hello from the middleware! 👋 ');
  console.log('Time:', new Date().toISOString());
  next();
});

app.use('/api/v1/users', userRouter);
app.use('/api/v1/dishs', dishRouter);

app.listen(port, () => {
  console.log(`Running on port ${port}...`);
});
