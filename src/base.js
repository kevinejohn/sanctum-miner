const Debug = require('debug');
const EventEmitter = require('eventemitter3');

class Base extends EventEmitter {
  static debug(...msg) {
    console.log(this.constructor.name + ': ', ...msg);

    return typeof msg === 'object' ? msg.join(', ') : msg;
  }
}

module.exports = Base;
