# 策略模式

> 定义一系列算法，将它们各自封装，并且可以相互替换。

```js
var calculateBonus = function( performanceLevel, sa if ( performanceLevel === 'S' ){ 
  return salary * 4; 
  } 
  if ( performanceLevel === 'A' ){ 
  return salary * 3; 
  } 
  if ( performanceLevel === 'B' ){ 
  return salary * 2; 
  } 
}; 
calculateBonus( 'B', 20000 ); // 输出：40000 
calculateBonus( 'S', 6000 ); // 输出：24000
```

这是一段根据绩效计算Bonus的代码，缺点很明显，如果新增绩效等级，就需要进入内部修改代码，违反了开放-封闭原则。淦这种代码以前我好像真的写过。

使用组合函数来重构代码？即将不同的计算逻辑抽离出来，但还是缺乏弹性。

使用策略模式，将算法的使用与算法的实现分离开来。

在这个例子里，算法的使用方式是不变的，都是根据某个算法取得计算后的奖金数额。而算

法的实现是各异和变化的，每种绩效对应着不同的计算规则。



至少由两个部分组成，策略类：封装具体算法以及负责具体计算过程。环境类context，接受客户请求，然后将请求委托给某个策略类。**说明 Context 中要维持对某个策略对象的引用。**



传统OOP语言里，策略对象由各个策略类中创建而来，在js中可以直接定义一个策略集，内部由各种策略组成。

```js
var strategies = { 
 "S": function( salary ){ 
 return salary * 4; 
 }, 
 "A": function( salary ){ 
 return salary * 3; 
 }, 
 "B": function( salary ){ 
 return salary * 2; 
 } 
}; 
var calculateBonus = function( level, salary ){ 
 return strategies[ level ]( salary ); 
};
console.log( calculateBonus( 'S', 20000 ) ); // 输出：80000 
console.log( calculateBonus( 'A', 10000 ) ); // 输出：30000
```

嗯？这种写法我好像用过？

很好的体现了对象多态性：同样一个`calculateBonus`根据实际场景会运算不同的逻辑。



动画类与缓动算法：

一个动画类+多种缓动算法，传入dom节点、运动方式、算法名称，dom节点就会以不同的方式运动起来。更广义的算法：上面的return salary*2和小球的位置/css属性计算属性其实都是算法，策略模式其实不止可以用来封装算法，还可以封装一些业务逻辑。



嗯哼，可以直接传入指定需要的算法逻辑，也可以通过内部计算来获取需要的算法逻辑。

之前的那个校验器也使用了这种！霍霍霍我要赶紧把它再研究一下



策略模式的优缺点：

- 避免了多重条件选择
- 符合开放-封闭原则
- 封装起来的算法便于复用
- 会增加策略类和策略集
- 使用时需要先了解所有策略，此时它内部的逻辑就全部暴露了，违反了最少知识原则。

在JS中实际上策略模式已经融入到了语言本身，每一个策略实际上就是值为函数的变量，js中函数是一等公民嘛。策略类通常是被函数所替代的，此时就像隐形了一样。



