# 命令模式

> 记录着订餐信息的菜单，就是命令模式中的命令对象
>
> 最简单优雅的模式之一
>
> 命令，指的是一个执行某些特定动作的指令
>
> 向某些对象发送请求，但不知道谁来接收，命令需要请求什么操作
>
> ？？，咋有点诡异，是将命令封装起来之后再由中间人传递吗？
>
> - 拥有更长的生命周期，这个请求已经被封装在command对象方法中
> - 排队、撤销
> - （异步/顺序调用？）



- 一批人绘制按钮
- 一批人编写点击逻辑

这种情况下前一批人不知道要怎么给按钮绑定事件：

```js
var setCommand = function( button, command ){ 
 button.onclick = function(){ 
 command.execute(); 
 } 
};
```

预留好安装命令的接口



（模拟OOP的实现）

```js
var MenuBar = { 
 refresh: function(){ 
 console.log( '刷新菜单目录' ); 
 } 
}; 
var SubMenu = { 
 add: function(){ 
 console.log( '增加子菜单' ); 
 }, 
 del: function(){ 
 console.log( '删除子菜单' ); 
 } 
};

var RefreshMenuBarCommand = function( receiver ){ 
 this.receiver = receiver; 
}; 
RefreshMenuBarCommand.prototype.execute = function(){ 
 this.receiver.refresh(); 
}; 

var AddSubMenuCommand = function( receiver ){ 
 this.receiver = receiver; 
};
AddSubMenuCommand.prototype.execute = function(){ 
 this.receiver.add(); 
}; 

var DelSubMenuCommand = function( receiver ){ 
 this.receiver = receiver; 
}; 
DelSubMenuCommand.prototype.execute = function(){ 
 console.log( '删除子菜单' ); 
};

var refreshMenuBarCommand = new RefreshMenuBarCommand( MenuBar ); 
var addSubMenuCommand = new AddSubMenuCommand( SubMenu ); 
var delSubMenuCommand = new DelSubMenuCommand( SubMenu ); 
setCommand( button1, refreshMenuBarCommand ); 
setCommand( button2, addSubMenuCommand ); 
setCommand( button3, delSubMenuCommand );
```

？？我咋感觉更麻烦了？是因为这是模拟实现的原因吗



​	js实现略

命令模式的由来，其实是回调（callback）函数的一个面向对象的替代品。

平常我们是直接声明函数然后给目标元素绑上，但使用命令模式思想，就需要新建命令类等等...



闭包！

>在面向对象设计中，命令模式的接收者被当成 command 对象的属性保存起来，同时约定执行命令的操作调用 command.execute 方法。
>
>在使用闭包的命令模式实现中，接收者被封闭在闭包产生的环境中，执行命令的操作可以更加简单，仅仅执行回调函数即可。无论接收者被保存为对象的属性，还是被封闭在闭包产生的环境中，在将来执行命令的时候，接收者都能被顺利访问。



```js
var MenuBar = { 
 refresh: function(){ 
 console.log( '刷新菜单界面' ); 
 } 
};
var RefreshMenuBarCommand = function( receiver ){ 
 return { 
 execute: function(){ 
 receiver.refresh();
   } 
 } 
}; 
var setCommand = function( button, command ){ 
 button.onclick = function(){ 
 command.execute(); 
 } 
}; 
var refreshMenuBarCommand = RefreshMenuBarCommand( MenuBar ); 
setCommand( button1, refreshMenuBarCommand );
```



那么要撤销呢？

（我感觉这个要是扩展起来挺深的，撤销，顺序执行，blabla）

类比小球的运动，使用命令模式来实现的话，在execute时就已经把原始位置作为命令对象属性保存起来。



宏命令：一组命令的集合

智能命令：可以直接实现请求而不需要接收者，那这样不是和策略模式差不多了吗。



哦哦有区别：

从代码结构上已经无法分辨它们，能分辨的只有它们意图的不同。策略模式指向的问题域更小，所有策略对象的目标总是一致的，它们只是达到这个目标的不同手段，它们的内部实现是针对“算法”而言的。而智能命令模式指向的问题域更广，command对象解决的目标更具发散性。命令模式还可以完成撤销、排队等功能。 