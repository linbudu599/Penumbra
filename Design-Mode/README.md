# JavaScript设计模式与开发实践

## 已阅读的

- 单例模式
- 代理模式
- 策略模式
- 命令模式
- 组合模式
- 迭代模式
- 发布-订阅模式



### 多态

同一操作运用于不同对象，产生不同的结果（这么来说纯函数就是和多态相反的？）

将谁去做和做什么分离开，有点像行为和表现分离的思想。把不变的部分抽离出来，把变化的部分隐藏在黑盒里，只暴露调用接口？

这样使得程序易于扩展，也更加优雅安全。不会因为产品加功能手忙脚乱了。

多态的最根本好处，只要调用该行为即可，而不需要询问是什么对象。

多态的本质就是把条件分支的流程语句（面向过程那种）转化为对象多态性，使得“判断是谁、再让它干该干的事”这个过程简单多了。发出一条消息，所有的对象自己就会做该做的事情，每个对象会负责自己的行为。

面向对象的优点也在于将行为分布给各个对象，并让这些对象负责自己的行为。

#### 继承

消除类型之间的耦合关系，这样才可以将行为附加给不同的对象。在js中不需要像java中那样向上转型的技术来取得多态的效果，她并不会在编译时检查对象类型和入参。

#### 封装

在js中可以通过作用域、闭包来模拟出public和private（ES6中的Symbol也可）两种特性

封装不仅仅等于封装数据，也包括隐藏实现细节、设计细节、对象类型等（有点像sdk和各种npm包、框架啥的）。

借助封装，各个对象之间实现了解耦，对象之间只能通过自己暴露好的api接口来通信。只要对外的接口/调用方式/入参等没有改变，他们互相之间就不关心对方内部实现的改变。

封装类型，将对象的真正类型隐藏在抽象类和接口后，我们更关心的是对象的行为。在js中并没有对抽象类/接口支持（感觉在实现设计模式上ts有力的多诶）。

“找到变化并封装之”，封装变化是封装更为重要的层面。

>拿创建型模式来说，要创建一个对象，是一种抽象行为，而具体创建什么对象则是可以变化的，创建型模式的目的就是封装创建对象的变化。
>
>而结构型模式封装的是对象之间的组合关系。行为型模式封装的是对象的行为变化。 

#### 原型

在ts中，类和对象像是注模和零件与一样，而js中则是先找到一个对象，再通过克隆来创建一个一摸一样的对象。

ES5中的Object.create方法便可以用来创建对象。

> 基于原型链的委托机制就是原型继承的本质。

当对象无法响应某个请求，会把请求委托给原型，这样一级一级向上追溯。

原则：

- 所有数据都是对象，函数也是

  顶级原型对象/根对象，Object.prototype，它是一个空的对象，实际上js的每个对象都是从它克隆而来的。

- 得到新的对象的方式是克隆！var obj1 = new Object()或者 var obj2 = {}，也是从上面提到的顶级原型克隆出来的。

  var p = new Person("xxx")，将函数作为构造器调用，实际上也是先克隆顶级原型再进行其他操作。

  ```js
  var objectFactory = function(){ 
   var obj = new Object(), // 从 Object.prototype 上克隆一个空的对象
   // 取得第一个参数
   Constructor = [].shift.call( arguments ); // 取得外部传入的构造器，此例是 Person
   obj.__proto__ = Constructor.prototype; // 指向正确的原型
   var ret = Constructor.apply( obj, arguments ); // 借用外部传入的构造器给 obj 设置属性
   return typeof ret === 'object' ? ret : obj; // 确保构造器总是会返回一个对象
  }; 
  var a = objectFactory( Person, 'sven' );  
  ```

  

- 对象能够保存/记住原型，实际上是对象的构造器有原型，对象也是把请求委托给它的构造器的原型。

  对象的__proto\__属性会指向构造器的原型对象，在上面我们是手动设置了这一过程。

  ```js
   obj.__proto__ = Constructor.prototype; // 指向正确的原型
  ```



顶级原型对象/根对象，Object.prototype，虽然每个对象都继承自它，但是对象构造器的原型可以动态指向其他对象。

