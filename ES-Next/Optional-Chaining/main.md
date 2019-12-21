# Optional chaining

> [Optional chaining（以下简称 OC）](https://github.com/tc39/proposal-optional-chaining) 已经进入 **stage 4: finished ** 阶段，目前 ts3.7+已经可以直接使用，js 需要安装 Babel 插件 `@babel/plugin-proposal-optional-chaining` ，另外，关于升级到 Babel7 的配置，可以查看这里： [Tips-Babel7](../../Tips/babel7-config.md)

## 使用方式

> 详细用法请查看 [index.js](./index.js)

```javascript
obj?.prop; // 访问可能无效的静态属性
obj?.[expr]; // 访问可能无效的动态属性
func?.(...args); // 调用可能无效的函数/方法
```

## 语义

**当 `?.` 前面的变量值为 `null` 或 `undefined` 时，`?.` 返回的结果为 `undefined`**。

## （长）短路

### 短路

> _如果 ?. 的左侧遇到了无效的值，则会停止访问右侧_

```javascript
a?.[++x]; // 如果a为null/undefined，则不会执行 ++x，等价于下面的语句
a == null ? undefined : a[++x];
```

### 长短路

> Optional chaining 在 ES 中，作用域仅限于调用处。

```javascript
a?.b.c(++x).d; // 如果a为null/undefined，这个式子等价于undefined，并且后续都将被终止
a == null ? undefined : a.b.c(++x).d;
```

## 安全保护

> 上面的长短路中可以看到 `?.` 仅在 `a?.` 处生效，这是因为 **OC** 仅对当前位置起保护作用, 因此一个调用语句中允许出现多个 `.?` 调用

JS 对 Optional chaining 的理解不同导致的。Optional chaining 仅仅是安全访问保护，不代表 `try catch`，也就是它不会捕获异常：

```
a?.b()
```

这个调用，在 `a.b` 不是一个函数时依然会报错，原因就是 Optional chaining 仅提供了对属性访问的安全保护，不代表对整个执行过程进行安全保护，该抛出异常还是会抛出异常，因此 Optional chaining 没有必要对后面的属性访问安全性负责。

## 与 Nullish-Coalescing 结合使用

> [Nullish-Coalescing](https://github.com/tc39/proposal-nullish-coalescing) 目前处于 **stage 3: candidate** 阶段

### 语义

如果 `variable` 是 `undefined` 或 `null`, 则表达式 `variable ?? defaultValue`的结果为`defaultValue` , 否则表达式的值为 `variable` 的值。
不同于 `||` 符号，如果其左边是 false 或 0，则不会使默认值生效。

```javascript
outerObj?.prop1Obj?.prop2Obj?.undefProp ?? "default"; // default
```

### 运算优先级

与 `&&` 和 `||` 的优先级需要进行指定，即如果多个逻辑运算符一起使用，必须用括号表明优先级，否则会报错。

```javascript
(lhs && middle) ?? rhs;
lhs && (middle ?? rhs);

(lhs ?? middle) && rhs;
lhs ?? (middle && rhs);

(lhs || middle) ?? rhs;
lhs || (middle ?? rhs);

(lhs ?? middle) || rhs;
lhs ?? (middle || rhs);
```

## 参考文章

- [proposal-optional-chaining](https://github.com/tc39/proposal-optional-chaining)

- [proposal-nullish-coalescing](https://github.com/tc39/proposal-nullish-coalescing)

- [精读《Optional chaining》](https://www.cnblogs.com/ascoders/p/11037979.html)

- [为什么我喜欢 JavaScript 的 Optional Chaining](https://segmentfault.com/a/1190000020186924)

- [Null 判断运算符](http://es6.ruanyifeng.com/#docs/object#Null-判断运算符)
