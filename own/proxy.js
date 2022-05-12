const rpc = require('json-rpc2');
const bsv = require('bsv');
const bsvMin = require('bsv-minimal');
const net = require('net');
const fs = require('fs').promises;

let setup = {};
// let nonces = {};

function processMessage(data) {
  try {
    data = data
      .toString()
      .trim()
      .split('\n')
      .map((d) => JSON.parse(d));
    for (const obj of data) {
      if (obj.method === 'mining.notify') {
        const [
          id,
          prevhash,
          coinbase1,
          coinbase2,
          merkleProof,
          version,
          nBits,
          time,
        ] = obj.params;
        setup[id] = {
          id,
          prevhash,
          coinbase1,
          coinbase2,
          merkleProof,
          version,
          nBits,
          time,
        };
      } else if (obj.method === 'mining.submit') {
        // const [worker, id, extraNonce, time, nonce, version] = obj.params;
        // const { coinbase1, coinbase2, prevhash, nBits, merkleProof } =
        //   setup[id];
        // console.log('setup]id', setup[id]);
        // const coinbase = Buffer.concat([
        //   Buffer.from(coinbase1, 'hex'),
        //   Buffer.from('00', 'hex'), // Hard coded from logs!
        //   Buffer.from(extraNonce, 'hex'),
        //   Buffer.from(coinbase2, 'hex'),
        // ]);
        // const block = new bsvMin.Block();
        // let index = 0;
        // for (const hash of merkleProof) {
        //   block.addMerkleHash(index++, Buffer.from(hash, 'hex'));
        // }
        // return console.log('MERKLE', block);
        // const tx = bsvMin.Transaction.fromBuffer(Buffer.from(coinbase, 'hex'));
        // const bw = new bsvMin.utils.BufferWriter();
        // bw.write(Buffer.from(version, 'hex'));
        // // bw.writeInt32LE(prevHashes[id].version);
        // bw.write(Buffer.from(prevhash, 'hex').reverse());
        // // bw.write(Buffer.from(tx.getHash()).reverse()); // Merkleroot
        // bw.writeInt32LE(parseInt(time, 16));
        // bw.write(Buffer.from(nBits, 'hex').reverse());
        // bw.write(Buffer.from(nonce, 'hex'));
        // const header = bsvMin.Header.fromBuffer(bw.toBuffer());
        // console.log(
        //   header.getHash().toString('hex'),
        //   header,
        //   header.toBuffer().toString('hex')
        // );
        // console.log('submitBlock', solution);
      }
    }
  } catch (err) {
    console.log('ERROR', err);
  }
}

let client;
const pool = new net.Socket();
pool.on('connect', () => {
  console.log('connected');
});
pool.on('close', () => {
  console.log('close');
  client && client.end();
});
pool.on('data', (msg) => {
  // msg = `${msg.toString()}\n`;
  console.log(`TO S9: ${msg}`);
  client && client.write(msg);
  fs.appendFile('./proxy.txt', `TO S9: ${msg}`);

  // processMessage(msg);
});
pool.connect(1883, 'bsv.ss.poolin.com');

const server = net.createServer(function (clt) {
  client = clt;
  console.log(
    'Client connect. Client local address : ' +
      client.localAddress +
      ':' +
      client.localPort +
      '. client remote address : ' +
      client.remoteAddress +
      ':' +
      client.remotePort
  );
  client.setEncoding('utf-8');

  client.on('data', function (msg) {
    // msg = `${msg.toString()}\n`;
    console.log(`TO POOL: ${msg}`);
    pool && pool.write(msg);
    fs.appendFile('./proxy.txt', `TO POOL: ${msg}`);

    // processMessage(msg);
  });
  client.on('close', function () {
    console.log(`Client close`);
    pool && pool.end();
  });
});

server.listen(3333, '0.0.0.0', function () {
  console.log('Listening on 3333');
});
