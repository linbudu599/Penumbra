# Babel7

> babel 简介：
>
> - 解决浏览器的自身对于 es 语言的 **差异性**：将某些低版本容器（主要是浏览器以及 IE...）不支持的 js 语法（es6、7、8...）或 api，用该容器支持的语法或 api 重写 。
> - babel 本身是个容器，负责代码解析、转换抽象语法树，然后通过各种插件做代码转换，最后根据转换后的抽象语法树生成最终的代码 。

## Babel 的核心组成部分

> `@` 这个符号是 Babel7 独有的

- @babel/cli

  > babel 提供的内建命令行工具，主要提供 `babel` 这个命令来编译 js 文件

  > 适合安装在本地项目里，而不是全局安装 。

- @babel/node

  > 同样是命令行工具，不同于上面一个， 不适用在产品中，适合全局安装 （类似 `Node.js CLI`）

  不要在生产环境中使用 babel-node，因为它是动态编译源代码，应用启动速度非常慢

- @babel/core

  > babel 用于解析、转换、代码生成的核心包 , 可以将源代码根据配置转换成兼容目标环境的代码,上面两个命令行工具都需要依赖它

- @babel/preset-env

  > 具有类似功能的插件还有：
  >
  > - [@babel/preset-flow](https://babeljs.io/docs/en/babel-preset-flow)
  > - [@babel/preset-react](https://babeljs.io/docs/en/babel-preset-react)
  > - [@babel/preset-typescript](https://babeljs.io/docs/en/babel-preset-typescript)
  >
  > preset 即 **预设**，babel 预先将一系列常用的插件包封装到一个预设环境中，或者说 **一组特定的 plugins 的集合** 而不是 babel6 那样需要安装一堆插件来支持各种语法功能。

  默认情况下，所有已被纳入规范的语法（ES2015, ES2016, ES2017, ES2018, Modules）所需要使用的 plugins 都包含在 env 这个 preset 中。

  **注意！**

  stage-x 命名的 presets 已被弃用，见[[Removing Babel's Stage Presets](https://babeljs.io/blog/2018/07/27/removing-babels-stage-presets)]

  如果希望和之前一样使用处于各阶段的提案功能，建议直接通过引入相应的 plugins：

  ```javascript
   {
      plugins: [
        // Stage 0
        "@babel/plugin-proposal-function-bind",

        // Stage 1
        "@babel/plugin-proposal-export-default-from",
        "@babel/plugin-proposal-logical-assignment-operators",
        ["@babel/plugin-proposal-optional-chaining", { loose: false }],
        ["@babel/plugin-proposal-pipeline-operator", { proposal: "minimal" }],
        ["@babel/plugin-proposal-nullish-coalescing-operator", { loose: false }],
        "@babel/plugin-proposal-do-expressions",

        // Stage 2
        ["@babel/plugin-proposal-decorators", { legacy: true }],
        "@babel/plugin-proposal-function-sent",
        "@babel/plugin-proposal-export-namespace-from",
        "@babel/plugin-proposal-numeric-separator",
        "@babel/plugin-proposal-throw-expressions",

        // Stage 3
        "@babel/plugin-syntax-dynamic-import",
        "@babel/plugin-syntax-import-meta",
        ["@babel/plugin-proposal-class-properties", { loose: false }],
        "@babel/plugin-proposal-json-strings",
      ],
    }
  ```

  > babel 把 Javascript 语法为 syntax 和 api， api 指那些我们可以通过 `function` 重新覆盖的语法 ，类似 `includes`， `map`， `includes`， `Promise`， 凡是我们能想到重写的都可以归属到 api。syntax 指像箭头函数，`let`，`const`，`class`， `依赖注入` `Decorators` 等等这些，我们在 Javascript 在运行是无法重写的，想象下，在不支持的浏览器里不管怎么样，你都用不了 let 这个关键字。

  @babel/presets 默认只对 syntax 进行转换，我们需要使用@babel/polyfill 来提供对 api 的的支持。

- @babel/polyfill

  > @babel/polyfill 由 `core-js2` 和 `regenerator-runtime` 组成，后者是 facebook 开源库，用来实现对 generator、async 函数等的支持，前者是 js 标准库，包含不同版本 javascipt 语法的实现。

  babel 的插件专注于对语法做转换，而 API 的调用并非什么新鲜的语法，这部分并不属于 babel 插件的管辖范围。正常来说，让不识别 Array.isArray 的浏览器运行这个方法，最简单的方法就是用浏览器能识别的方式为 Array 写一个静态方法 isArray。

  ```javascript
  Array.isArray = function(arg) {
    var toString = {}.toString;
    return toString.call(arg).slice(8, -1) == "Array";
  };
  ```

## **注意**

core-js3 已经发布，@babel/polyfill 不支持从 core-js2 到 core-js3 的平滑过渡，所以在 babel 7.4 版本中，已经废弃@babel/polyfill(只能用 core-js2），而是直接引入 core-js3 和 regenerator-runtime 代替。

- @babel/runtime

  - 高阶语法向低阶语法转化时会引入了很多 helper 函数(如\_classCallCheck)。当文件数量很多时，每个文件都引入这些 helper 函数会使得文件体积增大，怎么这些 helper 函数抽离到单独的模块，然后按需引入呢？
  - 虽然 polyfill 是按需引入的，但是会污染全局命名空间，当你写的是公共库时，可能会与使用者本地的方法产生冲突。例如你在你的库中引入了 polyfill 中的 Promise，使用者自身定义了自己的 Promise，这就容易产生冲突。如何将你的公共库中引入的 polyfill api 隔离起来呢？

  要解决这两个问题，就要需要使用@babel/runtime 和@babel/plugin-transform-runtime 了。

  @babel/runtime 依赖@babel/helpers 和 regenerator-runtime，helper 函数都可以从这里面引入，手动的肯定不可能，于是 babel 提供了 [`@babel/plugin-transform-runtime`](https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-runtime/README.md) 来替我们做这些转换。

- @babel/plugin-transform-runtime

  > `@babel/plugin-transform-runtime` 会自动动态 require `@babel/runtime` 中的内容，如果没有这个 `@babel/plugin-transform-runtime`，那么我们要使用`@babel/runtime中` 的内容，就只有像 `require('@babel/polyfill')` 那样人工去手动添加了，所以 `@babel/plugin-transform-runtime` 非常方便，由于`@babel/plugin-transform-runtime` 是一个插件，所以它是需要配置到.babelrc 中的。（当然 preset-env 里装好了）

- @babel/register

  > 经过 babel 的编译后，我们的源代码与运行在生产下的代码是不一样的。
  >
  > [babel-register](http://babeljs.io/docs/usage/babel-register/) 则提供了动态编译。换句话说，我们的源代码能够真正运行在生产环境下，不需要 babel 编译这一环：当然，坏处是动态编译会导致程序在速度、性能上有所损耗。

### .babelrc

> 单个 preset 或者 plugin 如果不需要添加参数，那么直接用 string 就可以了；如果需要添加参数，那么需要将单个 preset 或者 plugin 放入数组中，第一项为 string 表示 preset 或者 plugin 的名字，第二项为 object 用于指定参数。

```javascript
{
  "presets": [
    "presetA",
    ["presetA"],
    ["presetA", {}]
  ],
  "plugins": [
    "pluginA",
    ["pluginA"],
    ["pluginA", {}],
  ]
}
```

配置 @babel-preset-env

```javascript
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "chrome": "64"
        }
      }
    ]
  ],
}
```

### babel-loader

```javascript
module: {
  rules: [
    {
      test: /\.js|jsx$/,
      exclude: /node_modules/,
      use: {
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env"]
        }
      }
    }
  ];
}
```

### 小坑

- 与 TypeScript 一同使用时，可能需要安装 `@types/babel__core` 、`@types/babel_generator` 等专用声明模块
