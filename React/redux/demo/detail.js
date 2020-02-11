// 修改createStore方法，使得是否提供中间件的使用方法相同
const createStore = (reducer, initState, rewriteCreateStoreFunc) => {
  /*如果有 rewriteCreateStoreFunc，那就采用中间件包装过的 createStore */
  if (rewriteCreateStoreFunc) {
    const newCreateStore = rewriteCreateStoreFunc(createStore);
    return newCreateStore(reducer, initState);
  }
  /*否则按照正常的流程走*/
  // ...
};

const rewriteCreateStoreFunc = applyMiddleware(
  exceptionMiddleware,
  timeMiddleware,
  loggerMiddleware
);

const store = createStore(reducer, initState, rewriteCreateStoreFunc);

// 添加退订功能

function subscribe(listener) {
  listeners.push(listener);
  return function unsubscribe() {
    const index = listeners.indexOf(listener);
    listeners.splice(index, 1);
  };
}

const unsubscribe = store.subscribe(() => {
  let state = store.getState();
  console.log(state.counter.count);
});
/*退订*/
unsubscribe();

// 只允许中间件获得getState方法

/*const chain = middlewares.map(middleware => middleware(store));*/
const simpleStore = { getState: store.getState };
// /* const chain = [exception(store.get), time(store.get), logger(store.get)]*/
const chain = middlewares.map(middleware => middleware(simpleStore));

// 在中间件内部
// store.get(action)，其实就是store.getState
// 正常情况下不需要用到store的，最多只能读取。通常只用到dispatch
// 猜测redux-thunk工作流程，拦截actions，发起请求，在得到回应后再添加dispatch链

// 执行流程
// 最外面的先执行
// 可以修改action，即其中的type和payload

// compose，即把 [A, B, C] 转换成 A(B(C(next)))流程
// redux官方的compose方法
const chain = [A, B, C];
dispatch = compose(...chain)(store.dispatch);

export default function compose(...funcs) {
  if (funcs.length === 1) {
    return funcs[0];
  }
  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}

// 省略initState

const store = createStore(reducer, rewriteCreateStoreFunc);
// 改下 createStore 函数，如果第二个参数是一个object，我们认为他是 initState，
// 如果是 function，我们就认为他是 rewriteCreateStoreFunc。

function craeteStore(reducer, initState, rewriteCreateStoreFunc) {
  if (typeof initState === "function") {
    rewriteCreateStoreFunc = initState;
    initState = undefined;
  }
  // ...
}

// replaceReducer
// 做按需加载的时候，reducer也可以跟着组件在必要的时候再加载，然后用新的 reducer 替换老的 reducer。
const createStore = function(reducer, initState) {
  // ...
  function replaceReducer(nextReducer) {
    // 替换reducer
    reducer = nextReducer;
    /*刷新一遍 state 的值，新来的 reducer 把自己的默认状态放到 state 树上去*/
    dispatch({ type: Symbol() });
  }
  // ...
  return {
    ...replaceReducer
  };
};
