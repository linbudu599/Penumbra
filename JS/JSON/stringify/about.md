# JSON.stringify

## 需求

对于下面这个对象，要将它的 `key` 中的 `_` 全部去掉，如 `_name` ，变为 `name`。

```javascript
const basicInfo = {
  _id: "599",
  _name: "Linbudu",
  _favor: "FE"
};
```

先来看看不那么优雅的处理方案

- 声明一个新的对象，遍历旧的对象，将属性依次赋值
- 简单粗暴的添加新属性并 `delete` 旧属性
- 序列化+replace

  ```javascript
  const map = {
    _id: "id",
    _name: "name",
    _favor: "favor"
  };
  const basicInfo = {
    _id: "599",
    _name: "Linbudu",
    _favor: "FE"
  };

  const result = JSON.parse(
    JSON.stringify(basicInfo).replace(
      /_id|_name|_favor/gi,
      matched => map[matched]
    )
  );
  ```

妥妥的！

## 对特殊值的处理

> 特殊值在这里指 `undefined`、函数、`symbol`在以下情况下出现
>
> - 对象属性值
> - 数组元素
> - 单独值

- undefined、任意的函数以及 symbol 作为对象属性值时 JSON.stringify() 将跳过（忽略）对它们进行序列化
- undefined、任意的函数以及 symbol 作为数组元素值时，JSON.stringify() 会将它们序列化为 null
- undefined、任意的函数以及 symbol 被 JSON.stringify() 作为单独的值进行序列化时都会返回 undefined
同时，由于这些值可能会被忽略，所以当含有这些特殊值时，序列化后的字符串不能保证原先的属性值顺序（数组除外，但是如果作为数组元素他们都是null...）

- （sp）：NaN 和 Infinity 格式的数值及 null 都会被当做 null。

## 死党toJSON()方法

- 转换对象如果拥有 `toJSON()` 方法，那么该函数的返回值就是序列化后的值，而其他属性会被忽略（卑微）
- 在JavaScript的 `Date` 对象中，已经部署了 `toJSON()` 方法，所以在被序列化会被进行同 `Date.toISOString()` 的处理

## 对基本类型包装对象的序列化

- 布尔值、数字、字符串的包装对象在序列化过程中会自动转换成对应的原始值。

```javascript
JSON.stringify([new Number(1), new String("false"), new Boolean(false)]);
// "[1,"false",false]"
```

## 不可枚举的属性将会被忽略

```javascript
JSON.stringify( 
    Object.create(
        null, 
        { 
            x: { value: 'json', enumerable: false }, 
            y: { value: 'stringify', enumerable: true } 
        }
    )
);
// "{"y","stringify"}"
```

## 使用JSON.parse(JSON.stringify())进行深拷贝

这个方法的确用起来很快乐，但是会由于序列化的许多特性导致一些坑

- 循环引用
  > 对包含循环引用的对象（对象之间相互引用，形成无限循环）执行此方法，会抛出错误。

```javascript
const obj = {
  name: "loopObj"
};
const loopObj = {
  obj
};
// 对象之间形成循环引用，形成闭环
obj.loopObj = loopObj;
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
deepClone(obj)
```

## 第二个参数-replacer

> MDN介绍原文:  
> replacer 可选  
>如果该参数是一个函数，则在序列化过程中，被序列化的值的每个属性都会经过该函数的转换和处理；如果该参数是一个数组，则只有包含在这个数组中的属性名才会被序列化到最终的 JSON 字符串中；如果该参数为 null 或者未提供，则对象所有的属性都会被序列化；

- 传入函数作为参数
  此时这个函数拥有两个参数，`key` 与 `value`，这个函数类似于 `forEach` 或是 `map` ，会对每一个属性值执行一次该函数。而且这种使用方式可以破坏/修正上面几个特性中的绝大多数，如：

  ```javascript
  const data = {
    a: "aaa",
    b: undefined,
    c: Symbol("dd"),
    fn: function() {
      return true;
    }
  };

  JSON.stringify(data, (key, value) => {
    switch (true) {
      case typeof value === "undefined":
        return "undefined";
      case typeof value === "symbol":
        return value.toString();
      case typeof value === "function":
        return value.toString();
      default:
        break;
    }
    return value;
  })
  // {"a":"aaa","b":"undefined","c":"Symbol(dd)","fn":"function() {\n    return true;\n  }"}"
  ```

**！注意**，这个函数第一次执行时的参数并不是第一对键值对，而是空字符串作为key值，整个对象的键值对作为value值，如

```javascript
const data = {
  a: 2,
  b: 3,
  c: 4,
  d: 5
};
JSON.stringify(data, (key, value) => {
  console.log(value);
  return value;
})
// 第一个被传入 replacer 函数的是 {"":{a: 2, b: 3, c: 4, d: 5}}
// {a: 2, b: 3, c: 4, d: 5}
// 2
// 3
// 4
// 5
```

这个函数还可以实现一个适用于对象的 `map` 函数

```javascript
const data = {
  a: 2,
  b: 3,
  c: 4,
  d: 5
};

const objMap = (obj, fn) => {
  if (typeof fn !== "function") {
    throw new TypeError(`${fn} is not a function !`);
  }
  return JSON.parse(JSON.stringify(obj, fn));
};

objMap(data, (key, value) => {
  if (value % 2 === 0) {
    return value / 2;
  }
  return value;
});
// {a: 1, b: 3, c: 2, d: 5}
```

- 传入数组作为参数，数组的值即为在序列化后的字符串中会保留的属性名
  
```javascript
const jsonObj = {
  name: "JSON.stringify",
  params: "obj,replacer,space"
};

// 只保留 params 属性的值
JSON.stringify(jsonObj, ["params"]);
// "{"params":"obj,replacer,space"}" 
```

## 第三个参数：space

用于控制序列化后字符串间距，用处不大...