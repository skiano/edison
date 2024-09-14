import assert from 'assert';
import { Writable } from 'stream';
import { _, toStream } from '../genz.js';

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

  // async function TEST_STREAM_EXAMPLE () {
  //   await new Promise((resolve, reject) => {
  //     const res = new ResponseLike({ highWaterMark: 6 });

  //     res.on('drain', () => {
  //       res.arr.push('DRAIN');
  //     });

  //     res.on('close', () => {
  //       assert.equal(res.arr.join(' '), '<div> <section> DRAIN section! DRAIN </section> DRAIN <p> hello </p> </div> DRAIN');
  //       resolve();
  //     });

  //     res.on('error', reject);

  //     toStream(res, _.div(_.section('section!'), _.p('hello')));
  //   });
  // },

  async function TEST_ASYNC_DATA_FETCHING_FROM_CTX () {

    await new Promise((resolve, reject) => {
      const res = new ResponseLike();
      res.on('error', reject);
      res.on('close', () => {
        assert.equal(res.arr.join(''), '<!DOCTYPE html><html><head></head><body><main class="page__wrap"><section><p>hello Greg</p></section><section class="page"><section class="article"><h2 class="article__title">Cool Article</h2><div class="article__body"><p>Wow! a paragraph</p></div></section></section></main></body></html>');
        resolve();
      });

      // Some Example "components"

      const fetchArticle = (id) => {
        return Promise.resolve({
          123: {
            title: 'Cool Article',
            content: [
              { elm: 'p', value: 'Wow! a paragraph' },
            ],
          },
        }[id]);
      };

      const Profile = _.section((ctx) => {
        return _.p(`hello ${ctx.username}`)
      });

      const Article = (article) => {
        return _.section({ class: 'article' }, 
          _.h2({ class: 'article__title' }, article.title),
          _.div({ class: 'article__body' },
            article.content.map(({ elm, value }) => {
              return _[elm](value)
            })
          )
        );
      };

      const ArticlePage = _.section({ class: 'page' }, async (ctx) => {
        const article = await fetchArticle(ctx.articleId);
        return Article(article);
      });

      const Page = (...content) => {
        return _.main(
          { class: 'page__wrap' },
          ...content
        );
      };

      const App = _.html(
        _.head(),
        _.body(
          Page(
            Profile,
            ArticlePage
          )
        )
      );

      // Rendering the components with a "context"

      const ctx =  {
        username: 'Greg',
        articleId: 123,
      };

      toStream(res, App, ctx);
    });
  },

  async function TEST_SYNC_ERROR () {
    await new Promise((resolve, reject) => {
      const failure = new Error('busted');
      const res = new ResponseLike();
  
      let handled = [];
      res.on('error', (err) => {
        handled.push(err);
      });

      res.on('close', () => {
        assert.equal(handled[0], failure), 'Should emit error';
        assert(res.arr.length === 3, 'Should stop pushing after error');
        assert(res.arr[2].includes('Oops! Something went very wrong.'), 'should have default error message');
        resolve();
      });

      toStream(res, _.div('hello', () => { throw failure; }));
    });
  },

  async function TEST_ERROR_WHILE_CAN_WRITE () {
    await new Promise((resolve, reject) => {
      const failure = new Error('busted');
      const res = new ResponseLike();
  
      let handled = [];
      res.on('error', (err) => {
        handled.push(err);
      });

      res.on('close', () => {
        assert.equal(handled[0], failure), 'Should emit error';
        assert(res.arr.length === 3, 'Should stop pushing after error');
        assert(res.arr[2].includes('Oops! Something went very wrong.'), 'should have default error message');
        resolve();
      });

      toStream(res, _.div('hello', () => Promise.reject(failure)));
    });
  },

  async function TEST_ERROR_WHILE_CANNOT_WRITE () {
    await new Promise((resolve, reject) => {
      const failure = new Error('busted');
      const res = new ResponseLike({ highWaterMark: 1 }); // act like it needs draining really early
  
      let handled = [];
      res.on('error', (err) => {
        handled.push(err);
      });

      res.on('close', () => {
        assert.equal(handled[0], failure), 'Should emit error';
        assert(res.arr.length === 3, 'Should stop pushing after error');
        assert(res.arr[2].includes('Oops! Something went very wrong.'), 'should have default error message');
        resolve();
      });

      toStream(res, _.div('hello world', () => Promise.reject(failure)));
    });
  },

  async function TEST_CUSTOM_ERROR_MESSAGE () {
    await new Promise((resolve, reject) => {
      const failure = new Error('busted');
      const res = new ResponseLike({ highWaterMark: 1 }); // act like it needs draining really early
  
      let handled = [];
      res.on('error', (err) => {
        handled.push(err);
      });

      res.on('close', () => {
        assert.equal(handled[0], failure), 'Should emit error';
        assert(res.arr.length === 3, 'Should stop pushing after error');
        assert(res.arr[2].includes('this is an <em>error!</em>'), 'should have custom error message');
        resolve();
      });

      const ctx = {};
      const content = _.div('hello world', () => Promise.reject(failure));
      const errorRender = ['this is an ', _.em('error!')];
      toStream(res, content, ctx, errorRender);
    });
  },

];