```js
var obj = { name: 'sven' }; 
var A = function(){}; 
A.prototype = obj; 
var a = new A(); 
console.log( a.name ); // 输出：sven
```

在这一过程中，也会出现请求被委托给a的构造器的原型

今天在群里也看到了这个问题，定义在对象上的方法并不能被继承，定义在它的原型上的才可以。

实现一个类继承另一个类的效果：

```js
var A = function(){}; 
A.prototype = { name: 'sven' }; 
var B = function(){}; 
B.prototype = new A(); 
var b = new B(); 
console.log( b.name ); // 输出：sven
```

>设计模式是对语言不足的补充，如果要使用设计模式，不如去找一门更好的语言。

过设置构造器的

prototype 来实现原型继承的时候，除了根对象 Object.prototype 本身之外，任何对象都会有一个原型。而通过 `Object.create( null )`可以创建出没有原型的对象。



### this call apply

啊有点紧张

this总是指向一个对象，具体指向哪个则基于函数的执行环境动态绑定

#### this的指向

- 作为对象方法调用时，指向该对象

```js
var obj = { 
 a: 1, 
 getA: function(){ 
 alert ( this === obj ); // 输出：true 
 alert ( this.a ); // 输出: 1 
 } 
}; 
obj.getA();
```

- 作为普通函数调用时，指向全局对象，在浏览器中即为window对象

注意这种情况

```js
window.name = 'globalName'; 
var myObject = { 
 name: 'sven', 
 getName: function(){ 
 return this.name; 
 } 
}; 
var getName = myObject.getName; 
console.log( getName() ); // globalName
```

保存this，_this与that blabla

```js
 window.id = 'window'; 

 document.getElementById( 'div1' ).onclick = function(){ 
 	alert ( this.id ); // 输出：'div1' 
    var that = this;
 	var callback = function(){ 
        // alert ( that.id );闹存一份引用即可
 		alert ( this.id ); // 输出：'window' 
 	} 
 	// 基于调用环境哦，这个调用的时候会指向全局对象
 	callback(); 
 };
```

- 构造器调用

使用new 运算符调用函数时，总是会返回一个对象，通常构造器中的this就指向这个对象

```js
var MyClass = function(){ 
 this.name = 'sven'; 
}; 
var obj = new MyClass(); 
alert ( obj.name ); // 输出：sven
```

但如果构造器显式的返回了一个object类型的对象，最终就会返回这个对象，同时构造器中的this会指向这个对象

```js
var MyClass = function(){ 
 this.name = 'sven'; 
 return { // 显式地返回一个对象
 name: 'anne' 
 } 
}; 
var obj = new MyClass(); 
alert ( obj.name ); // 输出：anne
```

如果不显式返回任何数据或是返回一个非对象类型数据就不会这样，返回一个函数呢？

哦哦哦那样obj就是个函数了

- Function.prototype.call 或 Function.prototype.apply 调用

它可以动态的改变传入函数的this

```js
var obj1 = { 
 name: 'sven', 
 getName: function(){ 
 return this.name; 
 } 
}; 
var obj2 = { 
 name: 'anne' 
}; 
console.log( obj1.getName() ); // 输出: sven 
console.log( obj1.getName.call( obj2 ) ); // 输出：anne
```

这两个哥哥和js的函数式语言特性很有关系嗷



### 丢失this

```js
var obj = { 
 myName: 'sven', 
 getName: function(){ 
 return this.myName; 
 } 
}; 
console.log( obj.getName() ); // 输出：'sven' 
var getName2 = obj.getName; 
// 此时this指向全局
console.log( getName2() ); // 输出：undefined
```



prototype.js中有这么一个函数，可以代替id选择器

```js
var getId = function( id ){ 
 return document.getElementById( id ); 
};
getId( 'div1' );

// 如果是这种呢？
var getId = document.getElementById; 
getId( 'div1' );
```

许多引擎的 document.getElementById 方法的内部实现中需要用到 this，原本它默认指向document，只要gEBI方法是作为document对象的属性被调用时，就是这样，但后一种方法使this指向了全局，变成了普通函数调用，相当于把这个方法单独拿出来调用了。

