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
]