var url = require('url');

function makeUrl({ hostname, port, pathname, secure, protocol, ...other }) {
  pathname = pathname || other.originalUrl;
  protocol = protocol || (secure) ? 'https' : 'http';

  let host;

  if (!port && other.headers) {
    host = other.headers.host
  }

  if (!host) {
    host = hostname;
    if (port && port !== 80) {
      host += `:${port}`;
    }
  }

  return url.format({
    protocol,
    host,
    pathname,
  });
}

module.exports = {
  makeUrl,
};
