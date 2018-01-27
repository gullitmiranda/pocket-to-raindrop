const chalk = require('chalk');

const error = (label, ...args) => {
  label = ['Error:', label].join(' ');
  const msg = [label, ...args];
  console.error(...msg);
  return msg;
};

const success = (label, ...args) => {
  label = ['Success', label].join(' ');
  const msg = [label, ...args];
  console.log(chalk.green(label), ...args);
  return msg;
};

module.exports = {
  ...console,
  success,
  error,
};
