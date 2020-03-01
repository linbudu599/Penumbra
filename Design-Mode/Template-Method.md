# 模板方法模式

> 我怎么好像之前在哪里见到过？
>
> 这是一种基于继承的设计模式，也只需要使用继承。
>
> 抽象父类，其中封装了子类的算法框架，包括公共方法与封装子类中所有方法的执行顺序（顺序也要？），字类继承了这个抽象类也就继承了整个算法结构，并且可以选择重写父类方法。



用于解决平行子类的代码冗余问题？

咖啡和茶例子的抽象：

提取 煮沸 冲泡  入杯 加料的共同逻辑

子类来重写具体实现

TS中的抽象类？





抽象类不能被实例化   其中的方法必须被子类都实现   

抽象类的方法并没有具体的实现

用TS就好啦，没有必要在JS里去模拟吧。



新的设计原则： 好莱坞原则

允许底层组件将自己挂钩到高层组件中，高层组件决定何时何种方式调用。意味着子组件放弃了对自己的控制而是交由父类。这一原则也体现在发布订阅模式以及回调函数中。



“并不一定需要继承”

```js
var Beverage = function( param ){ 
 var boilWater = function(){ 
 console.log( '把水煮沸' ); 
 }; 
 var brew = param.brew || function(){ 
 throw new Error( '必须传递 brew 方法' ); 
 }; 
 var pourInCup = param.pourInCup || function(){ 
 throw new Error( '必须传递 pourInCup 方法' ); 
 }; 
 var addCondiments = param.addCondiments || function(){ 
 throw new Error( '必须传递 addCondiments 方法' ); 
 }; 
 var F = function(){}; 
 F.prototype.init = function(){ 
 boilWater(); 
 brew(); 
 pourInCup(); 
 addCondiments(); 
 }; 
 return F; 
}; 

var Coffee = Beverage({ 
 brew: function(){ 
 console.log( '用沸水冲泡咖啡' ); 
 }, 
 pourInCup: function(){ 
 console.log( '把咖啡倒进杯子' ); 
 }, 
 addCondiments: function(){ 
 console.log( '加糖和牛奶' ); 
 } 
});
```

闭包还真是无所不能啊