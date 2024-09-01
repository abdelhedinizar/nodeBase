const http = require('http');
const router = require('router');

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('<html>');
  res.end('<head>');
  res.end('<title>Node Base</title>');
  res.end('</head>');
  req.end('<body>');
  res.end('<h1> Welcome to Node Base</h1>');
  res.end('</body>');
});

server.listen(8080,( err, res) => {
    console.log('Server is running on port 8080');
});