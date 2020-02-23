// const CreateDiv = (function() {
//   let instance = null;
//   const CreateDiv = function(html) {
//     if (instance) {
//       return instance;
//     }
//     this.html = html;
//     this.init();
//     return (instance = this);
//   };
//   CreateDiv.prototype.init = function() {
//     const div = document.createElement("div");
//     div.innerHTML = this.html;
//     document.body.appendChild(div);
//   };
//   return CreateDiv;
// })();
// const a = new CreateDiv("sven1");
// const b = new CreateDiv("sven2");
// console.log(a, b);
// let CreateDiv = function(html) {
//   this.html = html;
//   this.init();
// };

// CreateDiv.prototype.init = function() {
//   let div = document.createElement("div");
//   div.innerHTML = this.html;
//   document.body.appendChild(div);
// };

// let ProxySingletonCreateDiv = (function() {
//   let instance = null;
//   console.log(instance); // null
//   return function(html) {
//     console.log(html, instance);
//     if (!instance) {
//       instance = new CreateDiv(html);
//     }
//     return instance;
//   };
// })();

// let a = new ProxySingletonCreateDiv("sven1");
// let b = new ProxySingletonCreateDiv("sven2");
// console.log(a, b);
const getSingle = function(fn) {
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
// document.getElementById("loginBtn").onclick = function() {
const loginLayer = createSingleLoginLayer();
//   loginLayer.style.display = "block";
// };
