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
node.call('getminingcandidate', [true], (err, result) => {
  console.log(err, result);
});

const key = 'L46kZSgkMthst5Nwq3GnvUwwaWAWE8TaoTGejd3LtFAYSkmKJnjy';
const address = bsv.Address.fromPrivKey(bsv.PrivKey.fromString(key));

const DIFFICULTY = 8192;
const NONCE1 = '00';
const NONCE2 = 'deadbeefdeadbeef';
const ASIC_MASK = '00c00000';
const ASIC_BOOST = true;

// const server = rpc.Server.$create();
// server.on('error', function (err) {
//   console.log('error', err);
// });
// server.expose('mining', {
//   subscribe: function (args, opts, callback) {
//     console.log(`subscribe`, args, opts);
//     callback(null, true);
//   },
//   set_difficulty: function (args, opts, callback) {
//     console.log(`set_difficulty`, args, opts);
//     callback(null, true);
//   },
//   notify: function (args, opts, callback) {
//     console.log(`notify`, args, opts);
//     callback(null, true);
//   },
//   authorize: function (args, opts, callback) {
//     console.log(`authorize`, args, opts);
//     callback(null, true);
//   },
//   configure: function (args, opts, callback) {
//     console.log(`configure`, args, opts);
//     callback(null, true);
//   },
// });

// // server.expose('mining.subscribe', (args, opts, callback) => {
// //   console.log(`mining.subscribe`, args, opts);
// //   callback(null, true);
// // });

// server.enableAuth(function (user, password) {
//   console.log('enableAuth', user, password);
//   return true;
// });
// server.listenRaw(3333, '0.0.0.0');
// console.log('here');

// const coinbases = {};
const prevHashes = {};

function sendMessage(obj, client) {
  console.log(`sendMessage`, JSON.stringify(obj));
  client.write(`${JSON.stringify(obj)}\n`);
}

