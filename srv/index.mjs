import http from 'http';
import fs from 'fs';

const port = 3000;
const server = http.createServer()

server.on('request', function (req, res) {
    switch (req.url) {
        case '/main.js':
            fs.readFile('../docs/main.js', (err, data) => {
                if (err) throw err;
                res.writeHead(200, { "Content-Type": "application/javascript" });
                res.write(data);
                res.end();
            });
            break;
        case '/so.js':
            fs.readFile('../docs/so.js', (err, data) => {
                if (err) throw err;
                res.writeHead(200, { "Content-Type": "application/javascript" });
                res.write(data);
                res.end();
            });
            break;
        case '/':
        case '/index.html':
        default:
            fs.readFile('../docs/index.html', (err, data) => {
                if (err) throw err;
                res.writeHead(200, { "Content-Type": "text/html" });
                res.write(data);
                res.end();
            });
            break;
    }
}).listen(port);

console.log(`Server running on port http://localhost:${port}`);