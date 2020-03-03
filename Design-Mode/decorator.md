# 装饰者模式 

> 装饰者模式可以动态的为某个对象添加职责，而不需要让父类一次性包含，同时也不会影响到派生的其他对象

传统的OO语言中，实现给对象添加功能通常使用继承，但继承同样存在问题：

- 超类与子类之间的强耦合性，超类的变动会影响子类
- 继承通常称为白箱复用，也就是超类的内部细节对子类可见。



装饰者模式能够在不改变对象自身的基础上在程序运行期间给对象动态的添加职责，即用即付。js中的实现：

```js
var obj = { 
 name: 'sven', 
 address: '深圳市' 
 }; 
 obj.address = obj.address + '福田区';

// 就是Koa中间件思路？
var plane = { 
 fire: function(){ 
 console.log( '发射普通子弹' ); 
 } 
} 
var missileDecorator = function(){ 
 console.log( '发射导弹' ); 
} 
var atomDecorator = function(){ 
 console.log( '发射原子弹' ); 
} 
var fire1 = plane.fire; 
plane.fire = function(){ 
 fire1(); 
 missileDecorator(); 
} 
var fire2 = plane.fire; 
plane.fire = function(){ 
 fire2(); 
 atomDecorator(); 
} 
plane.fire();
```

虽然这个不那么OOP

```js
var Plane = function(){} 
Plane.prototype.fire = function(){ 
 console.log( '发射普通子弹' ); 
} 

var MissileDecorator = function( plane ){ 
 this.plane = plane; 
} 
MissileDecorator.prototype.fire = function(){ 
 this.plane.fire(); 
 console.log( '发射导弹' ); 
} 

var AtomDecorator = function( plane ){ 
 this.plane = plane; 
} 
AtomDecorator.prototype.fire = function(){ 
 this.plane.fire(); 
 console.log( '发射原子弹' ); 
}
var plane = new Plane(); 
plane = new MissileDecorator( plane ); 
plane = new AtomDecorator( plane ); 
plane.fire(); 
// 分别输出： 发射普通子弹、发射导弹、发射原子弹
```

咋感觉这个有点像Koa中间件或者HOC的思路？把传入的对象包裹起来



装饰函数：当要为一个上古时期的函数增加职责，不要去修改源代码！

通过保存原引用然后在一个新函数内部增加职能的方式

```js
 alert (1); 
} 
var _a = a; 
a = function(){ 
 _a(); 
 alert (2); 
}
a();
```

也存在问题：

- 中间变量
- this可能丢失/劫持



```js
var _getElementById = document.getElementById; 
document.getElementById = function( id ){ 
 alert (1); 
 return _getElementById( id ); // (1) 
} 
var button = document.getElementById( 'button' );
```

document.getElementById 方法的内部实现需要

使用 this 引用，this 在这个方法内预期是指向 document，而不是 window,（长知识）



可以手动绑定this

```js
var _getElementById = document.getElementById; 
 document.getElementById = function(){ 
 alert (1); 
 return _getElementById.apply( document, arguments ); 
 } 
 var button = document.getElementById( 'button' );
```



使用AOP装饰函数

```js
Function.prototype.before = function( beforefn ){ 
 var __self = this; // 保存原函数的引用
 return function(){ // 返回包含了原函数和新函数的"代理"函数
 beforefn.apply( this, arguments ); // 执行新函数，且保证 this 不被劫持，新函数接受的参数
 // 也会被原封不动地传入原函数，新函数在原函数之前执行
 return __self.apply( this, arguments ); // 执行原函数并返回原函数的执行结果，
 // 并且保证 this 不被劫持
 } 
} 
Function.prototype.after = function( afterfn ){ 
 var __self = this; 
 return function(){ 
 var ret = __self.apply( this, arguments ); 
 afterfn.apply( this, arguments ); 
 return ret; 
 } 
};
```



总觉得好眼熟啊这种写法...

使用这种模式改写

```js
document.getElementById = document.getElementById.before(function(){ 
 alert (1); 
 }); 
 var button = document.getElementById( 'button' );
```



AOP应用实例

- 数据统计（埋点？）

  哦吼，像Sentry那样重写window.onerror？



装饰者模式与代理模式

- 代理模式通常只有一层，即代理-本体，而装饰着模式可能会拥有一条长长的链
- 代理模式通常是一开始就能确定关系，而装饰者模式适用于一开始不能确定对象的全部功能