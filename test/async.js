import { _, traverse } from '../genz.js';
import assert from 'assert';

export default [

  async function TEST_RETURNS_PROMISES () {
    const p = Promise.resolve('a');
    const next = traverse(_.div(p));
    const f1 = next();
    const f2 = next();
    assert.equal(f1, '<div>', 'Should open');
    assert.equal(f2, p, 'Should pass back a promise');
  },

  async function TEST_MANUALLY_PROMISES () {
    const next = traverse(_.div(_.p(Promise.resolve('hi'))));

    const div_open = next();
    const p_open = next();
    const p_child_promise = next();
    const p_child = next(await p_child_promise);
    const p_close = next();
    const div_close = next();

    assert.equal(div_open, '<div>');
    assert.equal(p_open, '<p>');
    assert.equal(p_child, 'hi');
    assert.equal(p_close, '</p>');
    assert.equal(div_close, '</div>');
  },

];