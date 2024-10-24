const { program } = require('commander');
const http = require('http');
const fs = require('fs').promises; 
const path = require('path');
const superagent = require('superagent');

program
  .requiredOption('-h, --host <address>', 'адреса сервера')
  .requiredOption('-p, --port <number>', 'порт сервера')
  .requiredOption('-c, --cache <path>', 'шлях до директорії, яка міститиме закешовані файли');

program.parse(process.argv);

const options = program.opts();

const requestListener = async function (req, res) {
  const filePath = path.join(options.cache, req.url + ".jpg");
  switch(req.method){
    case 'GET':
        fs.readFile(filePath)
        .then(content => {
          console.log('Картинку взято з кешу');
          res.setHeader("Content-Type", "image/jpeg");
          res.writeHead(200);
          res.end(content);
        })
        .catch(async () => {
          try {
            const content = await superagent.get(path.join('https://http.cat/' + req.url));
            await fs.writeFile(filePath, content.body);
            console.log('Картинку взято з сайту');
            res.setHeader("Content-Type", "image/jpeg");
            res.writeHead(200);
            res.end(content.body);
          } catch (err) {
            console.log('Ой, було зловлено помилку');
            console.log(err);
            res.writeHead(404);
            res.end();
          }
        });
        break;
        case 'PUT':
          const chunks = [];
      
   
          req.on('data', chunk => {
              chunks.push(chunk);
          });
      
        
          req.on('end', async () => {
      
              const imageBuffer = Buffer.concat(chunks); 
      
              fs.writeFile(filePath, imageBuffer)
              .then(()=>{
                res.setHeader("Content-Type", "text/plain");
                  res.writeHead(201);
                  res.end('Картинку завантажено');
              })
              .catch(err=>{
                console.error('Помилка із завантаженням картинки:', err);
                res.writeHead(500);
                res.end('Помилка завантаження картинки');
              })
          });
      
          req.on('error', (err) => {
              console.error('Request error:', err);
              res.writeHead(400);
              res.end('Bad request.');
          });
          break;
          case 'DELETE':
            fs.unlink(filePath)
            .then(()=>{
              res.setHeader("Content-Type", "text/plain");
                  res.writeHead(200);
                  res.end('Картинку успішно видалено');
            })
            .catch(() =>{
              console.error('Жодної картники в кеші:', filePath);
              res.writeHead(404);
              res.end();
            });
            break;
            default:
              console.error('Неправильний метод');
              res.writeHead(405);
              res.end();
              break;
        }
      }
      const server = http.createServer(requestListener);

      server.listen(options.port, options.host, () => {
        console.log(`Server is listening on http://${options.host}:${options.port}`);
      });