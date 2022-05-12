const Daemon = require('../src/daemon');

const daemon = new Daemon({
  user: 'satoshi-278grhf937fh9i83guw4f',
  password: '3YQ5zjKe7c2LRQbvIUppSJAHyisVlYnmG6C8YVi1JOh9QS9pK',
  port: 18332,
  host: '192.168.1.186',
  name: 'BSV',
});

daemon.call('getinfo').then(function (mininginfo) {
  console.log(mininginfo);
});
