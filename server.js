const process = require('process');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXPRESSION, SHUTTING DOWN ....');
  process.exit(1);
});
const app = require('./app');
const port = process.env.PORT || 5000;

const URI = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(URI, {
    // .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // console.log(con.co);
    console.log('Database connection succesful!');
  });

const server = app.listen(port, () => {
  console.log(`App running on port ${port} `);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION, SHUTTING DOWN...');
  server.close(() => {
    process.exit(1);
  });
});
