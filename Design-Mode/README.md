# JavaScript设计模式与开发实践

## 2-13

> 38/317

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

#### js中的原型

> 2-15 49/317

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

