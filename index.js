const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Welcome to My Node Base Application');
});

server.listen(8080,( err, res) => {
    console.log('Server is running on port 8080');
});