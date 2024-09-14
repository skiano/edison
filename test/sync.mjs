import assert from 'assert';
import { _, toString, dedupe, css, mediaQuery } from '../genz.mjs';

export default [

  function TEST_BASIC () {
    const tag = _.div('hello', _.p({ class: 'world' }));
    const txt = toString(tag);
    assert.equal(txt, '<div>hello<p class="world"></p></div>');
  },

  function TEST_OMISSION () {
    const tag = _.div('hello', null, [false, [undefined]], 0);
    const txt = toString(tag);
    assert.equal(txt, '<div>hello0</div>')
  },

  function TEST_NESTED_EXAMPLE () {
    const content = _.html(
      _.head(
        _.title('Hello World'),
      ),
      _.body(
        _.p('P 1'),
        _.p('P 2'),
      ),
    );

    const txt = toString(content);

    assert.equal(
      txt,
      '<!DOCTYPE html><html><head><title>Hello World</title></head><body><p>P 1</p><p>P 2</p></body></html>'
    );
  },

  function TEST_DEDUPING () {
    const once = dedupe(_.style('{{ unique }}'), 'component-style');
    const multi = _.style('{{ repeat }}');

    const content = _.body(
      once,
      _.div(
        once,
        multi,
      ),
      multi
    );

    const txt = toString(content);

    assert.equal(
      txt,
      '<body><style>{{ unique }}</style><div><style>{{ repeat }}</style></div><style>{{ repeat }}</style></body>'
    );
  },

  function TEST_LAZY_FUNCTIONS () {

    const content = _.div(
      () => _.p(['lazy', ' day'])
    );

    const txt = toString(content);

    assert.equal(txt, '<div><p>lazy day</p></div>');
  },

  function TEST_LAZY_FUNCTIONS_CTX () {

    const content = _.div(
      (ctx) => _.p(['lazy ', ctx.user])
    );

    const txt = toString(content, { user: 'greg' });

    assert.equal(txt, '<div><p>lazy greg</p></div>');
  },

  function TEST_CSS_SINGLE_SELECTOR () {
    const style = css('.foo', {
      background: 'red',
      color: 'blue',
    });
    const txt = toString(style);
    assert.equal(txt, '.foo{background:red;color:blue;}');
  },

  function TEST_CSS_MULTI_SELECTOR () {
    const style = css(['.foo', '#bar'], {
      background: 'red',
      color: 'blue',
    });
    const txt = toString(style);
    assert.equal(txt, '.foo,#bar{background:red;color:blue;}');
  },

  function TEST_CSS_MERGE_DECLARATIONS () {
    const style = css('p', {
      background: 'red',
    }, {
      color: 'blue',
    });
    const txt = toString(style);
    assert.equal(txt, 'p{background:red;color:blue;}');
  },

  function TEST_MEDIA_QUERY () {
    const style = mediaQuery('screen and (min-width: 480px)', [
      css('a', {
        background: 'red',
      }),
      css('p', {
        'font-size': 'red',
      }),
    ]);

    const txt = toString(style);
    assert.equal(txt, '@media screen and (min-width: 480px) {a{background:red;}p{font-size:red;}}');
  },

  function TEST_ALLOW_CAMEL_CASE_KEYS () {
    const style = css('p', { backgroundColor: 'red', fontSize: 'red' });
    const txt = toString(style);
    assert.equal(txt, 'p{background-color:red;font-size:red;}');
  },

];
