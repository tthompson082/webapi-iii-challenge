const express = require('express');

const server = express();

const userRouter = require('./users/userRouter');

server.get('/', (req, res) => {
  res.send(`<h2>Let's write some middleware!</h2>`);
});

server.use(express.json());
//custom middleware

function logger(req, res, next) {
  console.log(`[${new Date()}] ${req.method} request to ${req.url}`);
  next();
}
server.use(logger);

server.use('/api/users', userRouter);

module.exports = server;
