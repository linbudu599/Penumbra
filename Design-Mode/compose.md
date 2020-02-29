# 组合模式

> 用小的子对象构建更大的对象

​	组合模式将对象组合成树形结构，来表示从部分到整体的层次结构，除了用来表示树形结构之外，还能够使得用户对单个对象和组合对象的使用具有一致性。

- 树形结构：调用整体的execute方法，会递归调用所有的子对象的execute！
- 多态性：在组合模式中，客户将统一地使用组合结构中的所有对象，而不需要关心它究竟是组合对象还是单个对象



这个遍历是DFS吧？因为是按顺序执行的，假设某一个对象还是组合对象，就会继续向下遍历？

抽象类在组合模式中的作用：

比如在 Java 中，实现组合模式的关键是 Composite 类和 Leaf 类都必须继承自一个 Compenent 抽象类。这个 Compenent 抽象类既代表组合对象，又代表叶对象，它也能够保证组合对象和叶对象拥有同样名字的方法，从而可以对同一消息都做出反馈。组合对象和叶对象的具体类型被隐藏在 Compenent 抽象类身后。 



但是在JS中也这样就是在折磨自己了吧，建议TS安排上。

eg：扫描文件夹，

```js
var Folder = function( name ){ 
 this.name = name; 
 this.files = []; 
}; 
Folder.prototype.add = function( file ){ 
 this.files.push( file ); 
}; 
Folder.prototype.scan = function(){ 
 console.log( '开始扫描文件夹: ' + this.name ); 
 for ( var i = 0, file, files = this.files; file = files[ i++ ]; ){ 
 file.scan(); 
 } 
};

var File = function( name ){ 
 this.name = name; 
}; 
File.prototype.add = function(){ 
 throw new Error( '文件下面不能再添加文件' ); 
};
File.prototype.scan = function(){ 
 console.log( '开始扫描文件: ' + this.name ); 
};
```



add scan方法！

```js
var folder = new Folder( '学习资料' ); 
var folder1 = new Folder( 'JavaScript' ); 
var folder2 = new Folder ( 'jQuery' ); 
var file1 = new File( 'JavaScript 设计模式与开发实践' ); 
var file2 = new File( '精通 jQuery' ); 
var file3 = new File( '重构与模式' ) 
folder1.add( file1 ); 
folder2.add( file2 ); 
folder.add( folder1 ); 
folder.add( folder2 ); 
folder.add( file3 );
```



CV操作：

```js
var folder3 = new Folder( 'Nodejs' ); 
var file4 = new File( '深入浅出 Node.js' ); 
folder3.add( file4 ); 
var file5 = new File( 'JavaScript 语言精髓与编程实践' );

folder.add( folder3 ); 
folder.add( file5 );
```

不用管是文件夹还是文件！



Tips：

- 不是父子关系！

  嗯不是吗:< 组合对象包含一组叶对象，但叶对象不是组合对象的子类，而是组合对象把请求委托给所有叶对象（反向事件代理？但又好像都是监听事件然后分发？那还是正向吧），至于为什么能做到，则是因为组合对象和叶对象拥有相同接口，对一组叶对象的操作是一致的。

- 双向映射

  可能有个人属于两个叶对象？



引用父对象：

有时需要在子节点上保持对父节点引用，如删除文件夹实际上是对上层文件夹执行删除功能。



组合模式适用情况

- 表示对象的部分-整体层次结构，只需要通过请求树的顶层对象就能对整棵树做统一的操作。
- 想要忽略树中所有对象，忽略组合对象和叶对象的区别。