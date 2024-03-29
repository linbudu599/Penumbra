# 享元模式

> 哦吼，完全没听过的一种模式

享元模式主要用于性能优化，“蝇量级”，核心是运用共享技术来有效支持大量细粒度的对象。



50个男模特穿50件衣服 -> 1个男模特穿50件衣服

```js
var Model = function( sex ){ 
 this.sex = sex; 
};

Model.prototype.takePhoto = function(){ 
 console.log( 'sex= ' + this.sex + ' underwear=' + this.underwear); 
};

var maleModel = new Model( 'male' ), 
 femaleModel = new Model( 'female' );

for ( var i = 1; i <= 50; i++ ){ 
 maleModel.underwear = 'underwear' + i; 
 maleModel.takePhoto(); 
};
```



- 尽量减少共享对象的数量
- 将对象的属性划分为内部状态与外部状态
  - 内部状态存储于对象内部
  - 内部状态可以被共享
  - 内部状态独立于具体场景，通常是不变的
  - 外部状态取决于具体场景，不可被共享

-> 内部状态相同的对象指定为同一个共享对象，外部对象则剥离出来

也就是说共享对象是被剥离了外部状态的。必要的时候再传入外部状态给共享对象来得到一个由具体场景决定的对象？虽然这个过程可能需要时间，但是大大减少了空间。

（这么一说这个思路好像经常使用和见到）

关键就是区分内部/外部状态，上例中模特性别是内部，而衣服就是外部（不能被共享呀哈哈哈哈）



通用结构：创建一个对象工厂，只有在真正需要时才进行创建。同时系统中可能有不止一个共享对象，有多少种内部状态组合就可能存在多少个共享对象（概率论排列组合upup）

一般来说，以下情况发生时

便可以使用享元模式。

 一个程序中使用了大量的相似对象。

 由于使用了大量对象，造成很大的内存开销。

 对象的大多数状态都可以变为外部状态。

 剥离出对象的外部状态之后，可以用相对较少的共享对象取代大量对象。



没有内部状态？

那说明全局只需要唯一的一个空的对象，虽然此时有点像单例模式了？但是依然存在着很重要的一个过程，剥离外部对象与重新组装的过程。



没有外部状态？那就不是纯粹的享元模式了，可能只是用了共享的思想。



对象池：

有点类似worker pool的概念？

当前没有空闲的对象就会新建一个，每个对象完成职责之后又被剥离掉外部状态（好像不会？）回到对象池

那么对象池会需要清空吗

在这里其实并没有主动分离内外部状态的过程，也就是不是纯粹的享元模式8

