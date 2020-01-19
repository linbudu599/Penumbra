const map = {
  _id: "id",
  _name: "name",
  _favor: "favor"
};
const basicInfo = {
  _id: "599",
  _name: "Linbudu",
  _favor: "FE"
};

const result = JSON.parse(
  JSON.stringify(basicInfo).replace(
    /_id|_name|_favor/gi,
    matched => map[matched]
  )
);
console.log(result);

const data = {
  a: "aaa",
  b: undefined,
  c: Symbol("dd"),
  fn: function() {
    return true;
  }
};
JSON.stringify(data); // {"a":"aaa"}"

JSON.stringify([
  "aaa",
  undefined,
  function aa() {
    return true;
  },
  Symbol("dd")
]); // "["aaa",null,null,null]"

JSON.stringify(function a() {
  console.log("a");
});
// undefined
JSON.stringify(undefined);
// undefined
JSON.stringify(Symbol("dd"));
// undefined

JSON.stringify({
  say: "hello JSON.stringify",
  toJSON: function() {
    return "today i learn";
  }
});
// "today i learn"

JSON.stringify({ now: new Date() });
// "{"now":"2019-12-08T07:42:11.973Z"}"

JSON.stringify([new Number(1), new String("false"), new Boolean(false)]);
// "[1,"false",false]"

const obj = {
  name: "loopObj"
};
const loopObj = {
  obj
};
// 对象之间形成循环引用，形成闭环
obj.loopObj = loopObj;
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
deepClone(obj)