const express = require('express');
const http = require('http');
const { argv } = require('yargs');
const { makeUrl } = require('./utils');

const httpHostname = argv.hostname || process.env.HOSTNAME || '127.0.0.1';
const httpPort = argv.port || process.env.PORT || 3000;

const app = express();
var server = http.createServer(app);

const {
  pocketAuthCode,
  pocketAuthCallback,
} = require('./pocketAuth');

app.get('/', (req, res) => {
  const authData = req.app.locals.auth || {};

  let nextUrl = '/pocket/auth';

  const requestAuth = (path, productName) => {
    // return res.redirect(nextUrl);
    return res.send(`<a href="${nextUrl}">Login in ${productName}</a>`);
  }

  if (!authData.pocket) {
    requestAuth('/pocket/auth', 'Pocket');
  } else if (!authData.raindrop) {
    requestAuth('/raindrop/auth', 'RainDrop');
  } else {
    res.send('Success!');
  }

  return res;
});

app.get('/pocket/auth', pocketAuthCode);
app.get('/pocket/callback', pocketAuthCallback);

server.listen(httpPort, httpHostname);

server.on('listening', async () => {
  const { port, address } = server.address();

  const url = makeUrl({ port, hostname: address });

  // eslint-disable-next-line no-console
  console.log(`Open page ${url}`);

  if (argv.open !== false) {
    const open = require('opn');
    const browser = open(url).then(() => {
      process.exit(0);
    });
  }
});
