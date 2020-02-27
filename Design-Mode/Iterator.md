# 迭代器模式

> 提供一个方法，顺序访问某种数据结构内的所有元素，而又不需要暴露该对象的内部表示，使得使用者无需关心对象的内部表示。

- 内部迭代器

  ```js
  var each = function( ary, callback ){ 
   for ( var i = 0, l = ary.length; i < l; i++ ){ 
   callback.call( ary[i], i, ary[ i ] ); // 把下标和元素当作参数传给 callback 函数
   } 
  }; 
  each( [ 1, 2, 3 ], function( i, n ){ 
   alert ( [ i, n ] ); 
  });
  ```

  无需关心迭代器内部实现，交互也只是初始化迭代器。缺点：如果有多个数组需要迭代？啊噢，那就不行了。需要扩展

- 外部迭代器，必须显式请求迭代下一个元素。

  增加了复杂度和灵活性，迭代过程/顺序现在可以被手工控制了。

  done、next、value？

  ```js
  var Iterator = function( obj ){ 
   var current = 0; 
   var next = function(){ 
   current += 1; 
   }; 
   var isDone = function(){ 
   return current >= obj.length; 
   }; 
   var getCurrItem = function(){ 
   return obj[ current ]; 
   }; 
   return { 
   next: next, 
   isDone: isDone, 
   getCurrItem: getCurrItem 
   } 
  };
  var compare = function( iterator1, iterator2 ){ 
    while( !iterator1.isDone() && !iterator2.isDone() ){ 
    if ( iterator1.getCurrItem() !== iterator2.getCurrItem() ){ 
    throw new Error ( 'iterator1 和 iterator2 不相等' ); 
    } 
    iterator1.next(); 
    iterator2.next(); 
    } 
    alert ( 'iterator1 和 iterator2 相等' ); 
  } 
  var iterator1 = Iterator( [ 1, 2, 3 ] ); 
  var iterator2 = Iterator( [ 1, 2, 3 ] ); 
  compare( iterator1, iterator2 ); // 输出：iterator1 和 iterator2 相等
  ```

  啊这个思路我看得懂但估计想不出来...

迭代字面量、对象、类数组blabla



倒序迭代器、中止迭代器



绝大部分语言实际上都内置了迭代器。



关于ES6中的迭代器整理在interview仓库里了，记得看啊臭弟弟