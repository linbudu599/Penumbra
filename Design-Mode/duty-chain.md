# 职责链模式

> 使多个对象都有机会处理请求，避免请求发送者与接收者之间的耦合关系。这些对象会被连成一条链（看到链就想到链表，想到链表就开始头疼面试的算法），并沿着这条链传递该请求直到有一个对象接手。



请求发送者只需要知道链中的第一个节点，而不需要知道有哪些对象可以处理。

看了一下示例代码，想起了之前写的那个Xlog好像也是改造前的一堆if else，但是如果按照这种思路，每一种特定的调用都要声明一个函数来处理，那总共7个选项，排列组合一下？？鬼鬼得写多少种？看来不适用诶



更灵活可拆分的职责链节点：

不需要知道下一个节点是谁，就像`await next()`一样

```js
var order500 = function( orderType, pay, stock ){ 
 if ( orderType === 1 && pay === true ){ 
 console.log( '500 元定金预购，得到 100 优惠券' ); 
 }else{ 
 return 'nextSuccessor'; // 我不知道下一个节点是谁，反正把请求往后面传递
 } 
}; 
var order200 = function( orderType, pay, stock ){ 
 if ( orderType === 2 && pay === true ){ 
 console.log( '200 元定金预购，得到 50 优惠券' ); 
 }else{ 
 return 'nextSuccessor'; // 我不知道下一个节点是谁，反正把请求往后面传递
 } 
}; 
var orderNormal = function( orderType, pay, stock ){ 
 if ( stock > 0 ){ 
 console.log( '普通购买，无优惠券' ); 
 }else{ 
 console.log( '手机库存不足' ); 
 } 
};
// Chain.prototype.setNextSuccessor 指定在链中的下一个节点
// Chain.prototype.passRequest 传递请求给某个节点
var Chain = function( fn ){ 
 this.fn = fn; 
 this.successor = null; 
}; 

Chain.prototype.setNextSuccessor = function( successor ){ 
 return this.successor = successor; 
}; 

Chain.prototype.passRequest = function(){ 
 var ret = this.fn.apply( this, arguments ); 
 if ( ret === 'nextSuccessor' ){ 
 return this.successor && this.successor.passRequest.apply( this.successor, arguments ); 
 } 
 return ret; 
}; 

var chainOrder500 = new Chain( order500 ); 
var chainOrder200 = new Chain( order200 ); 
var chainOrderNormal = new Chain( orderNormal ); 

chainOrder500.setNextSuccessor( chainOrder200 ); 
chainOrder200.setNextSuccessor( chainOrderNormal ); 

chainOrder500.passRequest( 1, true, 500 ); // 输出：500 元定金预购，得到 100 优惠券
chainOrder500.passRequest( 2, true, 500 ); // 输出：200 元定金预购，得到 50 优惠券
chainOrder500.passRequest( 3, true, 500 ); // 输出：普通购买，无优惠券
chainOrder500.passRequest( 1, false, 0 ); // 输出：手机库存不足

```

需要手动的设定顺序



还可以异步职责链：

```js
Chain.prototype.next= function(){ 
return this.successor && this.successor.passRequest.apply( this.successor, arguments ); 
}; 

var fn1 = new Chain(function(){ 
 console.log( 1 ); 
 return 'nextSuccessor'; 
}); 
var fn2 = new Chain(function(){ 
 console.log( 2 ); 
 var self = this; 
 setTimeout(function(){ 
 self.next(); 
 }, 1000 ); 
}); 
var fn3 = new Chain(function(){ 
 console.log( 3 ); 
}); 
fn1.setNextSuccessor( fn2 ).setNextSuccessor( fn3 ); 
fn1.passRequest();
```

 

啊就是next()的思路...



- 可以手动指定起始节点，减少传递次数
- 不能保证某个请求一定能得到处理



> JavaScript 开发中，职责链模式是最容易被忽视的模式之一。实际上只要运用得当，职责链模式可以很好地帮助我们管理代码，降低发起请求的对象和处理请求的对象之间的耦合性。职责链中的节点数量和顺序是可以自由变化的，我们可以在运行时决定链中包含哪些节点。无论是作用域链、原型链，还是 DOM 节点中的事件冒泡，我们都能从中找到职责链模式的影子。职责链模式还可以和组合模式结合在一起，用来连接部件和父部件，或是提高组合对象的效率。学会使用职责链模式，相信在以后的代码编写中，将会对你大有裨益。



我想想xlog能否用职责链模式重构



选项传入Xlog类实例，在构造函数中走一遍方法...？但是好像有点不对，这样就变成每个链上的方法都要参与进来，这也是我现在使用的写法，if条件判断执行各处函数。还是说整体思路就需要重构？



再议:(