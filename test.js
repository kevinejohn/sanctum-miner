const bsv = require('bsv-minimal');
const b = require('bsv');
var MerkleTree = require('./merkle.js');

// const key = 'L46kZSgkMthst5Nwq3GnvUwwaWAWE8TaoTGejd3LtFAYSkmKJnjy';
// const address = bsv.Address.fromPrivKey(bsv.PrivKey.fromString(key));

// const script = new bsv.Script();
// script.writeBuffer(bsv.Bn(144444).toBuffer().reverse());
// script.writeBuffer(Buffer.from('/symbols/'));
// script.writeBuffer(Buffer.from('deadbeef', 'hex'));

// const txb = new bsv.TxBuilder();
// txb.inputFromScript(
//   Buffer.alloc(32),
//   parseInt(0xffffffff),
//   bsv.TxOut.fromProperties(
//     bsv.Bn(0),
//     new bsv.Script().fromPubKeyHash(address.hashBuf)
//   ),
//   script
//   // bsv.Script.fromA // TODO: Add custom coinbase script!
// ); // Fake input to estimate size properly
// // txb.outputToScript(bsv.Bn(0), bsv.Script.fromAsmString(script))
// txb.outputToAddress(bsv.Bn(78000000), address);
// txb.buildInputs(bsv.Bn(0), 1);
// txb.buildOutputs();
// const tx = txb.tx;
// console.log(tx.txIns[0].script);
// // console.log(tx.txOuts[0].script);
// console.log('tx', txb.tx, txb.tx.toBuffer().toString('hex'));

// const blockHex =
//   '00000020bf8e32a3db41bd48003989934b0652509566dbe74953a225407c000000000000b13e8dbf0c6e5da9fae4c1ba068f298b17dd2422cfe564ceddd9d40bb5a451dd86441f61d116031ae52f49680102000000010000000000000000000000000000000000000000000000000000000000000000ffffffff1d03350816105361746f736869204e616b616d6f746f300000014c055655ffffffff02062c9c04000000001976a914b85e201070afbb3e14893b1eeb0385d952d87cf088acc2eb0b00000000001976a91445ac90190d0c95e3f14ddcda1a7902d5070536cc88ac00000000';
// const block = bsv.Block.fromBuffer(Buffer.from(blockHex, 'hex'));
// console.log(block);
// console.log(block.header.getHash().toString('hex'));
// for (const tx of block.getTransactions()) {
//   // console.log(tx.getHash().toString('hex'));
//   const script = b.Script.fromBuffer(tx.inputs[0].scriptBuffer);
//   console.log(script.chunks[2]);
// }

// 03350816
// 10
// 5361746f736869204e616b616d6f746f
// 300000014c055655

// const buf = Buffer.from(
//   '5503a4b20a041bfd1e612f2ffabe6d6d3a8f7ca09d1be0d1a0d582d12048de67dc858e92dd4ac0ebd87c260781b5494601000000000000009f3c8807e2127253aab19bc510529ba40d754f97cf',
//   'hex'
// );
// console.log(buf.toString());
// const br = new bsv.utils.BufferReader(buf);
// const res = br.readVarLengthBuffer();
// console.log(res, br);

const res1 =
  '{"id":null,"method":"mining.notify","params":["0$!@-rEfX:dWV?<HZh]LA-o0yO5C}pO1{IEXEB?.E0=$n","224e18a97273dfcbdd4014a83f7afa7c8213db5607ca5cc20000000000000000","01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff5503ccb20a047a551f612f2ffabe6d6d6abab6fa375ce381ca7945f08a2de5fd4e62e8f4dd05a47fcce4f365f3b0d65d01000000000000009f3c8807e2127253aab19bc510529ba40ddab90d95","ffffffff036ad04025000000001976a9140d8ba95f863f90dc97d6a038e73dba6036b4070588ac0000000000000000266a24b9e11b6d0b25cb3d2a3b2b35228bf84e433f385d4a2be1490e4d87d3738110efffe8604b00000000000000002b6a2952534b424c4f434b3af52002596e2bc0042b544194d75d2290bae0a0436ebbe981b246c72700372f30e17c7c1e",["09c61b2a0a452ba24fc9e9b4e4cf26858b6bfcc2fa150e4f0ffabcefab9f80e2","c9dc79f26e98dd9dc7d2c7e8a0fe1b46d009b4e17263e2978ecb3cd0e9252ad3","4e2735d75d1c1daf068de6eb818bb66b7c85c0afec0dfa30e2f6ef8495579333"],"20000000","1813dfbe","611f5577",false]}';
const res2 =
  '{"params": ["akaminer1.001", "0$!@-rEfX:dWV?<HZh]LA-o0yO5C}pO1{IEXEB?.E0=$n", "b222000000000000", "611f5577", "aad46ed0", "00c00000"], "id": 4752, "method": "mining.submit"}';

let [
  id1,
  prevhashStratum,
  coinbase1,
  coinbase2,
  merkleProof,
  versionIn,
  nBits,
  timeIn,
] = JSON.parse(res1).params;

const [worker, id2, extraNonce, time, nonce, version] = JSON.parse(res2).params;

const coinbase = Buffer.concat([
  Buffer.from(coinbase1, 'hex'),
  Buffer.from('00', 'hex'), // Hard coded from logs!
  Buffer.from(extraNonce, 'hex'),
  Buffer.from(coinbase2, 'hex'),
]);

const tx = bsv.Transaction.fromBuffer(Buffer.from(coinbase, 'hex'));
// console.log('TEST', coinbase.length, tx.toBuffer().length);

