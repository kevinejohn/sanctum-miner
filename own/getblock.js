const rpc = require('json-rpc2');
const bsv = require('bsv');
const bsvMin = require('bsv-minimal');
const net = require('net');
const fs = require('fs').promises;

const opts = {
  user: 'satoshi-278grhf937fh9i83guw4f',
  password: '3YQ5zjKe7c2LRQbvIUppSJAHyisVlYnmG6C8YVi1JOh9QS9pK',
  port: 18332,
  host: '192.168.1.186',
};

const node = rpc.Client.$create(opts.port, opts.host, opts.user, opts.password);
// node.call('getminingcandidate', [true], (err, result) => {
//   console.log(err, result);
// });

node.call(
  'getblock',
  ['00000000000002efac5c95a1b271f2dad271c7fe822b448409cf103c7460c8cb', false],
  (err, result) => {
    console.log(err, result);
    const header = bsvMin.Header.fromBuffer(Buffer.from(result, 'hex'));
    console.log(header);
  }
);
