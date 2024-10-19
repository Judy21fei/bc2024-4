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

