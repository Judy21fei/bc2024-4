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