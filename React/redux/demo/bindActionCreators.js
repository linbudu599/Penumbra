// 一般只有在 react-redux 的 connect 实现中用到。

//通过闭包，把 dispatch 和 actionCreator 隐藏起来，让其他地方感知不到 redux 的存在。

// 普通方式
const reducer = combineReducers({
  counter: counterReducer,
  info: infoReducer
});
const store = createStore(reducer);

/*返回 action 的函数就叫 actionCreator*/
function incrementActionCreator() {
  return {
    type: "INCREMENT"
  };
}

function setNameActionCreator(name) {
  return {
    type: "SET_NAME",
    name: name
  };
}

const actions = {
  increment: function() {
    return store.dispatch(incrementActionCreator.apply(this, arguments));
  },
  setName: function() {
    return store.dispatch(setNameActionCreator.apply(this, arguments));
  }
};

/*注意：我们可以把 actions 传到任何地方去*/
/*其他地方在实现自增的时候，根本不知道 dispatch，actionCreator等细节*/
actions.increment(); /*自增*/
actions.setName("九部威武"); /*修改 info.name*/

// 源码
/*核心的代码在这里，通过闭包隐藏了 actionCreator 和 dispatch*/
function bindActionCreator(actionCreator, dispatch) {
  return function() {
    return dispatch(actionCreator.apply(this, arguments));
  };
}

/* actionCreators 必须是 function 或者 object */
export default function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === "function") {
    return bindActionCreator(actionCreators, dispatch);
  }

  if (typeof actionCreators !== "object" || actionCreators === null) {
    throw new Error();
  }

  const keys = Object.keys(actionCreators);
  const boundActionCreators = {};
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const actionCreator = actionCreators[key];
    if (typeof actionCreator === "function") {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
    }
  }
  return boundActionCreators;
}

// 纯函数 reducer 计划函数，就必须是一个纯函数！

// 只要传入参数相同，每一次返回计算得到的下一个 state 就一定相同。没有特殊情况、没有副作用，没有 API 请求、没有变量修改，单纯执行计算。
