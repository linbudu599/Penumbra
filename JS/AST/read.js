#!/usr/bin/env node

const recast = require("recast");

recast.run(function(ast, printSource) {
  printSource(ast);
});
// recast.visit将AST对象内的节点进行逐个遍历。
// 你想操作函数声明，就使用visitFunctionDelaration遍历，想操作赋值表达式，就使用visitExpressionStatement。
// 只要在 AST对象文档中定义的对象，在前面加visit，即可遍历。
// 通过node可以取到AST对象
recast.run(function(ast, printSource) {
  recast.visit(ast, {
    visitExpressionStatement: function({ node }) {
      console.log(node);
      return false;
    }
  });
});
// return false，或者选择以下写法，否则报错：
recast.run(function(ast, printSource) {
  recast.visit(ast, {
    visitExpressionStatement: function(path) {
      const node = path.node;
      printSource(node);
      this.traverse(path);
    }
  });
});