function submitBlock(params) {
  const [worker, id, extraNonce, time, nonce, versionMiner] = params;
  // console.log(
  //   'PARAMSSS SUBMITBLOCK',
  //   coinbases[id].indexOf('aaaaaaaaaaaaaaaaaaffffffff'),
  //   params
  // );
  // const coinbase = prevHashes[id].coinbase.replace(
  //   'aaaaaaaaaaaaaaaaaaffffffff',
  //   `00${extraNonce}ffffffff`
  //   // `${extraNonce}00`
  //   // `00${Buffer.from(extraNonce, 'hex').reverse().toString('hex')}`
  //   // `${extraNonce}aaaaaaaa`
  //   // Buffer.from(extraNonce, 'hex').reverse().toString('hex')
  // );
  // console.log('BEFORE', prevHashes[id].coinbase, 'after', coinbase);
  // console.log('prev!!!!!!!!!!!', prevHashes[id]);
  let { prevhash, nBits, version, merkleProof, coinbase1, coinbase2 } =
    prevHashes[id];

  if (versionMiner) {
    const last_mask = parseInt(ASIC_MASK, 16);
    const version_bits = parseInt(versionMiner, 16);
    const job_version = parseInt(version, 16);

    version = (job_version & ~last_mask) | (version_bits & last_mask);
    const bw1 = new bsvMin.utils.BufferWriter();
    bw1.writeUInt32BE(version);
    version = bw1.toBuffer().toString('hex');
    // console.log('!!!!!!!!!!!!Using version', version);
  }

  const tx = bsvMin.Transaction.fromBuffer(
    Buffer.concat([
      Buffer.from(coinbase1, 'hex'),
      Buffer.from(NONCE1, 'hex'), // Hard coded extra nonce!
      Buffer.from(extraNonce, 'hex'),
      Buffer.from(coinbase2, 'hex'),
    ])
  );

  // console.log('Merkleroot', tx.getHash().toString('hex'));

  const solution = {
    id,
    nonce: parseInt(nonce, 16),
    time: parseInt(time, 16),
    version: parseInt(version, 16),
    coinbase: tx.toBuffer().toString('hex'),
    version: parseInt(version, 16),
  };
  // if (version2) solution.version = parseInt(version2, 16);

  // const MerkleTree = require('../merkle');
  // var test = new MerkleTree([]);
  // console.log('steps', test);
  let merkle = Buffer.from(tx.getHash()).reverse();
  merkleProof.map((m) => {
    merkle = bsvMin.utils.Hash.sha256sha256(
      Buffer.concat([merkle, Buffer.from(m, 'hex')])
    );
  });
  // merkle = test.withFirst().toString('hex');

  const bw = new bsvMin.utils.BufferWriter();
  // if (version) {
  //   bw.write(Buffer.from(version, 'hex').reverse());
  // } else {
  //   bw.writeUInt32LE(version);
  // }
  // bw.writeReverse(
  //   Buffer.from(
  //     version
  //       .match(/.{1,4}/g)
  //       .reverse()
  //       .join(''),
  //     'hex'
  //   )
  // );
  bw.writeReverse(Buffer.from(version, 'hex'));
  bw.writeReverse(Buffer.from(prevhash, 'hex'));
  bw.write(merkle);
  // bw.writeUInt32LE(parseInt(time, 16));
  bw.writeReverse(Buffer.from(time, 'hex'));
  bw.writeReverse(Buffer.from(nBits, 'hex'));
  bw.writeReverse(Buffer.from(nonce, 'hex'));
  // bw.writeUInt32LE(parseInt(nonce, 16));
  const bufHeader = bw.toBuffer();
  if (bufHeader.length !== 80) throw new Error(`Invalid header size`);
  const header = bsvMin.Header.fromBuffer(bufHeader);

  // const bw = new bsv.utils.BufferWriter();
  // // bw.write(Buffer.from(version, 'hex'));
  // bw.writeUInt32LE(parseInt(version, 16)); // Correct
  // bw.write(Buffer.from(prevhash, 'hex')); // Correct
  // bw.write(Buffer.from(merkle, 'hex')); // Merkleroot?
  // bw.writeUInt32LE(parseInt(time, 16)); // Correct
  // // bw.write(Buffer.from(time, 'hex'));
  // bw.write(Buffer.from(nBits, 'hex').reverse()); // Correct
  // // bw.write(Buffer.from(nBits, 'hex'));
  // // bw.write(Buffer.from(nonce, 'hex').reverse());
  // bw.writeUInt32LE(parseInt(nonce, 16)); // Correct?
  // const header = bsv.Header.fromBuffer(bw.toBuffer());

  console.log(
    header.getHash().toString('hex'),
    header,
    header.toBuffer().toString('hex')
  );

  console.log('submitBlock', solution);
  // console.log('coinbase', tx.getHash().toString('hex'), tx);
  node.call('submitminingsolution', [solution], (err, result) => {
    console.log('submitminingsolution', err, result);

    if (result !== 'high-hash') {
      console.log(
        `!!!!!!!!!!!!!!!!!!!!!! FOUND BLOCK !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`
      );
      console.log(
        `!!!!!!!!!!!!!!!!!!!!!! FOUND BLOCK !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`
      );
      console.log(
        `!!!!!!!!!!!!!!!!!!!!!! FOUND BLOCK !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`
      );
      console.log(
        `!!!!!!!!!!!!!!!!!!!!!! FOUND BLOCK !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`
      );
      console.log(
        `!!!!!!!!!!!!!!!!!!!!!! FOUND BLOCK !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`
      );
      console.log(solution);
      console.log(
        `!!!!!!!!!!!!!!!!!!!!!! FOUND BLOCK !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`
      );
      console.log(
        `!!!!!!!!!!!!!!!!!!!!!! FOUND BLOCK !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`
      );
      console.log(
        `!!!!!!!!!!!!!!!!!!!!!! FOUND BLOCK !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`
      );
      console.log(
        `!!!!!!!!!!!!!!!!!!!!!! FOUND BLOCK !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`
      );
      console.log(
        `!!!!!!!!!!!!!!!!!!!!!! FOUND BLOCK !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`
      );
      console.log(
        `!!!!!!!!!!!!!!!!!!!!!! FOUND BLOCK !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`
      );
      fs.appendFile(
        './foundblock.txt',
        `FOUND BLOCK (${result}) at ${+new Date()}: ${JSON.stringify(
          solution
        )}\n`
      );
    }
    if (err) {
      console.log(`!!!!!!!!!!!!!!!!!! ERROR !!!!!!!!!!!!!!!!!!!!!!!`, err);
      fs.appendFile(
        './foundblock.txt',
        `ERROR (${result}) at ${+new Date()}: ${JSON.stringify(err)}\n`
      );
    }
  });
}

