// https://johnresig.com/apps/learn/#49
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
console.log(far());
console.log(far());

const outer = () => {
  const a = "hello closure";
  const inner = () => {
    console.log(a);
  };
  // return bar;
  fn(inner);
};
const fn = argus => {
  argus();
};
outer();

// 里面的函数并没有执行,而是被放到异步队列中等候执行
// 改为let:每个i只能存活到这一次打印为止,但是会被闭包记住
// var声明的则是局部变量
for (var i = 0; i < 5; i++) {
  // setTimeout(() => {
  //   console.log(i);
  // }, 100);
  (i => {
    setTimeout(() => {
      console.log(i);
    }, 5000);
  })(i);
}
const father = () => {
  let arr = [];
  for (var i = 0; i < 5; i++) {
    // 存放着闭包的数组
    // arr[i] = function() {
    //   return i;
    // };
    // 存放数字
    // arr[i] = (function() {
    //   return i;
    // })();
    // 存放储存正确结果的闭包
    arr[i] = function() {
      return function() {
        const j = i;
        return j;
      };
    };
  }
  console.log(arr);
  return arr;
};
console.log(father());

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
console.log(func.get_key());
console.log(func.key);
console.log(func.set_key("NEW KEY"));
console.log(func.get_key());