前一种方法在执行时仍然好好的指向document~

使用apply修正this：

```js
document.getElementById = (function( func ){ 
 return function(){ 
 return func.apply( document, arguments ); 
 } 
})( document.getElementById ); 
var getId = document.getElementById; 
var div = getId( 'div1' ); 
alert (div.id); // 输出： div1
```

解析：入参func即为gEBI方法，相当于`document.gEBI.apply(document,arguments)`，相当于在调用时this始终绑定着document



call和apply的区别仅在于入参形式，apply只有两个参数，第二个参数是一个带下标的集合，数组/类数组均可，而call的参数数量不固定，巴拉巴拉，你懂的。



call是包装了apply的一个语法糖，如果明确知道入参数量，就可以用call来传递参数。



如果第一个参数为null，那么this会指向默认的属宿主对象，在浏览器中的window等。

但是如果我们使用时是为了借用其他对象的方法，那么就可以传入null，此时会被指定为这个对象。

```js
Math.max.apply( null, [ 1, 2, 5, 3, 4 ] ) // 输出：5
```

this大致整理完了，见面经仓库



### 闭包与高阶函数



果然基础过了一些读起来快多了

```js
for ( var i = 0, len = nodes.length; i < len; i++ ){ 
 (function( i ){ 
 nodes[ i ].onclick = function(){ 
 console.log(i); 
 } 
 })( i ) 
};
```

解决原理：

原本当onClick绑定的匿名函数顺着作用域链从内到外查找变量i时，for循环已经结束，此时找到是5，使用闭包，变量i被封闭在一个单独的作用域里，顺着作用域链查找时会先找到被封闭起来的i



```js
var mult = (function(){ 
 var cache = {}; 
  clg("outer")
 return function(){ 
  clg("inner")
 var args = Array.prototype.join.call( arguments, ',' ); 
 if ( args in cache ){ 
 return cache[ args ]; 
 } 
 var a = 1; 
 for ( var i = 0, l = arguments.length; i < l; i++ ){ 
 a = a * arguments[i]; 
 } 
 return cache[ args ] = a; 
 } 
})();
```



执行上面的代码就会执行mult这个IIFE，而mult(1,2,3)则不会再度打印，因为此时mult被赋值为返回的那个函数了，天了噜我怎么这都要记一下。

cache变量只有在mult内能被获取，也无法mult.cache获取



延长变量寿命

```js
var report = (function(){ 
 var imgs = []; 
 return function( src ){ 
 var img = new Image(); 
 imgs.push( img ); 
 img.src = src; 
 } 
})();
```

返回的那个函数对imgs保持着引用，因此images变量不会被销毁。



对象以方法的形式包含了过程，而闭包在过程中以环境的形式包含了数据。很容易使用闭包实现一个完整的面向对象系统。

```js
var extent = function(){ 
 var value = 0; 
 return { 
 call: function(){ 
 value++; 
 console.log( value ); 
 } 
}; 

var extent = extent(); 
extent.call(); // 输出：1 
extent.call(); // 输出：2 
extent.call(); // 输出：3
    
// oop
var extent = { 
 value: 0, 
 call: function(){ 
 this.value++; 
 console.log( this.value ); 
 } 
}; 
extent.call(); // 输出：1 
extent.call(); // 输出：2 
extent.call(); // 输出：3 
或者：
var Extent = function(){ 
 this.value = 0; 
}; 
Extent.prototype.call = function(){ 
 this.value++; 
 console.log( this.value ); 
}; 
var extent = new Extent(); 
extent.call(); 
extent.call(); 
extent.call();
```



用闭包完成命令模式