function getCoinbase(client) {
  return new Promise((resolve, reject) => {
    node.call('getminingcandidate', [true], (err, result) => {
      if (err) return reject(err);

      const script = new bsv.Script();
      script.writeBuffer(bsv.Bn(result.height).toBuffer().reverse());
      script.writeBuffer(Buffer.from('/sanctum/'));
      // script.writeBuffer(Buffer.from('aadeadbeefdeadbeef', 'hex'));
      script.writeBuffer(
        Buffer.concat([Buffer.from(NONCE1, 'hex'), Buffer.from(NONCE2, 'hex')])
      );

      const txb = new bsv.TxBuilder();
      txb.inputFromScript(
        Buffer.alloc(32),
        parseInt(0xffffffff),
        bsv.TxOut.fromProperties(
          bsv.Bn(0),
          new bsv.Script().fromPubKeyHash(address.hashBuf)
        ),
        script
        // bsv.Script.fromA // TODO: Add custom coinbase script!
      ); // Fake input to estimate size properly
      // txb.outputToScript(bsv.Bn(0), bsv.Script.fromAsmString(script))
      txb.outputToAddress(bsv.Bn(result.coinbaseValue), address);
      txb.buildInputs(bsv.Bn(0), 1);
      txb.buildOutputs();
      // console.log('tx', txb.tx, txb.tx.toBuffer().toString('hex'));

      // result.nBits = '00002000'; // TODO: Remove! Debug only

      const tx = txb.tx.toBuffer().toString('hex');
      // coinbases[result.id] = tx;

      // const split = tx.split('aadeadbeefdeadbeef');
      const split = tx.split(`${NONCE1}${NONCE2}`);
      if (split.length !== 2) throw new Error('Error splitting coinbase');
      const coinbase1 = split[0];
      const coinbase2 = split[1];

      // console.log('coinbase', tx, coinbase1, coinbase2);

      // console.log(
      //   'result',
      //   // bsv.Bn(result.version).toBuffer().toString('hex'),
      //   result
      // );

      const bw1 = new bsvMin.utils.BufferWriter();
      bw1.writeUInt32BE(result.version);
      const version = bw1.toBuffer().toString('hex');
      // const version = '00000000';

      const nBits = result.nBits; // Buffer.from(result.nBits, 'hex').reverse().toString('hex');
      // const nBits = '00004000'; // TODO: FIX!

      // const bw2 = new bsvMin.utils.BufferWriter();
      // // bw2.writeUInt32LE(result.nBits);
      // bw2.writeUInt32LE(DIFFICULTY);
      // const nBits = bw2.toBuffer().toString('hex');

      const bw3 = new bsvMin.utils.BufferWriter();
      bw3.writeUInt32BE(result.time);
      const time = bw3.toBuffer().toString('hex');
      // const time = '00000000';

      // const prevhash = Buffer.from(result.prevhash, 'hex').toString('hex');
      //   .reverse()
      //   .toString('hex');
      // const prevhash = Buffer.alloc(32).toString('hex');
      // const prevhash = Buffer.from(result.prevhash, 'hex')
      //   .reverse()
      //   .toString('hex');
      // const prevhash =
      //   '1111111111111111111111111111111100000000000000000000000000000000';
      // const prevhash =
      // '6666666655555555111111111111111122222222222222223333333333333333';
      // 0000000000000000111111111111111122222222222222223333333333333333
      const prevhash = result.prevhash;
      const merkleProof = result.merkleProof;

      prevHashes[result.id] = {
        prevhash,
        nBits,
        version,
        coinbase1,
        coinbase2,
        merkleProof,
      };

      const params = [
        result.id,
        // prevhash,
        prevhash
          .match(/.{1,8}/g)
          .reverse()
          .join(''),
        coinbase1,
        coinbase2,
        result.merkleProof,
        // [],
        version,
        nBits,
        time,
        // Buffer.from(version, 'hex').toString('hex'),
        // Buffer.from(nBits, 'hex').toString('hex'),
        // Buffer.from(time, 'hex').toString('hex'),
        true, // TODO: Turn to false
      ];
      console.log('sending to S9', params);
      sendMessage(
        {
          id: null,
          params,
          method: 'mining.notify',
          error: null,
        },
        client
      );
      resolve(params);
      setTimeout(() => {
        getCoinbase(client);
      }, 1000 * 10);
    });
  });
}

async function processMessage(data, client) {
  try {
    console.log('Received:', data);
    const json = JSON.parse(data);
    // console.log(json);
    const { id, method, params, error } = json;
    if (method === 'mining.subscribe') {
      sendMessage(
        {
          id,
          result: [
            [
              ['mining.set_difficulty', '00'],
              ['mining.notify', '00'],
            ],
            NONCE1,
            NONCE2.length / 2,
          ],
          error: null,
        },
        client
      );

      getCoinbase(client);
    } else if (method === 'mining.authorize') {
      sendMessage(
        {
          id,
          result: true,
          error: null,
        },
        client
      );
      sendMessage(
        {
          id: null,
          method: 'mining.set_difficulty',
          params: [DIFFICULTY],
          error: null,
        },
        client
      );
    } else if (method === 'mining.configure') {
      console.log(method, params);
      if (ASIC_BOOST) {
        sendMessage(
          {
            id,
            result: {
              'version-rolling': true,
              'version-rolling.mask': ASIC_MASK,
            },
            error: null,
          },
          client
        );
        sendMessage(
          {
            id: null,
            method: 'mining.set_version_mask',
            params: [ASIC_MASK],
            error: null,
          },
          client
        );
      } else {
        sendMessage(
          {
            id,
            result: {
              'version-rolling': false,
              // 'version-rolling.mask': '00c00000',
            },
            error: null,
          },
          client
        );
      }
    } else if (method === 'mining.submit') {
      submitBlock(params);
      sendMessage(
        {
          id,
          result: true,
          error: null,
        },
        client
      );
    } else {
      sendMessage(
        {
          id,
          result: true,
          error: null,
        },
        client
      );
    }
  } catch (err) {
    console.log('ERROR', data, err);
  }
}

const server = net.createServer(function (client) {
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
  client.setTimeout(10000);

  client.on('data', function (data) {
    // console.log(`Client data`, data);
    data
      .trim()
      .split('\n')
      .map((d) => processMessage(d, client));
  });
  client.on('end', function () {
    console.log(`Client end`);
  });
});

server.listen(3333, '0.0.0.0', function () {
  console.log('Listening on 3333');
});
