# Dynamic Import

> **Dynamic Import** 目前出于 [Stage 4阶段](https://github.com/tc39/proposal-dynamic-import)，对应的Babel插件为[@babel/plugin-syntax-dynamic-import](https://babeljs.io/docs/en/babel-plugin-syntax-dynamic-import)。
>
> `Webpack` 中的 Dynamic Import 属于[自己实现](https://webpack.js.org/guides/code-splitting/#dynamic-imports)，语法以及使用场景大致相同。

## Webpack 中

通常动态加载被用在 代码分割 一类的场景上，与`require.ensure()` 作用相同。

```js
import(/* webpackChunkName: "lodash" */ 'lodash').then(({ default: _ }) => {
     const element = document.createElement('div');
     element.innerHTML = _.join(['Hello', 'webpack'], ' ');
     return element;
   }).catch(error => 'An error occurred while loading the component')
```

注意需要使用`default`，并且你可以自己命名被拆分出来的模块。

你可以把以上逻辑放在函数中，当需要使用到这部分逻辑时再执行这个函数。

```js
button.addEventListener('click', event => {
  import('./dialogBox.js')
  .then(dialogBox => {
    dialogBox.open();
  })
  .catch(error => {
    /* Error handling */
  })
});
```

与tc39相同，webpack中的Dynamic Import也返回Promise，所以你也可以使用async/await关键字、条件加载、动态路径等。

```js
let module = await import('/modules/my-module.js');
```

在React中使用

```js
renderDemo = ()=>{ 
        import('../List/TableList').then((Component) => {
            //do something with The Component = Component.default
            const App = () => {
                return (
                    <div>
                        <Component/>
                    </div> 
                )
              }
            this.setState({demo: App()});
        }) 
    } 

// ...
 render() {
       const {demo}  = this.state;

       return (
        <div>
             {demo} 
        </div>
       ) 
    }
```

（[Parce](https://github.com/parcel-bundler/parcel)也同样支持该语法）

## TC39提案

几个与静态import不同的地方

- DI可以在\<script>中使用，而不仅是模块内。
- 它可以在任何地方、任何级别上使用，但不会享受作用域提升。
- 它可以接收任意的字符串，即便是运行时环境决定的模板字符串。
- The presence of `import()` in the module does not establish a dependency which must be fetched and evaluated before the containing module is evaluated.（没想好咋翻译）
- 动态引入的依赖不能够被静态分析，但是可能会在较为简单的场景下实现猜测似地获取。（perform speculative fetching in simpler cases like `import("./foo.js")`.)）