```js
<button id="execute">点击我执行命令</button> 
<button id="undo">点击我执行命令</button>

var Tv = { 
 open: function(){ 
 console.log( '打开电视机' ); 
 }, 
 close: function(){ 
 console.log( '关上电视机' ); 
 } 
};

var OpenTvCommand = function( receiver ){ 
 // 添加命令接收者属性
 this.receiver = receiver; 
}; 

OpenTvCommand.prototype.execute = function(){ 
 this.receiver.open(); // 执行命令，打开电视机
}; 

OpenTvCommand.prototype.undo = function(){ 
 this.receiver.close(); // 撤销命令，关闭电视机
}; 

var setCommand = function( command ){ 
    
 document.getElementById( 'execute' ).onclick = function(){ 
 command.execute(); // 输出：打开电视机
 } 
    
 document.getElementById( 'undo' ).onclick = function(){ 
 command.undo(); // 输出：关闭电视机
 } 
}; 

var ins = new OpenTvCommand( Tv )
setCommand( tv );

ins.receiver = {
    open
    close
}
ins.execute -> ins.open

```

把请求封装为对象，分离发起者和接收者之间的关系，可以在命令被执行前就植入接收者。

使用闭包的形式完成

```js
var createCommand = function( receiver ){ 
 var execute = function(){ 
 return receiver.open(); // 执行命令，打开电视机
 } 
 var undo = function(){ 
 return receiver.close(); // 执行命令，关闭电视机
 } 
 return { 
 execute: execute, 
 undo: undo 
 } 
}; 
var setCommand = function( command ){ 
 document.getElementById( 'execute' ).onclick = function(){ 
 command.execute(); // 输出：打开电视机
 } 
 document.getElementById( 'undo' ).onclick = function(){ 
 command.undo(); // 输出：关闭电视机
 } 
}; 
setCommand( createCommand( Tv ) );
```



闭包与内存管理

闭包的确会把局部变量封闭在闭包形成的环境中，使其一直生存下去，但我们使用闭包的一部分原因就是我们选择把一些变量保存起来，因为以后可能还要用到哦。如果真的要回收，到时设置成null即可。



闭包还容易形成循环引用，如果其中作用域里保存着一些DOM节点，就有可能造成内存泄漏。基于引用计数的垃圾回收机制中，如果两个变量之间行成了循环引用，那么两个对象都无法被回收，但这也不是闭包导致的呀。要解决这一问题同样可以设置为null，这意味着切断了变量与它之前引用值的链接。



**高阶函数**

就像这几天经常看到的用bind实现柯里化一样吧，预先传入一部分函数，把几乎不变的逻辑先封装起来。但其实只要是这种形式就可以叫做HOF

```js
const outer = (initArgu)=>{
    return function(laterArgu){
        // ...
    }
}
```



**AOP，面向切面编程的实现**

在js中实现AOP意味着把一个函数动态传入另外一个函数中。

```js
Function.prototype.before = function( beforefn ){ 
 var __self = this; // 保存原函数的引用
 return function(){ // 返回包含了原函数和新函数的"代理"函数
 beforefn.apply( this, arguments ); // 执行新函数，修正 this 
 return __self.apply( this, arguments ); // 执行原函数
 } 
}; 
Function.prototype.after = function( afterfn ){ 
 var __self = this; 
 return function(){ 
 var ret = __self.apply( this, arguments ); 
 afterfn.apply( this, arguments ); 
 return ret; 
 } 
}; 
var func = function(){ 
 console.log( 2 ); 
}; 
func = func.before(function(){ 
 console.log( 1 ); 
}).after(function(){ 
 console.log( 3 ); 
}); 
func();
```



惰性加载函数

在第一次进入进入分支后内部会重写函数，下一次进入时这个函数内部不再存在条件分支语句。

```js
var addEvent = function( elem, type, handler ){ 
 if ( window.addEventListener ){ 
 addEvent = function( elem, type, handler ){ 
 elem.addEventListener( type, handler, false ); 
 } 
 }else if ( window.attachEvent ){ 
 addEvent = function( elem, type, handler ){ 
 elem.attachEvent( 'on' + type, handler ); 
 } 
 } 
 addEvent( elem, type, handler ); 
 };

var div = document.getElementById( 'div1' ); 
 addEvent( div, 'click', function(){ 
 alert (1); 
 }); 
 addEvent( div, 'click', function(){ 
 alert (2); 
 });
```
