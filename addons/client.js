/**
 * NOTE: lots of silly code golf here, but... ¯\_(ツ)_/¯
 */
((GET_ATTRIBUTE, HEIGHT, ONE_HUNDRED_PERCENT) => {
  const pending = {};
  const handlers = {};
  const style = (e, o) => { for (let a in o) e.style[a] = o[a]; }
  const pushTask = (kind, ...args) => {
    if (handlers[kind]) handlers[kind](...args);
    else (pending[kind] ??= []).push(args);
  }
  const common = {
    width: ONE_HUNDRED_PERCENT,
    display: 'block',
  }
  const stretch = {
    ...common,
    [HEIGHT]: ONE_HUNDRED_PERCENT,
    position: 'absolute',
    inset: 0,
  }

  /**
   * NOTE: holdIt INTENTIONALLY GLOBAL (no need to say 'window')
   */
  onGenz = (kind, fn) =>{
    handlers[kind] = fn;
    let tasks = pending[kind];
    if (tasks) while (tasks.length) { fn(...tasks.pop()) }
  }

  /**
   * NOTE:
   * This does NOT use shadow
   * dom, so that page styles can be inherited
   * by whatever component implementation is used
   */
  customElements.define('gen-z', class CBox extends HTMLElement {
    constructor() {
      super();
    }

    wrap() {
      let ctx = this;
      let wrapper = ctx;
      if (ctx[GET_ATTRIBUTE]('ratio')) {
        ctx.innerHTML = `<div>${ctx.innerHTML}</div>`;
        wrapper = ctx.children[0];
        style(wrapper, stretch);
      }
      pushTask(ctx[GET_ATTRIBUTE]('is'), wrapper, ctx.dataset);
    }

    connectedCallback() {
      let ctx = this;
      let ratio = ctx[GET_ATTRIBUTE]('ratio');
      let height = ctx[GET_ATTRIBUTE](HEIGHT);
      ratio = ratio ? ratio.split('/') : ratio;
      style(ctx, 
          ratio
            ? {...common, [HEIGHT]: 0, position: 'relative', paddingBottom: ratio[1] / ratio[0] * 100 + '%'}
            : (
                height
                ? {...common, [HEIGHT]: height }
                : (
                  ctx.hasAttribute('stretch') ? stretch : {}
                )
              )
      );
      requestAnimationFrame(() => ctx.wrap());
    }
  });
})('getAttribute', 'height', '100%');
