const rpc = require('json-rpc2');
const bsv = require('bsv');
const net = require('net');
const fs = require('fs').promises;

const opts = {
  user: 'satoshi-278grhf937fh9i83guw4f',
  password: '3YQ5zjKe7c2LRQbvIUppSJAHyisVlYnmG6C8YVi1JOh9QS9pK',
  port: 18332,
  host: '192.168.1.186',
};

const node = rpc.Client.$create(opts.port, opts.host, opts.user, opts.password);
node.call('getminingcandidate', [true], (err, result) => {
  console.log(err, result);
});

node.call(
  'getblock',
  ['00000000000000550238a54b4f36e4b3cb81ff9ea463d3dcc0b44bbb7c2435ab', false],
  (err, result) => {
    console.log(err, result);
  }
);
