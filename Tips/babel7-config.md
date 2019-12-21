# Babel7

> babel 简介：
>
> - 解决浏览器的自身对于 es 语言的 **差异性**：将某些低版本容器（主要是浏览器以及IE...）不支持的js语法（es6、7、8...）或api，用该容器支持的语法或api重写 。
> - babel本身是个容器，负责代码解析、转换抽象语法树，然后通过各种插件做代码转换，最后根据转换后的抽象语法树生成最终的代码 。

## Babel的核心组成部分

> `@` 这个符号是Babel7独有的

- @babel/cli

  > babel提供的内建命令行工具，主要提供 `babel` 这个命令来编译js文件
  >
  >  适合安装在本地项目里，而不是全局安装 。

- @babel/node

  > 同样是命令行工具，不同于上面一个， 不适用在产品中，适合全局安装 （类似 `Node.js CLI`）

   不要在生产环境中使用 babel-node，因为它是动态编译源代码，应用启动速度非常慢

- @babel/core

  >  babel用于解析、转换、代码生成的核心包 , 可以将源代码根据配置转换成兼容目标环境的代码,上面两个命令行工具都需要依赖它

- @babel/preset-env

  > 具有类似功能的插件还有：
  >
  >   - [@babel/preset-flow](https://babeljs.io/docs/en/babel-preset-flow)
  >   - [@babel/preset-react](https://babeljs.io/docs/en/babel-preset-react)
  >   - [@babel/preset-typescript](https://babeljs.io/docs/en/babel-preset-typescript)
  >
  > preset 即 **预设**，babel预先将一系列常用的插件包封装到一个预设环境中，或者说 **一组特定的plugins的集合** 而不是babel6那样需要安装一堆插件来支持各种语法功能。

  默认情况下，所有已被纳入规范的语法（ES2015, ES2016, ES2017, ES2018, Modules）所需要使用的plugins都包含在env这个preset中。

   **注意！**

   stage-x命名的presets已被弃用，见[[Removing Babel's Stage Presets](https://babeljs.io/blog/2018/07/27/removing-babels-stage-presets)]

   如果希望和之前一样使用处于各阶段的提案功能，建议直接通过引入相应的plugins：

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
  
  > babel 把 Javascript 语法为syntax 和 api， api 指那些我们可以通过 `function` 重新覆盖的语法 ，类似 `includes`， `map`， `includes`， `Promise`， 凡是我们能想到重写的都可以归属到api。syntax 指像箭头函数，`let`，`const`，`class`， `依赖注入` `Decorators` 等等这些，我们在 Javascript在运行是无法重写的，想象下，在不支持的浏览器里不管怎么样，你都用不了 let 这个关键字。
  >
  
  @babel/presets默认只对syntax进行转换，我们需要使用@babel/polyfill来提供对api的的支持。
  
- @babel/polyfill

  > @babel/polyfill由 `core-js2` 和 `regenerator-runtime` 组成，后者是facebook开源库，用来实现对generator、async函数等的支持，前者是js标准库，包含不同版本javascipt语法的实现。
  
   babel的插件专注于对语法做转换，而API的调用并非什么新鲜的语法，这部分并不属于babel插件的管辖范围。正常来说，让不识别Array.isArray的浏览器运行这个方法，最简单的方法就是用浏览器能识别的方式为Array写一个静态方法isArray。
  
  ```javascript
  Array.isArray = function(arg) {
    var toString = {}.toString;
    return toString.call(arg).slice(8, -1) == 'Array';
  }
  ```

### **注意**

   core-js3已经发布，@babel/polyfill不支持从core-js2到core-js3的平滑过渡，所以在babel 7.4版本中，已经废弃@babel/polyfill(只能用core-js2），而是直接引入core-js3和regenerator-runtime代替。

- @babel/runtime

  - 高阶语法向低阶语法转化时会引入了很多helper函数(如_classCallCheck)。当文件数量很多时，每个文件都引入这些helper函数会使得文件体积增大，怎么这些helper函数抽离到单独的模块，然后按需引入呢？
  - 虽然polyfill是按需引入的，但是会污染全局命名空间，当你写的是公共库时，可能会与使用者本地的方法产生冲突。例如你在你的库中引入了polyfill中的Promise，使用者自身定义了自己的Promise，这就容易产生冲突。如何将你的公共库中引入的polyfill api隔离起来呢？

   要解决这两个问题，就要需要使用@babel/runtime和@babel/plugin-transform-runtime了。

   @babel/runtime依赖@babel/helpers和regenerator-runtime，helper函数都可以从这里面引入，手动的肯定不可能，于是 babel 提供了 [`@babel/plugin-transform-runtime`](https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-runtime/README.md) 来替我们做这些转换。

- @babel/plugin-transform-runtime

  > `@babel/plugin-transform-runtime` 会自动动态require  `@babel/runtime` 中的内容，如果没有这个 `@babel/plugin-transform-runtime`，那么我们要使用`@babel/runtime中` 的内容，就只有像 `require('@babel/polyfill')` 那样人工去手动添加了，所以 `@babel/plugin-transform-runtime` 非常方便，由于`@babel/plugin-transform-runtime` 是一个插件，所以它是需要配置到.babelrc中的。（当然preset-env里装好了）

- @babel/register

  >经过 babel 的编译后，我们的源代码与运行在生产下的代码是不一样的。
  >
  >[babel-register](http://babeljs.io/docs/usage/babel-register/) 则提供了动态编译。换句话说，我们的源代码能够真正运行在生产环境下，不需要 babel 编译这一环：当然，坏处是动态编译会导致程序在速度、性能上有所损耗。

## .babelrc

> 单个preset或者plugin如果不需要添加参数，那么直接用string就可以了；如果需要添加参数，那么需要将单个preset或者plugin放入数组中，第一项为string表示preset或者plugin的名字，第二项为object用于指定参数。

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
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      }
    }
  ]
}
```
