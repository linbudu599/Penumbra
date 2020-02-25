## 写在前面

看了那么多文章，是时候也来回馈一下掘金这个让我等小白获益匪浅的社区了(●'◡'●)，这篇文章主要面对的是在阅读网上其他讲解 Koa2 源码文章后仍有疑惑的同学，因为我也花了两天的时间来彻底搞清它的源码机制，所以这算是刚出新手村就来回馈了~

这篇文章可能显得有些啰嗦，因为大部分文章的作者是有一定开发经验的带哥，所以有些新手向的东西直接一笔带过，这也正是为什么网上有那么多讲解好文我还要再写一篇（而且我就是个还没毕业的弟弟）：我把你们的坑踩了，你们就可以把省下来的时间做些更有意义的事情，~~比如把 react 的源码看了~~。

## 文章目录

> 文中所使用的 Koa 版本为`2.11.0`，新鲜的！  
> 带注释的热乎源代码已经上传至[GitHub](https://github.com/linbudu599/Penumbra/tree/master/Node/Koa)  
> 如果需要更好的阅读体验，可以移步[俺的博客](https://linbudu.top)

- [四大护法](##四大护法)
- [new 一个 Koa()，发生了什么？](<new一个Koa()，发生了什么？>)
- [好兄弟，我给你看个宝贝！](##好兄弟，我给你看个宝贝！)
- [这个‘洋葱’切起来咋会让人笑呢(/▽＼)](<这个‘洋葱’切起来咋会让人笑呢(/▽＼)>)
- [错误处理，妥妥的！](错误处理，妥妥的！)

## 四大护法

Koa 的源码分为以下四个部分，

- application.js，主干部分，在这里进行了中间件合并、上下文封装、处理请求&响应、错误监听等操作。
- context.js，上下文封装的逻辑，deligate 库就是在这里进行代理属性。
- request.js，封装`ctx.request`的逻辑，注意，`ctx.req`才是 Node 原生属性，后面会讲。
- response.js, `ctx.response`，同上。

## new 一个 Koa()，发生了什么？

```js
import Koa from "koa";
import chalk from "chalk";

const app = new Koa();

app.listen(2333, () => {
  console.log(chalk.green("http://localhost:2333"));
});
```

这几行代码你可能写的次数比我多得多，但你是否想过启动一个这么简单的服务的过程里，Koa 为我们做了什么？

既然是实例化，那就肯定有类的存在，还少不了构造函数插一脚，我们就从源码中的类里逮几个重要人物出来先说说，如果你此前没有阅读过此类框架源码，可以顺便了解下它们的内部都做了什么。我个人觉得这篇文章很适合作为第一次读源码的同学。

```js
// Application类内部

constructor(options) {
    super();
    options = options || {};
  }

 listen(...args) {
    debug('listen');
    const server = http.createServer(this.callback());
    return server.listen(...args);
  }
```

上面的代码我相信你读起来肯定没有问题，app 实例的 listen 方法内部还是使用了 node 原生的 listen，因此传参也不变。

```js
const server = http.createServer(this.callback());
```

提问！这里的`createServer`方法原本的入参是啥？  
(；′⌒`) 其实我也忘了，还是去翻了 @types/node 才知道...

```typescript
// 还有一种重载不考虑哈，因为koa中没用到
function createServer(requestListener?: RequestListener): Server;

type RequestListener = (req: IncomingMessage, res: ServerResponse) => void;
```

上面这段代码看不懂也没事，我翻译一下，`createServer`原本的入参是一个请求监听器（回调函数），这个回调函数的入参是 req、res。

然后我们来看 Koa 传递给它的`this.callback()`是个啥：

```js
  callback() {
    const fn = compose(this.middleware);

    const handleRequest = (req, res) => {
      const ctx = this.createContext(req, res);
      return this.handleRequest(ctx, fn);
    };

    return handleRequest;
  }

handleRequest(ctx, fnMiddleware) {
    const res = ctx.res;
    const onerror = err => ctx.onerror(err);
    // 处理响应
    const handleResponse = () => respond(ctx);
    return fnMiddleware(ctx).then(handleResponse).catch(onerror);
  }
```

剧透：compose 即为中间件合并方法，最后得到的 fn 就是合并后的中间件。createContext 方法是负责为 ctx 添加属性的，这里都可以先不管。

**注意这里的 handleRequest 与 this.handleRequest 不同，但就是绕个弯的事~**

从上面的逻辑我们可以看到，在 callback 中我们拿到了 node 原生的 req、res 对象，通过 createContext 方法处理后把其中的属性挂载到 ctx 上，然后再通过 this.handleRequest 方法过一下，在 this.handleRequest 里，我们已经获得了初步的 ctx，这还没完，我们还要把它在中间件的人群里挨一遍毒打，然后如果都 resolve 了就可以调用 handleResponse 送它去见客户端了~

到这里相信你们已经有了一个大致的逻辑，在你实例化 koa 并使用它启动一个服务的过程中，koa 为你做了这些事

- 根据你的选项/参数调用 node 的内置方法。
- 处理原生 node 的 req、res。
- 根据中间件处理 ctx，和上面的 req、res 挂载到 ctx 上。（原生 req 挂载为 ctx.request）
- 全局错误监听，这里还没讲，请见下文~

## 好兄弟，我给你看个宝贝！

这一节我们来看看 koa 是如何封装 ctx 属性的：

```js
const response = require('./response');
const context = require('./context');
const request = require('./request');


// 类内部
constructor(options) {
    super();
    options = options || {};
    this.middleware = [];
    this.context = Object.create(context);
    this.request = Object.create(request);
    this.response = Object.create(response);
  }

createContext(req, res) {
    const context = Object.create(this.context);
    const request = context.request = Object.create(this.request);
    const response = context.response = Object.create(this.response);

    // 眼花缭乱1
    context.app = request.app = response.app = this;
    context.req = request.req = response.req = req;
    context.res = request.res = response.res = res;
    request.ctx = response.ctx = context;

    // 眼花缭乱2
    request.response = response;
    response.request = request;

    context.originalUrl = request.originalUrl = req.url;

    context.state = {};
    return context;
  }
```

这一大串略显诡异的代码可能会让你想揪我衣领，冷静点...，其实这部分代码没有什么难度，也不太需要你完全掌握这一个个=号才能读懂 koa 的核心逻辑。

首先，我们导入了已经经过处理的 context、request、response，然后以其作为原型扩展了三个同名变量，这么做的好处就是我们可以在这三个变量上为所欲为，但不会影响到原型对象。

然后通过眼花缭乱 1，我们确保在 context、request、response 上的 app（实例，就是那个 this）、req、res 指向相同，还记得吧，req 和 res 是原生 node 的对象。

然后我们就可以变着花样取值了，`ctx.req.url`/`ctx.request.req.url`/`ctx.response.req.url`...，它们最终都指向`ctx.url`，这也是我们最常使用的方式（思考，为什么都指向 ctx.url？）

眼花缭乱 2 操作同样类似，但是要稍微注意下 `context.state={}`，这是 koa 官方推荐的命名空间，使用方式一般是在多个中间件之间共享数据（虽然我一般直接 ctx 点出来...）

然后我们来看看，context.js 中的主要逻辑

```js
const proto = (module.exports = {
  toJSON() {
    return {
      request: this.request.toJSON(),
      response: this.response.toJSON(),
      app: this.app.toJSON(),
      originalUrl: this.originalUrl,
      req: "<original node req>",
      res: "<original node res>",
      socket: "<original node socket>"
    };
  },
  get cookies() {
    // ...
  },

  set cookies(_cookies) {
    // ...
  }
});

delegate(proto, "response").method("attachment");
// ...

/**
 * Request delegation.
 */

delegate(proto, "request").access("url");
// ...
```

- toJSON 方法，可能有些同学不知道这是干啥的呃，我就顺便提一下，在你调用 JSON.stringify()时实际上就调用了这个方法。koa 这里重写了这个方法，使得你可以获取当前 ctx 的内容。
- cookies 的存取器，不做赘述。
- delegate，暂时只讲一下作用，使得 ctx 对象能够代理原生 req、res 的部分属性/方法，`proto`即为 aplication.js 中 this.context 的原型对象，如果不记得了可以返回去看一下这一步。`this.context = Object.create(context);`

现在我们可以知道为什么`ctx.req.url`/`ctx.request.req.url`/`ctx.response.req.url`都指向`ctx.url`了，当 ctx 上找不到属性，就会去 context（作为它的原型的那家伙）上找，

```js
delegate(proto, "request").access("url");
// ...
```

使用这段代码，我们最终可以通过托管获取到原生 request 上的属性。

这一步我们了解了 context.js 是如何初步处理 ctx 对象的，但还有几个问题，koa 封装的 request 和 response 呢？ctx.req.url 和 ctx.reqeust.req.url 是如何指向 ctx.url 的？

我们接着来看 resuest.js，冷静下，很快的...

再次掏出这段代码来：

```js
constructor(options) {
    super();
    options = options || {};
    this.middleware = [];
    this.context = Object.create(context);
    this.request = Object.create(request);
    this.response = Object.create(response);
  }

createContext(req, res) {
    const context = Object.create(this.context);
    const request = context.request = Object.create(this.request);
    const response = context.response = Object.create(this.response);

    context.app = request.app = response.app = this;
    context.req = request.req = response.req = req;
    context.res = request.res = response.res = res;
    request.ctx = response.ctx = context;

    request.response = response;
    response.request = request;

    context.originalUrl = request.originalUrl = req.url;

    context.state = {};
    return context;
  }
```

既然 resquest 是引入的，那自然要去看看源文件

```js
 get header() {
    return this.req.headers;
  },

  set header(val) {
    this.req.headers = val;
  },

  get headers() {
    return this.req.headers;
  },

  set headers(val) {
    this.req.headers = val;
  },

  get url() {
    // this即为ctx this.req即为原生req
    return this.req.url;
  },

  set url(val) {
    this.req.url = val;
  },
```

是的，这里面就是一堆存取器...，也就是说，`ctx.request.url`就可以了，不需要再`ctx.request.req.url`，因为它的内部会自动代理到原生 req 上，就相当于 ctx.request 中有了这个属性。

~~ctx 到这里就处理完毕了~~，当然不，我们还要走一轮中间件呢。

## 这个‘洋葱’切起来咋会让人笑呢(/▽＼)

接下来就到了 Koa2 最精彩的部分了，洋葱模型其实不难理解（但是你让我实现的话我不行...），看这样一段代码：

```js
app.use(async (ctx, next) => {
  console.log("middleware-1-start");
  await next();
  console.log(ctx.state.someProp);
  console.log("middleware-1-end");
});

app.use(async (ctx, next) => {
  console.log("middleware-2-start");
  ctx.state.someProp = "Get 2";
  await next();
  console.log("middleware-2-end");
});
```

输出结果是

```text
middleware-1-start
middleware-2-start
middleware-2-end
Get 2
middleware-1-end
```

要想理解 Koa 的洋葱模型，其实只需要知道 **控制权移交** 和 **共享数据**。

- 控制权移交，中间件一号开开心心的执行到 next，就委屈的把控制权移交给二号，二号高傲的开始执行，也碰到了 next，但是这个 next 直接 resolve（因为是最后一个中间件，具体请看后文分析），因此它可以继续做剩下的事情，在完成后再把控制权还给一号，一号再可怜兮兮的做自己的事情。思考，是怎么做到自己的事情做完后归还控制权的？

- 共享数据，在这里二号中间件为 ctx.state 上挂载了一个新的属性，在它交还控制权后一号中间件能拿到这个属性。

我们直接来看源码中的实现

```js
  use(fn) {
    if (typeof fn !== 'function') throw new TypeError('middleware must be a function!');
    if (isGeneratorFunction(fn)) {
      deprecate('Support for generators will be removed in v3. ' +
                'See the documentation for examples of how to convert old middleware ' +
                'https://github.com/koajs/koa/blob/master/docs/migration.md');
      fn = convert(fn);
    }
    this.middleware.push(fn);
    return this;
  }
```

`convert()`方法能够将 generator 函数转为中间件可用的函数结构。

```typescript
declare function convert(
  mw: (context: Context, next: Next) => Generator
): Middleware;
```

然后将每一次 app.use，都有一个中间件被 push 进`middleware`，然后在`callback`方法中

```js
  callback() {
    // 洋葱模型实现关键
    const fn = compose(this.middleware);

    const handleRequest = (req, res) => {
      const ctx = this.createContext(req, res);
      return this.handleRequest(ctx, fn);
    };

    return handleRequest;
  }

  handleRequest(ctx, fnMiddleware) {
    const res = ctx.res;
    const onerror = err => ctx.onerror(err);
    const handleResponse = () => respond(ctx);
    return fnMiddleware(ctx).then(handleResponse).catch(onerror);
  }
```

compose 方法将中间件合并为一个函数，并且确保 ctx 在接受所有中间件处理后才会去处理响应。

compose 方法来自于`koa-compose`，是我们接下来要展开来讲的重点。在这里我直接给出全部源码，你可以先试着自己琢磨一下。

```js
function compose(middleware) {
  // 处理异常情况代码省略
  return function(context, next) {
    // last called middleware #
    let index = -1;
    return dispatch(0);

    function dispatch(i) {
      if (i <= index)
        return Promise.reject(new Error("next() called multiple times"));
      index = i;
      let fn = middleware[i];
      if (i === middleware.length) fn = next;
      if (!fn) return Promise.resolve();
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }
  };
}
```

光是讲解逻辑多没意思，我们再回到上面的一号二号中间件的例子。

- `compose`函数接收中间件数组，开始分发一号中间件，即 dispatch(0)。
- `dispatch(0)`内部，此时 fn 为一号中间件，会走到 try/catch 块，尝试执行`Promise.resolve(fn(context, dispatch.bind(null, i + 1)))`，即一号中间件此时获得入参`context`、`dispatch(1)`。
- 一号中间件开始执行，遇到 next()（即 middleware2()），控制权移交，执行 dispatch(1)，此时二号中间件获得入参`context`、`dispatch(2)`。
- 二号中间件开始执行，执行到`await next()`时，再重复上述逻辑，dispatch(2)，但是这一次会停在这里：
  ```js
  let fn = middleware[i];
  if (i === middleware.length) fn = next;
  if (!fn) return Promise.resolve();
  ```
  fn = next，这里的 next 由于并没有值，所以会直接 return 一个立即 resolve 的 Promise。也就是说二号中间件内部的 await next()会立刻返回。
- 二号中间件做完自己的事后，相当于一号中间件内部的`await next()`返回了，因此控制权就归还给一号中间件。

是不是还挺简单的？我尽量说的很细了...

完成了中间件，我们就该来梳理一下大致请求和响应是怎么走的了。

```js
callback() {
    const fn = compose(this.middleware);

    const handleRequest = (req, res) => {
      const ctx = this.createContext(req, res);
      return this.handleRequest(ctx, fn);
    };

    return handleRequest;
  }

  handleRequest(ctx, fnMiddleware) {
    const res = ctx.res;

    res.statusCode = 404;
    const onerror = err => ctx.onerror(err);
    const handleResponse = () => respond(ctx);
    onFinished(res, onerror);

    return fnMiddleware(ctx).then(handleResponse).catch(onerror);
  }

  createContext(req, res) {
    // ...处理context
  }
```

接收到请求->  
createContext 初步处理上下文->  
handleRequest（实例方法那个）让 ctx 经过中间件的洗礼->  
过了就 handleResponse->  
没过就触发错误

这次的代码多放了几个地方，你可能会觉得有点诡异:

```js
res.statusCode = 404;
```

这玩意是啥意思？

不知道你在 koa 使用初期有没有遇见过这样的问题，明明接口能跑通啊，路由里的 log 也能打出来，为啥子就是 404？通常最后你会发现，因为你忘记 koa.body 了...

这句代码的意思就是你没有设置 body 时的默认状态码，koa 内部还使用了一个 respond 函数来处理各种各样的 ctx.body。

```js
/ 处理流/件文 / blabla响应;
function respond(ctx) {
  // allow bypassing koa
  // 允许绕过koa来进行响应
  if (false === ctx.respond) return;

  if (!ctx.writable) return;

  const res = ctx.res;
  let body = ctx.body;
  const code = ctx.status;

  // ignore body
  if (statuses.empty[code]) {
    // strip headers
    ctx.body = null;
    return res.end();
  }

  if ("HEAD" === ctx.method) {
    if (!res.headersSent && !ctx.response.has("Content-Length")) {
      const { length } = ctx.response;
      if (Number.isInteger(length)) ctx.length = length;
    }
    return res.end();
  }

  // status body
  if (null == body) {
    if (ctx.req.httpVersionMajor >= 2) {
      body = String(code);
    } else {
      body = ctx.message || String(code);
    }
    if (!res.headersSent) {
      ctx.type = "text";
      ctx.length = Buffer.byteLength(body);
    }
    return res.end(body);
  }

  // responses
  if (Buffer.isBuffer(body)) return res.end(body);
  if ("string" == typeof body) return res.end(body);
  if (body instanceof Stream) return body.pipe(res);

  // body: json
  body = JSON.stringify(body);
  if (!res.headersSent) {
    ctx.length = Buffer.byteLength(body);
  }
  res.end(body);
}
```

这个函数主要做了这么几件事

- 如果你没有设置 ctx.body，那么它就是 404；
- 如果你设置了值，那么就是 200；
  - body 为 Buffer/string/Stream 的情况，它也会帮你处理。比如对流会使用管道。
    ```js
    if (body instanceof Stream) return body.pipe(res);
    ```
  - 如果是其他，那么它会转为 JSON 形式返回。

```js
onFinished(res, onerror);
```

这又是啥？

这是一个第三方 npm 包，由于上一步我们可能会处理流式数据，因此需要用到这个包在流完成/关闭/出错时执行响应回调函数。

## 错误处理，妥妥的！

由于开发者们通常码代码姿势千奇百怪，因此良好的错误处理机制也少不了。我们可以先看看 Koa 中哪些地方做了错误处理。

> 这里的错误处理不包括异常处理，如为中间件传入非函数会抛出错误的情况。

```js
// Application.js
callback() {
    if (!this.listenerCount('error')) this.on('error', this.onerror);
    // ...
  }

  handleRequest(ctx, fnMiddleware) {
    const onerror = err => ctx.onerror(err);
    const handleResponse = () => respond(ctx);
    return fnMiddleware(ctx).then(handleResponse).catch(onerror);
  }

 onerror(err) {
    if (!(err instanceof Error)) throw new TypeError(util.format('non-error thrown: %j', err));

    if (404 == err.status || err.expose) return;
    if (this.silent) return;

    const msg = err.stack || err.toString();
    console.error();
    console.error(msg.replace(/^/gm, '  '));
    console.error();
  }

// context.js
 onerror(err) {
    // don't do anything if there is no error.
    // this allows you to pass `this.onerror`
    // to node-style callbacks.
    if (null == err) return;

    if (!(err instanceof Error)) err = new Error(util.format('non-error thrown: %j', err));

    let headerSent = false;
    if (this.headerSent || !this.writable) {
      headerSent = err.headerSent = true;
    }

    // delegate
    this.app.emit('error', err, this);

    // nothing we can do here other
    // than delegate to the app-level
    // handler and log.
    if (headerSent) {
      return;
    }

    const { res } = this;

    // first unset all headers
    /* istanbul ignore else */
    if (typeof res.getHeaderNames === 'function') {
      res.getHeaderNames().forEach(name => res.removeHeader(name));
    } else {
      res._headers = {}; // Node < 7.7
    }

    // then set those specified
    this.set(err.headers);

    // force text/plain
    this.type = 'text';

    // ENOENT support
    if ('ENOENT' == err.code) err.status = 404;

    // default to 500
    if ('number' != typeof err.status || !statuses[err.status]) err.status = 500;

    // respond
    const code = statuses[err.status];
    const msg = err.expose ? err.message : code;
    this.status = err.status;
    this.length = Buffer.byteLength(msg);
    res.end(msg);
  },
```

首先要明确一点，Application 这个类实际上继承于 EventEmitter 类。

在`callback`中，会新建唯一的一个错误监听器（确保 error 事件的监听器为 0 时才会新建）。

看`handleRequest`的部分，可以看到实际上请求过程中的错误交给了`context.js`中的 onerror 处理，在 context.js 的 onerror 中，`this.app.emit('error', err, this)`这行代码将错误移交给`app-level`来处理、打印信息。如果这个请求处理竟然还没结束，即实例中的 onerror 事件没有使整个进程退出，那么 context.js 的 onerror 会尝试抛出一个 500 错误。

关于错误处理，实际上我自己用的最多的还是使用最外层中间件统一捕获错误并处理。当然由于 Koa 的高度定制性，你也可以覆盖 ctx.onerror 或者直接监听 app 的 error 事件来处理错误。

## 总结

说实话写文章真的还挺累人的...，尤其是有的时候你感觉自己懂了但是一写才发现自己懂个 🔨。但不管怎么样好歹是不怎么灌水的写完了在掘金的第一篇文章，才疏学浅，难免会有错误，还请在 GitHub Issue 指出，感激不尽。
