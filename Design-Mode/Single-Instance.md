# 单例模式

> 保证一个类仅有一个实例，并提供一个访问它的全局访问点。
>
> 如模态框，无论出现多少次，都是同一个组件这种？

用一个变量来标志当前是否已经为某个类创建过对象，如果是，则在下一次获取该类的实例时，直接返回之前创建的对象



```js
const Single = function(name){
    this.name = name;
    this.instance = null;
}

Single.prototype.getName = ()=>{
    alert(this.name)
}

Single.getInstance = (name)=>{
    if(!this.instance){
        this.instance = new Single(name)
    }
    return this.instance
}

const a = Single.getInstance( 'sven1' ); 
const b = Single.getInstance( 'sven2' );

a === b//true
```

这样实现的单例模式是不透明的，使用者需要知道这是一个单例类！并且这里不使用new的方式创建新对象（因为会返回新的{}？）



透明的单例模式

```js
const CreateDiv = (function() {
  let instance = null;
  const CreateDiv = function(html) {
    if (instance) {
      return instance;
    }
    this.html = html;
    this.init();
    return (instance = this);
  };
  CreateDiv.prototype.init = function() {
    const div = document.createElement("div");
    div.innerHTML = this.html;
    document.body.appendChild(div);
  };
  return CreateDiv;
})();
const a = new CreateDiv("sven1");
const b = new CreateDiv("sven2");
```



有点诡异，为返回的函数添加原型这种写法...

>要让这个类从单例类变成一个普通的可产生多个实例的类,必须得改写 CreateDiv 构造函数，把控制创建唯一对象的那一段去掉。



使用代理类实现设计模式

```js
let CreateDiv = function(html) {
  this.html = html;
  this.init();
};

CreateDiv.prototype.init = function() {
  let div = document.createElement("div");
  div.innerHTML = this.html;
  document.body.appendChild(div);
};

let ProxySingletonCreateDiv = (function() {
  let instance = null;
  console.log(instance); // null
  return function(html) {
    console.log(html, instance);
    if (!instance) {
      instance = new CreateDiv(html);
    }
    return instance;
  };
})();

let a = new ProxySingletonCreateDiv("sven1");
let b = new ProxySingletonCreateDiv("sven2");
console.log(a, b);
```



还疑惑了一下，想着这两个应该是引用不同的闭包啊，仔细看了一下是IIFE啊，那没事了，它会立即产生一个闭包。

现在createDiv就变成了普通的类，只有和代理类结合起来使用时才可以达到单例模式效果。

>前面提到的几种单例模式的实现，更多的是接近传统面向对象语言中的实现，单例对象从“类”中创建而来。在以类为中心的语言中，这是很自然的做法。比如在 Java 中，如果需要某个对象，就必须先定义一个类，对象总是从类中创建而来的。但 JavaScript 其实是一门无类（class-free）语言，也正因为如此，生搬单例模式的概念并无意义。在 JavaScript 中创建对象的方法非常简单，既然我们只需要一个“唯一”的对象，为什么要为它先创建一个“类”呢？这无异于穿棉衣洗澡，传统的单例模式实现在 JavaScript 中并不适用。



在js中经常把全局变量作为单例来使用，全局获取/修改的都是这家伙。但是，命名空间污染，你懂的。

>在对 JavaScript 的创造者Brendan Eich 的访谈中， Brendan Eich 本人也承认全局变量是设计上的失误，是在没有足够的时间思考一些东西的情况下导致的结果。 



惰性单例，只有在需要时才创建这个全局唯一的对象实例。

基于类的单例模式

```js
Singleton.getInstance = (function(){ 
 var instance = null; 
 return function( name ){ 
 if ( !instance ){ 
 instance = new Singleton( name ); 
 } 
 return instance; 
 } 
})();
```



>用一个变量来标志是否创建过对象，如果是，则在下次直接返回这个已经创建好的对象。



将管理单例和创建对象的逻辑抽离出来，

```js
const getSingle = function(fn) {
  // 身在闭包，所以不会被销毁
  let result = null;
  return function() {
    return result || (result = fn.apply(this, arguments));
  };
};

const createLoginLayer = function() {
  const div = document.createElement("div");
  div.innerHTML = "我是登录浮窗";
  div.style.display = "none";
  document.body.appendChild(div);
  return div;
};

const createSingleLoginLayer = getSingle(createLoginLayer);

document.getElementById("loginBtn").onclick = function() {
  const loginLayer = createSingleLoginLayer();
  loginLayer.style.display = "block";
};
```

在这里，管理单例和创建单例（登陆浮层）的方法被分开了，如果要再创建唯一的iframe之类的也不需要重写逻辑。



(this指向全局)



