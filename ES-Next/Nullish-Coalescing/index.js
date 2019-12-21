const undefVal = undefined;
const value = "Hello";

// 如果 variable 是undefined或null，
// 则表达式 variable ?? defaultValue 的结果为defaultValue，
// 否则表达式的值为variable 的值。
undefVal ?? "Nothing"; // => 'Nothing'
value ?? "Nothing"; // => 'Hello'
console.log(undefVal ?? "Nothing", value ?? "Nothing");

//不用于 || ，即使它的左边是false/0，也会使默认值生效