const mangoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mangoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log('DB connection successfully!');
  })
  .catch((err) => {
    console.log(err);
  });

const app = require('./index');
console.log(process.env.NODE_ENV);

port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Running on port ${port}...`);
});
