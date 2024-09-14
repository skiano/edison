import fs from 'fs';
import { _, toStream } from '../genz.js';
import { Writable, Readable } from 'stream';
import assert from 'assert';

class ResponseLike extends Writable {
  constructor(options) {
    super(options);
    this.arr = [];
  }

  _write(chunk, encoding, next) {
    this.arr.push(chunk.toString());
    next();
  }

  _destroy(err, cb) {
    cb();
  }
}

export default [

  async function TEST_CONSUME_READABLE () {
    await new Promise((resolve) => {  
      const res = new ResponseLike();
  
      res.on('close', () => {
        assert.equal(res.arr.join(''), '<div><p>This is on disk</p></div>');
        resolve();
      });
  
      toStream(res, _.div(fs.createReadStream('test/_.example.html')));

    });
  },

  async function TEST_READABLE_ERROR () {
    await new Promise((resolve) => {
      const chunks = ['World ', 'Hello '];
      const failure = new Error('broken');
      const readable = new Readable({
        read() {
          const c = chunks.pop();
          if (c) {
            this.push(c);
          } else {
            this.destroy(failure);
          }
        }
      });

      const res = new ResponseLike();

      res.on('error', (error) => {
        assert.equal(error, failure);
      });

      res.on('close', () => {
        assert.equal(res.arr.join(''), '<div>Hello World Error!');
        resolve();
      });

      toStream(res, _.div(readable), {}, 'Error!');
    });
  },

];