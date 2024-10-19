import http from 'http';
import fs from 'fs/promises';
import { Command } from 'commander';
import superagent from 'superagent';
import path from 'path';

const program = new Command();

program
  .requiredOption('-h, --host <host>', 'address of the server')
  .requiredOption('-p, --port <port>', 'port of the server')
  .requiredOption('-c, --cache <cache>', 'path to the directory for cached files');

program.parse(process.argv);

const options = program.opts();

const startServer = async () => {
  const server = http.createServer(async (req, res) => {
    const code = req.url?.substring(1); // Get the code from the URL
    const cachePath = path.join(options.cache, `${code}.jpg`);

    switch (req.method) {
      case 'GET':
        try {
          const data = await fs.readFile(cachePath);
          res.writeHead(200, { 'Content-Type': 'image/jpeg' });
          res.end(data);
        } catch (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
        }
        break;
      case 'PUT':
        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', async () => {
          const buffer = Buffer.concat(chunks);
          await fs.writeFile(cachePath, buffer);
          res.writeHead(201, { 'Content-Type': 'text/plain' });
          res.end('Created');
        });
        break;
      case 'DELETE':
        try {
          await fs.unlink(cachePath);
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('Deleted');
        } catch (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
        }
        break;
      default:
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method not allowed');
        break;
    }
  });

  server.listen(options.port, options.host, () => {
    console.log(`Server running at http://${options.host}:${options.port}/`);
  });
};

startServer().catch(err => {
  console.error(err);
});
