# Closure In JavaScript

> 为什么又突然想着复习一遍闭包呢，是因为写 hooks 时发现，想要把 hooks 使用的如臂使指，光靠我以前对闭包的掌握是不够的，因此在准备再开个仓库整理优秀的自定义 hooks 之前，有必要把闭包安排的明明白白。（就当提前准备面试了）

## 基础

- 无论一个函数在哪里被调用，其词法作用域都只由该函数被声明的所处的位置决定，这个位置也决定了函数访问变量的权限。

- 闭包实际上就是持有了外部环境变量的函数。

  ```javascript
  let a = 1;
  let b = function() {
    // b就是个闭包，因为捕获了外部环境中的变量
    console.log(a);
  };

  function a(x, y) {
    console.log(x, y); //在这里，x和y都不是自由变量
    function b() {
      console.log(x, y); //但在这个内部函数b中，x和y相对于b都是自由变量，而函数a的作用域则是环境。
    }
    //无论b最终是否会作为返回值被函数a返回，b本身都已经形成了闭包。
  }
  ```

- 将子函数作为值 return（将函数作为值传递）之后，函数可以**记住**并访问所在的词法作用域，同时其访问变量的权限不变。也就是说我们在父函数外部可以访问其内部的变量。

- 通俗的说，就像一个虫洞，或者说通道，我们可以通过闭包访问到内部变量，这个通道实际上就是内部函数保留着对声明时词法作用域的引用。

- 闭包其实并不复杂，有可能你平时就在大量的使用闭包，以及享受它带来的方便之处，只是自己没有意识到罢了。

- 闭包的意思不是私有，也不是封闭内部状态，如果要更贴切的说，它其实封闭的是外部状态，而如何能做到封闭外部状态？即外部状态的作用域失效时还留有一份引用在内部状态里。

- 闭包的特点

  - 在一个函数内部定义一个内部函数，然后将内部函数作为值返回

    ```javascript
    const foo = () => {
      const a = "hello closure";
      let count = 2;
      const bar = () => {
        console.log(a);
        return (count += 2);
      };
      return bar;
    };
    // 将bar赋给了far这个全局变量
    // 原本foo执行后函数foo的作用域会被销毁
    // 但是这里产生了闭包,这个管道没有被关闭
    // 于是foo的词法作用域仍然存在
    // 变量count由闭包运行时自动管理
    const far = foo();
    console.log(far()); // 4
    console.log(far()); // 6
    ```

    1. 正常情况下，在 foo 函数执行后，它就会被垃圾回收器被清除掉，但这里由于将 bar 函数作为值返回了，我们依然能够访问的 foo 内部的变量，这说明了闭包能够延长作用域链，同时拥有更长的生命周期。
    2. 执行两次后，foo 内部的局部变量被累加了，这说明闭包可以记住自己所在的词法作用域。

  - 直接或间接执行内部函数

    ```javascript
    for (var i = 0; i < 5; i++) {
      setTimeout(() => {
        console.log(i);
      }, 100);
    }
    ```

    这个例子我想应该初学前端时都经历过，打印结果是 5,5,5,5,5

    这实际上也和闭包有关，setTimeout 中的匿名函数实际上也是闭包，会被放到异步队列中等待执行，而在 for 循环结束后，闭包只能访问到外层变量 i 的最终值即 5。但是如果我们在其中使用立即执行函数（IIFE）:

    ```javascript
    for (var i = 0; i < 5; i++) {
      (i => {
        setTimeout(() => {
          console.log(i);
        }, 100);
      })(i);
    }
    ```

    这样就能打印出正确的值了，因为此时的每个闭包都获得了本轮循环的最新值（绑定了声明时的词法作用域，最终执行时是等待 0.1 秒一次性打印 0~4）

## 应用

```javascript
const func = (() => {
  let key = "KEY";
  return {
    get_key: () => {
      return key;
    },
    set_key: new_key => {
      key = new_key;
    }
  };
})();
console.log(func.get_key()); // KEY
console.log(func.key); // undefined
console.log(func.set_key("NEW KEY")); // undefined
console.log(func.get_key()); // NEW KEY
```

其内部函数总是可以访问其所在的外部函数中声明的参数/变量，也因为这个特性，闭包常用于创建/修改内部变量，而这些变量不能被外部随意修改，只能通过这个通道进行操作。

## 模块化与闭包

> JavaScript 中并没有自己的模块概念，我们只能使用函数/自执行函数来模拟模块。
> 现在的前端工程中（ES6 的模块语法规范），使用的模块，本质上都是函数或者自执行函数。
> webpack 等打包工具会帮助我们将其打包成为函数，即闭包和 IIFE 的结合

```javascript
const Person = (function() {
  let person = {
    name: "",
    age: 0
  };

  function setName(personName) {
    person.name = personName;
  }

  function setAge(personAge) {
    person.age = personAge;
  }

  function getPerson() {
    return person.name + " " + person.age;
  }

  return {
    setName: setName,
    setAge: setAge,
    getPerson: getPerson
  };
})();
console.log(Person.person); // undefined
Person.setName("Linbudu");
Person.setAge(21);
const newPerson = Person.getPerson();
console.log(newPerson); // Linbudu 21
```

也就是说，当我们 `import` 一个模块，实际上是让这个模块成为了一个 IIFE 函数，我们无法直接去获取其中的变量，而是通过它主动暴露出来的通道，即闭包去进行访问/修改。

### 闭包与 React

说到模块化自然少不了 `React` ，各种各样的组件实际上也是一个个闭包和 IIFE 的结合

```javascript
// Comp.jsx
export default function Comp() {}

// App.jsx
import Comp from "./Comp";
export default function App() {
  return <Comp />;
}
```

引入 `<Comp />` 并执行的过程，实际上就是一个 IIFE，如

```javascript
const ComponentModule = (function() {
  return function Comp() {};
})();

const AppModule = (function() {
  const Component = ComponentModule;
  return function App() {
    return Component();
  };
})();
```

函数 App 实际上就是一个闭包，从 `Component` -> `ComponentModule` -> `Comp`，一路访问了 Comp 函数的内部变量。
模块中实际上很容易产生闭包，每一个 JS 模块都可以认为是一个独立的作用域。
当代码执行时，如果在模块内部创建了可供外部引用访问的函数时，就为闭包的产生提供了条件。
只要该函数在外部执行访问了模块内部的其他变量，闭包就会产生。

### 闭包与 React Hooks

> 实际上这才是整理这篇文章的主要目的

```javascript
// useState.js
let state = null;

export const useState = value => {
  state = state || value;

  function dispatch(newValue) {
    state = newValue;
    render();
  }

  return [state, dispatch];
};

//app.js

import React from "react";
import { useState } from "./useState";

function Demo() {
  const [counter, setCounter] = useState(0);

  return (
    <div onClick={() => setCounter(counter + 1)}>hello world, {counter}</div>
  );
}

export default Demo();
```

当 useState 被执行(`useState(0)`)，会访问上面 `import` 时执行的 IIFE 函数中的变量对象，那么闭包就会产生。
同时由于闭包延长生命周期的特性，`useState.js`中的 state 变量会持续存在，同时闭包能够记住词法作用域，因此在函数组件重渲染时也能获取到上一次执行时的 state 值。
