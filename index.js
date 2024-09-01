const http = require('http');
const router = require('router');

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/html',
  });
  res.write('<html>');
  res.write('<head>');
  res.write('<title>Node Base</title>');
  res.write('</head>');
  res.write('<body>');
  res.write('<h1> Welcome to Node Base</h1>');
  res.write('<h2>Mahdi ya bouterma kbira :D</h2>'); 
  res.write('</body>');
  res.end('</html>');
});

server.listen(8080, (err, res) => {
  console.log('Server is running on port 8080');
});