// tx reverse, nonreverse

// unshift, pop pop
// unshift, shift shift
// push, pop pop
// push, shift shift

const prevhash = prevhashStratum
  .match(/.{1,8}/g)
  .reverse()
  .join('');

// console.log('OIWJEFOIJWEOIFJ', prevhash);

// function getHeaders(merkle) {
//   const bw = new bsv.utils.BufferWriter();
//   // bw.write(Buffer.from(version, 'hex'));
//   bw.writeUInt32LE(parseInt(version, 16)); // Correct
//   bw.write(Buffer.from(prevhash, 'hex')); // Correct
//   bw.write(Buffer.from(merkle, 'hex')); // Merkleroot?
//   bw.writeUInt32LE(parseInt(time, 16)); // Correct
//   // bw.write(Buffer.from(time, 'hex'));
//   bw.write(Buffer.from(nBits, 'hex').reverse()); // Correct
//   // bw.write(Buffer.from(nBits, 'hex'));
//   // bw.write(Buffer.from(nonce, 'hex').reverse());
//   bw.writeUInt32LE(parseInt(nonce, 16)); // Correct?
//   const header = bsv.Header.fromBuffer(bw.toBuffer());

//   const bw2 = new bsv.utils.BufferWriter();
//   // bw.write(Buffer.from(version, 'hex'));
//   bw2.writeUInt32LE(parseInt(version, 16)); // Correct
//   bw2.write(Buffer.from(prevhash, 'hex')); // Correct
//   bw2.write(Buffer.from(merkle, 'hex').reverse()); // Merkleroot?
//   bw2.writeUInt32LE(parseInt(time, 16)); // Correct
//   // bw.write(Buffer.from(time, 'hex'));
//   bw2.write(Buffer.from(nBits, 'hex').reverse()); // Correct
//   // bw.write(Buffer.from(nBits, 'hex'));
//   // bw.write(Buffer.from(nonce, 'hex').reverse());
//   bw2.writeUInt32LE(parseInt(nonce, 16)); // Correct?
//   const header2 = bsv.Header.fromBuffer(bw2.toBuffer());

//   console.log(
//     header.getHash().toString('hex'),
//     '\n',
//     header2.getHash().toString('hex')
//   );
// }

let merkle;

// merkleProof.unshift(Buffer.from(tx.getHash()).reverse().toString('hex'));
// while (merkleProof.length > 1) {
//   const one = merkleProof.shift();
//   const two = merkleProof.shift();
//   const concat = Buffer.concat([
//     Buffer.from(one, 'hex'),
//     Buffer.from(two, 'hex'),
//   ]);
//   const next = bsv.utils.Hash.sha256sha256(concat).toString('hex');
//   merkleProof.unshift(next);
// }
// merkle = merkleProof.pop();
// getHeaders(merkle);

// merkleProof.unshift(Buffer.from(tx.getHash()).toString('hex'));
// while (merkleProof.length > 1) {
//   const one = merkleProof.shift();
//   const two = merkleProof.shift();
//   const concat = Buffer.concat([
//     Buffer.from(one, 'hex'),
//     Buffer.from(two, 'hex'),
//   ]);
//   const next = bsv.utils.Hash.sha256sha256(concat).toString('hex');
//   merkleProof.unshift(next);
// }
// merkle = merkleProof.pop();
// getHeaders(merkle);

// merkleProof.push(Buffer.from(tx.getHash()).reverse().toString('hex'));
// merkleProof.reverse();
// // merkleProof = merkleProof.map((m) =>
// //   Buffer.from(m, 'hex').reverse().toString('hex')
// // );
// // merkleProof.unshift(Buffer.from(tx.getHash()).toString('hex'));

// // console.log(Buffer.from(tx.getHash()).toString('hex'), merkleProof);
// while (merkleProof.length > 1) {
//   const one = merkleProof.shift();
//   const two = merkleProof.shift();
//   // console.log(one, two);
//   const concat = Buffer.concat([
//     Buffer.from(one, 'hex'),
//     Buffer.from(two, 'hex'),
//   ]);
//   const next = bsv.utils.Hash.sha256sha256(concat).toString('hex');
//   merkleProof.unshift(next);
// }
// merkle = merkleProof.pop();

console.log('merkle', merkleProof);
// merkleProof.reverse();
// var test = new MerkleTree(merkleProof.map((m) => Buffer.from(m, 'hex')));
var test = new MerkleTree([]);
// console.log('steps', test);
test.steps = merkleProof.map((m) => Buffer.from(m, 'hex')); //.reverse();
merkle = test.withFirst(Buffer.from(tx.getHash()).reverse()).toString('hex');

const bw = new bsv.utils.BufferWriter();
bw.writeReverse(Buffer.from(version, 'hex')); // Correct
bw.writeReverse(Buffer.from(prevhash, 'hex')); // Correct
bw.writeReverse(Buffer.from(merkle, 'hex'));
bw.writeReverse(Buffer.from(time, 'hex')); // Correct
bw.writeReverse(Buffer.from(nBits, 'hex')); // Correct
bw.writeReverse(Buffer.from(nonce, 'hex')); // Correct
const bufHeader = bw.toBuffer();
if (bufHeader.length !== 80) throw new Error(`Invalid header size`);
const header = bsv.Header.fromBuffer(bufHeader);

console.log(
  header.getHash().toString('hex'),
  header
  // header.toBuffer().toString('hex')
);
