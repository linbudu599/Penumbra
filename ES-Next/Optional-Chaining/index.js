const outerObj = {
  prop1Obj: {
    prop2Obj: {
      name: "linbudu"
    }
  }
};
// 旧的写法
if (
  outerObj &&
  outerObj.prop1Obj !== null &&
  outerObj.prop1Obj.prop2Obj !== null
) {
  console.log(outerObj.prop1Obj.prop2Obj.name);
}
console.log(outerObj?.prop1Obj?.prop2Obj?.name); // linbudu

// 在数组中使用
const outerObj2 = {
  propArr: ["item1", "item2", "item3"]
};
// ?.[0] 会确保第一项存在
console.log(outerObj2?.propArr?.[0]); // item1

const funcObj = {
  propFunc: (...args) => {
    return [...args];
  }
};
console.log(funcObj?.propFunc?.("arg1", "arg2", "arg3")); // [ 'arg1', 'arg2', 'arg3' ]

// 短路: 如果 ?. 的左侧遇到了无效的值，则会停止访问右侧
let count = 1;
outerObj?.prop1Obj?.prop2Obj?.undefProp?.(count++);
console.log(count); //1

// use with nullish coalescing
console.log(outerObj?.prop1Obj?.prop2Obj?.undefProp ?? "default"); // default
