const { Command } = require('commander');
const program = new Command();

program
  .option('-h, --host <host>', 'server address', 'localhost')
  .option('-p, --port <port>', 'server port', 3000)
  .option('-c, --cache <cache>', 'cache directory', './cache')
  .requiredOption('-h, --host <host>')
  .requiredOption('-p, --port <port>')
  .requiredOption('-c, --cache <cache>');

program.parse(process.argv);
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Server is running');
});

const { host, port } = program.opts();
server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});

const fs = require('fs').promises;
const path = require('path');

server.on('request', async (req, res) => {
  const code = req.url.slice(1); // Отримання коду з URL
  const cachePath = path.join(program.opts().cache, `${code}.jpg`);

  if (req.method === 'GET') {
    try {
      const image = await fs.readFile(cachePath);
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(image);
    } catch (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Image not found');
    }
  }
});

if (req.method === 'PUT') {
    const data = [];
    req.on('data', chunk => data.push(chunk));
    req.on('end', async () => {
      const imageBuffer = Buffer.concat(data);
      try {
        await fs.writeFile(cachePath, imageBuffer);
        res.writeHead(201, { 'Content-Type': 'text/plain' });
        res.end('Image saved');
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error saving image');
      }
    });
  }
  
