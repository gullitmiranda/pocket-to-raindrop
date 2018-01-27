const express = require('express');
const fetch = require('node-fetch');

const { makeUrl } = require('./utils');

const app = express();

const POCKET_CONSUMER_KEY = '74412-a0426e3e632f7a2b98582457';
const POCKET_API          = 'https://getpocket.com/v3/';
const POCKET_AUTH_URL     = 'https://getpocket.com/auth/authorize';

const log = require('./log');

const commonBody = {
  consumer_key: POCKET_CONSUMER_KEY,
};

const fetchHeaders = {
  'Content-Type': 'application/json',
  'X-Accept': 'application/json',
};

let code;

const doRequest = async (url, options) => {
  options = {
    method: 'POST',
    headers: fetchHeaders,
    ...options,
  };

  if (options.body && typeof options.body !== 'string') {
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, options)
    .catch((reason) => {
      log.error('doRequest', reason);
    })
  ;

  let error;
  let data = await ((response.ok) ? response.json() : response.text());

  if (!response.ok) {
    error = response.headers['x-error'] || data;
  }

  return { response, data, error, ok: response.ok };
};

const pocketAuthCode = async (req, res) => {
  const requesthUrl = `${POCKET_API}/oauth/request`;
  const redirectUri = makeUrl(Object.assign({}, req, { pathname: 'pocket/callback' }));
  const body        = Object.assign({}, commonBody, { redirect_uri: redirectUri });

  let { data, error } = await doRequest(requesthUrl, { body });

  code = typeof data === 'object' ? data.code : null;

  if (!code) {
    error = `Response no have \`code\``;
  }

  if (error) {
    const errorMsg = log.error('[pocketAuthCode]', error);
    res.send(errorMsg.join(' '));
  } else {
    const url = `${POCKET_AUTH_URL}?request_token=${code}&redirect_uri=${redirectUri}`;
    res.redirect(url);
  }

  return res;
};

const pocketAuthCallback = async (req, res) => {
  const requesthUrl = `${POCKET_API}/oauth/authorize`;
  const redirectUri = makeUrl(Object.assign({}, req, { pathname: 'callback' }));

  const body = Object.assign({}, commonBody, {
    code: code,
  });

  let { data, error } = await doRequest(requesthUrl, { body });

  const { access_token, username } = typeof data === 'object' ? data : {};

  if (!access_token) {
    error = `Response no have \`access_token\``;
  }

  if (error) {
    const errorMsg = log.error('[pocketAuthCallback]', error);
    res.send(errorMsg.join(' '));
  } else {
    const data = { code, access_token, username, consumer_key: POCKET_CONSUMER_KEY };
    log.success('to auth in pocket', data);

    req.app.locals = {
      ...req.app.locals,
      auth: {
        ...req.app.locals.auth,
        pocket: data,
      },
    };

    res.redirect('/');
  }

  return res;
}

module.exports = {
  pocketAuthCode,
  pocketAuthCallback,
};
