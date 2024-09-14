import assert from 'assert';
import { Window } from "happy-dom";
import { islandTrigger } from '../addons/islands.mjs';
import { _, toString } from '../genz.mjs';

export default [
  function TEST_ISLAND_TRIGGER_EXISTS() {
    assert(typeof islandTrigger() === 'string', 'trigger string exists');
  },

  async function TEST_RATIO_ISLAND() {
    const window = new Window({});
    const document = window.document;

    // NOTE: some weird problem inside happy-dom makes the
    // custom element behave wrong if I write the whole page in one pass... :(
    document.write(toString(_.script(islandTrigger)));
    document.write(`<gen-z ratio="8/4"><p>Content</p></gen-z>`);
    const elm = document.querySelector('gen-z');
    
    // BEFORE REFLOW
    assert.equal(elm.style.display, 'block', 'Sets custom element to display block');
    assert.equal(elm.style.height, '0px', 'Sets ratio wrapper height to 0');
    assert.equal(elm.style.width, '100%', 'ratio wrapper fills parent');
    assert.equal(elm.style.paddingBottom, '50%', 'ratio wrapper fills parent');
    assert.equal(elm.style.position, 'relative', 'ratio wrapper gets ready for child wrapper');

    // AFTER REFLOW
    await window.happyDOM.waitUntilComplete();
    assert.equal(elm.firstChild.firstChild.outerHTML, '<p>Content</p>', 'ratio should wrap content in a wrapper');
    assert.equal(elm.firstChild.style.position, 'absolute', 'child wrapper should be absolute');
    assert.equal(elm.firstChild.style.width, '100%', 'child wrapper should fill x');
    assert.equal(elm.firstChild.style.height, '100%', 'child wrapper should fill y');
    assert.equal(elm.firstChild.style.inset, '0', 'child wrapper should stretch four ways');

    // CLEANUP
    await window.happyDOM.close();
  },

  async function TEST_HEIGHT_ISLAND() {
    const window = new Window({});
    const document = window.document;

    // NOTE: some weird problem inside happy-dom makes the
    // custom element behave wrong if I write the whole page in one pass... :(
    document.write(toString(_.script(islandTrigger)));
    document.write(`<gen-z height="50vh"><main>Stuff</main></gen-z>`);
    const elm = document.querySelector('gen-z');
    
    // BEFORE REFLOW
    assert.equal(elm.style.display, 'block', 'Sets custom element to display block');
    assert.equal(elm.style.height, '50vh', 'Sets uses wrapper height');
    assert.equal(elm.style.width, '100%', 'ratio wrapper fills parent');
    assert.equal(elm.firstChild.outerHTML, '<main>Stuff</main>', 'respects content');

    // AFTER REFLOW
    await window.happyDOM.waitUntilComplete();
    assert.equal(elm.firstChild.outerHTML, '<main>Stuff</main>', 'height should NOT add extra wrapper around content');

    // CLEANUP
    await window.happyDOM.close();
  },

  async function TEST_STRETCH_ISLAND() {
    const window = new Window({});
    const document = window.document;

    // NOTE: some weird problem inside happy-dom makes the
    // custom element behave wrong if I write the whole page in one pass... :(
    document.write(toString(_.script(islandTrigger)));
    document.write(`<gen-z stretch><section>filler</section></gen-z>`);
    const elm = document.querySelector('gen-z');
    
    // BEFORE REFLOW
    assert.equal(elm.style.display, 'block', 'Sets custom element to display block');
    assert.equal(elm.style.position, 'absolute', 'custom element should be absolute');
    assert.equal(elm.style.width, '100%', 'custom element should fill x');
    assert.equal(elm.style.height, '100%', 'custom element should fill y');
    assert.equal(elm.style.inset, '0', 'custom element should stretch four ways');

    // AFTER REFLOW
    await window.happyDOM.waitUntilComplete();
    assert.equal(elm.firstChild.outerHTML, '<section>filler</section>', 'height should NOT add extra wrapper around content');

    // CLEANUP
    await window.happyDOM.close();
  },

  // TODO: make sure passing no size option works too...

  async function TEST_STRETCH_LAZY_INSTANTIATION() {
    const window = new Window({});
    const document = window.document;
    document.write(toString(_.script(islandTrigger)));
    document.write(`<gen-z id="t1" is="A" ratio="1/1"><section>filler</section></gen-z>`);
    document.write(`<gen-z id="t2" is="A" height="100px"><section>filler</section></gen-z>`);
    document.write(`<gen-z id="t3" is="B" data-prop="foo" height="200px"><section>filler</section></gen-z>`);
    document.write(`<gen-z id="t4" is="B" data-prop="foo"><section>filler</section></gen-z>`);

    // WAIT FOR ANY POTENTIAL REFLOW
    await window.happyDOM.waitUntilComplete();

    // SIMULATE LOADING A COMPONENT RENDERER LATER
    await new Promise((r) => setTimeout(r, 15));
    let handleA = [];
    let handleB = [];
    window.onGenZ('A', (...args) => { handleA.push(args) });
    window.onGenZ('B', (...args) => { handleB.push(args) });

    assert.equal(handleA.length, 2, 'handles all component a');
    assert.equal(handleB.length, 2, 'handles all component b');

    // notice because of the pop()... the components instantiate backwords in the first pass
    assert.equal(handleA[0][0], document.getElementById('t2'), 'uses the outer wrapper as root for island');
    assert.equal(handleA[1][0], document.getElementById('t1').firstChild, 'uses the inner wrapper as root for ratio islands');
    assert.equal(handleB[0][0], document.getElementById('t4'), 'handles second b');
    assert.equal(handleB[1][0], document.getElementById('t3'), 'handles first b');

    // SIMULATE A NEW COMPONENT BEING ADDED TO THE PAGE
    document.write(`<gen-z id="t5" is="A" data-a="foo" data-b="bar"></gen-z>`);
    document.write(`<gen-z id="t6" is="B"></gen-z>`);
    await window.happyDOM.waitUntilComplete();

    assert.equal(handleA[2][0], document.getElementById('t5'), 'handles A after instantiation');
    assert.equal(handleB[2][0], document.getElementById('t6'), 'handles B after instantiation');

    assert.equal(handleA[2][1].a, 'foo', 'handles prop a');
    assert.equal(handleA[2][1].b, 'bar', 'handles prop a');

    // CLEANUP
    await window.happyDOM.close();
  },
]