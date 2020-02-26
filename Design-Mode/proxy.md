# 代理模式

> 代理模式是为一个对象提供一个代用品或占位符，以便控制对它的访问。

用户不能直接访问一个对象时，先访问一个代理对象，代理对象对请求做出一些处理后再把请求转交给本地。nginx是你吗？



小明追女神：

只有代理才知道女神什么时候心情会变好，代理会监听女神心情好的条件再送花。

保护代理：过滤掉一些请求，控制访问，js中不太好实现噢

虚拟代理：如果new一个flower对象开销很大，此时虚拟代理就能把开销很大的对象延迟到需要了再创建。



图片加载时的占位符，等图片加载完毕了再去替换src

```js
var myImage = (function(){ 
  var imgNode = document.createElement( 'img' ); 
  document.body.appendChild( imgNode ); 
  return { 
  setSrc: function( src ){ 
  imgNode.src = src; 
  } 
  } 
})(); 
var proxyImage = (function(){ 
  var img = new Image; 
  img.onload = function(){ 
  myImage.setSrc( this.src ); 
  } 
  return { 
  setSrc: function( src ){ 
  myImage.setSrc( 'file:// /C:/Users/svenzeng/Desktop/loading.gif' ); 
  img.src = src; 
  } 
  } 
})(); 
proxyImage.setSrc( 'http:// imgcache.qq.com/music/photo/k/000GGDys0yA0Nk.jpg' );
```

如果不使用代理模式，就需要这个图片自己负责两件事，占位符和替换，这就违背了单一职责原则，如果不再需要此功能，只要直接抛弃代理即可。



代理和本体接口的一致性：

可以看到上面的两个接口都是setSrc，对于客户代理和本体是没有区别的



虚拟代理-合并HTTP请求

```js
var synchronousFile = function( id ){ 
  console.log( '开始同步文件，id 为: ' + id ); 
}; 
var proxySynchronousFile = (function(){ 
  var cache = [], // 保存一段时间内需要同步的 ID 
  timer; // 定时器
  return function( id ){ 
  cache.push( id ); 
  if ( timer ){ // 保证不会覆盖已经启动的定时器
  return; 
  } 
  timer = setTimeout(function(){ 
  synchronousFile( cache.join( ',' ) ); // 2 秒后向本体发送需要同步的 ID 集合
  clearTimeout( timer ); // 清空定时器
  timer = null; 
  cache.length = 0; // 清空 ID 集合
  }, 2000 ); 
  } 
})();
```

类似于防抖的思路



缓存代理

理可以为一些开销大的运算结果提供暂时的存储，在下次运算时，如果传递进来的参

数跟之前一致，则可以直接返回前面存储的运算结果。



```js
var proxyMult = (function(){ 
 var cache = {}; 
 return function(){ 
 var args = Array.prototype.join.call( arguments, ',' ); 
 if ( args in cache ){ 
 return cache[ args ]; 
 } 
 return cache[ args ] = mult.apply( this, arguments ); 
 } 
})(); 
 proxyMult( 1, 2, 3, 4 ); // 输出：24 
 proxyMult( 1, 2, 3, 4 ); // 输出：24
```

嗷！这个思路我常用

这个代理还可以扩展，比如加减乘除等计算函数，可以创建多个代理函数，工厂模式？

```js
/**************** 创建缓存代理的工厂 *******var createProxyFactory = function( fn ){ 
  var cache = {}; 
  return function(){ 
  var args = Array.prototype.join.call if ( args in cache ){ 
  return cache[ args ]; 
  } 
  return cache[ args ] = fn.apply( th } 
}; 
var proxyMult = createProxyFactory( mult ), 
proxyPlus = createProxyFactory( plus );
```

